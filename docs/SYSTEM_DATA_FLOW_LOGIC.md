# PMS System Data Flow & Logic Architecture

## 📊 Overview
This document explains how data flows through the entire PMS system from Frontend → Backend → Database, with visual diagrams and real-world scenarios.

---

## 🔄 Complete Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER (Frontend)                             │
│                        HTML5 + CSS3 + JavaScript (ES6+)                        │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────┐          ┌──────────────────────┐               │
│  │   Admin Dashboard       │          │  Patient Dashboard   │               │
│  │ - Appointment CRUD      │          │ - View Appointments  │               │
│  │ - Patient Management    │          │ - Health Reminders   │               │
│  │ - Billing & Inventory   │          │ - Notifications      │               │
│  │ - Real-time Updates     │          │ - Activity Log       │               │
│  └─────────────────────────┘          └──────────────────────┘               │
│           ↓                                      ↓                             │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │             app.js (JavaScript Controller)                          │     │
│  │ • Event listeners & DOM manipulation                               │     │
│  │ • AJAX fetch() calls to api.php                                    │     │
│  │ • Real-time refresh loops (10-second intervals)                    │     │
│  │ • Form validation & submission                                     │     │
│  │ • Dark mode toggle & localStorage management                       │     │
│  │ • Client-side search & filtering                                   │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│           ↓                                                                     │
│           └──────────────────────────────────────────────────────────────────┘
│                                    ↓ HTTP/AJAX
└────────────────────────────────────────────────────────────────────────────────┘
                                     ↓
                            POST/GET to /api.php
                                     ↓
┌────────────────────────────────────────────────────────────────────────────────┐
│                          SERVER LAYER (Backend)                                │
│                            PHP 7.4+ REST API                                   │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │  api.php (Route Handler & Business Logic)                           │     │
│  │ ┌────────────────────────────────────────────────────────────────┐  │     │
│  │ │ 1. Request Routing                                             │  │     │
│  │ │    - Parse action parameter from GET/POST                      │  │     │
│  │ │    - Route to appropriate handler (e.g., 'getPatients')        │  │     │
│  │ └────────────────────────────────────────────────────────────────┘  │     │
│  │ ┌────────────────────────────────────────────────────────────────┐  │     │
│  │ │ 2. Authentication Check                                        │  │     │
│  │ │    - Verify session exists                                     │  │     │
│  │ │    - Check user role (Admin/Patient)                           │  │     │
│  │ │    - Return 401 if unauthorized                                │  │     │
│  │ └────────────────────────────────────────────────────────────────┘  │     │
│  │ ┌────────────────────────────────────────────────────────────────┐  │     │
│  │ │ 3. Input Validation & Sanitization                             │  │     │
│  │ │    - Trim whitespace                                           │  │     │
│  │ │    - Validate data types                                       │  │     │
│  │ │    - Check required fields                                     │  │     │
│  │ │    - Prevent SQL injection via PDO prepared statements         │  │     │
│  │ └────────────────────────────────────────────────────────────────┘  │     │
│  │ ┌────────────────────────────────────────────────────────────────┐  │     │
│  │ │ 4. Business Logic Processing                                   │  │     │
│  │ │    - Execute database queries                                  │  │     │
│  │ │    - Transform data if needed                                  │  │     │
│  │ │    - Handle error cases                                        │  │     │
│  │ └────────────────────────────────────────────────────────────────┘  │     │
│  │ ┌────────────────────────────────────────────────────────────────┐  │     │
│  │ │ 5. Response Formatting                                         │  │     │
│  │ │    - Encode response as JSON                                   │  │     │
│  │ │    - Include status codes (200, 400, 401, 500)                 │  │     │
│  │ │    - Set content-type: application/json header                 │  │     │
│  │ └────────────────────────────────────────────────────────────────┘  │     │
│  └──────────────────────────────────────────────────────────────────────┘     │
│           ↓                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │  PDO Database Layer (Prepared Statements)                           │     │
│  │ ┌────────────────────────────────────────────────────────────────┐  │     │
│  │ │ • Connection pooling via static PDO instance                   │  │     │
│  │ │ • Prepared statements prevent SQL injection                    │  │     │
│  │ │ • Parameter binding with :param placeholders                   │  │     │
│  │ │ • Error handling with exceptions                               │  │     │
│  │ └────────────────────────────────────────────────────────────────┘  │     │
│  └──────────────────────────────────────────────────────────────────────┘     │
│           ↓                                                                     │
│           └──────────────────────────────────────────────────────────────────┘
│                                    ↓ SQL Queries
└────────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌────────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER (MySQL)                                  │
│                       Persistent Data Storage                                   │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Key Tables:                                                                   │
│  • users (id, username, password_hash, role, avatar_path)                      │
│  • patients (id, user_id, date_of_birth, phone, address, medical_history)     │
│  • doctors (id, name, specialization, schedule, availability)                 │
│  • appointments (id, patient_id, doctor_id, date, time, status)               │
│  • wards (id, name, capacity, available_beds, department)                     │
│  • billing (id, patient_id, amount, service, payment_status)                  │
│  • inventory (id, item_name, quantity, unit_price, stock_level)               │
│  • reminders (id, patient_id, title, description, scheduled_at)               │
│  • notifications (id, user_id, title, message, read)                          │
│  • activity_log (id, patient_id, action, module, timestamp)                   │
│                                                                                 │
│  Indexes for Performance:                                                      │
│  • PRIMARY KEY on all id columns                                               │
│  • FOREIGN KEYS linking related tables                                         │
│  • Performance indexes on frequently searched columns                          │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
                                     ↑
                            Database returns data
                                     ↑
┌────────────────────────────────────────────────────────────────────────────────┐
│                        RESPONSE FLOW (Backend → Frontend)                       │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  api.php returns JSON:                                                         │
│  ┌──────────────────────────────────────────────────┐                         │
│  │ {                                                 │                         │
│  │   "status": "success",                            │                         │
│  │   "data": {...results...},                        │                         │
│  │   "message": "Operation completed"                │                         │
│  │ }                                                 │                         │
│  └──────────────────────────────────────────────────┘                         │
│           ↑                                                                     │
│           └───────────────────────────────────────────────────────────────────┘
│                          HTTP Response (JSON)
└────────────────────────────────────────────────────────────────────────────────┘
                                     ↑
                            JavaScript fetch() receives
                                     ↑
┌────────────────────────────────────────────────────────────────────────────────┐
│                     FRONTEND RENDERING LAYER                                   │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  app.js processes response:                                                    │
│  1. Parse JSON response                                                        │
│  2. Check status code & error messages                                         │
│  3. Update DOM with received data                                              │
│  4. Refresh UI elements                                                        │
│  5. Show success/error notifications                                           │
│  6. Update localStorage/cache if needed                                        │
│                                                                                 │
│  User sees updated interface immediately                                       │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Real-World Scenario: Admin Booking an Appointment

### Step 1: User Interaction (Frontend)
```
Admin clicks "New Appointment" button
    ↓
Advanced Appointment Modal opens
    ↓
Admin enters:
  - Patient: "John Doe"
  - Doctor: "Dr. Smith"
  - Date: 2026-05-15
  - Time: 10:30 AM
  - Purpose: "Routine Checkup"
  - Ward: "General Medicine"
    ↓
Admin clicks "Save Appointment" button
```

### Step 2: Data Collection & Validation (Frontend - app.js)
```javascript
// Event listener captures form submission
const formData = {
    patientId: 123,           // From search dropdown
    doctorId: 45,             // From search dropdown
    date: "2026-05-15",       // From date input
    time: "10:30",            // From time input
    purpose: "Routine Checkup", // From select
    wardId: 7,                // From select
    notes: "No special notes"  // From textarea
};

// Client-side validation
if (!formData.patientId) showError("Patient required");
if (!formData.doctorId) showError("Doctor required");
if (!formData.date) showError("Date required");

// AJAX call to backend
fetch('/api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        action: 'createAppointment',
        ...formData
    })
});
```

### Step 3: Request Transmission (Network)
```
HTTP POST /api.php
Headers:
  Content-Type: application/json
  
Body:
{
  "action": "createAppointment",
  "patientId": 123,
  "doctorId": 45,
  "date": "2026-05-15",
  "time": "10:30",
  "purpose": "Routine Checkup",
  "wardId": 7,
  "notes": "No special notes"
}
```

### Step 4: Server-Side Processing (Backend - api.php)
```php
// 1. Parse request
$action = $_POST['action'] ?? '';  // "createAppointment"

// 2. Authentication check
if (!currentUser()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// 3. Input validation
$patientId = (int) ($_POST['patientId'] ?? 0);
$doctorId = (int) ($_POST['doctorId'] ?? 0);
$date = trim((string) ($_POST['date'] ?? ''));
$time = trim((string) ($_POST['time'] ?? ''));

if (!$patientId || !$doctorId || !$date || !$time) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// 4. Prepare database insert
$pdo = getPdo();
$stmt = $pdo->prepare("
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, 
                              purpose, ward_id, notes, status, created_at)
    VALUES (:patient_id, :doctor_id, :date, :time, 
            :purpose, :ward_id, :notes, 'SCHEDULED', NOW())
");

// 5. Execute with parameter binding (prevents SQL injection)
$stmt->execute([
    ':patient_id' => $patientId,
    ':doctor_id' => $doctorId,
    ':date' => $date,
    ':time' => $time,
    ':purpose' => $_POST['purpose'] ?? '',
    ':ward_id' => (int) ($_POST['wardId'] ?? 0),
    ':notes' => $_POST['notes'] ?? ''
]);

// 6. Get inserted appointment ID
$appointmentId = $pdo->lastInsertId();

// 7. Format response
echo json_encode([
    'status' => 'success',
    'appointmentId' => $appointmentId,
    'message' => 'Appointment created successfully'
]);
```

### Step 5: Database Operation (MySQL)
```sql
-- INSERT operation
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, 
                          purpose, ward_id, notes, status, created_at)
VALUES (123, 45, '2026-05-15', '10:30:00', 'Routine Checkup', 7, 'No special notes', 
        'SCHEDULED', NOW());

-- Database returns last_insert_id = 456

-- Database also triggers:
-- 1. Update activity_log (audit trail)
-- 2. Create notification for patient
-- 3. Update doctor's schedule cache
```

### Step 6: Response Processing (Frontend)
```javascript
// JavaScript receives JSON response
const response = await fetch(...).then(r => r.json());

// Process response
if (response.status === 'success') {
    // Show success message
    showNotification('Appointment created successfully!', 'success');
    
    // Update UI
    closeAdvancedAppointmentModal();
    refreshAppointmentsTable();
    
    // Log activity
    console.log(`Created appointment #${response.appointmentId}`);
} else {
    // Show error message
    showNotification(response.error, 'error');
}
```

### Step 7: User Sees Update (Frontend)
```
Modal closes
    ↓
Appointments table refreshes automatically
    ↓
New appointment appears in table:
  Patient: John Doe
  Doctor: Dr. Smith
  Date: 2026-05-15 10:30 AM
  Status: SCHEDULED
  Ward: General Medicine
    ↓
Success notification displays: "Appointment created successfully!"
```

---

## 🔐 Real-World Scenario: Patient Viewing Their Appointment

### Flow Diagram
```
Patient logs in (auth.php)
    ↓
Session created with patient ID
    ↓
Patient views "My Appointments"
    ↓
JavaScript calls: fetch('/api.php?action=getPatientDashboardData')
    ↓
API receives request, checks session for patient ID
    ↓
Database query: SELECT * FROM appointments WHERE patient_id = 123
    ↓
PHP returns JSON with appointments & related data
    ↓
JavaScript filters: upcoming vs past appointments
    ↓
UI renders appointment cards with status, date, doctor info
    ↓
Patient sees their appointment with reschedule/cancel buttons
```

---

## 🔄 Key Concepts in Data Flow

### 1. **Request Routing**
```
Frontend → Sends action parameter → Backend reads action → Routes to handler
Example: ?action=getAppointments → calls handleGetAppointments()
```

### 2. **Session Management**
```
User logs in → Session created → Session ID stored in cookie
    ↓
Every API request → currentUser() checks session
    ↓
If valid → returns user data
If invalid → returns 401 Unauthorized
```

### 3. **SQL Injection Prevention**
```
Vulnerable: SELECT * FROM users WHERE username = '$username'
    ↓
    ↓
Safe (PDO): SELECT * FROM users WHERE username = :username
            $stmt->execute([':username' => $username])
```

### 4. **Real-Time Updates (10-second refresh)**
```
setInterval(() => {
    fetch('/api.php?action=getAppointments')
        .then(response => response.json())
        .then(data => updateUI(data));
}, 10000);  // Every 10 seconds
```

### 5. **Error Handling**
```
Frontend tries to create appointment
    ↓
Backend receives request
    ↓
If validation fails: return { status: 'error', message: '...' }
    ↓
If database fails: return { status: 'error', message: 'Database error' }
    ↓
Frontend checks status and shows appropriate error to user
```

---

## 📊 Data Types & Transformations

### Input Data (Frontend)
```javascript
{
    patientId: 123,           // Number
    doctorId: 45,             // Number
    date: "2026-05-15",       // String (YYYY-MM-DD)
    time: "10:30",            // String (HH:MM)
    purpose: "Routine Checkup", // String
}
```

### Processing (Backend)
```php
// Type casting
$patientId = (int) $patientId;  // String → Integer
$doctorId = (int) $doctorId;
$date = trim($date);             // Remove whitespace
$time = trim($time);
```

### Storage (Database)
```sql
-- Column types
patient_id INT NOT NULL
doctor_id INT NOT NULL
appointment_date DATE
appointment_time TIME
purpose VARCHAR(255)
status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED')
created_at TIMESTAMP
```

### Output Data (API Response)
```json
{
    "status": "success",
    "appointmentId": 456,
    "message": "Appointment created successfully"
}
```

---

## 🎯 Key System Components

### Frontend Components
- **HTML Templates**: Static structure in index.php
- **CSS Styling**: Dynamic theme via CSS variables in styles.css
- **JavaScript Logic**: DOM manipulation, API calls, state management in app.js
- **Forms**: Input validation before sending to server

### Backend Components
- **config.php**: Database connection, security setup
- **auth.php**: Login/logout logic, session management
- **api.php**: REST endpoint, business logic, database queries
- **Database**: MySQL persistent storage

### Communication Protocol
- **HTTP Method**: POST for mutations (create/update/delete), GET for queries
- **Content-Type**: JSON for API responses
- **Authentication**: Session cookies for state management
- **Error Codes**: 200 (OK), 400 (Bad Request), 401 (Unauthorized), 500 (Server Error)

---

## 📈 Performance Optimizations

1. **Connection Pooling**: Single PDO instance reused (static variable)
2. **Prepared Statements**: Prevents SQL injection + faster repeated queries
3. **Indexes**: Database indexes on frequently searched columns
4. **Pagination**: Limit parameter (default 100, max 250) to reduce data transfer
5. **Lazy Loading**: Patient data loaded only when dashboard opens
6. **Caching**: Recent searches cached in browser localStorage

---

## ✅ Summary

The PMS system follows a classic 3-tier architecture:
1. **Frontend**: HTML/CSS/JS collects user input and displays results
2. **Backend**: PHP/PDO validates, processes business logic, and queries database
3. **Database**: MySQL stores persistent data with relationships and constraints

Data flows securely from user → frontend validation → server validation → database → response → frontend display. Every layer has validation and error handling to ensure data integrity and security.
