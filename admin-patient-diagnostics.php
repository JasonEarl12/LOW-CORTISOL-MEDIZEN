<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';
applySecurityHeaders();

$user = currentUser();

// Check if user is admin
if (!$user || strtoupper($user['role'] ?? '') !== 'ADMIN') {
    http_response_code(403);
    die('Access denied. Admin only.');
}

$action = $_GET['action'] ?? '';
$diagnosticData = null;
$fixResults = null;
$error = null;

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ajax'])) {
    header('Content-Type: application/json');
    
    if ($_POST['ajax'] === 'diagnose') {
        // Call the diagnostic API endpoint
        $ch = curl_init("http://localhost/pms/api.php?action=diagnose_patient_links");
        curl_setopt($ch, CURLOPT_COOKIE, 'PHPSESSID=' . session_id());
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        echo $response;
        exit;
    } elseif ($_POST['ajax'] === 'fix') {
        // Call the fix API endpoint
        $ch = curl_init("http://localhost/pms/api.php?action=fix_patient_links");
        curl_setopt($ch, CURLOPT_COOKIE, 'PHPSESSID=' . session_id());
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        echo $response;
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Diagnostics - MEDIZEN</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f7fa;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 30px;
        }
        
        h1 {
            color: #1a2332;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        
        button {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
        }
        
        .btn-primary {
            background: #007B83;
            color: white;
        }
        
        .btn-primary:hover {
            background: #005f66;
        }
        
        .btn-success {
            background: #10b981;
            color: white;
        }
        
        .btn-success:hover {
            background: #059669;
        }
        
        .btn-secondary {
            background: #e5e7eb;
            color: #333;
        }
        
        .btn-secondary:hover {
            background: #d1d5db;
        }
        
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: #007B83;
        }
        
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #e5e7eb;
            border-top-color: #007B83;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .results {
            display: none;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .summary-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
        }
        
        .summary-card h3 {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }
        
        .summary-card .number {
            font-size: 32px;
            font-weight: 700;
            color: #007B83;
        }
        
        .summary-card.error .number {
            color: #ef4444;
        }
        
        .summary-card.warning .number {
            color: #f59e0b;
        }
        
        .summary-card.success .number {
            color: #10b981;
        }
        
        .issues-section {
            margin-bottom: 30px;
        }
        
        .issue-type {
            margin-bottom: 20px;
        }
        
        .issue-type h3 {
            font-size: 16px;
            color: #1a2332;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .issue-list {
            background: #f9fafb;
            border-radius: 6px;
            overflow: hidden;
        }
        
        .issue-item {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .issue-item:last-child {
            border-bottom: none;
        }
        
        .issue-info {
            flex: 1;
        }
        
        .issue-name {
            font-weight: 600;
            color: #1a2332;
            margin-bottom: 4px;
        }
        
        .issue-detail {
            font-size: 13px;
            color: #666;
        }
        
        .issue-count {
            background: #007B83;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            min-width: 50px;
            text-align: center;
        }
        
        .no-issues {
            background: #ecfdf5;
            border: 1px solid #d1fae5;
            color: #047857;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        
        .recommendations {
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
        }
        
        .recommendations h4 {
            color: #92400e;
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .recommendations ul {
            margin-left: 20px;
            color: #78350f;
            font-size: 13px;
        }
        
        .recommendations li {
            margin-bottom: 8px;
            line-height: 1.5;
        }
        
        .alert {
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        
        .alert-error {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
        }
        
        .alert-success {
            background: #ecfdf5;
            border: 1px solid #d1fae5;
            color: #047857;
        }
        
        .back-link {
            color: #007B83;
            text-decoration: none;
            font-size: 14px;
            margin-bottom: 20px;
            display: inline-block;
        }
        
        .back-link:hover {
            text-decoration: underline;
        }
        
        input[type="text"] {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            font-size: 14px;
        }
        
        input[type="text"]:focus {
            outline: none;
            border-color: #007B83 !important;
            box-shadow: 0 0 0 3px rgba(0, 123, 131, 0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.php" class="back-link">← Back to Dashboard</a>
        
        <h1>🔍 Patient Data Diagnostics</h1>
        <p class="subtitle">Identify and fix patients with appointments not appearing in their dashboard</p>
        
        <div class="controls">
            <button class="btn-primary" onclick="runDiagnostic()">
                📊 Run Diagnostic
            </button>
            <button class="btn-success" id="fixBtn" onclick="runFix()" style="display:none;">
                🔧 Fix Issues
            </button>
            <button class="btn-secondary" onclick="location.reload()">
                🔄 Refresh
            </button>
        </div>
        
        <!-- Patient Search Section -->
        <div style="background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 12px; color: #1e40af;">🔍 Check Specific Patient</h3>
            <div style="display: flex; gap: 10px;">
                <input type="text" id="patientNameInput" placeholder="Enter patient name (e.g., Mark Salazar)" style="flex: 1; padding: 10px; border: 1px solid #bfdbfe; border-radius: 4px;">
                <button class="btn-primary" onclick="checkSpecificPatient()">Check Patient</button>
            </div>
            <div id="specificPatientResults" style="margin-top: 15px;"></div>
        </div>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="margin-top: 10px;">Running diagnostic...</p>
        </div>
        
        <div class="results" id="results"></div>
    </div>
    
    <script>
        async function runDiagnostic() {
            const loading = document.getElementById('loading');
            const results = document.getElementById('results');
            const fixBtn = document.getElementById('fixBtn');
            
            loading.style.display = 'block';
            results.style.display = 'none';
            fixBtn.style.display = 'none';
            
            try {
                const response = await fetch('api.php?action=diagnose_patient_links', {
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (data.error) {
                    results.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
                    results.style.display = 'block';
                } else {
                    renderDiagnosticResults(data);
                    results.style.display = 'block';
                    if (data.diagnostic_results.total_patients_with_issues > 0) {
                        fixBtn.style.display = 'inline-block';
                    }
                }
            } catch (error) {
                results.innerHTML = `<div class="alert alert-error">Error: ${error.message}</div>`;
                results.style.display = 'block';
            }
            
            loading.style.display = 'none';
        }
        
        async function runFix() {
            if (!confirm('This will automatically link unlinked patient users to their patient records. Continue?')) {
                return;
            }
            
            const loading = document.getElementById('loading');
            const results = document.getElementById('results');
            const fixBtn = document.getElementById('fixBtn');
            
            loading.style.display = 'block';
            results.style.display = 'none';
            fixBtn.style.display = 'none';
            
            try {
                const response = await fetch('api.php?action=fix_patient_links', {
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (data.error) {
                    results.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
                } else {
                    results.innerHTML = `
                        <div class="alert alert-success">
                            <strong>✓ Fix Complete!</strong><br>
                            ${data.message}<br>
                            Linked: ${data.linked} | Not Found: ${data.not_found}
                        </div>
                    `;
                    
                    if (data.details && data.details.length > 0) {
                        results.innerHTML += '<h3 style="margin-top: 20px;">Details:</h3>';
                        results.innerHTML += '<div class="issue-list">';
                        data.details.forEach(detail => {
                            const statusColor = detail.status === 'LINKED' ? '#10b981' : '#ef4444';
                            results.innerHTML += `
                                <div class="issue-item">
                                    <div class="issue-info">
                                        <div class="issue-name">${detail.username}</div>
                                        <div class="issue-detail">${detail.user_name}</div>
                                    </div>
                                    <span style="color: ${statusColor}; font-weight: 600;">${detail.status}</span>
                                </div>
                            `;
                        });
                        results.innerHTML += '</div>';
                    }
                    
                    results.innerHTML += '<button class="btn-primary" onclick="runDiagnostic()" style="margin-top: 20px;">Run Diagnostic Again</button>';
                }
                results.style.display = 'block';
            } catch (error) {
                results.innerHTML = `<div class="alert alert-error">Error: ${error.message}</div>`;
                results.style.display = 'block';
            }
            
            loading.style.display = 'none';
        }
        
        function renderDiagnosticResults(data) {
            const results = document.getElementById('results');
            const diag = data.diagnostic_results;
            
            let html = '';
            
            // Summary cards
            html += '<div class="summary">';
            html += `
                <div class="summary-card">
                    <h3>Total Patients</h3>
                    <div class="number">${diag.total_patients_with_appointments}</div>
                </div>
                <div class="summary-card warning">
                    <h3>With Issues</h3>
                    <div class="number">${diag.total_patients_with_issues}</div>
                </div>
                <div class="summary-card success">
                    <h3>Properly Linked</h3>
                    <div class="number">${diag.properly_linked.length}</div>
                </div>
            `;
            html += '</div>';
            
            // Issues section
            if (diag.total_patients_with_issues === 0) {
                html += '<div class="no-issues">✓ All patient users are properly linked!</div>';
            } else {
                html += '<div class="issues-section">';
                
                // No User
                if (diag.no_user.length > 0) {
                    html += `
                        <div class="issue-type">
                            <h3>❌ No User Account (${diag.no_user.length})</h3>
                            <div class="issue-list">
                    `;
                    diag.no_user.forEach(patient => {
                        html += `
                            <div class="issue-item">
                                <div class="issue-info">
                                    <div class="issue-name">${patient.full_name}</div>
                                    <div class="issue-detail">Appointments: ${patient.appointment_count}</div>
                                </div>
                                <span class="issue-count">${patient.appointment_count}</span>
                            </div>
                        `;
                    });
                    html += '</div></div>';
                }
                
                // Unlinked User
                if (diag.unlinked_user.length > 0) {
                    html += `
                        <div class="issue-type">
                            <h3>⚠️ User Account Not Linked (${diag.unlinked_user.length})</h3>
                            <div class="issue-list">
                    `;
                    diag.unlinked_user.forEach(patient => {
                        html += `
                            <div class="issue-item">
                                <div class="issue-info">
                                    <div class="issue-name">${patient.full_name}</div>
                                    <div class="issue-detail">User: ${patient.username} | Appointments: ${patient.appointment_count}</div>
                                </div>
                                <span class="issue-count">${patient.appointment_count}</span>
                            </div>
                        `;
                    });
                    html += '</div></div>';
                }
                
                // Wrong Link
                if (diag.wrong_link.length > 0) {
                    html += `
                        <div class="issue-type">
                            <h3>🔗 Wrong Patient Link (${diag.wrong_link.length})</h3>
                            <div class="issue-list">
                    `;
                    diag.wrong_link.forEach(patient => {
                        html += `
                            <div class="issue-item">
                                <div class="issue-info">
                                    <div class="issue-name">${patient.full_name}</div>
                                    <div class="issue-detail">User: ${patient.username} (ID ${patient.user_id}) linked to patient ${patient.user_patient_id}</div>
                                </div>
                                <span class="issue-count">${patient.appointment_count}</span>
                            </div>
                        `;
                    });
                    html += '</div></div>';
                }
                
                html += '</div>';
            }
            
            // Recommendations
            html += `
                <div class="recommendations">
                    <h4>What to do:</h4>
                    <ul>
                        <li><strong>No User Account:</strong> Create user accounts for these patients or run the "Create Test Patients" tool to set up patient users with accounts.</li>
                        <li><strong>User Account Not Linked:</strong> Click "Fix Issues" button above to automatically link these users to their patient records.</li>
                        <li><strong>Wrong Patient Link:</strong> Manually update the patient_id in the users table for these accounts, or delete and recreate them.</li>
                    </ul>
                </div>
            `;
            
            results.innerHTML = html;
        }
        
        async function checkSpecificPatient() {
            const patientName = document.getElementById('patientNameInput').value.trim();
            if (!patientName) {
                alert('Please enter a patient name');
                return;
            }
            
            const resultsDiv = document.getElementById('specificPatientResults');
            resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Checking patient...</p></div>';
            
            try {
                const response = await fetch('api.php?action=diagnose_specific_patient&patient_name=' + encodeURIComponent(patientName), {
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (data.status === 'error') {
                    resultsDiv.innerHTML = `<div class="alert alert-error">${data.message}</div>`;
                    return;
                }
                
                let html = '<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px;">';
                
                // Patient info
                html += `
                    <h4 style="margin-bottom: 12px; color: #1a2332;">Patient: ${data.patient.full_name}</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px; font-size: 14px;">
                        <div><strong>Patient ID:</strong> ${data.patient.id}</div>
                        <div><strong>Email:</strong> ${data.patient.email || 'N/A'}</div>
                        <div><strong>Phone:</strong> ${data.patient.phone || 'N/A'}</div>
                        <div><strong>Appointments:</strong> ${data.total_appointments}</div>
                    </div>
                `;
                
                // User account status
                html += '<div style="margin: 15px 0; padding-top: 15px; border-top: 1px solid #e5e7eb;">';
                if (data.user_account) {
                    const statusColor = data.link_status === 'PROPERLY_LINKED' ? '#10b981' : '#ef4444';
                    const statusBg = data.link_status === 'PROPERLY_LINKED' ? '#ecfdf5' : '#fee2e2';
                    html += `
                        <h5 style="margin-bottom: 10px; color: #1a2332;">User Account</h5>
                        <div style="background: ${statusBg}; border: 1px solid ${statusColor === '#10b981' ? '#d1fae5' : '#fecaca'}; border-radius: 4px; padding: 10px;">
                            <div><strong>Username:</strong> ${data.user_account.username}</div>
                            <div><strong>User ID:</strong> ${data.user_account.id}</div>
                            <div><strong>Patient ID Link:</strong> ${data.user_account.patient_id || 'NULL'}</div>
                            <div style="color: ${statusColor}; font-weight: 600; margin-top: 8px;">▶ ${data.link_status}</div>
                        </div>
                    `;
                } else {
                    html += `
                        <h5 style="margin-bottom: 10px; color: #1a2332;">User Account</h5>
                        <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 4px; padding: 10px; color: #991b1b;">
                            ❌ No user account found for this patient
                        </div>
                    `;
                }
                html += '</div>';
                
                // Can see appointments?
                html += '<div style="margin: 15px 0; padding-top: 15px; border-top: 1px solid #e5e7eb;">';
                const canSee = data.diagnosis.can_see_appointments;
                const seeBg = canSee ? '#ecfdf5' : '#fee2e2';
                const seeColor = canSee ? '#047857' : '#991b1b';
                html += `
                    <div style="background: ${seeBg}; border: 1px solid ${canSee ? '#d1fae5' : '#fecaca'}; border-radius: 4px; padding: 12px; color: ${seeColor};">
                        <strong>${canSee ? '✓ PATIENT CAN SEE APPOINTMENTS' : '✗ PATIENT CANNOT SEE APPOINTMENTS'}</strong>
                        <div style="font-size: 13px; margin-top: 8px;">
                            Reasons this patient cannot see appointments:
                            <ul style="margin-left: 20px; margin-top: 6px;">
                                ${!data.diagnosis.has_user_account ? '<li>No user account created</li>' : ''}
                                ${data.diagnosis.has_user_account && !data.diagnosis.is_properly_linked ? '<li>User account not linked to patient record</li>' : ''}
                                ${!data.diagnosis.has_appointments ? '<li>No appointments created</li>' : ''}
                            </ul>
                        </div>
                    </div>
                `;
                html += '</div>';
                
                // Appointments list
                if (data.total_appointments > 0) {
                    html += '<div style="margin: 15px 0; padding-top: 15px; border-top: 1px solid #e5e7eb;">';
                    html += '<h5 style="margin-bottom: 10px; color: #1a2332;">Appointments (';
                    html += data.total_appointments + ')</h5>';
                    html += '<div class="issue-list">';
                    data.appointments.forEach(apt => {
                        html += `
                            <div class="issue-item">
                                <div class="issue-info">
                                    <div class="issue-name">${apt.doctor || 'Doctor not assigned'}</div>
                                    <div class="issue-detail">${apt.date} at ${apt.time} | ${apt.status}</div>
                                </div>
                            </div>
                        `;
                    });
                    html += '</div></div>';
                }
                
                html += '</div>';
                resultsDiv.innerHTML = html;
                
            } catch (error) {
                resultsDiv.innerHTML = `<div class="alert alert-error">Error: ${error.message}</div>`;
            }
        }
        
        // Auto-run on page load
        window.addEventListener('load', () => {
            runDiagnostic();
        });
    </script>
</body>
</html>
