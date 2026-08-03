<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CompanyJobRequest;
use App\Models\Company;
use App\Models\Notification;
use App\Models\PlacementJob;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    // ───────── POST /api/company/register ─────────
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'hr_name'      => 'required|string|max:255',
            'hr_email'     => 'required|email|max:255',
            'password'     => 'required|string|min:6',
            'industry'     => 'nullable|string',
            'phone'        => 'nullable|string',
            'website'      => 'nullable|string',
        ]);

        $company = Company::updateOrCreate(
            ['hr_email' => $validated['hr_email']],
            [
                'name'       => $validated['company_name'],
                'hr_name'    => $validated['hr_name'],
                'phone'      => $validated['phone'] ?? null,
                'website'    => $validated['website'] ?? null,
                'industry'   => $validated['industry'] ?? 'Technology & Software',
                'password'   => Hash::make($validated['password']),
                'status'     => 'approved',
            ]
        );

        // Notify Admin of new company registration
        Notification::create([
            'type'    => 'new_company',
            'title'   => 'New Company Registered',
            'message' => 'Company "' . $company->name . '" registered on the placement portal.',
            'link'    => '/admin/companies',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Company registration successful.',
            'data'    => [
                'company' => $company,
                'user'    => [
                    'id'           => $company->id,
                    'name'         => $company->name,
                    'company_name' => $company->name,
                    'email'        => $company->hr_email,
                    'role'         => 'company',
                ],
                'token'   => 'company_token_' . $company->id . '_' . time(),
            ]
        ], 201);
    }

    // ───────── POST /api/company/login ─────────
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $company = Company::where('hr_email', $validated['email'])->first();

        if (!$company) {
            $company = Company::create([
                'name'     => explode('@', $validated['email'])[0] . ' Corp',
                'hr_name'  => 'HR Representative',
                'hr_email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'status'   => 'approved',
            ]);

            Notification::create([
                'type'    => 'new_company',
                'title'   => 'New Company Logged In',
                'message' => 'Company "' . $company->name . '" registered and logged in.',
                'link'    => '/admin/companies',
            ]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Company login successful.',
            'data'    => [
                'company' => $company,
                'user'    => [
                    'id'           => $company->id,
                    'name'         => $company->name,
                    'company_name' => $company->name,
                    'email'        => $company->hr_email,
                    'role'         => 'company',
                ],
                'token'   => 'company_token_' . $company->id . '_' . time(),
            ]
        ]);
    }

    // ───────── GET /api/company/profile ─────────
    public function getProfile(Request $request): JsonResponse
    {
        $email = $request->query('email') ?? $request->user()?->email;
        $company = Company::where('hr_email', $email)->first() ?? Company::first();

        return response()->json([
            'status' => 'success',
            'data'   => $company,
        ]);
    }

    // ───────── PUT /api/company/profile ─────────
    public function updateProfile(Request $request): JsonResponse
    {
        $email = $request->input('hr_email') ?? $request->user()?->email;
        $company = Company::where('hr_email', $email)->first();

        if (!$company) {
            $company = new Company();
        }

        $company->fill([
            'name'           => $request->input('companyName') ?? $request->input('name') ?? $company->name,
            'industry'       => $request->input('industry', $company->industry),
            'website'        => $request->input('website', $company->website),
            'hr_name'        => $request->input('hrName') ?? $request->input('hr_name') ?? $company->hr_name,
            'hr_email'       => $request->input('hrEmail') ?? $request->input('hr_email') ?? $company->hr_email,
            'phone'          => $request->input('hrMobile') ?? $request->input('phone') ?? $company->phone,
            'office_address' => $request->input('officeAddress') ?? $request->input('office_address') ?? $company->office_address,
            'city'           => $request->input('city', $company->city),
            'state'          => $request->input('state', $company->state),
            'about_company'  => $request->input('aboutCompany') ?? $request->input('about_company') ?? $company->about_company,
        ]);

        if ($request->has('logo') && str_starts_with($request->input('logo'), 'data:image')) {
            $company->logo_path = $request->input('logo');
        }

        $company->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Company profile updated successfully.',
            'data'    => $company,
        ]);
    }

    // ───────── GET /api/company/jobs ─────────
    public function getJobs(Request $request): JsonResponse
    {
        $companyId = $request->query('company_id');
        $query = PlacementJob::withCount('applications')->latest();
        if ($companyId) {
            $query->where('company_id', $companyId);
        }
        $jobs = $query->get();

        return response()->json([
            'status' => 'success',
            'data'   => $jobs,
        ]);
    }

    // ───────── POST /api/company/jobs ─────────
    public function createJob(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'location'         => 'required|string',
            'employmentType'   => 'nullable|string',
            'experience'       => 'nullable|string',
            'salary'           => 'nullable|string',
            'vacancies'        => 'nullable|integer',
            'last_date'        => 'nullable|date',
            'skills'           => 'nullable|array',
            'description'      => 'nullable|string',
            'status'           => 'nullable|string',
            'company_id'       => 'nullable|integer',
        ]);

        $companyId = $validated['company_id'] ?? Company::first()?->id ?? 1;
        $company = Company::find($companyId);

        $job = PlacementJob::create([
            'company_id'  => $companyId,
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? '',
            'eligibility' => $request->input('eligibleCourses') ? (is_array($request->input('eligibleCourses')) ? implode(', ', $request->input('eligibleCourses')) : $request->input('eligibleCourses')) : 'B.Tech, BCA, MCA',
            'skills'      => $validated['skills'] ?? [],
            'experience'  => $validated['experience'] ?? '0-2 Years',
            'salary'      => $validated['salary'] ?? 'Not Disclosed',
            'location'    => $validated['location'],
            'openings'    => $validated['vacancies'] ?? 1,
            'last_date'   => $validated['last_date'] ?? now()->addDays(30),
            'status'      => 'pending', // Pending Admin Approval
        ]);

        // Create Admin Notification
        Notification::create([
            'type'    => 'new_job',
            'title'   => 'New Job Posted for Approval',
            'message' => ($company?->name ?? 'Company') . ' posted a job: "' . $job->title . '". Approval required.',
            'link'    => '/admin/jobs',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Job posted successfully! Submitted to Admin for approval.',
            'data'    => $job,
        ], 201);
    }

    // ───────── POST /api/company/job-request ─────────
    public function submitJob(CompanyJobRequest $request): JsonResponse
    {
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

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('company-logos', 'public');
            $company->update(['logo_path' => $logoPath]);
        }

        $job = PlacementJob::create([
            'company_id'  => $company->id,
            'title'       => $request->title,
            'description' => $request->description,
            'eligibility' => $request->eligibility,
            'skills'      => $request->skills ?? [],
            'experience'  => $request->experience,
            'salary'      => $request->salary ? trim($request->salary) : 'Not Disclosed',
            'location'    => $request->location,
            'openings'    => $request->openings ?? 1,
            'last_date'   => $request->last_date,
            'status'      => 'pending',
        ]);

        Notification::create([
            'type'    => 'new_job',
            'title'   => 'New Job Request Submitted',
            'message' => $company->name . ' submitted a job request: ' . $job->title,
            'link'    => '/admin/jobs',
        ]);

        return response()->json([
            'message' => 'Job request submitted successfully. It will be reviewed by the admin.',
            'data'    => $job,
        ], 201);
    }

    // ───────── GET /api/companies ─────────
    public function index(): JsonResponse
    {
        $companies = Company::withCount(['jobs' => function ($q) {
            $q->where('status', 'published');
        }])->latest()->get()->map(function ($c) {
            return [
                'id'         => $c->id,
                'name'       => $c->name,
                'industry'   => $c->industry ?? 'Technology',
                'location'   => $c->city ? ($c->city . ', ' . $c->state) : 'India',
                'website'    => $c->website,
                'logo_url'   => $c->logo_path ? (str_starts_with($c->logo_path, 'data:') ? $c->logo_path : url('/storage/' . $c->logo_path)) : null,
                'logo'       => $c->logo_path ? (str_starts_with($c->logo_path, 'data:') ? $c->logo_path : url('/storage/' . $c->logo_path)) : null,
                'open_jobs'  => $c->jobs_count ?? 0,
            ];
        });

        return response()->json([
            'message' => 'Companies retrieved successfully.',
            'data'    => $companies,
        ]);
    }
}
