<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // User permissions
            ['name' => 'view_users', 'label' => 'View Users', 'category' => 'users'],
            ['name' => 'create_user', 'label' => 'Create User', 'category' => 'users'],
            ['name' => 'edit_user', 'label' => 'Edit User', 'category' => 'users'],
            ['name' => 'delete_user', 'label' => 'Delete User', 'category' => 'users'],
            
            // Company permissions
            ['name' => 'view_companies', 'label' => 'View Companies', 'category' => 'companies'],
            ['name' => 'create_company', 'label' => 'Create Company', 'category' => 'companies'],
            ['name' => 'edit_company', 'label' => 'Edit Company', 'category' => 'companies'],
            ['name' => 'delete_company', 'label' => 'Delete Company', 'category' => 'companies'],
            
            // Contact permissions
            ['name' => 'view_contacts', 'label' => 'View Contacts', 'category' => 'contacts'],
            ['name' => 'create_contact', 'label' => 'Create Contact', 'category' => 'contacts'],
            ['name' => 'edit_contact', 'label' => 'Edit Contact', 'category' => 'contacts'],
            ['name' => 'delete_contact', 'label' => 'Delete Contact', 'category' => 'contacts'],
            
            // Document permissions
            ['name' => 'view_documents', 'label' => 'View Documents', 'category' => 'documents'],
            ['name' => 'create_document', 'label' => 'Create Document', 'category' => 'documents'],
            ['name' => 'edit_document', 'label' => 'Edit Document', 'category' => 'documents'],
            ['name' => 'delete_document', 'label' => 'Delete Document', 'category' => 'documents'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        // Create system roles
        $adminRole = Role::updateOrCreate(
            ['name' => 'admin'],
            [
                'label' => 'Administrator',
                'description' => 'Full system access with all permissions',
                'is_system_role' => true
            ]
        );

        $managerRole = Role::updateOrCreate(
            ['name' => 'manager'],
            [
                'label' => 'Manager',
                'description' => 'Manage teams and oversee operations',
                'is_system_role' => true
            ]
        );

        $employeeRole = Role::updateOrCreate(
            ['name' => 'employee'],
            [
                'label' => 'Employee',
                'description' => 'Standard user with basic permissions',
                'is_system_role' => true
            ]
        );

        $clientRole = Role::updateOrCreate(
            ['name' => 'client'],
            [
                'label' => 'Client',
                'description' => 'External client with limited access',
                'is_system_role' => true
            ]
        );

        // Assign permissions to roles
        $allPermissions = Permission::all();

        // Admin gets all permissions
        $adminRole->syncPermissions($allPermissions->pluck('id')->toArray());

        // Manager permissions (everything except user management)
        $managerPermissions = $allPermissions->whereNotIn('category', ['users'])->pluck('id')->toArray();
        $managerRole->syncPermissions($managerPermissions);

        // Employee permissions (view permissions mostly)
        $employeePermissions = $allPermissions->whereIn('name', [
            'view_companies', 'view_contacts', 'view_documents'
        ])->pluck('id')->toArray();
        $employeeRole->syncPermissions($employeePermissions);

        // Client permissions (very limited)
        $clientPermissions = $allPermissions->whereIn('name', [
            'view_companies', 'view_contacts'
        ])->pluck('id')->toArray();
        $clientRole->syncPermissions($clientPermissions);

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
