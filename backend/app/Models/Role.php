<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'label',
        'description',
        'is_system_role',
    ];

    protected $casts = [
        'is_system_role' => 'boolean',
    ];

    /**
     * Get all users with this role
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all permissions for this role
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }

    /**
     * Check if role has a specific permission
     */
    public function hasPermission(string $permissionName): bool
    {
        return $this->permissions()->where('name', $permissionName)->exists();
    }

    /**
     * Assign a permission to this role
     */
    public function givePermission(Permission $permission)
    {
        return $this->permissions()->syncWithoutDetaching([$permission->id]);
    }

    /**
     * Remove a permission from this role
     */
    public function removePermission(Permission $permission)
    {
        return $this->permissions()->detach($permission->id);
    }

    /**
     * Sync permissions for this role
     */
    public function syncPermissions(array $permissionIds)
    {
        return $this->permissions()->sync($permissionIds);
    }

    /**
     * Get user count for this role
     */
    public function getUserCountAttribute()
    {
        return $this->users()->count();
    }
}
