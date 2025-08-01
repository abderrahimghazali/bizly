<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of roles with user count
     */
    public function index()
    {
        $roles = Role::withCount('users')->get();
        
        return response()->json([
            'roles' => $roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $role->label,
                    'description' => $role->description,
                    'isSystemRole' => $role->is_system_role,
                    'userCount' => $role->users_count,
                ];
            })
        ]);
    }

    /**
     * Get all permissions organized by category
     */
    public function permissions()
    {
        $permissions = Permission::all()->groupBy('category');
        
        return response()->json([
            'permissions' => $permissions
        ]);
    }

    /**
     * Get permissions matrix (roles vs permissions)
     */
    public function permissionsMatrix()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();
        
        $matrix = [];
        foreach ($roles as $role) {
            $matrix[$role->id] = $role->permissions->pluck('id')->toArray();
        }
        
        return response()->json([
            'roles' => $roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $role->label,
                ];
            }),
            'permissions' => $permissions->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'label' => $permission->label,
                    'category' => $permission->category,
                ];
            }),
            'matrix' => $matrix
        ]);
    }

    /**
     * Update permissions for a role
     */
    public function updatePermissions(Request $request, Role $role)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        $role->syncPermissions($request->permissions);

        return response()->json([
            'message' => 'Role permissions updated successfully',
            'role' => $role->load('permissions')
        ]);
    }

    /**
     * Store a newly created role
     */
    public function store(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000'
        ]);

        // Auto-generate machine name from label
        $name = $this->generateRoleName($request->label);

        // Check for uniqueness
        if (Role::where('name', $name)->exists()) {
            return response()->json([
                'message' => 'A role with this name already exists',
                'errors' => ['label' => ['This role name is already taken']]
            ], 422);
        }

        $role = Role::create([
            'name' => $name,
            'label' => $request->label,
            'description' => $request->description,
            'is_system_role' => false
        ]);

        return response()->json([
            'message' => 'Role created successfully',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $role->label,
                'description' => $role->description,
                'isSystemRole' => $role->is_system_role,
                'userCount' => 0,
            ]
        ], 201);
    }

    /**
     * Display the specified role
     */
    public function show(Role $role)
    {
        return response()->json([
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $role->label,
                'description' => $role->description,
                'isSystemRole' => $role->is_system_role,
                'userCount' => $role->users()->count(),
            ]
        ]);
    }

    /**
     * Update the specified role
     */
    public function update(Request $request, Role $role)
    {
        // Prevent editing system roles
        if ($role->is_system_role) {
            return response()->json([
                'message' => 'System roles cannot be modified'
            ], 403);
        }

        $request->validate([
            'label' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000'
        ]);

        $role->update([
            'label' => $request->label,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Role updated successfully',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $role->label,
                'description' => $role->description,
                'isSystemRole' => $role->is_system_role,
                'userCount' => $role->users()->count(),
            ]
        ]);
    }

    /**
     * Remove the specified role
     */
    public function destroy(Role $role)
    {
        // Prevent deletion of system roles
        if ($role->is_system_role) {
            return response()->json([
                'message' => 'System roles cannot be deleted'
            ], 403);
        }

        // Prevent deletion if role has users
        if ($role->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete role that has assigned users'
            ], 409);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully'
        ]);
    }

    /**
     * Generate machine name from display label
     */
    private function generateRoleName(string $label): string
    {
        return strtolower(trim(preg_replace('/[^a-zA-Z0-9\s]/', '', $label)))
            ? preg_replace('/\s+/', '_', 
                preg_replace('/[^a-zA-Z0-9\s]/', '', 
                    strtolower(trim($label))
                )
            )
            : 'role_' . time();
    }
}
