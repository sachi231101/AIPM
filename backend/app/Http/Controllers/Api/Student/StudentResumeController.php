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
     * Retrieve all saved resumes for the logged-in student.
     */
    public function index(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $resumes = StudentResume::where('student_id', $student->id)
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'status'  => 'success',
            'data'    => $resumes,
        ]);
    }

    /**
     * POST /api/student/resumes
     * Save or update a resume version.
     */
    public function store(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $validated = $request->validate([
            'resume_key' => 'required|string',
            'title'      => 'nullable|string',
            'content'    => 'required|array',
            'is_default' => 'nullable|boolean',
        ]);

        $resume = StudentResume::updateOrCreate(
            [
                'student_id' => $student->id,
                'resume_key' => $validated['resume_key'],
            ],
            [
                'title'      => $validated['title'] ?? 'Master Resume',
                'content'    => $validated['content'],
                'is_default' => $validated['is_default'] ?? false,
            ]
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Resume saved successfully to database.',
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

        StudentResume::where('student_id', $student->id)
            ->where('resume_key', $key)
            ->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Resume deleted successfully.',
        ]);
    }
}
