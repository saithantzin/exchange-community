<?php

namespace Database\Seeders;

use App\Models\ExchangeRequest;
use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExchangeRequestSeeder extends Seeder
{
    public function run(): void
    {
        $thantzin = User::where('email', 'thantzin@exchange.mm')->orWhere('username', 'thantzin')->first();
        $kyawzin = User::where('email', 'kyawzin@exchange.mm')->orWhere('username', 'kyawzin')->first();
        $ayechan = User::where('email', 'ayechan@exchange.mm')->orWhere('username', 'ayechan')->first();
        $susu = User::where('email', 'susu@gmail.com')->first();

        // Get some items
        $item1 = Item::where('title', 'like', '%Logitech MX Master%')->first();
        $item2 = Item::where('title', 'like', '%Sony WH-1000XM4%')->first();
        $item3 = Item::where('title', 'like', '%Desk%')->orWhere('title', 'like', '%Table%')->first();
        $item4 = Item::where('title', 'like', '%Bicycle%')->orWhere('title', 'like', '%iPhone%')->first();

        if ($item1 && $item2) {
            ExchangeRequest::updateOrCreate(
                ['exchange_code' => 'EXC-8801'],
                [
                    'requester_id' => $item2->user_id,
                    'owner_id' => $item1->user_id,
                    'offered_item_id' => $item2->id,
                    'requested_item_id' => $item1->id,
                    'exchange_type' => 'Intercity Courier Delivery',
                    'status' => 'Pending',
                    'meetup_location' => null,
                    'notes' => 'Hello! I am offering my Sony WH-1000XM4 headphones for your Logitech MX Master 3S. We can ship via Royal Express or Elite Cargo.',
                    'created_at' => now()->subHours(3),
                ]
            );
        }

        // If Su Su exists and has items or wants to trade
        if ($susu) {
            $susuItem = Item::where('user_id', $susu->id)->first();
            $targetItem = Item::where('user_id', '!=', $susu->id)->first();

            if ($susuItem && $targetItem) {
                ExchangeRequest::updateOrCreate(
                    ['exchange_code' => 'EXC-8802'],
                    [
                        'requester_id' => $targetItem->user_id,
                        'owner_id' => $susu->id,
                        'offered_item_id' => $targetItem->id,
                        'requested_item_id' => $susuItem->id,
                        'exchange_type' => 'In-Person Meetup',
                        'status' => 'Pending',
                        'meetup_location' => 'City Mart Supermarket, 73rd Street',
                        'notes' => 'Hi Su Su! I am interested in swapping for your listed item. Can meet this weekend in Mandalay.',
                        'created_at' => now()->subDay(),
                    ]
                );
            }
        }
    }
}
