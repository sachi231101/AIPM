<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/created-resume/{studentId}', [\App\Http\Controllers\ResumeViewController::class, 'show']);

// Universal static storage file server — solves Windows junction / artisan serve issues
Route::get('/storage/{path}', function ($path) {
    // 1. Check storage/app/public/$path
    $fullPath = storage_path('app/public/' . $path);
    if (!file_exists($fullPath)) {
        // 2. Fallback check inside storage/app/public/profile_photos/
        $fullPath = storage_path('app/public/profile_photos/' . $path);
    }
    if (!file_exists($fullPath)) {
        // 3. Fallback check in public/$path
        $fullPath = public_path($path);
    }
    if (!file_exists($fullPath)) {
        // 4. Fallback check in public/profile_photos/
        $fullPath = public_path('profile_photos/' . $path);
    }

    if (!file_exists($fullPath) || is_dir($fullPath)) {
        abort(404);
    }

    $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
    $mime = match($ext) {
        'png' => 'image/png',
        'jpg', 'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        'pdf' => 'application/pdf',
        'svg' => 'image/svg+xml',
        default => mime_content_type($fullPath) ?: 'application/octet-stream',
    };

    return response()->file($fullPath, [
        'Content-Type' => $mime,
        'Cache-Control' => 'public, max-age=86400',
    ]);
})->where('path', '.*');


Route::get('/db-test', function () {
    try {
        DB::connection()->getPdo();
        return "Connected successfully! Database name is: " . DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        return "Failed to connect to the database: " . $e->getMessage();
    }
});

Route::get('/db_test', function () {
    try {
        DB::connection()->getPdo();
        return "Connected successfully! Database name is: " . DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        return "Failed to connect to the database: " . $e->getMessage();
    }
});
