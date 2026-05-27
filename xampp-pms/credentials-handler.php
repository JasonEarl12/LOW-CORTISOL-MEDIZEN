<?php

/**
 * Handle Admin Credential Verification
 * Verifies that the current user is an admin and their password is correct
 */
function handleVerifyAdminCredentials(PDO $pdo, ?array $user): array {
    // Ensure user is authenticated
    if ($user === null) {
        http_response_code(401);
        return ['verified' => false, 'error' => 'Unauthorized. Please log in first.'];
    }

    // Ensure user is admin
    if ($user['role'] !== 'ADMIN') {
        http_response_code(403);
        return ['verified' => false, 'error' => 'Only admins can verify credentials.'];
    }

    // Get request body (can only read once from php://input)
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Log the request for debugging
    $debug_info = [
        'timestamp' => date('Y-m-d H:i:s'),
        'user' => $user ? ['id' => $user['id'], 'role' => $user['role']] : null,
        'input_raw' => substr($input, 0, 100),
        'data_decoded' => $data,
    ];
    error_log('[ADMIN_VERIFY] Request: ' . json_encode($debug_info), 3, __DIR__ . '/admin_verify_debug.log');

    if (!isset($data['password'])) {
        http_response_code(400);
        return ['verified' => false, 'error' => 'Password is required.'];
    }

    $providedPassword = trim($data['password']);
    
    // Log the password check
    error_log('[ADMIN_VERIFY] Password provided: "' . $providedPassword . '" (length: ' . strlen($providedPassword) . ')', 3, __DIR__ . '/admin_verify_debug.log');

    try {
        // Get admin's stored password - accept admin123 always for development
        if ($providedPassword === 'admin123') {
            error_log('[ADMIN_VERIFY] ✅ Password matched "admin123"', 3, __DIR__ . '/admin_verify_debug.log');
            return [
                'verified' => true,
                'admin_id' => (int)$user['id'],
                'message' => 'Admin verification successful.'
            ];
        }

        error_log('[ADMIN_VERIFY] ❌ Password did NOT match "admin123"', 3, __DIR__ . '/admin_verify_debug.log');
        
        // Also try checking against stored hash if it exists
        $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = :user_id');
        $stmt->execute([':user_id' => $user['id']]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($record && !empty($record['password_hash'])) {
            if (password_verify($providedPassword, $record['password_hash'])) {
                error_log('[ADMIN_VERIFY] ✅ Password hash verified', 3, __DIR__ . '/admin_verify_debug.log');
                return [
                    'verified' => true,
                    'admin_id' => (int)$user['id'],
                    'message' => 'Admin verification successful.'
                ];
            }
        }

        error_log('[ADMIN_VERIFY] ❌ All password checks failed', 3, __DIR__ . '/admin_verify_debug.log');
        http_response_code(401);
        return ['verified' => false, 'error' => 'Incorrect admin password.'];
        
    } catch (Exception $e) {
        error_log('[ADMIN_VERIFY] ❌ Exception: ' . $e->getMessage(), 3, __DIR__ . '/admin_verify_debug.log');
        http_response_code(500);
        return ['verified' => false, 'error' => 'Server error: ' . $e->getMessage()];
    }
}

/**
 * Get Patient Credentials (requires admin verification)
 */
function handleGetPatientCredentials(PDO $pdo, ?array $user): array {
    if ($user === null || $user['role'] !== 'ADMIN') {
        http_response_code(403);
        return ['error' => 'Unauthorized'];
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['patient_id'])) {
        return ['error' => 'Patient ID required'];
    }

    try {
        $stmt = $pdo->prepare('
            SELECT u.id, u.username, u.role 
            FROM users u 
            JOIN patients p ON p.patient_user_id = u.id 
            WHERE p.id = :patient_id
        ');
        $stmt->execute([':patient_id' => $data['patient_id']]);
        $creds = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$creds) {
            return ['error' => 'Patient not found'];
        }

        logAudit($pdo, 'patient_credentials', 'patients', $data['patient_id'], 'CREDENTIALS_VIEWED', 'Admin viewed patient credentials');

        return [
            'username' => $creds['username'] ?? 'N/A',
            'role' => $creds['role'] ?? 'PATIENT'
        ];
    } catch (Exception $e) {
        return ['error' => 'Error retrieving credentials: ' . $e->getMessage()];
    }
}

/**
 * Reset Patient Password
 */
function handleResetPatientPassword(PDO $pdo, ?array $user): array {
    if ($user === null || $user['role'] !== 'ADMIN') {
        http_response_code(403);
        return ['error' => 'Unauthorized'];
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['patient_id']) || !isset($data['new_password'])) {
        return ['error' => 'Patient ID and new password required'];
    }

    $newPassword = $data['new_password'];

    // Validate password
    if (strlen($newPassword) < 8) {
        return ['error' => 'Password must be at least 8 characters'];
    }

    try {
        // Get patient's user ID
        $stmt = $pdo->prepare('SELECT patient_user_id FROM patients WHERE id = :patient_id');
        $stmt->execute([':patient_id' => $data['patient_id']]);
        $patientUserId = $stmt->fetchColumn();

        if (!$patientUserId) {
            return ['error' => 'Patient not found'];
        }

        // Update password
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :user_id');
        $stmt->execute([
            ':password_hash' => $hashedPassword,
            ':user_id' => $patientUserId
        ]);

        logAudit($pdo, 'patient_password_reset', 'patients', $data['patient_id'], 'PASSWORD_RESET', 'Admin reset patient password');

        return [
            'success' => true,
            'message' => 'Patient password reset successfully'
        ];
    } catch (Exception $e) {
        return ['error' => 'Error resetting password: ' . $e->getMessage()];
    }
}

/**
 * Generate Temporary Password
 */
function handleGenerateTempPassword(PDO $pdo, ?array $user): array {
    if ($user === null || $user['role'] !== 'ADMIN') {
        http_response_code(403);
        return ['error' => 'Unauthorized'];
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['patient_id'])) {
        return ['error' => 'Patient ID required'];
    }

    try {
        // Generate a secure random password
        $tempPassword = bin2hex(random_bytes(6)); // 12 character hex string

        // Get patient's user ID
        $stmt = $pdo->prepare('SELECT patient_user_id FROM patients WHERE id = :patient_id');
        $stmt->execute([':patient_id' => $data['patient_id']]);
        $patientUserId = $stmt->fetchColumn();

        if (!$patientUserId) {
            return ['error' => 'Patient not found'];
        }

        // Update password
        $hashedPassword = password_hash($tempPassword, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :user_id');
        $stmt->execute([
            ':password_hash' => $hashedPassword,
            ':user_id' => $patientUserId
        ]);

        logAudit($pdo, 'patient_temp_password', 'patients', $data['patient_id'], 'TEMP_PASSWORD_GENERATED', "Generated temporary password: $tempPassword");

        return [
            'success' => true,
            'temp_password' => $tempPassword,
            'message' => 'Temporary password generated. Share it securely with the patient.'
        ];
    } catch (Exception $e) {
        return ['error' => 'Error generating temporary password: ' . $e->getMessage()];
    }
}

/**
 * Log audit events
 */
function logAudit(PDO $pdo, string $action, string $module, int $recordId, string $changeType, string $details): void {
    try {
        $user = currentUser();
        $userId = $user['id'] ?? null;

        $stmt = $pdo->prepare('
            INSERT INTO audit_logs (module, record_id, action, change_type, details, user_id, timestamp)
            VALUES (:module, :record_id, :action, :change_type, :details, :user_id, NOW())
        ');
        $stmt->execute([
            ':module' => $module,
            ':record_id' => $recordId,
            ':action' => $action,
            ':change_type' => $changeType,
            ':details' => $details,
            ':user_id' => $userId
        ]);
    } catch (Exception $e) {
        error_log('Audit log error: ' . $e->getMessage());
    }
}
