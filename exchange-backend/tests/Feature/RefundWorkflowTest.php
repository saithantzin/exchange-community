<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ExchangePayment;
use App\Models\ExchangeRequest;
use App\Models\Item;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RefundWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_each_member_can_submit_and_view_their_own_refund_request(): void
    {
        [$requester, $owner, $exchange, $requesterPayment, $ownerPayment] = $this->createCompletedExchange();

        Sanctum::actingAs($requester);
        $this->postJson("/api/exchanges/{$exchange->id}/deposit/request-refund", [
            'walletType' => 'WavePay',
            'accountNumber' => '09123456789',
            'accountName' => 'Thu Thu',
        ])
            ->assertOk()
            ->assertJsonPath('data.refundWorkflow.partyA.status', 'Processing Payout')
            ->assertJsonPath('data.refundWorkflow.partyA.accountName', 'Thu Thu')
            ->assertJsonPath('data.refundWorkflow.partyA.amount', '50000.00');

        $this->assertDatabaseHas('refunds', [
            'exchange_id' => $exchange->id,
            'user_id' => $requester->id,
            'payment_id' => $requesterPayment->id,
            'refund_status' => 'Processing Payout',
        ]);

        Sanctum::actingAs($owner);
        $this->getJson("/api/exchanges/{$exchange->id}")
            ->assertOk()
            ->assertJsonPath('data.refundWorkflow.partyA.status', 'Pending Details')
            ->assertJsonPath('data.refundWorkflow.partyA.amount', '100000.00')
            ->assertJsonPath('data.refundWorkflow.partyB.status', 'Processing Payout')
            ->assertJsonPath('data.refundWorkflow.partyB.accountName', 'Thu Thu');

        $this->postJson("/api/exchanges/{$exchange->id}/deposit/request-refund", [
            'walletType' => 'KBZPay',
            'accountNumber' => '09987654321',
            'accountName' => 'Su Su Win Htike',
        ])
            ->assertOk()
            ->assertJsonPath('data.refundWorkflow.partyA.status', 'Processing Payout')
            ->assertJsonPath('data.refundWorkflow.partyA.amount', '100000.00')
            ->assertJsonPath('data.refundWorkflow.partyA.accountName', 'Su Su Win Htike')
            ->assertJsonPath('data.refundWorkflow.partyB.accountName', 'Thu Thu');

        $this->assertDatabaseHas('refunds', [
            'exchange_id' => $exchange->id,
            'user_id' => $owner->id,
            'payment_id' => $ownerPayment->id,
            'refund_status' => 'Processing Payout',
        ]);
    }

    public function test_admin_refund_release_updates_real_refund_fields_and_list(): void
    {
        [$requester, , $exchange, $requesterPayment] = $this->createCompletedExchange();
        Refund::create([
            'exchange_id' => $exchange->id,
            'payment_id' => $requesterPayment->id,
            'user_id' => $requester->id,
            'refund_amount' => 50000,
            'payment_provider' => 'WavePay',
            'account_number' => '09123456789',
            'account_name' => 'Thu Thu',
            'refund_status' => 'Processing Payout',
        ]);
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/exchanges/{$exchange->id}/refund/process", [
            'partyRole' => 'partyA',
            'txRef' => 'REF-123456',
        ])
            ->assertOk()
            ->assertJsonPath('data.refundWorkflow.partyA.status', 'Completed')
            ->assertJsonPath('data.refundWorkflow.partyA.refundTransactionRef', 'REF-123456');

        $this->assertDatabaseHas('refunds', [
            'exchange_id' => $exchange->id,
            'user_id' => $requester->id,
            'refund_status' => 'Completed',
            'refund_transaction_ref' => 'REF-123456',
        ]);
        $this->assertNotNull(Refund::where('exchange_id', $exchange->id)->value('refund_date'));

        $this->getJson('/api/admin/exchanges?per_page=100')
            ->assertOk()
            ->assertJsonPath('data.data.0.refundWorkflow.partyA.status', 'Completed');
    }

    private function createCompletedExchange(): array
    {
        $requester = User::factory()->create(['name' => 'Thu Thu']);
        $owner = User::factory()->create(['name' => 'Su Su Win Htike']);
        $categoryA = Category::create([
            'name' => 'Books',
            'slug' => 'books-' . uniqid(),
            'deposit_amount' => 50000,
        ]);
        $categoryB = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics-' . uniqid(),
            'deposit_amount' => 100000,
        ]);
        $offeredItem = Item::create([
            'user_id' => $requester->id,
            'category_id' => $categoryA->id,
            'title' => 'Running Shoe',
            'description' => 'Offered item',
        ]);
        $requestedItem = Item::create([
            'user_id' => $owner->id,
            'category_id' => $categoryB->id,
            'title' => 'iPhone',
            'description' => 'Requested item',
        ]);
        $exchange = ExchangeRequest::create([
            'exchange_code' => 'EXC-' . uniqid(),
            'requester_id' => $requester->id,
            'owner_id' => $owner->id,
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $requestedItem->id,
            'exchange_type' => 'Intercity Courier Delivery',
            'status' => 'Completed',
        ]);
        $requesterPayment = ExchangePayment::create([
            'exchange_id' => $exchange->id,
            'payer_id' => $requester->id,
            'category_id' => $categoryA->id,
            'deposit_amount' => 50000,
            'payment_method' => 'WavePay',
            'reference_number' => 'THU-123',
            'payment_status' => 'Verified',
        ]);
        $ownerPayment = ExchangePayment::create([
            'exchange_id' => $exchange->id,
            'payer_id' => $owner->id,
            'category_id' => $categoryB->id,
            'deposit_amount' => 100000,
            'payment_method' => 'KBZPay',
            'reference_number' => 'SU-123',
            'payment_status' => 'Verified',
        ]);

        return [$requester, $owner, $exchange, $requesterPayment, $ownerPayment];
    }
}
