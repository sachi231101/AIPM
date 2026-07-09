<?php

namespace Database\Seeders;

use App\Models\Institute;
use Illuminate\Database\Seeder;

class InstituteSeeder extends Seeder
{
    public function run(): void
    {
        $institutes = [
            ['name' => 'Aadya Institute',         'is_active' => true,  'address' => '183, 2nd Floor, 1st Main Road, Ramamurthy Nagar, Bengaluru – 560016'],
            ['name' => 'PES University',           'is_active' => true,  'address' => '100 Feet Ring Road, BSK III Stage, Bengaluru – 560085'],
            ['name' => 'Oxford College',           'is_active' => true,  'address' => 'Hongasandra, Hosur Road, Bengaluru – 560068'],
            ['name' => 'RV College of Engineering','is_active' => true,  'address' => 'Mysuru Road, Bengaluru – 560059'],
            ['name' => 'SJCE Mysuru',              'is_active' => false, 'address' => 'Manasagangotri, Mysuru – 570006'],
        ];

        foreach ($institutes as $inst) {
            Institute::firstOrCreate(['name' => $inst['name']], $inst);
        }
    }
}
