<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deal extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'amount',
        'probability',
        'stage',
        'expected_close_date',
        'actual_close_date',
        'source',
        'notes',
        'lead_id',
        'company_id',
        'contact_id',
        'assigned_to',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'probability' => 'decimal:2',
        'expected_close_date' => 'date',
        'actual_close_date' => 'date',
    ];

    protected $appends = [
        'stage_label',
        'weighted_amount',
        'is_overdue',
        'days_until_close',
    ];

    /**
     * Deal stages with labels
     */
    public static function getStages(): array
    {
        return [
            'qualified' => 'Qualified',
            'proposal' => 'Proposal',
            'negotiation' => 'Negotiation',
            'closed_won' => 'Closed Won',
            'closed_lost' => 'Closed Lost',
        ];
    }

    /**
     * Get the user assigned to this deal
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who created this deal
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the lead associated with this deal
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the company associated with this deal
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the contact associated with this deal
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Get the stage label
     */
    public function getStageLabelAttribute(): string
    {
        return self::getStages()[$this->stage] ?? $this->stage;
    }

    /**
     * Get the weighted amount (amount * probability)
     */
    public function getWeightedAmountAttribute(): float
    {
        return $this->amount * ($this->probability / 100);
    }

    /**
     * Check if the deal is overdue
     */
    public function getIsOverdueAttribute(): bool
    {
        if ($this->stage === 'closed_won' || $this->stage === 'closed_lost') {
            return false;
        }
        
        return $this->expected_close_date->isPast();
    }

    /**
     * Get days until close date
     */
    public function getDaysUntilCloseAttribute(): int
    {
        if ($this->stage === 'closed_won' || $this->stage === 'closed_lost') {
            return 0;
        }
        
        return now()->diffInDays($this->expected_close_date, false);
    }

    /**
     * Scope to filter by stage
     */
    public function scopeByStage($query, $stage)
    {
        return $query->where('stage', $stage);
    }

    /**
     * Scope to filter by assigned user
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope to get open deals (not closed)
     */
    public function scopeOpen($query)
    {
        return $query->whereNotIn('stage', ['closed_won', 'closed_lost']);
    }

    /**
     * Scope to get closed deals
     */
    public function scopeClosed($query)
    {
        return $query->whereIn('stage', ['closed_won', 'closed_lost']);
    }

    /**
     * Scope to get won deals
     */
    public function scopeWon($query)
    {
        return $query->where('stage', 'closed_won');
    }

    /**
     * Scope to get lost deals
     */
    public function scopeLost($query)
    {
        return $query->where('stage', 'closed_lost');
    }

    /**
     * Scope to get overdue deals
     */
    public function scopeOverdue($query)
    {
        return $query->where('expected_close_date', '<', now())
                    ->whereNotIn('stage', ['closed_won', 'closed_lost']);
    }
}