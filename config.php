<?php

declare(strict_types=1);

// Guard against multiple inclusions
if (defined('PMS_CONFIG_LOADED')) {
    return;
}
define('PMS_CONFIG_LOADED', true);

const SESSION_IDLE_TIMEOUT = 900;
const SESSION_ROTATE_INTERVAL = 300;

function isHttpsRequest(): bool
{
    if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') {
        return true;
    }

    return (string) ($_SERVER['SERVER_PORT'] ?? '') === '443';
}

if (session_status() !== PHP_SESSION_ACTIVE) {
    // Set session options BEFORE starting session
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.cookie_httponly', '1');
    
    // Simpler session configuration that works reliably
    session_name('PMSSESSID');
    
    // Set cookie parameters BEFORE session_start()
    session_set_cookie_params([
        'lifetime' => 0,           // Session cookie (deleted when browser closes)
        'path' => '/',             // Works for entire localhost
        'domain' => '',            // Default domain
        'secure' => false,         // Allow HTTP in development
        'httponly' => true,        // Prevent JS access
        'samesite' => 'Lax',       // CSRF protection
    ]);
    
    // Start session
    session_start();
}

const DB_HOST = '127.0.0.1';
const DB_PORT = '3306';
const DB_NAME = 'pms_db';
const DB_USER = 'root';
const DB_PASS = '';

// Java backend health-check configuration (secondary backend)
// URL can be overridden via environment variable JAVA_BACKEND_HEALTH_URL
const JAVA_BACKEND_HEALTH_URL = 'http://127.0.0.1:8080/actuator/health';
const JAVA_BACKEND_HEALTH_TIMEOUT = 1; // seconds

// Settings file used to persist simple admin toggles (created on demand)
const SETTINGS_FILE = __DIR__ . '/data/settings.json';
const BACKEND_INTEGRITY_MANIFEST_FILE = __DIR__ . '/data/backend_integrity_manifest.json';

/**
 * Check whether the secondary Java backend is healthy/available.
 * Returns true when an HTTP 200 response is received within the timeout.
 */
function checkJavaHealth(): bool
{
    $url = getenv('JAVA_BACKEND_HEALTH_URL') ?: JAVA_BACKEND_HEALTH_URL;
    $timeout = (int) JAVA_BACKEND_HEALTH_TIMEOUT;

    // Prefer curl when available for reliable timeouts
    if (function_exists('curl_version')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return is_int($code) && $code === 200;
    }

    // Fall back to file_get_contents with stream context
    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => $timeout,
            'ignore_errors' => true,
        ],
    ]);

    $fp = @fopen($url, 'r', false, $ctx);
    if ($fp === false) {
        return false;
    }

    $meta = stream_get_meta_data($fp);
    fclose($fp);

    // Extract HTTP status code from wrapper data when present
    $headers = $meta['wrapper_data'] ?? [];
    foreach ($headers as $h) {
        if (is_string($h) && preg_match('#HTTP/\d+\.\d+\s+(\d+)#', $h, $m)) {
            $code = (int) $m[1];
            return $code === 200;
        }
    }

    return false;
}

function ensureSettingsDirExists(): void
{
    $dir = dirname(SETTINGS_FILE);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

function settingsGet(string $key, $default = null)
{
    ensureSettingsDirExists();
    if (!file_exists(SETTINGS_FILE)) {
        return $default;
    }

    $json = @file_get_contents(SETTINGS_FILE);
    if ($json === false) {
        return $default;
    }

    $data = json_decode($json, true);
    if (!is_array($data)) {
        return $default;
    }

    return array_key_exists($key, $data) ? $data[$key] : $default;
}

function settingsSet(string $key, $value): bool
{
    ensureSettingsDirExists();
    $data = [];
    if (file_exists(SETTINGS_FILE)) {
        $json = @file_get_contents(SETTINGS_FILE);
        $data = json_decode($json, true) ?: [];
    }
    $data[$key] = $value;
    return (bool) @file_put_contents(SETTINGS_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

/**
 * Return whether the Java backend is required for logins. Order of precedence:
 * - Environment variable `JAVA_BACKEND_REQUIRED` (1/true/yes enabled)
 * - Persisted admin toggle in settings file (`java_required`)
 * Defaults to false when neither is set.
 */
function isJavaRequired(): bool
{
    $env = getenv('JAVA_BACKEND_REQUIRED');
    if ($env !== false) {
        $env = strtolower(trim((string) $env));
        return in_array($env, ['1', 'true', 'yes', 'on'], true);
    }

    return (bool) settingsGet('java_required', false);
}

function getPdo(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);

    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function applySecurityHeaders(): void
{
    header('X-Frame-Options: SAMEORIGIN');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');

    // Enforce Java-backend file integrity as a guard rail. PHP remains the
    // runtime backend, but site access is intentionally blocked when tracked
    // Java files are modified/deleted.
    enforceBackendIntegrityOrFail();
}

function backendIntegrityBypass(): bool
{
    // Optional escape hatch for maintenance: set BACKEND_INTEGRITY_BYPASS=1
    $flag = getenv('BACKEND_INTEGRITY_BYPASS');
    if ($flag === false) {
        return false;
    }

    $v = strtolower(trim((string) $flag));
    return in_array($v, ['1', 'true', 'yes', 'on'], true);
}

function readBackendIntegrityManifest(): ?array
{
    if (!file_exists(BACKEND_INTEGRITY_MANIFEST_FILE)) {
        return null;
    }

    $json = @file_get_contents(BACKEND_INTEGRITY_MANIFEST_FILE);
    if ($json === false || trim($json) === '') {
        return null;
    }

    $data = json_decode($json, true);
    return is_array($data) ? $data : null;
}

function normalizedJavaIntegrityHash(string $path): string
{
    $content = @file_get_contents($path);
    if (!is_string($content)) {
        return '';
    }

    // Normalize line endings and trim trailing spaces so harmless editor
    // formatting changes do not keep the website locked.
    $content = str_replace("\r\n", "\n", $content);
    $content = str_replace("\r", "\n", $content);
    $content = preg_replace('/[ \t]+$/m', '', $content);
    $content = rtrim((string) $content, "\n");

    return hash('sha256', $content);
}

function computeBackendJavaHashes(string $root): array
{
    if (!is_dir($root)) {
        return [];
    }

    $files = [];
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
    );

    foreach ($it as $fileInfo) {
        if (!$fileInfo instanceof SplFileInfo || !$fileInfo->isFile()) {
            continue;
        }

        $path = $fileInfo->getPathname();
        if (strtolower((string) pathinfo($path, PATHINFO_EXTENSION)) !== 'java') {
            continue;
        }

        $rel = str_replace('\\', '/', substr($path, strlen(__DIR__) + 1));
        $hash = normalizedJavaIntegrityHash($path);
        if (!is_string($hash) || $hash === '') {
            continue;
        }
        $files[$rel] = $hash;
    }

    ksort($files);
    return $files;
}

function verifyBackendIntegrity(?string &$reason = null): bool
{
    $manifest = readBackendIntegrityManifest();
    if ($manifest === null) {
        $reason = 'Integrity manifest not found.';
        return false;
    }

    $root = (string) ($manifest['root'] ?? 'backend/src/main/java');
    $expected = $manifest['files'] ?? null;
    if (!is_array($expected)) {
        $reason = 'Integrity manifest is invalid.';
        return false;
    }

    $actual = computeBackendJavaHashes(__DIR__ . '/' . ltrim($root, '/'));
    ksort($expected);

    if (count($actual) !== count($expected)) {
        $reason = 'Java backend file count changed.';
        return false;
    }

    foreach ($expected as $path => $expectedHash) {
        if (!isset($actual[$path])) {
            $reason = 'Missing Java file: ' . $path;
            return false;
        }

        if (!hash_equals((string) $expectedHash, (string) $actual[$path])) {
            $reason = 'Modified Java file: ' . $path;
            return false;
        }
    }

    return true;
}

function enforceBackendIntegrityOrFail(): void
{
    if (PHP_SAPI === 'cli' || backendIntegrityBypass()) {
        return;
    }

    $reason = null;
    if (verifyBackendIntegrity($reason)) {
        return;
    }

    http_response_code(503);
    header('Retry-After: 5');
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
    echo '<meta http-equiv="refresh" content="5">';
    echo '<title>Service Locked</title></head><body style="font-family:Arial,sans-serif;background:#f5f7fa;color:#12202a;padding:32px;">';
    echo '<h1>Something went wrong</h1>';
    echo '<p>We’re having trouble loading this page right now. Please try again later.</p>';
    if (is_string($reason) && $reason !== '') {
        echo '<p><strong>Reason:</strong> ' . htmlspecialchars($reason, ENT_QUOTES, 'UTF-8') . '</p>';
    }
    echo '<p>To unlock, restore Java files or regenerate the integrity manifest from a trusted state.</p>';
    echo '<p>This page auto-checks every 5 seconds and will continue automatically when integrity is restored.</p>';
    echo '<script>setTimeout(function(){window.location.reload();},5000);</script>';
    echo '</body></html>';
    exit;
}

// Enforce backend integrity immediately when config is loaded for web requests.
// This guarantees fail-closed behavior even if a script does not call
// applySecurityHeaders().
if (PHP_SAPI !== 'cli') {
    enforceBackendIntegrityOrFail();
}

function passwordMatchesStoredValue(string $plainPassword, string $storedPassword): bool
{
    if ($storedPassword === '') {
        return false;
    }

    $passwordInfo = password_get_info($storedPassword);
    if (($passwordInfo['algo'] ?? 0) !== 0) {
        return password_verify($plainPassword, $storedPassword);
    }

    return hash_equals($storedPassword, $plainPassword);
}

function csrfToken(): string
{
    if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function verifyCsrfToken(?string $token): bool
{
    $sessionToken = $_SESSION['csrf_token'] ?? '';
    if (!is_string($sessionToken) || $sessionToken === '' || $token === null || $token === '') {
        return false;
    }

    return hash_equals($sessionToken, $token);
}

function invalidateSession(): void
{
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'] ?? '/', $params['domain'] ?? '', (bool) ($params['secure'] ?? false), (bool) ($params['httponly'] ?? true));
    }

    session_destroy();
}

function rotateSessionIfNeeded(): void
{
    $lastRotate = (int) ($_SESSION['session_rotated_at'] ?? 0);
    $now = time();
    if ($lastRotate === 0 || ($now - $lastRotate) >= SESSION_ROTATE_INTERVAL) {
        session_regenerate_id(true);
        $_SESSION['session_rotated_at'] = $now;
    }
}

function enforceSessionTimeout(): void
{
    $user = $_SESSION['auth_user'] ?? null;
    if (!is_array($user)) {
        return;
    }

    $lastSeen = (int) ($_SESSION['last_seen_at'] ?? 0);
    $now = time();

    if ($lastSeen > 0 && ($now - $lastSeen) > SESSION_IDLE_TIMEOUT) {
        invalidateSession();
        return;
    }

    $_SESSION['last_seen_at'] = $now;
    rotateSessionIfNeeded();
}

function maskContact(string $value): string
{
    $clean = preg_replace('/\D+/', '', $value);
    if (!is_string($clean) || strlen($clean) < 4) {
        return '***';
    }

    $visible = substr($clean, -4);
    return str_repeat('*', max(strlen($clean) - 4, 3)) . $visible;
}

function maskEmail(string $email): string
{
    $parts = explode('@', $email, 2);
    if (count($parts) !== 2) {
        return '***';
    }

    $name = $parts[0];
    $domain = $parts[1];
    $prefix = substr($name, 0, 2);
    return $prefix . str_repeat('*', max(strlen($name) - 2, 3)) . '@' . $domain;
}

function ensureDefaultAdmin(PDO $pdo): void
{
    $count = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    if ($count > 0) {
        return;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO users (full_name, username, email, role, password_hash) VALUES (:name, :username, :email, :role, :hash)'
    );

    $stmt->execute([
        ':name' => 'System Administrator',
        ':username' => 'admin',
        ':email' => 'admin@pms.local',
        ':role' => 'ADMIN',
        ':hash' => password_hash('admin123', PASSWORD_BCRYPT),
    ]);
}

function ensureUsersAvatarColumn(PDO $pdo): void
{
    $stmt = $pdo->prepare(
        'SELECT DATA_TYPE FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table_name AND COLUMN_NAME = :column_name
         LIMIT 1'
    );
    $stmt->execute([
        ':table_name' => 'users',
        ':column_name' => 'avatar_url',
    ]);

    $dataType = strtolower((string) $stmt->fetchColumn());
    if ($dataType === '') {
        $pdo->exec('ALTER TABLE users ADD COLUMN avatar_url LONGTEXT NULL AFTER email');
        return;
    }

    if (!in_array($dataType, ['text', 'mediumtext', 'longtext'], true)) {
        $pdo->exec('ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT NULL');
    }
}

function ensureExtendedRoleSupport(PDO $pdo): void
{
    // Expand users.role enum so PATIENT and PUBLIC accounts can be created safely.
    $pdo->exec("ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT','PUBLIC','PUBLIC_USER') NOT NULL");
}

function ensureUsersPatientLinkColumn(PDO $pdo): void
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*)
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table_name AND COLUMN_NAME = :column_name'
    );
    $stmt->execute([
        ':table_name' => 'users',
        ':column_name' => 'patient_id',
    ]);

    $exists = (int) $stmt->fetchColumn() > 0;
    if ($exists) {
        $typeStmt = $pdo->prepare(
            'SELECT DATA_TYPE, COLUMN_TYPE
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table_name AND COLUMN_NAME = :column_name
             LIMIT 1'
        );
        $typeStmt->execute([
            ':table_name' => 'users',
            ':column_name' => 'patient_id',
        ]);

        $dataType = strtolower((string) $typeStmt->fetchColumn());
        if ($dataType !== 'bigint') {
            $pdo->exec('ALTER TABLE users MODIFY COLUMN patient_id BIGINT UNSIGNED NULL');
        }
    } else {
        $pdo->exec('ALTER TABLE users ADD COLUMN patient_id BIGINT UNSIGNED NULL AFTER role');
    }

    $indexStmt = $pdo->prepare(
        'SELECT COUNT(*)
         FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table_name AND INDEX_NAME = :index_name'
    );
    $indexStmt->execute([
        ':table_name' => 'users',
        ':index_name' => 'uq_users_patient_id',
    ]);

    if ((int) $indexStmt->fetchColumn() === 0) {
        $pdo->exec('ALTER TABLE users ADD UNIQUE KEY uq_users_patient_id (patient_id)');
    }
}

function ensurePatientCredentialsTable(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS patient_credentials (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            patient_id BIGINT UNSIGNED NOT NULL,
            username VARCHAR(191) NOT NULL,
            password_plain TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_patient_credentials_patient (patient_id),
            UNIQUE KEY uq_patient_credentials_username (username),
            CONSTRAINT fk_patient_credentials_patient_id FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
}

function syncPatientCredentials(PDO $pdo): void
{
    $rows = $pdo->query(
        "SELECT
            p.id AS patient_id,
            p.full_name,
            p.dob,
            u.id AS user_id,
            u.username AS existing_username,
            u.email AS existing_email,
            u.password_hash,
            pc.password_plain AS existing_password_plain
         FROM patients p
         LEFT JOIN users u ON u.patient_id = p.id AND u.role = 'PATIENT'
         LEFT JOIN patient_credentials pc ON pc.patient_id = p.id
         ORDER BY p.id ASC"
    )->fetchAll();

    $credentialUpsert = $pdo->prepare(
        'INSERT INTO patient_credentials (patient_id, username, password_plain)
         VALUES (:patient_id, :username, :password_plain)
         ON DUPLICATE KEY UPDATE
            username = VALUES(username),
            password_plain = VALUES(password_plain)'
    );

    $userInsert = $pdo->prepare(
        'INSERT INTO users (full_name, username, email, role, patient_id, password_hash)
         VALUES (:full_name, :username, :email, :role, :patient_id, :password_hash)'
    );

    $userUpdate = $pdo->prepare(
        'UPDATE users
         SET full_name = :full_name,
             username = :username,
             email = :email,
             role = :role,
             patient_id = :patient_id,
             password_hash = :password_hash
         WHERE id = :id'
    );

    foreach ($rows as $row) {
        $patientId = (int) ($row['patient_id'] ?? 0);
        if ($patientId <= 0) {
            continue;
        }

        $fullName = trim((string) ($row['full_name'] ?? ''));
        if ($fullName === '') {
            $fullName = 'Patient #' . $patientId;
        }

        $username = trim((string) ($row['existing_username'] ?? ''));
        if ($username === '') {
            $username = slugifyUsername($fullName);
        }
        if ($username === '') {
            $username = 'patient_' . $patientId;
        }

        $email = trim((string) ($row['existing_email'] ?? ''));
        if ($email === '') {
            $email = $username . '@medizen.local';
        }

        $storedPlainPassword = trim((string) ($row['existing_password_plain'] ?? ''));
        $storedValue = trim((string) ($row['password_hash'] ?? ''));
        $storedInfo = password_get_info($storedValue);

        $dob = (string) ($row['dob'] ?? '');
        $plainPassword = $storedPlainPassword !== ''
            ? $storedPlainPassword
            : (($storedValue !== '' && ($storedInfo['algo'] ?? 0) === 0) ? $storedValue : generateMemorablePassword($username, $dob !== '' ? $dob : null));

        $userId = (int) ($row['user_id'] ?? 0);
        $userParams = [
            ':full_name' => $fullName,
            ':username' => $username,
            ':email' => $email,
            ':role' => 'PATIENT',
            ':patient_id' => $patientId,
            ':password_hash' => $plainPassword,
        ];

        if ($userId > 0) {
            $userParams[':id'] = $userId;
            $userUpdate->execute($userParams);
        } else {
            $userInsert->execute($userParams);
        }

        $credentialUpsert->execute([
            ':patient_id' => $patientId,
            ':username' => $username,
            ':password_plain' => $plainPassword,
        ]);
    }
}

function slugifyUsername(string $value): string
{
    $slug = strtolower(trim($value));
    $slug = preg_replace('/[^a-z0-9]+/i', '_', $slug);
    $slug = preg_replace('/_+/', '_', $slug);
    return trim((string) $slug, '_');
}

function ensureRoleSeedUsers(PDO $pdo): void
{
    $patientRows = $pdo->query('SELECT id, full_name FROM patients ORDER BY id ASC LIMIT 25')->fetchAll();
    $firstPatient = $patientRows[0] ?? null;
    $secondPatient = $patientRows[1] ?? null;

    $seed = [
        ['full_name' => 'Dr. Julian Vance', 'username' => 'doctor', 'email' => 'dr.julian.vance@medizen.com', 'role' => 'DOCTOR'],
        ['full_name' => 'Dr. Marcus Chen', 'username' => 'dr_smith', 'email' => 'dr.marcus.smith@medizen.com', 'role' => 'DOCTOR'],
        ['full_name' => 'Sarah Jenkins', 'username' => 'nurse', 'email' => 'sarah.jenkins@medizen.com', 'role' => 'NURSE'],
        ['full_name' => 'John Doe', 'username' => 'staff', 'email' => 'john.doe@medizen.com', 'role' => 'NURSE'],
        // NOTE: Patient demo accounts ("patient", "patient1", "patient2") DISABLED
        // These were being created as duplicates. All patients now use slug usernames (e.g., anna_cortez)
        // created by ensurePatientUserAccounts() instead. Do NOT re-enable this block.
        /*
        [
            'full_name' => (string) ($firstPatient['full_name'] ?? 'Patient Demo 1'),
            'username' => 'patient',
            'email' => 'patient@medizen.local',
            'role' => 'PATIENT',
            'patient_id' => isset($firstPatient['id']) ? (int) $firstPatient['id'] : null,
        ],
        [
            'full_name' => (string) ($secondPatient['full_name'] ?? $firstPatient['full_name'] ?? 'Patient Demo 2'),
            'username' => 'patient2',
            'email' => 'patient2@medizen.local',
            'role' => 'PATIENT',
            'patient_id' => isset($secondPatient['id']) ? (int) $secondPatient['id'] : (isset($firstPatient['id']) ? (int) $firstPatient['id'] : null),
        ],
        */
        ['full_name' => 'John Public', 'username' => 'public_user', 'email' => 'visitor@medizen.com', 'role' => 'PUBLIC_USER'],
        ['full_name' => 'Community Member', 'username' => 'visitor', 'email' => 'community@medizen.com', 'role' => 'PUBLIC_USER'],
        // Keep legacy demo users for compatibility.
        ['full_name' => 'Doctor Demo', 'username' => 'doctor1', 'email' => 'doctor1@pms.local', 'role' => 'DOCTOR'],
        ['full_name' => 'Nurse Demo', 'username' => 'nurse1', 'email' => 'nurse1@pms.local', 'role' => 'NURSE'],
        // DISABLED: patient1 was creating dupes with patient accounts
        /*
        [
            'full_name' => (string) ($firstPatient['full_name'] ?? 'Patient Demo'),
            'username' => 'patient1',
            'email' => 'patient1@pms.local',
            'role' => 'PATIENT',
            'patient_id' => isset($firstPatient['id']) ? (int) $firstPatient['id'] : null,
        ],
        */
        ['full_name' => 'Public Demo', 'username' => 'public1', 'email' => 'public1@pms.local', 'role' => 'PUBLIC'],
    ];

    // DISABLED: No longer auto-create duplicate patient accounts
    // Each patient gets only ONE account (created via ensurePatientUserAccounts)
    // This prevents "patientN" and slug duplicates from being recreated
    /*
    foreach ($patientRows as $patientRow) {
        $patientId = isset($patientRow['id']) ? (int) $patientRow['id'] : 0;
        if ($patientId <= 0) {
            continue;
        }

        $patientName = (string) ($patientRow['full_name'] ?? ('Patient #' . $patientId));
        $patientSlug = slugifyUsername($patientName);

        $seed[] = [
            'full_name' => $patientName,
            'username' => 'patient' . $patientId,
            'email' => 'patient' . $patientId . '@medizen.local',
            'role' => 'PATIENT',
            'patient_id' => $patientId,
        ];

        if ($patientSlug !== '') {
            $seed[] = [
                'full_name' => $patientName,
                'username' => $patientSlug,
                'email' => $patientSlug . '@medizen.local',
                'role' => 'PATIENT',
                'patient_id' => $patientId,
            ];
        }
    }
    */

    $upsertStmt = $pdo->prepare(
        'INSERT INTO users (full_name, username, email, role, patient_id, password_hash)
         VALUES (:full_name, :username, :email, :role, :patient_id, :password_hash)
         ON DUPLICATE KEY UPDATE
            full_name = VALUES(full_name),
            email = VALUES(email),
            role = VALUES(role),
            patient_id = VALUES(patient_id)'
    );

    foreach ($seed as $row) {
        $patientId = null;
        if ($row['role'] === 'PATIENT') {
            $patientId = isset($row['patient_id']) && $row['patient_id'] !== null
                ? (int) $row['patient_id']
                : null;
        }

        $upsertStmt->bindValue(':full_name', $row['full_name'], PDO::PARAM_STR);
        $upsertStmt->bindValue(':username', $row['username'], PDO::PARAM_STR);
        $upsertStmt->bindValue(':email', $row['email'], PDO::PARAM_STR);
        $upsertStmt->bindValue(':role', $row['role'], PDO::PARAM_STR);
        $upsertStmt->bindValue(':patient_id', $patientId, $patientId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        
        // For patients, generate memorable password (username + DOB); otherwise use "password"
        $plaintextPassword = $row['role'] === 'PATIENT' 
            ? generateMemorablePassword($row['username'], $row['dob'] ?? null)
            : 'password';
        
        $upsertStmt->bindValue(':password_hash', password_hash($plaintextPassword, PASSWORD_BCRYPT), PDO::PARAM_STR);
        $upsertStmt->execute();
    }
}

function generateMemorablePassword(string $username, ?string $dob = null): string
{
    // Generate a memorable password: username + DOB (YYYYMMDD)
    // Example: john_doe with DOB 1990-01-15 → "john_doe19900115"
    
    $username = trim($username);
    if (empty($username)) {
        $username = 'patient';
    }
    
    // Format DOB as YYYYMMDD, default to "19000101" if not provided
    if ($dob === null || empty($dob)) {
        $dob = '19000101';
    } else {
        // Remove any hyphens/slashes and get first 8 chars (YYYYMMDD)
        $dob = str_replace(['-', '/'], '', $dob);
        $dob = substr($dob, 0, 8);
        if (strlen($dob) < 8) {
            $dob = '19000101';
        }
    }
    
    return $username . $dob;
}

function ensurePatientUserAccounts(PDO $pdo): void
{
    // DISABLED: No longer auto-create patient accounts
    // Patients are managed separately with one account per patient
    // The system uses slug usernames (e.g., anna_cortez) not generic patientN
    return;
}

function ensureEventsTables(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS events (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(180) NOT NULL,
            description TEXT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            location VARCHAR(180) NOT NULL,
            max_slots INT UNSIGNED NOT NULL,
            current_slots INT UNSIGNED NOT NULL DEFAULT 0,
            status ENUM('upcoming','ongoing','completed','full','cancelled') NOT NULL DEFAULT 'upcoming',
            created_by INT UNSIGNED NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_events_date_time (date, time),
            INDEX idx_events_status (status),
            INDEX idx_events_creator (created_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS event_registrations (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            event_id INT UNSIGNED NOT NULL,
            patient_id INT UNSIGNED NOT NULL,
            registered_by INT UNSIGNED NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_event_patient (event_id, patient_id),
            INDEX idx_event_reg_event (event_id),
            INDEX idx_event_reg_patient (patient_id),
            INDEX idx_event_reg_registered_by (registered_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS event_public_registrations (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            event_id INT UNSIGNED NOT NULL,
            public_user_id INT UNSIGNED NOT NULL,
            display_name VARCHAR(180) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_event_public_user (event_id, public_user_id),
            INDEX idx_event_public_event (event_id),
            INDEX idx_event_public_user (public_user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
}

function ensureAppointmentCommunicationTables(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS appointment_notifications (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            appointment_id INT UNSIGNED NULL,
            patient_id INT UNSIGNED NOT NULL,
            notification_type ENUM('appointment','reminder','activity') NOT NULL DEFAULT 'appointment',
            message VARCHAR(255) NOT NULL,
            status ENUM('unread','read') NOT NULL DEFAULT 'unread',
            reminder_stage ENUM('day_before','same_day','none') NOT NULL DEFAULT 'none',
            reminder_at DATETIME NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_appt_notif_patient (patient_id),
            INDEX idx_appt_notif_appointment (appointment_id),
            INDEX idx_appt_notif_type_created (notification_type, created_at),
            INDEX idx_appt_notif_status (status),
            INDEX idx_appt_notif_reminder_at (reminder_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
}

function ensureChatTables(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS chat_conversations (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            patient_id INT UNSIGNED NOT NULL,
            admin_id INT UNSIGNED NOT NULL,
            subject VARCHAR(255) NULL,
            status ENUM('open','closed','archived') NOT NULL DEFAULT 'open',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_chat_patient_admin (patient_id, admin_id),
            INDEX idx_chat_patient (patient_id),
            INDEX idx_chat_admin (admin_id),
            INDEX idx_chat_status (status),
            INDEX idx_chat_updated (updated_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS chat_messages (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            conversation_id INT UNSIGNED NOT NULL,
            sender_id INT UNSIGNED NOT NULL,
            sender_role ENUM('PATIENT','ADMIN') NOT NULL,
            message TEXT NOT NULL,
            is_read TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_chat_msg_conversation (conversation_id),
            INDEX idx_chat_msg_sender (sender_id),
            INDEX idx_chat_msg_created (created_at),
            INDEX idx_chat_msg_unread (is_read, created_at),
            FOREIGN KEY fk_chat_msg_conversation (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
}

function currentUser(): ?array
{
    enforceSessionTimeout();
    return $_SESSION['auth_user'] ?? null;
}

function requireAuth(): array
{
    $user = currentUser();
    if ($user === null) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    return $user;
}

function moduleAccessMap(): array
{
    return [
        'ADMIN' => ['patients', 'patient_analytics', 'doctors', 'wards', 'appointments', 'events', 'billing', 'inventory', 'audit_logs', 'users'],
        'DOCTOR' => ['events'],
        'NURSE' => ['events'],
        'RECEPTIONIST' => ['patients', 'patient_analytics', 'appointments', 'events', 'billing'],
        'PATIENT' => ['patients', 'appointments', 'events'],
        'PUBLIC' => ['events'],
        'PUBLIC_USER' => ['events'],
    ];
}

function moduleWriteAccessMap(): array
{
    return [
        'ADMIN' => ['patients', 'patient_analytics', 'doctors', 'wards', 'appointments', 'events', 'billing', 'inventory', 'users'],
        'DOCTOR' => [],
        'NURSE' => [],
                'RECEPTIONIST' => ['patients', 'events', 'billing'],
        'PATIENT' => [],
        'PUBLIC' => [],
        'PUBLIC_USER' => [],
    ];
}

function userAllowedModules(array $user): array
{
    $map = moduleAccessMap();
    $role = strtoupper((string) ($user['role'] ?? ''));
    $modules = $map[$role] ?? [];

    if ($modules !== [] && !in_array('events', $modules, true)) {
        $modules[] = 'events';
    }

    return $modules;
}

function userWritableModules(array $user): array
{
    $map = moduleWriteAccessMap();
    $role = strtoupper((string) ($user['role'] ?? ''));
    return $map[$role] ?? [];
}

function userCanAccessModule(array $user, string $module): bool
{
    return in_array($module, userAllowedModules($user), true);
}

function userCanWriteModule(array $user, string $module): bool
{
    $map = moduleWriteAccessMap();
    $role = strtoupper((string) ($user['role'] ?? ''));
    $modules = $map[$role] ?? [];
    return in_array($module, $modules, true);
}
