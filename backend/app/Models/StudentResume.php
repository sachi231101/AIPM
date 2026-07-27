<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentResume extends Model
{
    use HasFactory;

    protected $table = 'student_resumes';

    protected $fillable = [
        'student_id',
        'student_profile_id',
        'resume_key',
        'title',
        'content',
        'is_default',
    ];

    protected $casts = [
        'content'    => 'array',
        'is_default' => 'boolean',
    ];

    public function student(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_profile_id');
    }
}
