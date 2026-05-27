-- Patient Dashboard Tables - Reminders, Notifications, and Activity Log
USE pms_db;

-- Create Reminders Table
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
);

-- Create Notifications Table
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
);

-- Create Activity Log Table
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
);

-- Insert sample reminders for patients
INSERT INTO reminders (patient_id, title, description, reminder_type, status, completed, scheduled_at)
SELECT 
  p.id,
  CASE WHEN RAND() < 0.33 THEN 'Take Medication' WHEN RAND() < 0.66 THEN 'Scheduled Checkup' ELSE 'Lab Tests' END,
  CASE WHEN RAND() < 0.33 THEN 'Don\'t forget to take your daily blood pressure medication' 
       WHEN RAND() < 0.66 THEN 'You have a scheduled follow-up appointment coming up' 
       ELSE 'Laboratory tests scheduled as per doctor\'s recommendation' END,
  CASE WHEN RAND() < 0.33 THEN 'medication' WHEN RAND() < 0.66 THEN 'appointment' ELSE 'lab_test' END,
  'ACTIVE',
  0,
  DATE_ADD(NOW(), INTERVAL FLOOR(1 + RAND() * 30) DAY)
FROM patients p LIMIT 8;

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, notification_type, read)
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
FROM users u WHERE u.role = 'PATIENT' LIMIT 5;

-- Insert sample activity log entries
INSERT INTO activity_log (patient_id, user_id, title, description, activity_type, action, module, record_id)
SELECT 
  p.id,
  u.id,
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
FROM patients p CROSS JOIN users u WHERE u.role = 'ADMIN' LIMIT 15;

-- Verify tables were created
SELECT 'Reminders table created' AS status;
SELECT COUNT(*) AS reminder_count FROM reminders;
SELECT 'Notifications table created' AS status;
SELECT COUNT(*) AS notification_count FROM notifications;
SELECT 'Activity Log table created' AS status;
SELECT COUNT(*) AS activity_count FROM activity_log;
