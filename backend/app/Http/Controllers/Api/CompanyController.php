<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CompanyJobRequest;
use App\Models\Company;
use App\Models\Notification;
use App\Models\PlacementJob;
use App\Models\Application;
use App\Models\Otp;
use App\Mail\CompanyOtpMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    // ───────── HELPER METHODS FOR EMAIL OTP ─────────

    protected function sendEmailOtp(string $email, string $actionType = 'login', string $companyName = ''): array
    {
        $email = strtolower(trim($email));

        // Rate Limit: Check if OTP was sent in the last 30 seconds
        $recentOtp = Otp::where('email', $email)
            ->where('created_at', '>=', now()->subSeconds(30))
            ->first();

        if ($recentOtp) {
            $secondsLeft = 30 - now()->diffInSeconds($recentOtp->created_at);
            throw new \Exception("Please wait {$secondsLeft} seconds before requesting a new verification code.", 429);
        }

        // Invalidate previous unverified OTPs for this email
        Otp::where('email', $email)->where('verified', false)->delete();

        // Generate 6-digit OTP
        $rawOtp = sprintf('%06d', random_int(100000, 999999));

        // Store in DB
        Otp::create([
            'email'      => $email,
            'otp'        => Hash::make($rawOtp),
            'expires_at' => now()->addMinutes(10),
            'attempts'   => 0,
            'verified'   => false,
        ]);

        // Send Email
        try {
            Mail::to($email)->send(new CompanyOtpMail($rawOtp, $actionType, $companyName));
        } catch (\Throwable $e) {
            Log::error("Failed to send OTP mail to {$email}: " . $e->getMessage());
        }

        return [
            'status' => 'success',
            'message' => "Verification code sent to your HR email address {$email}.",
            'email' => $email,
        ];
    }

    protected function verifyEmailOtpCode(string $email, string $inputOtp): void
    {
        $email = strtolower(trim($email));
        $inputOtp = trim($inputOtp);

        // Clean up expired OTPs
        Otp::where('expires_at', '<', now())->delete();

        $otpRecord = Otp::where('email', $email)
            ->where('verified', false)
            ->latest()
            ->first();

        if (!$otpRecord) {
            throw new \Exception("Invalid or expired verification code. Please request a new code.", 422);
        }

        if ($otpRecord->isExpired()) {
            $otpRecord->delete();
            throw new \Exception("Verification code has expired. Please request a new code.", 422);
        }

        if ($otpRecord->attempts >= 5) {
            $otpRecord->delete();
            throw new \Exception("Too many invalid attempts. This code has been invalidated. Please request a new code.", 422);
        }

        if (!Hash::check($inputOtp, $otpRecord->otp)) {
            $otpRecord->increment('attempts');
            $remaining = 5 - $otpRecord->attempts;

            if ($remaining <= 0) {
                $otpRecord->delete();
                throw new \Exception("Invalid verification code. Maximum attempts reached. Please request a new code.", 422);
            }

            throw new \Exception("Invalid verification code. You have {$remaining} attempt(s) remaining.", 422);
        }

        // Mark OTP as verified and delete
        $otpRecord->update(['verified' => true]);
        Otp::where('email', $email)->delete();
    }

    // ───────── POST /api/company/register/send-otp ─────────
    public function registerSendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'hr_name' => 'required|string|max:255',
            'hr_email' => 'required|email|max:255|unique:companies,hr_email',
            'password' => 'required|string|min:6',
            'industry' => 'nullable|string',
            'phone' => 'nullable|string',
            'website' => 'required|string|max:255',
        ], [
            'hr_email.unique' => 'This HR Email address is already registered. Please sign in.',
            'website.required' => 'Company Website is required.',
        ]);

        $email = strtolower(trim($validated['hr_email']));

        // Cache registration payload for 15 minutes
        Cache::put('reg_pending_company_' . $email, $validated, 900);

        try {
            $result = $this->sendEmailOtp($email, 'registration', $validated['company_name']);
            return response()->json($result);
        } catch (\Exception $e) {
            Cache::forget('reg_pending_company_' . $email);
            $code = is_numeric($e->getCode()) && $e->getCode() >= 400 && $e->getCode() < 600 ? (int)$e->getCode() : 400;
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], $code);
        }
    }

    // ───────── POST /api/company/register/verify-otp ─────────
    public function registerVerifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        $email = strtolower(trim($request->email));

        $regData = Cache::get('reg_pending_company_' . $email);
        if (!$regData) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Registration session expired. Please start registration again.'
            ], 422);
        }

        try {
            $this->verifyEmailOtpCode($email, $request->otp);
        } catch (\Exception $e) {
            $code = is_numeric($e->getCode()) && $e->getCode() >= 400 && $e->getCode() < 600 ? (int)$e->getCode() : 422;
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], $code);
        }

        // Create the company record
        $company = Company::create([
            'name' => $regData['company_name'],
            'hr_name' => $regData['hr_name'],
            'hr_email' => $regData['hr_email'],
            'phone' => $regData['phone'] ?? null,
            'website' => $regData['website'] ?? null,
            'industry' => $regData['industry'] ?? 'Technology & Software',
            'password' => Hash::make($regData['password']),
            'status' => 'approved',
        ]);

        Cache::forget('reg_pending_company_' . $email);

        $token = $company->createToken('company_token')->plainTextToken;

        // Notify Admin
        Notification::create([
            'type' => 'new_company',
            'title' => 'New Company Registered',
            'message' => 'Company "' . $company->name . '" registered on the placement portal.',
            'link' => '/admin/companies',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Company registration & email verification successful.',
            'data' => [
                'company' => $company,
                'user' => [
                    'id' => $company->id,
                    'name' => $company->name,
                    'company_name' => $company->name,
                    'hr_name' => $company->hr_name,
                    'email' => $company->hr_email,
                    'phone' => $company->phone,
                    'website' => $company->website,
                    'industry' => $company->industry,
                    'role' => 'company',
                ],
                'token' => $token,
            ]
        ], 201);
    }

    // ───────── POST /api/company/register/resend-otp ─────────
    public function registerResendOtp(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        $email = strtolower(trim($request->email));

        $regData = Cache::get('reg_pending_company_' . $email);
        if (!$regData) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Registration session expired. Please start registration again.'
            ], 422);
        }

        try {
            $result = $this->sendEmailOtp($email, 'registration', $regData['company_name'] ?? '');
            return response()->json($result);
        } catch (\Exception $e) {
            $code = is_numeric($e->getCode()) && $e->getCode() >= 400 && $e->getCode() < 600 ? (int)$e->getCode() : 400;
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], $code);
        }
    }

    // ───────── POST /api/company/register (Legacy Direct Fallback) ─────────
    public function register(Request $request): JsonResponse
    {
        return $this->registerSendOtp($request);
    }

    // ───────── POST /api/company/login ─────────
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $email = strtolower(trim($validated['email']));
        $company = Company::where('hr_email', $email)->first();

        if (!$company || !Hash::check($validated['password'], $company->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid email address or password.',
            ], 401);
        }

        $token = $company->createToken('company_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Company login successful.',
            'data' => [
                'company' => $company,
                'user' => [
                    'id' => $company->id,
                    'name' => $company->name,
                    'company_name' => $company->name,
                    'hr_name' => $company->hr_name,
                    'email' => $company->hr_email,
                    'phone' => $company->phone,
                    'website' => $company->website,
                    'industry' => $company->industry,
                    'role' => 'company',
                ],
                'token' => $token,
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

        if (!$company) {
            return response()->json(['status' => 'success', 'data' => null]);
        }

        $logo = $company->logo_path;
        $logoUrl = $logo ? (str_starts_with($logo, 'data:') || str_starts_with($logo, 'http') ? $logo : url('/storage/' . ltrim($logo, '/'))) : null;

        $data = array_merge($company->toArray(), [
            'logo_url' => $logoUrl,
            'logo_path' => $logoUrl ?? $company->logo_path,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $data,
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
            'name' => $request->input('companyName') ?? $request->input('name') ?? $company->name ?? 'Company Name',
            'industry' => $request->input('industry') ?? $company->industry ?? 'Technology & Software',
            'website' => $request->input('website') ?? $company->website,
            'hr_name' => $request->input('hrName') ?? $request->input('hr_name') ?? $company->hr_name ?? 'HR Representative',
            'hr_email' => $request->input('hrEmail') ?? $request->input('hr_email') ?? $company->hr_email ?? 'hr@company.com',
            'phone' => $request->input('hrMobile') ?? $request->input('phone') ?? $company->phone,
            'office_address' => $request->input('officeAddress') ?? $request->input('office_address') ?? $company->office_address,
            'city' => $request->input('city') ?? $company->city,
            'state' => $request->input('state') ?? $company->state,
            'about_company' => $request->input('aboutCompany') ?? $request->input('about_company') ?? $company->about_company,
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

        $logo = $company->logo_path;
        $logoUrl = $logo ? (str_starts_with($logo, 'data:') || str_starts_with($logo, 'http') ? $logo : url('/storage/' . ltrim($logo, '/'))) : null;

        $data = array_merge($company->toArray(), [
            'logo_url' => $logoUrl,
            'logo_path' => $logoUrl ?? $company->logo_path,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Company profile updated successfully.',
            'data' => $data,
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
            'data' => $jobs,
        ]);
    }

    // ───────── POST /api/company/jobs ─────────
    public function createJob(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'location'         => 'required|string',
            'employmentType'   => 'nullable|string',
            'employment_type'  => 'nullable|string',
            'experience'       => 'nullable|string',
            'salary'           => 'nullable|string',
            'vacancies'        => 'nullable|integer',
            'last_date'        => 'nullable|date',
            'skills'           => 'nullable|array',
            'description'      => 'nullable|string',
            'responsibilities' => 'nullable|string',
            'status'           => 'nullable|string',
        ]);

        $user = $request->user();
        $companyId = ($user && $user instanceof Company) ? $user->id : ($request->input('company_id') ?? Company::first()?->id ?? 1);
        $company = Company::find($companyId);

        $eligibilityInput = $request->input('eligibility') ?? $request->input('eligibleCourses') ?? $request->input('eligible_courses');
        $eligibilityVal = $eligibilityInput
            ? (is_array($eligibilityInput) ? implode(', ', array_filter(array_map('trim', $eligibilityInput))) : trim($eligibilityInput))
            : 'B.Tech, BCA, MCA';

        $jobStatus = $validated['status'] ?? $request->input('status') ?? 'pending';

        $job = PlacementJob::create([
            'company_id'       => $companyId,
            'title'            => $validated['title'],
            'description'      => $validated['description'] ?? '',
            'responsibilities' => $validated['responsibilities'] ?? $request->input('responsibilities') ?? '',
            'eligibility'      => $eligibilityVal,
            'skills'           => $validated['skills'] ?? [],
            'experience'       => $validated['experience'] ?? '0-2 Years',
            'salary'           => $validated['salary'] ?? 'Not Disclosed',
            'location'         => $validated['location'],
            'employment_type'  => $validated['employmentType'] ?? $validated['employment_type'] ?? 'Full Time',
            'openings'         => $validated['vacancies'] ?? 1,
            'last_date'        => $validated['last_date'] ?? now()->addDays(30),
            'status'           => $jobStatus,
        ]);

        if ($jobStatus !== 'draft') {
            // Create Admin Notification
            Notification::create([
                'type' => 'new_job',
                'title' => 'New Job Posted for Approval',
                'message' => ($company?->name ?? 'Company') . ' posted a job: "' . $job->title . '". Approval required.',
                'link' => '/admin/jobs',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => $jobStatus === 'draft' ? 'Job saved as draft successfully!' : 'Job posted successfully! Submitted to Admin for approval.',
            'data' => $job,
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

        $updateData = [];

        if ($request->has('title'))            $updateData['title'] = $request->input('title');
        if ($request->has('description'))      $updateData['description'] = $request->input('description');
        if ($request->has('responsibilities')) $updateData['responsibilities'] = $request->input('responsibilities');
        if ($request->has('experience'))       $updateData['experience'] = $request->input('experience');
        if ($request->has('salary'))           $updateData['salary'] = $request->input('salary');
        if ($request->has('location'))         $updateData['location'] = $request->input('location');
        if ($request->has('employmentType'))   $updateData['employment_type'] = $request->input('employmentType');
        if ($request->has('employment_type'))  $updateData['employment_type'] = $request->input('employment_type');
        if ($request->has('last_date'))        $updateData['last_date'] = $request->input('last_date');

        if ($request->has('skills')) {
            $skillsInput = $request->input('skills');
            if (is_array($skillsInput)) {
                $updateData['skills'] = array_values(array_filter(array_map('trim', $skillsInput)));
            } elseif (is_string($skillsInput)) {
                $updateData['skills'] = array_values(array_filter(array_map('trim', explode(',', $skillsInput))));
            }
        }

        // Handle vacancies / openings mapping
        if ($request->has('openings')) {
            $updateData['openings'] = (int) $request->input('openings');
        } elseif ($request->has('vacancies')) {
            $updateData['openings'] = (int) $request->input('vacancies');
        }

        // Handle eligibility / eligibleCourses / eligible_courses mapping
        if ($request->has('eligibility') || $request->has('eligibleCourses') || $request->has('eligible_courses')) {
            $el = $request->input('eligibility') ?? $request->input('eligibleCourses') ?? $request->input('eligible_courses');
            $updateData['eligibility'] = is_array($el) ? implode(', ', array_filter(array_map('trim', $el))) : trim($el);
        }

        $requestedStatus = $request->input('status');
        if ($requestedStatus === 'closed') {
            $updateData['status'] = 'closed';
        } elseif ($requestedStatus === 'draft') {
            $updateData['status'] = 'draft';
        } elseif ($requestedStatus === 'published' || $requestedStatus === 'approved') {
            $updateData['status'] = $requestedStatus;
        } else {
            // One-time Admin Approval: If job was ALREADY approved or published, preserve published status!
            if (in_array($job->status, ['published', 'approved'])) {
                $updateData['status'] = $job->status;
            } else {
                $updateData['status'] = 'pending';
            }
        }

        $job->update($updateData);
        $freshJob = $job->fresh();
        $isPublished = in_array($freshJob->status, ['published', 'approved']);

        if ($isPublished) {
            $allInstituteIds = \App\Models\Institute::pluck('id')->toArray();
            if (!empty($allInstituteIds)) {
                $freshJob->institutes()->sync($allInstituteIds);
            }
        }

        // Notify Admin of job update
        Notification::create([
            'type' => 'job_updated',
            'title' => $isPublished ? 'Job Posting Updated' : 'Job Posting Updated for Approval',
            'message' => ($freshJob->company?->name ?? 'Company') . ' updated job: "' . $freshJob->title . '"' . ($isPublished ? '.' : '. Admin approval required.'),
            'link' => '/admin/jobs',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $isPublished 
                ? 'Job information updated and published directly!' 
                : 'Job information saved! Submitted to Admin for approval.',
            'data'    => $freshJob->load('company'),
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
            'status' => 'success',
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
            ->with(['student.user', 'student.institute', 'job', 'profile'])
            ->latest()
            ->get()
            ->map(function ($app) {
                // Fetch student resume content if available
                $studentResume = \App\Models\StudentResume::where('student_id', $app->student_id)
                    ->where(function ($q) use ($app) {
                        if ($app->resume_key) {
                            $q->where('resume_key', $app->resume_key);
                        } elseif ($app->student_profile_id) {
                            $q->where('student_profile_id', $app->student_profile_id);
                        }
                    })->first();

                if (!$studentResume) {
                    $studentResume = \App\Models\StudentResume::where('student_id', $app->student_id)->latest()->first();
                }

                $resumeContent = $studentResume?->content ?? [];

                $skillsData = $resumeContent['skills'] ?? null;
                if (!$skillsData) {
                    $rawSkills = $app->profile?->skills ?? $app->student?->skills ?? ['Problem Solving', 'Teamwork'];
                    $skillsList = is_array($rawSkills) ? $rawSkills : array_filter(array_map('trim', explode(',', (string)$rawSkills)));
                    $skillsData = ['technical' => $skillsList];
                }

                $educationData = $resumeContent['education'] ?? null;
                if (!$educationData || empty($educationData)) {
                    $educationData = [
                        [
                            'degree'         => $app->profile?->course ?? $app->student?->course ?? 'B.Tech',
                            'specialization' => $app->profile?->branch ?? $app->student?->branch ?? 'Computer Science',
                            'college'        => $app->student?->institute?->name ?? 'Placement Institute',
                            'startYear'      => '2022',
                            'endYear'        => (string)($app->profile?->passing_year ?? $app->student?->passing_year ?? '2026'),
                            'cgpa'           => (string)($app->profile?->cgpa ?? $app->student?->cgpa ?? '8.5'),
                        ]
                    ];
                }

                $photo = $app->student?->profile_photo;
                $photoUrl = $photo ? (str_starts_with($photo, 'http') || str_starts_with($photo, 'data:') ? $photo : url('/storage/' . ltrim($photo, '/'))) : null;

                $resumePath = $app->resume_path ?? $app->profile?->resume_path ?? $app->student?->resume_path;
                $resumeUrl = $resumePath ? (str_starts_with($resumePath, 'http') ? $resumePath : url('/storage/' . ltrim($resumePath, '/'))) : null;

                $careerProfile = [
                    'personal' => [
                        'fullName'          => $app->student?->user?->name ?? $app->student?->name ?? 'Candidate',
                        'professionalTitle' => $app->profile?->professional_title ?? $app->profile?->profile_name ?? 'Software Engineer',
                        'email'             => $app->student?->user?->email ?? $app->student?->email ?? '',
                        'phone'             => $app->student?->mobile ?? $app->student?->phone ?? '',
                        'location'          => $app->student?->address ?? 'Bengaluru, India',
                        'github'            => $app->profile?->github ?? $app->student?->github ?? '',
                        'linkedin'          => $app->profile?->linkedin ?? $app->student?->linkedin ?? '',
                        'portfolio'         => $app->profile?->portfolio ?? $app->student?->portfolio ?? '',
                        'photo'             => $photoUrl,
                    ],
                    'summary'        => $resumeContent['summary'] ?? $app->profile?->summary ?? 'Passionate candidate with strong analytical and programming capabilities.',
                    'skills'         => $skillsData,
                    'education'      => $educationData,
                    'projects'       => $resumeContent['projects'] ?? [],
                    'experience'     => $resumeContent['experience'] ?? [],
                    'certifications' => $resumeContent['certifications'] ?? [],
                ];

                return [
                    'id'            => $app->id,
                    'job_id'        => $app->job_id,
                    'jobTitle'      => $app->job?->title ?? 'Software Engineer',
                    'student'       => [
                        'id'          => $app->student?->id,
                        'name'        => $app->student?->user?->name ?? 'Candidate',
                        'email'       => $app->student?->user?->email,
                        'phone'       => $app->student?->mobile,
                        'mobile'      => $app->student?->mobile,
                        'course'      => $app->profile?->course ?? $app->student?->course ?? 'B.Tech CS',
                        'cgpa'        => $app->profile?->cgpa ?? $app->student?->cgpa ?? '8.5',
                        'skills'      => $app->profile?->skills ?? $app->student?->skills ?? ['React', 'Node.js'],
                        'target_role' => $app->profile?->professional_title ?? $app->profile?->profile_name ?? 'Candidate',
                    ],
                    'careerProfile' => $careerProfile,
                    'resume'        => $careerProfile,
                    'appliedDate'   => $app->created_at->format('M d, Y'),
                    'status'        => $app->status ?? 'pending',
                    'resume_path'   => $resumeUrl,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $applications,
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
            'status' => 'success',
            'message' => 'Application status updated to ' . $request->status,
            'data' => $application,
        ]);
    }

    // ───────── POST /api/company/job-request ─────────
    public function submitJob(CompanyJobRequest $request): JsonResponse
    {
        $company = Company::firstOrCreate(
            ['hr_email' => $request->hr_email],
            [
                'name' => $request->company_name,
                'hr_name' => $request->hr_name,
                'phone' => $request->phone,
                'website' => $request->website,
                'industry' => $request->industry,
            ]
        );

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('company-logos', 'public');
            $company->update(['logo_path' => $logoPath]);
        }

        $job = PlacementJob::create([
            'company_id' => $company->id,
            'title' => $request->title,
            'description' => $request->description,
            'eligibility' => $request->eligibility,
            'skills' => $request->skills ?? [],
            'experience' => $request->experience,
            'salary' => $request->salary ? trim($request->salary) : 'Not Disclosed',
            'location' => $request->location,
            'openings' => $request->openings ?? 1,
            'last_date' => $request->last_date,
            'status' => 'pending',
        ]);

        Notification::create([
            'type' => 'new_job',
            'title' => 'New Job Request Submitted',
            'message' => $company->name . ' submitted a job request: ' . $job->title,
            'link' => '/admin/jobs',
        ]);

        return response()->json([
            'message' => 'Job request submitted successfully. It will be reviewed by the admin.',
            'data' => $job,
        ], 201);
    }

    // ───────── GET /api/companies ─────────
    public function index(): JsonResponse
    {
        $companies = Company::withCount([
            'jobs' => function ($q) {
                $q->where('status', 'published');
            }
        ])->latest()->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'industry' => $c->industry ?? 'Technology',
                'location' => $c->city ? ($c->city . ', ' . $c->state) : 'India',
                'website' => $c->website,
                'logo_url' => $c->logo_path ? (str_starts_with($c->logo_path, 'data:') ? $c->logo_path : url('/storage/' . $c->logo_path)) : null,
                'logo' => $c->logo_path ? (str_starts_with($c->logo_path, 'data:') ? $c->logo_path : url('/storage/' . $c->logo_path)) : null,
                'open_jobs' => $c->jobs_count ?? 0,
            ];
        });

        return response()->json([
            'message' => 'Companies retrieved successfully.',
            'data' => $companies,
        ]);
    }

    // ───────── PUT /api/company/change-password ─────────
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6',
        ]);

        $company = $request->user();

        if (!$company || !($company instanceof Company)) {
            $email = $request->input('email') ?? $request->input('hr_email');
            if ($email) {
                $company = Company::where('hr_email', $email)->first();
            }
            if (!$company) {
                $company = Company::first();
            }
        }

        if (!$company) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Company account not found.',
            ], 404);
        }

        $currentPassword = $request->input('current_password');

        // Check if existing password matches
        if ($company->password && !Hash::check($currentPassword, $company->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Current password does not match our records.',
            ], 422);
        }

        $company->password = Hash::make($request->input('new_password'));
        $company->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Password updated successfully! 🔒',
        ]);
    }

    // ───────── POST /api/company/forgot-password ─────────
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'        => 'required|email',
            'new_password' => 'required|string|min:6',
        ]);

        $company = Company::where('hr_email', trim($request->email))->first();

        if (!$company) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No company account found registered with email address "' . $request->email . '".',
            ], 404);
        }

        $company->password = Hash::make($request->input('new_password'));
        $company->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Password reset successfully! 🔑 You can now log in with your new password.',
        ]);
    }
}
