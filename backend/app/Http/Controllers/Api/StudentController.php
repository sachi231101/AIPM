<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StudentProfileRequest;
use App\Http\Requests\Api\ResumeUploadRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    // ───────── GET /api/student/profile ─────────

    public function show(Request $request): JsonResponse
    {
        $user    = $request->user();
        $student = $user->student->load('institute');

        return response()->json([
            'data' => $this->formatProfile($user, $student),
        ]);
    }

    // ───────── PUT /api/student/profile ─────────

    public function update(StudentProfileRequest $request): JsonResponse
    {
        $user    = $request->user();
        $student = $user->student;

        // Update email on user record
        if ($request->filled('email')) {
            $user->update(['email' => $request->email]);
        }

        // Update student profile
        $student->update($request->safe()->except('email'));

        // Recalculate completion
        $student->refresh();
        $student->recalculateCompletion();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data'    => $this->formatProfile($user->fresh(), $student->fresh()),
        ]);
    }

    // ───────── POST /api/student/resume ─────────

    public function uploadResume(ResumeUploadRequest $request): JsonResponse
    {
        $user    = $request->user();
        $student = $user->student;

        // Delete old resume if exists
        if ($student->resume_path) {
            Storage::disk('public')->delete($student->resume_path);
        }

        // Get original filename
        $originalName = $request->file('resume')->getClientOriginalName();
        // Replace special characters to avoid path traversal or exploits
        $cleanName = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $originalName);

        // Store file with original filename inside student-specific folder
        $path = $request->file('resume')->storeAs(
            'resumes/' . $student->id,
            $cleanName,
            'public'
        );

        $student->update(['resume_path' => $path]);
        $student->recalculateCompletion();

        return response()->json([
            'message'     => 'Resume uploaded successfully.',
            'resume_url'  => Storage::url($path),
            'resume_path' => $path,
        ]);
    }

    // ───────── Helper ─────────

    private function formatProfile($user, $student): array
    {
        return [
            'id'                  => $user->id,
            'student_id'          => $student->id,
            'student_id_card'     => $student->student_id_card,
            'name'                => $user->name,
            'email'               => $user->email,
            'mobile'              => $student->mobile,
            'dob'                 => $student->dob?->format('Y-m-d'),
            'gender'              => $student->gender,
            'address'             => $student->address,
            'institute_id'        => $student->institute_id,
            'institute'           => $student->institute?->name ?? $student->other_institute_name,
            'course'              => $student->course,
            'branch'              => $student->branch,
            'batch'               => $student->batch,
            'passing_year'        => $student->passing_year,
            'cgpa'                => $student->cgpa,
            'skills'              => $student->skills ?? [],
            'soft_skills'         => $student->soft_skills ?? [],
            'linkedin'            => $student->linkedin,
            'github'              => $student->github,
            'portfolio'           => $student->portfolio,
            'profile_photo'       => $student->profile_photo ? Storage::url($student->profile_photo) : null,
            'resume_url'          => $student->resume_path ? Storage::url($student->resume_path) : null,
            'profile_completion'  => $student->profile_completion,
        ];
    }
}
