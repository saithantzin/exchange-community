<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin User
        $adminId = DB::table('users')->insertGetId([
            'name' => 'Platform Administrator',
            'username' => 'admin',
            'email' => 'admin@exchange.mm',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'account_status' => 'Active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Find location IDs
        $mdyTownship = DB::table('townships')->where('name', 'Chanayethazan')->first();
        $ygnTownship = DB::table('townships')->where('name', 'Kamayut')->first();
        $npwTownship = DB::table('townships')->where('name', 'Zabuthiri')->first();

        // 2. Demo User: Thant Zin (Mandalay)
        $user1Id = DB::table('users')->insertGetId([
            'name' => 'Thant Zin',
            'username' => 'thantzin',
            'email' => 'thantzin@exchange.mm',
            'password' => Hash::make('password123'),
            'phone' => '09798123456',
            'state_region_id' => $mdyTownship ? $mdyTownship->state_region_id : null,
            'township_id' => $mdyTownship ? $mdyTownship->id : null,
            'address' => '73rd St, Between 31st and 32nd St',
            'role' => 'user',
            'account_status' => 'Active',
            'bio' => 'Photography and tech gear enthusiast in Mandalay.',
            'rating' => 4.95,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Add communication contacts for Thant Zin
        DB::table('communication_contacts')->insert([
            [
                'user_id' => $user1Id,
                'platform' => 'Telegram',
                'contact_value' => '@thantzin_mdy',
                'is_preferred' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user1Id,
                'platform' => 'Viber',
                'contact_value' => '+959798123456',
                'is_preferred' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user1Id,
                'platform' => 'Facebook Messenger',
                'contact_value' => 'facebook.com/thantzin.mm',
                'is_preferred' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 3. Demo User: Kyaw Zin Htet (Yangon)
        $user2Id = DB::table('users')->insertGetId([
            'name' => 'Kyaw Zin Htet',
            'username' => 'kyawzin',
            'email' => 'kyawzin@exchange.mm',
            'password' => Hash::make('password123'),
            'phone' => '09450987654',
            'state_region_id' => $ygnTownship ? $ygnTownship->state_region_id : null,
            'township_id' => $ygnTownship ? $ygnTownship->id : null,
            'address' => 'Inya Road, Kamayut Township',
            'role' => 'user',
            'account_status' => 'Active',
            'bio' => 'Audio gear collector and audiophile.',
            'rating' => 4.88,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('communication_contacts')->insert([
            [
                'user_id' => $user2Id,
                'platform' => 'Telegram',
                'contact_value' => '@kyawzin_ygn',
                'is_preferred' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user2Id,
                'platform' => 'Viber',
                'contact_value' => '+959450987654',
                'is_preferred' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 4. Demo User: Aye Chan Myat (Naypyidaw)
        $user3Id = DB::table('users')->insertGetId([
            'name' => 'Aye Chan Myat',
            'username' => 'ayechan',
            'email' => 'ayechan@exchange.mm',
            'password' => Hash::make('password123'),
            'phone' => '09261234567',
            'state_region_id' => $npwTownship ? $npwTownship->state_region_id : null,
            'township_id' => $npwTownship ? $npwTownship->id : null,
            'address' => 'Ministry Zone, Zabuthiri',
            'role' => 'user',
            'account_status' => 'Active',
            'bio' => 'Tablet and digital drawing hobbyist.',
            'rating' => 4.90,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('communication_contacts')->insert([
            [
                'user_id' => $user3Id,
                'platform' => 'Viber',
                'contact_value' => '+959261234567',
                'is_preferred' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
