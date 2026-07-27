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
        'soft_skills',
        'resume_path',
        'linkedin',
        'github',
        'portfolio',
        'profile_completion',
        'approval_status',
    ];

    protected $casts = [
        'skills'      => 'array',
        'soft_skills' => 'array',
        'dob'         => 'date',
        'cgpa'        => 'float',
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

    public function profiles(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StudentProfile::class, 'student_id');
    }

    // ---------- Helpers ----------

    public function getOrCreateDefaultProfile(): StudentProfile
    {
        $defaultProfile = $this->profiles()->where('is_default', true)->first();

        if (!$defaultProfile) {
            $defaultProfile = $this->profiles()->first();
        }

        if (!$defaultProfile) {
            $name = $this->course ? $this->course . ' Profile' : 'Primary Profile';
            $defaultProfile = $this->profiles()->create([
                'profile_name'       => $name,
                'professional_title' => $this->course ? $this->course . ' Developer' : 'Software Engineer',
                'target_role'        => 'Software Engineer',
                'summary'            => 'Passionate engineering candidate with strong problem-solving skills.',
                'course'             => $this->course,
                'branch'             => $this->branch,
                'batch'              => $this->batch,
                'passing_year'       => $this->passing_year,
                'cgpa'               => $this->cgpa,
                'skills'             => $this->skills ?? [],
                'soft_skills'        => $this->soft_skills ?? [],
                'resume_path'        => $this->resume_path,
                'linkedin'           => $this->linkedin,
                'github'             => $this->github,
                'portfolio'          => $this->portfolio,
                'profile_completion' => $this->profile_completion ?? 0,
                'is_default'         => true,
                'status'             => 'active',
            ]);

            // Link existing resumes & applications to this default profile
            StudentResume::where('student_id', $this->id)->whereNull('student_profile_id')->update(['student_profile_id' => $defaultProfile->id]);
            Application::where('student_id', $this->id)->whereNull('student_profile_id')->update(['student_profile_id' => $defaultProfile->id]);
        }

        return $defaultProfile;
    }

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
        $hasUploaded = filled($this->resume_path);
        $hasCreated  = \App\Models\StudentResume::where('student_id', $this->id)->exists();

        return [
            'personal'  => filled($this->user?->email) && filled($this->dob) && filled($this->gender) && filled($this->address),
            'academic'  => filled($this->course) && filled($this->branch) && filled($this->batch),
            'resume'    => $hasUploaded || $hasCreated,
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
