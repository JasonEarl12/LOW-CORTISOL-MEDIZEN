<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/credentials-handler.php';

// === ERROR REPORTING & LOGGING ===
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display in output
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/api_errors.log');

// Log API requests for debugging
$debug_log = __DIR__ . '/api_debug.log';
$request_info = [
    'timestamp' => date('Y-m-d H:i:s'),
    'action' => $_GET['action'] ?? 'unknown',
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
];
error_log('[REQUEST] ' . json_encode($request_info), 3, $debug_log);

header('Content-Type: application/json; charset=utf-8');
applySecurityHeaders();

$action = $_GET['action'] ?? 'overview';

try {
    $pdo = getPdo();
    ensureDefaultAdmin($pdo);
    ensureUsersAvatarColumn($pdo);
    ensureExtendedRoleSupport($pdo);
    ensureUsersPatientLinkColumn($pdo);
    ensureRoleSeedUsers($pdo);
    ensurePatientUserAccounts($pdo);
    ensureEventsTables($pdo);
    ensureAppointmentCommunicationTables($pdo);
    ensureAppointmentsPriorityColumn($pdo);

    if ($action === 'session') {
        $user = currentUser();
        if ($user === null) {
            echo json_encode(['authenticated' => false]);
            exit;
        }

        echo json_encode([
            'authenticated' => true,
            'user' => $user,
            'allowedModules' => userAllowedModules($user),
            'writableModules' => userWritableModules($user),
            'csrfToken' => csrfToken(),
        ]);
        exit;
    }

    $user = requireAuth();

    switch ($action) {
        case 'overview':
            echo json_encode(getOverview($pdo));
            break;
        case 'dashboard_kpis':
            echo json_encode(getDashboardKpis($pdo, $user));
            break;
        case 'notifications':
            echo json_encode(getRoleNotifications($pdo, $user));
            break;
        case 'events_list':
            echo json_encode(getEventsRows($pdo, $user));
            break;
        case 'events_save':
            if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }

            if (!userCanWriteModule($user, 'events')) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden action']);
                break;
            }

            $raw = file_get_contents('php://input');
            $request = json_decode((string) $raw, true);
            if (!is_array($request)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid request payload']);
                break;
            }

            echo json_encode(saveEventRecord($pdo, $request, $user));
            break;
        case 'events_delete':
            if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }

            if (!userCanWriteModule($user, 'events')) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden action']);
                break;
            }

            $raw = file_get_contents('php://input');
            $request = json_decode((string) $raw, true);
            if (!is_array($request)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid request payload']);
                break;
            }

            $eventId = isset($request['id']) ? (int) $request['id'] : 0;
            if ($eventId <= 0) {
                http_response_code(422);
                echo json_encode(['error' => 'Invalid event id']);
                break;
            }

            echo json_encode(deleteEventRecord($pdo, $eventId, $user));
            break;
        case 'events_register':
            if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }

            $raw = file_get_contents('php://input');
            $request = json_decode((string) $raw, true);
            if (!is_array($request)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid request payload']);
                break;
            }

            echo json_encode(registerForEvent($pdo, $request, $user));
            break;
        case 'module':
            $module = $_GET['module'] ?? 'patients';
            if (!userCanAccessModule($user, $module)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden module access']);
                break;
            }

            echo json_encode(getModuleRows($pdo, $module, $user));
            break;
        case 'patient_analytics':
            if (!userCanAccessModule($user, 'patient_analytics')) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden module access']);
                break;
            }

            echo json_encode(getPatientAnalytics($pdo, [
                'date_from' => (string) ($_GET['date_from'] ?? ''),
                'date_to' => (string) ($_GET['date_to'] ?? ''),
                'department' => (string) ($_GET['department'] ?? ''),
                'doctor' => (string) ($_GET['doctor'] ?? ''),
                'age_range' => (string) ($_GET['age_range'] ?? ''),
                'gender' => (string) ($_GET['gender'] ?? ''),
            ]));
            break;
        case 'patient_form_options':
            if (!userCanAccessModule($user, 'patients')) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden module access']);
                break;
            }

            echo json_encode(getPatientFormOptions($pdo));
            break;
        case 'patient_save':
            if (!userCanWriteModule($user, 'patients')) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden module access']);
                break;
            }

            if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }

            $raw = file_get_contents('php://input');
            $payload = json_decode((string) $raw, true);
            if (!is_array($payload)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid request payload']);
                break;
            }

            echo json_encode(savePatientRecord($pdo, $payload, $user));
            break;
        case 'module_save':
            if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }

            $raw = file_get_contents('php://input');
            $request = json_decode((string) $raw, true);
            if (!is_array($request)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid request payload']);
                break;
            }

            $module = strtolower(trim((string) ($request['module'] ?? '')));
            if ($module === '' || !userCanWriteModule($user, $module)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden module access']);
                break;
            }

            if ($module === 'audit_logs') {
                http_response_code(422);
                echo json_encode(['error' => 'Audit logs are read-only']);
                break;
            }

            $payload = $request['payload'] ?? [];
            if (!is_array($payload)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid module payload']);
                break;
            }

            echo json_encode(saveModuleRecord($pdo, $module, $payload, $user));
            break;
        case 'module_delete':
            if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }

            $raw = file_get_contents('php://input');
            $request = json_decode((string) $raw, true);
            if (!is_array($request)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid request payload']);
                break;
            }

            $module = strtolower(trim((string) ($request['module'] ?? '')));
            $id = isset($request['id']) ? (int) $request['id'] : 0;
            if ($module === '' || !userCanWriteModule($user, $module)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden module access']);
                break;
            }

            if ($module === 'audit_logs') {
                http_response_code(422);
                echo json_encode(['error' => 'Audit logs are read-only']);
                break;
            }

            if ($id <= 0) {
                http_response_code(422);
                echo json_encode(['error' => 'Invalid record id']);
                break;
            }

            echo json_encode(deleteModuleRecord($pdo, $module, $id, $user));
            break;
        case 'account_update':
            if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }

            $raw = file_get_contents('php://input');
            $request = json_decode((string) $raw, true);
            if (!is_array($request)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid request payload']);
                break;
            }

            echo json_encode(updateCurrentAccount($pdo, $user, $request));
            break;
        // ===== PATIENT CREDENTIALS MANAGEMENT =====
        case 'verify_admin_credentials':
            echo json_encode(handleVerifyAdminCredentials($pdo, $user));
            break;
        case 'get_patient_credentials':
            echo json_encode(handleGetPatientCredentials($pdo, $user));
            break;
        case 'reset_patient_password':
            echo json_encode(handleResetPatientPassword($pdo, $user));
            break;
        case 'generate_temp_password':
            echo json_encode(handleGenerateTempPassword($pdo, $user));
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
} catch (Throwable $e) {
    error_log('PMS API error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Unexpected server error. Please try again.']);
}

function getOverview(PDO $pdo): array
{
    $totalPatients = (int) $pdo->query('SELECT COUNT(*) FROM patients')->fetchColumn();
    $activeDoctors = (int) $pdo->query('SELECT COUNT(*) FROM doctors')->fetchColumn();
    $availableBeds = (int) $pdo->query('SELECT COALESCE(SUM(available_beds), 0) FROM wards')->fetchColumn();
    $appointmentsToday = (int) $pdo->query('SELECT COUNT(*) FROM appointments WHERE date = CURDATE()')->fetchColumn();

    return [
        'totalPatients' => $totalPatients,
        'activeDoctors' => $activeDoctors,
        'availableBeds' => $availableBeds,
        'appointmentsToday' => $appointmentsToday,
    ];
}

function getDashboardKpis(PDO $pdo, array $user): array
{
    $role = strtoupper((string) ($user['role'] ?? ''));
    $patientId = resolveSessionPatientId($pdo, $user);

    if ($role === 'DOCTOR') {
        $doctorName = trim((string) ($user['full_name'] ?? ''));
        $patientsToday = 0;
        $criticalPatients = 0;
        $appointmentsToday = 0;

        if ($doctorName !== '') {
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM patients p LEFT JOIN doctors d ON d.id = p.doctor_id WHERE d.full_name = :doctor');
            $stmt->execute([':doctor' => $doctorName]);
            $patientsToday = (int) $stmt->fetchColumn();

            $stmt = $pdo->prepare('SELECT COUNT(*) FROM patients p LEFT JOIN doctors d ON d.id = p.doctor_id WHERE d.full_name = :doctor AND p.status = :critical');
            $stmt->execute([':doctor' => $doctorName, ':critical' => 'CRITICAL']);
            $criticalPatients = (int) $stmt->fetchColumn();

            $stmt = $pdo->prepare('SELECT COUNT(*) FROM appointments a JOIN doctors d ON d.id = a.doctor_id WHERE d.full_name = :doctor AND a.date = CURDATE()');
            $stmt->execute([':doctor' => $doctorName]);
            $appointmentsToday = (int) $stmt->fetchColumn();
        }

        $pendingPrescriptions = (int) $pdo->query("SELECT COUNT(*) FROM patients WHERE status IN ('FOLLOW-UP REQUIRED', 'UNDER OBSERVATION')")->fetchColumn();

        return [
            'cards' => [
                ['key' => 'patients_today', 'label' => 'Patients Today', 'value' => $patientsToday, 'semantic' => 'info'],
                ['key' => 'critical_patients', 'label' => 'Critical Patients', 'value' => $criticalPatients, 'semantic' => 'danger'],
                ['key' => 'appointments_today', 'label' => 'Appointments Today', 'value' => $appointmentsToday, 'semantic' => 'info'],
                ['key' => 'pending_prescriptions', 'label' => 'Pending Prescriptions', 'value' => $pendingPrescriptions, 'semantic' => 'warning'],
            ],
        ];
    }

    if ($role === 'NURSE') {
        $assignedPatients = (int) $pdo->query('SELECT COUNT(*) FROM patients')->fetchColumn();
        $wardCapacity = (int) $pdo->query('SELECT COALESCE(SUM(capacity),0) FROM wards')->fetchColumn();
        $inventoryAlerts = (int) $pdo->query('SELECT COUNT(*) FROM inventory WHERE quantity <= alert_threshold')->fetchColumn();
        $appointmentsToday = (int) $pdo->query('SELECT COUNT(*) FROM appointments WHERE date = CURDATE()')->fetchColumn();

        return [
            'cards' => [
                ['key' => 'assigned_patients', 'label' => 'Assigned Patients', 'value' => $assignedPatients, 'semantic' => 'info'],
                ['key' => 'ward_capacity', 'label' => 'Ward Capacity', 'value' => $wardCapacity, 'semantic' => 'success'],
                ['key' => 'inventory_alerts', 'label' => 'Inventory Alerts', 'value' => $inventoryAlerts, 'semantic' => 'warning'],
                ['key' => 'appointments_today', 'label' => 'Appointments Today', 'value' => $appointmentsToday, 'semantic' => 'info'],
            ],
        ];
    }

    if ($role === 'PATIENT') {
        $upcomingAppointments = 0;
        $recentStatusUpdates = 0;
        if ($patientId !== null) {
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM appointments WHERE patient_id = :patient_id AND date >= CURDATE()');
            $stmt->execute([':patient_id' => $patientId]);
            $upcomingAppointments = (int) $stmt->fetchColumn();

            $stmt = $pdo->prepare('SELECT COUNT(*) FROM audit_logs WHERE module = :module AND record_id = :patient_id AND DATE(timestamp) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
            $stmt->execute([':module' => 'patients', ':patient_id' => $patientId]);
            $recentStatusUpdates = (int) $stmt->fetchColumn();
        }

        return [
            'cards' => [
                ['key' => 'upcoming_appointments', 'label' => 'Upcoming Appointments', 'value' => $upcomingAppointments, 'semantic' => 'info'],
                ['key' => 'recent_updates', 'label' => 'Recent Status Updates', 'value' => $recentStatusUpdates, 'semantic' => 'warning'],
                ['key' => 'notifications', 'label' => 'Notifications', 'value' => count(getRoleNotifications($pdo, $user)['items'] ?? []), 'semantic' => 'info'],
                ['key' => 'medical_summary', 'label' => 'Medical Summary', 'value' => $patientId === null ? 0 : 1, 'semantic' => 'success'],
            ],
        ];
    }

    if ($role === 'PUBLIC') {
        $upcomingEvents = (int) $pdo->query("SELECT COUNT(*) FROM events WHERE status IN ('upcoming','ongoing')")->fetchColumn();
        $registeredEvents = 0;
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM event_public_registrations WHERE public_user_id = :user_id');
        $stmt->execute([':user_id' => (int) ($user['id'] ?? 0)]);
        $registeredEvents = (int) $stmt->fetchColumn();

        return [
            'cards' => [
                ['key' => 'upcoming_events', 'label' => 'Upcoming Events', 'value' => $upcomingEvents, 'semantic' => 'info'],
                ['key' => 'registered_events', 'label' => 'Registered Events', 'value' => $registeredEvents, 'semantic' => 'success'],
                ['key' => 'health_tips', 'label' => 'Health Tips', 'value' => 3, 'semantic' => 'info'],
                ['key' => 'announcements', 'label' => 'Announcements', 'value' => 2, 'semantic' => 'warning'],
            ],
        ];
    }

    $overview = getOverview($pdo);
    return [
        'cards' => [
            ['key' => 'total_patients', 'label' => 'Total Patients', 'value' => (int) ($overview['totalPatients'] ?? 0), 'semantic' => 'info'],
            ['key' => 'active_doctors', 'label' => 'Active Doctors', 'value' => (int) ($overview['activeDoctors'] ?? 0), 'semantic' => 'success'],
            ['key' => 'available_beds', 'label' => 'Available Beds', 'value' => (int) ($overview['availableBeds'] ?? 0), 'semantic' => 'success'],
            ['key' => 'appointments_today', 'label' => 'Appointments Today', 'value' => (int) ($overview['appointmentsToday'] ?? 0), 'semantic' => 'info'],
        ],
    ];
}

function getRoleNotifications(PDO $pdo, array $user): array
{
    $role = strtoupper((string) ($user['role'] ?? ''));
    $items = [];
    $reminders = [];
    $timeline = [];

    $patientId = resolveSessionPatientId($pdo, $user);

    if (in_array($role, ['ADMIN', 'PATIENT'], true)) {
        if ($role === 'PATIENT' && $patientId !== null) {
            $stmt = $pdo->prepare(
                'SELECT id, appointment_id, patient_id, notification_type, message, status, reminder_stage, reminder_at, created_at
                 FROM appointment_notifications
                 WHERE patient_id = :patient_id
                 ORDER BY created_at DESC
                 LIMIT 30'
            );
            $stmt->execute([':patient_id' => $patientId]);
        } else {
            $stmt = $pdo->query(
                'SELECT id, appointment_id, patient_id, notification_type, message, status, reminder_stage, reminder_at, created_at
                 FROM appointment_notifications
                 ORDER BY created_at DESC
                 LIMIT 30'
            );
        }

        $rows = $stmt->fetchAll();
        foreach ($rows as $row) {
            $type = strtolower((string) ($row['notification_type'] ?? 'appointment'));
            $message = (string) ($row['message'] ?? 'Appointment update');
            $createdAt = (string) ($row['created_at'] ?? date(DATE_ATOM));
            $status = strtolower((string) ($row['status'] ?? 'unread'));
            $itemId = 'an-' . (string) ($row['id'] ?? uniqid('', true));

            $semantic = 'info';
            if (stripos($message, 'cancel') !== false) {
                $semantic = 'danger';
            } elseif (stripos($message, 'updated') !== false) {
                $semantic = 'warning';
            } elseif (stripos($message, 'new appointment') !== false || stripos($message, 'scheduled') !== false) {
                $semantic = 'success';
            }

            $items[] = [
                'id' => $itemId,
                'type' => $semantic,
                'text' => $message,
                'title' => 'Appointment Update',
                'detail' => $message,
                'timestamp' => $createdAt,
                'meta' => date('M d, h:i A', strtotime($createdAt)),
                'unread' => $status === 'unread',
            ];

            if ($type === 'reminder') {
                $dueAt = (string) ($row['reminder_at'] ?? $createdAt);
                $now = time();
                $dueTs = strtotime($dueAt) ?: $now;
                $reminderStatus = 'UPCOMING';
                if ($dueTs <= $now + (2 * 3600)) {
                    $reminderStatus = 'URGENT';
                } elseif ($dueTs <= $now + (24 * 3600)) {
                    $reminderStatus = 'PENDING';
                }

                $reminders[] = [
                    'id' => $itemId,
                    'title' => (string) ($row['reminder_stage'] === 'day_before' ? 'Appointment Reminder (1 day)' : 'Appointment Reminder'),
                    'detail' => $message,
                    'status' => $reminderStatus,
                    'icon' => '⏰',
                    'dueAt' => $dueAt,
                ];
            }

            if ($type === 'activity' || $type === 'appointment') {
                $timeline[] = [
                    'id' => $itemId,
                    'title' => 'Appointment Activity',
                    'detail' => $message,
                    'timestamp' => $createdAt,
                ];
            }
        }
    }

    $stmt = $pdo->prepare('SELECT action, module, record_id, timestamp FROM audit_logs ORDER BY id DESC LIMIT 8');
    $stmt->execute();
    $audit = $stmt->fetchAll();

    foreach ($audit as $row) {
        $module = strtolower((string) ($row['module'] ?? ''));
        if ($role === 'PUBLIC' && $module !== 'events') {
            continue;
        }
        if ($role === 'PATIENT' && !in_array($module, ['patients', 'appointments', 'events'], true)) {
            continue;
        }

        $action = strtoupper((string) ($row['action'] ?? 'UPDATE'));
        $type = $action === 'DELETE' ? 'danger' : ($action === 'CREATE' ? 'success' : 'info');
        $items[] = [
            'type' => $type,
            'text' => sprintf('%s on %s #%s', $action, strtoupper($module), (string) ($row['record_id'] ?? '-')),
            'meta' => date('M d, h:i A', strtotime((string) ($row['timestamp'] ?? 'now'))),
            'unread' => true,
        ];
    }

    if ($role === 'PUBLIC') {
        $items[] = ['type' => 'info', 'text' => 'New health tip available this week.', 'meta' => 'Community', 'unread' => true];
    }

    return [
        'items' => array_slice($items, 0, 12),
        'unreadCount' => count($items),
        'reminders' => array_slice($reminders, 0, 12),
        'timeline' => array_slice($timeline, 0, 15),
        'generatedAt' => date(DATE_ATOM),
    ];
}

function normalizeAppointmentTime(string $time): string
{
    $trimmed = trim($time);
    if ($trimmed === '') {
        return '09:00:00';
    }

    $ts = strtotime($trimmed);
    if ($ts === false) {
        return '09:00:00';
    }

    return date('H:i:s', $ts);
}

function upsertAppointmentCommunications(
    PDO $pdo,
    int $appointmentId,
    int $patientId,
    string $date,
    string $time,
    string $status,
    string $operation
): void {
    if ($appointmentId <= 0 || $patientId <= 0) {
        return;
    }

    $normalizedTime = normalizeAppointmentTime($time);
    $dateTime = strtotime($date . ' ' . $normalizedTime);
    $formattedDate = date('F j', $dateTime ?: time());
    $formattedTime = date('g:i A', $dateTime ?: time());

    if ($operation === 'create') {
        $appointmentMessage = "You have a new appointment on {$formattedDate} at {$formattedTime}";
        $activityMessage = 'Appointment scheduled';
    } elseif ($operation === 'delete' || $status === 'CANCELLED') {
        $appointmentMessage = 'Your appointment has been canceled';
        $activityMessage = 'Appointment canceled';
    } else {
        $appointmentMessage = 'Your appointment has been updated';
        $activityMessage = 'Appointment updated';
    }

    $notifStmt = $pdo->prepare(
        'INSERT INTO appointment_notifications
         (appointment_id, patient_id, notification_type, message, status, reminder_stage, reminder_at)
         VALUES (:appointment_id, :patient_id, :notification_type, :message, :status, :reminder_stage, :reminder_at)'
    );

    $notifStmt->execute([
        ':appointment_id' => $appointmentId,
        ':patient_id' => $patientId,
        ':notification_type' => 'appointment',
        ':message' => $appointmentMessage,
        ':status' => 'unread',
        ':reminder_stage' => 'none',
        ':reminder_at' => null,
    ]);

    $notifStmt->execute([
        ':appointment_id' => $appointmentId,
        ':patient_id' => $patientId,
        ':notification_type' => 'activity',
        ':message' => $activityMessage,
        ':status' => 'unread',
        ':reminder_stage' => 'none',
        ':reminder_at' => null,
    ]);

    // Recreate reminders on create/update and cancel stale reminder rows for the appointment.
    $cleanup = $pdo->prepare('DELETE FROM appointment_notifications WHERE appointment_id = :appointment_id AND notification_type = :type');
    $cleanup->execute([
        ':appointment_id' => $appointmentId,
        ':type' => 'reminder',
    ]);

    if ($operation !== 'delete' && strtoupper($status) !== 'CANCELLED') {
        $dayBeforeTs = ($dateTime ?: time()) - 86400;
        $sameDayTs = ($dateTime ?: time()) - 10800;

        $notifStmt->execute([
            ':appointment_id' => $appointmentId,
            ':patient_id' => $patientId,
            ':notification_type' => 'reminder',
            ':message' => "Reminder: appointment tomorrow ({$formattedDate} at {$formattedTime})",
            ':status' => 'unread',
            ':reminder_stage' => 'day_before',
            ':reminder_at' => date('Y-m-d H:i:s', $dayBeforeTs),
        ]);

        $notifStmt->execute([
            ':appointment_id' => $appointmentId,
            ':patient_id' => $patientId,
            ':notification_type' => 'reminder',
            ':message' => "Reminder: appointment in a few hours ({$formattedDate} at {$formattedTime})",
            ':status' => 'unread',
            ':reminder_stage' => 'same_day',
            ':reminder_at' => date('Y-m-d H:i:s', $sameDayTs),
        ]);
    }
}

function getEventsRows(PDO $pdo, array $user): array
{
    $stmt = $pdo->query(
        "SELECT e.id, e.title, e.description, e.date, TIME_FORMAT(e.time, '%h:%i %p') AS time,
                e.location, e.max_slots AS capacity,
                (e.current_slots + COALESCE(pub.public_count, 0)) AS registered_count,
                e.status, e.created_by
         FROM events e
         LEFT JOIN (
            SELECT event_id, COUNT(*) AS public_count
            FROM event_public_registrations
            GROUP BY event_id
         ) pub ON pub.event_id = e.id
         ORDER BY e.date ASC, e.time ASC"
    );
    $rows = $stmt->fetchAll();

    $role = strtoupper((string) ($user['role'] ?? ''));
    $isReadOnlyRole = in_array($role, ['PATIENT', 'PUBLIC'], true);

    return array_map(static function (array $row) use ($isReadOnlyRole): array {
        $row['can_edit'] = !$isReadOnlyRole;
        return $row;
    }, $rows);
}

function saveEventRecord(PDO $pdo, array $payload, array $user): array
{
    $id = isset($payload['id']) && $payload['id'] !== '' ? (int) $payload['id'] : null;
    $title = trim((string) ($payload['title'] ?? ''));
    $description = trim((string) ($payload['description'] ?? ''));
    $date = trim((string) ($payload['date'] ?? ''));
    $time = trim((string) ($payload['time'] ?? ''));
    $location = trim((string) ($payload['location'] ?? ''));
    $capacity = max(1, (int) ($payload['capacity'] ?? 1));
    $status = strtolower(trim((string) ($payload['status'] ?? 'upcoming')));
    $allowedStatuses = ['upcoming', 'ongoing', 'completed', 'full', 'cancelled'];

    if ($title === '' || $date === '' || $time === '' || $location === '') {
        http_response_code(422);
        return ['error' => 'Title, date, time, and location are required'];
    }

    if (!in_array($status, $allowedStatuses, true)) {
        $status = 'upcoming';
    }

    if ($id !== null) {
        $stmt = $pdo->prepare('UPDATE events SET title = :title, description = :description, date = :date, time = :time, location = :location, max_slots = :max_slots, status = :status WHERE id = :id');
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    } else {
        $stmt = $pdo->prepare('INSERT INTO events (title, description, date, time, location, max_slots, current_slots, status, created_by) VALUES (:title, :description, :date, :time, :location, :max_slots, 0, :status, :created_by)');
        $stmt->bindValue(':created_by', (int) ($user['id'] ?? 0), PDO::PARAM_INT);
    }

    $stmt->bindValue(':title', $title, PDO::PARAM_STR);
    $stmt->bindValue(':description', $description === '' ? null : $description, $description === '' ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindValue(':date', $date, PDO::PARAM_STR);
    $stmt->bindValue(':time', normalizeEventTime($time), PDO::PARAM_STR);
    $stmt->bindValue(':location', $location, PDO::PARAM_STR);
    $stmt->bindValue(':max_slots', $capacity, PDO::PARAM_INT);
    $stmt->bindValue(':status', $status, PDO::PARAM_STR);
    $stmt->execute();

    $eventId = $id ?? (int) $pdo->lastInsertId();
    logAudit($pdo, (int) ($user['id'] ?? 0), $id === null ? 'CREATE' : 'UPDATE', 'events', $eventId);

    return ['row' => getEventById($pdo, $eventId)];
}

function deleteEventRecord(PDO $pdo, int $eventId, array $user): array
{
    $stmt = $pdo->prepare('DELETE FROM events WHERE id = :id');
    $stmt->bindValue(':id', $eventId, PDO::PARAM_INT);
    $stmt->execute();

    logAudit($pdo, (int) ($user['id'] ?? 0), 'DELETE', 'events', $eventId);
    return ['deleted' => true, 'id' => $eventId];
}

function registerForEvent(PDO $pdo, array $payload, array $user): array
{
    $eventId = isset($payload['event_id']) ? (int) $payload['event_id'] : 0;
    if ($eventId <= 0) {
        http_response_code(422);
        return ['error' => 'Event id is required'];
    }

    $role = strtoupper((string) ($user['role'] ?? ''));

    if ($role === 'PUBLIC') {
        $stmt = $pdo->prepare('INSERT INTO event_public_registrations (event_id, public_user_id, display_name) VALUES (:event_id, :public_user_id, :display_name)');
        try {
            $stmt->execute([
                ':event_id' => $eventId,
                ':public_user_id' => (int) ($user['id'] ?? 0),
                ':display_name' => (string) ($user['full_name'] ?? $user['username'] ?? 'Public User'),
            ]);
        } catch (Throwable $e) {
            http_response_code(422);
            return ['error' => 'Already registered for this event'];
        }
        logAudit($pdo, (int) ($user['id'] ?? 0), 'CREATE', 'events', $eventId);
        return ['registered' => true];
    }

    $patientId = resolveSessionPatientId($pdo, $user);
    if ($patientId === null) {
        http_response_code(422);
        return ['error' => 'Patient profile is not linked to this account'];
    }

    $stmt = $pdo->prepare('INSERT INTO event_registrations (event_id, patient_id, registered_by) VALUES (:event_id, :patient_id, :registered_by)');
    try {
        $stmt->execute([
            ':event_id' => $eventId,
            ':patient_id' => $patientId,
            ':registered_by' => (int) ($user['id'] ?? 0),
        ]);
    } catch (Throwable $e) {
        http_response_code(422);
        return ['error' => 'Already registered for this event'];
    }

    logAudit($pdo, (int) ($user['id'] ?? 0), 'CREATE', 'events', $eventId);
    return ['registered' => true];
}

function getEventById(PDO $pdo, int $id): array
{
    $stmt = $pdo->prepare(
        "SELECT e.id, e.title, e.description, e.date, TIME_FORMAT(e.time, '%h:%i %p') AS time,
                e.location, e.max_slots AS capacity,
                (e.current_slots + COALESCE(pub.public_count, 0)) AS registered_count,
                e.status
         FROM events e
         LEFT JOIN (
            SELECT event_id, COUNT(*) AS public_count
            FROM event_public_registrations
            GROUP BY event_id
         ) pub ON pub.event_id = e.id
         WHERE e.id = :id
         LIMIT 1"
    );
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!is_array($row)) {
        throw new RuntimeException('Event not found');
    }
    return $row;
}

function normalizeEventTime(string $time): string
{
    $trimmed = trim($time);
    if ($trimmed === '') {
        return '09:00:00';
    }

    $ts = strtotime($trimmed);
    if ($ts === false) {
        return '09:00:00';
    }

    return date('H:i:s', $ts);
}

function resolveSessionPatientId(PDO $pdo, array $user): ?int
{
    $userId = (int) ($user['id'] ?? 0);
    if ($userId <= 0) {
        return null;
    }

    $stmt = $pdo->prepare('SELECT patient_id, full_name FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $userId]);
    $row = $stmt->fetch();
    if (!is_array($row)) {
        return null;
    }

    $linkedPatientId = isset($row['patient_id']) ? (int) $row['patient_id'] : 0;
    if ($linkedPatientId > 0) {
        return $linkedPatientId;
    }

    $fullName = trim((string) ($row['full_name'] ?? ''));
    if ($fullName === '') {
        return null;
    }

    $patientStmt = $pdo->prepare('SELECT id FROM patients WHERE full_name = :full_name ORDER BY id DESC LIMIT 1');
    $patientStmt->execute([':full_name' => $fullName]);
    $foundId = $patientStmt->fetchColumn();
    return $foundId ? (int) $foundId : null;
}

function getPatientAnalytics(PDO $pdo, array $filters): array
{
    $conditions = [];
    $bindings = [];

    $dateFrom = trim((string) ($filters['date_from'] ?? ''));
    $dateTo = trim((string) ($filters['date_to'] ?? ''));
    $department = trim((string) ($filters['department'] ?? ''));
    $doctor = trim((string) ($filters['doctor'] ?? ''));
    $ageRange = trim((string) ($filters['age_range'] ?? ''));
    $gender = strtoupper(trim((string) ($filters['gender'] ?? '')));

    if ($dateFrom !== '') {
        $conditions[] = 'DATE(p.created_at) >= :date_from';
        $bindings[':date_from'] = [$dateFrom, PDO::PARAM_STR];
    }

    if ($dateTo !== '') {
        $conditions[] = 'DATE(p.created_at) <= :date_to';
        $bindings[':date_to'] = [$dateTo, PDO::PARAM_STR];
    }

    if ($department !== '' && strtolower($department) !== 'all') {
        $conditions[] = 'd.specialty = :department';
        $bindings[':department'] = [$department, PDO::PARAM_STR];
    }

    if ($doctor !== '' && strtolower($doctor) !== 'all') {
        $conditions[] = 'd.full_name = :doctor';
        $bindings[':doctor'] = [$doctor, PDO::PARAM_STR];
    }

    if ($gender !== '' && $gender !== 'ALL' && in_array($gender, ['MALE', 'FEMALE', 'OTHER'], true)) {
        $conditions[] = 'p.gender = :gender';
        $bindings[':gender'] = [$gender, PDO::PARAM_STR];
    }

    if ($ageRange !== '' && strtolower($ageRange) !== 'all') {
        $ageCondition = buildAgeRangeSql($ageRange);
        if ($ageCondition !== '') {
            $conditions[] = $ageCondition;
        }
    }

    $whereSql = '';
    if (count($conditions) > 0) {
        $whereSql = 'WHERE ' . implode(' AND ', $conditions);
    }

    $sql = "SELECT
                p.id,
                p.full_name,
                p.dob,
                p.gender,
                p.status,
                COALESCE(NULLIF(TRIM(p.contact), ''), '-') AS contact,
                COALESCE(d.full_name, 'Unassigned') AS doctor,
                COALESCE(d.specialty, 'General') AS department,
                COALESCE(w.ward_name, 'Unassigned') AS ward,
                COALESCE(NULLIF(TRIM(p.medical_history), ''), 'General checkup') AS diagnosis,
                DATE(p.created_at) AS created_date,
                COALESCE(ap.status, 'SCHEDULED') AS appointment_status,
                COALESCE(bl.payment_status, 'PENDING') AS payment_status
            FROM patients p
            LEFT JOIN doctors d ON d.id = p.doctor_id
            LEFT JOIN wards w ON w.id = p.ward_id
            LEFT JOIN (
                SELECT a1.patient_id, a1.status
                FROM appointments a1
                INNER JOIN (
                    SELECT patient_id, MAX(CONCAT(date, ' ', time)) AS latest_slot
                    FROM appointments
                    GROUP BY patient_id
                ) latest_a ON latest_a.patient_id = a1.patient_id
                         AND latest_a.latest_slot = CONCAT(a1.date, ' ', a1.time)
            ) ap ON ap.patient_id = p.id
            LEFT JOIN (
                SELECT b1.patient_id, b1.payment_status
                FROM billing b1
                INNER JOIN (
                    SELECT patient_id, MAX(id) AS latest_id
                    FROM billing
                    GROUP BY patient_id
                ) latest_b ON latest_b.patient_id = b1.patient_id
                         AND latest_b.latest_id = b1.id
            ) bl ON bl.patient_id = p.id
            {$whereSql}
            ORDER BY p.created_at DESC, p.id DESC
            LIMIT 600";

    $stmt = $pdo->prepare($sql);
    foreach ($bindings as $name => [$value, $type]) {
        $stmt->bindValue($name, $value, $type);
    }
    $stmt->execute();

    $rows = $stmt->fetchAll();
    $normalized = [];
    foreach ($rows as $row) {
        $normalized[] = normalizeAnalyticsRow($row);
    }

    $metrics = computeAnalyticsMetrics($normalized);
    $charts = computeAnalyticsCharts($normalized);
    $tables = computeAnalyticsTables($normalized);
    $alerts = computeAnalyticsAlerts($metrics, $normalized, $pdo);

    $departments = [];
    $doctors = [];
    foreach ($normalized as $row) {
        $departments[$row['department']] = true;
        if ($row['doctor'] !== 'Unassigned') {
            $doctors[$row['doctor']] = true;
        }
    }

    return [
        'metrics' => $metrics,
        'charts' => $charts,
        'tables' => $tables,
        'alerts' => $alerts,
        'filters' => [
            'departments' => array_values(array_keys($departments)),
            'doctors' => array_values(array_keys($doctors)),
        ],
        'generatedAt' => date(DATE_ATOM),
    ];
}

/**
 * Process a base64 data URL avatar image and save it to the uploads directory
 * @param string $dataUrl The data URL (e.g., "data:image/jpeg;base64,...")
 * @param int $userId The user ID for the filename
 * @return string|null The relative path to the saved avatar, or null if failed
 */
function processAvatarDataUrl(string $dataUrl, int $userId): ?string
{
    // Validate data URL format
    if (strpos($dataUrl, 'data:image/') !== 0) {
        return null;
    }

    // Extract mime type and base64 data
    if (!preg_match('/^data:image\/(\w+);base64,(.+)$/i', $dataUrl, $matches)) {
        return null;
    }

    $mimeType = strtolower($matches[1]);
    $base64Data = $matches[2];

    // Map mime types to file extensions
    $mimeToExt = [
        'jpg' => 'jpg',
        'jpeg' => 'jpg',
        'png' => 'png',
        'gif' => 'gif',
        'webp' => 'webp',
    ];

    if (!isset($mimeToExt[$mimeType])) {
        return null;
    }

    $extension = $mimeToExt[$mimeType];

    // Decode base64 data
    $imageData = base64_decode($base64Data, true);
    if ($imageData === false) {
        return null;
    }

    // Create uploads directory if it doesn't exist
    $uploadsDir = __DIR__ . '/uploads';
    if (!is_dir($uploadsDir)) {
        if (!mkdir($uploadsDir, 0755, true)) {
            return null;
        }
    }

    // Generate unique filename
    $timestamp = time();
    $randomStr = bin2hex(random_bytes(4));
    $filename = "avatar_{$userId}_{$timestamp}_{$randomStr}.{$extension}";
    $filepath = $uploadsDir . '/' . $filename;

    // Delete old avatars for this user
    @array_map('unlink', glob($uploadsDir . "/avatar_{$userId}_*.{$extension}", GLOB_BRACE));

    // Save the image
    if (file_put_contents($filepath, $imageData) === false) {
        return null;
    }

    // Return relative path
    return 'uploads/' . $filename;
}

function updateCurrentAccount(PDO $pdo, array $sessionUser, array $payload): array
{
    $userId = (int) ($sessionUser['id'] ?? 0);
    if ($userId <= 0) {
        http_response_code(401);
        return ['error' => 'Unauthorized'];
    }

    $fullName = trim((string) ($payload['full_name'] ?? ''));
    $email = trim((string) ($payload['email'] ?? ''));
    $avatarUrl = trim((string) ($payload['avatar_url'] ?? ''));
    $avatarData = (string) ($payload['avatar_data'] ?? '');
    $currentPassword = (string) ($payload['current_password'] ?? '');
    $newPassword = (string) ($payload['new_password'] ?? '');

    if ($fullName === '' || $email === '') {
        http_response_code(422);
        return ['error' => 'Full name and email are required'];
    }

    // Handle avatar data URL upload if provided
    if ($avatarData !== '' && strpos($avatarData, 'data:image/') === 0) {
        $processedAvatarUrl = processAvatarDataUrl($avatarData, $userId);
        if ($processedAvatarUrl === null) {
            http_response_code(422);
            return ['error' => 'Failed to process avatar image'];
        }
        $avatarUrl = $processedAvatarUrl;
    } elseif ($avatarUrl !== '' && !preg_match('/^(data:image\/|https?:\/\/|\/|\.\/|assets\/)/i', $avatarUrl)) {
        http_response_code(422);
        return ['error' => 'Avatar must be an image data URL, http(s) URL, or local assets path'];
    }

    $emailCheck = $pdo->prepare('SELECT id FROM users WHERE email = :email AND id <> :id LIMIT 1');
    $emailCheck->bindValue(':email', $email, PDO::PARAM_STR);
    $emailCheck->bindValue(':id', $userId, PDO::PARAM_INT);
    $emailCheck->execute();
    if ($emailCheck->fetch()) {
        http_response_code(422);
        return ['error' => 'Email is already in use by another account'];
    }

    $stmt = $pdo->prepare('SELECT id, full_name, username, email, avatar_url, role, password_hash FROM users WHERE id = :id LIMIT 1');
    $stmt->bindValue(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $dbUser = $stmt->fetch();
    if (!is_array($dbUser)) {
        http_response_code(404);
        return ['error' => 'Account record not found'];
    }

    $passwordChangeRequested = trim($currentPassword) !== '' || trim($newPassword) !== '';
    if ($passwordChangeRequested) {
        if (trim($currentPassword) === '' || trim($newPassword) === '') {
            http_response_code(422);
            return ['error' => 'Both current and new passwords are required'];
        }

        if (!password_verify($currentPassword, (string) ($dbUser['password_hash'] ?? ''))) {
            http_response_code(422);
            return ['error' => 'Current password is incorrect'];
        }

        if (strlen($newPassword) < 8) {
            http_response_code(422);
            return ['error' => 'New password must be at least 8 characters'];
        }
    }

    if ($passwordChangeRequested) {
        $update = $pdo->prepare('UPDATE users SET full_name = :full_name, email = :email, avatar_url = :avatar_url, password_hash = :password_hash WHERE id = :id');
        $update->bindValue(':password_hash', password_hash($newPassword, PASSWORD_BCRYPT), PDO::PARAM_STR);
    } else {
        $update = $pdo->prepare('UPDATE users SET full_name = :full_name, email = :email, avatar_url = :avatar_url WHERE id = :id');
    }

    $update->bindValue(':full_name', $fullName, PDO::PARAM_STR);
    $update->bindValue(':email', $email, PDO::PARAM_STR);
    $update->bindValue(':avatar_url', $avatarUrl === '' ? null : $avatarUrl, $avatarUrl === '' ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $update->bindValue(':id', $userId, PDO::PARAM_INT);
    $update->execute();

    $refresh = $pdo->prepare('SELECT id, full_name, username, email, avatar_url, role FROM users WHERE id = :id LIMIT 1');
    $refresh->bindValue(':id', $userId, PDO::PARAM_INT);
    $refresh->execute();
    $updated = $refresh->fetch();
    if (!is_array($updated)) {
        throw new RuntimeException('Updated account could not be loaded');
    }

    $_SESSION['auth_user'] = [
        'id' => (int) $updated['id'],
        'full_name' => (string) $updated['full_name'],
        'username' => (string) $updated['username'],
        'email' => (string) $updated['email'],
        'avatar_url' => (string) ($updated['avatar_url'] ?? ''),
        'role' => strtoupper((string) $updated['role']),
    ];

    return [
        'updated' => true,
        'user' => $_SESSION['auth_user'],
    ];
}

function buildAgeRangeSql(string $range): string
{
    $clean = strtolower(trim($range));
    if ($clean === '0-17') {
        return 'TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) BETWEEN 0 AND 17';
    }
    if ($clean === '18-35') {
        return 'TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) BETWEEN 18 AND 35';
    }
    if ($clean === '36-59') {
        return 'TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) BETWEEN 36 AND 59';
    }
    if ($clean === '60+') {
        return 'TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) >= 60';
    }
    return '';
}

function normalizeAnalyticsRow(array $row): array
{
    $age = 0;
    if (!empty($row['dob'])) {
        try {
            $dob = new DateTimeImmutable((string) $row['dob']);
            $age = max(0, (int) $dob->diff(new DateTimeImmutable('today'))->y);
        } catch (Throwable $e) {
            $age = 0;
        }
    }

    $diagnosis = trim((string) ($row['diagnosis'] ?? ''));
    $status = deriveAnalyticsPatientStatus($row, $age);
    $priority = computeRiskPriority($row, $age, $status);

    return [
        'id' => (int) ($row['id'] ?? 0),
        'name' => (string) ($row['full_name'] ?? '-'),
        'age' => $age,
        'gender' => (string) ($row['gender'] ?? '-'),
        'doctor' => (string) ($row['doctor'] ?? 'Unassigned'),
        'department' => (string) ($row['department'] ?? 'General'),
        'ward' => (string) ($row['ward'] ?? 'Unassigned'),
        'diagnosis' => summarizeDiagnosis($diagnosis),
        'status' => $status,
        'createdDate' => (string) ($row['created_date'] ?? date('Y-m-d')),
        'appointmentStatus' => (string) ($row['appointment_status'] ?? 'SCHEDULED'),
        'paymentStatus' => (string) ($row['payment_status'] ?? 'PENDING'),
        'priorityScore' => $priority,
    ];
}

function summarizeDiagnosis(string $medicalHistory): string
{
    if ($medicalHistory === '') {
        return 'General checkup';
    }

    $normalized = preg_replace('/\s+/', ' ', $medicalHistory);
    $parts = preg_split('/[,.;]/', (string) $normalized);
    $summary = trim((string) ($parts[0] ?? ''));
    return $summary !== '' ? ucfirst($summary) : 'General checkup';
}

function deriveAnalyticsPatientStatus(array $row, int $age): string
{
    $storedStatus = strtoupper(trim((string) ($row['status'] ?? '')));
    
    $allowedStatuses = ['ADMITTED', 'CRITICAL', 'IN TREATMENT', 'UNDER OBSERVATION', 'STABLE', 'RECOVERING', 'DISCHARGED', 'FOLLOW-UP REQUIRED', 'SCHEDULED', 'NO-SHOW'];
    if ($storedStatus !== '' && in_array($storedStatus, $allowedStatuses, true)) {
        return $storedStatus;
    }

    $ward = strtolower((string) ($row['ward'] ?? ''));
    $appointmentStatus = strtoupper((string) ($row['appointment_status'] ?? 'SCHEDULED'));
    $paymentStatus = strtoupper((string) ($row['payment_status'] ?? 'PENDING'));
    $diagnosis = strtolower((string) ($row['diagnosis'] ?? ''));

    $criticalTerms = ['critical', 'severe', 'icu', 'stroke', 'heart', 'cancer', 'respiratory', 'sepsis', 'high-risk'];
    foreach ($criticalTerms as $term) {
        if (strpos($diagnosis, $term) !== false) {
            return 'CRITICAL';
        }
    }

    if ($age >= 75) {
        return 'CRITICAL';
    }

    if ($ward !== '' && $ward !== 'unassigned') {
        return 'ADMITTED';
    }

    if ($appointmentStatus === 'COMPLETED' && $paymentStatus === 'PAID') {
        return 'DISCHARGED';
    }

    return 'FOLLOW-UP REQUIRED';
}

function computeRiskPriority(array $row, int $age, string $status): int
{
    $score = 0;
    if ($age >= 60) {
        $score += 30;
    }

    if ($status === 'CRITICAL') {
        $score += 70;
    } elseif ($status === 'FOLLOW-UP REQUIRED') {
        $score += 35;
    }

    $doctor = strtolower((string) ($row['doctor'] ?? ''));
    $ward = strtolower((string) ($row['ward'] ?? ''));
    $paymentStatus = strtoupper((string) ($row['payment_status'] ?? 'PENDING'));
    $appointmentStatus = strtoupper((string) ($row['appointment_status'] ?? 'SCHEDULED'));
    $diagnosis = strtolower((string) ($row['diagnosis'] ?? ''));

    if ($doctor === '' || $doctor === 'unassigned') {
        $score += 10;
    }

    if ($ward === '' || $ward === 'unassigned') {
        $score += 8;
    }

    if ($paymentStatus === 'OVERDUE') {
        $score += 10;
    }

    if ($appointmentStatus === 'CANCELLED') {
        $score += 8;
    }

    foreach (['diabetes', 'hypertension', 'cardiac', 'asthma', 'surgery'] as $term) {
        if (strpos($diagnosis, $term) !== false) {
            $score += 12;
            break;
        }
    }

    return $score;
}

function computeAnalyticsMetrics(array $rows): array
{
    $today = date('Y-m-d');
    $weekStart = date('Y-m-d', strtotime('-6 days'));
    $monthStart = date('Y-m-01');

    $todayCount = 0;
    $weekCount = 0;
    $monthCount = 0;
    $critical = 0;
    $followUp = 0;
    $discharged = 0;
    $stable = 0;

    foreach ($rows as $row) {
        $created = (string) ($row['createdDate'] ?? '');
        if ($created === $today) {
            $todayCount++;
        }
        if ($created >= $weekStart) {
            $weekCount++;
        }
        if ($created >= $monthStart) {
            $monthCount++;
        }

        $status = strtoupper((string) ($row['status'] ?? ''));
        if ($status === 'CRITICAL') {
            $critical++;
        } elseif ($status === 'FOLLOW-UP REQUIRED') {
            $followUp++;
        } elseif ($status === 'DISCHARGED') {
            $discharged++;
        } elseif ($status === 'STABLE') {
            $stable++;
        }
    }

    return [
        'totalPatientsRegistered' => [
            'today' => $todayCount,
            'week' => $weekCount,
            'month' => $monthCount,
        ],
        'newPatientsToday' => $todayCount,
        'criticalPatients' => $critical,
        'followUpPatients' => $followUp,
        'dischargedPatients' => $discharged,
        'stablePatients' => $stable,
    ];
}

function computeAnalyticsCharts(array $rows): array
{
    $dailyMap = [];
    $diagnosisMap = [];
    $statusMap = [
        'ADMITTED' => 0,
        'CRITICAL' => 0,
        'IN TREATMENT' => 0,
        'UNDER OBSERVATION' => 0,
        'STABLE' => 0,
        'RECOVERING' => 0,
        'DISCHARGED' => 0,
        'FOLLOW-UP REQUIRED' => 0,
        'SCHEDULED' => 0,
        'NO-SHOW' => 0,
    ];

    $fromDate = new DateTimeImmutable('-13 days');
    for ($i = 0; $i < 14; $i++) {
        $day = $fromDate->modify('+' . $i . ' days')->format('Y-m-d');
        $dailyMap[$day] = 0;
    }

    foreach ($rows as $row) {
        $created = (string) ($row['createdDate'] ?? '');
        if (array_key_exists($created, $dailyMap)) {
            $dailyMap[$created]++;
        }

        $diagnosis = (string) ($row['diagnosis'] ?? 'General checkup');
        $diagnosisMap[$diagnosis] = ($diagnosisMap[$diagnosis] ?? 0) + 1;

        $status = (string) ($row['status'] ?? 'ADMITTED');
        if (array_key_exists($status, $statusMap)) {
            $statusMap[$status]++;
        }
    }

    arsort($diagnosisMap);

    $line = [];
    foreach ($dailyMap as $day => $count) {
        $line[] = [
            'label' => date('M d', strtotime($day)),
            'value' => $count,
        ];
    }

    $diagnoses = [];
    foreach (array_slice($diagnosisMap, 0, 8, true) as $name => $count) {
        $diagnoses[] = [
            'diagnosis' => $name,
            'count' => (int) $count,
        ];
    }

    $statusSummary = [];
    foreach ($statusMap as $name => $count) {
        if ($count <= 0) {
            continue;
        }
        $statusSummary[] = [
            'status' => $name,
            'count' => (int) $count,
        ];
    }

    return [
        'line' => ['daily' => $line],
        'diagnoses' => $diagnoses,
        'statusSummary' => $statusSummary,
    ];
}

function computeAnalyticsTables(array $rows): array
{
    $recentPatients = array_slice($rows, 0, 20);

    $highRisk = array_values(array_filter($rows, static function (array $row): bool {
        return (int) ($row['priorityScore'] ?? 0) >= 70;
    }));

    usort($highRisk, static function (array $a, array $b): int {
        return (int) ($b['priorityScore'] ?? 0) <=> (int) ($a['priorityScore'] ?? 0);
    });

    return [
        'recentPatients' => array_slice($recentPatients, 0, 20),
        'highRiskPatients' => array_slice($highRisk, 0, 20),
    ];
}

function computeAnalyticsAlerts(array $metrics, array $rows, PDO $pdo): array
{
    $alerts = [];

    $critical = (int) ($metrics['criticalPatients'] ?? 0);
    $followUp = (int) ($metrics['followUpPatients'] ?? 0);
    $today = (int) ($metrics['newPatientsToday'] ?? 0);

    if ($critical > 0) {
        $alerts[] = ['type' => 'danger', 'label' => 'Critical patients', 'value' => $critical . ' need immediate review'];
    }

    if ($followUp > 0) {
        $alerts[] = ['type' => 'warning', 'label' => 'Follow-up queue', 'value' => $followUp . ' waiting reassessment'];
    }

    $availableBeds = (int) $pdo->query('SELECT COALESCE(SUM(available_beds), 0) FROM wards')->fetchColumn();
    if ($availableBeds <= 5) {
        $alerts[] = ['type' => 'danger', 'label' => 'Ward capacity', 'value' => 'Only ' . $availableBeds . ' beds available'];
    } else {
        $alerts[] = ['type' => 'info', 'label' => 'Ward capacity', 'value' => $availableBeds . ' beds currently available'];
    }

    if ($today > 10) {
        $alerts[] = ['type' => 'warning', 'label' => 'Registration spike', 'value' => $today . ' patients registered today'];
    }

    if (count($rows) === 0) {
        $alerts[] = ['type' => 'info', 'label' => 'Filters', 'value' => 'No patient records match the current filters'];
    }

    return $alerts;
}

function getModuleRows(PDO $pdo, string $module, array $user): array
{
    $hasAppointmentPriority = appointmentsHasPriorityColumn($pdo);
    $appointmentsPriorityExpr = $hasAppointmentPriority
        ? "COALESCE(NULLIF(UPPER(a.priority), ''), CASE
                                      WHEN UPPER(a.status) = 'CANCELLED' THEN 'URGENT'
                                      WHEN a.date = CURDATE() THEN 'URGENT'
                                      WHEN a.date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 'PENDING'
                                      WHEN UPPER(a.status) = 'COMPLETED' THEN 'CONFIRMED'
                                      ELSE 'PENDING'
                                  END)"
        : "CASE
                                      WHEN UPPER(a.status) = 'CANCELLED' THEN 'URGENT'
                                      WHEN a.date = CURDATE() THEN 'URGENT'
                                      WHEN a.date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 'PENDING'
                                      WHEN UPPER(a.status) = 'COMPLETED' THEN 'CONFIRMED'
                                      ELSE 'PENDING'
                                  END";

    // Extract search parameter
    $searchQuery = trim((string) ($_GET['search'] ?? ''));

    $queryMap = [
        'patients' => "SELECT p.id, p.full_name, p.dob, p.gender, p.status, p.contact, p.doctor_id, p.ward_id, p.medical_history,
                              d.full_name AS doctor, w.ward_name AS ward, u.username AS patient_username
                       FROM patients p
                       LEFT JOIN doctors d ON d.id = p.doctor_id
                       LEFT JOIN wards w ON w.id = p.ward_id
                       LEFT JOIN users u ON u.patient_id = p.id
                       " . ($searchQuery ? "WHERE LOWER(p.full_name) LIKE LOWER(:search_term)" : "") . "
                  ORDER BY p.id DESC LIMIT 100",
        'doctors' => "SELECT id, full_name, specialty, contact, schedule FROM doctors
                       " . ($searchQuery ? "WHERE LOWER(full_name) LIKE LOWER(:search_term)" : "") . "
                       ORDER BY id DESC LIMIT 100",
        'wards' => "SELECT id, ward_name, capacity, available_beds FROM wards ORDER BY id DESC LIMIT 100",
        'appointments' => "SELECT a.id, a.patient_id, a.doctor_id, p.full_name AS patient, d.full_name AS doctor, a.date, a.time, a.status,
                                  {$appointmentsPriorityExpr} AS priority
                           FROM appointments a
                           LEFT JOIN patients p ON p.id = a.patient_id
                           LEFT JOIN doctors d ON d.id = a.doctor_id
                           ORDER BY a.date DESC, a.time DESC LIMIT 100",
          'events' => "SELECT e.id, e.title, e.description, e.date, TIME_FORMAT(e.time, '%h:%i %p') AS time,
                                     e.location, e.max_slots AS capacity,
                                     (e.current_slots + COALESCE(pub.public_count, 0)) AS registered_count,
                                     e.status
                            FROM events e
                            LEFT JOIN (
                                SELECT event_id, COUNT(*) AS public_count
                                FROM event_public_registrations
                                GROUP BY event_id
                            ) pub ON pub.event_id = e.id
                            ORDER BY e.date ASC, e.time ASC",
        'billing' => "SELECT b.id, p.full_name AS patient, b.amount, b.payment_status, b.created_at
                      FROM billing b
                      JOIN patients p ON p.id = b.patient_id
                      ORDER BY b.id DESC LIMIT 100",
        'inventory' => "SELECT id, item_name, quantity, expiration_date, alert_threshold FROM inventory ORDER BY id DESC LIMIT 100",
        'audit_logs' => "SELECT al.id, u.username, al.action, al.module, al.record_id, al.timestamp
                        FROM audit_logs al
                        LEFT JOIN users u ON u.id = al.user_id
                        ORDER BY al.id DESC LIMIT 100",
        'users' => "SELECT id, full_name, username, email, avatar_url, role, last_login FROM users ORDER BY id DESC LIMIT 100",
    ];

    if (!isset($queryMap[$module])) {
        return [];
    }

    // Execute query with prepared statement if search is provided
    if ($searchQuery && in_array($module, ['patients', 'doctors'], true)) {
        $stmt = $pdo->prepare($queryMap[$module]);
        $stmt->execute([':search_term' => '%' . $searchQuery . '%']);
        $rows = $stmt->fetchAll();
    } else {
        $rows = $pdo->query($queryMap[$module])->fetchAll();
    }

    $role = strtoupper((string) ($user['role'] ?? ''));

    if ($role === 'PATIENT') {
        $patientId = resolveSessionPatientId($pdo, $user);
        if ($module === 'patients') {
            if ($patientId === null) {
                return [];
            }
            $rows = array_values(array_filter($rows, static function (array $row) use ($patientId): bool {
                return (int) ($row['id'] ?? 0) === $patientId;
            }));
        }

        if ($module === 'appointments') {
            if ($patientId === null) {
                return [];
            }

            $rows = array_values(array_filter($rows, static function (array $row) use ($patientId): bool {
                return (int) ($row['patient_id'] ?? 0) === $patientId;
            }));
        }
    }

    if ($role === 'PUBLIC' && $module !== 'events') {
        return [];
    }

    if ($role === 'ADMIN') {
        return $rows;
    }

    return array_map(static function (array $row): array {
        if (isset($row['contact']) && is_string($row['contact'])) {
            $row['contact'] = maskContact($row['contact']);
        }

        if (isset($row['email']) && is_string($row['email'])) {
            $row['email'] = maskEmail($row['email']);
        }

        return $row;
    }, $rows);
}

function getPatientFormOptions(PDO $pdo): array
{
    $doctors = $pdo->query(
        "SELECT id, full_name, specialty, schedule
         FROM doctors
         ORDER BY full_name ASC"
    )->fetchAll();

    $wards = $pdo->query(
        "SELECT id, ward_name, capacity, available_beds
         FROM wards
         WHERE available_beds > 0
         ORDER BY available_beds DESC, ward_name ASC"
    )->fetchAll();

    return [
        'doctors' => $doctors,
        'availableWards' => $wards,
        'generatedAt' => date(DATE_ATOM),
    ];
}

function savePatientRecord(PDO $pdo, array $payload, array $user): array
{
    $fullName = trim((string) ($payload['full_name'] ?? ''));
    $dob = trim((string) ($payload['dob'] ?? ''));
    $gender = strtoupper(trim((string) ($payload['gender'] ?? '')));
    $status = strtoupper(trim((string) ($payload['status'] ?? 'ADMITTED')));
    $contact = trim((string) ($payload['contact'] ?? ''));
    $medicalHistory = trim((string) ($payload['medical_history'] ?? ''));
    $username = trim((string) ($payload['username'] ?? ''));
    // Note: password field is ignored - it will be generated from username + patient_id
    $doctorId = isset($payload['doctor_id']) && $payload['doctor_id'] !== '' ? (int) $payload['doctor_id'] : null;
    $wardId = isset($payload['ward_id']) && $payload['ward_id'] !== '' ? (int) $payload['ward_id'] : null;
    // Normalize id: accept only positive integers as valid update IDs. Treat 0, null, empty, and non-numeric as create.
    $id = null;
    if (isset($payload['id']) && $payload['id'] !== '' && is_numeric($payload['id'])) {
        $tmpId = (int) $payload['id'];
        if ($tmpId > 0) {
            $id = $tmpId;
        }
    }
    
    // Admin authorization check for credentials
    $userRole = strtoupper((string) ($user['role'] ?? ''));
    if ($username !== '' && $userRole !== 'ADMIN') {
        http_response_code(403);
        return ['error' => 'Only administrators can modify patient login credentials'];
    }

    // === VALIDATION: Different rules for CREATE vs UPDATE ===
    if ($id === null) {
        // CREATE: Require essential fields
        if ($fullName === '') {
            http_response_code(422);
            return ['error' => 'Full name is required'];
        }
        
        if ($dob === '') {
            http_response_code(422);
            return ['error' => 'Date of birth is required'];
        }
        
        if (!in_array($gender, ['MALE', 'FEMALE', 'OTHER'], true)) {
            http_response_code(422);
            return ['error' => 'Gender is invalid'];
        }
    } else {
        // UPDATE: Only validate fields that are being updated
        if ($gender !== '' && !in_array($gender, ['MALE', 'FEMALE', 'OTHER'], true)) {
            http_response_code(422);
            return ['error' => 'Gender is invalid'];
        }
    }

    $allowedStatuses = ['ADMITTED', 'CRITICAL', 'IN TREATMENT', 'UNDER OBSERVATION', 'STABLE', 'RECOVERING', 'DISCHARGED', 'FOLLOW-UP REQUIRED', 'SCHEDULED', 'NO-SHOW'];
    if ($status !== '' && !in_array($status, $allowedStatuses, true)) {
        $status = 'ADMITTED';
    }

    if ($id !== null) {
        // === UPDATE: Build dynamic SQL with only provided fields ===
        $updateFields = [];
        $params = [':id' => $id];
        
        if ($fullName !== '') {
            $updateFields[] = 'full_name = :full_name';
            $params[':full_name'] = $fullName;
        }
        if ($dob !== '') {
            $updateFields[] = 'dob = :dob';
            $params[':dob'] = $dob;
        }
        if ($gender !== '') {
            $updateFields[] = 'gender = :gender';
            $params[':gender'] = $gender;
        }
        if ($status !== '') {
            $updateFields[] = 'status = :status';
            $params[':status'] = $status;
        }
        if ($contact !== '') {
            $updateFields[] = 'contact = :contact';
            $params[':contact'] = $contact;
        } else if (isset($payload['contact']) && $payload['contact'] === '') {
            // Allow clearing contact field explicitly
            $updateFields[] = 'contact = :contact';
            $params[':contact'] = null;
        }
        if ($doctorId !== null) {
            $updateFields[] = 'doctor_id = :doctor_id';
            $params[':doctor_id'] = $doctorId;
        } else if (isset($payload['doctor_id']) && $payload['doctor_id'] === '') {
            // Allow clearing doctor_id field explicitly
            $updateFields[] = 'doctor_id = :doctor_id';
            $params[':doctor_id'] = null;
        }
        if ($wardId !== null) {
            $updateFields[] = 'ward_id = :ward_id';
            $params[':ward_id'] = $wardId;
        } else if (isset($payload['ward_id']) && $payload['ward_id'] === '') {
            // Allow clearing ward_id field explicitly
            $updateFields[] = 'ward_id = :ward_id';
            $params[':ward_id'] = null;
        }
        if ($medicalHistory !== '') {
            $updateFields[] = 'medical_history = :medical_history';
            $params[':medical_history'] = $medicalHistory;
        } else if (isset($payload['medical_history']) && $payload['medical_history'] === '') {
            // Allow clearing medical_history field explicitly
            $updateFields[] = 'medical_history = :medical_history';
            $params[':medical_history'] = null;
        }
        
        if (empty($updateFields)) {
            // No fields to update
            http_response_code(400);
            return ['error' => 'No fields provided for update'];
        }
        
        $sql = 'UPDATE patients SET ' . implode(', ', $updateFields) . ' WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        
        foreach ($params as $key => $value) {
            if (is_int($value)) {
                $stmt->bindValue($key, $value, PDO::PARAM_INT);
            } elseif (is_null($value)) {
                $stmt->bindValue($key, $value, PDO::PARAM_NULL);
            } else {
                $stmt->bindValue($key, $value, PDO::PARAM_STR);
            }
        }
    } else {
        // === CREATE: All required fields must be present ===
        $stmt = $pdo->prepare(
            'INSERT INTO patients (full_name, dob, gender, status, contact, doctor_id, ward_id, medical_history)
             VALUES (:full_name, :dob, :gender, :status, :contact, :doctor_id, :ward_id, :medical_history)'
        );
        
        $stmt->bindValue(':full_name', $fullName, PDO::PARAM_STR);
        $stmt->bindValue(':dob', $dob, PDO::PARAM_STR);
        $stmt->bindValue(':gender', $gender, PDO::PARAM_STR);
        $stmt->bindValue(':status', $status, PDO::PARAM_STR);
        $stmt->bindValue(':contact', $contact === '' ? null : $contact, $contact === '' ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':doctor_id', $doctorId, $doctorId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':ward_id', $wardId, $wardId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':medical_history', $medicalHistory === '' ? null : $medicalHistory, $medicalHistory === '' ? PDO::PARAM_NULL : PDO::PARAM_STR);
    }
    
    // === ENHANCED ERROR HANDLING & VERIFICATION ===
    try {
        $result = $stmt->execute();
        
        if (!$result) {
            $errorInfo = $stmt->errorInfo();
            error_log('[DB_ERROR] Statement execution failed: ' . json_encode($errorInfo), 3, __DIR__ . '/api_debug.log');
            http_response_code(500);
            throw new RuntimeException('Database: Statement failed to execute');
        }

        // === FIX: Verify UPDATE actually affected rows ===
        $affectedRows = $stmt->rowCount();
        
        if ($id !== null && $affectedRows === 0) {
            // UPDATE executed but no rows affected - likely invalid patient ID
            error_log('[UPDATE_FAILED] No rows affected for patient ID: ' . $id, 3, __DIR__ . '/api_debug.log');
            http_response_code(404);
            throw new RuntimeException('Patient ID ' . $id . ' not found or no changes made');
        }

        // Log successful operation
        $operation = $id !== null ? 'UPDATE' : 'INSERT';
        $affectedRowsLog = $id !== null ? $affectedRows : '(new record)';
        error_log("[PATIENT_{$operation}] ID={$id}, Name={$fullName}, Status={$status}, AffectedRows={$affectedRowsLog}", 3, __DIR__ . '/api_debug.log');

    } catch (PDOException $e) {
        error_log('[PDO_EXCEPTION] ' . $e->getMessage(), 3, __DIR__ . '/api_debug.log');
        http_response_code(500);
        throw new RuntimeException('Database error: ' . $e->getMessage());
    }

    $patientId = $id ?? (int) $pdo->lastInsertId();
    
    // === UPDATE USER ACCOUNT IF USERNAME PROVIDED ===
    if ($username !== '') {
        $generatedPassword = $username . $patientId;
        $passwordHash = password_hash($generatedPassword, PASSWORD_BCRYPT);
        
        // Check if user account already exists for this patient
        $checkStmt = $pdo->prepare('SELECT id FROM users WHERE patient_id = :patient_id LIMIT 1');
        $checkStmt->execute([':patient_id' => $patientId]);
        $existingUser = $checkStmt->fetch();
        
        if ($existingUser) {
            // Update existing user account
            $updateUserStmt = $pdo->prepare(
                'UPDATE users SET username = :username, password_hash = :password_hash WHERE patient_id = :patient_id'
            );
            $updateUserStmt->bindValue(':username', $username, PDO::PARAM_STR);
            $updateUserStmt->bindValue(':password_hash', $passwordHash, PDO::PARAM_STR);
            $updateUserStmt->bindValue(':patient_id', $patientId, PDO::PARAM_INT);
            $updateUserStmt->execute();
        } else {
            // Create new user account
            try {
                $email = 'patient' . $patientId . '@medizen.local';
                $insertUserStmt = $pdo->prepare(
                    'INSERT INTO users (full_name, username, email, role, patient_id, password_hash)
                     VALUES (:full_name, :username, :email, :role, :patient_id, :password_hash)'
                );
                $insertUserStmt->bindValue(':full_name', $fullName, PDO::PARAM_STR);
                $insertUserStmt->bindValue(':username', $username, PDO::PARAM_STR);
                $insertUserStmt->bindValue(':email', $email, PDO::PARAM_STR);
                $insertUserStmt->bindValue(':role', 'PATIENT', PDO::PARAM_STR);
                $insertUserStmt->bindValue(':patient_id', $patientId, PDO::PARAM_INT);
                $insertUserStmt->bindValue(':password_hash', $passwordHash, PDO::PARAM_STR);
                $insertUserStmt->execute();
            } catch (PDOException $e) {
                // Username may already exist for a different patient, silently continue
                error_log('[USER_CREATE_SKIPPED] Patient ' . $patientId . ' username exists: ' . $username, 3, __DIR__ . '/api_debug.log');
            }
        }
    }
    
    // === FIX: Verify patient was actually saved before returning ===
    try {
        $savedPatient = getPatientRowById($pdo, $patientId);
        error_log("[VERIFICATION] Patient {$patientId} retrieved: " . json_encode($savedPatient), 3, __DIR__ . '/api_debug.log');
        logAudit($pdo, (int) ($user['id'] ?? 0), $id !== null ? 'UPDATE' : 'CREATE', 'patients', $patientId);
        return ['patient' => $savedPatient];
    } catch (Exception $e) {
        error_log('[VERIFICATION_FAILED] Could not retrieve patient ' . $patientId . ': ' . $e->getMessage(), 3, __DIR__ . '/api_debug.log');
        http_response_code(500);
        throw new RuntimeException('Patient record saved but could not be retrieved: ' . $e->getMessage());
    }
}

function getPatientRowById(PDO $pdo, int $id): array
{
    $stmt = $pdo->prepare(
        "SELECT p.id, p.full_name, p.dob, p.gender, p.status, p.contact, p.doctor_id, p.ward_id, p.medical_history,
                d.full_name AS doctor, w.ward_name AS ward, u.username
         FROM patients p
         LEFT JOIN doctors d ON d.id = p.doctor_id
         LEFT JOIN wards w ON w.id = p.ward_id
         LEFT JOIN users u ON u.patient_id = p.id
         WHERE p.id = :id
         LIMIT 1"
    );
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch();

    if (!is_array($row)) {
        throw new RuntimeException('Patient record not found after save');
    }

    // Generate password dynamically from username + patient_id
    $username = $row['username'] ?? '';
    $generatedPassword = $username . $id;
    
    $row['password'] = $generatedPassword;
    
    return $row;
}

function saveModuleRecord(PDO $pdo, string $module, array $payload, array $user): array
{
    if ($module === 'patients') {
        $savedPatient = savePatientRecord($pdo, $payload, $user);
        return ['row' => $savedPatient['patient'] ?? null];
    }

    $id = isset($payload['id']) && $payload['id'] !== '' ? (int) $payload['id'] : null;

    switch ($module) {
        case 'doctors':
            $fullName = trim((string) ($payload['full_name'] ?? ''));
            $specialty = trim((string) ($payload['specialty'] ?? ''));
            $contact = trim((string) ($payload['contact'] ?? ''));
            $schedule = trim((string) ($payload['schedule'] ?? ''));

            if ($fullName === '' || $specialty === '') {
                http_response_code(422);
                return ['error' => 'Doctor name and specialty are required'];
            }

            if ($id !== null) {
                $stmt = $pdo->prepare('UPDATE doctors SET full_name = :full_name, specialty = :specialty, contact = :contact, schedule = :schedule WHERE id = :id');
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            } else {
                $stmt = $pdo->prepare('INSERT INTO doctors (full_name, specialty, contact, schedule) VALUES (:full_name, :specialty, :contact, :schedule)');
            }

            $stmt->bindValue(':full_name', $fullName, PDO::PARAM_STR);
            $stmt->bindValue(':specialty', $specialty, PDO::PARAM_STR);
            $stmt->bindValue(':contact', $contact === '' ? null : $contact, $contact === '' ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->bindValue(':schedule', $schedule === '' ? null : $schedule, $schedule === '' ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->execute();
            break;

        case 'wards':
            $wardName = trim((string) ($payload['ward_name'] ?? ''));
            $capacity = (int) ($payload['capacity'] ?? 0);
            $availableBeds = (int) ($payload['available_beds'] ?? 0);

            if ($wardName === '' || $capacity < 0 || $availableBeds < 0) {
                http_response_code(422);
                return ['error' => 'Ward name, capacity, and available beds are required'];
            }

            if ($id !== null) {
                $stmt = $pdo->prepare('UPDATE wards SET ward_name = :ward_name, capacity = :capacity, available_beds = :available_beds WHERE id = :id');
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            } else {
                $stmt = $pdo->prepare('INSERT INTO wards (ward_name, capacity, available_beds) VALUES (:ward_name, :capacity, :available_beds)');
            }

            $stmt->bindValue(':ward_name', $wardName, PDO::PARAM_STR);
            $stmt->bindValue(':capacity', $capacity, PDO::PARAM_INT);
            $stmt->bindValue(':available_beds', $availableBeds, PDO::PARAM_INT);
            $stmt->execute();
            break;

        case 'appointments':
            $role = strtoupper((string) ($user['role'] ?? ''));
            if ($role === 'PATIENT') {
                if ($id === null) {
                    http_response_code(403);
                    return ['error' => 'Patients can only update existing appointments'];
                }

                $patientId = resolveSessionPatientId($pdo, $user);
                if ($patientId === null) {
                    http_response_code(422);
                    return ['error' => 'Patient profile is not linked to this account'];
                }

                $status = strtoupper(trim((string) ($payload['status'] ?? '')));
                if ($status !== 'CANCELLED') {
                    http_response_code(403);
                    return ['error' => 'Patients can only cancel appointments'];
                }

                $contextStmt = $pdo->prepare('SELECT id, patient_id, date, time FROM appointments WHERE id = :id LIMIT 1');
                $contextStmt->bindValue(':id', $id, PDO::PARAM_INT);
                $contextStmt->execute();
                $context = $contextStmt->fetch();

                if (!is_array($context) || (int) ($context['patient_id'] ?? 0) !== $patientId) {
                    http_response_code(403);
                    return ['error' => 'You can only cancel your own appointments'];
                }

                $hasPriorityColumn = appointmentsHasPriorityColumn($pdo);
                $sql = $hasPriorityColumn
                    ? 'UPDATE appointments SET status = :status, priority = :priority WHERE id = :id'
                    : 'UPDATE appointments SET status = :status WHERE id = :id';
                $stmt = $pdo->prepare($sql);
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
                $stmt->bindValue(':status', 'CANCELLED', PDO::PARAM_STR);
                if ($hasPriorityColumn) {
                    $stmt->bindValue(':priority', 'URGENT', PDO::PARAM_STR);
                }
                $stmt->execute();

                upsertAppointmentCommunications(
                    $pdo,
                    (int) ($context['id'] ?? $id),
                    $patientId,
                    (string) ($context['date'] ?? date('Y-m-d')),
                    (string) ($context['time'] ?? '09:00:00'),
                    'CANCELLED',
                    'update'
                );
                break;
            }

            if ($role !== 'ADMIN') {
                http_response_code(403);
                return ['error' => 'Only admins can modify appointments'];
            }

            $patientId = resolvePatientId($pdo, $payload['patient_id'] ?? $payload['patient'] ?? null);
            $doctorId = resolveDoctorId($pdo, $payload['doctor_id'] ?? $payload['doctor'] ?? null);
            $date = trim((string) ($payload['date'] ?? ''));
            $time = trim((string) ($payload['time'] ?? ''));
            $status = strtoupper(trim((string) ($payload['status'] ?? 'SCHEDULED')));
            $priority = strtoupper(trim((string) ($payload['priority'] ?? 'PENDING')));
            $hasPriorityColumn = appointmentsHasPriorityColumn($pdo);

            if ($patientId === null || $doctorId === null || $date === '' || $time === '') {
                http_response_code(422);
                return ['error' => 'Patient, doctor, date, and time are required'];
            }

            if (!in_array($status, ['SCHEDULED', 'COMPLETED', 'CANCELLED'], true)) {
                http_response_code(422);
                return ['error' => 'Appointment status is invalid'];
            }

            if (!in_array($priority, ['URGENT', 'PENDING', 'CONFIRMED'], true)) {
                $priority = 'PENDING';
            }

            if ($id !== null) {
                $sql = $hasPriorityColumn
                    ? 'UPDATE appointments SET patient_id = :patient_id, doctor_id = :doctor_id, date = :date, time = :time, status = :status, priority = :priority WHERE id = :id'
                    : 'UPDATE appointments SET patient_id = :patient_id, doctor_id = :doctor_id, date = :date, time = :time, status = :status WHERE id = :id';
                $stmt = $pdo->prepare($sql);
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            } else {
                $sql = $hasPriorityColumn
                    ? 'INSERT INTO appointments (patient_id, doctor_id, date, time, status, priority) VALUES (:patient_id, :doctor_id, :date, :time, :status, :priority)'
                    : 'INSERT INTO appointments (patient_id, doctor_id, date, time, status) VALUES (:patient_id, :doctor_id, :date, :time, :status)';
                $stmt = $pdo->prepare($sql);
            }

            $stmt->bindValue(':patient_id', $patientId, PDO::PARAM_INT);
            $stmt->bindValue(':doctor_id', $doctorId, PDO::PARAM_INT);
            $stmt->bindValue(':date', $date, PDO::PARAM_STR);
            $stmt->bindValue(':time', $time, PDO::PARAM_STR);
            $stmt->bindValue(':status', $status, PDO::PARAM_STR);
            if ($hasPriorityColumn) {
                $stmt->bindValue(':priority', $priority, PDO::PARAM_STR);
            }
            $stmt->execute();

            $appointmentId = $id ?? (int) $pdo->lastInsertId();
            upsertAppointmentCommunications(
                $pdo,
                $appointmentId,
                $patientId,
                $date,
                $time,
                $status,
                $id !== null ? 'update' : 'create'
            );
            break;

        case 'billing':
            $patientId = resolvePatientId($pdo, $payload['patient_id'] ?? $payload['patient'] ?? null);
            $amount = (float) ($payload['amount'] ?? 0);
            $paymentStatus = strtoupper(trim((string) ($payload['payment_status'] ?? 'PENDING')));

            if ($patientId === null || $amount < 0) {
                http_response_code(422);
                return ['error' => 'Patient and amount are required'];
            }

            if (!in_array($paymentStatus, ['PENDING', 'PAID', 'OVERDUE'], true)) {
                http_response_code(422);
                return ['error' => 'Payment status is invalid'];
            }

            if ($id !== null) {
                $stmt = $pdo->prepare('UPDATE billing SET patient_id = :patient_id, amount = :amount, payment_status = :payment_status WHERE id = :id');
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            } else {
                $stmt = $pdo->prepare('INSERT INTO billing (patient_id, amount, payment_status) VALUES (:patient_id, :amount, :payment_status)');
            }

            $stmt->bindValue(':patient_id', $patientId, PDO::PARAM_INT);
            $stmt->bindValue(':amount', $amount, PDO::PARAM_STR);
            $stmt->bindValue(':payment_status', $paymentStatus, PDO::PARAM_STR);
            $stmt->execute();
            break;

        case 'inventory':
            $itemName = trim((string) ($payload['item_name'] ?? ''));
            $quantity = (int) ($payload['quantity'] ?? 0);
            $expirationDate = trim((string) ($payload['expiration_date'] ?? ''));
            $alertThreshold = (int) ($payload['alert_threshold'] ?? 10);

            if ($itemName === '' || $quantity < 0 || $alertThreshold < 0) {
                http_response_code(422);
                return ['error' => 'Item name, quantity, and alert threshold are required'];
            }

            if ($id !== null) {
                $stmt = $pdo->prepare('UPDATE inventory SET item_name = :item_name, quantity = :quantity, expiration_date = :expiration_date, alert_threshold = :alert_threshold WHERE id = :id');
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            } else {
                $stmt = $pdo->prepare('INSERT INTO inventory (item_name, quantity, expiration_date, alert_threshold) VALUES (:item_name, :quantity, :expiration_date, :alert_threshold)');
            }

            $stmt->bindValue(':item_name', $itemName, PDO::PARAM_STR);
            $stmt->bindValue(':quantity', $quantity, PDO::PARAM_INT);
            $stmt->bindValue(':expiration_date', $expirationDate === '' ? null : $expirationDate, $expirationDate === '' ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->bindValue(':alert_threshold', $alertThreshold, PDO::PARAM_INT);
            $stmt->execute();
            break;

        case 'users':
            $fullName = trim((string) ($payload['full_name'] ?? ''));
            $username = trim((string) ($payload['username'] ?? ''));
            $email = trim((string) ($payload['email'] ?? ''));
            $avatarUrl = trim((string) ($payload['avatar_url'] ?? ''));
            $role = strtoupper(trim((string) ($payload['role'] ?? 'RECEPTIONIST')));
            $password = trim((string) ($payload['password'] ?? ''));

            if ($fullName === '' || $username === '' || $email === '') {
                http_response_code(422);
                return ['error' => 'Full name, username, and email are required'];
            }

            if (!in_array($role, ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT', 'PUBLIC'], true)) {
                http_response_code(422);
                return ['error' => 'Role is invalid'];
            }

            if ($avatarUrl !== '' && !preg_match('/^(data:image\/|https?:\/\/|\/|\.\/|assets\/)/i', $avatarUrl)) {
                http_response_code(422);
                return ['error' => 'Avatar must be an image data URL, http(s) URL, or local assets path'];
            }

            if ($id !== null) {
                if ($password !== '') {
                    $stmt = $pdo->prepare('UPDATE users SET full_name = :full_name, username = :username, email = :email, avatar_url = :avatar_url, role = :role, password_hash = :password_hash WHERE id = :id');
                    $stmt->bindValue(':password_hash', password_hash($password, PASSWORD_BCRYPT), PDO::PARAM_STR);
                } else {
                    $stmt = $pdo->prepare('UPDATE users SET full_name = :full_name, username = :username, email = :email, avatar_url = :avatar_url, role = :role WHERE id = :id');
                }

                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            } else {
                $passwordHash = password_hash($password !== '' ? $password : 'ChangeMe123!', PASSWORD_BCRYPT);
                $stmt = $pdo->prepare('INSERT INTO users (full_name, username, email, avatar_url, role, password_hash) VALUES (:full_name, :username, :email, :avatar_url, :role, :password_hash)');
                $stmt->bindValue(':password_hash', $passwordHash, PDO::PARAM_STR);
            }

            $stmt->bindValue(':full_name', $fullName, PDO::PARAM_STR);
            $stmt->bindValue(':username', $username, PDO::PARAM_STR);
            $stmt->bindValue(':email', $email, PDO::PARAM_STR);
            $stmt->bindValue(':avatar_url', $avatarUrl === '' ? null : $avatarUrl, $avatarUrl === '' ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->bindValue(':role', $role, PDO::PARAM_STR);
            $stmt->execute();
            break;

        default:
            http_response_code(422);
            return ['error' => 'Module is not writable'];
    }

    $recordId = $id ?? (int) $pdo->lastInsertId();
    logAudit($pdo, (int) ($user['id'] ?? 0), $id !== null ? 'UPDATE' : 'CREATE', $module, $recordId);
    return ['row' => getModuleRowById($pdo, $module, $recordId)];
}

function deleteModuleRecord(PDO $pdo, string $module, int $id, array $user): array
{
    $tableMap = [
        'patients' => 'patients',
        'doctors' => 'doctors',
        'wards' => 'wards',
        'appointments' => 'appointments',
        'billing' => 'billing',
        'inventory' => 'inventory',
        'users' => 'users',
    ];

    if (!isset($tableMap[$module])) {
        http_response_code(422);
        return ['error' => 'Module is not deletable'];
    }

    if ($module === 'appointments') {
        $role = strtoupper((string) ($user['role'] ?? ''));
        if ($role !== 'ADMIN') {
            http_response_code(403);
            return ['error' => 'Only admins can modify appointments'];
        }
    }

    $appointmentContext = null;
    if ($module === 'appointments') {
        $contextStmt = $pdo->prepare('SELECT id, patient_id, date, time, status FROM appointments WHERE id = :id LIMIT 1');
        $contextStmt->bindValue(':id', $id, PDO::PARAM_INT);
        $contextStmt->execute();
        $appointmentContext = $contextStmt->fetch();
    }

    $tableName = $tableMap[$module];
    $stmt = $pdo->prepare("DELETE FROM {$tableName} WHERE id = :id");
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    if ($module === 'appointments' && is_array($appointmentContext)) {
        upsertAppointmentCommunications(
            $pdo,
            (int) ($appointmentContext['id'] ?? $id),
            (int) ($appointmentContext['patient_id'] ?? 0),
            (string) ($appointmentContext['date'] ?? date('Y-m-d')),
            (string) ($appointmentContext['time'] ?? '09:00:00'),
            'CANCELLED',
            'delete'
        );
    }

    logAudit($pdo, (int) ($user['id'] ?? 0), 'DELETE', $module, $id);

    return ['deleted' => true, 'id' => $id];
}

function getModuleRowById(PDO $pdo, string $module, int $id): array
{
    switch ($module) {
        case 'patients':
            return getPatientRowById($pdo, $id);

        case 'doctors':
            $stmt = $pdo->prepare('SELECT id, full_name, specialty, contact, schedule FROM doctors WHERE id = :id LIMIT 1');
            break;

        case 'wards':
            $stmt = $pdo->prepare('SELECT id, ward_name, capacity, available_beds FROM wards WHERE id = :id LIMIT 1');
            break;

        case 'appointments':
            $stmt = $pdo->prepare(
                "SELECT a.id,
                        a.patient_id,
                        a.doctor_id,
                        COALESCE(p.full_name, CONCAT('Patient #', a.patient_id)) AS patient,
                        COALESCE(d.full_name, CONCAT('Doctor #', a.doctor_id)) AS doctor,
                        a.date,
                        a.time,
                        a.status,
                        COALESCE(NULLIF(UPPER(a.priority), ''), CASE
                            WHEN UPPER(a.status) = 'CANCELLED' THEN 'URGENT'
                            WHEN a.date = CURDATE() THEN 'URGENT'
                            WHEN a.date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 'PENDING'
                            WHEN UPPER(a.status) = 'COMPLETED' THEN 'CONFIRMED'
                            ELSE 'PENDING'
                        END) AS priority
                 FROM appointments a
                 LEFT JOIN patients p ON p.id = a.patient_id
                 LEFT JOIN doctors d ON d.id = a.doctor_id
                 WHERE a.id = :id
                 LIMIT 1"
            );
            break;

        case 'billing':
            $stmt = $pdo->prepare(
                'SELECT b.id, p.full_name AS patient, b.amount, b.payment_status, b.created_at
                 FROM billing b
                 JOIN patients p ON p.id = b.patient_id
                 WHERE b.id = :id
                 LIMIT 1'
            );
            break;

        case 'inventory':
            $stmt = $pdo->prepare('SELECT id, item_name, quantity, expiration_date, alert_threshold FROM inventory WHERE id = :id LIMIT 1');
            break;

        case 'users':
            $stmt = $pdo->prepare('SELECT id, full_name, username, email, avatar_url, role, last_login FROM users WHERE id = :id LIMIT 1');
            break;

        default:
            throw new RuntimeException('Unsupported module');
    }

    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch();
    if (!is_array($row) && $module === 'appointments') {
        $fallback = $pdo->prepare(
            'SELECT id, date, time, status
             FROM appointments
             WHERE id = :id
             LIMIT 1'
        );
        $fallback->bindValue(':id', $id, PDO::PARAM_INT);
        $fallback->execute();
        $raw = $fallback->fetch();
        if (is_array($raw)) {
            return [
                'id' => (int) ($raw['id'] ?? $id),
                'patient' => 'Patient',
                'doctor' => 'Doctor',
                'date' => (string) ($raw['date'] ?? ''),
                'time' => (string) ($raw['time'] ?? ''),
                'status' => (string) ($raw['status'] ?? 'SCHEDULED'),
                'priority' => 'PENDING',
            ];
        }
    }

    if (!is_array($row)) {
        throw new RuntimeException('Saved record not found');
    }

    return $row;
}

function resolvePatientId(PDO $pdo, $value): ?int
{
    if ($value === null || $value === '') {
        return null;
    }

    if (is_numeric($value)) {
        $id = (int) $value;
        $stmt = $pdo->prepare('SELECT id FROM patients WHERE id = :id LIMIT 1');
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchColumn() ? $id : null;
    }

    $name = trim((string) $value);
    if ($name === '') {
        return null;
    }

    $stmt = $pdo->prepare('SELECT id FROM patients WHERE full_name = :name ORDER BY id DESC LIMIT 1');
    $stmt->bindValue(':name', $name, PDO::PARAM_STR);
    $stmt->execute();
    $foundId = $stmt->fetchColumn();
    return $foundId ? (int) $foundId : null;
}

function resolveDoctorId(PDO $pdo, $value): ?int
{
    if ($value === null || $value === '') {
        return null;
    }

    if (is_numeric($value)) {
        $id = (int) $value;
        $stmt = $pdo->prepare('SELECT id FROM doctors WHERE id = :id LIMIT 1');
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchColumn() ? $id : null;
    }

    $name = trim((string) $value);
    if ($name === '') {
        return null;
    }

    $stmt = $pdo->prepare('SELECT id FROM doctors WHERE full_name = :name ORDER BY id DESC LIMIT 1');
    $stmt->bindValue(':name', $name, PDO::PARAM_STR);
    $stmt->execute();
    $foundId = $stmt->fetchColumn();
    return $foundId ? (int) $foundId : null;
}

function ensureAppointmentsPriorityColumn(PDO $pdo): void
{
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM appointments LIKE 'priority'");
        $exists = $stmt ? $stmt->fetch() : false;
        if ($exists) {
            return;
        }

        $pdo->exec("ALTER TABLE appointments ADD COLUMN priority VARCHAR(20) NULL DEFAULT 'PENDING' AFTER status");
    } catch (Throwable $e) {
        // Keep startup resilient; save/query logic has fallbacks.
    }
}

function appointmentsHasPriorityColumn(PDO $pdo): bool
{
    static $cached = null;
    if ($cached !== null) {
        return $cached;
    }

    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM appointments LIKE 'priority'");
        $cached = (bool) ($stmt && $stmt->fetch());
        return $cached;
    } catch (Throwable $e) {
        $cached = false;
        return false;
    }
}
