<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ExchangeRequest;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ItemExchangeAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_request_reserves_both_items_until_the_request_is_declined(): void
    {
        [$requester, $owner, $offeredItem, $requestedItem, $otherItem] = $this->createItems();
        Sanctum::actingAs($requester);

        $response = $this->postJson('/api/exchange-requests', [
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $requestedItem->id,
            'exchange_type' => 'In-Person Meetup',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'Pending');

        $requestId = $response->json('data.id');
        $this->assertDatabaseHas('items', ['id' => $offeredItem->id, 'availability_status' => 'In Exchange']);
        $this->assertDatabaseHas('items', ['id' => $requestedItem->id, 'availability_status' => 'In Exchange']);
        $this->getJson('/api/items?per_page=50')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.id', $otherItem->id);
        $this->getJson('/api/my-items')
            ->assertOk()
            ->assertJsonPath('data.0.availability_status', 'In Exchange');

        $this->postJson('/api/exchange-requests', [
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $otherItem->id,
            'exchange_type' => 'In-Person Meetup',
        ])->assertUnprocessable();
        $this->assertDatabaseCount('exchange_requests', 1);

        Sanctum::actingAs($owner);
        $this->postJson("/api/exchange-requests/{$requestId}/reject")
            ->assertOk()
            ->assertJsonPath('data.status', 'Rejected');

        $this->assertDatabaseHas('items', ['id' => $offeredItem->id, 'availability_status' => 'Available']);
        $this->assertDatabaseHas('items', ['id' => $requestedItem->id, 'availability_status' => 'Available']);
        $this->getJson('/api/items?per_page=50')
            ->assertOk()
            ->assertJsonPath('data.total', 3);

        Sanctum::actingAs($requester);
        $this->postJson('/api/exchange-requests', [
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $requestedItem->id,
            'exchange_type' => 'In-Person Meetup',
        ])->assertCreated();
    }

    public function test_completed_exchange_marks_both_items_not_available(): void
    {
        [$requester, $owner, $offeredItem, $requestedItem, $otherItem] = $this->createItems();
        Sanctum::actingAs($requester);

        $requestId = $this->postJson('/api/exchange-requests', [
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $requestedItem->id,
            'exchange_type' => 'In-Person Meetup',
        ])->assertCreated()->json('data.id');

        Sanctum::actingAs($owner);
        $this->postJson("/api/exchange-requests/{$requestId}/accept")
            ->assertOk()
            ->assertJsonPath('data.status', 'Accepted');

        Sanctum::actingAs($requester);
        $this->postJson("/api/exchanges/{$requestId}/complete")->assertOk();
        $this->assertDatabaseHas('items', ['id' => $offeredItem->id, 'availability_status' => 'In Exchange']);

        Sanctum::actingAs($owner);
        $this->postJson("/api/exchanges/{$requestId}/complete")
            ->assertOk()
            ->assertJsonPath('data.status', 'Completed');

        $this->assertDatabaseHas('items', ['id' => $offeredItem->id, 'availability_status' => 'Not Available']);
        $this->assertDatabaseHas('items', ['id' => $requestedItem->id, 'availability_status' => 'Not Available']);
        $this->getJson('/api/items?per_page=50')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.id', $otherItem->id);
    }

    public function test_existing_open_requests_hide_items_and_show_them_as_in_exchange(): void
    {
        [$requester, $owner, $offeredItem, $requestedItem, $otherItem] = $this->createItems();
        ExchangeRequest::create([
            'exchange_code' => 'EXC-LEGACY-1',
            'requester_id' => $requester->id,
            'owner_id' => $owner->id,
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $requestedItem->id,
            'status' => 'Pending',
        ]);
        Sanctum::actingAs($requester);

        $this->getJson('/api/items?per_page=50')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.id', $otherItem->id);
        $this->getJson('/api/my-items')
            ->assertOk()
            ->assertJsonPath('data.0.availability_status', 'In Exchange');
        $this->getJson("/api/items/{$offeredItem->id}")
            ->assertOk()
            ->assertJsonPath('data.availability_status', 'In Exchange');
    }

    private function createItems(): array
    {
        $requester = User::factory()->create(['name' => 'Requester']);
        $owner = User::factory()->create(['name' => 'Owner']);
        $otherOwner = User::factory()->create(['name' => 'Other Owner']);
        $category = Category::create([
            'name' => 'Books',
            'slug' => 'books',
            'deposit_amount' => 10000,
        ]);

        $offeredItem = $this->createItem($requester, $category, 'Offered book');
        $requestedItem = $this->createItem($owner, $category, 'Requested book');
        $otherItem = $this->createItem($otherOwner, $category, 'Other book');

        return [$requester, $owner, $offeredItem, $requestedItem, $otherItem];
    }

    private function createItem(User $owner, Category $category, string $title): Item
    {
        return Item::create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => $title,
            'description' => $title,
            'availability_status' => 'Available',
        ]);
    }
}
