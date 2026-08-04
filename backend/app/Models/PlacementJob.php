<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlacementJob extends Model
{
    use HasFactory;

    protected $table = 'placement_jobs';

    protected $fillable = [
        'company_id',
        'title',
        'description',
        'responsibilities',
        'eligibility',
        'skills',
        'experience',
        'salary',
        'location',
        'employment_type',
        'openings',
        'last_date',
        'status',
    ];

    protected $casts = [
        'skills'    => 'array',
        'last_date' => 'date',
        'openings'  => 'integer',
    ];

    // ---------- Relationships ----------

    public function company(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function institutes(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Institute::class, 'job_institutes', 'job_id', 'institute_id');
    }

    public function applications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Application::class, 'job_id');
    }

    public function emailLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(EmailLog::class, 'job_id');
    }

    // ---------- Scopes ----------

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // ---------- Helpers ----------

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
