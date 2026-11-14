<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ExchangeRequest;
use App\Models\Item;
use App\Models\Review;
use App\Models\StateRegion;
use App\Models\Township;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicTestimonialsTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_testimonials_use_reviews_from_completed_exchanges_only(): void
    {
        $region = StateRegion::create(['name' => 'Mandalay Region']);
        $township = Township::create([
            'state_region_id' => $region->id,
            'name' => 'Chanayethazan',
        ]);
        $reviewer = User::factory()->create([
            'name' => 'Real Member',
            'township_id' => $township->id,
            'profile_image' => 'https://example.test/member.png',
            'phone' => '09123456789',
        ]);
        $partner = User::factory()->create(['name' => 'Exchange Partner']);
        $category = Category::create([
            'name' => 'Books',
            'slug' => 'books',
            'deposit_amount' => 10000,
        ]);
        $offeredItem = Item::create([
            'user_id' => $reviewer->id,
            'category_id' => $category->id,
            'title' => 'Textbook',
            'description' => 'A used textbook',
        ]);
        $requestedItem = Item::create([
            'user_id' => $partner->id,
            'category_id' => $category->id,
            'title' => 'Coffee Set',
            'description' => 'A ceramic coffee set',
        ]);

        $completedExchange = ExchangeRequest::create([
            'exchange_code' => 'EXC-TEST-1',
            'requester_id' => $reviewer->id,
            'owner_id' => $partner->id,
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $requestedItem->id,
            'status' => 'Completed',
        ]);
        Review::create([
            'exchange_id' => $completedExchange->id,
            'reviewer_id' => $reviewer->id,
            'reviewed_user_id' => $partner->id,
            'rating' => 5,
            'comment' => 'The exchange was smooth.',
        ]);

        $uncommentedReviewExchange = ExchangeRequest::create([
            'exchange_code' => 'EXC-TEST-2',
            'requester_id' => $reviewer->id,
            'owner_id' => $partner->id,
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $requestedItem->id,
            'status' => 'Completed',
        ]);
        Review::create([
            'exchange_id' => $uncommentedReviewExchange->id,
            'reviewer_id' => $reviewer->id,
            'reviewed_user_id' => $partner->id,
            'rating' => 4,
        ]);

        $pendingExchange = ExchangeRequest::create([
            'exchange_code' => 'EXC-TEST-3',
            'requester_id' => $reviewer->id,
            'owner_id' => $partner->id,
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $requestedItem->id,
            'status' => 'Pending',
        ]);
        Review::create([
            'exchange_id' => $pendingExchange->id,
            'reviewer_id' => $reviewer->id,
            'reviewed_user_id' => $partner->id,
            'rating' => 1,
            'comment' => 'This should not be public.',
        ]);

        $this->getJson('/api/testimonials')
            ->assertOk()
            ->assertJsonPath('data.averageRating', 4.5)
            ->assertJsonPath('data.reviewCount', 2)
            ->assertJsonCount(1, 'data.reviews')
            ->assertJsonPath('data.reviews.0.name', 'Real Member')
            ->assertJsonPath('data.reviews.0.city', 'Chanayethazan, Mandalay Region')
            ->assertJsonPath('data.reviews.0.exchangeSummary', 'Swapped Textbook for Coffee Set')
            ->assertJsonPath('data.reviews.0.comment', 'The exchange was smooth.')
            ->assertJsonMissingPath('data.reviews.0.phone')
            ->assertJsonMissingPath('data.reviews.1');
    }

    public function test_homepage_testimonials_return_empty_values_when_there_are_no_reviews(): void
    {
        $this->getJson('/api/testimonials')
            ->assertOk()
            ->assertJsonPath('data.averageRating', null)
            ->assertJsonPath('data.reviewCount', 0)
            ->assertJsonCount(0, 'data.reviews');
    }
}
