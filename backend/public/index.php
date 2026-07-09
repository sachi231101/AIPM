<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Serve resume PDFs directly to bypass Windows PHP built-in server junction bugs
if (isset($_SERVER['REQUEST_URI'])) {
    file_put_contents(__DIR__ . '/log.txt', date('Y-m-d H:i:s') . ' - URI: ' . $_SERVER['REQUEST_URI'] . "\n", FILE_APPEND);
    $uriPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
    
    // Match /storage/resumes/{studentId}/{filename}
    if (preg_match('|^/storage/resumes/([^/]+)/([^/]+)$|i', $uriPath, $matches)) {
        $studentId = $matches[1];
        $filename = $matches[2];
        $directory = dirname(__DIR__) . '/storage/app/public/resumes/' . $studentId;
        
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
        $directory = dirname(__DIR__) . '/storage/app/public/resumes';
        
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

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
