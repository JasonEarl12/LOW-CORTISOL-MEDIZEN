-- PMS Database Performance Optimization
-- Add missing indexes and create efficient query structures

USE pms_db;

-- 1. Add missing indexes on frequently queried columns
ALTER TABLE appointments ADD INDEX idx_appointments_status (status);
ALTER TABLE appointments ADD INDEX idx_appointments_patient_date (patient_id, date);
ALTER TABLE appointments ADD INDEX idx_appointments_doctor_date (doctor_id, date);

ALTER TABLE patients ADD INDEX idx_patients_status (status);
ALTER TABLE patients ADD INDEX idx_patients_doctor_id (doctor_id);

ALTER TABLE users ADD INDEX idx_users_patient_id (patient_id);
ALTER TABLE users ADD INDEX idx_users_role (role);

ALTER TABLE billing ADD INDEX idx_billing_status (payment_status);
ALTER TABLE billing ADD INDEX idx_billing_patient_date (patient_id, created_at);

ALTER TABLE inventory ADD INDEX idx_inventory_quantity (quantity, alert_threshold);

ALTER TABLE audit_logs ADD INDEX idx_audit_module_date (module, timestamp);
ALTER TABLE audit_logs ADD INDEX idx_audit_record (module, record_id);

-- 2. Optimize view queries - create materialized views for common queries
DROP TABLE IF EXISTS v_dashboard_stats;
CREATE TABLE v_dashboard_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stat_key VARCHAR(100),
    stat_value INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_stat_key (stat_key),
    INDEX idx_updated_at (updated_at)
);

-- 3. Create procedure for batch KPI calculation
DELIMITER //
CREATE PROCEDURE sp_refresh_dashboard_stats()
BEGIN
    DECLARE total_patients INT;
    DECLARE total_doctors INT;
    DECLARE available_beds INT;
    DECLARE appointments_today INT;
    DECLARE critical_patients INT;
    DECLARE inventory_alerts INT;
    
    SELECT COUNT(*) INTO total_patients FROM patients;
    SELECT COUNT(*) INTO total_doctors FROM doctors;
    SELECT COALESCE(SUM(available_beds), 0) INTO available_beds FROM wards;
    SELECT COUNT(*) INTO appointments_today FROM appointments WHERE date = CURDATE();
    SELECT COUNT(*) INTO critical_patients FROM patients WHERE status = 'CRITICAL';
    SELECT COUNT(*) INTO inventory_alerts FROM inventory WHERE quantity <= alert_threshold;
    
    INSERT INTO v_dashboard_stats (stat_key, stat_value) 
    VALUES 
        ('total_patients', total_patients),
        ('total_doctors', total_doctors),
        ('available_beds', available_beds),
        ('appointments_today', appointments_today),
        ('critical_patients', critical_patients),
        ('inventory_alerts', inventory_alerts)
    ON DUPLICATE KEY UPDATE 
        stat_value = VALUES(stat_value),
        updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- 4. Enable query cache if available (for MySQL 5.7)
-- SET GLOBAL query_cache_type = 1;
-- SET GLOBAL query_cache_size = 67108864;  -- 64MB

-- 5. Optimize table structure
ANALYZE TABLE patients;
ANALYZE TABLE appointments;
ANALYZE TABLE doctors;
ANALYZE TABLE users;
ANALYZE TABLE billing;
ANALYZE TABLE inventory;
ANALYZE TABLE audit_logs;

-- Verify indexes were created
SHOW INDEXES FROM appointments WHERE Column_name IN ('status', 'patient_id', 'doctor_id');
SHOW INDEXES FROM patients WHERE Column_name IN ('status', 'doctor_id');
SHOW INDEXES FROM users WHERE Column_name IN ('patient_id', 'role');
