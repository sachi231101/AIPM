<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Student::with(['user']);

        if ($request->has('status') && in_array($request->status, ['pending', 'approved', 'rejected', 'hold'])) {
            $query->where('approval_status', $request->status);
        }

        $students = $query->latest()->get();

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
                'name'                => $student->user?->name ?? 'N/A',
                'email'               => $student->user?->email ?? '',
                'phone'               => $student->mobile ?? 'N/A',
                'mobile'              => $student->mobile ?? 'N/A',
                'dob'                 => $student->dob?->format('Y-m-d') ?? 'N/A',
                'gender'              => $student->gender ?? 'N/A',
                'address'             => $student->address ?? 'N/A',
                'course'              => $student->course ?? 'N/A',
                'branch'              => $student->branch ?? 'N/A',
                'batch'               => $student->batch ?? 'N/A',
                'passing_year'        => $student->passing_year ?? 'N/A',
                'cgpa'                => $student->cgpa ?? 'N/A',
                'skills'              => $student->skills ?? [],
                'softSkills'          => $student->soft_skills ?? [],
                'soft_skills'         => $student->soft_skills ?? [],
                'profileCompletion'   => $student->profile_completion ?? 0,
                'profile_completion'  => $student->profile_completion ?? 0,
                'approval_status'     => $student->approval_status ?? 'approved',
                'approvalStatus'      => $student->approval_status ?? 'approved',
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

    public function approve($id): JsonResponse
    {
        $student = Student::where('user_id', $id)->orWhere('id', $id)->firstOrFail();
        $student->update(['approval_status' => 'approved']);

        return response()->json([
            'message' => 'Student approved successfully.',
            'student' => $student,
        ]);
    }

    public function hold($id): JsonResponse
    {
        $student = Student::where('user_id', $id)->orWhere('id', $id)->firstOrFail();
        $student->update(['approval_status' => 'hold']);

        return response()->json([
            'message' => 'Student placed on hold successfully.',
            'student' => $student,
        ]);
    }

    public function reject($id): JsonResponse
    {
        $student = Student::where('user_id', $id)->orWhere('id', $id)->firstOrFail();
        $student->update(['approval_status' => 'rejected']);

        return response()->json([
            'message' => 'Student status set to rejected.',
            'student' => $student,
        ]);
    }
}
