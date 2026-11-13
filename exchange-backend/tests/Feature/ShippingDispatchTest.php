<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ExchangeRequest;
use App\Models\Item;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ShippingDispatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_upload_and_view_courier_waybill_evidence(): void
    {
        Storage::fake('local');
        [$requester, $owner, $exchange] = $this->createExchange();
        Sanctum::actingAs($requester);

        $this->post("/api/exchanges/{$exchange->id}/shipping", [
            'courier' => 'Royal Express',
            'trackingNumber' => 'RX-1234-MDY',
            'shippingDate' => '2026-11-13',
            'shippingProof' => UploadedFile::fake()->image('waybill.png'),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.partyA.trackingNumber', 'RX-1234-MDY')
            ->assertJsonPath('data.partyA.hasReceiptImage', true)
            ->assertJsonPath('data.partyA.receiptImage', null);

        $shipment = Shipment::where('exchange_id', $exchange->id)
            ->where('sender_id', $requester->id)
            ->firstOrFail();

        $this->assertSame('shipping-proofs/' . basename($shipment->shipping_proof), $shipment->shipping_proof);
        Storage::disk('local')->assertExists($shipment->shipping_proof);

        $this->get("/api/exchanges/{$exchange->id}/shipping/partyA/evidence")
            ->assertOk()
            ->assertHeader('content-type', 'image/png');

        Sanctum::actingAs($owner);
        $this->get("/api/exchanges/{$exchange->id}/shipping/partyA/evidence")
            ->assertOk()
            ->assertHeader('content-type', 'image/png');
    }

    public function test_non_participant_cannot_view_courier_waybill_evidence(): void
    {
        [$requester, , $exchange] = $this->createExchange();
        Sanctum::actingAs(User::factory()->create());

        $this->get("/api/exchanges/{$exchange->id}/shipping/partyA/evidence")
            ->assertForbidden();
    }

    private function createExchange(): array
    {
        $requester = User::factory()->create();
        $owner = User::factory()->create();
        $category = Category::create([
            'name' => 'Books',
            'slug' => 'books-' . uniqid(),
            'deposit_amount' => 50000,
        ]);
        $offeredItem = Item::create([
            'user_id' => $requester->id,
            'category_id' => $category->id,
            'title' => 'Offered book',
            'description' => 'Book for exchange',
        ]);
        $requestedItem = Item::create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Requested book',
            'description' => 'Requested book',
        ]);
        $exchange = ExchangeRequest::create([
            'exchange_code' => 'EXC-' . uniqid(),
            'requester_id' => $requester->id,
            'owner_id' => $owner->id,
            'offered_item_id' => $offeredItem->id,
            'requested_item_id' => $requestedItem->id,
            'exchange_type' => 'Intercity Courier Delivery',
            'status' => 'Deposits Verified',
        ]);

        return [$requester, $owner, $exchange];
    }
}
