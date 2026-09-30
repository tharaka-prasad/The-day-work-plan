<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrNew(['email' => env('SUPERADMIN_EMAIL', 'admin@example.com')]);

        $user->forceFill([
            'name' => env('SUPERADMIN_NAME', 'Super Admin'),
            'password' => Hash::make(env('SUPERADMIN_PASSWORD', 'ChangeMe123!')),
            'role' => 'super_admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ])->save();

        $this->command?->info("Super admin ready: {$user->email}");
    }
}
