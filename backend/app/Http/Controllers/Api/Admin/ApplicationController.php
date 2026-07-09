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

    // GET /api/admin/jobs/{id}/applications
    public function index(int $jobId): JsonResponse
    {
        $job = PlacementJob::findOrFail($jobId);

        $applications = Application::with(['student.user', 'student.institute'])
            ->where('job_id', $jobId)
            ->latest('applied_at')
            ->get();

        $data = $applications->map(fn ($app) => [
            'id'           => $app->id,
            'status'       => $app->status,
            'applied_at'   => $app->applied_at?->format('Y-m-d H:i'),
            'resume_url'   => $app->resume_path ? Storage::url($app->resume_path) : null,
            'student'      => [
                'id'       => $app->student->id,
                'name'     => $app->student->user->name,
                'email'    => $app->student->user->email,
                'mobile'   => $app->student->mobile,
                'institute'=> $app->student->institute?->name ?? $app->student->other_institute_name,
                'course'   => $app->student->course,
                'branch'   => $app->student->branch,
                'cgpa'     => $app->student->cgpa,
            ],
        ]);

        return response()->json([
            'job'  => ['id' => $job->id, 'title' => $job->title],
            'data' => $data,
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
