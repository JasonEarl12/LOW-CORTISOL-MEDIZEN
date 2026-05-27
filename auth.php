<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

applySecurityHeaders();

$pdo = getPdo();
ensureDefaultAdmin($pdo);
ensureUsersAvatarColumn($pdo);
ensureExtendedRoleSupport($pdo);
ensureUsersPatientLinkColumn($pdo);
ensureRoleSeedUsers($pdo);

$action = $_POST['action'] ?? '';
$csrf = isset($_POST['csrf_token']) ? (string) $_POST['csrf_token'] : null;

// CSRF validation - Only check if we have actual POST data
if (!empty($_POST)) {
    if (!verifyCsrfToken($csrf)) {
        error_log("CSRF token mismatch. Expected: " . (isset($_SESSION['csrf_token']) ? substr($_SESSION['csrf_token'], 0, 10) . "..." : "NONE") . ", Got: " . ($csrf ? substr($csrf, 0, 10) . "..." : "NONE"));
        $_SESSION['auth_error'] = 'Security token invalid or expired. Please try again.';
        header('Location: patient_login.php');
        exit;
    }
}

if ($action === 'logout') {
    // Check current user role before logging out
    $currentUser = currentUser();
    $isAdmin = $currentUser !== null && strtoupper($currentUser['role'] ?? '') !== 'PATIENT';
    
    invalidateSession();
    
    // Redirect to appropriate login form
    if ($isAdmin) {
        header('Location: admin_login.php');
    } else {
        header('Location: patient_login.php');
    }
    exit;
}

if ($action !== 'login') {
    header('Location: index.php');
    exit;
}

$username = trim((string) ($_POST['username'] ?? ''));
$password = (string) ($_POST['password'] ?? '');
$loginType = isset($_POST['login_type']) ? trim((string) $_POST['login_type']) : '';

if ($username === '' || $password === '') {
    $_SESSION['auth_error'] = 'Username and password are required. Please fill in both fields.';
    $redirectPage = $loginType === 'admin' ? 'admin_login.php' : 'patient_login.php';
    header("Location: {$redirectPage}");
    exit;
}

$user = findUserByLogin($pdo, $username);

if (!$user || !passwordMatchesStoredValue($password, (string) ($user['password_hash'] ?? ''))) {
    $_SESSION['auth_error'] = 'Invalid username or password. Please check your credentials and try again.';
    $redirectPage = $loginType === 'admin' ? 'admin_login.php' : 'patient_login.php';
    header("Location: {$redirectPage}");
    exit;
}

// Enforce login type restrictions when form specifies it
if ($loginType !== '') {
    $normalizedRole = strtoupper((string) ($user['role'] ?? ''));
    if ($loginType === 'admin' && $normalizedRole !== 'ADMIN') {
        // Non-admin trying to use admin form
        $_SESSION['auth_error'] = 'This account does not have admin access. Please use the patient login if you are a patient, or contact your system administrator.';
        header('Location: admin_login.php');
        exit;
    }
    if ($loginType === 'patient' && $normalizedRole !== 'PATIENT') {
        // Non-patient trying to use patient form
        $_SESSION['auth_error'] = 'This account is for staff. Please use the admin login form to access staff functions.';
        header('Location: patient_login.php');
        exit;
    }
}

$update = $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = :id');
$update->execute([':id' => $user['id']]);

session_regenerate_id(true);
$_SESSION['last_seen_at'] = time();
$_SESSION['session_rotated_at'] = time();

$_SESSION['auth_user'] = [
    'id' => (int) $user['id'],
    'full_name' => $user['full_name'],
    'username' => $user['username'],
    'email' => $user['email'],
    'avatar_url' => (string) ($user['avatar_url'] ?? ''),
    'role' => strtoupper((string) $user['role']),
    'patient_id' => (int) ($user['patient_id'] ?? 0),
];

header('Location: index.php');

function normalizeLoginValue(string $value): string
{
    return preg_replace('/[^a-z0-9]+/i', '', strtolower(trim($value)));
}

function findUserByLogin(PDO $pdo, string $login): ?array
{
    $normalizedLogin = normalizeLoginValue($login);
    if ($normalizedLogin === '') {
        return null;
    }

    // OPTIMIZATION: Query by indexed columns first (username, email)
    // Direct match for username (common case)
    $stmt = $pdo->prepare('SELECT id, full_name, username, email, avatar_url, role, password_hash, patient_id FROM users WHERE username = :username LIMIT 1');
    $stmt->execute([':username' => $login]);
    $user = $stmt->fetch();
    if ($user !== false && $user !== null) {
        return $user;
    }

    // Try exact email match (indexed)
    $stmt = $pdo->prepare('SELECT id, full_name, username, email, avatar_url, role, password_hash, patient_id FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $login]);
    $user = $stmt->fetch();
    if ($user !== false && $user !== null) {
        return $user;
    }

    // Fall back to flexible matching only if above fails (for edge cases)
    // Load limited set of users (max 500) instead of all users
    $stmt = $pdo->query('SELECT id, full_name, username, email, avatar_url, role, password_hash, patient_id FROM users LIMIT 500');
    $users = $stmt->fetchAll();

    foreach ($users as $candidate) {
        $usernameMatch = normalizeLoginValue((string) ($candidate['username'] ?? ''));
        $nameMatch = normalizeLoginValue((string) ($candidate['full_name'] ?? ''));
        $emailMatch = normalizeLoginValue((string) ($candidate['email'] ?? ''));

        if ($normalizedLogin === $usernameMatch || $normalizedLogin === $nameMatch || $normalizedLogin === $emailMatch) {
            return $candidate;
        }
    }

    return null;
}
