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
            'hr_email'     => 'required|email|max:255|unique:companies,hr_email',
            'password'     => 'required|string|min:6',
            'industry'     => 'nullable|string',
            'phone'        => 'nullable|string',
            'website'      => 'nullable|string',
        ]);

        $company = Company::create([
            'name'     => $validated['company_name'],
            'hr_name'  => $validated['hr_name'],
            'hr_email' => $validated['hr_email'],
            'phone'    => $validated['phone'] ?? null,
            'website'  => $validated['website'] ?? null,
            'industry' => $validated['industry'] ?? 'Technology & Software',
            'password' => Hash::make($validated['password']),
            'status'   => 'approved',
        ]);

        $token = $company->createToken('company_token')->plainTextToken;

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
                    'hr_name'      => $company->hr_name,
                    'email'        => $company->hr_email,
                    'phone'        => $company->phone,
                    'website'      => $company->website,
                    'industry'     => $company->industry,
                    'role'         => 'company',
                ],
                'token'   => $token,
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

        if (!$company || !Hash::check($validated['password'], $company->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid email address or password.',
            ], 401);
        }

        $token = $company->createToken('company_token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Company login successful.',
            'data'    => [
                'company' => $company,
                'user'    => [
                    'id'           => $company->id,
                    'name'         => $company->name,
                    'company_name' => $company->name,
                    'hr_name'      => $company->hr_name,
                    'email'        => $company->hr_email,
                    'phone'        => $company->phone,
                    'website'      => $company->website,
                    'industry'     => $company->industry,
                    'role'         => 'company',
                ],
                'token'   => $token,
            ]
        ]);
    }

    // ───────── GET /api/company/profile ─────────
    public function getProfile(Request $request): JsonResponse
    {
        $company = $request->user();

        if (!$company || !($company instanceof Company)) {
            $email = $request->query('email') ?? $request->query('hr_email');
            if ($email) {
                $company = Company::where('hr_email', $email)->first();
            }
            if (!$company) {
                $company = Company::first();
            }
        }

        return response()->json([
            'status' => 'success',
            'data'   => $company,
        ]);
    }

    // ───────── PUT /api/company/profile ─────────
    public function updateProfile(Request $request): JsonResponse
    {
        $company = $request->user();

        if (!$company || !($company instanceof Company)) {
            $email = $request->input('hr_email') ?? $request->input('hrEmail') ?? $request->input('email');
            if ($email) {
                $company = Company::where('hr_email', $email)->first();
            }
            if (!$company) {
                $company = Company::first();
            }
        }

        if (!$company) {
            $company = new Company();
            $company->status = 'approved';
        }

        $company->fill([
            'name'           => $request->input('companyName') ?? $request->input('name') ?? $company->name ?? 'Company Name',
            'industry'       => $request->input('industry') ?? $company->industry ?? 'Technology & Software',
            'website'        => $request->input('website') ?? $company->website,
            'hr_name'        => $request->input('hrName') ?? $request->input('hr_name') ?? $company->hr_name ?? 'HR Representative',
            'hr_email'       => $request->input('hrEmail') ?? $request->input('hr_email') ?? $company->hr_email ?? 'hr@company.com',
            'phone'          => $request->input('hrMobile') ?? $request->input('phone') ?? $company->phone,
            'office_address' => $request->input('officeAddress') ?? $request->input('office_address') ?? $company->office_address,
            'city'           => $request->input('city') ?? $company->city,
            'state'          => $request->input('state') ?? $company->state,
            'about_company'  => $request->input('aboutCompany') ?? $request->input('about_company') ?? $company->about_company,
        ]);

        if ($request->filled('logo')) {
            $logoInput = $request->input('logo');
            if (str_starts_with($logoInput, 'data:image')) {
                try {
                    @list($type, $file_data) = explode(';', $logoInput);
                    @list(, $file_data) = explode(',', $file_data);
                    if ($file_data) {
                        $extension = 'png';
                        if (str_contains($type, 'jpeg') || str_contains($type, 'jpg')) {
                            $extension = 'jpg';
                        }
                        $fileName = 'logo_' . ($company->id ?? time()) . '_' . time() . '.' . $extension;
                        Storage::disk('public')->put('company-logos/' . $fileName, base64_decode($file_data));
                        $company->logo_path = 'company-logos/' . $fileName;
                    }
                } catch (\Throwable $e) {
                    $company->logo_path = $logoInput;
                }
            } else {
                $company->logo_path = $logoInput;
            }
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
        $company = $request->user();
        $companyId = ($company && $company instanceof Company) ? $company->id : $request->query('company_id');

        $query = PlacementJob::with('company')->withCount('applications')->latest();
        if ($companyId) {
            $query->where('company_id', $companyId);
        }
        $jobs = $query->get()->map(function ($job) {
            $logo = $job->company?->logo_path;
            $logoUrl = $logo ? (str_starts_with($logo, 'data:') || str_starts_with($logo, 'http') ? $logo : url('/storage/' . $logo)) : null;
            $job->company_logo = $logoUrl;
            return $job;
        });

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
        ]);

        $user = $request->user();
        $companyId = ($user && $user instanceof Company) ? $user->id : ($request->input('company_id') ?? Company::first()?->id ?? 1);
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

    // ───────── PUT /api/company/jobs/{id} ─────────
    public function updateJob(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $companyId = ($user && $user instanceof Company) ? $user->id : null;

        $jobQuery = PlacementJob::query();
        if ($companyId) {
            $jobQuery->where('company_id', $companyId);
        }
        $job = $jobQuery->findOrFail($id);

        $updateData = $request->only([
            'title', 'description', 'eligibility', 'skills', 'experience',
            'salary', 'location', 'openings', 'last_date'
        ]);

        $requestedStatus = $request->input('status');
        if ($requestedStatus === 'closed') {
            $updateData['status'] = 'closed';
        } elseif ($requestedStatus === 'draft') {
            $updateData['status'] = 'draft';
        } else {
            // Any edit or submission by company requires Admin approval
            $updateData['status'] = 'pending';
        }

        $job->update($updateData);

        // Notify Admin of job update requiring approval
        Notification::create([
            'type'    => 'job_updated',
            'title'   => 'Job Posting Updated for Approval',
            'message' => ($job->company?->name ?? 'Company') . ' updated job: "' . $job->title . '". Admin approval required before publishing.',
            'link'    => '/admin/jobs',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Job information saved! Submitted to Admin for approval.',
            'data'    => $job,
        ]);
    }

    // ───────── DELETE /api/company/jobs/{id} ─────────
    public function deleteJob(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $companyId = ($user && $user instanceof Company) ? $user->id : null;

        $jobQuery = PlacementJob::query();
        if ($companyId) {
            $jobQuery->where('company_id', $companyId);
        }
        $job = $jobQuery->findOrFail($id);
        $job->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Job deleted successfully.',
        ]);
    }

    // ───────── GET /api/company/applications ─────────
    public function getApplications(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = ($user && $user instanceof Company) ? $user->id : Company::first()?->id;

        $jobIds = PlacementJob::where('company_id', $companyId)->pluck('id');
        $applications = Application::whereIn('job_id', $jobIds)
            ->with(['student.user', 'job'])
            ->latest()
            ->get()
            ->map(function ($app) {
                return [
                    'id'          => $app->id,
                    'job_id'      => $app->job_id,
                    'jobTitle'    => $app->job?->title ?? 'Software Engineer',
                    'student'     => [
                        'id'         => $app->student?->id,
                        'name'       => $app->student?->user?->name ?? 'Candidate',
                        'email'      => $app->student?->user?->email,
                        'phone'      => $app->student?->phone,
                        'course'     => $app->student?->course ?? 'B.Tech CS',
                        'cgpa'       => $app->student?->cgpa ?? '8.5',
                        'skills'     => $app->student?->skills ?? ['React', 'Node.js'],
                    ],
                    'appliedDate' => $app->created_at->format('M d, Y'),
                    'status'      => $app->status ?? 'pending',
                    'resume_path' => $app->resume_path ? url('/storage/' . $app->resume_path) : null,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data'   => $applications,
        ]);
    }

    // ───────── PUT /api/company/applications/{id}/status ─────────
    public function updateApplicationStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => 'required|string']);
        $application = Application::findOrFail($id);
        $application->status = $request->status;
        $application->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Application status updated to ' . $request->status,
            'data'    => $application,
        ]);
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
