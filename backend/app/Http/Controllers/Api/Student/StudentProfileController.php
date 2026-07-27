<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentProfileController extends Controller
{
    // GET /api/student/profiles
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student record not found.'], 404);
        }

        // Ensure at least one profile exists
        $student->getOrCreateDefaultProfile();

        $profiles = $student->profiles()
            ->where('status', 'active')
            ->orderByDesc('is_default')
            ->orderBy('id')
            ->get();

        return response()->json([
            'message' => 'Profiles retrieved successfully.',
            'data'    => $profiles,
        ]);
    }

    // POST /api/student/profiles
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student record not found.'], 404);
        }

        $request->validate([
            'profile_name'       => 'required|string|max:255',
            'professional_title' => 'nullable|string|max:255',
            'target_role'        => 'nullable|string|max:255',
            'summary'            => 'nullable|string',
            'course'             => 'nullable|string',
            'branch'             => 'nullable|string',
            'batch'              => 'nullable|string',
            'passing_year'       => 'nullable|string',
            'cgpa'               => 'nullable|numeric',
            'skills'             => 'nullable',
            'soft_skills'        => 'nullable',
        ]);

        $skills = is_array($request->skills) ? $request->skills : array_filter(array_map('trim', explode(',', $request->skills ?? '')));
        $softSkills = is_array($request->soft_skills) ? $request->soft_skills : array_filter(array_map('trim', explode(',', $request->soft_skills ?? '')));

        $defaultProfile = $student->getOrCreateDefaultProfile();

        $profile = $student->profiles()->create([
            'profile_name'       => trim($request->profile_name),
            'professional_title' => trim($request->professional_title ?? $request->profile_name),
            'target_role'        => trim($request->target_role ?? $request->profile_name),
            'summary'            => trim($request->summary ?? ''),
            'course'             => $request->course ?? $defaultProfile->course ?? $student->course ?? 'B.Tech',
            'branch'             => $request->branch ?? $defaultProfile->branch ?? $student->branch ?? 'Computer Science',
            'batch'              => $request->batch ?? $defaultProfile->batch ?? $student->batch ?? '2025',
            'passing_year'       => $request->passing_year ?? $defaultProfile->passing_year ?? $student->passing_year ?? 2025,
            'cgpa'               => $request->cgpa ?? $defaultProfile->cgpa ?? $student->cgpa ?? 8.0,
            'skills'             => array_values($skills),
            'soft_skills'        => array_values($softSkills),
            'is_default'         => false,
            'status'             => 'active',
        ]);

        $profile->calculateCompletion();

        return response()->json([
            'message' => 'New profile created successfully! 🎉',
            'data'    => $profile,
        ], 201);
    }

    // GET /api/student/profiles/{id}
    public function show(int $id): JsonResponse
    {
        $user = Auth::user();
        $student = $user->student;

        $profile = $student->profiles()->where('id', $id)->firstOrFail();
        $profile->calculateCompletion();

        return response()->json([
            'data' => $profile,
        ]);
    }

    // PUT /api/student/profiles/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $user = Auth::user();
        $student = $user->student;

        $profile = $student->profiles()->where('id', $id)->firstOrFail();

        $request->validate([
            'profile_name'       => 'sometimes|required|string|max:255',
            'professional_title' => 'nullable|string|max:255',
            'target_role'        => 'nullable|string|max:255',
            'summary'            => 'nullable|string',
            'course'             => 'nullable|string',
            'branch'             => 'nullable|string',
            'batch'              => 'nullable|string',
            'passing_year'       => 'nullable|string',
            'cgpa'               => 'nullable|numeric',
            'skills'             => 'nullable',
            'soft_skills'        => 'nullable',
        ]);

        $data = $request->only([
            'profile_name', 'professional_title', 'target_role', 'summary',
            'course', 'branch', 'batch', 'passing_year', 'cgpa'
        ]);

        if ($request->has('skills')) {
            $data['skills'] = is_array($request->skills) ? $request->skills : array_filter(array_map('trim', explode(',', $request->skills)));
        }

        if ($request->has('soft_skills')) {
            $data['soft_skills'] = is_array($request->soft_skills) ? $request->soft_skills : array_filter(array_map('trim', explode(',', $request->soft_skills)));
        }

        $profile->update(array_filter($data, fn($v) => !is_null($v)));
        $profile->calculateCompletion();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data'    => $profile,
        ]);
    }

    // DELETE /api/student/profiles/{id}
    public function destroy(int $id): JsonResponse
    {
        $user = Auth::user();
        $student = $user->student;

        $profile = $student->profiles()->where('id', $id)->firstOrFail();

        if ($profile->is_default) {
            return response()->json(['message' => 'Primary default profile cannot be deleted.'], 422);
        }

        $profile->update(['status' => 'inactive']);

        return response()->json([
            'message' => 'Profile deleted successfully.',
        ]);
    }
}
