-- Fix corrupted appointment row (id=0) and add AUTO_INCREMENT to appointments.id
SET @max = (SELECT IFNULL(MAX(id), 0) FROM appointments);
SET @newid = @max + 1;

-- Update row with id=0 to new id
UPDATE appointments SET id = @newid WHERE id = 0;

-- Ensure appointment_notifications or other tables referencing appointment id are updated if necessary
-- (Search/replace not implemented here; run checks after this script)

-- Modify column to add AUTO_INCREMENT
ALTER TABLE appointments MODIFY id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT;

-- Verify
SELECT 'Appointments fixed' as status, @newid as migrated_id;
SELECT id, patient_id, doctor_id, date, time, status FROM appointments ORDER BY id;
