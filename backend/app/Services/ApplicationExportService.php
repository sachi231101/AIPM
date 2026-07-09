<?php

namespace App\Services;

use App\Exports\ApplicantsExport;
use App\Mail\ApplicantsListMail;
use App\Models\Application;
use App\Models\EmailLog;
use App\Models\PlacementJob;
use Illuminate\Support\Facades\Mail;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;

class ApplicationExportService
{
    /**
     * Generate an Excel file of applicants and email it to the company HR.
     */
    public function sendApplicantsEmail(int $jobId): array
    {
        try {
            $job = PlacementJob::with('company')->findOrFail($jobId);

            $applications = Application::with(['student.user', 'student.institute'])
                ->where('job_id', $jobId)
                ->get();

            if ($applications->isEmpty()) {
                return ['success' => false, 'message' => 'No applicants found for this job.'];
            }

            // 1. Generate Excel file
            $filename = 'applicants_job_' . $jobId . '_' . now()->format('Ymd_His') . '.xlsx';
            $filePath = 'email-exports/' . $filename;

            Excel::store(
                new ApplicantsExport($applications),
                $filePath,
                'local'
            );

            // 2. Send email
            $hrEmail = $job->company->hr_email;

            Mail::to($hrEmail)->send(new ApplicantsListMail($job, Storage::path($filePath)));

            // 3. Log the email
            EmailLog::create([
                'job_id'          => $jobId,
                'hr_email'        => $hrEmail,
                'sent_at'         => now(),
                'status'          => 'sent',
                'applicant_count' => $applications->count(),
                'notes'           => 'Applicant list sent for: ' . $job->title,
            ]);

            // Clean up the temp file
            Storage::delete($filePath);

            return [
                'success' => true,
                'message' => "Applicant list sent successfully to {$hrEmail}.",
            ];
        } catch (\Throwable $e) {
            // Log failure
            EmailLog::create([
                'job_id'  => $jobId,
                'hr_email'=> '',
                'sent_at' => now(),
                'status'  => 'failed',
                'notes'   => $e->getMessage(),
            ]);

            return ['success' => false, 'message' => 'Failed to send email: ' . $e->getMessage()];
        }
    }
}
