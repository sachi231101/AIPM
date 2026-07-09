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
            return [
                'id'                 => $student->user_id,
                'student_id'         => $student->id,
                'studentIdCardNumber'=> $student->student_id_card,
                'name'               => $student->user->name,
                'email'              => $student->user->email ?? '',
                'phone'              => $student->mobile,
                'institute'          => $student->institute?->name ?? $student->other_institute_name ?? '',
                'instituteId'        => $student->institute_id ?? 6,
                'course'             => $student->course ?? '',
                'branch'             => $student->branch ?? '',
                'batch'              => $student->batch ?? '',
                'passing_year'       => $student->passing_year ?? '',
                'cgpa'               => $student->cgpa ?? 0.0,
                'skills'             => $student->skills ?? [],
                'softSkills'         => $student->soft_skills ?? [],
                'profileCompletion'  => $student->profile_completion ?? 0,
                'resumeUrl'          => $student->resume_path ? Storage::url($student->resume_path) : null,
                'linkedin'           => $student->linkedin ?? '',
                'github'             => $student->github ?? '',
                'portfolio'          => $student->portfolio ?? '',
            ];
        });

        return response()->json(['data' => $data]);
    }
}
