CREATE DATABASE IF NOT EXISTS pms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pms_db;

DROP TRIGGER IF EXISTS trg_patients_status_history_insert;
DROP TRIGGER IF EXISTS trg_patients_status_history_update;
DROP PROCEDURE IF EXISTS sp_update_patient_status;
DROP PROCEDURE IF EXISTS sp_upsert_patient_full;
DROP VIEW IF EXISTS v_patient_full_profile;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS billing;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patient_status_history;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS wards;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(190) NOT NULL UNIQUE,
  avatar_url LONGTEXT NULL,
  role ENUM('ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT','PUBLIC_USER') NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(140) NOT NULL,
  specialty VARCHAR(120) NOT NULL,
  contact VARCHAR(60),
  schedule VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE wards (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  ward_name VARCHAR(100) NOT NULL UNIQUE,
  capacity INT UNSIGNED NOT NULL,
  available_beds INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE patients (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(160) NOT NULL,
  dob DATE NOT NULL,
  gender ENUM('MALE','FEMALE','OTHER') NOT NULL,
  status ENUM('ADMITTED','CRITICAL','IN TREATMENT','UNDER OBSERVATION','STABLE','RECOVERING','DISCHARGED','FOLLOW-UP REQUIRED','SCHEDULED','NO-SHOW') NOT NULL DEFAULT 'ADMITTED',
  contact VARCHAR(60),
  doctor_id BIGINT UNSIGNED,
  ward_id BIGINT UNSIGNED,
  medical_history TEXT,
  documents_path VARCHAR(255),
  username VARCHAR(60) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_patients_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
  CONSTRAINT fk_patients_ward FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE SET NULL
);

CREATE TABLE patient_status_history (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  old_status ENUM('ADMITTED','CRITICAL','IN TREATMENT','UNDER OBSERVATION','STABLE','RECOVERING','DISCHARGED','FOLLOW-UP REQUIRED','SCHEDULED','NO-SHOW') NULL,
  new_status ENUM('ADMITTED','CRITICAL','IN TREATMENT','UNDER OBSERVATION','STABLE','RECOVERING','DISCHARGED','FOLLOW-UP REQUIRED','SCHEDULED','NO-SHOW') NOT NULL,
  changed_by_user_id BIGINT UNSIGNED NULL,
  change_source VARCHAR(50) NOT NULL DEFAULT 'system',
  notes VARCHAR(255) NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_status_history_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_status_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE appointments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status ENUM('SCHEDULED','COMPLETED','CANCELLED') DEFAULT 'SCHEDULED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE billing (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_status ENUM('PENDING','PAID','OVERDUE') DEFAULT 'PENDING',
  invoice_file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_billing_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE inventory (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  item_name VARCHAR(160) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 0,
  expiration_date DATE,
  alert_threshold INT UNSIGNED NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED,
  action VARCHAR(120) NOT NULL,
  module VARCHAR(100) NOT NULL,
  record_id BIGINT,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX idx_patients_ward_id ON patients(ward_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_status_history_patient_id ON patient_status_history(patient_id);
CREATE INDEX idx_status_history_changed_at ON patient_status_history(changed_at);

CREATE OR REPLACE VIEW v_patient_full_profile AS
SELECT
  p.id,
  p.full_name,
  p.dob,
  TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS age,
  p.gender,
  p.status,
  p.contact,
  p.medical_history,
  p.documents_path,
  p.created_at,
  p.updated_at,
  p.doctor_id,
  COALESCE(d.full_name, 'Unassigned') AS doctor_name,
  COALESCE(d.specialty, 'General') AS doctor_specialty,
  p.ward_id,
  COALESCE(w.ward_name, 'Unassigned') AS ward_name,
  w.capacity AS ward_capacity,
  w.available_beds AS ward_available_beds,
  la.date AS last_appointment_date,
  la.time AS last_appointment_time,
  la.status AS last_appointment_status,
  lb.amount AS latest_billing_amount,
  lb.payment_status AS latest_payment_status,
  hs.changed_at AS last_status_changed_at,
  hs.old_status AS last_status_from,
  hs.new_status AS last_status_to
FROM patients p
LEFT JOIN doctors d ON d.id = p.doctor_id
LEFT JOIN wards w ON w.id = p.ward_id
LEFT JOIN (
  SELECT a1.patient_id, a1.date, a1.time, a1.status
  FROM appointments a1
  INNER JOIN (
    SELECT patient_id, MAX(CONCAT(date, ' ', time)) AS latest_slot
    FROM appointments
    GROUP BY patient_id
  ) latest_a ON latest_a.patient_id = a1.patient_id
           AND latest_a.latest_slot = CONCAT(a1.date, ' ', a1.time)
) la ON la.patient_id = p.id
LEFT JOIN (
  SELECT b1.patient_id, b1.amount, b1.payment_status
  FROM billing b1
  INNER JOIN (
    SELECT patient_id, MAX(id) AS latest_id
    FROM billing
    GROUP BY patient_id
  ) latest_b ON latest_b.patient_id = b1.patient_id
           AND latest_b.latest_id = b1.id
) lb ON lb.patient_id = p.id
LEFT JOIN (
  SELECT h1.patient_id, h1.changed_at, h1.old_status, h1.new_status
  FROM patient_status_history h1
  INNER JOIN (
    SELECT patient_id, MAX(changed_at) AS latest_change
    FROM patient_status_history
    GROUP BY patient_id
  ) latest_h ON latest_h.patient_id = h1.patient_id
           AND latest_h.latest_change = h1.changed_at
) hs ON hs.patient_id = p.id;

DELIMITER $$

CREATE TRIGGER trg_patients_status_history_insert
AFTER INSERT ON patients
FOR EACH ROW
BEGIN
  INSERT INTO patient_status_history (
    patient_id,
    old_status,
    new_status,
    changed_by_user_id,
    change_source,
    notes
  ) VALUES (
    NEW.id,
    NULL,
    NEW.status,
    NULL,
    'insert',
    'Initial status at patient creation'
  );
END$$

CREATE TRIGGER trg_patients_status_history_update
AFTER UPDATE ON patients
FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO patient_status_history (
      patient_id,
      old_status,
      new_status,
      changed_by_user_id,
      change_source,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      @pms_changed_by_user_id,
      COALESCE(@pms_change_source, 'update'),
      @pms_status_notes
    );
  END IF;
END$$

CREATE PROCEDURE sp_update_patient_status(
  IN p_patient_id BIGINT UNSIGNED,
  IN p_new_status VARCHAR(40),
  IN p_changed_by_user_id BIGINT UNSIGNED,
  IN p_notes VARCHAR(255)
)
BEGIN
  DECLARE v_status VARCHAR(40);

  SET v_status = UPPER(TRIM(p_new_status));

  IF v_status NOT IN (
    'ADMITTED','CRITICAL','IN TREATMENT','UNDER OBSERVATION','STABLE',
    'RECOVERING','DISCHARGED','FOLLOW-UP REQUIRED','SCHEDULED','NO-SHOW'
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Invalid patient status';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM patients WHERE id = p_patient_id) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Patient not found';
  END IF;

  SET @pms_changed_by_user_id = p_changed_by_user_id;
  SET @pms_change_source = 'sp_update_patient_status';
  SET @pms_status_notes = p_notes;

  UPDATE patients
  SET status = v_status
  WHERE id = p_patient_id;

  SET @pms_changed_by_user_id = NULL; 
  SET @pms_change_source = NULL;
  SET @pms_status_notes = NULL;

  SELECT * FROM v_patient_full_profile WHERE id = p_patient_id;
END$$

CREATE PROCEDURE sp_upsert_patient_full(
  IN p_id BIGINT UNSIGNED,
  IN p_full_name VARCHAR(160),
  IN p_dob DATE,
  IN p_gender VARCHAR(10),
  IN p_status VARCHAR(40),
  IN p_contact VARCHAR(60),
  IN p_doctor_id BIGINT UNSIGNED,
  IN p_ward_id BIGINT UNSIGNED,
  IN p_medical_history TEXT,
  IN p_documents_path VARCHAR(255),
  IN p_changed_by_user_id BIGINT UNSIGNED,
  IN p_notes VARCHAR(255)
)
BEGIN
  DECLARE v_gender VARCHAR(10);
  DECLARE v_status VARCHAR(40);

  SET v_gender = UPPER(TRIM(p_gender));
  SET v_status = UPPER(TRIM(p_status));

  IF v_gender NOT IN ('MALE','FEMALE','OTHER') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Invalid gender value';
  END IF;

  IF v_status NOT IN (
    'ADMITTED','CRITICAL','IN TREATMENT','UNDER OBSERVATION','STABLE',
    'RECOVERING','DISCHARGED','FOLLOW-UP REQUIRED','SCHEDULED','NO-SHOW'
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Invalid patient status';
  END IF;

  IF p_id IS NULL OR p_id = 0 THEN
    INSERT INTO patients (
      full_name,
      dob,
      gender,
      status,
      contact,
      doctor_id,
      ward_id,
      medical_history,
      documents_path
    ) VALUES (
      TRIM(p_full_name),
      p_dob,
      v_gender,
      v_status,
      NULLIF(TRIM(p_contact), ''),
      p_doctor_id,
      p_ward_id,
      NULLIF(TRIM(p_medical_history), ''),
      NULLIF(TRIM(p_documents_path), '')
    );

    SET p_id = LAST_INSERT_ID();
  ELSE
    SET @pms_changed_by_user_id = p_changed_by_user_id;
    SET @pms_change_source = 'sp_upsert_patient_full';
    SET @pms_status_notes = p_notes;

    UPDATE patients
    SET full_name = TRIM(p_full_name),
        dob = p_dob,
        gender = v_gender,
        status = v_status,
        contact = NULLIF(TRIM(p_contact), ''),
        doctor_id = p_doctor_id,
        ward_id = p_ward_id,
        medical_history = NULLIF(TRIM(p_medical_history), ''),
        documents_path = NULLIF(TRIM(p_documents_path), '')
    WHERE id = p_id;

    SET @pms_changed_by_user_id = NULL;
    SET @pms_change_source = NULL;
    SET @pms_status_notes = NULL;
  END IF;

  SELECT * FROM v_patient_full_profile WHERE id = p_id;
END$$

DELIMITER ;
