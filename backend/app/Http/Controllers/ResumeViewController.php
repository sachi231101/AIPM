<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentResume;
use App\Models\StudentProfile;
use Illuminate\Http\Request;

class ResumeViewController extends Controller
{
    /**
     * Render the student's app-created resume as a clean, printable A4 document.
     */
    public function show(int $studentId, Request $request)
    {
        $student = Student::with(['user', 'institute', 'profiles'])->findOrFail($studentId);

        $resume = null;

        if ($request->filled('key')) {
            $key = $request->key;
            $resume = StudentResume::where('student_id', $studentId)
                ->where(function ($q) use ($key) {
                    $q->where('resume_key', $key)
                      ->orWhere('id', $key);
                })
                ->first();
        } elseif ($request->filled('profile_id')) {
            $resume = StudentResume::where('student_id', $studentId)
                ->where('student_profile_id', $request->profile_id)
                ->orderByDesc('updated_at')
                ->first();
        } else {
            $resume = StudentResume::where('student_id', $studentId)
                ->orderByDesc('is_default')
                ->orderByDesc('updated_at')
                ->first();
        }

        // Construct profile-specific content if no resume row exists yet for this profile
        if ($resume) {
            $content = $resume->content ?? [];
        } else {
            $profile = null;
            if ($request->filled('profile_id')) {
                $profile = StudentProfile::where('student_id', $studentId)->where('id', $request->profile_id)->first();
            }
            if (!$profile) {
                $profile = $student->getOrCreateDefaultProfile();
            }

            $content = [
                'personal' => [
                    'fullName'          => $student->name ?: ($student->user?->name ?? 'Student Name'),
                    'professionalTitle' => $profile->professional_title ?: ($student->course ? $student->course . ' Developer' : 'Graduate Candidate'),
                    'email'             => $student->email ?: ($student->user?->email ?? ''),
                    'phone'             => $student->mobile ?? '',
                    'location'          => $student->address ?? '',
                    'linkedin'          => $profile->linkedin ?: ($student->linkedin ?? ''),
                    'github'            => $profile->github ?: ($student->github ?? ''),
                    'portfolio'         => $profile->portfolio ?: ($student->portfolio ?? ''),
                    'photo'             => $student->profile_photo ? (str_starts_with($student->profile_photo, 'http') || str_starts_with($student->profile_photo, 'data:') ? $student->profile_photo : url('/' . ltrim($student->profile_photo, '/'))) : '',
                    'showPhoto'         => !empty($student->profile_photo),
                ],
                'summary'   => $profile->summary ?: '',
                'education' => [
                    [
                        'id'             => 'edu_1',
                        'degree'         => $profile->course ?: ($student->course ?? 'B.E / B.Tech'),
                        'specialization' => $profile->branch ?: ($student->branch ?? 'Computer Science'),
                        'college'        => $student->institute?->name ?: ($student->other_institute_name ?? 'Engineering Institute'),
                        'endYear'        => $profile->passing_year ?: ($student->passing_year ?? ''),
                        'cgpa'           => $profile->cgpa ?: ($student->cgpa ?? ''),
                    ]
                ],
                'skills'    => [
                    'technical'  => $profile->skills ?: ($student->skills ?? []),
                    'softSkills' => $profile->soft_skills ?: ($student->soft_skills ?? []),
                ],
                'experience' => [],
                'projects'   => [],
                'settings'   => [
                    'template'    => 'modern',
                    'accentColor' => '#0F4C81',
                ]
            ];
        }

        return view('resume-template', [
            'student' => $student,
            'resume'  => $resume,
            'content' => $content,
        ]);
    }
}
