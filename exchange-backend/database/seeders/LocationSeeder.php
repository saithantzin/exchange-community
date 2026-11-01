<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            'Yangon Region' => [
                'type' => 'Region',
                'townships' => ['Kamayut', 'Sanchaung', 'Bahan', 'Dagon', 'Yankin', 'Kyauktada', 'Insein', 'Mayangone', 'Hlaing']
            ],
            'Mandalay Region' => [
                'type' => 'Region',
                'townships' => ['Chanayethazan', 'Mahaaungmye', 'Aungmyethazan', 'Chanmyathazi', 'Pyigyidagun', 'Amarapura', 'Pyin Oo Lwin']
            ],
            'Naypyidaw Union Territory' => [
                'type' => 'Union Territory',
                'townships' => ['Zabuthiri', 'Ottarathiri', 'Dekkhinathiri', 'Pobbathiri', 'Zeyathiri']
            ],
            'Shan State' => [
                'type' => 'State',
                'townships' => ['Taunggyi', 'Kalaw', 'Nyaungshwe', 'Aungban', 'Lashio', 'Muse']
            ],
            'Mon State' => [
                'type' => 'State',
                'townships' => ['Mawlamyine', 'Mudon', 'Chaungzon', 'Thaton']
            ],
            'Ayeyarwady Region' => [
                'type' => 'Region',
                'townships' => ['Pathein', 'Hinthada', 'Myaungmya', 'Labutta']
            ],
            'Bago Region' => [
                'type' => 'Region',
                'townships' => ['Bago', 'Pyay', 'Taungoo', 'Nyaunglebin']
            ],
            'Magway Region' => [
                'type' => 'Region',
                'townships' => ['Magway', 'Pakokku', 'Chauk', 'Minbu']
            ],
            'Sagaing Region' => [
                'type' => 'Region',
                'townships' => ['Monywa', 'Sagaing', 'Shwebo', 'Kale']
            ],
            'Kachin State' => [
                'type' => 'State',
                'townships' => ['Myitkyina', 'Bhamo', 'Mogaung', 'Mohnyin']
            ],
            'Kayin State' => [
                'type' => 'State',
                'townships' => ['Hpa-An', 'Myawaddy', 'Kawkareik']
            ],
            'Rakhine State' => [
                'type' => 'State',
                'townships' => ['Sittwe', 'Kyaukpyu', 'Thandwe', 'Mrauk-U']
            ],
            'Tanintharyi Region' => [
                'type' => 'Region',
                'townships' => ['Dawei', 'Myeik', 'Kawthaung']
            ],
            'Kayah State' => [
                'type' => 'State',
                'townships' => ['Loikaw', 'Demoso']
            ],
            'Chin State' => [
                'type' => 'State',
                'townships' => ['Hakha', 'Falam', 'Tedim', 'Mindat']
            ]
        ];

        foreach ($locations as $regionName => $data) {
            $regionId = DB::table('state_regions')->insertGetId([
                'name' => $regionName,
                'type' => $data['type'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($data['townships'] as $townshipName) {
                DB::table('townships')->insert([
                    'state_region_id' => $regionId,
                    'name' => $townshipName,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
