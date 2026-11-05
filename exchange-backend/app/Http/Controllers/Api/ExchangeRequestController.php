<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExchangePayment;
use App\Models\ExchangeRequest;
use App\Models\Item;
use App\Models\Refund;
use App\Models\Review;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ExchangeRequestController extends Controller
{
    use ApiResponse;

    /**
     * Get exchange requests for authenticated user (incoming and outgoing).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $type = $request->query('type'); // 'incoming', 'outgoing', or null for all

        $query = ExchangeRequest::with([
            'requester.communicationContacts',
            'requester.township.stateRegion',
            'requester.items.images',
            'requester.items.category',
            'owner.communicationContacts',
            'owner.township.stateRegion',
            'owner.items.images',
            'owner.items.category',
            'offeredItem.category',
            'offeredItem.images',
            'offeredItem.township.stateRegion',
            'requestedItem.category',
            'requestedItem.images',
            'requestedItem.township.stateRegion',
        ]);

        if ($type === 'incoming') {
            $query->where('owner_id', $user->id);
        } elseif ($type === 'outgoing') {
            $query->where('requester_id', $user->id);
        } else {
            $query->where(function ($q) use ($user) {
                $q->where('owner_id', $user->id)
                  ->orWhere('requester_id', $user->id);
            });
        }

        $requests = $query->orderBy('created_at', 'desc')->get();

        $formatted = $requests->map(function ($req) use ($user) {
            return $this->formatRequest($req, $user->id);
        });

        return $this->successResponse($formatted, 'Exchange requests retrieved successfully');
    }

    /**
     * Submit a new exchange request / proposal.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'requested_item_id' => 'required|exists:items,id',
            'offered_item_id' => 'nullable|exists:items,id',
            'offered_item_title' => 'nullable|string',
            'exchange_type' => 'nullable|string',
            'handoverMethod' => 'nullable|string',
            'meetup_location' => 'nullable|string',
            'message' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $requestedItem = Item::with('township.stateRegion')->findOrFail($request->requested_item_id);

        if ($requestedItem->user_id === $user->id) {
            return $this->errorResponse('You cannot propose an exchange for your own item listing', 400);
        }

        // Determine offered item ID
        $offeredItemId = $request->offered_item_id;
        if (!$offeredItemId && $request->filled('offered_item_title')) {
            $foundItem = Item::where('user_id', $user->id)
                ->where('title', 'like', '%' . $request->offered_item_title . '%')
                ->first();
            if ($foundItem) {
                $offeredItemId = $foundItem->id;
            }
        }

        // If still no offered item ID, pick user's first available item or require one
        if (!$offeredItemId) {
            $firstUserItem = Item::where('user_id', $user->id)->first();
            if ($firstUserItem) {
                $offeredItemId = $firstUserItem->id;
            } else {
                return $this->errorResponse('You must have at least one active item listing to propose an exchange', 400);
            }
        }

        $offeredItem = Item::with('township.stateRegion')->findOrFail($offeredItemId);

        // Determine exchange handover type
        $exchangeType = $request->exchange_type ?? $request->handoverMethod;
        if (!$exchangeType) {
            $isIntercity = ($offeredItem->township?->state_region_id && $requestedItem->township?->state_region_id)
                ? ($offeredItem->township->state_region_id !== $requestedItem->township->state_region_id)
                : false;
            $exchangeType = $isIntercity ? 'Intercity Courier Delivery' : 'In-Person Meetup';
        }

        $exchangeCode = 'EXC-' . rand(1000, 9999);

        $exchangeRequest = ExchangeRequest::create([
            'exchange_code' => $exchangeCode,
            'requester_id' => $user->id,
            'owner_id' => $requestedItem->user_id,
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $requestedItem->id,
            'exchange_type' => $exchangeType,
            'status' => 'Pending',
            'meetup_location' => $request->meetup_location,
            'notes' => $request->notes ?? $request->message ?? "I'd love to exchange my {$offeredItem->title} for your {$requestedItem->title}.",
        ]);

        $exchangeRequest->load([
            'requester.communicationContacts',
            'requester.township.stateRegion',
            'requester.items.images',
            'requester.items.category',
            'owner.communicationContacts',
            'owner.township.stateRegion',
            'owner.items.images',
            'owner.items.category',
            'offeredItem.category',
            'offeredItem.images',
            'offeredItem.township.stateRegion',
            'requestedItem.category',
            'requestedItem.images',
            'requestedItem.township.stateRegion',
        ]);

        return $this->successResponse(
            $this->formatRequest($exchangeRequest, $user->id),
            'Exchange proposal submitted successfully',
            201
        );
    }

    /**
     * Show a single exchange request by ID.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $cleanId = str_replace('#', '', $id);

        $req = ExchangeRequest::with([
            'requester.communicationContacts',
            'requester.township.stateRegion',
            'requester.items.images',
            'requester.items.category',
            'owner.communicationContacts',
            'owner.township.stateRegion',
            'owner.items.images',
            'owner.items.category',
            'offeredItem.category',
            'offeredItem.images',
            'offeredItem.township.stateRegion',
            'requestedItem.category',
            'requestedItem.images',
            'requestedItem.township.stateRegion',
            'payments.payer',
        ])
        ->where('id', $cleanId)
        ->orWhere('exchange_code', $cleanId)
        ->firstOrFail();

        if ($req->requester_id !== $user->id && $req->owner_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Unauthorized to view this exchange request', 403);
        }

        return $this->successResponse($this->formatRequest($req, $user->id));
    }

    /**
     * Accept an incoming exchange proposal.
     */
    public function accept(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $req = ExchangeRequest::findOrFail($id);

        if ($req->owner_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Only the listing owner can accept this proposal', 403);
        }

        $req->status = 'Accepted';
        $req->save();

        $req->load([
            'requester.communicationContacts',
            'requester.township.stateRegion',
            'requester.items.images',
            'requester.items.category',
            'owner.communicationContacts',
            'owner.township.stateRegion',
            'owner.items.images',
            'owner.items.category',
            'offeredItem.category',
            'offeredItem.images',
            'offeredItem.township.stateRegion',
            'requestedItem.category',
            'requestedItem.images',
            'requestedItem.township.stateRegion',
        ]);

        return $this->successResponse(
            $this->formatRequest($req, $user->id),
            'Exchange proposal accepted successfully'
        );
    }

    /**
     * Reject an incoming exchange proposal.
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $req = ExchangeRequest::findOrFail($id);

        if ($req->owner_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Only the listing owner can decline this proposal', 403);
        }

        $req->status = 'Rejected';
        $req->save();

        return $this->successResponse(
            $this->formatRequest($req, $user->id),
            'Exchange proposal declined'
        );
    }

    /**
     * Cancel an outgoing exchange proposal.
     */
    public function cancel(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $req = ExchangeRequest::findOrFail($id);

        if ($req->requester_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Only the requester can cancel this proposal', 403);
        }

        $req->status = 'Cancelled';
        $req->save();

        return $this->successResponse(
            $this->formatRequest($req, $user->id),
            'Exchange proposal cancelled'
        );
    }

    /**
     * Get real exchange history records for authenticated user.
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = ExchangeRequest::with([
            'requester.township.stateRegion',
            'owner.township.stateRegion',
            'offeredItem.category',
            'offeredItem.images',
            'offeredItem.township.stateRegion',
            'requestedItem.category',
            'requestedItem.images',
            'requestedItem.township.stateRegion',
            'reviews',
        ])->where(function ($q) use ($user) {
            $q->where('requester_id', $user->id)
              ->orWhere('owner_id', $user->id);
        });

        // Filter out pending proposals if user only wants actual active/past exchanges
        // But include Accepted, Deposit Review, Shipping, In Transit, Completed, etc.
        if ($request->query('all') !== 'true') {
            $query->whereIn('status', [
                'Accepted',
                'In Transit',
                'Deposit Review',
                'Shipping',
                'In Escrow',
                'Completed',
                'Cancelled',
                'Rejected',
                'Disputed'
            ]);
        }

        $exchanges = $query->orderBy('created_at', 'desc')->get();

        $formatted = $exchanges->map(function ($exc) use ($user) {
            return $this->formatExchangeHistoryItem($exc, $user);
        });

        return $this->successResponse($formatted, 'Exchange history records retrieved');
    }

    /**
     * Submit a partner rating/review for an exchange.
     */
    public function submitReview(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $req = ExchangeRequest::where('id', $id)
            ->orWhere('exchange_code', $id)
            ->firstOrFail();

        if ($req->requester_id !== $user->id && $req->owner_id !== $user->id) {
            return $this->errorResponse('Unauthorized to review this exchange', 403);
        }

        $partnerId = ($req->requester_id === $user->id) ? $req->owner_id : $req->requester_id;

        $review = Review::updateOrCreate(
            [
                'exchange_id' => $req->id,
                'reviewer_id' => $user->id,
            ],
            [
                'reviewed_user_id' => $partnerId,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

        // Update partner's average rating
        $avgRating = Review::where('reviewed_user_id', $partnerId)->avg('rating');
        if ($avgRating) {
            User::where('id', $partnerId)->update(['rating' => round($avgRating, 2)]);
        }

        return $this->successResponse([
            'review' => $review,
            'partner_rating' => $avgRating ? round($avgRating, 2) : 5.0,
        ], 'Review submitted successfully');
    }

    /**
     * Admin: List all platform exchange requests for administrative monitoring.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = ExchangeRequest::with([
            'requester.township.stateRegion',
            'owner.township.stateRegion',
            'offeredItem.category',
            'offeredItem.images',
            'requestedItem.category',
            'requestedItem.images',
        ]);

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($sub) use ($s) {
                $sub->where('exchange_code', 'like', "%{$s}%")
                    ->orWhereHas('requester', fn($q) => $q->where('name', 'like', "%{$s}%"))
                    ->orWhereHas('owner', fn($q) => $q->where('name', 'like', "%{$s}%"))
                    ->orWhereHas('requestedItem', fn($q) => $q->where('title', 'like', "%{$s}%"))
                    ->orWhereHas('offeredItem', fn($q) => $q->where('title', 'like', "%{$s}%"));
            });
        }

        $list = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);

        return $this->successResponse($list, 'Admin exchange requests retrieved');
    }

    /**
     * Standardized request formatter mapping directly to Frontend contract.
     */
    private function formatRequest(ExchangeRequest $req, int $currentUserId): array
    {
        $isRequester = $req->requester_id === $currentUserId;
        $type = $isRequester ? 'outgoing' : 'incoming';

        $offeredImg = $req->offeredItem?->images->where('is_primary', true)->first()?->image_url
            ?? $req->offeredItem?->images->first()?->image_url
            ?? 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80';

        $requestedImg = $req->requestedItem?->images->where('is_primary', true)->first()?->image_url
            ?? $req->requestedItem?->images->first()?->image_url
            ?? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';

        $offeredTownship = $req->offeredItem?->township?->name;
        $offeredRegion = $req->offeredItem?->township?->stateRegion?->name;
        $offeredCity = $offeredTownship && $offeredRegion ? "{$offeredTownship}, {$offeredRegion}" : ($req->offeredItem?->city ?? 'Mandalay (MDY)');

        $requestedTownship = $req->requestedItem?->township?->name;
        $requestedRegion = $req->requestedItem?->township?->stateRegion?->name;
        $requestedCity = $requestedTownship && $requestedRegion ? "{$requestedTownship}, {$requestedRegion}" : ($req->requestedItem?->city ?? 'Yangon (YGN)');

        $isIntercity = str_contains(strtolower($req->exchange_type ?? ''), 'courier')
            || str_contains(strtolower($req->exchange_type ?? ''), 'intercity')
            || ($req->offeredItem?->township?->state_region_id && $req->requestedItem?->township?->state_region_id && $req->offeredItem->township->state_region_id !== $req->requestedItem->township->state_region_id);

        $requesterTownship = $req->requester?->township?->name;
        $requesterRegion = $req->requester?->township?->stateRegion?->name;
        $requesterCity = $requesterTownship && $requesterRegion ? "{$requesterTownship}, {$requesterRegion}" : 'Yangon';

        $ownerTownship = $req->owner?->township?->name;
        $ownerRegion = $req->owner?->township?->stateRegion?->name;
        $ownerCity = $ownerTownship && $ownerRegion ? "{$ownerTownship}, {$ownerRegion}" : 'Mandalay';

        $telegram = $req->requester?->communicationContacts?->where('platform', 'Telegram')->first()?->contact_value ?? '';
        $viber = $req->requester?->communicationContacts?->where('platform', 'Viber')->first()?->contact_value ?? $req->requester?->phone ?? '';
        $facebook = $req->requester?->communicationContacts?->where('platform', 'Facebook Messenger')->first()?->contact_value ?? '';

        $ownerTelegram = $req->owner?->communicationContacts?->where('platform', 'Telegram')->first()?->contact_value ?? '';
        $ownerViber = $req->owner?->communicationContacts?->where('platform', 'Viber')->first()?->contact_value ?? $req->owner?->phone ?? '';
        $ownerFacebook = $req->owner?->communicationContacts?->where('platform', 'Facebook Messenger')->first()?->contact_value ?? '';

        $requesterCompletedSwaps = ExchangeRequest::where(function ($q) use ($req) {
            $q->where('requester_id', $req->requester_id)->orWhere('owner_id', $req->requester_id);
        })->where('status', 'Completed')->count();

        $ownerCompletedSwaps = ExchangeRequest::where(function ($q) use ($req) {
            $q->where('requester_id', $req->owner_id)->orWhere('owner_id', $req->owner_id);
        })->where('status', 'Completed')->count();

        return [
            'id' => $req->id,
            'exchange_code' => $req->exchange_code,
            'code' => $req->exchange_code,
            'type' => $type,
            'status' => $req->status,
            'isIntercity' => (bool) $isIntercity,
            'handoverMethod' => $req->exchange_type ?? ($isIntercity ? 'Intercity Courier Delivery' : 'In-Person Meetup'),
            'message' => $req->notes ?? '',
            'notes' => $req->notes ?? '',
            'meetupLocation' => $req->meetup_location ?? '',
            'date' => $req->created_at ? $req->created_at->format('Y-m-d H:i') : '',
            'createdAt' => $req->created_at ? $req->created_at->toIso8601String() : null,
            'requester' => [
                'id' => $req->requester?->id,
                'name' => $req->requester?->name ?? 'Community Member',
                'city' => $requesterCity,
                'rating' => (float) ($req->requester?->rating ?? 5.0),
                'phone' => $req->requester?->phone ?? '',
                'viber' => $viber,
                'telegram' => $telegram,
                'facebook' => $facebook,
                'bio' => $req->requester?->bio ?? 'Active community swap member',
                'joined' => $req->requester?->created_at ? 'Member since ' . $req->requester->created_at->format('Y') : 'Member since 2024',
                'completedSwaps' => $requesterCompletedSwaps,
                'exchanges' => $requesterCompletedSwaps,
                'avatar' => $req->requester?->profile_image ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
                'communicationContacts' => [
                    'telegram' => $telegram,
                    'viber' => $viber,
                    'facebook' => $facebook,
                ],
                'items' => $req->requester?->items?->map(function ($it) {
                    $img = $it->images->where('is_primary', true)->first()?->image_url
                        ?? $it->images->first()?->image_url
                        ?? 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80';
                    return [
                        'id' => $it->id,
                        'title' => $it->title,
                        'category' => $it->category?->name ?? 'General',
                        'condition' => $it->condition ?? 'Good',
                        'image' => $img,
                    ];
                })->values()->toArray() ?? [],
            ],
            'recipient' => [
                'id' => $req->owner?->id,
                'name' => $req->owner?->name ?? 'Community Member',
                'city' => $ownerCity,
                'rating' => (float) ($req->owner?->rating ?? 5.0),
                'avatar' => $req->owner?->profile_image ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
                'phone' => $req->owner?->phone ?? '',
                'viber' => $ownerViber,
                'telegram' => $ownerTelegram,
                'facebook' => $ownerFacebook,
                'bio' => $req->owner?->bio ?? 'Active community swap member',
                'joined' => $req->owner?->created_at ? 'Member since ' . $req->owner->created_at->format('Y') : 'Member since 2024',
                'completedSwaps' => $ownerCompletedSwaps,
                'exchanges' => $ownerCompletedSwaps,
                'communicationContacts' => [
                    'telegram' => $ownerTelegram,
                    'viber' => $ownerViber,
                    'facebook' => $ownerFacebook,
                ],
                'items' => $req->owner?->items?->map(function ($it) {
                    $img = $it->images->where('is_primary', true)->first()?->image_url
                        ?? $it->images->first()?->image_url
                        ?? 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80';
                    return [
                        'id' => $it->id,
                        'title' => $it->title,
                        'category' => $it->category?->name ?? 'General',
                        'condition' => $it->condition ?? 'Good',
                        'image' => $img,
                    ];
                })->values()->toArray() ?? [],
            ],
            'offeredItem' => [
                'id' => $req->offeredItem?->id,
                'title' => $req->offeredItem?->title ?? 'Offered Item',
                'category' => $req->offeredItem?->category?->name ?? 'General',
                'condition' => $req->offeredItem?->condition ?? 'Good',
                'city' => $offeredCity,
                'image' => $offeredImg,
            ],
            'requestedItem' => [
                'id' => $req->requestedItem?->id,
                'title' => $req->requestedItem?->title ?? 'Requested Item',
                'category' => $req->requestedItem?->category?->name ?? 'General',
                'condition' => $req->requestedItem?->condition ?? 'Good',
                'city' => $requestedCity,
                'image' => $requestedImg,
            ],
        ];
    }

    /**
     * Standardized Exchange History item formatter matching Frontend contract.
     */
    private function formatExchangeHistoryItem(ExchangeRequest $exc, User $user): array
    {
        $isRequester = $exc->requester_id === $user->id;

        $offeredImg = $exc->offeredItem?->images->where('is_primary', true)->first()?->image_url
            ?? $exc->offeredItem?->images->first()?->image_url
            ?? 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80';

        $requestedImg = $exc->requestedItem?->images->where('is_primary', true)->first()?->image_url
            ?? $exc->requestedItem?->images->first()?->image_url
            ?? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';

        $offeredTownship = $exc->offeredItem?->township?->name;
        $offeredRegion = $exc->offeredItem?->township?->stateRegion?->name;
        $offeredCity = $offeredTownship && $offeredRegion ? "{$offeredTownship}, {$offeredRegion}" : ($exc->offeredItem?->city ?? 'Mandalay');

        $requestedTownship = $exc->requestedItem?->township?->name;
        $requestedRegion = $exc->requestedItem?->township?->stateRegion?->name;
        $requestedCity = $requestedTownship && $requestedRegion ? "{$requestedTownship}, {$requestedRegion}" : ($exc->requestedItem?->city ?? 'Yangon');

        $isIntercity = str_contains(strtolower($exc->exchange_type ?? ''), 'courier')
            || str_contains(strtolower($exc->exchange_type ?? ''), 'intercity')
            || ($exc->offeredItem?->township?->state_region_id && $exc->requestedItem?->township?->state_region_id && $exc->offeredItem->township->state_region_id !== $exc->requestedItem->township->state_region_id);

        $requesterTownship = $exc->requester?->township?->name;
        $requesterRegion = $exc->requester?->township?->stateRegion?->name;
        $requesterCity = $requesterTownship && $requesterRegion ? "{$requesterTownship}, {$requesterRegion}" : 'Mandalay';

        $ownerTownship = $exc->owner?->township?->name;
        $ownerRegion = $exc->owner?->township?->stateRegion?->name;
        $ownerCity = $ownerTownship && $ownerRegion ? "{$ownerTownship}, {$ownerRegion}" : 'Yangon';

        $isDispatched = in_array($exc->status, ['Shipping', 'In Transit', 'Partially Received', 'Completed']);
        $isReceiptConfirmed = ($exc->status === 'Completed');
        $isDepositsVerified = in_array($exc->status, ['Deposits Verified', 'Contact Unlocked', 'Shipping', 'In Transit', 'Partially Received', 'Completed']);
        $isArrangementConfirmed = in_array($exc->status, ['Arrangement Confirmed', 'Shipping', 'In Transit', 'Partially Received', 'Completed']);
        $intercityStage = $isReceiptConfirmed ? 6 : ($isDispatched ? 5 : ($isArrangementConfirmed ? 4 : ($isDepositsVerified ? 3 : 2)));

        $requesterTelegram = $exc->requester?->communicationContacts?->where('platform', 'Telegram')->first()?->contact_value ?? '';
        $requesterViber = $exc->requester?->communicationContacts?->where('platform', 'Viber')->first()?->contact_value ?? $exc->requester?->phone ?? '';
        $requesterFacebook = $exc->requester?->communicationContacts?->where('platform', 'Facebook Messenger')->first()?->contact_value ?? '';

        $ownerTelegram = $exc->owner?->communicationContacts?->where('platform', 'Telegram')->first()?->contact_value ?? '';
        $ownerViber = $exc->owner?->communicationContacts?->where('platform', 'Viber')->first()?->contact_value ?? $exc->owner?->phone ?? '';
        $ownerFacebook = $exc->owner?->communicationContacts?->where('platform', 'Facebook Messenger')->first()?->contact_value ?? '';

        if ($isRequester) {
            $myProvidedItem = [
                'title' => $exc->offeredItem?->title ?? 'Offered Item',
                'ownerName' => $user->name . ' (You)',
                'ownerCity' => $offeredCity,
                'image' => $offeredImg,
                'category' => $exc->offeredItem?->category?->name ?? 'General',
            ];
            $partnerReceivedItem = [
                'title' => $exc->requestedItem?->title ?? 'Requested Item',
                'ownerName' => $exc->owner?->name ?? 'Community Member',
                'ownerCity' => $requestedCity,
                'image' => $requestedImg,
                'category' => $exc->requestedItem?->category?->name ?? 'General',
            ];
            $partyA = [
                'name' => $user->name . ' (You)',
                'city' => $requesterCity,
                'phone' => $user->phone ?? '',
                'telegram' => $requesterTelegram,
                'viber' => $requesterViber,
                'facebook' => $requesterFacebook,
                'communicationContacts' => [
                    'telegram' => $requesterTelegram,
                    'viber' => $requesterViber,
                    'facebook' => $requesterFacebook,
                ],
                'courier' => 'Royal Express',
                'trackingNumber' => '',
                'dispatched' => $isDispatched,
                'confirmedReceipt' => $isReceiptConfirmed,
            ];
            $partyB = [
                'name' => $exc->owner?->name ?? 'Community Member',
                'city' => $ownerCity,
                'phone' => $exc->owner?->phone ?? '',
                'telegram' => $ownerTelegram,
                'viber' => $ownerViber,
                'facebook' => $ownerFacebook,
                'communicationContacts' => [
                    'telegram' => $ownerTelegram,
                    'viber' => $ownerViber,
                    'facebook' => $ownerFacebook,
                ],
                'courier' => 'Elite Cargo Express',
                'trackingNumber' => '',
                'dispatched' => $isDispatched,
                'confirmedReceipt' => $isReceiptConfirmed,
                'avatar' => $exc->owner?->profile_image ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
            ];
        } else {
            $myProvidedItem = [
                'title' => $exc->requestedItem?->title ?? 'Your Listed Item',
                'ownerName' => $user->name . ' (You)',
                'ownerCity' => $requestedCity,
                'image' => $requestedImg,
                'category' => $exc->requestedItem?->category?->name ?? 'General',
            ];
            $partnerReceivedItem = [
                'title' => $exc->offeredItem?->title ?? 'Offered Item',
                'ownerName' => $exc->requester?->name ?? 'Community Member',
                'ownerCity' => $offeredCity,
                'image' => $offeredImg,
                'category' => $exc->offeredItem?->category?->name ?? 'General',
            ];
            $partyA = [
                'name' => $user->name . ' (You)',
                'city' => $ownerCity,
                'phone' => $user->phone ?? '',
                'telegram' => $ownerTelegram,
                'viber' => $ownerViber,
                'facebook' => $ownerFacebook,
                'communicationContacts' => [
                    'telegram' => $ownerTelegram,
                    'viber' => $ownerViber,
                    'facebook' => $ownerFacebook,
                ],
                'courier' => 'Royal Express',
                'trackingNumber' => '',
                'dispatched' => $isDispatched,
                'confirmedReceipt' => $isReceiptConfirmed,
            ];
            $partyB = [
                'name' => $exc->requester?->name ?? 'Community Member',
                'city' => $requesterCity,
                'phone' => $exc->requester?->phone ?? '',
                'telegram' => $requesterTelegram,
                'viber' => $requesterViber,
                'facebook' => $requesterFacebook,
                'communicationContacts' => [
                    'telegram' => $requesterTelegram,
                    'viber' => $requesterViber,
                    'facebook' => $requesterFacebook,
                ],
                'courier' => 'Elite Cargo Express',
                'trackingNumber' => '',
                'dispatched' => $isDispatched,
                'confirmedReceipt' => $isReceiptConfirmed,
                'avatar' => $exc->requester?->profile_image ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
            ];
        }

        $myReview = $exc->reviews->where('reviewer_id', $user->id)->first();
        $reviewGiven = $myReview ? [
            'rating' => $myReview->rating,
            'comment' => $myReview->comment,
        ] : null;

        $isCompleted = ($exc->status === 'Completed');

        $paymentA = $exc->payments->where('payer_id', $user->id)->first();
        $otherUserId = ($isRequester ? $exc->owner_id : $exc->requester_id);
        $paymentB = $exc->payments->where('payer_id', $otherUserId)->first();

        $depositStatusA = $paymentA ? $paymentA->payment_status : ($isDepositsVerified ? 'Verified' : 'Unpaid');
        $depositStatusB = $paymentB ? $paymentB->payment_status : ($isDepositsVerified ? 'Verified' : 'Unpaid');

        return [
            'id' => $exc->exchange_code ?: ('EXC-' . $exc->id),
            'exchangeCode' => $exc->exchange_code ?: ('EXC-' . $exc->id),
            'numericId' => $exc->id,
            'status' => $exc->status === 'Accepted' ? 'Deposit Payment' : $exc->status,
            'isCompleted' => (bool) $isCompleted,
            'isIntercity' => (bool) $isIntercity,
            'intercityStage' => $intercityStage,
            'handoverMethod' => $exc->exchange_type ?: ($isIntercity ? 'Intercity Courier Delivery' : 'In-Person Meetup'),
            'initiatedDate' => $exc->created_at ? $exc->created_at->format('Y-m-d') : 'Recent',
            'completedDate' => $exc->completed_at ? $exc->completed_at->format('Y-m-d') : ($isCompleted ? $exc->updated_at->format('Y-m-d') : null),
            'itemA' => $myProvidedItem,
            'itemB' => $partnerReceivedItem,
            'partyA' => $partyA,
            'partyB' => $partyB,
            'reviewGiven' => $reviewGiven,
            'deposits' => [
                'partyA' => [
                    'itemTitle' => $myProvidedItem['title'],
                    'category' => $myProvidedItem['category'],
                    'amount' => $paymentA?->deposit_amount ?? 50000,
                    'status' => $depositStatusA,
                    'paymentMethod' => $paymentA?->payment_method ?? ($depositStatusA === 'Verified' ? 'KBZPay' : null),
                    'referenceNumber' => $paymentA?->reference_number ?? '',
                    'slipImage' => $paymentA?->payment_proof,
                    'submittedAt' => $paymentA?->created_at?->format('Y-m-d H:i'),
                    'verifiedAt' => $paymentA?->verified_at?->format('Y-m-d H:i'),
                ],
                'partyB' => [
                    'itemTitle' => $partnerReceivedItem['title'],
                    'category' => $partnerReceivedItem['category'],
                    'amount' => $paymentB?->deposit_amount ?? 50000,
                    'status' => $depositStatusB,
                    'paymentMethod' => $paymentB?->payment_method ?? ($depositStatusB === 'Verified' ? 'WavePay' : null),
                    'referenceNumber' => $paymentB?->reference_number ?? '',
                    'slipImage' => $paymentB?->payment_proof,
                    'submittedAt' => $paymentB?->created_at?->format('Y-m-d H:i'),
                    'verifiedAt' => $paymentB?->verified_at?->format('Y-m-d H:i'),
                ],
            ],
            'courierArrangement' => [
                'confirmed' => $isArrangementConfirmed,
                'confirmedAt' => $isArrangementConfirmed ? ($exc->created_at ? $exc->created_at->format('Y-m-d') : 'Today') : null,
            ],
            'refundWorkflow' => [
                'initiated' => $isCompleted,
                'status' => $isCompleted ? 'Refund Processed' : 'Locked',
            ],
        ];
    }

    /**
     * Submit escrow deposit payment proof (KBZPay, WavePay, etc.).
     */
    public function submitDeposit(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'paymentMethod' => 'nullable|string',
            'referenceNumber' => 'required|string',
            'slipImage' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $cleanId = str_replace('#', '', $id);
        $req = ExchangeRequest::with(['offeredItem.category', 'requestedItem.category'])
            ->where('id', $cleanId)
            ->orWhere('exchange_code', $cleanId)
            ->firstOrFail();

        if ($req->requester_id !== $user->id && $req->owner_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Unauthorized to submit deposit for this exchange', 403);
        }

        $isRequester = ($req->requester_id === $user->id);
        $item = $isRequester ? $req->offeredItem : $req->requestedItem;
        $depositAmount = $item?->category?->deposit_amount ?? 50000;

        $payment = ExchangePayment::updateOrCreate(
            [
                'exchange_id' => $req->id,
                'payer_id' => $user->id,
            ],
            [
                'category_id' => $item?->category_id,
                'deposit_amount' => $depositAmount,
                'payment_method' => $request->paymentMethod ?? $request->payment_method ?? 'KBZPay',
                'reference_number' => $request->referenceNumber ?? $request->reference_number,
                'payment_proof' => $request->slipImage ?? $request->slip_image ?? $request->payment_proof,
                'payment_status' => 'Payment Submitted',
            ]
        );

        if (in_array($req->status, ['Accepted', 'Deposit Payment Required', 'Deposit Payment'])) {
            $req->status = 'Deposit Review';
            $req->save();
        }

        return $this->successResponse([
            'payment' => $payment,
            'status' => 'Payment Submitted',
        ], 'Escrow deposit payment proof submitted. Awaiting platform administrator verification.');
    }

    /**
     * Admin: Get single exchange details for inspection and deposit audit.
     */
    public function adminShow($id): JsonResponse
    {
        $cleanId = str_replace('#', '', $id);
        $req = ExchangeRequest::with([
            'requester.township.stateRegion',
            'requester.communicationContacts',
            'owner.township.stateRegion',
            'owner.communicationContacts',
            'offeredItem.category',
            'offeredItem.images',
            'offeredItem.township.stateRegion',
            'requestedItem.category',
            'requestedItem.images',
            'requestedItem.township.stateRegion',
            'payments.payer',
            'reviews',
        ])->where('id', $cleanId)
          ->orWhere('exchange_code', $cleanId)
          ->firstOrFail();

        return $this->successResponse($this->formatAdminExchange($req), 'Admin exchange retrieved');
    }

    /**
     * Admin: Approve an escrow deposit payment slip.
     */
    public function adminApproveDeposit(Request $request, $id): JsonResponse
    {
        $cleanId = str_replace('#', '', $id);
        $req = ExchangeRequest::with(['payments', 'offeredItem.category', 'requestedItem.category'])
            ->where('id', $cleanId)
            ->orWhere('exchange_code', $cleanId)
            ->firstOrFail();

        $partyRole = $request->partyRole ?? 'partyA';
        $payerId = ($partyRole === 'partyA') ? $req->requester_id : $req->owner_id;

        $payment = ExchangePayment::where('exchange_id', $req->id)
            ->where('payer_id', $payerId)
            ->first();

        if (!$payment) {
            $depositAmount = ($partyRole === 'partyA') 
                ? ($req->offeredItem?->category?->deposit_amount ?? 50000)
                : ($req->requestedItem?->category?->deposit_amount ?? 50000);

            $payment = ExchangePayment::create([
                'exchange_id' => $req->id,
                'payer_id' => $payerId,
                'category_id' => ($partyRole === 'partyA') ? $req->offeredItem?->category_id : $req->requestedItem?->category_id,
                'deposit_amount' => $depositAmount,
                'payment_method' => $request->paymentMethod ?? 'KBZPay',
                'reference_number' => $request->referenceNumber ?? ('ADM-' . rand(100000, 999999)),
                'payment_status' => 'Verified',
                'verified_at' => now(),
            ]);
        } else {
            $payment->payment_status = 'Verified';
            $payment->verified_at = now();
            $payment->save();
        }

        // Check if both deposits are verified
        $allPayments = ExchangePayment::where('exchange_id', $req->id)->get();
        $isPartyAVerified = $allPayments->where('payer_id', $req->requester_id)->where('payment_status', 'Verified')->isNotEmpty();
        $isPartyBVerified = $allPayments->where('payer_id', $req->owner_id)->where('payment_status', 'Verified')->isNotEmpty();

        if ($isPartyAVerified && $isPartyBVerified) {
            $req->status = 'Deposits Verified';
            $req->save();
        }

        $req->refresh()->load([
            'requester.township.stateRegion', 'requester.communicationContacts',
            'owner.township.stateRegion', 'owner.communicationContacts',
            'offeredItem.category', 'offeredItem.images',
            'requestedItem.category', 'requestedItem.images',
            'payments.payer'
        ]);

        return $this->successResponse($this->formatAdminExchange($req), 'Escrow deposit payment verified successfully');
    }

    /**
     * Admin: Reject an escrow deposit payment slip.
     */
    public function adminRejectDeposit(Request $request, $id): JsonResponse
    {
        $cleanId = str_replace('#', '', $id);
        $req = ExchangeRequest::where('id', $cleanId)
            ->orWhere('exchange_code', $cleanId)
            ->firstOrFail();

        $partyRole = $request->partyRole ?? 'partyA';
        $payerId = ($partyRole === 'partyA') ? $req->requester_id : $req->owner_id;

        $payment = ExchangePayment::where('exchange_id', $req->id)
            ->where('payer_id', $payerId)
            ->first();

        if ($payment) {
            $payment->payment_status = 'Rejected';
            $payment->rejection_reason = $request->reason ?? 'Payment slip unreadable or transaction reference not found on bank statement.';
            $payment->save();
        }

        $req->refresh()->load([
            'requester.township.stateRegion', 'requester.communicationContacts',
            'owner.township.stateRegion', 'owner.communicationContacts',
            'offeredItem.category', 'offeredItem.images',
            'requestedItem.category', 'requestedItem.images',
            'payments.payer'
        ]);

        return $this->successResponse($this->formatAdminExchange($req), 'Deposit slip marked as rejected');
    }

    /**
     * Admin: Process escrow deposit refund payout.
     */
    public function adminProcessRefund(Request $request, $id): JsonResponse
    {
        $cleanId = str_replace('#', '', $id);
        $req = ExchangeRequest::where('id', $cleanId)
            ->orWhere('exchange_code', $cleanId)
            ->firstOrFail();

        $partyRole = $request->partyRole ?? 'partyA';
        $payerId = ($partyRole === 'partyA') ? $req->requester_id : $req->owner_id;

        Refund::updateOrCreate(
            [
                'exchange_id' => $req->id,
                'user_id' => $payerId,
            ],
            [
                'refund_amount' => $request->amount ?? 50000,
                'refund_status' => 'Completed',
                'account_number' => $request->accountNumber ?? $request->account_number ?? '',
                'account_name' => $request->accountName ?? $request->account_name ?? '',
                'wallet_type' => $request->provider ?? $request->wallet_type ?? 'KBZPay',
                'transaction_reference' => $request->txRef ?? $request->transaction_reference ?? ('REF-' . rand(100000, 999999)),
                'processed_at' => now(),
            ]
        );

        $req->refresh()->load([
            'requester.township.stateRegion', 'requester.communicationContacts',
            'owner.township.stateRegion', 'owner.communicationContacts',
            'offeredItem.category', 'offeredItem.images',
            'requestedItem.category', 'requestedItem.images',
            'payments.payer'
        ]);

        return $this->successResponse($this->formatAdminExchange($req), 'Refund payout processed successfully');
    }

    /**
     * Standardized Admin Exchange Formatter matching Admin ExchangeDetails page contract.
     */
    private function formatAdminExchange(ExchangeRequest $exc): array
    {
        $offeredCity = $exc->offeredItem?->township?->name 
            ? "{$exc->offeredItem->township->name}, {$exc->offeredItem->township->stateRegion?->name}"
            : ($exc->offeredItem?->city ?? 'Mandalay (MDY)');

        $requestedCity = $exc->requestedItem?->township?->name 
            ? "{$exc->requestedItem->township->name}, {$exc->requestedItem->township->stateRegion?->name}"
            : ($exc->requestedItem?->city ?? 'Yangon (YGN)');

        $isIntercity = str_contains(strtolower($exc->exchange_type ?? ''), 'courier')
            || str_contains(strtolower($exc->exchange_type ?? ''), 'intercity')
            || ($exc->offeredItem?->township?->state_region_id && $exc->requestedItem?->township?->state_region_id && $exc->offeredItem->township->state_region_id !== $exc->requestedItem->township->state_region_id);

        $paymentA = $exc->payments->where('payer_id', $exc->requester_id)->first();
        $paymentB = $exc->payments->where('payer_id', $exc->owner_id)->first();

        $isDepositsVerified = ($paymentA && $paymentA->payment_status === 'Verified') && ($paymentB && $paymentB->payment_status === 'Verified');
        $isCompleted = ($exc->status === 'Completed');

        $requesterTelegram = $exc->requester?->communicationContacts?->where('platform', 'Telegram')->first()?->contact_value ?? '';
        $requesterViber = $exc->requester?->communicationContacts?->where('platform', 'Viber')->first()?->contact_value ?? $exc->requester?->phone ?? '';
        $requesterFacebook = $exc->requester?->communicationContacts?->where('platform', 'Facebook Messenger')->first()?->contact_value ?? '';

        $ownerTelegram = $exc->owner?->communicationContacts?->where('platform', 'Telegram')->first()?->contact_value ?? '';
        $ownerViber = $exc->owner?->communicationContacts?->where('platform', 'Viber')->first()?->contact_value ?? $exc->owner?->phone ?? '';
        $ownerFacebook = $exc->owner?->communicationContacts?->where('platform', 'Facebook Messenger')->first()?->contact_value ?? '';

        $partyAAmount = $exc->offeredItem?->category?->deposit_amount ?? 50000;
        $partyBAmount = $exc->requestedItem?->category?->deposit_amount ?? 50000;

        $history = [
            [
                'date' => $exc->created_at ? $exc->created_at->format('Y-m-d H:i') : 'Recent',
                'event' => "Exchange proposal created by {$exc->requester?->name} for {$exc->offeredItem?->title} in return for {$exc->requestedItem?->title}."
            ]
        ];

        if ($paymentA) {
            $history[] = [
                'date' => $paymentA->created_at?->format('Y-m-d H:i') ?? 'Recent',
                'event' => "{$exc->requester?->name} submitted escrow deposit of " . number_format($paymentA->deposit_amount) . " MMK via {$paymentA->payment_method} (Ref: {$paymentA->reference_number})."
            ];
            if ($paymentA->verified_at) {
                $history[] = [
                    'date' => $paymentA->verified_at->format('Y-m-d H:i'),
                    'event' => "Admin verified {$exc->requester?->name}'s escrow deposit."
                ];
            }
        }

        if ($paymentB) {
            $history[] = [
                'date' => $paymentB->created_at?->format('Y-m-d H:i') ?? 'Recent',
                'event' => "{$exc->owner?->name} submitted escrow deposit of " . number_format($paymentB->deposit_amount) . " MMK via {$paymentB->payment_method} (Ref: {$paymentB->reference_number})."
            ];
            if ($paymentB->verified_at) {
                $history[] = [
                    'date' => $paymentB->verified_at->format('Y-m-d H:i'),
                    'event' => "Admin verified {$exc->owner?->name}'s escrow deposit."
                ];
            }
        }

        return [
            'id' => $exc->exchange_code ?: ('EXC-' . $exc->id),
            'exchangeCode' => $exc->exchange_code ?: ('EXC-' . $exc->id),
            'numericId' => $exc->id,
            'status' => $exc->status,
            'isIntercity' => (bool) $isIntercity,
            'handoverMethod' => $exc->exchange_type ?: ($isIntercity ? 'Intercity Courier Delivery' : 'In-Person Meetup'),
            'initiatedDate' => $exc->created_at ? $exc->created_at->format('Y-m-d') : 'Recent',
            'completedDate' => $exc->completed_at ? $exc->completed_at->format('Y-m-d') : ($isCompleted ? $exc->updated_at->format('Y-m-d') : null),
            'itemA' => [
                'id' => $exc->offeredItem?->id,
                'title' => $exc->offeredItem?->title ?? 'Offered Item',
                'category' => $exc->offeredItem?->category?->name ?? 'General',
                'image' => $exc->offeredItem?->images->where('is_primary', true)->first()?->image_url ?? $exc->offeredItem?->images->first()?->image_url ?? 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
                'condition' => $exc->offeredItem?->condition ?? 'Good',
            ],
            'itemB' => [
                'id' => $exc->requestedItem?->id,
                'title' => $exc->requestedItem?->title ?? 'Requested Item',
                'category' => $exc->requestedItem?->category?->name ?? 'General',
                'image' => $exc->requestedItem?->images->where('is_primary', true)->first()?->image_url ?? $exc->requestedItem?->images->first()?->image_url ?? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
                'condition' => $exc->requestedItem?->condition ?? 'Good',
            ],
            'partyA' => [
                'name' => $exc->requester?->name ?? 'Party A',
                'city' => $offeredCity,
                'phone' => $exc->requester?->phone ?? '',
                'rating' => (float) ($exc->requester?->rating ?? 5.0),
                'avatar' => $exc->requester?->profile_image ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
                'dispatched' => in_array($exc->status, ['Shipping', 'In Transit', 'Partially Received', 'Completed']),
                'trackingNumber' => '',
                'courier' => 'Royal Express',
                'confirmedReceipt' => $isCompleted,
            ],
            'partyB' => [
                'name' => $exc->owner?->name ?? 'Party B',
                'city' => $requestedCity,
                'phone' => $exc->owner?->phone ?? '',
                'rating' => (float) ($exc->owner?->rating ?? 5.0),
                'avatar' => $exc->owner?->profile_image ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
                'dispatched' => in_array($exc->status, ['Shipping', 'In Transit', 'Partially Received', 'Completed']),
                'trackingNumber' => '',
                'courier' => 'Elite Cargo Express',
                'confirmedReceipt' => $isCompleted,
            ],
            'deposits' => [
                'partyA' => [
                    'amount' => $paymentA?->deposit_amount ?? $partyAAmount,
                    'status' => $paymentA?->payment_status ?? 'Unpaid',
                    'paymentMethod' => $paymentA?->payment_method ?? 'KBZPay',
                    'referenceNumber' => $paymentA?->reference_number ?? '',
                    'slipImage' => $paymentA?->payment_proof,
                    'submittedAt' => $paymentA?->created_at?->format('Y-m-d H:i'),
                    'verifiedAt' => $paymentA?->verified_at?->format('Y-m-d H:i'),
                ],
                'partyB' => [
                    'amount' => $paymentB?->deposit_amount ?? $partyBAmount,
                    'status' => $paymentB?->payment_status ?? 'Unpaid',
                    'paymentMethod' => $paymentB?->payment_method ?? 'WavePay',
                    'referenceNumber' => $paymentB?->reference_number ?? '',
                    'slipImage' => $paymentB?->payment_proof,
                    'submittedAt' => $paymentB?->created_at?->format('Y-m-d H:i'),
                    'verifiedAt' => $paymentB?->verified_at?->format('Y-m-d H:i'),
                ],
            ],
            'externalContacts' => [
                'unlocked' => (bool) $isDepositsVerified,
                'partyA' => [
                    'telegram' => $requesterTelegram,
                    'viber' => $requesterViber,
                    'facebook' => $requesterFacebook,
                    'preferredMethod' => $requesterTelegram ? 'telegram' : 'viber',
                ],
                'partyB' => [
                    'telegram' => $ownerTelegram,
                    'viber' => $ownerViber,
                    'facebook' => $ownerFacebook,
                    'preferredMethod' => $ownerTelegram ? 'telegram' : 'viber',
                ],
            ],
            'refundWorkflow' => [
                'initiated' => $isCompleted,
                'partyA' => [
                    'amount' => $partyAAmount,
                    'status' => $isCompleted ? 'Pending Payout' : 'Locked',
                    'accountNumber' => '',
                    'accountName' => '',
                    'walletType' => 'KBZPay',
                ],
                'partyB' => [
                    'amount' => $partyBAmount,
                    'status' => $isCompleted ? 'Pending Payout' : 'Locked',
                    'accountNumber' => '',
                    'accountName' => '',
                    'walletType' => 'WavePay',
                ],
            ],
            'history' => $history,
        ];
    }
}
