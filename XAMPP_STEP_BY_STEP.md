# XAMPP Hospital Management System - Quick Setup Guide

## Prerequisites
- XAMPP installed (Apache, MySQL, PHP 7.4+)
- Port 80 (Apache) and 3306 (MySQL) available

## Step 1: Start XAMPP
1. Open XAMPP Control Panel:
http://localhost/phpmyadmin

2. Start **Apache** server
3. Start **MySQL** server

## Step 2: Access the Application
Open your browser and go to:
```
http://localhost/pms/index.php
```

## Step 3: Login Credentials
**Admin:**
- Username: `admin`
- Password: `admin123`

**Patient (Sample):**
- Patient ID: Check database for available accounts
- Password: Check database credentials

## Step 4: Database
Database name: `pms` (configured in `config.php`)
- All tables are automatically created on first run
- Patient credentials are securely hashed

## Directory Structure
```
/pms/
  ├── index.php              # Main application
  ├── api.php                # REST API endpoint
  ├── auth.php               # Authentication logic
  ├── config.php             # Configuration
  ├── credentials-handler.php # Credential management
  ├── assets/
  │   ├── app.js             # Main application logic
  │   └── styles.css         # Styling
  ├── frontend/              # React frontend (alternative)
  ├── backend/               # Spring Boot backend (optional)
  └── database/              # Database schemas
```

## Features
- ✅ Appointments Module
- ✅ Patients Management
- ✅ Doctors, Wards, Inventory, Billing
- ✅ Reports & Analytics
- ✅ Dark Mode
- ✅ Responsive Design

## Troubleshooting
1. **Cannot connect to database**: Ensure MySQL is running
2. **Login fails**: Check credentials and database tables
3. **CSS/JS not loading**: Clear browser cache (Ctrl+Shift+R)

## Support
For detailed information, refer to README.md

## COLORS:
Primary color: #007B83
Secondary Color: #5A9BD5
Tertiary: #4DB6AC


## Open the Website: 
http://localhost/pms/index.php

## Admin Login Panel:
http://localhost/pms/admin_login.php

## Patients Login Panel:
http://localhost/pms/patient_login.php

## Open the Xampp Localhost: 
http://localhost/phpmyadmin

## Run the Backend(JAVA):
cd c:\xampp\htdocs\pms\backend\target
java -jar pms-backend-1.0.0.jar

## PHP-Primary Mode with Java Integrity Lock
- The website runtime remains PHP-first (`index.php`, `admin_login.php`, `patient_login.php`).
- Java backend is secondary and does not need to serve PHP requests directly.
- The system is configured to lock (HTTP 503) if tracked Java source files are changed/deleted.

### Rebuild Trusted Java Baseline (after intentional Java edits)
Run this after you intentionally update Java files and want to trust the new state:

```bash
c:\xampp\php\php.exe c:\xampp\htdocs\pms\tools\build_backend_integrity_manifest.php
```

### Temporary Maintenance Bypass (optional)
If you need temporary access while Java files are being edited, set environment variable:

```bash
set BACKEND_INTEGRITY_BYPASS=1
```









