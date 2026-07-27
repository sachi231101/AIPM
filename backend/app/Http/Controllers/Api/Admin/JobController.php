<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\PlacementJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    // GET /api/admin/jobs
    public function index(Request $request): JsonResponse
    {
        $jobs = PlacementJob::with('company')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(50);

        return response()->json(['data' => $jobs]);
    }

    // POST /api/admin/jobs
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'title'        => 'required|string|max:255',
            'description'  => 'required|string',
            'eligibility'  => 'required|string',
            'experience'   => 'required|string',
            'salary'       => 'required|string',
            'location'     => 'required|string',
            'openings'     => 'nullable|integer|min:1',
            'last_date'    => 'required|date',
            'skills'       => 'nullable',
            'status'       => 'nullable|string|in:published,pending,approved,closed',
            'hr_name'      => 'nullable|string',
            'hr_email'     => 'nullable|email',
            'phone'        => 'nullable|string',
            'logo'         => 'nullable|image|max:2048',
        ]);

        $company = Company::firstOrCreate(
            ['name' => trim($request->company_name)],
            [
                'hr_name'  => $request->hr_name ?? 'HR Manager',
                'hr_email' => $request->hr_email ?? strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $request->company_name)) . '@company.com',
                'phone'    => $request->phone ?? '9999999999',
            ]
        );

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('company-logos', 'public');
            $company->update(['logo_path' => $logoPath]);
        }

        $skillsRaw = $request->skills;
        if (is_string($skillsRaw)) {
            $skills = array_filter(array_map('trim', explode(',', $skillsRaw)));
        } elseif (is_array($skillsRaw)) {
            $skills = array_filter(array_map('trim', $skillsRaw));
        } else {
            $skills = [];
        }

        $job = PlacementJob::create([
            'company_id'  => $company->id,
            'title'       => trim($request->title),
            'description' => trim($request->description),
            'eligibility' => trim($request->eligibility),
            'skills'      => array_values($skills),
            'experience'  => trim($request->experience),
            'salary'      => trim($request->salary),
            'location'    => trim($request->location),
            'openings'    => (int) ($request->openings ?? 1),
            'last_date'   => $request->last_date,
            'status'      => $request->status ?? 'published',
        ]);

        return response()->json([
            'message' => 'Job drive created successfully! 🎉',
            'data'    => $job->load('company'),
        ], 201);
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
        $job = PlacementJob::findOrFail($id);
        $job->update(['status' => 'published']);

        return response()->json([
            'message' => 'Job published successfully.',
            'data'    => $job,
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
