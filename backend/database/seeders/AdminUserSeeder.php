<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@aadyaplacements.com'],
            [
                'name'     => 'Aadya Admin',
                'email'    => 'admin@aadyaplacements.com',
                'password' => Hash::make('Admin@1234'),
                'role'     => 'admin',
            ]
        );
    }
}
