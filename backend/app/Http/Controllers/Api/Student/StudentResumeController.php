<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentResume;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentResumeController extends Controller
{
    /**
     * GET /api/student/resumes
     * Retrieve all saved resumes for the logged-in student scoped strictly to profile_id.
     */
    public function index(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $profileId = $request->query('profile_id');
        if (!$profileId) {
            $profileId = $student->getOrCreateDefaultProfile()->id;
        }

        $resumes = StudentResume::where('student_id', $student->id)
            ->where('student_profile_id', $profileId)
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'status'  => 'success',
            'data'    => $resumes,
        ]);
    }

    /**
     * POST /api/student/resumes
     * Save or update a resume version for a specific profile.
     */
    public function store(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $validated = $request->validate([
            'resume_key'         => 'required|string',
            'student_profile_id' => 'nullable|integer',
            'title'              => 'nullable|string',
            'content'            => 'required|array',
            'is_default'         => 'nullable|boolean',
        ]);

        $profileId = $validated['student_profile_id'] ?? $student->getOrCreateDefaultProfile()->id;

        $resume = StudentResume::updateOrCreate(
            [
                'student_id'         => $student->id,
                'student_profile_id' => $profileId,
                'resume_key'         => $validated['resume_key'],
            ],
            [
                'title'      => $validated['title'] ?? 'Master Resume',
                'content'    => $validated['content'],
                'is_default' => $validated['is_default'] ?? false,
            ]
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Resume saved successfully to profile.',
            'data'    => $resume,
        ]);
    }

    /**
     * DELETE /api/student/resumes/{key}
     * Delete a saved resume version.
     */
    public function destroy(Request $request, string $key): JsonResponse
    {
        $student = $request->user()->student;
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $profileId = $request->query('profile_id');

        $query = StudentResume::where('student_id', $student->id)->where('resume_key', $key);
        if ($profileId) {
            $query->where('student_profile_id', $profileId);
        }
        $query->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Resume deleted successfully.',
        ]);
    }
}
