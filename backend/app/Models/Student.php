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

    public function setCgpaAttribute($value)
    {
        if ($value === null || $value === '') {
            $this->attributes['cgpa'] = null;
        } else {
            $clean = preg_replace('/[^0-9.]/', '', (string)$value);
            $val = is_numeric($clean) ? floatval($clean) : null;
            $this->attributes['cgpa'] = $val !== null ? min(max(0, $val), 99.99) : null;
        }
    }

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
        $profile = $this->getOrCreateDefaultProfile();
        $hasUploaded = filled($profile?->resume_path) || filled($this->resume_path);
        $hasCreated  = \App\Models\StudentResume::where('student_id', $this->id)->exists();

        return [
            'personal'  => filled($this->user?->email) && filled($this->mobile),
            'academic'  => filled($profile?->course ?? $this->course) || filled($profile?->branch ?? $this->branch),
            'resume'    => $hasUploaded || $hasCreated,
            'skills'    => !empty($profile?->skills ?? $this->skills),
        ];
    }

    /**
     * Calculate dynamic profile completion percentage (0-100).
     */
    public function calculateProfileScore(): int
    {
        $profile = $this->getOrCreateDefaultProfile();

        $score = 0;

        // 1. Basic & Personal Info (25%)
        $hasName = filled($this->user?->name);
        $hasEmail = filled($this->user?->email);
        $hasMobile = filled($this->mobile);
        $hasDob = filled($this->dob);
        $hasGenderOrAddress = filled($this->gender) || filled($this->address);

        if ($hasName) $score += 5;
        if ($hasEmail) $score += 5;
        if ($hasMobile) $score += 5;
        if ($hasDob) $score += 5;
        if ($hasGenderOrAddress) $score += 5;

        // 2. Academics & Education (25%)
        $course = $profile?->course ?? $this->course;
        $branch = $profile?->branch ?? $this->branch;
        $cgpa = $profile?->cgpa ?? $this->cgpa;
        $batch = $profile?->batch ?? $this->batch;

        if (filled($course)) $score += 10;
        if (filled($branch)) $score += 10;
        if (filled($cgpa) || filled($batch)) $score += 5;

        // 3. Career Details & Summary (20%)
        if ($profile) {
            if (filled($profile->professional_title)) $score += 5;
            if (filled($profile->target_role)) $score += 5;
            if (filled($profile->summary) && strlen(trim($profile->summary)) > 5) $score += 10;
        }

        // 4. Skills & Links (20%)
        $skills = $profile?->skills ?? $this->skills ?? [];
        $skillsArr = is_array($skills) ? $skills : [];
        if (count($skillsArr) >= 3) $score += 10;
        elseif (count($skillsArr) > 0) $score += 5;

        $hasLink = filled($profile?->linkedin ?? $this->linkedin) ||
                   filled($profile?->github ?? $this->github) ||
                   filled($profile?->portfolio ?? $this->portfolio);
        if ($hasLink) $score += 10;

        // 5. Photo & Resume (10%)
        $hasPhoto = filled($this->profile_photo);
        $hasResume = filled($profile?->resume_path) || filled($this->resume_path) ||
                     \App\Models\StudentResume::where('student_id', $this->id)->exists();

        if ($hasPhoto) $score += 5;
        if ($hasResume) $score += 5;

        $finalScore = min(100, max(0, $score));

        if ($this->profile_completion !== $finalScore) {
            $this->profile_completion = $finalScore;
            $this->saveQuietly();
        }

        if ($profile && $profile->profile_completion !== $finalScore) {
            $profile->update(['profile_completion' => $finalScore]);
        }

        return $finalScore;
    }

    /**
     * Recalculate and save the profile_completion percentage.
     */
    public function recalculateCompletion(): void
    {
        $this->calculateProfileScore();
    }
}
