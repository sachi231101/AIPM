<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use App\Models\PlacementJob;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $sixMonthsAgo = now()->subMonths(6)->startOfMonth();
        $applications = Application::where('applied_at', '>=', $sixMonthsAgo)->get();
        
        $trends = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthName = $date->format('M');
            
            $monthApps = $applications->filter(function ($app) use ($monthKey) {
                return $app->applied_at && $app->applied_at->format('Y-m') === $monthKey;
            });
            
            $trends[] = [
                'month' => $monthName,
                'applications' => $monthApps->count(),
                'offers' => $monthApps->where('status', 'shortlisted')->count(),
                'placements' => $monthApps->where('status', 'shortlisted')->count(),
            ];
        }

        $jobs = PlacementJob::select('status')->get();
        $jobsByStatus = [
            'pending'   => $jobs->where('status', 'pending')->count(),
            'approved'  => $jobs->where('status', 'approved')->count(),
            'rejected'  => $jobs->where('status', 'rejected')->count(),
            'published' => $jobs->where('status', 'published')->count(),
            'closed'    => $jobs->where('status', 'closed')->count(),
        ];

        return response()->json([
            'data' => [
                'total_students'     => Student::count(),
                'pending_students'   => Student::where('approval_status', 'pending')->count(),
                'approved_students'  => Student::where('approval_status', 'approved')->count(),
                'total_companies'    => Company::count(),
                'recent_companies'   => Company::latest()->limit(5)->get(),
                'total_jobs'         => PlacementJob::count(),
                'pending_jobs'       => PlacementJob::pending()->count(),
                'published_jobs'     => PlacementJob::published()->count(),
                'total_applications' => Application::count(),
                'recent_jobs'        => PlacementJob::with('company')
                    ->latest()->limit(5)->get(),
                'recent_applications'=> Application::with(['student.user', 'job'])
                    ->latest()->limit(10)->get(),
                'placement_trends'   => $trends,
                'jobs_by_status'     => $jobsByStatus,
            ],
        ]);
    }
}
