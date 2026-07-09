<?php

// Serve resume PDFs directly to bypass Windows PHP built-in server junction/routing bugs
if (isset($_SERVER['REQUEST_URI'])) {
    $uriPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
    
    // Match /storage/resumes/{studentId}/{filename}
    if (preg_match('|^/storage/resumes/([^/]+)/([^/]+)$|i', $uriPath, $matches)) {
        $studentId = $matches[1];
        $filename = $matches[2];
        $directory = __DIR__ . '/storage/app/public/resumes/' . $studentId;
        
        if (is_dir($directory)) {
            $files = scandir($directory);
            foreach ($files as $file) {
                if (strtolower($file) === strtolower($filename)) {
                    $filePath = $directory . '/' . $file;
                    header('Content-Type: application/pdf');
                    header('Content-Disposition: inline; filename="' . $file . '"');
                    header('Content-Length: ' . filesize($filePath));
                    readfile($filePath);
                    exit;
                }
            }
        }
    }
    
    // Match /storage/resumes/{filename}
    if (preg_match('|^/storage/resumes/([^/]+)$|i', $uriPath, $matches)) {
        $filename = $matches[1];
        $directory = __DIR__ . '/storage/app/public/resumes';
        
        if (is_dir($directory)) {
            $files = scandir($directory);
            foreach ($files as $file) {
                if (strtolower($file) === strtolower($filename)) {
                    $filePath = $directory . '/' . $file;
                    header('Content-Type: application/pdf');
                    header('Content-Disposition: inline; filename="' . $file . '"');
                    header('Content-Length: ' . filesize($filePath));
                    readfile($filePath);
                    exit;
                }
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
