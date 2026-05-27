<?php
declare(strict_types=1);
require_once __DIR__ . '/../config.php';
applySecurityHeaders();

$user = currentUser();
// If not logged in, redirect to admin login
if ($user === null || strtoupper((string)($user['role'] ?? '')) !== 'ADMIN') {
    header('Location: ../admin_login.php', true, 302);
    exit;
}

// If logged in as admin, forward to main index which will render admin UI
header('Location: ../index.php', true, 302);
exit;
