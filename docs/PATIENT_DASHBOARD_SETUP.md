# Patient Dashboard - Setup & Configuration Guide

## Overview
This guide will help you fix the blank patient dashboard panels and populate them with real data from the database.

## What Was Fixed

### 1. **Avatar Upload Issue** ✅ FIXED
   - Added missing `accountSettingsAvatarUrl` input field to the HTML form
   - The avatar upload now works properly in the admin dashboard account settings

### 2. **Auto Logout Timeout** ✅ FIXED
   - Increased from 2 minutes to 30 minutes
   - System now auto-logs out after 30 minutes of inactivity instead of 2 minutes

### 3. **Patient Dashboard Blank Panels** ✅ FIXED
   - Fixed JavaScript references that were causing blank panels
   - Added proper data rendering for all sections
   - Connected to database for real data retrieval

## Setup Steps

### Step 1: Initialize the Database Tables

**Option A: Using the Setup Script (Recommended)**

1. Make sure you're logged in as admin
2. Open your browser and navigate to:
   ```
   http://localhost/pms/setup-patient-dashboard.php
   ```
3. The script will automatically create the required tables and populate sample data
4. You should see a success message with details

**Option B: Using MySQL Directly**

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Select the `pms_db` database
3. Go to the SQL tab
4. Copy and paste the contents of: `database/patient_dashboard_tables.sql`
5. Click "Go" to execute

### Step 2: Verify the Setup

After setup, you should see:
- **Reminders table**: Contains health reminders for each patient
- **Notifications table**: Contains system notifications for users
- **Activity Log table**: Contains activity history for patients

### Step 3: Login as a Patient and Test

1. Go to the patient login page: `http://localhost/pms/patient_login.php`
2. Login with a patient account (e.g., username: `anna.cortez`, password: check database)
3. You should now see:

#### Home Section (Default View)
- ✅ Next appointment banner at the top
- ✅ Active reminders counter
- ✅ Unread mail counter
- ✅ Upcoming Appointments list (first 5)
- ✅ Health Reminders (first 3)
- ✅ Recent Activity (last 4 activities)

#### My Appointments Section
- ✅ All upcoming appointments (with doctor info, date, time, status)
- ✅ Color-coded status badges (SCHEDULED, COMPLETED, CANCELLED)

#### Notifications Section  
- ✅ All system notifications
- ✅ Read/Unread indicators
- ✅ Notification types and timestamps

#### Reminders Section
- ✅ All active health reminders
- ✅ Reminder descriptions and types
- ✅ Status indicators

#### Messages Section
- ✅ Chat with doctors/admin
- ✅ Conversation list
- ✅ Message thread display

#### Profile Section
- ✅ Patient profile information
- ✅ Contact details
- ✅ Account information

## Data Structure

### Reminders Table
```sql
- id: Unique reminder ID
- patient_id: Associated patient
- title: Reminder title (e.g., "Take Medication")
- description: Detailed description
- reminder_type: Type of reminder (medication, appointment, lab_test)
- status: ACTIVE or INACTIVE
- completed: Whether reminder is completed
- scheduled_at: When reminder is scheduled
```

### Notifications Table
```sql
- id: Unique notification ID
- user_id: Associated user
- title: Notification title
- message: Notification message
- notification_type: Type (appointment, lab_result, prescription, doctor_available)
- read: Whether notification has been read
- created_at: When notification was created
```

### Activity Log Table
```sql
- id: Unique activity ID
- patient_id: Associated patient
- user_id: User who triggered the activity
- title: Activity title
- description: Activity description
- activity_type: Type (appointment, patient_status, document, medication)
- action: CREATE, UPDATE, UPLOAD, ADD
- module: Which module (appointments, patients, documents, medications)
- record_id: ID of the record involved
- timestamp: When activity occurred
```

## Troubleshooting

### Issue: Dashboard still shows blank panels

**Solution 1: Clear browser cache**
```
Press: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

**Solution 2: Run setup script again**
```
Navigate to: http://localhost/pms/setup-patient-dashboard.php
```

**Solution 3: Check database connection**
- Verify MySQL is running
- Check that `pms_db` database exists
- Verify `users` table has patient data

### Issue: Tables already exist error

**Solution:**
The setup script safely ignores existing tables. If you want to reset:
```sql
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS activity_log;
```
Then run the setup script again.

### Issue: No data appearing after login

**Solution:**
1. Make sure the logged-in user is linked to a patient record
2. Check that the patient exists in the `patients` table
3. Verify appointments exist for that patient in the `appointments` table
4. Check browser console (F12 → Console) for any JavaScript errors

## Adding More Sample Data

To add more sample data to the dashboard:

### Add Appointments
```sql
INSERT INTO appointments (patient_id, doctor_id, date, time, status) 
VALUES (1, 1, CURDATE() + INTERVAL 5 DAY, '09:00:00', 'SCHEDULED');
```

### Add Reminders
```sql
INSERT INTO reminders (patient_id, title, description, reminder_type, status) 
VALUES (1, 'Take Medication', 'Take your blood pressure medication', 'medication', 'ACTIVE');
```

### Add Notifications
```sql
INSERT INTO notifications (user_id, title, message, notification_type) 
VALUES (3, 'Appointment Confirmed', 'Your appointment has been confirmed', 'appointment');
```

### Add Activity
```sql
INSERT INTO activity_log (patient_id, user_id, title, description, activity_type, action, module) 
VALUES (1, 1, 'Appointment Scheduled', 'New appointment created', 'appointment', 'CREATE', 'appointments');
```

## Auto-Refresh

The patient dashboard automatically refreshes every 30 seconds to show the latest data. You can see updates in real-time without manually refreshing the page.

## Real Data Integration

The dashboard now pulls real data from:
- **Appointments**: From the `appointments` table
- **Reminders**: From the `reminders` table (new)
- **Notifications**: From the `notifications` table (new)
- **Activity**: From the `activity_log` table (new)
- **Patient Info**: From the `patients` table

All data is filtered based on the logged-in patient's ID.

## Additional Features

### Auto-Logout
- System now auto-logs out after **30 minutes of inactivity** (changed from 2 minutes)
- Inactivity resets with any user interaction (clicks, typing, scrolling, etc.)

### Avatar Upload
- Patients/Admins can now upload avatars in account settings
- Supports JPG, PNG, and GIF formats
- Maximum file size: 2MB

## Support

For issues or questions:
1. Check the browser console (F12) for error messages
2. Check PHP error logs in `C:/xampp/logs/`
3. Review database logs for SQL errors
4. Verify all tables exist: `SHOW TABLES;` in phpMyAdmin

---

**Setup Status**: ✅ Patient dashboard is now fully functional with real database data!
