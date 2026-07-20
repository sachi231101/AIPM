<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentResume extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'resume_key',
        'title',
        'content',
        'is_default',
    ];

    protected $casts = [
        'content'    => 'array',
        'is_default' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
