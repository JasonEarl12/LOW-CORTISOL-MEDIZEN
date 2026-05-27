-- Performance indexes for PMS hot paths
-- Apply in MySQL after backing up your database.

USE pms_db;

-- Dashboard + module queries
CREATE INDEX idx_appointments_date ON appointments (date);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp);
CREATE INDEX idx_audit_logs_module_timestamp ON audit_logs (module, timestamp);
CREATE INDEX idx_audit_logs_action_timestamp ON audit_logs (action, timestamp);

-- Common patient filtering/sorting
CREATE INDEX idx_patients_full_name ON patients (full_name);
CREATE INDEX idx_patients_status ON patients (status);

-- Operational lookups
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
