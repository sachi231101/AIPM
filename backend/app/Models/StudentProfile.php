<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    use HasFactory;

    protected $table = 'student_profiles';

    protected $fillable = [
        'student_id',
        'profile_name',
        'professional_title',
        'target_role',
        'summary',
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
        'is_default',
        'status',
    ];

    protected $casts = [
        'skills'      => 'array',
        'soft_skills' => 'array',
        'is_default'  => 'boolean',
        'cgpa'        => 'float',
    ];

    // ---------- Relationships ----------

    public function student(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function resumes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StudentResume::class, 'student_profile_id');
    }

    public function applications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Application::class, 'student_profile_id');
    }

    // ---------- Helpers ----------

    public function calculateCompletion(): int
    {
        $hasPersonalInfo = !empty($this->student?->email) && !empty($this->student?->dob) && !empty($this->student?->gender) && !empty($this->student?->address);
        $hasAcademic = !empty($this->course) && !empty($this->branch) && !empty($this->batch);
        $hasResume = !empty($this->resume_path) || $this->resumes()->exists();
        $hasSkills = !empty($this->skills) && count((array)$this->skills) > 0;

        $completed = 0;
        if ($hasPersonalInfo) $completed += 25;
        if ($hasAcademic)     $completed += 25;
        if ($hasResume)       $completed += 25;
        if ($hasSkills)       $completed += 25;

        $this->update(['profile_completion' => $completed]);
        return $completed;
    }
}
