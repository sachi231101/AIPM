<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailLog;
use Illuminate\Http\JsonResponse;

class EmailLogController extends Controller
{
    public function index(): JsonResponse
    {
        $logs = EmailLog::with('job.company')->get();

        $data = $logs->map(function ($log) {
            return [
                'id'              => $log->id,
                'company'         => $log->job?->company?->name ?? 'Unknown',
                'job'             => $log->job?->title ?? 'Unknown',
                'sentTo'          => $log->hr_email,
                'applicantsCount' => $log->applicant_count ?? 0,
                'date'            => $log->sent_at?->toIso8601String() ?? $log->created_at->toIso8601String(),
                'status'          => $log->status ?? 'Sent',
            ];
        });

        return response()->json(['data' => $data]);
    }
}
