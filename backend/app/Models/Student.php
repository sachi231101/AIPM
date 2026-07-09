<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'institute_id',
        'student_id_card',
        'mobile',
        'other_institute_name',
        'profile_photo',
        'dob',
        'gender',
        'address',
        'course',
        'branch',
        'batch',
        'passing_year',
        'cgpa',
        'skills',
        'resume_path',
        'linkedin',
        'github',
        'portfolio',
        'profile_completion',
    ];

    protected $casts = [
        'skills'     => 'array',
        'dob'        => 'date',
        'cgpa'       => 'float',
    ];

    // ---------- Relationships ----------

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function institute(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }

    public function applications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Application::class);
    }

    // ---------- Helpers ----------

    /**
     * Return the student's email (stored on the user account).
     */
    public function getEmailAttribute(): ?string
    {
        return $this->user?->email;
    }

    /**
     * Return the student's name (stored on the user account).
     */
    public function getNameAttribute(): string
    {
        return $this->user?->name ?? '';
    }

    /**
     * Calculate and return profile completion sections.
     */
    public function completionSections(): array
    {
        return [
            'personal'  => filled($this->user?->email) && filled($this->dob) && filled($this->gender) && filled($this->address),
            'academic'  => filled($this->course) && filled($this->branch) && filled($this->batch),
            'resume'    => filled($this->resume_path),
            'skills'    => !empty($this->skills),
        ];
    }

    /**
     * Recalculate and save the profile_completion percentage.
     */
    public function recalculateCompletion(): void
    {
        $sections  = $this->completionSections();
        $completed = count(array_filter($sections));
        $this->profile_completion = $completed * 25;
        $this->saveQuietly();
    }
}
