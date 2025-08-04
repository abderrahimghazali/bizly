<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'mobile',
        'position',
        'department',
        'company_id',
        'user_id',
        'is_primary',
        'notes',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    protected $appends = [
        'full_name',
    ];

    /**
     * Get the company this contact belongs to
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the user who manages this contact
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all deals where this contact is the primary contact
     */
    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    /**
     * Get the full name attribute
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Scope to get primary contacts
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Scope to filter by company
     */
    public function scopeByCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * Scope to filter by position
     */
    public function scopeByPosition($query, $position)
    {
        return $query->where('position', 'like', '%' . $position . '%');
    }

    /**
     * Scope to filter by department
     */
    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    /**
     * Set this contact as primary (and unset others for the same company)
     */
    public function setPrimary(): void
    {
        // If this contact is not associated with a company, there is nothing to update
        if (!$this->company) {
            return;
        }

        // First, unset all other primary contacts for this company
        $this->company->contacts()->where('id', '!=', $this->id)->update(['is_primary' => false]);

        // Then set this contact as primary
        $this->update(['is_primary' => true]);
    }
}