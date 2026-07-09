<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\JobController as AdminJobController;
use App\Http\Controllers\Api\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Api\Admin\InstituteController;
use Illuminate\Support\Facades\Route;

// ═══════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════

// Student Auth
Route::post('/student/register', [AuthController::class, 'register']);
Route::post('/student/login',    [AuthController::class, 'login']);

// Admin Auth
Route::post('/admin/login',      [AdminAuthController::class, 'login']);

// Public Job Listings
Route::get('/jobs',         [JobController::class, 'index']);
Route::get('/jobs/{id}',    [JobController::class, 'show']);

// Company Public Job Submission
Route::post('/company/job-request', [CompanyController::class, 'submitJob']);

// Public Institute Listing (for registration dropdown)
Route::get('/institutes', [InstituteController::class, 'index']);

// ═══════════════════════════════════════════════════════════════
// STUDENT PROTECTED ROUTES (Sanctum + role:student)
// ═══════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:student'])->group(function () {
    Route::post('/student/logout',          [AuthController::class, 'logout']);
    Route::put('/student/change-password',  [AuthController::class, 'changePassword']);

    Route::get('/student/profile',          [StudentController::class, 'show']);
    Route::put('/student/profile',          [StudentController::class, 'update']);
    Route::post('/student/resume',          [StudentController::class, 'uploadResume']);

    Route::post('/apply',                   [ApplicationController::class, 'apply']);
    Route::get('/student/applications',     [ApplicationController::class, 'myApplications']);
});

// ═══════════════════════════════════════════════════════════════
// ADMIN PROTECTED ROUTES (Sanctum + role:admin)
// ═══════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::post('/logout',              [AdminAuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard',            [DashboardController::class, 'index']);

    // Job Management
    Route::get('/jobs',                 [AdminJobController::class, 'index']);
    Route::put('/jobs/{id}/approve',    [AdminJobController::class, 'approve']);
    Route::put('/jobs/{id}/reject',     [AdminJobController::class, 'reject']);
    Route::put('/jobs/{id}/publish',    [AdminJobController::class, 'publish']);
    Route::put('/jobs/{id}/close',      [AdminJobController::class, 'close']);

    // Applicant Management
    Route::get('/jobs/{id}/applications',   [AdminApplicationController::class, 'index']);
    Route::post('/send-to-company',         [AdminApplicationController::class, 'sendToCompany']);

    // Institute Management
    Route::get('/institutes',               [InstituteController::class, 'index']);
    Route::post('/institutes',              [InstituteController::class, 'store']);
    Route::put('/institutes/{id}',          [InstituteController::class, 'update']);
    Route::put('/institutes/{id}/toggle',   [InstituteController::class, 'toggleStatus']);
    Route::delete('/institutes/{id}',       [InstituteController::class, 'destroy']);
});
