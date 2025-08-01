<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'company',
        'status',
        'source',
        'value',
        'last_contact',
        'notes',
        'assigned_to',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'last_contact' => 'datetime',
    ];

    /**
     * Get the user assigned to this lead
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by source
     */
    public function scopeBySource($query, $source)
    {
        return $query->where('source', $source);
    }
}
