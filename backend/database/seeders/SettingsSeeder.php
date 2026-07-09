<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'institute_name',  'value' => 'Aadya Institute'],
            ['key' => 'contact_email',   'value' => 'aadyainstitute2016@gmail.com'],
            ['key' => 'contact_phone',   'value' => '+91 99641 94324'],
            ['key' => 'address',         'value' => '183, 2nd Floor, 1st Main Road, Ramamurthy Nagar, Bengaluru – 560016'],
            ['key' => 'website',         'value' => 'https://aadyainstitute.com'],
            ['key' => 'smtp_host',       'value' => 'smtp.gmail.com'],
            ['key' => 'smtp_port',       'value' => '587'],
        ];

        foreach ($settings as $s) {
            \Illuminate\Support\Facades\DB::table('settings')->updateOrInsert(
                ['key' => $s['key']],
                ['value' => $s['value'], 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }
}
