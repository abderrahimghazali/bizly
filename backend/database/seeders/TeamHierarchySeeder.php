<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class TeamHierarchySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Get role IDs
        $managerRole = Role::where('name', 'manager')->first();
        $employeeRole = Role::where('name', 'employee')->first();
        
        if (!$managerRole || !$employeeRole) {
            $this->command->error('Manager or Employee role not found. Please run RolePermissionSeeder first.');
            return;
        }

        // Create 3 managers
        $managers = [];
        for ($i = 1; $i <= 3; $i++) {
            $manager = User::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('password'),
                'role_id' => $managerRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $managers[] = $manager;
            $this->command->info("Created manager: {$manager->name} ({$manager->email})");
        }

        // Create 10 employees and assign them to managers
        for ($i = 1; $i <= 10; $i++) {
            // Randomly assign employee to one of the managers
            $randomManager = $managers[array_rand($managers)];
            
            $employee = User::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('password'),
                'role_id' => $employeeRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
                'manager_id' => $randomManager->id,
            ]);
            
            $this->command->info("Created employee: {$employee->name} ({$employee->email}) - Manager: {$randomManager->name}");
        }

        $this->command->info('Team hierarchy seeded successfully!');
        $this->command->info('3 managers and 10 employees created with random assignments.');
    }
}
