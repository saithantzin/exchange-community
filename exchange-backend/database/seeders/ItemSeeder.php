<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Item;
use App\Models\ItemImage;
use App\Models\Township;
use App\Models\User;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        $user1 = User::where('username', 'thantzin')->first();
        $user2 = User::where('username', 'kyawzin')->first();
        $user3 = User::where('username', 'ayechan')->first();

        if (!$user1 || !$user2) {
            return;
        }

        $electronics = Category::where('name', 'like', '%Electronics%')->first();
        $cameras = Category::where('name', 'like', '%Cameras%')->first();
        $furniture = Category::where('name', 'like', '%Furniture%')->first();
        $music = Category::where('name', 'like', '%Musical%')->first();
        $books = Category::where('name', 'like', '%Books%')->first();

        $chanayethazan = Township::where('name', 'Chanayethazan')->first();
        $kamayut = Township::where('name', 'Kamayut')->first();
        $zabuthiri = Township::where('name', 'Zabuthiri')->first();

        $items = [
            [
                'user_id' => $user1->id,
                'category_id' => $electronics ? $electronics->id : 1,
                'township_id' => $chanayethazan ? $chanayethazan->id : 1,
                'title' => 'Logitech MX Master 3S Wireless Mouse',
                'description' => 'Lightly used ergonomic mouse with MagSpeed scrolling. Fully functional with original box.',
                'condition' => 'Like New',
                'looking_for' => 'Noise-canceling headphones or mechanical keyboard',
                'images' => [
                    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
                    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80'
                ]
            ],
            [
                'user_id' => $user2->id,
                'category_id' => $electronics ? $electronics->id : 1,
                'township_id' => $kamayut ? $kamayut->id : 1,
                'title' => 'Sony WH-1000XM4 Noise Canceling Headphones',
                'description' => 'Exceptional audio quality with active noise cancellation. Battery holds charge for 30 hours.',
                'condition' => 'Like New',
                'looking_for' => 'Ergonomic mouse, mechanical keyboard, or studio monitor',
                'images' => [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'
                ]
            ],
            [
                'user_id' => $user1->id,
                'category_id' => $cameras ? $cameras->id : 2,
                'township_id' => $chanayethazan ? $chanayethazan->id : 1,
                'title' => 'Vintage Film Camera (Olympus OM-1)',
                'description' => 'Classic 35mm SLR camera with 50mm f/1.8 Zuiko lens. Clean shutter mechanism and clear viewfinder.',
                'condition' => 'Like New',
                'looking_for' => 'Tablet, iPad or acoustic guitar',
                'images' => [
                    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'
                ]
            ],
            [
                'user_id' => $user3->id,
                'category_id' => $electronics ? $electronics->id : 1,
                'township_id' => $zabuthiri ? $zabuthiri->id : 1,
                'title' => 'Apple iPad 9th Gen 64GB WiFi',
                'description' => 'Space Gray iPad in pristine condition. Screen protector applied since day one with magnetic smart cover.',
                'condition' => 'Like New',
                'looking_for' => 'Mirrorless or vintage camera body with lens',
                'images' => [
                    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80'
                ]
            ],
            [
                'user_id' => $user2->id,
                'category_id' => $furniture ? $furniture->id : 3,
                'township_id' => $kamayut ? $kamayut->id : 1,
                'title' => 'Minimalist Teak Wood Coffee Table',
                'description' => 'Solid natural teak finish coffee table. Great centerpiece for living room or studio workspace.',
                'condition' => 'Lightly Used',
                'looking_for' => 'Bookshelf, study desk or desk lamp',
                'images' => [
                    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&q=80'
                ]
            ],
            [
                'user_id' => $user1->id,
                'category_id' => $music ? $music->id : 4,
                'township_id' => $chanayethazan ? $chanayethazan->id : 1,
                'title' => 'Yamaha Acoustic Guitar with Padded Gig Bag',
                'description' => 'Rich resonance and low string action. Recently re-strung with D\'Addario phosphor bronze strings.',
                'condition' => 'Like New',
                'looking_for' => 'Drawing tablet or audio interface',
                'images' => [
                    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80'
                ]
            ]
        ];

        foreach ($items as $itemData) {
            $images = $itemData['images'];
            unset($itemData['images']);

            $item = Item::create($itemData);

            foreach ($images as $idx => $url) {
                ItemImage::create([
                    'item_id' => $item->id,
                    'image_url' => $url,
                    'is_primary' => $idx === 0,
                ]);
            }
        }
    }
}
