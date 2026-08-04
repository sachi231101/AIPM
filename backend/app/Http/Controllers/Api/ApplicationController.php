<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Notification;
use App\Models\PlacementJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    // ───────── POST /api/apply ─────────

    public function apply(Request $request): JsonResponse
    {
        $request->validate([
            'job_id'             => 'required|exists:placement_jobs,id',
            'student_profile_id' => 'nullable|exists:student_profiles,id',
            'resume_type'        => 'nullable|string|in:uploaded,builder',
            'resume_key'         => 'nullable|string',
        ]);

        $user    = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student record not found.'], 404);
        }

        $job = PlacementJob::findOrFail($request->job_id);

        // Check job status
        if ($job->status !== 'published') {
            return response()->json(['message' => 'This placement drive is not open for applications.'], 422);
        }

        // Check last date
        if ($job->last_date) {
            $lastDate = \Carbon\Carbon::parse($job->last_date)->endOfDay();
            if (now()->gt($lastDate)) {
                return response()->json(['message' => 'The application deadline for this placement drive has passed.'], 422);
            }
        }

        // Check student approval status
        if (($student->approval_status ?? 'approved') !== 'approved') {
            if ($student->approval_status === 'rejected') {
                return response()->json([
                    'message' => 'Your account status is rejected. You cannot apply for placement drives.'
                ], 403);
            }
            return response()->json([
                'message' => 'Your account is currently on hold. You can apply for jobs once the Placement Team releases the hold on your account.'
            ], 403);
        }

        // Resolve requested profile or fallback to default
        $profileId = $request->student_profile_id;
        $profile = null;
        if ($profileId) {
            $profile = $student->profiles()->where('id', $profileId)->first();
        }
        if (!$profile) {
            $profile = $student->getOrCreateDefaultProfile();
        }

        // Resolve student's Resume Builder data dynamically (if available)
        $resume = \App\Models\StudentResume::where('student_id', $student->id)
            ->where(function ($q) use ($profile, $request) {
                if ($request->resume_key) {
                    $q->where('resume_key', $request->resume_key);
                } elseif ($profile) {
                    $q->where('student_profile_id', $profile->id);
                }
            })
            ->orderByDesc('is_default')
            ->first();

        if (!$resume) {
            $resume = \App\Models\StudentResume::where('student_id', $student->id)->latest()->first();
        }

        $resumeContent = $resume?->content ?? [];
        $educationList = is_array($resumeContent['education'] ?? null) ? $resumeContent['education'] : [];
        $firstEdu      = count($educationList) > 0 ? $educationList[0] : null;

        $builderCourse = $firstEdu['degree'] ?? ($firstEdu['course'] ?? null);
        $builderBranch = $firstEdu['field'] ?? ($firstEdu['branch'] ?? ($firstEdu['specialization'] ?? null));
        $builderBatch  = $firstEdu['year'] ?? ($firstEdu['batch'] ?? ($firstEdu['passingYear'] ?? null));
        $builderCgpa   = $firstEdu['gpa'] ?? ($firstEdu['cgpa'] ?? ($firstEdu['percentage'] ?? null));

        $course = $profile->course ?: ($student->course ?: $builderCourse);
        $branch = $profile->branch ?: ($student->branch ?: $builderBranch);
        $batch  = $profile->batch ?: ($student->batch ?: $builderBatch);
        $cgpa   = $profile->cgpa ?: ($student->cgpa ?: $builderCgpa);

        if ($course || $branch || $batch || $cgpa) {
            $profile->update(array_filter([
                'course' => $course,
                'branch' => $branch,
                'batch'  => $batch,
                'cgpa'   => $cgpa,
            ]));

            $student->update(array_filter([
                'course' => $course,
                'branch' => $branch,
                'batch'  => $batch,
                'cgpa'   => $cgpa,
            ]));
        }

        // Check profile-level resume
        $hasUploadedResume = filled($profile->resume_path);
        $hasCreatedResume  = \App\Models\StudentResume::where('student_id', $student->id)->where('student_profile_id', $profile->id)->exists();

        if (!$hasUploadedResume && !$hasCreatedResume) {
            return response()->json([
                'message' => 'No resume found for profile "' . $profile->profile_name . '". Please build a resume or upload a PDF first before applying.',
            ], 422);
        }

        // Prevent duplicate applications for same job + profile
        $alreadyApplied = Application::where('student_id', $student->id)
            ->where('job_id', $job->id)
            ->exists();

        if ($alreadyApplied) {
            return response()->json(['message' => 'You have already applied for this placement drive.'], 409);
        }

        $resumeType = $request->resume_type ?? ($hasUploadedResume ? 'uploaded' : 'builder');
        $resumeKey  = $request->resume_key;

        if ($resumeType === 'builder' && !$resumeKey) {
            $defaultResume = \App\Models\StudentResume::where('student_id', $student->id)
                ->where('student_profile_id', $profile->id)
                ->orderByDesc('is_default')
                ->first();
            $resumeKey = $defaultResume?->resume_key ?? 'master';
        }

        $application = Application::create([
            'student_id'         => $student->id,
            'student_profile_id' => $profile->id,
            'job_id'             => $job->id,
            'resume_path'        => $profile->resume_path ?? $student->resume_path,
            'resume_type'        => $resumeType,
            'resume_key'         => $resumeKey,
            'applied_at'         => now(),
        ]);

        // Create notification for admin
        Notification::create([
            'type'    => 'new_application',
            'title'   => 'New Job Application',
            'message' => $user->name . ' applied for ' . $job->title . ' (' . $profile->profile_name . ')',
            'link'    => '/admin/applications',
        ]);

        return response()->json([
            'message' => 'Application submitted successfully! 🎉',
            'data'    => $application,
        ], 201);
    }

    // ───────── GET /api/student/applications ─────────

    public function myApplications(): JsonResponse
    {
        $user    = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['data' => []]);
        }

        $applications = Application::with('job.company')
            ->where('student_id', $student->id)
            ->latest('applied_at')
            ->get();

        return response()->json([
            'data' => $applications,
        ]);
    }
}
