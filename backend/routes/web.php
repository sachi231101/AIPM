<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/created-resume/{studentId}', [\App\Http\Controllers\ResumeViewController::class, 'show']);

Route::get('/storage/resumes/{filename}', function ($filename) {
    $directory = storage_path('app/public/resumes');
    if (!is_dir($directory)) {
        abort(404);
    }
    
    $files = scandir($directory);
    foreach ($files as $file) {
        if (strtolower($file) === strtolower($filename)) {
            return response()->file($directory . '/' . $file, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $file . '"'
            ]);
        }
    }
    abort(404);
});

// Serve company logos — needed because artisan serve (PHP built-in server)
// does not follow Windows Junction points for static files
Route::get('/storage/company-logos/{filename}', function ($filename) {
    $path = storage_path('app/public/company-logos/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    $mime = mime_content_type($path) ?: 'image/png';
    return response()->file($path, ['Content-Type' => $mime]);
});

// Serve public profile photos directly
Route::get('/profile_photos/{filename}', function ($filename) {
    $path = public_path('profile_photos/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    $ext = pathinfo($path, PATHINFO_EXTENSION);
    $mime = match(strtolower($ext)) {
        'png' => 'image/png',
        'jpg', 'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        default => 'image/png'
    };
    return response()->file($path, [
        'Content-Type' => $mime,
        'Content-Disposition' => 'inline',
    ]);
});

// Serve profile photos
Route::get('/storage/profile_photos/{filename}', function ($filename) {
    $path = storage_path('app/public/profile_photos/' . $filename);
    if (!file_exists($path)) {
        $altPath = storage_path('app/public/' . $filename);
        if (file_exists($altPath)) {
            $path = $altPath;
        } else {
            return response()->json(['error' => 'File not found', 'checked' => $path], 404);
        }
    }
    $ext = pathinfo($path, PATHINFO_EXTENSION);
    $mime = match(strtolower($ext)) {
        'png' => 'image/png',
        'jpg', 'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        default => 'image/png'
    };
    return response()->file($path, [
        'Content-Type' => $mime,
        'Content-Disposition' => 'inline',
    ]);
});

// Serve any other public storage file generically
Route::get('/storage/settings/{filename}', function ($filename) {
    $path = storage_path('app/public/settings/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    $mime = mime_content_type($path) ?: 'image/png';
    return response()->file($path, ['Content-Type' => $mime]);
});


Route::get('/storage/resumes/{studentId}/{filename}', function ($studentId, $filename) {
    $directory = storage_path('app/public/resumes/' . $studentId);
    if (!is_dir($directory)) {
        abort(404);
    }
    
    $files = scandir($directory);
    foreach ($files as $file) {
        if (strtolower($file) === strtolower($filename)) {
            return response()->file($directory . '/' . $file, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $file . '"'
            ]);
        }
    }
    abort(404);
});

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
