<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    use ApiResponse;

    public function testimonials(): JsonResponse
    {
        $completedReviews = Review::query()
            ->whereHas('exchange', fn ($query) => $query->where('status', 'Completed'));

        $averageRating = (clone $completedReviews)->avg('rating');
        $reviewCount = (clone $completedReviews)->count();

        $reviews = (clone $completedReviews)
            ->whereNotNull('comment')
            ->where('comment', '<>', '')
            ->with([
                'reviewer:id,name,profile_image,township_id',
                'reviewer.township:id,name,state_region_id',
                'reviewer.township.stateRegion:id,name',
                'exchange:id,requester_id,offered_item_id,requested_item_id',
                'exchange.offeredItem:id,title',
                'exchange.requestedItem:id,title',
            ])
            ->latest()
            ->limit(3)
            ->get()
            ->map(function (Review $review): array {
                $exchange = $review->exchange;
                $isRequester = $exchange?->requester_id === $review->reviewer_id;
                $givenItem = $isRequester ? $exchange?->offeredItem : $exchange?->requestedItem;
                $receivedItem = $isRequester ? $exchange?->requestedItem : $exchange?->offeredItem;
                $township = $review->reviewer?->township;
                $city = collect([$township?->name, $township?->stateRegion?->name])
                    ->filter()
                    ->implode(', ');

                return [
                    'id' => $review->id,
                    'name' => $review->reviewer?->name ?? 'Community Member',
                    'city' => $city ?: 'Myanmar',
                    'avatar' => $review->reviewer?->profile_image,
                    'rating' => $review->rating,
                    'exchangeSummary' => $givenItem && $receivedItem
                        ? "Swapped {$givenItem->title} for {$receivedItem->title}"
                        : 'Completed community exchange',
                    'comment' => $review->comment,
                ];
            })
            ->values();

        return $this->successResponse([
            'averageRating' => $averageRating === null ? null : round((float) $averageRating, 1),
            'reviewCount' => $reviewCount,
            'reviews' => $reviews,
        ], 'Community testimonials retrieved');
    }
}
