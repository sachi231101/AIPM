<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CompanyJobRequest;
use App\Models\Company;
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

        // 3. Create the job (status = pending by default)
        PlacementJob::create([
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
        ]);

        return response()->json([
            'message' => 'Job request submitted successfully. It will be reviewed by the admin.',
        ], 201);
    }
}
