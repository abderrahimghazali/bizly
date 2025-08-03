<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'company', // Keep for backward compatibility
        'company_id', // New relationship field
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
     * Lead statuses
     */
    public static function getStatuses(): array
    {
        return [
            'new' => 'New',
            'contacted' => 'Contacted',
            'qualified' => 'Qualified',
            'proposal' => 'Proposal',
            'negotiation' => 'Negotiation',
            'won' => 'Won',
            'lost' => 'Lost',
            'converted' => 'Converted',
        ];
    }

    /**
     * Get the user assigned to this lead
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the company associated with this lead
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get all deals created from this lead
     */
    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    /**
     * Get the company name (either from relationship or string field)
     */
    public function getCompanyNameAttribute(): string
    {
        if ($this->company_id && $this->company) {
            return $this->company->name;
        }
        
        return $this->company ?? 'Unknown Company';
    }

    /**
     * Get the status label
     */
    public function getStatusLabelAttribute(): string
    {
        return self::getStatuses()[$this->status] ?? $this->status;
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

    /**
     * Scope to get qualified leads (ready to convert to deals)
     */
    public function scopeQualified($query)
    {
        return $query->whereIn('status', ['qualified', 'proposal', 'negotiation']);
    }

    /**
     * Scope to get won leads
     */
    public function scopeWon($query)
    {
        return $query->where('status', 'won');
    }

    /**
     * Scope to get lost leads
     */
    public function scopeLost($query)
    {
        return $query->where('status', 'lost');
    }

    /**
     * Convert this lead to a deal
     */
    public function convertToDeal(array $dealData): Deal
    {
        $deal = Deal::create([
            'title' => $dealData['title'] ?? "Deal from Lead: {$this->name}",
            'description' => $dealData['description'] ?? "Converted from lead: {$this->name}",
            'amount' => $dealData['amount'] ?? $this->value,
            'probability' => $dealData['probability'] ?? 50,
            'stage' => 'qualified',
            'expected_close_date' => $dealData['expected_close_date'],
            'source' => $this->source,
            'notes' => $dealData['notes'] ?? $this->notes,
            'lead_id' => $this->id,
            'company_id' => $this->company_id,
            'assigned_to' => $this->assigned_to,
            'created_by' => $dealData['created_by'],
        ]);

        // Update lead status to won
        $this->update(['status' => 'won']);

        return $deal;
    }
}
