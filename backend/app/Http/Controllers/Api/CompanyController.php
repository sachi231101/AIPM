<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CompanyJobRequest;
use App\Models\Company;
use App\Models\Notification;
use App\Models\PlacementJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    // ───────── POST /api/company/job-request ─────────

    public function submitJob(CompanyJobRequest $request): JsonResponse
    {
        // 1. Find or create company by hr_email
        $company = Company::firstOrCreate(
            ['hr_email' => $request->hr_email],
            [
                'name'    => $request->company_name,
                'hr_name' => $request->hr_name,
                'phone'   => $request->phone,
                'website' => $request->website,
                'industry'=> $request->industry,
            ]
        );

        // 2. Handle logo upload
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('company-logos', 'public');
            $company->update(['logo_path' => $logoPath]);
        }

        // 3. Create the job (status = pending by default, or published if auto-approve is enabled for registered companies)
        $autoApprove = filter_var(
            \Illuminate\Support\Facades\DB::table('settings')->where('key', 'auto_approve_companies')->value('value') ?? '0',
            FILTER_VALIDATE_BOOLEAN
        );

        $status = 'pending';
        $message = 'Job request submitted successfully. It will be reviewed by the admin.';

        if ($autoApprove && !$company->wasRecentlyCreated) {
            $status = 'published';
            $message = 'Job request submitted and automatically approved! 🎉';
        }

        $job = PlacementJob::create([
            'company_id'  => $company->id,
            'title'       => $request->title,
            'description' => $request->description,
            'eligibility' => $request->eligibility,
            'skills'      => $request->skills ?? [],
            'experience'  => $request->experience,
            'salary'      => $request->salary,
            'location'    => $request->location,
            'openings'    => $request->openings ?? 1,
            'last_date'   => $request->last_date,
            'status'      => $status,
        ]);

        if ($status === 'published') {
            $allInstituteIds = \App\Models\Institute::pluck('id')->toArray();
            $job->institutes()->sync($allInstituteIds);
        }

        // Create admin notification
        Notification::create([
            'type'    => 'new_job',
            'title'   => 'New Job Request',
            'message' => $company->name . ($status === 'published' ? ' posted a job: ' : ' submitted a job: ') . $job->title,
            'link'    => '/admin/jobs',
        ]);

        return response()->json([
            'message' => $message,
        ], 201);
    }
}
