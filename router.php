<?php
// Lightweight router to map friendly SPA routes to api.php?action=...
// This file is intentionally small and forwards requests to api.php

declare(strict_types=1);
// Compute path from requested URI
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$scriptName = dirname($_SERVER['SCRIPT_NAME'] ?? '/');
// Remove script base path if running in subfolder
if ($scriptName !== '/' && strpos($uri, $scriptName) === 0) {
    $uri = substr($uri, strlen($scriptName));
}
$uri = '/' . ltrim($uri, '/');
// Strip query string
$path = parse_url($uri, PHP_URL_PATH);
$path = ltrim($path, '/');

// If empty path, serve index.php (PHP UI)
if ($path === '' || $path === 'index.php') {
    require __DIR__ . '/index.php';
    exit;
}

// Map path to action and parameters
// Examples:
//  /patients -> api.php?action=patients
//  /patients?limit=10 -> api.php?action=patients&limit=10
//  /users/5/role -> api.php?action=users_role&id=5 (best-effort mapping)
$parts = explode('/', $path);
$action = $parts[0] ?? '';
$extra = array_slice($parts, 1);

// Simple mapping for common collection endpoints
$allowedCollections = ['patients','doctors','wards','appointments','billing','inventory','audit-logs','events','users','wards','reports','dashboard','notifications'];

// Normalize action for known patterns
if (in_array($action, $allowedCollections, true)) {
    // Special case: audit-logs -> audit-logs (api expects audit-logs or audit_logs?)
    // We'll pass through as-is and let api.php interpret
    $_GET['action'] = $action;
    // If extra path segment is numeric, expose it as id
    if (isset($extra[0]) && is_numeric($extra[0])) {
        $_GET['id'] = (int) $extra[0];
    }
    // Forward query string and method/body; include api.php
    require __DIR__ . '/api.php';
    exit;
}

// Support special route patterns
// /dashboard/metrics -> api.php?action=dashboard_kpis
if ($action === 'dashboard' && isset($extra[0]) && $extra[0] === 'metrics') {
    $_GET['action'] = 'dashboard_kpis';
    require __DIR__ . '/api.php';
    exit;
}

// /users/{id}/role -> api.php?action=users_role&id={id}
if ($action === 'users' && isset($extra[0]) && is_numeric($extra[0]) && isset($extra[1]) && $extra[1] === 'role') {
    $_GET['action'] = 'users_role';
    $_GET['id'] = (int) $extra[0];
    require __DIR__ . '/api.php';
    exit;
}

// Fallback: for unknown paths, return 404 JSON to the SPA
http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['error' => 'Not found', 'path' => $path]);
exit;
