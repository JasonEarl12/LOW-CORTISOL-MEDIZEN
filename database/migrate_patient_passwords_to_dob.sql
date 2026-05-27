-- Migration: Update patient passwords to use DOB formula
-- Formula: username + DOB (YYYYMMDD)
-- This ensures consistency between admin panel display and actual login credentials
--
-- NOTE: This migration must be executed via PHP to properly hash passwords with bcrypt
-- Use the /api.php endpoint with action=regenerate_patient_passwords
-- OR run the regenerate-patient-passwords.php script manually
--
-- SQL only: Mark patient passwords for regeneration
UPDATE users u
SET u.password_hash = ''
WHERE u.role = 'PATIENT'
AND u.patient_id IS NOT NULL;

