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

        $profileId = $request->query('profile_id');
        $activeProfile = null;

        if ($profileId) {
            $activeProfile = $student->profiles()->where('id', $profileId)->first();
        }

        if (!$activeProfile) {
            $activeProfile = $student->getOrCreateDefaultProfile();
        }

        return response()->json([
            'data' => $this->formatProfile($user, $student, $activeProfile),
        ]);
    }

    // ───────── PUT /api/student/profile ─────────

    public function update(StudentProfileRequest $request): JsonResponse
    {
        $user    = $request->user();
        $student = $user->student;

        $profileId = $request->input('profile_id') ?? $request->query('profile_id');
        $activeProfile = null;

        if ($profileId) {
            $activeProfile = $student->profiles()->where('id', $profileId)->first();
        }
        if (!$activeProfile) {
            $activeProfile = $student->getOrCreateDefaultProfile();
        }

        // Update email on user record
        if ($request->filled('email')) {
            $user->update(['email' => $request->email]);
        }

        // Parent shared fields update ONLY
        $parentFields = ['dob', 'gender', 'address', 'institute_id', 'other_institute_name'];
        $studentParentData = array_filter($request->only($parentFields), fn($v) => !is_null($v));

        if ($request->filled('profile_photo')) {
            $photoData = $request->input('profile_photo');
            if (str_starts_with($photoData, 'data:image')) {
                @list($type, $fileData) = explode(';', $photoData);
                @list(, $fileData) = explode(',', $fileData);
                if ($fileData) {
                    $decoded = base64_decode($fileData);
                    // Delete old photo from Storage
                    if ($student->profile_photo && !str_starts_with($student->profile_photo, 'http') && !str_starts_with($student->profile_photo, 'data:')) {
                        Storage::disk('public')->delete($student->profile_photo);
                    }
                    // Save to Storage::disk('public') like company logo
                    $storagePath = 'profile_photos/student_' . $student->id . '_' . time() . '.png';
                    Storage::disk('public')->put($storagePath, $decoded);
                    $studentParentData['profile_photo'] = $storagePath;
                }
            } elseif (str_starts_with($photoData, 'http://') || str_starts_with($photoData, 'https://')) {
                // Extract storage path from URL — strip /storage/ prefix
                $parsedPath = parse_url($photoData, PHP_URL_PATH);
                $storagePath = ltrim(str_replace('/storage/', '', $parsedPath), '/');
                $studentParentData['profile_photo'] = $storagePath;
            } else {
                $studentParentData['profile_photo'] = $photoData;
            }
        }


        if (!empty($studentParentData)) {
            $student->update($studentParentData);
        }

        // Profile-specific fields update ONLY on activeProfile
        $profileFields = [
            'course', 'branch', 'batch', 'passing_year', 'cgpa',
            'skills', 'soft_skills', 'linkedin', 'github', 'portfolio',
            'profile_name', 'professional_title', 'target_role', 'summary'
        ];
        $profileData = $request->only($profileFields);

        $activeProfile->update(array_filter($profileData, fn($v) => !is_null($v)));
        $activeProfile->calculateCompletion();

        $student->refresh();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data'    => $this->formatProfile($user->fresh(), $student->fresh(), $activeProfile->fresh()),
        ]);
    }

    // ───────── POST /api/student/profile/photo ─────────

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
        ]);

        $user    = $request->user();
        $student = $user->student;

        // Delete old photo if stored in Storage disk
        if (
            $student->profile_photo &&
            !str_starts_with($student->profile_photo, 'http') &&
            !str_starts_with($student->profile_photo, 'data:')
        ) {
            Storage::disk('public')->delete($student->profile_photo);
        }

        // Store using Storage::disk('public') — same as company logo
        $path = $request->file('photo')->store('profile_photos', 'public');

        $student->update(['profile_photo' => $path]);

        return response()->json([
            'message'   => 'Profile photo updated successfully.',
            'photo_url' => Storage::disk('public')->url($path),
        ]);
    }

    // ───────── POST /api/student/resume ─────────

    public function uploadResume(ResumeUploadRequest $request): JsonResponse
    {
        $user    = $request->user();
        $student = $user->student;

        $profileId = $request->input('profile_id');
        $activeProfile = null;
        if ($profileId) {
            $activeProfile = $student->profiles()->where('id', $profileId)->first();
        }
        if (!$activeProfile) {
            $activeProfile = $student->getOrCreateDefaultProfile();
        }

        // Delete old resume for this profile if exists
        if ($activeProfile->resume_path) {
            Storage::disk('public')->delete($activeProfile->resume_path);
        }

        // Store file with clean name
        $originalName = $request->file('resume')->getClientOriginalName();
        $cleanName = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $originalName);

        $path = $request->file('resume')->storeAs(
            'resumes/' . $student->id . '/' . $activeProfile->id,
            $cleanName,
            'public'
        );

        $activeProfile->update(['resume_path' => $path]);
        $activeProfile->calculateCompletion();

        return response()->json([
            'message'     => 'Resume uploaded successfully for ' . $activeProfile->profile_name . '.',
            'resume_url'  => Storage::url($path),
            'resume_path' => $path,
        ]);
    }

    // ───────── Helper ─────────

    private function formatProfile($user, $student, $activeProfile = null): array
    {
        if (!$activeProfile) {
            $activeProfile = $student->getOrCreateDefaultProfile();
        }

        $hasCreatedResume = \App\Models\StudentResume::where('student_id', $student->id)
            ->where('student_profile_id', $activeProfile->id)
            ->exists();

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
            'approval_status'     => $student->approval_status ?? 'approved',
            'institute_id'        => $student->institute_id,
            'institute'           => $student->institute?->name ?? $student->other_institute_name,
            'profile_photo'       => $student->profile_photo
                ? (str_starts_with($student->profile_photo, 'http') || str_starts_with($student->profile_photo, 'data:')
                    ? $student->profile_photo
                    : Storage::disk('public')->url($student->profile_photo))
                : null,

            // Active Career Profile Data (100% isolated strictly to activeProfile)
            'active_profile_id'   => $activeProfile->id,
            'profile_name'        => $activeProfile->profile_name,
            'professional_title'  => $activeProfile->professional_title,
            'target_role'         => $activeProfile->target_role,
            'summary'             => $activeProfile->summary,
            'course'              => $activeProfile->course,
            'branch'              => $activeProfile->branch,
            'batch'               => $activeProfile->batch,
            'passing_year'        => $activeProfile->passing_year,
            'cgpa'                => $activeProfile->cgpa,
            'skills'              => $activeProfile->skills ?? [],
            'soft_skills'         => $activeProfile->soft_skills ?? [],
            'linkedin'            => $activeProfile->linkedin,
            'github'              => $activeProfile->github,
            'portfolio'           => $activeProfile->portfolio,
            'resume_path'         => $activeProfile->resume_path,
            'resume_url'          => $activeProfile->resume_path ? url('/storage/' . $activeProfile->resume_path) : null,
            'has_uploaded_resume' => filled($activeProfile->resume_path),
            'has_created_resume'  => $hasCreatedResume,
            'created_resume_url'  => $hasCreatedResume ? url('/created-resume/' . $student->id . '?profile_id=' . $activeProfile->id) : null,
            'profile_completion'  => $activeProfile->profile_completion ?? 0,
        ];
    }
}
