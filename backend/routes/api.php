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
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\Admin\ContactMessageController as AdminContactMessageController;
use App\Http\Controllers\Api\Admin\NotificationController;
use Illuminate\Support\Facades\Route;

// ═══════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════

// Student Auth
Route::post('/student/register',             [AuthController::class, 'register']);
Route::post('/student/register/send-otp',    [AuthController::class, 'registerSendOtp']);
Route::post('/student/register/verify-otp',  [AuthController::class, 'registerVerifyOtp']);
Route::post('/student/login',                [AuthController::class, 'login']);
Route::post('/student/send-otp',             [AuthController::class, 'sendOtp']);
Route::post('/student/verify-otp',           [AuthController::class, 'verifyOtp']);
Route::post('/student/forgot-password',      [AuthController::class, 'forgotPassword']);

// Admin Auth
Route::post('/admin/login',      [AdminAuthController::class, 'login']);

// Public Job Listings
Route::get('/jobs',         [JobController::class, 'index']);
Route::get('/jobs/{id}',    [JobController::class, 'show']);

// Company Public Job Submission & Listing
Route::get('/companies',            [CompanyController::class, 'index']);
Route::post('/company/job-request', [CompanyController::class, 'submitJob']);

// Public Institute Listing (for registration dropdown)
Route::get('/institutes', [InstituteController::class, 'index']);

// Public Contact Form Submission
Route::post('/contact', [ContactMessageController::class, 'store']);

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

    // Student Resume Builder Persistence Routes
    Route::get('/student/resumes',          [\App\Http\Controllers\Api\Student\StudentResumeController::class, 'index']);
    Route::post('/student/resumes',         [\App\Http\Controllers\Api\Student\StudentResumeController::class, 'store']);
    Route::delete('/student/resumes/{key}', [\App\Http\Controllers\Api\Student\StudentResumeController::class, 'destroy']);

    // Student Career Profiles Management Routes
    Route::get('/student/profiles',                   [\App\Http\Controllers\Api\Student\StudentProfileController::class, 'index']);
    Route::post('/student/profiles',                  [\App\Http\Controllers\Api\Student\StudentProfileController::class, 'store']);
    Route::get('/student/profiles/{id}',              [\App\Http\Controllers\Api\Student\StudentProfileController::class, 'show']);
    Route::put('/student/profiles/{id}',              [\App\Http\Controllers\Api\Student\StudentProfileController::class, 'update']);
    Route::delete('/student/profiles/{id}',           [\App\Http\Controllers\Api\Student\StudentProfileController::class, 'destroy']);
    Route::post('/student/profiles/{id}/duplicate',   [\App\Http\Controllers\Api\Student\StudentProfileController::class, 'duplicate']);
    Route::post('/student/profiles/{id}/set-default', [\App\Http\Controllers\Api\Student\StudentProfileController::class, 'setDefault']);
});

// ═══════════════════════════════════════════════════════════════
// ADMIN PROTECTED ROUTES (Sanctum + role:admin)
// ═══════════════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'role:admin,subadmin'])->prefix('admin')->group(function () {
    Route::post('/logout',              [AdminAuthController::class, 'logout']);
    Route::get('/me',                   [AdminAuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard',            [DashboardController::class, 'index']);

    // Job & Company & Applicant Management (Jobs Permission)
    Route::middleware('permission:jobs')->group(function () {
        Route::get('/jobs',                 [AdminJobController::class, 'index']);
        Route::post('/jobs',                [AdminJobController::class, 'store']);
        Route::put('/jobs/{id}/approve',    [AdminJobController::class, 'approve']);
        Route::put('/jobs/{id}/reject',     [AdminJobController::class, 'reject']);
        Route::put('/jobs/{id}/publish',    [AdminJobController::class, 'publish']);
        Route::put('/jobs/{id}/close',      [AdminJobController::class, 'close']);

        Route::get('/applications',             [AdminApplicationController::class, 'index']);
        Route::get('/jobs/{id}/applications',   [AdminApplicationController::class, 'index']);
        Route::post('/send-to-company',         [AdminApplicationController::class, 'sendToCompany']);

        Route::get('/companies',                [\App\Http\Controllers\Api\Admin\CompanyController::class, 'index']);
    });

    // Student Management (Students Permission)
    Route::middleware('permission:students')->group(function () {
        Route::get('/students',                 [\App\Http\Controllers\Api\Admin\StudentController::class, 'index']);
        Route::put('/students/{id}/approve',    [\App\Http\Controllers\Api\Admin\StudentController::class, 'approve']);
        Route::put('/students/{id}/hold',       [\App\Http\Controllers\Api\Admin\StudentController::class, 'hold']);
        Route::put('/students/{id}/reject',     [\App\Http\Controllers\Api\Admin\StudentController::class, 'reject']);
    });

    // Settings & Email Logs (Settings Permission)
    Route::middleware('permission:settings')->group(function () {
        Route::get('/email-logs',               [\App\Http\Controllers\Api\Admin\EmailLogController::class, 'index']);
        Route::get('/settings',                 [\App\Http\Controllers\Api\Admin\SettingsController::class, 'show']);
        Route::put('/settings',                 [\App\Http\Controllers\Api\Admin\SettingsController::class, 'update']);
        Route::post('/settings/logo',            [\App\Http\Controllers\Api\Admin\SettingsController::class, 'uploadLogo']);
    });

    // Contact Messages Management
    Route::get('/contact-messages',         [AdminContactMessageController::class, 'index']);
    Route::delete('/contact-messages/{id}',  [AdminContactMessageController::class, 'destroy']);

    // Notifications
    Route::get('/notifications',             [NotificationController::class, 'index']);
    Route::put('/notifications/read-all',    [NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{id}/read',   [NotificationController::class, 'markAsRead']);

    // Sub-admin management (Main Admin ONLY)
    Route::middleware('role:admin')->group(function () {
        Route::get('/subadmins',            [\App\Http\Controllers\Api\Admin\SubadminController::class, 'index']);
        Route::post('/subadmins',           [\App\Http\Controllers\Api\Admin\SubadminController::class, 'store']);
        Route::put('/subadmins/{id}',       [\App\Http\Controllers\Api\Admin\SubadminController::class, 'update']);
        Route::delete('/subadmins/{id}',    [\App\Http\Controllers\Api\Admin\SubadminController::class, 'destroy']);
    });
});
