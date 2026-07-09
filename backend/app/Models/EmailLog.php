<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'hr_email',
        'sent_at',
        'status',
        'notes',
        'applicant_count',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function job(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(PlacementJob::class, 'job_id');
    }
}
