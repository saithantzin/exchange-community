<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Dispute;
use App\Models\ExchangePayment;
use App\Models\ExchangeRequest;
use App\Models\Item;
use App\Models\Refund;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    use ApiResponse;

    /**
     * Get registered member accounts and their current community activity.
     */
    public function members(): JsonResponse
    {
        $members = User::query()
            ->where('role', 'user')
            ->with([
                'stateRegion',
                'township.stateRegion',
                'items' => function ($query) {
                    $query->where('availability_status', 'Available')
                        ->with([
                            'category',
                            'images' => function ($imageQuery) {
                                $imageQuery->orderByDesc('is_primary')->orderBy('id');
                            },
                        ]);
                },
            ])
            ->withCount([
                'items as items_count' => fn ($query) => $query->where('availability_status', 'Available'),
                'requesterExchanges',
                'ownerExchanges',
            ])
            ->withAvg('reviewsReceived', 'rating')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(function (User $member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'phone' => $member->phone,
                    'avatar' => $member->profile_image,
                    'city' => $member->township?->name,
                    'region' => $member->stateRegion?->name ?? $member->township?->stateRegion?->name,
                    'status' => $member->account_status,
                    'rating' => (float) ($member->reviews_received_avg_rating ?? $member->rating),
                    'joinedDate' => $member->created_at?->toDateString(),
                    'bio' => $member->bio,
                    'suspensionReason' => $member->suspension_reason,
                    'itemsCount' => $member->items_count,
                    'exchangesCount' => $member->requester_exchanges_count + $member->owner_exchanges_count,
                    'items' => $member->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->title,
                            'category' => $item->category?->name,
                            'condition' => $item->condition,
                            'image' => $item->images->first()?->image_url,
                        ];
                    })->values(),
                ];
            })
            ->values();

        return $this->successResponse($members, 'Members retrieved');
    }

    /**
     * Update a member account's moderation status.
     */
    public function updateMemberStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:Active,Suspended',
            'suspension_reason' => 'nullable|string|max:2000',
        ]);

        $member = User::query()->where('role', 'user')->findOrFail($id);
        $member->account_status = $validated['status'];
        $member->suspension_reason = $validated['status'] === 'Suspended'
            ? ($validated['suspension_reason'] ?? null)
            : null;
        $member->save();

        return $this->successResponse([
            'status' => $member->account_status,
            'suspension_reason' => $member->suspension_reason,
        ], 'Member status updated');
    }

    /**
     * Get dynamic dashboard statistics.
     */
    public function dashboardStats(): JsonResponse
    {
        $totalMembers = User::where('role', 'user')->count();
        $activeMembers = User::where('role', 'user')->where('account_status', 'Active')->count();
        $totalItems = Item::count();
        $activeExchanges = ExchangeRequest::whereIn('status', ['Pending', 'Accepted', 'Deposit Review', 'Deposits Verified', 'Shipping'])->count();
        $completedSwaps = ExchangeRequest::where('status', 'Completed')->count();
        $openDisputes = Dispute::whereIn('status', ['Open', 'Under Review'])->count();

        // Escrow Funds Statistics - ONLY for Intercity Courier Delivery exchanges
        $escrowHeld = ExchangePayment::where('payment_status', 'Verified')
            ->whereHas('exchange', function ($q) {
                $q->where(function ($sub) {
                    $sub->where('exchange_type', 'like', '%intercity%')
                        ->orWhere('exchange_type', 'like', '%courier%')
                        ->orWhere('exchange_type', 'like', '%express%');
                })->where('exchange_type', 'not like', '%meetup%')
                  ->where('exchange_type', 'not like', '%in-person%');
            })
            ->sum('deposit_amount');

        $pendingDeposits = ExchangePayment::where('payment_status', 'Payment Submitted')
            ->whereHas('exchange', function ($q) {
                $q->where(function ($sub) {
                    $sub->where('exchange_type', 'like', '%intercity%')
                        ->orWhere('exchange_type', 'like', '%courier%')
                        ->orWhere('exchange_type', 'like', '%express%');
                })->where('exchange_type', 'not like', '%meetup%')
                  ->where('exchange_type', 'not like', '%in-person%');
            })
            ->count();
        $pendingRefunds = Refund::where('refund_status', 'Processing Payout')->count();

        return $this->successResponse([
            'members' => [
                'total' => $totalMembers,
                'active' => $activeMembers,
            ],
            'items' => [
                'total' => $totalItems,
            ],
            'exchanges' => [
                'active' => $activeExchanges,
                'completed' => $completedSwaps,
            ],
            'disputes' => [
                'open' => $openDisputes,
            ],
            'escrow' => [
                'funds_held_mmk' => (float) $escrowHeld,
                'pending_deposit_reviews' => $pendingDeposits,
                'pending_refund_payouts' => $pendingRefunds,
            ]
        ], 'Dashboard statistics retrieved');
    }
}
