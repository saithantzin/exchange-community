<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics & Gadgets', 'deposit' => 100000, 'icon' => 'Smartphone'],
            ['name' => 'Home & Furniture', 'deposit' => 80000, 'icon' => 'Sofa'],
            ['name' => 'Cameras & Optics', 'deposit' => 120000, 'icon' => 'Camera'],
            ['name' => 'Musical Instruments', 'deposit' => 150000, 'icon' => 'Music'],
            ['name' => 'Sports & Outdoors', 'deposit' => 50000, 'icon' => 'Activity'],
            ['name' => 'Kitchen & Appliances', 'deposit' => 40000, 'icon' => 'Coffee'],
            ['name' => 'Books & Collectibles', 'deposit' => 30000, 'icon' => 'BookOpen'],
            ['name' => 'Fashion & Accessories', 'deposit' => 35000, 'icon' => 'Watch'],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->insert([
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']),
                'deposit_amount' => $cat['deposit'],
                'icon' => $cat['icon'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
