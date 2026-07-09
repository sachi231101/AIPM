<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Institute;
use App\Models\PlacementJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    // GET /api/admin/jobs
    public function index(Request $request): JsonResponse
    {
        $jobs = PlacementJob::with('company', 'institutes')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20);

        return response()->json(['data' => $jobs]);
    }

    // PUT /api/admin/jobs/{id}/approve
    public function approve(int $id): JsonResponse
    {
        return $this->changeStatus($id, 'approved');
    }

    // PUT /api/admin/jobs/{id}/reject
    public function reject(int $id): JsonResponse
    {
        return $this->changeStatus($id, 'rejected');
    }

    // PUT /api/admin/jobs/{id}/close
    public function close(int $id): JsonResponse
    {
        return $this->changeStatus($id, 'closed');
    }

    // PUT /api/admin/jobs/{id}/publish
    public function publish(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'institute_ids'   => 'required|array|min:1',
            'institute_ids.*' => 'exists:institutes,id',
        ]);

        $job = PlacementJob::findOrFail($id);
        $job->update(['status' => 'published']);

        // Sync eligible institutes (admin decides, NOT the company)
        $job->institutes()->sync($request->institute_ids);

        return response()->json([
            'message' => 'Job published successfully.',
            'data'    => $job->load('institutes'),
        ]);
    }

    // ───────── Private helper ─────────
    private function changeStatus(int $id, string $status): JsonResponse
    {
        $job = PlacementJob::findOrFail($id);
        $job->update(['status' => $status]);

        return response()->json([
            'message' => "Job status changed to {$status}.",
            'data'    => $job,
        ]);
    }
}
