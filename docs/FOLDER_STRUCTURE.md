# Project Folder Structure Guide

## Root Directory
```
c:/xampp/htdocs/pms/
├── README.md                      # Main documentation
├── XAMPP_STEP_BY_STEP.md         # Quick setup guide
├── FOLDER_STRUCTURE.md           # This file (folder organization guide)
├── index.php                      # Patient dashboard (main application)
├── admin_login.php               # Admin/staff login page
├── patient_login.php             # Patient login page
├── auth.php                      # Authentication handler
├── api.php                       # REST API endpoint
├── config.php                    # Database configuration
├── credentials-handler.php       # Patient credential management
├── admin-patient-diagnostics.php # Patient diagnostics page
├── router.php                    # Route handler (optional)
├── term_policy.html              # Terms of Service page
├── privacy_policy.html           # Privacy Policy page
├── .htaccess                     # Apache routing rules
├── .gitignore                    # Git ignore rules
│
├── assets/                       # Frontend stylesheets & JavaScript
│   ├── styles.css               # Main application styles
│   ├── index-styles.css         # Index/dashboard styles
│   ├── advanced-appointment-styles.css  # Appointment module styles
│   ├── patient-dashboard-styles.css    # Patient content & typography (NEW)
│   ├── messages-chat-styles.css        # Messaging & chat UI (NEW)
│   ├── app.js                   # Main JavaScript application logic
│   ├── advanced-appointment-styles.js  # Appointment handling
│   ├── admin-verification.js    # Admin verification logic
│   └── logo.png                 # Application logo
│
├── admin/                        # Admin dashboard (optional)
│   └── index.php               # Admin dashboard page
│
├── docs/                         # Documentation
│   ├── PROJECT_DOCUMENTATION.txt     # Detailed project docs
│   ├── PROJECT_OVERVIEW.md           # Project overview
│   ├── DEVELOPER_TECHNICAL_GUIDE.md  # Technical guide for developers
│   ├── WEBSITE_EXPLANATION.md        # Website feature explanation
│   ├── FILES_EXPLANATIONS.txt        # File-by-file explanation
│   ├── FILE_AND_FOLDER_GUIDE.md      # This folder's guide
│   └── MESSAGING_SYSTEM_FIXES.md     # Messaging system fixes & notes
│
├── database/                     # Database scripts & migrations
│   ├── pms_database.sql         # Main database schema
│   ├── pms_xampp.sql            # XAMPP-specific configuration
│   ├── create_chat_tables.sql   # Chat/messaging tables
│   ├── events_module.sql        # Events module tables
│   ├── insert_test_users.sql    # Test data for users
│   ├── migrate_*.sql            # Migration scripts
│   ├── performance_indexes.sql  # Index optimization
│   ├── add_performance_indexes.sql  # Additional indexes
│   └── optimizations.sql        # Query optimizations
│
├── backend/                      # Spring Boot Java backend (optional)
│   ├── pom.xml                 # Maven configuration
│   ├── target/                 # Compiled classes & JAR
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/pms/
│           │       ├── PmsApplication.java      # Spring Boot entry point
│           │       ├── controller/              # REST API controllers
│           │       ├── service/                 # Business logic
│           │       ├── model/                   # Data entities
│           │       ├── repository/              # Database repositories
│           │       ├── util/                    # Utility classes
│           │       └── config/                  # Configuration classes
│           └── resources/
│               └── application.properties       # App configuration
│
├── frontend/                     # React frontend (optional)
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite build configuration
│   ├── index.html              # React entry point
│   └── src/
│       ├── main.jsx            # React main
│       ├── App.jsx             # Root component
│       ├── api.js              # API integration
│       ├── apiOptimizations.js # API performance tuning
│       ├── styles.css          # Global styles
│       └── components/         # React components
│           ├── AppointmentsModule.jsx/css
│           ├── BillingModule.jsx/css
│           ├── DoctorsModule.jsx/css
│           ├── EventsModule.jsx/css
│           ├── InventoryModule.jsx/css
│           ├── PatientDashboard.jsx/css
│           ├── PatientsModule.jsx/css
│           ├── ReportsModule.jsx/css
│           ├── UsersModule.jsx/css
│           ├── WardsModule.jsx/css
│           └── Toast.jsx/css
│
├── image/                       # Image assets
│
├── tools/                        # Utility scripts
│   ├── test_billing_inventory_fix.php  # DB repair & test data insertion (NEW)
│   └── test_messaging_system.php       # Messaging system test
│
└── xampp-pms/                   # Legacy/archived files
    └── [Legacy implementations]
```

## Key Files & Their Purposes

### Core Application Files
| File | Purpose |
|------|---------|
| `index.php` | Main patient dashboard application |
| `admin_login.php` | Staff/admin authentication page |
| `patient_login.php` | Patient authentication page |
| `auth.php` | Session management & login logic |
| `api.php` | REST API for CRUD operations |
| `config.php` | Database connection & global functions |

### Stylesheet Files
| File | Purpose |
|------|---------|
| `assets/styles.css` | Main application theme & layout |
| `assets/index-styles.css` | Dashboard & modal styling |
| `assets/advanced-appointment-styles.css` | Appointment module styling |
| `assets/patient-dashboard-styles.css` | Patient content typography (NEW) |
| `assets/messages-chat-styles.css` | Chat interface & messaging UI (NEW) |

### Database Files
| File | Purpose |
|------|---------|
| `database/pms_database.sql` | Complete database schema |
| `database/pms_xampp.sql` | XAMPP-specific setup |
| `database/migrate_*.sql` | Data migration scripts |

### Documentation
- `docs/PROJECT_DOCUMENTATION.txt` - Comprehensive project documentation
- `docs/DEVELOPER_TECHNICAL_GUIDE.md` - Developer reference
- `README.md` - Quick reference & overview

## New Changes (This Session)

### CSS Extraction
- Extracted inline CSS from `index.php` into separate files:
  - `assets/patient-dashboard-styles.css` - Patient content & typography
  - `assets/messages-chat-styles.css` - Chat & messaging UI
- Updated `index.php` head section to link external stylesheets
- Removed ~700 lines of inline style code from `index.php`

### Patient Dashboard Links
- Added "Terms of Service" and "Privacy Policy" links to patient dashboard menu
- Links appear below logout button in account menu dropdown
- Opens in new tab for user reference

### Tools & Scripts
- Added `tools/test_billing_inventory_fix.php` for database repair & testing
  - Fixes corrupted rows with `id=0` in billing & inventory tables
  - Resets `AUTO_INCREMENT` values
  - Inserts test records for verification

## Installation & Setup

1. **Database Setup**
   - Run `database/pms_database.sql` to create tables
   - Run `database/pms_xampp.sql` for XAMPP configuration
   - Run any `migrate_*.sql` scripts if upgrading

2. **File Placement**
   - Copy all files to `C:\xampp\htdocs\pms\`
   - Ensure `config.php` has correct database credentials

3. **Access Points**
   - Admin Login: `http://localhost/pms/admin_login.php`
   - Patient Login: `http://localhost/pms/patient_login.php`
   - Main Dashboard: `http://localhost/pms/index.php`

## Development Workflow

### Frontend Changes
- Edit files in `assets/` directory
- CSS files are automatically versioned with file modification time
- JavaScript changes in `assets/app.js`

### Backend Changes
- Spring Boot API in `backend/src/main/java/com/pms/`
- PHP API in `api.php` (primary for this XAMPP version)

### Database Changes
- Create migration script in `database/` folder
- Document changes in migration file header

## File Permissions
- All PHP files should be readable by Apache
- Database scripts should be executable (for command-line use)
- Asset files (CSS/JS/images) should be world-readable

## Deployment Notes
- Update `config.php` for production environment
- Set appropriate PHP error logging in `php.ini`
- Enable HTTPS and security headers
- Create regular database backups

---
**Last Updated:** May 3, 2026  
**Document Version:** 1.1
