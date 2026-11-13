<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ExchangePayment;
use App\Models\ExchangeRequest;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DepositVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_members_cannot_access_admin_deposit_verification(): void
    {
        $this->postJson('/api/admin/exchanges/1/deposit/approve', ['partyRole' => 'partyA'])
            ->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/admin/exchanges/1/deposit/approve', ['partyRole' => 'partyA'])
            ->assertForbidden();

        $this->postJson('/api/exchanges/1/deposit/verify', ['partyRole' => 'partyA'])
            ->assertNotFound();
    }

    public function test_demo_admin_token_cannot_access_admin_deposit_routes(): void
    {
        $this->withToken('demo-admin')
            ->postJson('/api/admin/exchanges/1/deposit/approve', ['partyRole' => 'partyA'])
            ->assertUnauthorized();
    }

    public function test_approval_requires_a_submitted_payment_and_valid_party_role(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $exchange = $this->createIntercityExchange();
        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/exchanges/{$exchange->id}/deposit/approve", ['partyRole' => 'unexpected'])
            ->assertUnprocessable();

        $this->postJson("/api/admin/exchanges/{$exchange->id}/deposit/approve", ['partyRole' => 'partyA'])
            ->assertUnprocessable();

        $this->assertDatabaseCount('exchange_payments', 0);
    }

    public function test_admin_approval_records_admin_and_rejects_repeated_approval(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['role' => 'admin']);
        $exchange = $this->createIntercityExchange();
        $proofPath = UploadedFile::fake()->image('slip.png')->store('deposit-slips', 'local');
        ExchangePayment::create([
            'exchange_id' => $exchange->id,
            'payer_id' => $exchange->requester_id,
            'category_id' => $exchange->offeredItem->category_id,
            'deposit_amount' => 50000,
            'payment_method' => 'KBZPay',
            'reference_number' => 'TX-123456',
            'payment_proof' => $proofPath,
            'payment_status' => 'Payment Submitted',
        ]);
        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/exchanges/{$exchange->id}/deposit/approve", ['partyRole' => 'partyA'])
            ->assertOk()
            ->assertJsonPath('data.deposits.partyA.status', 'Verified')
            ->assertJsonPath('data.deposits.partyA.verifiedBy', $admin->name);

        $this->assertDatabaseHas('exchange_payments', [
            'exchange_id' => $exchange->id,
            'payer_id' => $exchange->requester_id,
            'payment_status' => 'Verified',
            'verified_by' => $admin->id,
        ]);

        $this->getJson('/api/admin/pending-deposits')
            ->assertOk()
            ->assertJsonPath('data.0.status', 'Verified')
            ->assertJsonPath('data.0.rawStatus', 'Verified');

        $this->postJson("/api/admin/exchanges/{$exchange->id}/deposit/approve", ['partyRole' => 'partyA'])
            ->assertUnprocessable();
    }

    public function test_dashboard_counts_exchanges_after_both_deposits_are_verified(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $exchange = $this->createIntercityExchange();
        $exchange->update(['status' => 'Deposits Verified']);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/dashboard-stats')
            ->assertOk()
            ->assertJsonPath('data.exchanges.active', 1);
    }

    public function test_admin_cannot_approve_a_submission_without_stored_evidence(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['role' => 'admin']);
        $exchange = $this->createIntercityExchange();
        $payment = ExchangePayment::create([
            'exchange_id' => $exchange->id,
            'payer_id' => $exchange->requester_id,
            'category_id' => $exchange->offeredItem->category_id,
            'deposit_amount' => 50000,
            'payment_method' => 'KBZPay',
            'reference_number' => 'TX-123456',
            'payment_proof' => 'deposit-slips/missing.png',
            'payment_status' => 'Payment Submitted',
        ]);
        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/exchanges/{$exchange->id}/deposit/approve", ['partyRole' => 'partyA'])
            ->assertUnprocessable();

        $this->assertSame('Payment Submitted', $payment->fresh()->payment_status);
        $this->assertNull($payment->fresh()->verified_by);
    }

    public function test_rejected_payment_can_be_resubmitted_with_new_evidence(): void
    {
        Storage::fake('local');
        $requester = User::factory()->create();
        $exchange = $this->createIntercityExchange($requester);
        $oldProof = UploadedFile::fake()->image('old-slip.png')->store('deposit-slips', 'local');
        $payment = ExchangePayment::create([
            'exchange_id' => $exchange->id,
            'payer_id' => $requester->id,
            'category_id' => $exchange->offeredItem->category_id,
            'deposit_amount' => 50000,
            'payment_method' => 'KBZPay',
            'reference_number' => 'TX-OLD',
            'payment_proof' => $oldProof,
            'payment_status' => 'Rejected',
            'rejection_reason' => 'Unreadable slip',
        ]);
        Sanctum::actingAs($requester);

        $this->post("/api/exchanges/{$exchange->id}/deposit", [
            'paymentMethod' => 'WavePay',
            'referenceNumber' => 'TX-NEW',
            'slipImage' => UploadedFile::fake()->image('new-slip.png'),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.deposits.partyA.status', 'Payment Submitted');

        $payment->refresh();
        $this->assertSame('Payment Submitted', $payment->payment_status);
        $this->assertSame('TX-NEW', $payment->reference_number);
        $this->assertNull($payment->rejection_reason);
        $this->assertNotSame($oldProof, $payment->payment_proof);
        Storage::disk('local')->assertExists($payment->payment_proof);
        Storage::disk('local')->assertMissing($oldProof);
    }

    public function test_exchange_details_show_the_correct_partner_and_deposit_for_each_member(): void
    {
        $requester = User::factory()->create(['name' => 'Thu Thu']);
        $owner = User::factory()->create(['name' => 'Su Su Win Htike']);
        $exchange = $this->createIntercityExchange($requester, $owner);
        ExchangePayment::create([
            'exchange_id' => $exchange->id,
            'payer_id' => $owner->id,
            'category_id' => $exchange->requestedItem->category_id,
            'deposit_amount' => 100000,
            'payment_method' => 'KBZPay',
            'reference_number' => 'SU-123',
            'payment_status' => 'Payment Submitted',
        ]);

        Sanctum::actingAs($requester);
        $this->getJson("/api/exchange-requests/{$exchange->id}")
            ->assertOk()
            ->assertJsonPath('data.recipient.name', 'Su Su Win Htike')
            ->assertJsonPath('data.deposits.partyA.itemTitle', 'Offered item')
            ->assertJsonPath('data.deposits.partyA.status', 'Pending Payment')
            ->assertJsonPath('data.deposits.partyB.itemTitle', 'Requested item')
            ->assertJsonPath('data.deposits.partyB.status', 'Payment Submitted');

        Sanctum::actingAs($owner);
        $this->getJson("/api/exchange-requests/{$exchange->id}")
            ->assertOk()
            ->assertJsonPath('data.requester.name', 'Thu Thu')
            ->assertJsonPath('data.deposits.partyA.itemTitle', 'Requested item')
            ->assertJsonPath('data.deposits.partyA.status', 'Payment Submitted')
            ->assertJsonPath('data.deposits.partyB.itemTitle', 'Offered item')
            ->assertJsonPath('data.deposits.partyB.status', 'Pending Payment');
    }

    private function createIntercityExchange(?User $requester = null, ?User $owner = null): ExchangeRequest
    {
        $requester ??= User::factory()->create();
        $owner ??= User::factory()->create();
        $category = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics-' . uniqid(),
            'deposit_amount' => 50000,
        ]);
        $offeredItem = Item::create([
            'user_id' => $requester->id,
            'category_id' => $category->id,
            'title' => 'Offered item',
            'description' => 'Exchange item',
        ]);
        $requestedItem = Item::create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Requested item',
            'description' => 'Exchange item',
        ]);

        return ExchangeRequest::create([
            'exchange_code' => 'EXC-' . uniqid(),
            'requester_id' => $requester->id,
            'owner_id' => $owner->id,
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $requestedItem->id,
            'exchange_type' => 'Intercity Courier Delivery',
            'status' => 'Accepted',
        ]);
    }
}
