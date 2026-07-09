<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return view('welcome');
});

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
