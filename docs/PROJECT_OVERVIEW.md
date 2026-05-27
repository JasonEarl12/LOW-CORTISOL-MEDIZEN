# MEDIZEN - Hospital Management System (PMS)
## Complete Project Overview & Discussion Guide

---

## 📋 Table of Contents
1. [Project Summary](#project-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Key Features](#key-features)
5. [User Roles & Access](#user-roles--access)
6. [Implementation Phases](#implementation-phases)
7. [Database Structure](#database-structure)
8. [Frontend Components](#frontend-components)
9. [Backend API](#backend-api)
10. [Real-Time Features](#real-time-features)
11. [Setup & Deployment](#setup--deployment)
12. [Discussion Points](#discussion-points)

---

## 🎯 Project Summary

**Project Name**: MEDIZEN - Patient Management System (PMS)  
**Purpose**: A comprehensive hospital management platform enabling staff and patients to manage appointments, patient records, billing, inventory, and reports

**Current Status**: 
- ✅ Fully functional web application
- ✅ Admin dashboard with real-time data
- ✅ Patient dashboard with appointment management
- ✅ Real-time synchronization (10-second refresh)
- ✅ Advanced appointment modal with search
- ✅ Responsive design with dark mode support

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│              (HTML5 + CSS3 + Vanilla JavaScript)             │
├──────────────────────┬──────────────────────┬────────────────┤
│   Admin Dashboard    │  Patient Dashboard   │   Auth Pages    │
│   - Appointments     │  - My Appointments   │  - Login        │
│   - Patients         │  - Health Reminders  │  - Signup       │
│   - Doctors          │  - Notifications     │  - Password Reset│
│   - Billing          │  - Activity Log      │                 │
│   - Inventory        │                      │                 │
│   - Wards            │                      │                 │
│   - Reports          │                      │                 │
└──────────────────────┴──────────────────────┴────────────────┘
                            ↓↑
                      (HTTP/AJAX)
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
│                    (api.php - REST API)                      │
├──────────────────────────────────────────────────────────────┤
│ • Authentication & Session Management                        │
│ • CRUD Operations for all modules                            │
│ • Real-time data fetching                                    │
│ • Search & Filter operations                                 │
│ • Appointment scheduling & rescheduling                      │
│ • User & Building information management                     │
└──────────────────────────────────────────────────────────────┘
                            ↓↑
                     (PDO Prepared)
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                             │
│                    (MySQL Database)                          │
├──────────────────────────────────────────────────────────────┤
│ • Users (Staff, Patients, Admins)                            │
│ • Patients (Demographics, Health Info)                       │
│ • Doctors (Specialization, Schedule)                         │
│ • Appointments (Scheduling, Status)                          │
│ • Wards & Departments                                        │
│ • Billing & Transactions                                     │
│ • Inventory & Stock                                          │
│ • Reminders & Notifications                                  │
│ • Events & Activities                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic structure |
| **CSS3** | Styling with animations & responsive design |
| **Vanilla JavaScript (ES6+)** | Dynamic interactions, API calls, real-time updates |
| **Vite** | Build tool (for future React frontend) |

### Backend
| Technology | Purpose |
|-----------|---------|
| **PHP 7.4+** | Server-side scripting |
| **PDO** | Database abstraction layer |
| **Sessions** | User authentication & state management |
| **REST API** | Data exchange with frontend |

### Database
| Technology | Purpose |
|-----------|---------|
| **MySQL 5.7+** | Relational database |
| **SQL** | Data queries & management |

### DevOps & Deployment
| Technology | Purpose |
|-----------|---------|
| **XAMPP** | Local development environment |
| **Docker** | (Optional) Container deployment |
| **Git** | Version control |

### Testing (Backend - Java microservices)
| Technology | Purpose |
|-----------|---------|
| **Java 11+** | For future backend migration |
| **Spring Boot** | Application framework |
| **Maven** | Build automation |

---

## ✨ Key Features

### 1. **Appointment Management**
- ✅ Create, edit, delete appointments
- ✅ Real-time availability checking
- ✅ Appointment rescheduling
- ✅ Doctor & ward assignment
- ✅ Status tracking (Scheduled, Completed, Cancelled)
- ✅ Time format: 12-hour (AM/PM)
- ✅ Calendar view with accurate dates
- ✅ Scroll navigation in schedule table
- ✅ Location/Ward display

### 2. **Patient Management**
- ✅ Patient registration & profile management
- ✅ Medical history tracking
- ✅ Health reminders & notifications
- ✅ Appointment viewing in patient dashboard
- ✅ Real-time sync between admin and patient views
- ✅ Building/Ward assignment

### 3. **Doctor & Staff Management**
- ✅ Doctor profiles & specializations
- ✅ Availability scheduling
- ✅ Department assignment
- ✅ Staff user management

### 4. **Billing System**
- ✅ Transaction tracking
- ✅ Invoice generation
- ✅ Payment status management
- ✅ Cost tracking per appointment/service

### 5. **Inventory Management**
- ✅ Stock tracking
- ✅ Item categorization
- ✅ Low stock alerts
- ✅ Usage history

### 6. **Ward Management**
- ✅ Ward creation & editing
- ✅ Capacity tracking
- ✅ Ward-patient linkage
- ✅ Building information & images

### 7. **Reporting & Analytics**
- ✅ Appointment reports
- ✅ Patient analytics
- ✅ Billing summaries
- ✅ Inventory reports
- ✅ Print functionality

### 8. **User Authentication & Authorization**
- ✅ Role-based access control (Admin, Doctor, Staff, Patient)
- ✅ Secure login/logout
- ✅ Session management
- ✅ Password reset functionality
- ✅ Admin verification modal

### 9. **Direct Messaging & Communication System**
- ✅ Patient-to-Admin instant messaging
- ✅ Conversation management with history
- ✅ Message read status tracking
- ✅ Real-time message polling (1-2 second refresh)
- ✅ Message timestamps
- ✅ Unified admin panel for all communications
- ✅ Support for multi-user conversations
- ✅ Automatic conversation routing to admin
- ✅ Message persistence and archiving

### 10. **UI/UX Enhancements**
- ✅ Primary color system (#007B83, #5A9BD5, #4DB6AC)
- ✅ Dark mode support
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth animations & transitions
- ✅ Modal dialogs for forms
- ✅ Toast notifications for feedback
- ✅ Contact panel with appointment information
- ✅ Message notification badges

### 11. **Real-Time Features**
- ✅ 10-second auto-refresh for patient dashboard
- ✅ Automatic appointment sync between admin & patient
- ✅ Live status updates
- ✅ Notification delivery
- ✅ Real-time message updates (1-2 second polling)
- ✅ Live conversation list refresh
- ✅ Instant message delivery and display

---

## 👥 User Roles & Access

### 1. **Admin**
- Full system access
- User management
- Appointment creation for any patient
- System configuration
- Report generation
- Inventory management
- **Unified Communications Panel** - All patient messages routed here
- Message conversation management
- Multi-patient communication handling

### 2. **Doctor**
- View assigned appointments
- Patient medical history
- Appointment completion
- Prescription management
- **Note**: Doctor messages automatically route to Admin for unified communication

### 3. **Staff**
- Appointment scheduling assistance
- Patient check-in
- Record management
- Basic reporting

### 4. **Patient**
- View own appointments
- Schedule appointments (if enabled)
- View medical records
- Receive reminders & notifications
- Track appointment status
- **Send messages to admin** for inquiries and support

---

## 📊 Implementation Phases

### **Phase 1-4: Core Setup**
- Database schema creation
- User authentication system
- API endpoint development
- Admin dashboard scaffolding

### **Phase 5: UI Improvements**
- ✅ Time format conversion to 12-hour (AM/PM)
- ✅ White background removal
- ✅ Color palette implementation

### **Phase 6-7: Feature Development**
- ✅ Advanced appointment modal
- ✅ Real-time search functionality
- ✅ Calendar date accuracy fix
- ✅ Building image upload

### **Phase 8-9: Styling Refinement**
- ✅ Recent Patients card styling
- ✅ Border visibility enhancement
- ✅ Image size increases

### **Phase 10: Content Restructuring**
- ✅ PURPOSE → LOCATION column
- ✅ Ward data integration
- ✅ Building image display adjustment

### **Phase 11-13: Navigation & UX**
- ✅ Scroll functions (keyboard + mouse)
- ✅ Filter tab redesign
- ✅ Capacity Check removal

### **Phase 14-15: Real-Time Sync (Current)**
- ✅ 10-second refresh interval
- ✅ Patient-Admin synchronization
- ✅ Ward information display
- ✅ Debug info removal

---

## 🗄️ Database Structure

### Key Tables

```sql
-- Users (Authentication)
users
├── id (PK)
├── email (UNIQUE)
├── password (hashed)
├── role (admin/doctor/staff/patient)
├── patient_id (FK)
└── created_at

-- Patients (Demographics)
patients
├── id (PK)
├── full_name
├── date_of_birth
├── gender
├── contact_number
├── email
├── address
├── ward_id (FK)
├── medical_history
└── created_at

-- Doctors
doctors
├── id (PK)
├── full_name
├── specialization
├── contact_number
├── department_id (FK)
└── availability_schedule

-- Appointments
appointments
├── id (PK)
├── patient_id (FK)
├── doctor_id (FK)
├── ward_id (FK)
├── date
├── time
├── status (SCHEDULED/COMPLETED/CANCELLED)
├── purpose
└── created_at

-- Wards
wards
├── id (PK)
├── ward_name
├── capacity
├── current_occupancy
├── building_id (FK)
└── description

-- Billing
billing
├── id (PK)
├── patient_id (FK)
├── appointment_id (FK)
├── amount
├── payment_status
└── created_at

-- Inventory
inventory
├── id (PK)
├── item_name
├── quantity
├── minimum_quantity
├── cost_per_unit
└── category
```

---

## 🎨 Frontend Components

### **Admin Dashboard**
- **Sidebar Navigation**: Quick access to all modules
- **Main Content Area**: Dynamic module loading
- **Appointments Module**: Schedule table with drag-drop
- **Patients Module**: List view with search/filter
- **Doctors Module**: Staff directory
- **Billing Module**: Transaction tracking
- **Inventory Module**: Stock management
- **Wards Module**: Department info
- **Reports Module**: Analytics & export

### **Patient Dashboard**
- **Sidebar**: Navigation menu
- **Header**: User info & current date
- **Stats Cards**: Quick metrics
  - Reminders count
  - Notifications count
  - Events count
- **Next Appointment Banner**: Current appointment highlight
- **My Appointments**: List of upcoming appointments
- **Health Reminders**: Todo-style items
- **Activity Log**: Recent actions
- **Support Widget**: Help access

### **Authentication Pages**
- **Login**: Email & password
- **Signup**: New patient registration
- **Password Reset**: Email-based recovery
- **Admin Verification Modal**: Multi-step security

---

## 🔌 Backend API

### **Authentication Endpoints**
```
POST   /api.php?action=login
POST   /api.php?action=logout
POST   /api.php?action=signup
POST   /api.php?action=resetPassword
```

### **Patient Endpoints**
```
GET    /api.php?action=getPatientDashboard
GET    /api.php?action=getPatient
POST   /api.php?action=savePatient
DELETE /api.php?action=deletePatient
```

### **Appointment Endpoints**
```
GET    /api.php?action=getModuleRows (module=appointments)
POST   /api.php?action=saveModuleRecord (module=appointments)
PUT    /api.php?action=updateModuleRecord (module=appointments)
DELETE /api.php?action=deleteModuleRecord (module=appointments)
```

### **Search Endpoints**
```
GET    /api.php?action=searchPatients?q=...
GET    /api.php?action=searchDoctors?q=...
GET    /api.php?action=searchWards?q=...
```

### **Building Endpoints**
```
GET    /api.php?action=getBuildingInfo
POST   /api.php?action=updateBuildingInfo
POST   /api.php?action=uploadBuildingImage
```

### **Chat & Messaging Endpoints**
```
GET    /api.php?action=chat_conversations              (Get all conversations for user)
GET    /api.php?action=chat_messages&conversation_id=X (Get messages in conversation)
POST   /api.php?action=chat_send                       (Send new message)
POST   /api.php?action=mark_messages_read              (Mark messages as read)
POST   /api.php?action=update_conversation             (Update conversation subject)
DELETE /api.php?action=delete_conversation             (Delete conversation)
```

### **Chat Message Flow**
```
PATIENT SENDS MESSAGE:
1. Patient types message and clicks send
2. JavaScript calls: api.php?action=chat_send
3. Message inserted with sender_role = 'PATIENT'
4. Conversation created if needed (patient_id ↔ admin_id)
5. Response returns conversation_id and message_id
6. Frontend refreshes message list

ADMIN RECEIVES MESSAGE:
1. Admin's Contact Panel polls every 1-2 seconds
2. Calls: api.php?action=chat_conversations
3. Fetches conversations where admin_id = current_user_id
4. Includes unread message count for each
5. Admin sees list of patients with unread messages
6. Admin clicks patient to see full message thread

ADMIN REPLIES:
1. Admin types reply in message input
2. Calls: api.php?action=chat_send
3. Message inserted with sender_role = 'ADMIN'
4. Message appears in patient's message list
5. Patient sees notification of new message
```

### **Chat Data Structure**
```sql
-- Conversations
chat_conversations (id, patient_id, admin_id, subject, status, created_at, updated_at)

-- Messages  
chat_messages (id, conversation_id, sender_id, sender_role, message, is_read, created_at)

-- Key Points:
- sender_role restricted to: PATIENT or ADMIN
- Doctor/Nurse roles automatically normalize to ADMIN
- Unified admin account ensures all messages in one place
```

---

## ⚡ Real-Time Features

### **Patient Dashboard Auto-Refresh**
```javascript
// Refreshes every 10 seconds
setInterval(loadPatientDashboard, 10000); // 10000ms = 10s
```

**What Updates**:
- Next appointment banner
- Appointments list
- Health reminders
- Notifications

### **Appointment Sync Flow**
```
1. Admin creates appointment (api.php)
   ↓
2. Appointment saved to database with patient_id
   ↓
3. Patient dashboard polls every 10 seconds
   ↓
4. getPatientDashboardData() fetches appointments where patient_id matches
   ↓
5. Appointment instantly appears in patient's "My Appointments"
```

### **Ward Information Integration**
- Appointments now include ward/location data
- LEFT JOIN wards table to get ward_name
- Patient dashboard displays location instead of purpose

---

## 🚀 Setup & Deployment

### **Local Development (XAMPP)**

**1. Prerequisites**
```bash
- XAMPP (Apache + MySQL + PHP)
- PHP 7.4+
- MySQL 5.7+
- Modern web browser
```

**2. Installation Steps**
```bash
# Navigate to XAMPP htdocs
cd C:\xampp\htdocs\pms

# Import database
# Open phpMyAdmin → Create database "pms"
# Import pms_xampp.sql file

# Configure PHP
# Update config.php with database credentials

# Start XAMPP
# Run Apache & MySQL services

# Access application
# Open browser: http://localhost/pms
```

**3. Test Accounts**
```
Admin:
  Email: admin@medizen.com
  Password: admin123

Patient:
  Email: patient@medizen.com
  Password: patient123
```

### **File Structure**
```
pms/
├── index.php                 (Main application)
├── api.php                   (REST API backend)
├── config.php                (Database configuration)
├── auth.php                  (Authentication logic)
├── credentials-handler.php    (Login/Register handler)
├── assets/
│   ├── app.js               (Main JavaScript)
│   ├── styles.css           (Global styles)
│   ├── index-styles.css     (Index page styles)
│   ├── advanced-appointment-styles.css
│   └── [other assets]
├── database/
│   ├── pms_xampp.sql        (Database schema)
│   └── [migration scripts]
├── backend/                 (Java microservices)
│   ├── pom.xml
│   └── src/
└── frontend/                (React future)
    ├── package.json
    └── src/
```

---

## 💬 Discussion Points

### **What to Discuss with Groupmates**

#### 1. **Architecture & Design**
- [ ] Is the MVC pattern clear?
- [ ] Should we add microservices (Java backend)?
- [ ] Need for API authentication (JWT)?
- [ ] Database performance optimization?

#### 2. **Features & Functionality**
- [ ] Are all modules complete & working?
- [ ] Should we add more reporting options?
- [ ] Need SMS/Email notifications?
- [ ] Appointment cancellation workflow?

#### 3. **User Experience**
- [ ] Is the UI intuitive?
- [ ] Are the colors accessible?
- [ ] Mobile experience sufficient?
- [ ] Should we add more animations?

#### 4. **Security**
- [ ] Password hashing sufficient?
- [ ] CSRF token validation working?
- [ ] SQL injection prevention (PDO)?
- [ ] Need two-factor authentication?

#### 5. **Performance**
- [ ] Is 10-second refresh adequate?
- [ ] Database query optimization?
- [ ] Asset loading time?
- [ ] Caching strategy?

#### 6. **Testing & Quality**
- [ ] Unit tests needed?
- [ ] End-to-end testing?
- [ ] Bug tracking system?
- [ ] Code review process?

#### 7. **Deployment**
- [ ] Docker containerization?
- [ ] Server hosting (AWS/Azure)?
- [ ] Database backup & recovery?
- [ ] Monitoring & logging?

#### 8. **Team Workflow**
- [ ] Git branching strategy?
- [ ] Code style guidelines?
- [ ] Documentation standards?
- [ ] Release management?

---

## 📈 Key Metrics & Statistics

### **Database Size**
- Tables: 10+
- Relationships: Many-to-many
- Estimated rows: Scalable to 10k+ records

### **API Endpoints**
- Total: 30+
- Response time: <500ms
- Cache strategy: File-based modification time

### **Frontend Files**
- HTML: 1 main file (index.php with 1815 lines)
- CSS: 3 files (styles.css, advanced-appointment-styles.css, index-styles.css)
- JavaScript: 1 main file (app.js with 5000+ lines)
- Assets: Logo, icons, images

### **Code Statistics**
- Backend (PHP): ~2000 lines of code
- Frontend (JavaScript): ~5000 lines of code
- CSS: ~800 lines of code
- Database Schema: ~40 tables

---

## 🎓 Learning Outcomes

By working on this project, the team has:
- ✅ Learned full-stack development (HTML/CSS/JS/PHP/MySQL)
- ✅ Implemented real-time features without frameworks
- ✅ Practiced UI/UX design with responsive design
- ✅ Understood MVC architecture
- ✅ Worked with RESTful APIs
- ✅ Managed database relationships
- ✅ Implemented security best practices
- ✅ Created dashboard interfaces
- ✅ Built modal dialogs & forms
- ✅ Optimized user experience

---

## 🔮 Future Enhancements

### **Short Term (Next Sprint)**
- [ ] Add appointment reminders (email/SMS)
- [ ] Implement patient feedback system
- [ ] Add export to PDF reports
- [ ] Implement appointment cancellation by patient

### **Medium Term**
- [ ] Migrate to React frontend
- [ ] Implement Java microservices backend
- [ ] Add Docker containerization
- [ ] Implement JWT authentication
- [ ] Add GraphQL API

### **Long Term**
- [ ] Mobile iOS/Android app
- [ ] Telemedicine integration
- [ ] EHR (Electronic Health Records) system
- [ ] ML-based appointment predictions
- [ ] Integration with hospital equipment APIs

---

## 📞 Contact & Support

**Development Team**: [Your Team Name]  
**Project Lead**: [Your Name]  
**Repository**: [GitHub Link]  
**Documentation**: [Docs Link]

---

## 📝 Document Version

- **Version**: 1.0
- **Last Updated**: April 4, 2026
- **Status**: Currently Active & In Development

---

**Ready to discuss with your team! Print this and present it during your group meeting.** 🎯
