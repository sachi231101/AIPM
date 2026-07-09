<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\PlacementJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    // ───────── POST /api/apply ─────────

    public function apply(Request $request): JsonResponse
    {
        $user    = $request->user();
        $student = $user->student;

        $request->validate([
            'job_id' => 'required|exists:jobs,id',
        ]);

        $job = PlacementJob::with('institutes')->findOrFail($request->job_id);

        // Check job is published
        if (!$job->isPublished()) {
            return response()->json(['message' => 'This placement drive is not currently open.'], 422);
        }

        // Check institute eligibility (students with other institutes cannot apply)
        if ($student->institute_id) {
            $eligible = $job->institutes->pluck('id')->contains($student->institute_id);
            if (!$eligible) {
                return response()->json(['message' => 'Your institute is not eligible for this placement drive.'], 403);
            }
        } else {
            return response()->json(['message' => 'Students from unlisted institutes cannot apply.'], 403);
        }

        // Check profile completion
        if ($student->profile_completion < 100) {
            return response()->json([
                'message' => 'Please complete your profile and upload your resume before applying.',
            ], 422);
        }

        // Prevent duplicate applications
        $alreadyApplied = Application::where('student_id', $student->id)
            ->where('job_id', $job->id)
            ->exists();

        if ($alreadyApplied) {
            return response()->json(['message' => 'You have already applied for this placement drive.'], 409);
        }

        Application::create([
            'student_id'  => $student->id,
            'job_id'      => $job->id,
            'resume_path' => $student->resume_path,
            'applied_at'  => now(),
        ]);

        return response()->json(['message' => 'Application submitted successfully.'], 201);
    }

    // ───────── GET /api/student/applications ─────────

    public function myApplications(Request $request): JsonResponse
    {
        $student      = $request->user()->student;
        $applications = Application::with(['job.company'])
            ->where('student_id', $student->id)
            ->latest('applied_at')
            ->get();

        $data = $applications->map(fn ($app) => [
            'id'         => $app->id,
            'status'     => $app->status,
            'applied_at' => $app->applied_at?->format('Y-m-d H:i'),
            'job'        => [
                'id'       => $app->job->id,
                'title'    => $app->job->title,
                'company'  => $app->job->company->name,
                'location' => $app->job->location,
                'salary'   => $app->job->salary,
            ],
        ]);

        return response()->json(['data' => $data]);
    }
}
