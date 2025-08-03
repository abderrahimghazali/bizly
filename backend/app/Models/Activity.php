<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'subject',
        'description',
        'activityable_type',
        'activityable_id',
        'user_id',
        'activity_date',
    ];

    protected $casts = [
        'activity_date' => 'datetime',
    ];

    /**
     * Activity types
     */
    public static function getTypes(): array
    {
        return [
            'email' => 'Email',
            'call' => 'Phone Call',
            'meeting' => 'Meeting',
            'note' => 'Note',
            'status_change' => 'Status Change',
            'created' => 'Created',
            'updated' => 'Updated',
            'assigned' => 'Assigned',
        ];
    }

    /**
     * Get the owning activityable model (Lead, Company, Contact, etc.)
     */
    public function activityable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who performed the activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the type label
     */
    public function getTypeLabelAttribute(): string
    {
        return self::getTypes()[$this->type] ?? $this->type;
    }

    /**
     * Scope to filter by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get recent activities
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('activity_date', '>=', now()->subDays($days));
    }
}
