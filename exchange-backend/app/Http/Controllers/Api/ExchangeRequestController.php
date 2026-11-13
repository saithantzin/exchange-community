<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExchangePayment;
use App\Models\ExchangeRequest;
use App\Models\Item;
use App\Models\ReceiptConfirmation;
use App\Models\Refund;
use App\Models\Review;
use App\Models\Shipment;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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

        $query = ExchangeRequest::with($this->getExchangeRelations());

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
    /**
     * Unified exchange eager loader relations.
     */
    private function getExchangeRelations(): array
    {
        return [
            'requester.communicationContacts',
            'requester.township.stateRegion',
            'owner.communicationContacts',
            'owner.township.stateRegion',
            'offeredItem.category',
            'offeredItem.images',
            'offeredItem.township.stateRegion',
            'requestedItem.category',
            'requestedItem.images',
            'requestedItem.township.stateRegion',
            'payments.payer',
            'payments.verifiedBy',
            'shipments.sender',
            'confirmations.user',
            'refunds.user',
            'reviews',
        ];
    }

    private function requiresIntercityDeposit(ExchangeRequest $exchange): bool
    {
        $type = strtolower($exchange->exchange_type ?? '');
        $isMeetup = str_contains($type, 'meetup')
            || str_contains($type, 'in-person')
            || str_contains($type, 'in person');

        return !$isMeetup && (
            str_contains($type, 'intercity')
            || str_contains($type, 'courier')
            || str_contains($type, 'express')
        );
    }

    private function adminPaymentEvidencePath(int $exchangeId, string $partyRole, ?string $proof): ?string
    {
        if (!$proof) {
            return null;
        }

        return "/admin/exchanges/{$exchangeId}/deposits/{$partyRole}/evidence";
    }

    /**
     * Flexible lookup matching id, exchange_code (with or without 'EXC-'), or hashtag.
     */
    private function findExchange($id, array $with = []): ?ExchangeRequest
    {
        $cleanId = str_replace('#', '', trim($id));
        $codeVariant = strtoupper($cleanId);
        if (!str_starts_with($codeVariant, 'EXC-')) {
            $codeVariant = 'EXC-' . $cleanId;
        }

        $query = ExchangeRequest::query();
        if (!empty($with)) {
            $query->with($with);
        }

        return $query->where('id', $cleanId)
            ->orWhere('exchange_code', $cleanId)
            ->orWhere('exchange_code', $codeVariant)
            ->orWhere('exchange_code', str_replace('EXC-', '', $codeVariant))
            ->first();
    }

    /**
     * Show a single exchange request by ID (returns rich unified structure).
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $req = $this->findExchange($id, $this->getExchangeRelations());

        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }

        if ($req->requester_id !== $user->id && $req->owner_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Unauthorized to view this exchange request', 403);
        }

        return $this->successResponse($this->formatExchangeResponse($req, $user));
    }

    /**
     * Accept an incoming exchange proposal.
     */
    public function accept(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $req = $this->findExchange($id, $this->getExchangeRelations());

        if (!$req) {
            return $this->errorResponse('Exchange proposal not found', 404);
        }

        if ($req->owner_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Only the listing owner can accept this proposal', 403);
        }

        if (!in_array($req->status, ['Pending'])) {
            return $this->errorResponse('Exchange proposal cannot be accepted in status: ' . $req->status, 422);
        }

        DB::transaction(function () use ($req) {
            $req->status = 'Accepted';
            $req->save();

            if ($this->requiresIntercityDeposit($req)) {
                foreach ([
                    [$req->requester_id, $req->offeredItem],
                    [$req->owner_id, $req->requestedItem],
                ] as [$payerId, $item]) {
                    ExchangePayment::firstOrCreate(
                        ['exchange_id' => $req->id, 'payer_id' => $payerId],
                        [
                            'category_id' => $item?->category_id,
                            'deposit_amount' => $item?->category?->deposit_amount ?? 50000,
                            'payment_status' => 'Pending Payment',
                        ]
                    );
                }
            }
        });

        return $this->successResponse(
            $this->formatExchangeResponse($req->fresh($this->getExchangeRelations()), $user),
            'Exchange proposal accepted successfully'
        );
    }

    /**
     * Reject an incoming exchange proposal.
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $req = $this->findExchange($id, $this->getExchangeRelations());

        if (!$req) {
            return $this->errorResponse('Exchange proposal not found', 404);
        }

        if ($req->owner_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Only the listing owner can decline this proposal', 403);
        }

        $req->status = 'Rejected';
        $req->save();

        return $this->successResponse(
            $this->formatExchangeResponse($req->fresh($this->getExchangeRelations()), $user),
            'Exchange proposal declined'
        );
    }

    /**
     * Cancel an outgoing exchange proposal.
     */
    public function cancel(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $req = $this->findExchange($id, $this->getExchangeRelations());

        if (!$req) {
            return $this->errorResponse('Exchange proposal not found', 404);
        }

        if ($req->requester_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Only the requester can cancel this proposal', 403);
        }

        $req->status = 'Cancelled';
        $req->save();

        return $this->successResponse(
            $this->formatExchangeResponse($req->fresh($this->getExchangeRelations()), $user),
            'Exchange proposal cancelled'
        );
    }

    /**
     * Two-Sided Handover Confirmation (In-Person Meetup).
     * Saves user's confirmation in receipt_confirmations.
     * When both confirm: DB transaction sets status = Completed, both items Not Available.
     */
    public function confirmHandover(Request $request, $id): JsonResponse
    {
        return $this->handleConfirmation($request, $id, 'handover');
    }

    /**
     * Backward-compatible alias for complete exchange.
     */
    public function complete(Request $request, $id): JsonResponse
    {
        return $this->handleConfirmation($request, $id, 'handover');
    }

    /**
     * Two-Sided Parcel Receipt Confirmation (Intercity Courier).
     */
    public function confirmReceipt(Request $request, $id): JsonResponse
    {
        return $this->handleConfirmation($request, $id, 'receipt');
    }

    /**
     * Reusable handler for two-sided confirmations (Handover & Receipt).
     */
    private function handleConfirmation(Request $request, $id, string $type = 'handover'): JsonResponse
    {
        $user = $request->user();
        $req = $this->findExchange($id, $this->getExchangeRelations());

        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }

        if ($req->requester_id !== $user->id && $req->owner_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Unauthorized to confirm this exchange', 403);
        }

        if (in_array($req->status, ['Rejected', 'Cancelled'])) {
            return $this->errorResponse('Cannot confirm an exchange that is ' . $req->status, 422);
        }

        // 1. Record this participant's confirmation in MySQL receipt_confirmations table
        ReceiptConfirmation::updateOrCreate(
            [
                'exchange_id' => $req->id,
                'user_id' => $user->id,
            ],
            [
                'confirmed_at' => now(),
                'condition_notes' => $request->input('notes') ?? $request->input('condition_notes') ?? ($type === 'handover' ? 'In-person handover verified.' : 'Parcel received in good condition.'),
                'evidence' => $request->input('evidence') ?? $request->input('receiptImage') ?? null,
            ]
        );

        // 2. Re-query confirmations for this exchange
        $confirmations = ReceiptConfirmation::where('exchange_id', $req->id)->get();
        $hasRequesterConfirmed = $confirmations->where('user_id', $req->requester_id)->isNotEmpty();
        $hasOwnerConfirmed = $confirmations->where('user_id', $req->owner_id)->isNotEmpty();
        $bothConfirmed = ($hasRequesterConfirmed && $hasOwnerConfirmed);

        // 3. If both confirmed: mark Completed in DB transaction
        if ($bothConfirmed) {
            DB::transaction(function () use ($req) {
                $req->status = 'Completed';
                $req->completed_at = now();
                $req->save();

                if ($req->offeredItem) {
                    $req->offeredItem->availability_status = 'Not Available';
                    $req->offeredItem->save();
                }
                if ($req->requestedItem) {
                    $req->requestedItem->availability_status = 'Not Available';
                    $req->requestedItem->save();
                }
            });

            return $this->successResponse(
                $this->formatExchangeResponse($req->fresh($this->getExchangeRelations()), $user),
                'Handover confirmed by both parties! Exchange successfully Completed.'
            );
        }

        // 4. Only one participant has confirmed so far: persist partial status
        if ($req->status !== 'Completed') {
            $req->status = ($type === 'handover' ? 'Handover In Progress' : 'Partially Received');
            $req->save();
        }

        return $this->successResponse(
            $this->formatExchangeResponse($req->fresh($this->getExchangeRelations()), $user),
            'Your confirmation has been permanently saved in the database. Awaiting partner confirmation.'
        );
    }

    /**
     * Confirm Courier Arrangement (State 3 -> State 4).
     */
    public function confirmCourierArrangement(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $req = $this->findExchange($id, $this->getExchangeRelations());

        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }

        if ($req->requester_id !== $user->id && $req->owner_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Unauthorized to confirm courier arrangement', 403);
        }

        $req->status = 'Arrangement Confirmed';
        $req->save();

        return $this->successResponse(
            $this->formatExchangeResponse($req->fresh($this->getExchangeRelations()), $user),
            'Courier arrangement confirmed by participants.'
        );
    }

    /**
     * Submit Shipping / Courier Dispatch information (State 4).
     */
    public function submitShipping(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $req = $this->findExchange($id, $this->getExchangeRelations());

        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }

        if ($req->requester_id !== $user->id && $req->owner_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Unauthorized to record shipping', 403);
        }

        $validator = Validator::make($request->all(), [
            'courier_name' => 'nullable|string|max:255',
            'courier' => 'nullable|string|max:255',
            'tracking_number' => 'nullable|string|max:255',
            'trackingNumber' => 'nullable|string|max:255',
            'shippingProof' => 'nullable|file|image|mimes:jpeg,jpg,png,webp|max:5120',
            'shipping_proof' => 'nullable|file|image|mimes:jpeg,jpg,png,webp|max:5120',
            'receiptImage' => 'nullable|file|image|mimes:jpeg,jpg,png,webp|max:5120',
            'shipping_date' => 'nullable|date',
            'shippingDate' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $courierName = $request->input('courier_name') ?? $request->input('courier') ?? 'Royal Express';
        $trackingNumber = $request->input('tracking_number') ?? $request->input('trackingNumber') ?? ('RX-' . rand(1000, 9999) . '-MM');
        $proofFile = $request->file('shippingProof') ?? $request->file('shipping_proof') ?? $request->file('receiptImage');
        $shippingDate = $request->input('shipping_date') ?? $request->input('shippingDate') ?? now()->toDateString();
        $receiverId = ((int) $user->id === (int) $req->requester_id) ? $req->owner_id : $req->requester_id;
        $shipment = Shipment::where('exchange_id', $req->id)
            ->where('sender_id', $user->id)
            ->first();
        $previousProof = $shipment?->shipping_proof;
        $shippingProof = $proofFile?->store('shipping-proofs', 'local');
        if ($proofFile && !$shippingProof) {
            return $this->errorResponse('Could not store courier evidence. Please try again.', 500);
        }

        try {
            DB::transaction(function () use ($req, $user, $receiverId, $courierName, $trackingNumber, $shippingProof, $previousProof, $shippingDate) {
                Shipment::updateOrCreate(
                    [
                        'exchange_id' => $req->id,
                        'sender_id' => $user->id,
                    ],
                    [
                        'receiver_id' => $receiverId,
                        'courier_name' => $courierName,
                        'tracking_number' => $trackingNumber,
                        'shipping_proof' => $shippingProof ?? $previousProof,
                        'shipping_date' => $shippingDate,
                        'shipping_status' => 'Dispatched',
                    ]
                );

                $totalShipments = Shipment::where('exchange_id', $req->id)->count();
                $req->status = $totalShipments >= 2 ? 'In Transit' : 'Shipping';
                $req->save();
            });
        } catch (\Throwable $exception) {
            if ($shippingProof) {
                Storage::disk('local')->delete($shippingProof);
            }
            throw $exception;
        }

        if ($shippingProof && $previousProof && $previousProof !== $shippingProof && str_starts_with($previousProof, 'shipping-proofs/')) {
            Storage::disk('local')->delete($previousProof);
        }

        return $this->successResponse(
            $this->formatExchangeResponse($req->fresh($this->getExchangeRelations()), $user),
            'Shipping waybill recorded successfully.'
        );
    }

    public function shippingEvidence(Request $request, $id, string $partyRole)
    {
        if (!in_array($partyRole, ['partyA', 'partyB'], true)) {
            return $this->errorResponse('Invalid exchange party.', 422);
        }

        $req = $this->findExchange($id);
        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }

        $user = $request->user();
        if ($req->requester_id !== $user->id && $req->owner_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Unauthorized to view courier evidence', 403);
        }

        $senderId = $partyRole === 'partyA' ? $req->requester_id : $req->owner_id;
        $shipment = Shipment::where('exchange_id', $req->id)
            ->where('sender_id', $senderId)
            ->first();
        if (!$shipment?->shipping_proof || !Storage::disk('local')->exists($shipment->shipping_proof)) {
            return $this->errorResponse('Courier evidence not found', 404);
        }

        return Storage::disk('local')->response(
            $shipment->shipping_proof,
            basename($shipment->shipping_proof),
            ['Cache-Control' => 'private, no-store']
        );
    }

    /**
     * Submit Deposit Refund Payout Request (State 6).
     */
    public function requestRefund(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $req = $this->findExchange($id, $this->getExchangeRelations());

        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }

        if ((int) $req->requester_id !== (int) $user->id && (int) $req->owner_id !== (int) $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Unauthorized to request refund', 403);
        }

        if (!$this->requiresIntercityDeposit($req)) {
            return $this->errorResponse('Deposit refunds are only available for intercity courier exchanges.', 422);
        }

        $confirmedUsers = ($req->confirmations ?? collect())->pluck('user_id')->map(fn ($userId) => (int) $userId);
        $bothConfirmed = $confirmedUsers->contains((int) $req->requester_id)
            && $confirmedUsers->contains((int) $req->owner_id);
        if ($req->status !== 'Completed' && !$bothConfirmed) {
            return $this->errorResponse('Both participants must confirm receipt before requesting a deposit refund.', 422);
        }

        $request->merge([
            'walletType' => $request->input('walletType') ?? $request->input('payment_provider'),
            'accountNumber' => trim((string) ($request->input('accountNumber') ?? $request->input('account_number'))),
            'accountName' => trim((string) ($request->input('accountName') ?? $request->input('account_name'))),
        ]);
        $validator = Validator::make($request->all(), [
            'walletType' => 'required|string|in:KBZPay,WavePay,AYA Pay,CB Pay',
            'accountNumber' => 'required|string|max:255',
            'accountName' => 'required|string|max:255',
        ]);
        if ($validator->fails()) {
            return $this->errorResponse('Valid payout details are required.', 422, $validator->errors());
        }

        $payment = ExchangePayment::where('exchange_id', $req->id)
            ->where('payer_id', $user->id)
            ->first();
        if (!$payment || $payment->payment_status !== 'Verified') {
            return $this->errorResponse('Your escrow deposit must be verified before requesting its refund.', 422);
        }

        $existingRefund = Refund::where('exchange_id', $req->id)
            ->where('user_id', $user->id)
            ->first();
        if ($existingRefund?->refund_status === 'Completed') {
            return $this->errorResponse('Your deposit refund has already been completed.', 422);
        }

        Refund::updateOrCreate(
            [
                'exchange_id' => $req->id,
                'user_id' => $user->id,
            ],
            [
                'payment_id' => $payment->id,
                'refund_amount' => $payment->deposit_amount,
                'payment_provider' => $request->input('walletType'),
                'account_number' => $request->input('accountNumber'),
                'account_name' => $request->input('accountName'),
                'refund_status' => 'Processing Payout',
                'refund_date' => null,
            ]
        );

        return $this->successResponse(
            $this->formatExchangeResponse($req->fresh($this->getExchangeRelations()), $user),
            'Deposit refund request submitted and set to Processing Payout.'
        );
    }

    /**
     * Get real exchange history records for authenticated user.
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = ExchangeRequest::with($this->getExchangeRelations())->where(function ($q) use ($user) {
            $q->where('requester_id', $user->id)
              ->orWhere('owner_id', $user->id);
        });

        // Filter out pending proposals if user only wants actual active/past exchanges
        // But include Accepted, Deposit Review, Shipping, In Transit, Completed, etc.
        if ($request->query('all') !== 'true') {
            $query->whereIn('status', [
                'Accepted',
                'Handover In Progress',
                'Deposits Verified',
                'Arrangement Confirmed',
                'In Transit',
                'Deposit Review',
                'Shipping',
                'Partially Received',
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
            'payments.verifiedBy',
            'refunds',
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
        $list->getCollection()->transform(fn (ExchangeRequest $exchange) => $this->formatAdminExchange($exchange));

        return $this->successResponse($list, 'Admin exchange requests retrieved');
    }

    /**
     * Standardized request formatter mapping directly to Frontend contract.
     */
    /**
     * Unified exchange formatter providing consistent attributes across all views.
     */
    private function formatExchangeResponse(ExchangeRequest $req, $user): array
    {
        $userId = ($user instanceof User) ? $user->id : (int) $user;
        $isRequester = ((int) $req->requester_id === $userId);
        $partnerId = $isRequester ? $req->owner_id : $req->requester_id;
        $partnerUser = $isRequester ? $req->owner : $req->requester;

        $type = $isRequester ? 'outgoing' : 'incoming';

        $offeredImg = $req->offeredItem?->images?->where('is_primary', true)->first()?->image_url
            ?? $req->offeredItem?->images?->first()?->image_url
            ?? 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80';

        $requestedImg = $req->requestedItem?->images?->where('is_primary', true)->first()?->image_url
            ?? $req->requestedItem?->images?->first()?->image_url
            ?? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';

        $offeredTownship = $req->offeredItem?->township?->name;
        $offeredRegion = $req->offeredItem?->township?->stateRegion?->name;
        $offeredCity = $offeredTownship && $offeredRegion ? "{$offeredTownship}, {$offeredRegion}" : ($req->offeredItem?->city ?? 'Mandalay (MDY)');

        $requestedTownship = $req->requestedItem?->township?->name;
        $requestedRegion = $req->requestedItem?->township?->stateRegion?->name;
        $requestedCity = $requestedTownship && $requestedRegion ? "{$requestedTownship}, {$requestedRegion}" : ($req->requestedItem?->city ?? 'Yangon (YGN)');

        $isMeetup = str_contains(strtolower($req->exchange_type ?? ''), 'meetup')
            || str_contains(strtolower($req->exchange_type ?? ''), 'in-person')
            || str_contains(strtolower($req->exchange_type ?? ''), 'person');

        $isIntercity = !$isMeetup && (
            str_contains(strtolower($req->exchange_type ?? ''), 'courier')
            || str_contains(strtolower($req->exchange_type ?? ''), 'intercity')
            || ($req->offeredItem?->township?->state_region_id && $req->requestedItem?->township?->state_region_id && $req->offeredItem->township->state_region_id !== $req->requestedItem->township->state_region_id)
        );

        $requesterTownship = $req->requester?->township?->name;
        $requesterRegion = $req->requester?->township?->stateRegion?->name;
        $requesterCity = $requesterTownship && $requesterRegion ? "{$requesterTownship}, {$requesterRegion}" : 'Mandalay';

        $ownerTownship = $req->owner?->township?->name;
        $ownerRegion = $req->owner?->township?->stateRegion?->name;
        $ownerCity = $ownerTownship && $ownerRegion ? "{$ownerTownship}, {$ownerRegion}" : 'Yangon';

        $requesterTelegram = $req->requester?->communicationContacts?->where('platform', 'Telegram')->first()?->contact_value ?? '';
        $requesterViber = $req->requester?->communicationContacts?->where('platform', 'Viber')->first()?->contact_value ?? $req->requester?->phone ?? '';
        $requesterFacebook = $req->requester?->communicationContacts?->where('platform', 'Facebook Messenger')->first()?->contact_value ?? '';

        $ownerTelegram = $req->owner?->communicationContacts?->where('platform', 'Telegram')->first()?->contact_value ?? '';
        $ownerViber = $req->owner?->communicationContacts?->where('platform', 'Viber')->first()?->contact_value ?? $req->owner?->phone ?? '';
        $ownerFacebook = $req->owner?->communicationContacts?->where('platform', 'Facebook Messenger')->first()?->contact_value ?? '';

        // Two-sided confirmations (persistent from receipt_confirmations)
        $confirmations = $req->confirmations ?? collect();
        $requesterConf = $confirmations->where('user_id', $req->requester_id)->first();
        $ownerConf = $confirmations->where('user_id', $req->owner_id)->first();
        $bothConfirmed = ($requesterConf && $ownerConf);

        $hasMyHandoverConfirmed = $isRequester ? (bool)$requesterConf : (bool)$ownerConf;
        $hasPartnerHandoverConfirmed = $isRequester ? (bool)$ownerConf : (bool)$requesterConf;

        // Shipments (persistent from shipments table)
        $shipments = $req->shipments ?? collect();
        $requesterShipment = $shipments->where('sender_id', $req->requester_id)->first();
        $ownerShipment = $shipments->where('sender_id', $req->owner_id)->first();

        // Payments / Deposits
        $payments = $req->payments ?? collect();
        $paymentRequester = $payments->where('payer_id', $req->requester_id)->first();
        $paymentOwner = $payments->where('payer_id', $req->owner_id)->first();
        $myPayment = $isRequester ? $paymentRequester : $paymentOwner;
        $partnerPayment = $isRequester ? $paymentOwner : $paymentRequester;
        $myPaymentStatus = $myPayment?->payment_status;
        $partnerPaymentStatus = $partnerPayment?->payment_status;
        $myPaymentStatus = !$myPaymentStatus || $myPaymentStatus === 'Unpaid' ? 'Pending Payment' : $myPaymentStatus;
        $partnerPaymentStatus = !$partnerPaymentStatus || $partnerPaymentStatus === 'Unpaid' ? 'Pending Payment' : $partnerPaymentStatus;

        $isDepositsVerified = ($paymentRequester?->payment_status === 'Verified') && ($paymentOwner?->payment_status === 'Verified');
        $isArrangementConfirmed = in_array($req->status, ['Arrangement Confirmed', 'Shipping', 'In Transit', 'Partially Received', 'Completed']);
        $isDispatched = $shipments->isNotEmpty() || in_array($req->status, ['Shipping', 'In Transit', 'Partially Received', 'Completed']);
        $isCompleted = ($req->status === 'Completed' || $bothConfirmed);

        // Refunds
        $refunds = $req->refunds ?? collect();
        $refundRequester = $refunds->where('user_id', $req->requester_id)->first();
        $refundOwner = $refunds->where('user_id', $req->owner_id)->first();
        $myRefund = $isRequester ? $refundRequester : $refundOwner;
        $partnerRefund = $isRequester ? $refundOwner : $refundRequester;

        // Effective Status calculation
        $effectiveStatus = $req->status;
        if ($isCompleted) {
            $effectiveStatus = 'Completed';
        } elseif ($isMeetup) {
            if ($bothConfirmed) {
                $effectiveStatus = 'Completed';
            } elseif ($hasMyHandoverConfirmed || $hasPartnerHandoverConfirmed) {
                $effectiveStatus = 'Handover In Progress';
            }
        } elseif ($isIntercity) {
            if ($req->status === 'Accepted') {
                $effectiveStatus = 'Deposit Payment';
            }
        }

        $intercityStage = $bothConfirmed || $isCompleted ? 6 : ($isDispatched ? 5 : ($isArrangementConfirmed ? 4 : ($isDepositsVerified ? 3 : 2)));

        $userName = ($user instanceof User) ? $user->name : ($isRequester ? ($req->requester?->name ?? 'You') : ($req->owner?->name ?? 'You'));

        $myProvidedItem = [
            'id' => $isRequester ? $req->offeredItem?->id : $req->requestedItem?->id,
            'title' => $isRequester ? ($req->offeredItem?->title ?? 'Offered Item') : ($req->requestedItem?->title ?? 'Requested Item'),
            'ownerName' => $userName . ' (You)',
            'ownerCity' => $isRequester ? $offeredCity : $requestedCity,
            'image' => $isRequester ? $offeredImg : $requestedImg,
            'category' => $isRequester ? ($req->offeredItem?->category?->name ?? 'General') : ($req->requestedItem?->category?->name ?? 'General'),
            'condition' => $isRequester ? ($req->offeredItem?->condition ?? 'Good') : ($req->requestedItem?->condition ?? 'Good'),
            'defects' => $isRequester ? ($req->offeredItem?->defects ?? '') : ($req->requestedItem?->defects ?? ''),
        ];

        $partnerReceivedItem = [
            'id' => $isRequester ? $req->requestedItem?->id : $req->offeredItem?->id,
            'title' => $isRequester ? ($req->requestedItem?->title ?? 'Requested Item') : ($req->offeredItem?->title ?? 'Offered Item'),
            'ownerName' => $partnerUser?->name ?? 'Exchange Partner',
            'ownerCity' => $isRequester ? $requestedCity : $offeredCity,
            'image' => $isRequester ? $requestedImg : $offeredImg,
            'category' => $isRequester ? ($req->requestedItem?->category?->name ?? 'General') : ($req->offeredItem?->category?->name ?? 'General'),
            'condition' => $isRequester ? ($req->requestedItem?->condition ?? 'Good') : ($req->offeredItem?->condition ?? 'Good'),
            'defects' => $isRequester ? ($req->requestedItem?->defects ?? '') : ($req->offeredItem?->defects ?? ''),
        ];

        $partyA = [
            'id' => $req->requester_id,
            'name' => $isRequester ? ($userName . ' (You)') : ($req->requester?->name ?? 'Requester'),
            'city' => $requesterCity,
            'phone' => $req->requester?->phone ?? '',
            'telegram' => $requesterTelegram,
            'viber' => $requesterViber,
            'facebook' => $requesterFacebook,
            'communicationContacts' => [
                'telegram' => $requesterTelegram,
                'viber' => $requesterViber,
                'facebook' => $requesterFacebook,
            ],
            'courier' => $requesterShipment?->courier_name ?? 'Royal Express',
            'trackingNumber' => $requesterShipment?->tracking_number ?? '',
            'dispatched' => (bool)$requesterShipment || $isCompleted,
            'shippingDate' => $requesterShipment?->shipping_date ? (is_string($requesterShipment->shipping_date) ? $requesterShipment->shipping_date : $requesterShipment->shipping_date->format('Y-m-d')) : null,
            'receiptImage' => $this->shippingProofReference($requesterShipment?->shipping_proof),
            'hasReceiptImage' => (bool) $requesterShipment?->shipping_proof,
            'confirmedReceipt' => (bool)$requesterConf || $isCompleted,
            'confirmedHandover' => (bool)$requesterConf || $isCompleted,
            'confirmedAt' => $requesterConf?->confirmed_at?->toIso8601String(),
        ];

        $partyB = [
            'id' => $req->owner_id,
            'name' => !$isRequester ? ($userName . ' (You)') : ($req->owner?->name ?? 'Exchange Partner'),
            'city' => $ownerCity,
            'phone' => $req->owner?->phone ?? '',
            'telegram' => $ownerTelegram,
            'viber' => $ownerViber,
            'facebook' => $ownerFacebook,
            'avatar' => $req->owner?->profile_image ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
            'rating' => (float) ($req->owner?->rating ?? 5.0),
            'communicationContacts' => [
                'telegram' => $ownerTelegram,
                'viber' => $ownerViber,
                'facebook' => $ownerFacebook,
            ],
            'courier' => $ownerShipment?->courier_name ?? 'Elite Cargo Express',
            'trackingNumber' => $ownerShipment?->tracking_number ?? '',
            'dispatched' => (bool)$ownerShipment || $isCompleted,
            'shippingDate' => $ownerShipment?->shipping_date ? (is_string($ownerShipment->shipping_date) ? $ownerShipment->shipping_date : $ownerShipment->shipping_date->format('Y-m-d')) : null,
            'receiptImage' => $this->shippingProofReference($ownerShipment?->shipping_proof),
            'hasReceiptImage' => (bool) $ownerShipment?->shipping_proof,
            'confirmedReceipt' => (bool)$ownerConf || $isCompleted,
            'confirmedHandover' => (bool)$ownerConf || $isCompleted,
            'confirmedAt' => $ownerConf?->confirmed_at?->toIso8601String(),
        ];

        $myReview = $req->reviews?->where('reviewer_id', $userId)->first();

        return [
            'id' => $req->id,
            'exchange_code' => $req->exchange_code ?: ('EXC-' . $req->id),
            'code' => $req->exchange_code ?: ('EXC-' . $req->id),
            'exchangeCode' => $req->exchange_code ?: ('EXC-' . $req->id),
            'numericId' => $req->id,
            'type' => $type,
            'status' => $effectiveStatus,
            'isCompleted' => (bool) $isCompleted,
            'isIntercity' => (bool) $isIntercity,
            'isMeetup' => (bool) $isMeetup,
            'intercityStage' => $intercityStage,
            'handoverMethod' => $req->exchange_type ?: ($isIntercity ? 'Intercity Courier Delivery' : 'In-Person Meetup'),
            'exchange_type' => $req->exchange_type ?: ($isIntercity ? 'Intercity Courier Delivery' : 'In-Person Meetup'),
            'notes' => $req->notes ?? '',
            'message' => $req->notes ?? '',
            'meetupLocation' => $req->meetup_location ?? '',
            'meetup_location' => $req->meetup_location ?? '',
            'date' => $req->created_at ? \Carbon\Carbon::parse($req->created_at)->format('Y-m-d H:i') : '',
            'createdAt' => $req->created_at ? \Carbon\Carbon::parse($req->created_at)->toIso8601String() : null,
            'initiatedDate' => $req->created_at ? \Carbon\Carbon::parse($req->created_at)->format('Y-m-d') : 'Recent',
            'completedDate' => $req->completed_at ? \Carbon\Carbon::parse($req->completed_at)->format('Y-m-d') : ($isCompleted && $req->updated_at ? \Carbon\Carbon::parse($req->updated_at)->format('Y-m-d') : null),
            'completed_at' => $req->completed_at ? \Carbon\Carbon::parse($req->completed_at)->toIso8601String() : null,
            'hasMyHandoverConfirmed' => $hasMyHandoverConfirmed,
            'hasPartnerHandoverConfirmed' => $hasPartnerHandoverConfirmed,
            'hasMyReceiptConfirmed' => $hasMyHandoverConfirmed,
            'hasPartnerReceiptConfirmed' => $hasPartnerHandoverConfirmed,
            'bothConfirmed' => $bothConfirmed,
            'itemA' => $myProvidedItem,
            'itemB' => $partnerReceivedItem,
            'partyA' => $partyA,
            'partyB' => $partyB,
            'requester' => [
                'id' => $req->requester?->id,
                'name' => $req->requester?->name ?? 'Requester',
                'city' => $requesterCity,
                'phone' => $req->requester?->phone ?? '',
                'avatar' => $req->requester?->profile_image,
                'rating' => (float) ($req->requester?->rating ?? 5.0),
                'telegram' => $requesterTelegram,
                'viber' => $requesterViber,
                'facebook' => $requesterFacebook,
            ],
            'recipient' => [
                'id' => $req->owner?->id,
                'name' => $req->owner?->name ?? 'Owner',
                'city' => $ownerCity,
                'phone' => $req->owner?->phone ?? '',
                'avatar' => $req->owner?->profile_image,
                'rating' => (float) ($req->owner?->rating ?? 5.0),
                'telegram' => $ownerTelegram,
                'viber' => $ownerViber,
                'facebook' => $ownerFacebook,
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
            'deposits' => [
                'partyA' => [
                    'itemTitle' => $myProvidedItem['title'],
                    'category' => $myProvidedItem['category'],
                    'amount' => $myPayment?->deposit_amount ?? 50000,
                    'status' => $myPaymentStatus,
                    'paymentMethod' => $myPayment?->payment_method,
                    'referenceNumber' => $myPayment?->reference_number ?? '',
                    'slipImage' => null,
                    'submittedAt' => $myPayment?->created_at?->format('Y-m-d H:i'),
                    'verifiedAt' => $myPayment?->verified_at?->format('Y-m-d H:i'),
                    'verifiedBy' => $myPayment?->verifiedBy?->name,
                    'rejectionReason' => $myPayment?->rejection_reason,
                ],
                'partyB' => [
                    'itemTitle' => $partnerReceivedItem['title'],
                    'category' => $partnerReceivedItem['category'],
                    'amount' => $partnerPayment?->deposit_amount ?? 50000,
                    'status' => $partnerPaymentStatus,
                    'paymentMethod' => $partnerPayment?->payment_method,
                    'referenceNumber' => $partnerPayment?->reference_number ?? '',
                    'slipImage' => null,
                    'submittedAt' => $partnerPayment?->created_at?->format('Y-m-d H:i'),
                    'verifiedAt' => $partnerPayment?->verified_at?->format('Y-m-d H:i'),
                    'verifiedBy' => $partnerPayment?->verifiedBy?->name,
                    'rejectionReason' => $partnerPayment?->rejection_reason,
                ],
            ],
            'courierArrangement' => [
                'confirmed' => $isArrangementConfirmed,
                'confirmedAt' => $isArrangementConfirmed ? ($req->created_at ? $req->created_at->format('Y-m-d') : 'Today') : null,
            ],
            'refundWorkflow' => [
                'initiated' => $isCompleted,
                'status' => $isCompleted ? 'Refund Processed' : 'Locked',
                'partyA' => [
                    'amount' => $myRefund?->refund_amount ?? ($myPayment?->deposit_amount ?? 50000),
                    'walletType' => $myRefund?->payment_provider ?? 'KBZPay',
                    'accountNumber' => $myRefund?->account_number ?? ($isRequester ? $req->requester?->phone : $req->owner?->phone) ?? '',
                    'accountName' => $myRefund?->account_name ?? ($isRequester ? $req->requester?->name : $req->owner?->name) ?? '',
                    'status' => $myRefund?->refund_status ?? ($isCompleted ? 'Pending Details' : 'Locked'),
                    'transactionRef' => $myRefund?->refund_transaction_ref,
                ],
                'partyB' => [
                    'amount' => $partnerRefund?->refund_amount ?? ($partnerPayment?->deposit_amount ?? 50000),
                    'walletType' => $partnerRefund?->payment_provider ?? 'KBZPay',
                    'accountNumber' => $partnerRefund?->account_number ?? ($isRequester ? $req->owner?->phone : $req->requester?->phone) ?? '',
                    'accountName' => $partnerRefund?->account_name ?? ($isRequester ? $req->owner?->name : $req->requester?->name) ?? '',
                    'status' => $partnerRefund?->refund_status ?? ($isCompleted ? 'Pending Details' : 'Locked'),
                    'transactionRef' => $partnerRefund?->refund_transaction_ref,
                ],
            ],
            'reviewGiven' => $myReview ? [
                'rating' => $myReview->rating,
                'comment' => $myReview->comment,
            ] : null,
        ];
    }

    private function shippingProofReference(?string $proof): ?string
    {
        if ($proof && (
            filter_var($proof, FILTER_VALIDATE_URL) ||
            str_starts_with($proof, 'data:image/') ||
            str_starts_with($proof, '/storage/')
        )) {
            return $proof;
        }

        return null;
    }

    /**
     * Standardized request formatter mapping directly to Frontend contract.
     */
    private function formatRequest(ExchangeRequest $req, int $currentUserId): array
    {
        return $this->formatExchangeResponse($req, $currentUserId);
    }

    /**
     * Standardized Exchange History item formatter matching Frontend contract.
     */
    private function formatExchangeHistoryItem(ExchangeRequest $exc, User $user): array
    {
        return $this->formatExchangeResponse($exc, $user);
    }

    public function submitDeposit(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $request->merge([
            'referenceNumber' => trim((string) $request->input('referenceNumber')),
        ]);

        $validator = Validator::make($request->all(), [
            'paymentMethod' => 'required|string|in:KBZPay,WavePay,AYA Pay',
            'referenceNumber' => 'required|string|max:255',
            'slipImage' => 'required|file|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $req = $this->findExchange($id, ['offeredItem.category', 'requestedItem.category']);
        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }

        if (!$this->requiresIntercityDeposit($req)) {
            return $this->errorResponse('Escrow deposit is only required for Intercity Courier Delivery exchanges. In-person meetups do not require deposit payments.', 422);
        }

        if (!in_array($req->status, ['Accepted', 'Deposit Review', 'Deposit Payment Required', 'Deposit Payment'], true)) {
            return $this->errorResponse('Deposits can only be submitted for an accepted exchange awaiting payment review.', 422);
        }

        if ((int) $req->requester_id !== (int) $user->id && (int) $req->owner_id !== (int) $user->id) {
            return $this->errorResponse('Unauthorized to submit deposit for this exchange', 403);
        }

        $isRequester = ((int) $req->requester_id === (int) $user->id);
        $item = $isRequester ? $req->offeredItem : $req->requestedItem;
        $depositAmount = $item?->category?->deposit_amount ?? 50000;
        $payment = ExchangePayment::where('exchange_id', $req->id)
            ->where('payer_id', $user->id)
            ->first();

        if ($payment && !in_array($payment->payment_status, ['Unpaid', 'Pending Payment', 'Rejected'], true)) {
            return $this->errorResponse('A deposit payment is already submitted or verified.', 422);
        }

        $proofPath = $request->file('slipImage')->store('deposit-slips', 'local');
        if (!$proofPath) {
            return $this->errorResponse('Could not store payment evidence. Please try again.', 500);
        }

        $previousProof = $payment?->payment_proof;
        try {
            $payment = DB::transaction(function () use ($payment, $req, $user, $item, $depositAmount, $request, $proofPath) {
                $payment = $payment
                    ? ExchangePayment::whereKey($payment->id)->lockForUpdate()->first()
                    : null;

                if ($payment && !in_array($payment->payment_status, ['Unpaid', 'Pending Payment', 'Rejected'], true)) {
                    throw new \RuntimeException('A deposit payment is already submitted or verified.');
                }

                $payment ??= new ExchangePayment([
                    'exchange_id' => $req->id,
                    'payer_id' => $user->id,
                ]);
                $payment->category_id = $item?->category_id;
                $payment->deposit_amount = $depositAmount;
                $payment->payment_method = $request->input('paymentMethod');
                $payment->reference_number = $request->input('referenceNumber');
                $payment->payment_proof = $proofPath;
                $payment->payment_status = 'Payment Submitted';
                $payment->rejection_reason = null;
                $payment->verified_at = null;
                $payment->verified_by = null;
                $payment->save();

                return $payment;
            });
        } catch (\RuntimeException $exception) {
            Storage::disk('local')->delete($proofPath);
            return $this->errorResponse($exception->getMessage(), 422);
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($proofPath);
            throw $exception;
        }

        if ($previousProof && $previousProof !== $proofPath) {
            Storage::disk('local')->delete($previousProof);
        }

        if (in_array($req->status, ['Accepted', 'Deposit Payment Required', 'Deposit Payment'])) {
            $req->status = 'Deposit Review';
            $req->save();
        }

        return $this->successResponse(
            $this->formatExchangeResponse($req->fresh($this->getExchangeRelations()), $user),
            'Escrow deposit payment proof submitted. Awaiting platform administrator verification.'
        );
    }

    /**
     * Admin: Get single exchange details for inspection and deposit audit.
     */
    public function adminShow($id): JsonResponse
    {
        $cleanId = str_replace('#', '', $id);
        $req = $this->findExchange($cleanId, [
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
            'payments.verifiedBy',
            'refunds',
            'reviews',
        ]);
        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }

        return $this->successResponse($this->formatAdminExchange($req), 'Admin exchange retrieved');
    }

    /**
     * Admin: List pending and verified deposit slips for Intercity Courier Delivery exchanges only.
     */
    public function adminPendingDeposits(Request $request): JsonResponse
    {
        $query = ExchangePayment::with([
            'exchange.requester',
            'exchange.owner',
            'exchange.offeredItem.category',
            'exchange.requestedItem.category',
            'payer',
            'category'
        ])->whereHas('exchange', function ($q) {
            $q->where(function ($sub) {
                $sub->where('exchange_type', 'like', '%intercity%')
                    ->orWhere('exchange_type', 'like', '%courier%')
                    ->orWhere('exchange_type', 'like', '%express%');
            })->where('exchange_type', 'not like', '%meetup%')
              ->where('exchange_type', 'not like', '%in-person%');
        });

        $query->whereIn('payment_status', ['Payment Submitted', 'Verified'])
            ->whereNotNull('payment_proof');

        $payments = $query->orderBy('updated_at', 'desc')->get();

        $list = $payments->map(function ($payment) {
            $exc = $payment->exchange;
            $isPartyA = ($payment->payer_id === $exc?->requester_id);
            $item = $isPartyA ? $exc?->offeredItem : $exc?->requestedItem;

            return [
                'id' => 'DEP-' . $payment->id,
                'numericId' => $payment->id,
                'exchangeId' => $exc?->id,
                'exchangeCode' => $exc?->exchange_code ?: ('EXC-' . $exc?->id),
                'exchangeNumericId' => $exc?->id,
                'partyRole' => $isPartyA ? 'partyA' : 'partyB',
                'payerId' => $payment->payer_id,
                'memberName' => $payment->payer?->name ?? ($isPartyA ? 'Requester' : 'Owner'),
                'itemTitle' => $item?->title ?? 'Intercity Item',
                'category' => $payment->category?->name ?? ($item?->category?->name ?? 'General'),
                'amount' => (float) $payment->deposit_amount,
                'paymentMethod' => $payment->payment_method ?? 'KBZPay',
                'referenceNumber' => $payment->reference_number ?? 'Pending Ref',
                'slipImage' => $this->adminPaymentEvidencePath($exc->id, $isPartyA ? 'partyA' : 'partyB', $payment->payment_proof),
                'status' => $payment->payment_status === 'Verified' ? 'Verified' : ($payment->payment_status === 'Payment Submitted' ? 'Pending' : $payment->payment_status),
                'rawStatus' => $payment->payment_status,
                'submittedAt' => $payment->updated_at ? $payment->updated_at->format('Y-m-d H:i') : 'Recent',
                'verifiedAt' => $payment->verified_at ? $payment->verified_at->format('Y-m-d H:i') : null,
            ];
        });

        return $this->successResponse($list, 'Pending deposits for intercity exchanges retrieved');
    }

    public function adminDepositEvidence($id, string $partyRole)
    {
        if (!in_array($partyRole, ['partyA', 'partyB'], true)) {
            return $this->errorResponse('Invalid deposit participant.', 422);
        }

        $req = $this->findExchange($id);
        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }

        $payerId = $partyRole === 'partyA' ? $req->requester_id : $req->owner_id;
        $payment = ExchangePayment::where('exchange_id', $req->id)
            ->where('payer_id', $payerId)
            ->first();

        if (!$payment?->payment_proof || !Storage::disk('local')->exists($payment->payment_proof)) {
            return $this->errorResponse('Payment evidence not found.', 404);
        }

        return Storage::disk('local')->response(
            $payment->payment_proof,
            basename($payment->payment_proof),
            ['Cache-Control' => 'private, no-store']
        );
    }

    /**
     * Admin: Approve an escrow deposit payment slip (Intercity Courier Delivery only).
     */
    public function adminApproveDeposit(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'partyRole' => 'required|in:partyA,partyB',
        ]);
        if ($validator->fails()) {
            return $this->errorResponse('Invalid deposit participant.', 422, $validator->errors());
        }

        $cleanId = str_replace('#', '', $id);
        $req = $this->findExchange($cleanId, [
            'payments.payer',
            'offeredItem.category',
            'requestedItem.category',
            'requester',
            'owner'
        ]);

        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }

        // STRICT VALIDATION: Only Intercity Courier Delivery type needs escrow deposits!
        if (!$this->requiresIntercityDeposit($req)) {
            return $this->errorResponse('Deposit approval is only applicable for Intercity Courier Delivery type. Sending to another city requires deposit, but in-person meetups do not require deposit payments.', 422);
        }

        $partyRole = $request->input('partyRole');
        $payerId = ($partyRole === 'partyA') ? $req->requester_id : $req->owner_id;

        $payment = ExchangePayment::where('exchange_id', $req->id)
            ->where('payer_id', $payerId)
            ->first();
        if (!$payment || $payment->payment_status !== 'Payment Submitted') {
            return $this->errorResponse('Only a submitted deposit payment can be approved.', 422);
        }
        if (!$payment->payment_proof || !Storage::disk('local')->exists($payment->payment_proof)) {
            return $this->errorResponse('Payment evidence is missing. The member must submit a valid payment slip before approval.', 422);
        }

        try {
            DB::transaction(function () use ($payment, $req, $request) {
                $lockedExchange = ExchangeRequest::whereKey($req->id)->lockForUpdate()->first();
                $lockedPayment = ExchangePayment::whereKey($payment->id)->lockForUpdate()->first();
                if (!$lockedExchange || !$lockedPayment || $lockedPayment->payment_status !== 'Payment Submitted') {
                    throw new \RuntimeException('This deposit submission has already been reviewed.');
                }

                if (!$lockedPayment->payment_proof || !Storage::disk('local')->exists($lockedPayment->payment_proof)) {
                    throw new \RuntimeException('Payment evidence is missing. The member must submit a valid payment slip before approval.');
                }

                $lockedPayment->payment_status = 'Verified';
                $lockedPayment->verified_at = now();
                $lockedPayment->verified_by = $request->user()->id;
                $lockedPayment->rejection_reason = null;
                $lockedPayment->save();

                $verifiedPayers = ExchangePayment::where('exchange_id', $lockedExchange->id)
                    ->where('payment_status', 'Verified')
                    ->pluck('payer_id');
                if ($verifiedPayers->contains($lockedExchange->requester_id) && $verifiedPayers->contains($lockedExchange->owner_id)) {
                    $lockedExchange->status = 'Deposits Verified';
                    $lockedExchange->save();
                }
            });
        } catch (\RuntimeException $exception) {
            return $this->errorResponse($exception->getMessage(), 422);
        }

        $req->refresh()->load([
            'requester.township.stateRegion', 'requester.communicationContacts',
            'owner.township.stateRegion', 'owner.communicationContacts',
            'offeredItem.category', 'offeredItem.images',
            'requestedItem.category', 'requestedItem.images',
            'payments.payer', 'payments.verifiedBy'
        ]);

        return $this->successResponse($this->formatAdminExchange($req), 'Escrow deposit payment verified successfully');
    }

    /**
     * Admin: Reject an escrow deposit payment slip (Intercity Courier Delivery only).
     */
    public function adminRejectDeposit(Request $request, $id): JsonResponse
    {
        $request->merge([
            'reason' => trim((string) $request->input('reason')),
        ]);
        $validator = Validator::make($request->all(), [
            'partyRole' => 'required|in:partyA,partyB',
            'reason' => 'required|string|min:3|max:1000',
        ]);
        if ($validator->fails()) {
            return $this->errorResponse('A valid participant and rejection reason are required.', 422, $validator->errors());
        }

        $cleanId = str_replace('#', '', $id);
        $req = $this->findExchange($cleanId, ['payments', 'requester', 'owner']);

        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }

        // STRICT VALIDATION: Only Intercity Courier Delivery type has deposits!
        if (!$this->requiresIntercityDeposit($req)) {
            return $this->errorResponse('Deposit operations are only applicable for Intercity Courier Delivery type.', 422);
        }

        $partyRole = $request->input('partyRole');
        $payerId = ($partyRole === 'partyA') ? $req->requester_id : $req->owner_id;

        $payment = ExchangePayment::where('exchange_id', $req->id)
            ->where('payer_id', $payerId)
            ->first();

        if (!$payment || $payment->payment_status !== 'Payment Submitted') {
            return $this->errorResponse('Only a submitted deposit payment can be rejected.', 422);
        }

        try {
            DB::transaction(function () use ($payment, $request) {
                $lockedPayment = ExchangePayment::whereKey($payment->id)->lockForUpdate()->first();
                if (!$lockedPayment || $lockedPayment->payment_status !== 'Payment Submitted') {
                    throw new \RuntimeException('This deposit submission has already been reviewed.');
                }

                $lockedPayment->payment_status = 'Rejected';
                $lockedPayment->rejection_reason = trim($request->input('reason'));
                $lockedPayment->save();
            });
        } catch (\RuntimeException $exception) {
            return $this->errorResponse($exception->getMessage(), 422);
        }

        $req->refresh()->load([
            'requester.township.stateRegion', 'requester.communicationContacts',
            'owner.township.stateRegion', 'owner.communicationContacts',
            'offeredItem.category', 'offeredItem.images',
            'requestedItem.category', 'requestedItem.images',
            'payments.payer', 'payments.verifiedBy'
        ]);

        return $this->successResponse($this->formatAdminExchange($req), 'Deposit slip marked as rejected');
    }

    /**
     * Admin: Process escrow deposit refund payout.
     */
    public function adminProcessRefund(Request $request, $id): JsonResponse
    {
        $request->merge([
            'txRef' => trim((string) ($request->input('txRef') ?? $request->input('refund_transaction_ref'))),
        ]);
        $validator = Validator::make($request->all(), [
            'partyRole' => 'required|in:partyA,partyB',
            'txRef' => 'required|string|max:255',
        ]);
        if ($validator->fails()) {
            return $this->errorResponse('A valid participant and payout transaction reference are required.', 422, $validator->errors());
        }

        $cleanId = str_replace('#', '', $id);
        $req = $this->findExchange($cleanId, [
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
            'payments.verifiedBy',
            'refunds',
        ]);
        if (!$req) {
            return $this->errorResponse('Exchange record not found', 404);
        }
        if ($req->status !== 'Completed') {
            return $this->errorResponse('Refunds can only be released after the exchange is completed.', 422);
        }

        $partyRole = $request->input('partyRole');
        $payerId = $partyRole === 'partyA' ? $req->requester_id : $req->owner_id;
        $payment = ExchangePayment::where('exchange_id', $req->id)
            ->where('payer_id', $payerId)
            ->where('payment_status', 'Verified')
            ->first();
        $refund = Refund::where('exchange_id', $req->id)
            ->where('user_id', $payerId)
            ->first();
        if (!$payment || !$refund || $refund->refund_status !== 'Processing Payout') {
            return $this->errorResponse('Only a verified deposit with a submitted refund request can be released.', 422);
        }
        if (!$refund->account_number || !$refund->account_name) {
            return $this->errorResponse('The member must submit payout account details before release.', 422);
        }

        try {
            DB::transaction(function () use ($req, $payerId, $request) {
                $lockedRefund = Refund::where('exchange_id', $req->id)
                    ->where('user_id', $payerId)
                    ->lockForUpdate()
                    ->first();
                if (!$lockedRefund || $lockedRefund->refund_status !== 'Processing Payout') {
                    throw new \RuntimeException('This refund request has already been processed.');
                }

                $lockedRefund->refund_status = 'Completed';
                $lockedRefund->refund_transaction_ref = $request->input('txRef');
                $lockedRefund->refund_date = now();
                $lockedRefund->save();
            });
        } catch (\RuntimeException $exception) {
            return $this->errorResponse($exception->getMessage(), 422);
        }

        $req->refresh()->load([
            'requester.township.stateRegion', 'requester.communicationContacts',
            'owner.township.stateRegion', 'owner.communicationContacts',
            'offeredItem.category', 'offeredItem.images',
            'requestedItem.category', 'requestedItem.images',
            'payments.payer', 'payments.verifiedBy',
            'refunds',
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
        $refundA = $exc->refunds->where('user_id', $exc->requester_id)->first();
        $refundB = $exc->refunds->where('user_id', $exc->owner_id)->first();

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
                    'status' => $paymentA?->payment_status ?? 'Pending Payment',
                    'paymentMethod' => $paymentA?->payment_method ?? 'KBZPay',
                    'referenceNumber' => $paymentA?->reference_number ?? '',
                    'slipImage' => $this->adminPaymentEvidencePath($exc->id, 'partyA', $paymentA?->payment_proof),
                    'submittedAt' => $paymentA?->created_at?->format('Y-m-d H:i'),
                    'verifiedAt' => $paymentA?->verified_at?->format('Y-m-d H:i'),
                    'verifiedBy' => $paymentA?->verifiedBy?->name,
                    'rejectionReason' => $paymentA?->rejection_reason,
                ],
                'partyB' => [
                    'amount' => $paymentB?->deposit_amount ?? $partyBAmount,
                    'status' => $paymentB?->payment_status ?? 'Pending Payment',
                    'paymentMethod' => $paymentB?->payment_method ?? 'WavePay',
                    'referenceNumber' => $paymentB?->reference_number ?? '',
                    'slipImage' => $this->adminPaymentEvidencePath($exc->id, 'partyB', $paymentB?->payment_proof),
                    'submittedAt' => $paymentB?->created_at?->format('Y-m-d H:i'),
                    'verifiedAt' => $paymentB?->verified_at?->format('Y-m-d H:i'),
                    'verifiedBy' => $paymentB?->verifiedBy?->name,
                    'rejectionReason' => $paymentB?->rejection_reason,
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
                    'amount' => $refundA?->refund_amount ?? ($paymentA?->deposit_amount ?? $partyAAmount),
                    'status' => $refundA?->refund_status ?? ($isCompleted ? 'Pending Details' : 'Locked'),
                    'accountNumber' => $refundA?->account_number ?? '',
                    'accountName' => $refundA?->account_name ?? '',
                    'paymentProvider' => $refundA?->payment_provider ?? 'KBZPay',
                    'walletType' => $refundA?->payment_provider ?? 'KBZPay',
                    'refundTransactionRef' => $refundA?->refund_transaction_ref,
                    'transactionRef' => $refundA?->refund_transaction_ref,
                    'completedAt' => $refundA?->refund_date?->format('Y-m-d H:i'),
                ],
                'partyB' => [
                    'amount' => $refundB?->refund_amount ?? ($paymentB?->deposit_amount ?? $partyBAmount),
                    'status' => $refundB?->refund_status ?? ($isCompleted ? 'Pending Details' : 'Locked'),
                    'accountNumber' => $refundB?->account_number ?? '',
                    'accountName' => $refundB?->account_name ?? '',
                    'paymentProvider' => $refundB?->payment_provider ?? 'KBZPay',
                    'walletType' => $refundB?->payment_provider ?? 'KBZPay',
                    'refundTransactionRef' => $refundB?->refund_transaction_ref,
                    'transactionRef' => $refundB?->refund_transaction_ref,
                    'completedAt' => $refundB?->refund_date?->format('Y-m-d H:i'),
                ],
            ],
            'history' => $history,
        ];
    }
}
