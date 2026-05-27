-- Migration: Add username and password fields to patients table
-- This migration adds login credentials management for patients in the PMS system
-- Admin-only visible and editable fields for managing patient access

USE pms_db;

-- Add columns if they don't exist
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS username VARCHAR(60) UNIQUE COMMENT 'Patient login username',
ADD COLUMN IF NOT EXISTS password VARCHAR(255) COMMENT 'Patient login password';

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_username ON patients(username);

-- Verification query
SELECT 'Migration completed successfully. New columns added to patients table.' AS status;
