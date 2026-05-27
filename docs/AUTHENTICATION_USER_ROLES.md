# PMS Authentication & User Role System

## 📋 Table of Contents
1. [Authentication Overview](#authentication-overview)
2. [Password Processing & Security](#password-processing--security)
3. [Username Validation](#username-validation)
4. [Admin User Management](#admin-user-management)
5. [Patient User Management](#patient-user-management)
6. [Admin & Patient Data Exchange](#admin--patient-data-exchange)
7. [Session Management](#session-management)
8. [Security Implementation](#security-implementation)

---

## 🔐 Authentication Overview

The PMS system uses a **role-based access control (RBAC)** model with two main user types:

```
┌─────────────────────────────────────────────────┐
│         User Authentication System              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │  Admin Login     │  │  Patient Login   │   │
│  │  /admin_login.php│  │/patient_login.php│   │
│  └────────┬─────────┘  └────────┬─────────┘   │
│           │                     │              │
│           └─────────────┬───────┘              │
│                         │                      │
│         ┌───────────────────────────────────┐  │
│         │   auth.php (Authentication)       │  │
│         │ • Verify credentials              │  │
│         │ • Hash password check             │  │
│         │ • Create session                  │  │
│         │ • Set cookies                     │  │
│         └───────────────────────────────────┘  │
│                         │                      │
│         ┌───────────────────────────────────┐  │
│         │   Database (users table)          │  │
│         │ • Store hashed passwords          │  │
│         │ • Verify credentials              │  │
│         │ • Return user data                │  │
│         └───────────────────────────────────┘  │
│                         │                      │
│  ┌──────────────────────────────────────────┐ │
│  │   Session Created (Logged In)            │ │
│  │ • user_id, role stored in session        │ │
│  │ • Session cookie sent to browser         │ │
│  │ • Redirect to dashboard (index.php)      │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔑 Password Processing & Security

### How Passwords Are Stored

#### STEP 1: User Registration / Login
```
User enters password: "MySecurePassword123"
```

#### STEP 2: Frontend Validation
```php
// In patient_login.php or admin_login.php
$password = trim((string) ($_POST['password'] ?? ''));

// Frontend validation
if (empty($password)) {
    showError("Password required");
    exit;
}
if (strlen($password) < 6) {
    showError("Password too short");
    exit;
}
```

#### STEP 3: Send to Backend (auth.php)
```php
// Receive from form
$password = trim((string) ($_POST['password'] ?? ''));
$username = trim((string) ($_POST['username'] ?? ''));

// Do NOT hash yet - we need to verify first
```

#### STEP 4: Retrieve User from Database
```php
$pdo = getPdo();

// Query for user by username
$stmt = $pdo->prepare('SELECT id, username, password_hash, role FROM users WHERE username = :username');
$stmt->execute([':username' => $username]);
$user = $stmt->fetch();

// User found or not?
if (!$user) {
    $_SESSION['auth_error'] = 'Invalid credentials';
    exit;  // Don't reveal if username exists
}
```

#### STEP 5: Verify Password Hash
```php
// PHP's password_verify() function
// Compares plaintext password with stored hash

if (password_verify($password, $user['password_hash'])) {
    // Password is CORRECT ✓
    // User is authenticated
} else {
    // Password is WRONG ✗
    $_SESSION['auth_error'] = 'Invalid credentials';
    exit;
}
```

#### STEP 6: Create Session (On Successful Login)
```php
// Clear old session
session_regenerate_id(true);

// Store user data in session
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['role'] = $user['role'];
$_SESSION['login_time'] = time();

// Set inactivity timeout
$_SESSION['last_activity'] = time();

// Session ID stored in cookie automatically
```

#### STEP 7: Redirect to Dashboard
```php
// User now logged in
// Redirect based on role
if ($user['role'] === 'PATIENT') {
    header('Location: index.php?role=patient');
} else {
    header('Location: index.php?role=admin');
}
exit;
```

### Password Storage in Database

#### NEVER STORE PLAINTEXT PASSWORDS
```php
// ❌ WRONG - Security breach!
$password = 'MySecurePassword123';
$stmt = $pdo->prepare('INSERT INTO users (username, password) VALUES (:u, :p)');
$stmt->execute([':u' => $username, ':p' => $password]);
// If hacker gets database, they have all passwords!
```

#### ALWAYS HASH PASSWORDS
```php
// ✓ CORRECT - Industry standard
$password = 'MySecurePassword123';
$password_hash = password_hash($password, PASSWORD_BCRYPT);
// password_hash returns something like:
// $2y$10$8D7v8KvdH3/z.zqjVpO8JuVv3M7z8v8v8v8v8v8v8v8v8v8v8v8

$stmt = $pdo->prepare('INSERT INTO users (username, password_hash) VALUES (:u, :h)');
$stmt->execute([':u' => $username, ':h' => $password_hash]);
// If hacker gets database, they only have hashes (can't reverse)
```

### Password Hashing Details

#### What is Password Hashing?
```
Input:   "MyPassword" → Hashing Function → Output: "$2y$10$abc123xyz..."
Input:   "MyPassword" → Same Hashing Function → Output: "$2y$10$def456uvw..."

The SAME password produces DIFFERENT hashes!
But password_verify() knows how to check them.
```

#### BCrypt Algorithm
```php
password_hash($password, PASSWORD_BCRYPT);

// Result format:
// $2y$ = BCrypt algorithm identifier
// 10 = Cost factor (2^10 = 1024 rounds of hashing)
// $ = Separators
// abc123... = Actual hash

// Why BCrypt?
// • Slow by design (prevents brute-force attacks)
// • Adds salt automatically
// • Can increase cost factor as computers get faster
```

#### Password Verification Flow
```
User tries to login with "MyPassword"
  ↓
Get stored hash from database: "$2y$10$abc123..."
  ↓
password_verify("MyPassword", "$2y$10$abc123...")
  ↓
PHP hashes "MyPassword" internally using BCrypt
  ↓
Compares newly hashed password with stored hash
  ↓
If they match → Password is CORRECT ✓
If they don't match → Password is WRONG ✗
```

---

## 📝 Username Validation

### Username Requirements
```php
// In auth.php

$username = trim((string) ($_POST['username'] ?? ''));

// Validation checks
if (empty($username)) {
    error("Username required");
}

if (strlen($username) < 3) {
    error("Username must be at least 3 characters");
}

if (strlen($username) > 50) {
    error("Username must be less than 50 characters");
}

// Optional: Allow only alphanumeric and underscore
if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    error("Username can only contain letters, numbers, and underscores");
}
```

### Username Uniqueness
```php
// Check if username already exists in database
$stmt = $pdo->prepare('SELECT id FROM users WHERE username = :username');
$stmt->execute([':username' => $username]);

if ($stmt->fetch()) {
    error("Username already taken");
}

// If we get here, username is unique
```

### Username During Login
```php
// Step 1: Find user by username
$stmt = $pdo->prepare('SELECT * FROM users WHERE username = :username');
$stmt->execute([':username' => $username]);
$user = $stmt->fetch();

if (!$user) {
    error("User not found");
    // Don't reveal which usernames exist (security)
}

// Step 2: Verify password for this user
if (!password_verify($password, $user['password_hash'])) {
    error("Invalid credentials");
    // Keep message generic
}

// Step 3: Create session with user_id (not username)
$_SESSION['user_id'] = $user['id'];  // Use numeric ID
$_SESSION['username'] = $user['username'];  // Store for display
```

---

## 👨‍💼 Admin User Management

### Admin User Structure
```
users table:
  ├── id (unique identifier)
  ├── username (login name)
  ├── password_hash (hashed password)
  ├── role (ADMIN, DOCTOR, etc.)
  ├── avatar_path (profile picture)
  ├── created_at (registration date)
  └── updated_at (last modified)
```

### Creating Admin Users
```php
// In config.php - Automatically creates default admin

function ensureDefaultAdmin(PDO $pdo): void
{
    // Check if any user exists
    $count = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    
    if ($count > 0) {
        return;  // Users already exist, don't create default
    }
    
    // Create default admin if no users exist
    $default_password = 'admin123';  // Change on first login!
    $password_hash = password_hash($default_password, PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare(
        'INSERT INTO users (username, password_hash, role) 
         VALUES (:username, :password_hash, :role)'
    );
    
    $stmt->execute([
        ':username' => 'admin',
        ':password_hash' => $password_hash,
        ':role' => 'ADMIN'
    ]);
}

// Call on startup:
ensureDefaultAdmin($pdo);
```

### Admin Login Flow
```
Admin visits /admin_login.php
  ↓
Enters username: "admin"
Enters password: "admin123"
  ↓
Form submits to auth.php with role indicator
  ↓
Backend verifies credentials
  ↓
Backend checks: is this user an ADMIN?
  if (strtoupper($user['role']) === 'ADMIN') {
      ✓ Allowed to login
  } else {
      ✗ Blocked from admin login
  }
  ↓
Session created: $_SESSION['role'] = 'ADMIN'
  ↓
Redirected to admin dashboard: index.php?role=admin
```

### Admin Permissions
```php
// In api.php - Every request checks permissions

function requireAdminRole() {
    $user = currentUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    if (strtoupper($user['role'] ?? '') !== 'ADMIN' && 
        strtoupper($user['role'] ?? '') !== 'DOCTOR') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}

// Called in handler functions:
if ($action === 'deletePatient') {
    requireAdminRole();  // Only admin can delete
    // ... process deletion
}
```

---

## 👤 Patient User Management

### Patient User Structure
```
users table:
  ├── id (unique identifier)
  ├── username (login name)
  ├── password_hash (hashed password)
  ├── role = 'PATIENT'
  ├── avatar_path (profile picture)
  └── created_at, updated_at

patients table (linked to users):
  ├── id (unique identifier)
  ├── user_id (foreign key → users.id)
  ├── date_of_birth (patient's DOB)
  ├── phone (contact number)
  ├── address (home address)
  ├── medical_history (health notes)
  └── other medical info
```

### Creating Patient Users
```php
// When admin creates a new patient record

// Step 1: Create users entry
$username = 'patient_john_doe';
$password_hash = password_hash('temporaryPassword', PASSWORD_BCRYPT);

$stmt = $pdo->prepare('
    INSERT INTO users (username, password_hash, role)
    VALUES (:username, :password_hash, :role)
');

$stmt->execute([
    ':username' => $username,
    ':password_hash' => $password_hash,
    ':role' => 'PATIENT'
]);

$user_id = $pdo->lastInsertId();

// Step 2: Create patients entry
$stmt = $pdo->prepare('
    INSERT INTO patients (user_id, date_of_birth, phone, address)
    VALUES (:user_id, :dob, :phone, :address)
');

$stmt->execute([
    ':user_id' => $user_id,
    ':dob' => '1990-05-15',
    ':phone' => '555-1234',
    ':address' => '123 Main St'
]);

// Now patient can login with username & temporary password
```

### Patient Login Flow
```
Patient visits /patient_login.php
  ↓
Enters username: "patient_john_doe"
Enters password: (their password)
  ↓
Form submits to auth.php
  ↓
Backend verifies credentials
  ↓
Backend checks: is this user a PATIENT?
  if (strtoupper($user['role']) === 'PATIENT') {
      ✓ Allowed to login
  } else {
      ✗ Blocked from patient login
  }
  ↓
Session created: $_SESSION['role'] = 'PATIENT'
                 $_SESSION['patient_id'] = (from patients table)
  ↓
Redirected to patient dashboard: index.php?role=patient
```

### Patient Permissions
```php
// Patients can only access their own data

function requirePatientRole() {
    $user = currentUser();
    
    if (!$user || strtoupper($user['role'] ?? '') !== 'PATIENT') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}

function getPatientAppointments() {
    requirePatientRole();
    
    $user = currentUser();
    $patientId = $user['patient_id'];  // Only their patient ID
    
    // Query only THIS patient's appointments
    $stmt = $pdo->prepare('
        SELECT * FROM appointments 
        WHERE patient_id = :patient_id
    ');
    
    $stmt->execute([':patient_id' => $patientId]);
    
    return $stmt->fetchAll();
}

// Patient cannot access other patient's data:
// Even if they try: ?patientId=999
// Backend will still only return patient ID from session
```

---

## 🔄 Admin & Patient Data Exchange

### Admin Creating Appointment for Patient
```
┌─────────────────────────────────────────────────────────┐
│             Admin Creates Appointment                    │
└─────────────────────────────────────────────────────────┘

Step 1: Admin Interface
  Admin clicks "New Appointment"
  Modal opens to fill appointment details
  Admin searches patient: "John Doe"
    ↓
    API call: GET /api.php?action=searchPatients&query=john
    Returns: [{id: 123, name: "John Doe", ...}, ...]
    Admin selects: "John Doe" (ID: 123)
  
  Admin selects doctor: "Dr. Smith" (ID: 45)
  Admin enters date: 2026-05-15
  Admin enters time: 10:30 AM
    ↓
    
Step 2: Form Submission
  Admin clicks "Save Appointment"
  Data sent: {action: 'createAppointment', patientId: 123, doctorId: 45, ...}
    ↓

Step 3: Backend Processing
  api.php receives request
  Checks: Is user admin?
    Yes → Continue
    No → Return 403 Forbidden
  
  Validates: Does patient 123 exist?
    Yes → Continue
    No → Return 400 Bad Request
  
  Validates: Does doctor 45 exist?
    Yes → Continue
    No → Return 400 Bad Request
  
  Insert into database:
    INSERT INTO appointments (patient_id, doctor_id, date, time, ...)
    VALUES (123, 45, '2026-05-15', '10:30:00', ...)
    ↓

Step 4: Database Side Effects
  • Appointment 456 created
  • Log entry created in activity_log
  • Notification sent to patient 123
  • Doctor 45's schedule cache updated
    ↓

Step 5: API Response
  Returns: {status: 'success', appointmentId: 456}
    ↓

Step 6: Patient Sees Update
  Patient logs in to dashboard
  API call: GET /api.php?action=getPatientDashboardData
  Returns: Latest appointments including new appointment 456
  
  Patient Dashboard displays:
    "New Appointment Scheduled!"
    Doctor: Dr. Smith
    Date: May 15, 2026
    Time: 10:30 AM
```

### Patient Viewing Admin-Created Appointment
```
┌─────────────────────────────────────────────────────────┐
│             Patient Views Appointment                    │
└─────────────────────────────────────────────────────────┘

Step 1: Patient Dashboard Loads
  Patient logs in with username/password
  Session created: {user_id: 123, role: 'PATIENT', patient_id: 123}
  
  Dashboard loads
    ↓

Step 2: Get Appointment Data
  JavaScript calls: fetch('/api.php?action=getPatientDashboardData')
    ↓

Step 3: Backend Retrieves Data
  api.php receives request
  Gets session user_id: 123
  Gets patient_id from users table: 123
  
  Query with patient isolation:
    SELECT * FROM appointments 
    WHERE patient_id = 123  ← Only this patient's data
    ORDER BY appointment_date DESC
  
  Returns:
    - Appointment 456
      patient_id: 123
      doctor_id: 45
      doctorName: "Dr. Smith"
      date: "2026-05-15"
      time: "10:30:00"
      purpose: "Routine Checkup"
      status: "SCHEDULED"
    ↓

Step 4: Frontend Renders
  JavaScript processes response
  
  Filters appointments:
    Upcoming: 2026-05-15 10:30 (future date)
    Past: (any past dates)
  
  Creates appointment card:
    ┌─────────────────────────────┐
    │ Dr. Smith                    │
    │ General Medicine             │
    │ May 15, 2026 | 10:30 AM      │
    │ Routine Checkup              │
    │ [Reschedule] [Cancel]        │
    └─────────────────────────────┘
    ↓

Step 5: Patient Sees Appointment
  Patient views their upcoming appointment
  Can reschedule or cancel
  Cannot see other patients' appointments
```

### Admin & Patient Communication Through Appointments
```
┌─────────────────────────────────────────────────────────┐
│         Data Flow: Admin → Appointment → Patient        │
└─────────────────────────────────────────────────────────┘

ADMIN ACTION:
  1. Creates/updates appointment
  2. Data saved to: appointments table
     - patient_id = 123 (links to specific patient)
     - doctor_id = 45
     - status, date, time, etc.
  3. Side effect: notification created for patient

PATIENT SEES:
  1. Logs in (authenticated as patient 123)
  2. System shows ONLY appointments where patient_id = 123
  3. Patient can reschedule or cancel
  4. Update goes back to database
  5. Admin sees the change when they refresh

NOTIFICATION FLOW:
  Admin creates appointment for patient 123
    ↓
  INSERT into notifications (user_id = 123, message = 'New appointment with Dr. Smith')
    ↓
  Patient logs in
    ↓
  API returns: unread notifications
    ↓
  Patient sees notification badge
    ↓
  Patient clicks notification
    ↓
  Mark as read: UPDATE notifications SET read = 1 WHERE id = ...
```

---

## 🔐 Session Management

### Session Lifecycle
```
LOGIN PROCESS:
  ┌──────────────────┐
  │  User submits    │
  │  login form      │
  └────────┬─────────┘
           ↓
  ┌──────────────────────────────────┐
  │ Backend (auth.php):              │
  │ 1. Verify username exists        │
  │ 2. Verify password hash matches  │
  │ 3. Clear old session             │
  │    session_destroy();            │
  │ 4. Create new session            │
  │    session_start();              │
  │    session_regenerate_id(true);  │
  │ 5. Store user data               │
  │    $_SESSION['user_id'] = ...    │
  │    $_SESSION['role'] = ...       │
  │ 6. Send session cookie to browser│
  └────────┬────────────────────────┘
           ↓
  ┌──────────────────┐
  │ Browser receives │
  │ session cookie   │
  │ (auto storage)   │
  └────────┬─────────┘
           ↓
  ┌──────────────────┐
  │ Redirect to      │
  │ dashboard        │
  └──────────────────┘


SESSION USAGE:
  Every API request:
    1. Browser automatically sends session cookie
    2. Backend receives cookie
    3. currentUser() function:
       - Calls session_start()
       - Checks $_SESSION['user_id'] exists
       - Returns user data from session
    4. If no session → return 401 Unauthorized
    5. If session valid → process request

SESSION TIMEOUT:
  INACTIVITY_TIME = 30 * 60 * 1000  // 30 minutes (JavaScript)
  
  On frontend:
    - Track last user activity (click, type, mouse move)
    - If no activity for 30 minutes
    - Warn user: "You'll be logged out in 5 minutes"
    - Auto-logout: invalidateSession()
  
  On backend:
    - Optional: Check session creation time
    - Optional: Check last activity timestamp
    - Expire old sessions


LOGOUT PROCESS:
  User clicks "Logout"
    ↓
  Frontend calls: fetch('/api.php?action=logout')
    ↓
  Backend (auth.php):
    $_SESSION = [];
    session_destroy();
    session_write_close();
    ↓
  Backend redirects to login page
    ↓
  Browser clears session cookie
    ↓
  User logged out, sees login form
```

### Session Security
```php
// Prevent session fixation attacks
session_regenerate_id(true);  // Create new session ID, delete old one

// Prevent session hijacking
// Use HTTPS in production (encrypt communication)
// Use secure & httponly flags on cookies
// Check user agent consistency

// Prevent CSRF (Cross-Site Request Forgery)
// Generate CSRF token on login
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

// Verify CSRF token on state-changing requests
function verifyCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && 
           hash_equals($_SESSION['csrf_token'], $token);
}
```

---

## 🛡️ Security Implementation

### SQL Injection Prevention
```php
// ❌ VULNERABLE
$stmt = $pdo->query("SELECT * FROM users WHERE username = '$username'");

// ✓ SAFE
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
$stmt->execute([':username' => $username]);

// Prepared statements treat input as data, never as code
```

### Password Hash Verification
```php
// Never compare plaintext passwords
if ($input_password === $stored_password) { }  // ❌ WRONG

// Always use password_verify()
if (password_verify($input_password, $stored_hash)) { }  // ✓ CORRECT
```

### Input Validation & Sanitization
```php
// Always validate on backend (frontend validation can be bypassed)

$username = trim((string) ($_POST['username'] ?? ''));
if (empty($username) || strlen($username) < 3 || strlen($username) > 50) {
    return error("Invalid username");
}

$password = (string) ($_POST['password'] ?? '');
if (empty($password) || strlen($password) < 6) {
    return error("Invalid password");
}

// Process safely
```

### User Role Verification
```php
// Always check role on sensitive operations

$user = currentUser();

if (!$user) {
    return 401;  // Not logged in
}

if (strtoupper($user['role'] ?? '') !== 'ADMIN') {
    return 403;  // Not admin
}

// Safe to proceed with admin operation
```

---

## 📊 Summary Table

| Feature | Admin | Patient |
|---------|-------|---------|
| **Login Page** | /admin_login.php | /patient_login.php |
| **Password Hash** | BCrypt hashed | BCrypt hashed |
| **Session Role** | ADMIN | PATIENT |
| **Can View** | All patients, appointments | Only own data |
| **Can Create** | Appointments, patients | None (read-only) |
| **Can Modify** | Appointments, patients, billing | Reschedule/cancel own appointments |
| **Can Delete** | Appointments, patients | None |
| **Data Isolation** | Can see all | Only patient_id = their id |

---

## 🔄 Authentication Flow Diagram (Complete)

```
┌────────────────────────────────────────────────────────────┐
│  Step 1: User visits login page                             │
│  - admin_login.php or patient_login.php                     │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  Step 2: User enters credentials                            │
│  - username: "admin"                                        │
│  - password: "admin123"                                     │
│  - csrf_token: (from form)                                  │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  Step 3: Form submits to auth.php                          │
│  - POST /auth.php                                           │
│  - Action: login                                            │
│  - Contains: username, password, csrf_token                │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  Step 4: Backend validates CSRF token                      │
│  if (!verifyCsrfToken($token)) { error(); }                │
│  ✓ CSRF token valid → Continue                             │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  Step 5: Query database for user                           │
│  SELECT * FROM users WHERE username = :username            │
│  Bind: username = "admin"                                  │
│  Result: {id: 1, username: "admin", password_hash: "..."}│
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  Step 6: Verify password hash                              │
│  password_verify("admin123", "$2y$10$...")                │
│  ✓ Hash matches → Continue                                 │
│  ✗ Hash doesn't match → Error "Invalid credentials"        │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  Step 7: Check user role for this login type              │
│  if (role === 'ADMIN' && loginType === 'admin') {         │
│  ✓ Role matches → Continue                                 │
│  ✗ Role doesn't match → Error "Not authorized"             │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  Step 8: Regenerate session ID                             │
│  session_regenerate_id(true)                               │
│  - Prevents session fixation attacks                       │
│  - Creates new session ID                                  │
│  - Deletes old session                                     │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  Step 9: Store user data in session                        │
│  $_SESSION['user_id'] = 1                                  │
│  $_SESSION['username'] = 'admin'                           │
│  $_SESSION['role'] = 'ADMIN'                               │
│  $_SESSION['login_time'] = time()                          │
│  $_SESSION['csrf_token'] = (new token)                     │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  Step 10: Send session cookie to browser                   │
│  Set-Cookie: PHPSESSID=abc123xyz; HttpOnly; Secure         │
│  - HttpOnly: JS cannot access (prevents XSS)               │
│  - Secure: HTTPS only (prevents MITM)                      │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  Step 11: Redirect to dashboard                            │
│  Location: /index.php?role=admin                           │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│  Step 12: User sees dashboard                              │
│  - Session cookie automatically sent with requests         │
│  - currentUser() retrieves user data from session          │
│  - API calls verify user is logged in                      │
│  - All data filtered by role (admin sees all, patient      │
│    only sees own data)                                     │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ Conclusion

The PMS authentication system:
- **Secures passwords** with BCrypt hashing
- **Validates usernames** for uniqueness and format
- **Creates sessions** after successful authentication
- **Isolates data** based on user role (admin vs patient)
- **Exchanges data** between admin and patient through database tables
- **Prevents attacks** with CSRF tokens, SQL injection prevention, and secure session handling
- **Manages access** through role-based permissions on every API endpoint

Every user interaction goes through this security layer, ensuring only authorized users can access authorized data.
