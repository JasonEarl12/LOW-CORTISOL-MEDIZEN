<?php
/**
 * Patient Dashboard Setup - Creates required tables and sample data
 * Run this once to initialize the patient dashboard with real data
 * Access via: http://localhost/pms/setup-patient-dashboard.php
 */

require_once __DIR__ . '/config.php';

// Only allow admin users to access this setup
session_start();
$user = null;
if (isset($_SESSION['auth_user'])) {
    $user = $_SESSION['auth_user'];
}

// Check if user is admin
$isAdmin = $user && strtoupper($user['role'] ?? '') === 'ADMIN';

if (!$isAdmin) {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit;
}

$pdo = getPdo();
$errors = [];
$successes = [];

try {
    // Create Reminders Table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS reminders (
          id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
          patient_id BIGINT UNSIGNED NOT NULL,
          title VARCHAR(150) NOT NULL,
          description TEXT,
          reminder_type VARCHAR(50),
          status VARCHAR(50) DEFAULT 'ACTIVE',
          completed TINYINT(1) DEFAULT 0,
          scheduled_at DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_reminders_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
          KEY idx_reminders_patient_id (patient_id),
          KEY idx_reminders_completed (completed),
          KEY idx_reminders_scheduled_at (scheduled_at)
        )
    ");
    $successes[] = '✓ Reminders table created successfully';
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'already exists') === false) {
        $errors[] = 'Reminders table error: ' . $e->getMessage();
    } else {
        $successes[] = '✓ Reminders table already exists';
    }
}

try {
    // Create Notifications Table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS notifications (
          id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT UNSIGNED,
          title VARCHAR(150) NOT NULL,
          message TEXT NOT NULL,
          notification_type VARCHAR(50),
          read TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          KEY idx_notifications_user_id (user_id),
          KEY idx_notifications_read (read),
          KEY idx_notifications_created_at (created_at)
        )
    ");
    $successes[] = '✓ Notifications table created successfully';
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'already exists') === false) {
        $errors[] = 'Notifications table error: ' . $e->getMessage();
    } else {
        $successes[] = '✓ Notifications table already exists';
    }
}

try {
    // Create Activity Log Table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS activity_log (
          id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
          patient_id BIGINT UNSIGNED,
          user_id BIGINT UNSIGNED,
          title VARCHAR(150) NOT NULL,
          description TEXT,
          activity_type VARCHAR(50),
          action VARCHAR(50),
          module VARCHAR(50),
          record_id BIGINT UNSIGNED,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_activity_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
          CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          KEY idx_activity_patient_id (patient_id),
          KEY idx_activity_timestamp (timestamp),
          KEY idx_activity_type (activity_type)
        )
    ");
    $successes[] = '✓ Activity Log table created successfully';
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'already exists') === false) {
        $errors[] = 'Activity Log table error: ' . $e->getMessage();
    } else {
        $successes[] = '✓ Activity Log table already exists';
    }
}

// Insert sample reminders for patients
try {
    $stmt = $pdo->prepare("
        INSERT IGNORE INTO reminders (patient_id, title, description, reminder_type, status, completed, scheduled_at)
        SELECT 
          p.id,
          CASE WHEN RAND() < 0.33 THEN 'Take Medication' WHEN RAND() < 0.66 THEN 'Scheduled Checkup' ELSE 'Lab Tests' END,
          CASE WHEN RAND() < 0.33 THEN 'Don\\'t forget to take your daily blood pressure medication' 
               WHEN RAND() < 0.66 THEN 'You have a scheduled follow-up appointment coming up' 
               ELSE 'Laboratory tests scheduled as per doctor\\'s recommendation' END,
          CASE WHEN RAND() < 0.33 THEN 'medication' WHEN RAND() < 0.66 THEN 'appointment' ELSE 'lab_test' END,
          'ACTIVE',
          0,
          DATE_ADD(NOW(), INTERVAL FLOOR(1 + RAND() * 30) DAY)
        FROM patients p
        WHERE p.id NOT IN (SELECT DISTINCT patient_id FROM reminders)
        LIMIT 8
    ");
    $stmt->execute();
    $count = $stmt->rowCount();
    $successes[] = "✓ Inserted $count sample reminders";
} catch (Exception $e) {
    $errors[] = 'Failed to insert reminders: ' . $e->getMessage();
}

// Insert sample notifications
try {
    $stmt = $pdo->prepare("
        INSERT IGNORE INTO notifications (user_id, title, message, notification_type, read)
        SELECT 
          u.id,
          CASE WHEN RAND() < 0.25 THEN 'Appointment Confirmed' 
               WHEN RAND() < 0.50 THEN 'Lab Results Ready' 
               WHEN RAND() < 0.75 THEN 'Prescription Updated'
               ELSE 'Doctor Available' END,
          CASE WHEN RAND() < 0.25 THEN 'Your appointment with Dr. Smith has been confirmed for tomorrow at 10:00 AM'
               WHEN RAND() < 0.50 THEN 'Your recent lab results are now available. Please review them in your portal.'
               WHEN RAND() < 0.75 THEN 'Your doctor has updated your prescription. New medications are ready for pickup.'
               ELSE 'Dr. Angela Cruz is now available for consultation. Book your appointment now.' END,
          CASE WHEN RAND() < 0.25 THEN 'appointment' 
               WHEN RAND() < 0.50 THEN 'lab_result' 
               WHEN RAND() < 0.75 THEN 'prescription'
               ELSE 'doctor_available' END,
          0
        FROM users u WHERE u.role = 'PATIENT'
        LIMIT 5
    ");
    $stmt->execute();
    $count = $stmt->rowCount();
    $successes[] = "✓ Inserted $count sample notifications";
} catch (Exception $e) {
    $errors[] = 'Failed to insert notifications: ' . $e->getMessage();
}

// Insert sample activity log entries
try {
    $stmt = $pdo->prepare("
        INSERT IGNORE INTO activity_log (patient_id, user_id, title, description, activity_type, action, module, record_id)
        SELECT 
          p.id,
          (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1),
          CASE WHEN RAND() < 0.25 THEN 'Appointment Scheduled' 
               WHEN RAND() < 0.50 THEN 'Status Updated' 
               WHEN RAND() < 0.75 THEN 'Document Uploaded'
               ELSE 'Medication Recorded' END,
          CASE WHEN RAND() < 0.25 THEN 'Appointment scheduled with Dr. Michael Smith'
               WHEN RAND() < 0.50 THEN 'Patient status changed to IN TREATMENT'
               WHEN RAND() < 0.75 THEN 'Medical document uploaded to patient record'
               ELSE 'New medication added to treatment plan' END,
          CASE WHEN RAND() < 0.25 THEN 'appointment' 
               WHEN RAND() < 0.50 THEN 'patient_status' 
               WHEN RAND() < 0.75 THEN 'document'
               ELSE 'medication' END,
          CASE WHEN RAND() < 0.25 THEN 'CREATE' 
               WHEN RAND() < 0.50 THEN 'UPDATE' 
               WHEN RAND() < 0.75 THEN 'UPLOAD'
               ELSE 'ADD' END,
          CASE WHEN RAND() < 0.25 THEN 'appointments' 
               WHEN RAND() < 0.50 THEN 'patients' 
               WHEN RAND() < 0.75 THEN 'documents'
               ELSE 'medications' END,
          ABS(CAST(RAND() * 100 AS UNSIGNED))
        FROM patients p
        WHERE p.id NOT IN (SELECT DISTINCT patient_id FROM activity_log WHERE patient_id IS NOT NULL)
        LIMIT 10
    ");
    $stmt->execute();
    $count = $stmt->rowCount();
    $successes[] = "✓ Inserted $count sample activity log entries";
} catch (Exception $e) {
    $errors[] = 'Failed to insert activity log: ' . $e->getMessage();
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode([
    'success' => count($errors) === 0,
    'successes' => $successes,
    'errors' => $errors,
    'message' => count($errors) === 0 ? 'Patient dashboard setup completed successfully!' : 'Setup completed with some errors'
], JSON_PRETTY_PRINT);
