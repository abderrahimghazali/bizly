<?php

namespace App;

enum UserRole: string
{
    case ADMIN = 'admin';
    case MANAGER = 'manager';
    case EMPLOYEE = 'employee';
    case CLIENT = 'client';

    /**
     * Get all role values as an array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get role label for display
     */
    public function label(): string
    {
        return match($this) {
            self::ADMIN => 'Administrator',
            self::MANAGER => 'Manager',
            self::EMPLOYEE => 'Employee',
            self::CLIENT => 'Client',
        };
    }

    /**
     * Check if role has permission for a given action
     */
    public function hasPermission(string $permission): bool
    {
        return match($this) {
            self::ADMIN => true, // Admin has all permissions including 'manage_users'
            self::MANAGER => in_array($permission, [
                'view_all_companies', 'create_company', 'edit_company', 'delete_company',
                'view_all_contacts', 'create_contact', 'edit_contact', 'delete_contact',
                'view_all_documents', 'create_document', 'edit_document', 'delete_document',
                'view_team_activities', 'assign_roles'
            ]),
            self::EMPLOYEE => in_array($permission, [
                'view_assigned_companies', 'edit_assigned_companies',
                'view_assigned_contacts', 'create_contact', 'edit_assigned_contacts',
                'view_assigned_documents', 'create_document', 'edit_assigned_documents',
                'view_own_activities'
            ]),
            self::CLIENT => in_array($permission, [
                'view_own_companies',
                'view_own_contacts',
                'view_own_documents'
            ]),
        };
    }

    /**
     * Get roles that can be assigned by this role
     */
    public function canAssignRoles(): array
    {
        return match($this) {
            self::ADMIN => [self::MANAGER, self::EMPLOYEE, self::CLIENT],
            self::MANAGER => [self::EMPLOYEE, self::CLIENT],
            default => [],
        };
    }
}
