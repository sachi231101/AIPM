<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Institute;
use App\Models\PlacementJob;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total_students'     => Student::count(),
                'total_institutes'   => Institute::count(),
                'total_jobs'         => PlacementJob::count(),
                'pending_jobs'       => PlacementJob::pending()->count(),
                'published_jobs'     => PlacementJob::published()->count(),
                'total_applications' => Application::count(),
                'recent_jobs'        => PlacementJob::with('company')
                    ->latest()->limit(5)->get(),
                'recent_applications'=> Application::with(['student.user', 'job'])
                    ->latest()->limit(5)->get(),
            ],
        ]);
    }
}
