<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'role_label' => $this->role->label(),
            'permissions' => $this->getPermissions(),
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Get user permissions based on role
     */
    private function getPermissions(): array
    {
        $allPermissions = [
            // Company permissions
            'view_all_companies', 'view_assigned_companies', 'view_own_companies',
            'create_company', 'edit_company', 'edit_assigned_companies', 'delete_company',
            
            // Contact permissions
            'view_all_contacts', 'view_assigned_contacts', 'view_own_contacts',
            'create_contact', 'edit_contact', 'edit_assigned_contacts', 'delete_contact',
            
            // Document permissions
            'view_all_documents', 'view_assigned_documents', 'view_own_documents',
            'create_document', 'edit_document', 'edit_assigned_documents', 'delete_document',
            
            // Activity permissions
            'view_team_activities', 'view_own_activities',
            
            // User management permissions
            'manage_users', 'assign_roles',
        ];

        return array_filter($allPermissions, fn($permission) => $this->role->hasPermission($permission));
    }
}
