-- ============================================================================
-- PATIENT CREDENTIALS MIGRATION - XAMPP PMS
-- ============================================================================
-- This migration adds username and password fields to the patients table
-- These fields allow admins to manage patient login credentials directly
-- ============================================================================

USE pms_db;

-- Step 1: Add columns if they don't exist
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS username VARCHAR(60) UNIQUE COMMENT 'Patient login username',
ADD COLUMN IF NOT EXISTS password VARCHAR(255) COMMENT 'Patient login password';

-- Step 2: Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_patients_username ON patients(username);

-- Step 3: Verification - show the updated table structure
SELECT 'Migration completed successfully!' AS status;
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pms_db' AND TABLE_NAME = 'patients' 
ORDER BY ORDINAL_POSITION;
