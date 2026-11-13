<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Item;
use App\Models\ItemImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminMembersTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_members_with_current_listing_details(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $member = User::factory()->create(['role' => 'user']);
        $category = Category::create([
            'name' => 'Books',
            'slug' => 'books',
            'deposit_amount' => 10000,
        ]);
        $item = Item::create([
            'user_id' => $member->id,
            'category_id' => $category->id,
            'title' => 'Used novel',
            'description' => 'A book listing',
        ]);
        ItemImage::create([
            'item_id' => $item->id,
            'image_url' => 'https://example.test/book.png',
            'is_primary' => true,
        ]);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/members')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $member->id)
            ->assertJsonPath('data.0.itemsCount', 1)
            ->assertJsonPath('data.0.items.0.title', 'Used novel')
            ->assertJsonPath('data.0.items.0.image', 'https://example.test/book.png');
    }

    public function test_admin_can_suspend_and_reactivate_a_member_and_invalid_status_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $member = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/members/{$member->id}/status", [
            'status' => 'Suspended',
            'suspension_reason' => 'Repeated reports',
        ])->assertOk()
            ->assertJsonPath('data.status', 'Suspended')
            ->assertJsonPath('data.suspension_reason', 'Repeated reports');

        $this->assertDatabaseHas('users', [
            'id' => $member->id,
            'account_status' => 'Suspended',
            'suspension_reason' => 'Repeated reports',
        ]);

        $this->patchJson("/api/admin/members/{$member->id}/status", [
            'status' => 'Active',
        ])->assertOk()
            ->assertJsonPath('data.status', 'Active')
            ->assertJsonPath('data.suspension_reason', null);

        $this->assertDatabaseHas('users', [
            'id' => $member->id,
            'account_status' => 'Active',
            'suspension_reason' => null,
        ]);

        $this->patchJson("/api/admin/members/{$member->id}/status", [
            'status' => 'Unknown',
        ])->assertUnprocessable();
    }
}
