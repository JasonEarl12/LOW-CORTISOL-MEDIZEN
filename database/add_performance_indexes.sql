-- Performance Optimization: Add missing indexes
-- Run this script to improve query performance on the PMS system

USE pms_db;

-- Users table: Add index for role-based queries and patient_id lookup
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_patient_id ON users(patient_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Patients table: Add index for status queries
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);
CREATE INDEX IF NOT EXISTS idx_patients_contact ON patients(contact);

-- Appointments table: Add indexes for date/doctor queries
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, time);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);

-- Billing table: Add indexes
CREATE INDEX IF NOT EXISTS idx_billing_payment_status ON billing(payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_created_at ON billing(created_at);

-- Audit logs: Add indexes for quick lookup
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);

-- Inventory: Add index
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at);

-- Patient status history: Additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_status_history_user_id ON patient_status_history(changed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_status_history_new_status ON patient_status_history(new_status);

OPTIMIZE TABLE users;
OPTIMIZE TABLE patients;
OPTIMIZE TABLE appointments;
OPTIMIZE TABLE billing;
OPTIMIZE TABLE audit_logs;
OPTIMIZE TABLE patient_status_history;
OPTIMIZE TABLE inventory;

-- Verify indexes were created
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'pms_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
