<?php
/**
 * Patient Dashboard Verification Tool
 * Check if all tables and data are properly set up
 * Access via: http://localhost/pms/verify-patient-dashboard.php
 */

require_once __DIR__ . '/config.php';

session_start();
$user = $_SESSION['auth_user'] ?? null;
$isAdmin = $user && strtoupper($user['role'] ?? '') === 'ADMIN';

if (!$isAdmin) {
    http_response_code(403);
    echo '<!DOCTYPE html>
    <html>
    <head>
        <title>Access Denied</title>
        <style>body{font-family:Arial;padding:20px;color:#d32f2f;background:#fff3e0;border-radius:8px;max-width:600px;margin:50px auto;border-left:4px solid #d32f2f;}</style>
    </head>
    <body>
        <h2>⛔ Access Denied</h2>
        <p>This verification tool is only available to administrators.</p>
        <p><a href="admin_login.php">Login as Admin</a></p>
    </body>
    </html>';
    exit;
}

$pdo = getPdo();
$results = [];

// Check tables
$tables_to_check = ['reminders', 'notifications', 'activity_log', 'appointments', 'patients', 'users'];
$table_status = [];

foreach ($tables_to_check as $table) {
    try {
        $result = $pdo->query("SELECT COUNT(*) FROM $table");
        $count = $result->fetchColumn();
        $table_status[$table] = ['exists' => true, 'count' => (int)$count];
    } catch (Exception $e) {
        $table_status[$table] = ['exists' => false, 'count' => 0, 'error' => $e->getMessage()];
    }
}

// Get patient count with appointments
$patient_appointments = [];
try {
    $stmt = $pdo->query("
        SELECT 
            p.id, 
            p.full_name,
            (SELECT COUNT(*) FROM appointments WHERE patient_id = p.id) as apt_count,
            (SELECT COUNT(*) FROM reminders WHERE patient_id = p.id) as reminder_count,
            (SELECT COUNT(*) FROM activity_log WHERE patient_id = p.id) as activity_count
        FROM patients p
        LIMIT 5
    ");
    $patient_appointments = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
} catch (Exception $e) {
    $patient_appointments = ['error' => $e->getMessage()];
}

// Get sample data
$sample_data = [];

try {
    $stmt = $pdo->query("SELECT id, title, description, status FROM reminders LIMIT 2");
    $sample_data['reminders'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
} catch (Exception $e) {
    $sample_data['reminders'] = [];
}

try {
    $stmt = $pdo->query("SELECT id, title, message, notification_type FROM notifications LIMIT 2");
    $sample_data['notifications'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
} catch (Exception $e) {
    $sample_data['notifications'] = [];
}

try {
    $stmt = $pdo->query("SELECT id, title, description FROM activity_log LIMIT 2");
    $sample_data['activity'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
} catch (Exception $e) {
    $sample_data['activity'] = [];
}

// Determine overall status
$all_required_tables_exist = $table_status['reminders']['exists'] && 
                             $table_status['notifications']['exists'] && 
                             $table_status['activity_log']['exists'];

$has_sample_data = count($sample_data['reminders']) > 0 || 
                   count($sample_data['notifications']) > 0 || 
                   count($sample_data['activity']) > 0;

?>
<!DOCTYPE html>
<html>
<head>
    <title>Patient Dashboard Verification</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #007B83 0%, #005f66 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2rem; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.05rem; }
        .content {
            padding: 30px;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .status-card {
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            background: #fafafa;
            transition: all 0.3s;
        }
        .status-card.success {
            border-color: #10b981;
            background: #f0fdf4;
            border-left: 5px solid #10b981;
        }
        .status-card.warning {
            border-color: #f59e0b;
            background: #fffbf0;
            border-left: 5px solid #f59e0b;
        }
        .status-card.error {
            border-color: #ef4444;
            background: #fef2f2;
            border-left: 5px solid #ef4444;
        }
        .status-card h3 {
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        .status-card .icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        .table-count {
            font-size: 2.5rem;
            font-weight: bold;
            color: #007B83;
            margin: 10px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-top: 10px;
        }
        .badge-success { background: #10b981; color: white; }
        .badge-warning { background: #f59e0b; color: white; }
        .badge-error { background: #ef4444; color: white; }
        .sample-data {
            margin-top: 40px;
            border-top: 2px solid #e0e0e0;
            padding-top: 30px;
        }
        .sample-data h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.3rem;
        }
        .data-section {
            margin-bottom: 25px;
        }
        .data-section h3 {
            color: #007B83;
            margin-bottom: 12px;
            font-size: 1.05rem;
        }
        .data-item {
            background: #f9f9f9;
            padding: 12px;
            border-left: 3px solid #007B83;
            margin-bottom: 10px;
            border-radius: 4px;
        }
        .data-item strong { color: #333; }
        .data-item .info { color: #666; font-size: 0.95rem; margin-top: 4px; }
        .patient-data {
            margin-top: 20px;
        }
        .patient-row {
            display: grid;
            grid-template-columns: 1fr 100px 120px 120px 100px;
            gap: 15px;
            padding: 12px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            margin-bottom: 10px;
            background: #fafafa;
        }
        .patient-row header { font-weight: 600; color: #333; }
        .patient-row div { text-align: center; color: #666; }
        .setup-button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #007B83 0%, #005f66 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s;
        }
        .setup-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 123, 131, 0.4);
        }
        .overall-status {
            background: linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%);
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            text-align: center;
        }
        .overall-status.needs-setup {
            background: linear-gradient(135deg, #fef2f2 0%, #fffbf0 100%);
            border-color: #ef4444;
        }
        .overall-status h2 {
            color: #10b981;
            margin-bottom: 10px;
            font-size: 1.5rem;
        }
        .overall-status.needs-setup h2 {
            color: #ef4444;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Patient Dashboard Verification</h1>
            <p>Check setup status and data availability</p>
        </div>
        
        <div class="content">
            <!-- Overall Status -->
            <div class="overall-status <?php echo !$all_required_tables_exist ? 'needs-setup' : ''; ?>">
                <h2><?php echo $all_required_tables_exist ? '✅ Setup Complete' : '❌ Setup Needed'; ?></h2>
                <p style="color: #666; font-size: 1.05rem;">
                    <?php 
                    if ($all_required_tables_exist) {
                        echo $has_sample_data ? 
                            'All required tables exist and contain sample data.' : 
                            'All required tables exist. Add sample data to get started.';
                    } else {
                        echo 'Some required tables are missing. Run the setup to continue.';
                    }
                    ?>
                </p>
                <?php if (!$all_required_tables_exist): ?>
                <form method="get" action="setup-patient-dashboard.php" style="margin-top: 15px;">
                    <button type="submit" class="setup-button">▶ Run Setup Now</button>
                </form>
                <?php endif; ?>
            </div>

            <!-- Table Status Grid -->
            <h2 style="margin: 30px 0 20px 0; color: #333;">📊 Database Tables Status</h2>
            <div class="status-grid">
                <?php foreach ($table_status as $table => $status): 
                    $status_class = $status['exists'] ? 'success' : ($table === 'appointments' || $table === 'patients' || $table === 'users' ? 'warning' : 'error');
                    $icon = $status['exists'] ? '✓' : '✗';
                ?>
                <div class="status-card <?php echo $status_class; ?>">
                    <div class="icon"><?php echo $icon; ?></div>
                    <h3><?php echo ucfirst($table); ?></h3>
                    <?php if ($status['exists']): ?>
                        <div class="table-count"><?php echo $status['count']; ?></div>
                        <span class="status-badge badge-success">Table exists</span>
                        <div style="color: #666; font-size: 0.9rem; margin-top: 8px;">
                            <?php echo $status['count']; ?> record<?php echo $status['count'] !== 1 ? 's' : ''; ?>
                        </div>
                    <?php else: ?>
                        <span class="status-badge badge-error">Missing</span>
                        <div style="color: #d32f2f; font-size: 0.9rem; margin-top: 8px;">
                            This table needs to be created
                        </div>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            </div>

            <!-- Sample Data Section -->
            <?php if ($has_sample_data): ?>
            <div class="sample-data">
                <h2>📋 Sample Data Preview</h2>
                
                <?php if (!empty($sample_data['reminders'])): ?>
                <div class="data-section">
                    <h3>📌 Reminders (<?php echo count($sample_data['reminders']); ?> records)</h3>
                    <?php foreach ($sample_data['reminders'] as $reminder): ?>
                    <div class="data-item">
                        <strong><?php echo htmlspecialchars($reminder['title']); ?></strong>
                        <div class="info"><?php echo htmlspecialchars($reminder['description']); ?></div>
                        <div class="info">Status: <?php echo htmlspecialchars($reminder['status']); ?></div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
                
                <?php if (!empty($sample_data['notifications'])): ?>
                <div class="data-section">
                    <h3>🔔 Notifications (<?php echo count($sample_data['notifications']); ?> records)</h3>
                    <?php foreach ($sample_data['notifications'] as $notif): ?>
                    <div class="data-item">
                        <strong><?php echo htmlspecialchars($notif['title']); ?></strong>
                        <div class="info"><?php echo htmlspecialchars($notif['message']); ?></div>
                        <div class="info">Type: <?php echo htmlspecialchars($notif['notification_type']); ?></div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
                
                <?php if (!empty($sample_data['activity'])): ?>
                <div class="data-section">
                    <h3>📊 Activity Log (<?php echo count($sample_data['activity']); ?> records)</h3>
                    <?php foreach ($sample_data['activity'] as $activity): ?>
                    <div class="data-item">
                        <strong><?php echo htmlspecialchars($activity['title']); ?></strong>
                        <div class="info"><?php echo htmlspecialchars($activity['description']); ?></div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <!-- Patient Data Summary -->
            <?php if (!empty($patient_appointments) && !isset($patient_appointments['error'])): ?>
            <div class="patient-data">
                <h2 style="margin: 30px 0 20px 0; color: #333;">👥 Patients with Related Data</h2>
                <div class="patient-row" style="font-weight: 600; background: linear-gradient(135deg, #007B83 0%, #005f66 100%); color: white; border: none;">
                    <div>Patient Name</div>
                    <div>Patient ID</div>
                    <div>Appointments</div>
                    <div>Reminders</div>
                    <div>Activities</div>
                </div>
                <?php foreach ($patient_appointments as $patient): ?>
                <div class="patient-row">
                    <div style="text-align: left; font-weight: 600; color: #333;"><?php echo htmlspecialchars($patient['full_name']); ?></div>
                    <div><?php echo $patient['id']; ?></div>
                    <div><?php echo $patient['apt_count']; ?></div>
                    <div><?php echo $patient['reminder_count']; ?></div>
                    <div><?php echo $patient['activity_count']; ?></div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <!-- Next Steps -->
            <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e0e0e0;">
                <h2 style="color: #333; margin-bottom: 15px;">🚀 Next Steps</h2>
                <ol style="color: #666; line-height: 1.8; margin-left: 20px;">
                    <?php if (!$all_required_tables_exist): ?>
                    <li><strong>Run Setup:</strong> Click the "Run Setup Now" button above to create required tables</li>
                    <li><strong>Verify:</strong> Refresh this page to see the updated status</li>
                    <?php endif; ?>
                    <li><strong>Login as Patient:</strong> Go to <a href="patient_login.php" style="color: #007B83; text-decoration: none; font-weight: 600;">patient login</a></li>
                    <li><strong>View Dashboard:</strong> You should now see populated data in all sections</li>
                    <li><strong>Add More Data:</strong> Use admin panel to create appointments and reminders for patients</li>
                </ol>
            </div>
        </div>
    </div>
</body>
</html>
