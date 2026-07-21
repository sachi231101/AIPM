<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    public function index(): JsonResponse
    {
        $students = Student::with(['user', 'institute'])->get();

        $data = $students->map(function ($student) {
            $hasUploaded = filled($student->resume_path);
            $hasCreated  = \App\Models\StudentResume::where('student_id', $student->id)->exists();

            $createdUrl = $hasCreated
                ? url("/created-resume/" . $student->id)
                : null;
            $uploadedUrl = $hasUploaded ? url("/storage/" . $student->resume_path) : null;
            $primaryUrl  = $createdUrl ?? $uploadedUrl;

            return [
                'id'                  => $student->user_id,
                'student_id'          => $student->id,
                'studentIdCardNumber' => $student->student_id_card,
                'name'                => $student->user->name,
                'email'               => $student->user->email ?? '',
                'phone'               => $student->mobile ?? 'N/A',
                'mobile'              => $student->mobile ?? 'N/A',
                'dob'                 => $student->dob?->format('Y-m-d') ?? 'N/A',
                'gender'              => $student->gender ?? 'N/A',
                'address'             => $student->address ?? 'N/A',
                'institute'           => $student->institute?->name ?? $student->other_institute_name ?? 'N/A',
                'instituteId'         => $student->institute_id,
                'course'              => $student->course ?? 'N/A',
                'branch'              => $student->branch ?? 'N/A',
                'batch'               => $student->batch ?? 'N/A',
                'passing_year'        => $student->passing_year ?? 'N/A',
                'cgpa'                => $student->cgpa ?? 'N/A',
                'skills'              => $student->skills ?? [],
                'softSkills'          => $student->soft_skills ?? [],
                'soft_skills'         => $student->soft_skills ?? [],
                'profileCompletion'   => $student->profile_completion ?? 100,
                'profile_completion'  => $student->profile_completion ?? 100,
                'resumeUrl'           => $primaryUrl,
                'uploadedResumeUrl'   => $uploadedUrl,
                'createdResumeUrl'    => $createdUrl,
                'hasUploaded'         => $hasUploaded,
                'hasCreated'          => $hasCreated,
                'linkedin'            => $student->linkedin ?? '',
                'github'              => $student->github ?? '',
                'portfolio'           => $student->portfolio ?? '',
            ];
        });

        return response()->json(['data' => $data]);
    }
}
