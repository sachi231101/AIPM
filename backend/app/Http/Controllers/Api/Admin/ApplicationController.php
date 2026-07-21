<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\PlacementJob;
use App\Services\ApplicationExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    public function __construct(private ApplicationExportService $exportService) {}

    // GET /api/admin/applications or /api/admin/jobs/{id}/applications
    public function index(Request $request, ?int $jobId = null): JsonResponse
    {
        $targetJobId = $jobId ?? $request->query("job_id");

        $query = Application::with(["student.user", "student.institute", "job.company"]);

        if ($targetJobId) {
            $query->where("job_id", $targetJobId);
        }

        $applications = $query->latest("applied_at")->get();

        $data = $applications->map(function ($app) {
            $hasUploaded = filled($app->resume_path);
            $hasCreated  = \App\Models\StudentResume::where('student_id', $app->student_id)->exists();

            $createdUrl = $hasCreated
                ? url("/created-resume/" . $app->student_id . ($app->resume_key ? "?key=" . $app->resume_key : ""))
                : null;
            $uploadedUrl = $hasUploaded ? url("/storage/" . $app->resume_path) : null;
            $primaryUrl  = ($app->resume_type === 'builder' && $createdUrl) ? $createdUrl : ($uploadedUrl ?? $createdUrl);

            return [
                "id"                   => $app->id,
                "status"               => $app->status,
                "applied_at"           => $app->applied_at?->format("Y-m-d H:i"),
                "resume_type"          => $app->resume_type ?? ($hasUploaded ? 'uploaded' : 'builder'),
                "resume_key"           => $app->resume_key,
                "resume_url"           => $primaryUrl,
                "uploaded_resume_url"  => $uploadedUrl,
                "created_resume_url"   => $createdUrl,
                "has_uploaded_resume"  => $hasUploaded,
                "has_created_resume"   => $hasCreated,
                "job"                  => [
                    "id"       => $app->job?->id,
                    "title"    => $app->job?->title,
                    "company"  => $app->job?->company?->name,
                ],
                "student"              => [
                    "id"                  => $app->student?->user_id ?? $app->student?->id,
                    "student_id"          => $app->student?->id,
                    "name"                => $app->student?->user?->name ?? "Student",
                    "email"               => $app->student?->user?->email ?? "N/A",
                    "mobile"              => $app->student?->mobile ?? "N/A",
                    "phone"               => $app->student?->mobile ?? "N/A",
                    "dob"                 => $app->student?->dob?->format('Y-m-d') ?? "N/A",
                    "gender"              => $app->student?->gender ?? "N/A",
                    "address"             => $app->student?->address ?? "N/A",
                    "institute"           => $app->student?->institute?->name ?? $app->student?->other_institute_name ?? "N/A",
                    "course"              => $app->student?->course ?? "N/A",
                    "branch"              => $app->student?->branch ?? "N/A",
                    "batch"               => $app->student?->batch ?? "N/A",
                    "passing_year"        => $app->student?->passing_year ?? "N/A",
                    "cgpa"                => $app->student?->cgpa ?? "N/A",
                    "skills"              => $app->student?->skills ?? [],
                    "softSkills"          => $app->student?->soft_skills ?? [],
                    "soft_skills"         => $app->student?->soft_skills ?? [],
                    "profileCompletion"   => $app->student?->profile_completion ?? 100,
                    "profile_completion"  => $app->student?->profile_completion ?? 100,
                    "resumeUrl"           => $primaryUrl,
                    "uploadedResumeUrl"   => $uploadedUrl,
                    "createdResumeUrl"    => $createdUrl,
                    "hasUploaded"         => $hasUploaded,
                    "hasCreated"          => $hasCreated,
                    "linkedin"            => $app->student?->linkedin ?? "",
                    "github"              => $app->student?->github ?? "",
                    "portfolio"           => $app->student?->portfolio ?? "",
                ],
            ];
        });

        return response()->json([
            "data" => $data,
        ]);
    }

    // POST /api/admin/send-to-company
    public function sendToCompany(Request $request): JsonResponse
    {
        $request->validate([
            'job_id' => 'required|exists:placement_jobs,id',
        ]);

        $result = $this->exportService->sendApplicantsEmail((int) $request->job_id);

        if ($result['success']) {
            return response()->json(['message' => $result['message']]);
        }

        return response()->json(['message' => $result['message']], 500);
    }
}
