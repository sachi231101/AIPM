<?php

// Serve static storage files directly to bypass Windows PHP built-in server junction/routing limitations
if (isset($_SERVER['REQUEST_URI'])) {
    $uriPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
    
    if (str_starts_with($uriPath, '/storage/')) {
        $relativePath = ltrim(substr($uriPath, 8), '/');
        
        $candidates = [
            __DIR__ . '/storage/app/public/' . $relativePath,
            __DIR__ . '/storage/app/public/profile_photos/' . $relativePath,
            __DIR__ . '/public/storage/' . $relativePath,
            __DIR__ . '/public/profile_photos/' . $relativePath,
            __DIR__ . '/public/' . $relativePath,
        ];

        foreach ($candidates as $filePath) {
            if (file_exists($filePath) && !is_dir($filePath)) {
                $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                $mimeMap = [
                    'png'  => 'image/png',
                    'jpg'  => 'image/jpeg',
                    'jpeg' => 'image/jpeg',
                    'webp' => 'image/webp',
                    'svg'  => 'image/svg+xml',
                    'gif'  => 'image/gif',
                    'pdf'  => 'application/pdf',
                ];
                $mime = $mimeMap[$ext] ?? (mime_content_type($filePath) ?: 'application/octet-stream');
                header('Access-Control-Allow-Origin: *');
                header('Access-Control-Allow-Methods: GET, OPTIONS');
                header('Content-Type: ' . $mime);
                header('Content-Length: ' . filesize($filePath));
                header('Cache-Control: public, max-age=86400');
                readfile($filePath);
                exit;
            }
        }
    }
}

define('LARAVEL_START', microtime(true));

// Check if the application is under maintenance
if (file_exists($maintenance = __DIR__.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
)->send();

$kernel->terminate($request, $response);
