-- Events module schema (safe additive migration)
-- Run this on the same database used by Medizen/PMS.

CREATE TABLE IF NOT EXISTS events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    description TEXT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(180) NOT NULL,
    max_slots INT UNSIGNED NOT NULL,
    current_slots INT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('upcoming','ongoing','completed','full','cancelled') NOT NULL DEFAULT 'upcoming',
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_events_date_time (date, time),
    INDEX idx_events_status (status),
    INDEX idx_events_creator (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_registrations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id INT UNSIGNED NOT NULL,
    patient_id INT UNSIGNED NOT NULL,
    registered_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_event_patient (event_id, patient_id),
    INDEX idx_event_reg_event (event_id),
    INDEX idx_event_reg_patient (patient_id),
    INDEX idx_event_reg_registered_by (registered_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
