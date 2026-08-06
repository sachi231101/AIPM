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
            $defaultProfile = $student->getOrCreateDefaultProfile();

            $hasUploaded = filled($defaultProfile->resume_path) || filled($student->resume_path);
            $hasCreated  = \App\Models\StudentResume::where('student_id', $student->id)->exists();

            $createdUrl = $hasCreated
                ? url("/created-resume/" . $student->id)
                : null;
            $uploadedUrl = $hasUploaded ? url("/storage/" . ($defaultProfile->resume_path ?? $student->resume_path)) : null;
            $primaryUrl  = $createdUrl ?? $uploadedUrl;

            $score = $student->calculateProfileScore();

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
                'course'              => $defaultProfile->course ?? $student->course ?? 'N/A',
                'branch'              => $defaultProfile->branch ?? $student->branch ?? 'N/A',
                'batch'               => $defaultProfile->batch ?? $student->batch ?? 'N/A',
                'passing_year'        => $defaultProfile->passing_year ?? $student->passing_year ?? 'N/A',
                'cgpa'                => $defaultProfile->cgpa ?? $student->cgpa ?? 'N/A',
                'skills'              => $defaultProfile->skills ?? $student->skills ?? [],
                'softSkills'          => $defaultProfile->soft_skills ?? $student->soft_skills ?? [],
                'soft_skills'         => $defaultProfile->soft_skills ?? $student->soft_skills ?? [],
                'profileCompletion'   => $score,
                'profile_completion'  => $score,
                'approval_status'     => $student->approval_status ?? 'approved',
                'approvalStatus'      => $student->approval_status ?? 'approved',
                'resumeUrl'           => $primaryUrl,
                'uploadedResumeUrl'   => $uploadedUrl,
                'createdResumeUrl'    => $createdUrl,
                'hasUploaded'         => $hasUploaded,
                'hasCreated'          => $hasCreated,
                'linkedin'            => $defaultProfile->linkedin ?? $student->linkedin ?? '',
                'github'              => $defaultProfile->github ?? $student->github ?? '',
                'portfolio'           => $defaultProfile->portfolio ?? $student->portfolio ?? '',
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

    public function bulkAction(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:approve,hold,reject',
        ]);

        $status = match ($request->action) {
            'approve' => 'approved',
            'hold'    => 'hold',
            'reject'  => 'rejected',
        };

        Student::whereIn('user_id', $request->ids)
            ->orWhereIn('id', $request->ids)
            ->update(['approval_status' => $status]);

        return response()->json([
            'message' => "Bulk action '{$request->action}' applied successfully for " . count($request->ids) . " students.",
        ]);
    }
}
