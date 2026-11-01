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

class AdminController extends Controller
{
    use ApiResponse;

    /**
     * Get dynamic dashboard statistics.
     */
    public function dashboardStats(): JsonResponse
    {
        $totalMembers = User::where('role', 'user')->count();
        $activeMembers = User::where('role', 'user')->where('account_status', 'Active')->count();
        $totalItems = Item::count();
        $activeExchanges = ExchangeRequest::whereIn('status', ['Pending', 'Accepted', 'Deposit Review', 'Shipping'])->count();
        $completedSwaps = ExchangeRequest::where('status', 'Completed')->count();
        $openDisputes = Dispute::whereIn('status', ['Open', 'Under Review'])->count();

        // Escrow Funds Statistics
        $escrowHeld = ExchangePayment::where('payment_status', 'Verified')->sum('deposit_amount');
        $pendingDeposits = ExchangePayment::where('payment_status', 'Payment Submitted')->count();
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
