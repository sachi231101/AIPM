<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Institute extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'is_active',
        'address',
        'phone',
        'email',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function students(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function jobs(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(PlacementJob::class, 'job_institutes', 'institute_id', 'job_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
