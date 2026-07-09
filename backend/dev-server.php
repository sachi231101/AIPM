<?php
$publicPath = __DIR__.'/public';

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

file_put_contents(__DIR__ . '/public/log.txt', date('Y-m-d H:i:s') . ' - URI: ' . $_SERVER['REQUEST_URI'] . "\n", FILE_APPEND);

// Serve static files directly, EXCEPT for resumes which have Windows symlink/case bugs
if ($uri !== '/' && !str_starts_with($uri, '/storage/resumes') && file_exists($publicPath.$uri)) {
    return false;
}

require_once $publicPath.'/index.php';
