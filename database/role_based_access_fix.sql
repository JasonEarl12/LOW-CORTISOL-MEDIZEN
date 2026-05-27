-- ================================================================================
-- ROLE-BASED ACCESS FIX - IMPLEMENTATION GUIDE
-- ================================================================================
-- Date: March 29, 2026
-- Issue: Test accounts were documented but not created in database
-- Solution: Create test users + update database schema
-- ================================================================================

-- STEP 1: UPDATE DATABASE SCHEMA (if you already have an existing database)
-- ================================================================================
-- Run this if you have an existing pms_db and need to add the new roles:

USE pms_db;

-- Update the users table role ENUM to include PATIENT and PUBLIC_USER
ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT','PUBLIC_USER') NOT NULL;

-- Verify the change
SHOW COLUMNS FROM users WHERE Field='role';
-- Should show: role ENUM('ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT','PUBLIC_USER') NOT NULL

-- ================================================================================
-- STEP 2: CREATE TEST USERS
-- ================================================================================
-- Run the insert_test_users.sql file:
-- 
-- Method A (Recommended): 
-- In MySQL Workbench or MySQL command line:
--   mysql -u root -p pms_db < insert_test_users.sql
-- 
-- Method B: Copy-paste the content from insert_test_users.sql and run in MySQL

-- ================================================================================
-- STEP 3: VERIFY USERS WERE CREATED
-- ================================================================================

SELECT username, full_name, role, email FROM users;

-- Expected output should include:
-- | admin        | System Administrator | ADMIN       | admin@medizen.com                   |
-- | doctor       | Dr. Julian Vance     | DOCTOR      | dr.julian.vance@medizen.com        |
-- | dr_smith     | Dr. Marcus Chen      | DOCTOR      | dr.marcus.smith@medizen.com        |
-- | nurse        | Sarah Jenkins        | NURSE       | sarah.jenkins@medizen.com          |
-- | staff        | John Doe             | NURSE       | john.doe@medizen.com               |
-- | patient      | Sarah Miller         | PATIENT     | sarah.miller@email.com             |
-- | patient2     | Robert Jenkins       | PATIENT     | robert.jenkins@email.com           |
-- | public_user  | John Public          | PUBLIC_USER | visitor@medizen.com                |
-- | visitor      | Community Member     | PUBLIC_USER | community@medizen.com              |

-- ================================================================================
-- STEP 4: REBUILD BACKEND (to pick up new roles)
-- ================================================================================
-- 
-- The Role.java enum has been updated to include PATIENT and PUBLIC_USER
-- You need to rebuild the backend:
--
-- cd backend
-- mvn clean install
-- mvn spring-boot:run
--
-- OR if using an IDE (VS Code, IntelliJ):
-- 1. The IDE should auto-compile (you may see errors that disappear)
-- 2. Restart the Spring Boot application
-- 3. Spring will recompile with the new Role enum

-- ================================================================================
-- STEP 5: TEST THE LOGIN
-- ================================================================================
--
-- Frontend: http://localhost:5173
-- Backend: http://localhost:8080
--
-- Test account credentials (all have password: "password"):
--   Admin:       admin / password
--   Doctor #1:   doctor / password
--   Doctor #2:   dr_smith / password
--   Nurse #1:    nurse / password
--   Nurse #2:    staff / password
--   Patient #1:  patient / password
--   Patient #2:  patient2 / password
--   Public User 1: public_user / password
--   Public User 2: visitor / password
-- 
-- If login still shows "Invalid user", check:
-- 1. Backend is running on http://localhost:8080
-- 2. Users table has the test accounts (see STEP 3 above)
-- 3. Check backend logs for authentication errors
-- 4. Clear browser cache/cookies and try again

-- ================================================================================
-- TROUBLESHOOTING
-- ================================================================================
--
-- ISSUE: "Invalid user" error on login
-- CAUSE: Test accounts don't exist in database
-- FIX:
--   1. Run: INSERT INTO users ... (see insert_test_users.sql)
--   2. Verify: SELECT * FROM users;
--   3. Check MySQL is running: mysql -u root -p
--   4. Check correct database: USE pms_db;
--
-- ISSUE: Role 'PATIENT' not recognized in backend
-- CAUSE: Role enum not updated
-- FIX:
--   1. Check Role.java has PATIENT and PUBLIC_USER
--   2. Rebuild: mvn clean install
--   3. Restart backend
--
-- ISSUE: "Unknown enum value" error
-- CAUSE: Old database schema doesn't support new roles
-- FIX:
--   1. Run: ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT','PUBLIC_USER') NOT NULL;
--   2. Verify: SHOW COLUMNS FROM users WHERE Field='role';
--
-- ISSUE: Users created but still can't login
-- CAUSE: Password hash mismatch or database issue
-- FIX:
--   1. Check password_hash is correct (should be BCrypt hash)
--   2. Verify users table has users: SELECT COUNT(*) FROM users;
--   3. Check for typos in username/email
--   4. Try creating user via API:
--
--   CURL:
--   curl -X POST http://localhost:8080/api/users \
--     -H "Content-Type: application/json" \
--     -d '{
--       "username": "testuser",
--       "password": "testpassword",
--       "fullName": "Test User",
--       "email": "test@example.com",
--       "role": "DOCTOR"
--     }'

-- ================================================================================
-- ALTERNATIVE: CREATE USERS VIA API (if SQL doesn't work)
-- ================================================================================
--
-- Make sure backend is running: mvn spring-boot:run
-- Then use curl commands to create users:
--
-- Create Admin:
-- curl -X POST http://localhost:8080/api/users \
--   -H "Content-Type: application/json" \
--   -d '{"username":"admin","passwordHash":"password","fullName":"Admin","email":"admin@medizen.com","role":"ADMIN"}'
--
-- Create Doctor:
-- curl -X POST http://localhost:8080/api/users \
--   -H "Content-Type: application/json" \
--   -d '{"username":"doctor","passwordHash":"password","fullName":"Dr. Julian Vance","email":"dr.julian.vance@medizen.com","role":"DOCTOR"}'
--
-- Create Nurse:
-- curl -X POST http://localhost:8080/api/users \
--   -H "Content-Type: application/json" \
--   -d '{"username":"nurse","passwordHash":"password","fullName":"Sarah Jenkins","email":"sarah.jenkins@medizen.com","role":"NURSE"}'
--
-- Create Patient:
-- curl -X POST http://localhost:8080/api/users \
--   -H "Content-Type: application/json" \
--   -d '{"username":"patient","passwordHash":"password","fullName":"Sarah Miller","email":"sarah.miller@email.com","role":"PATIENT"}'

-- ================================================================================
-- SUMMARY OF CHANGES MADE
-- ================================================================================
-- 
-- 1. ✅ Updated Role.java enum - added PATIENT and PUBLIC_USER roles
--    File: backend/src/main/java/com/pms/model/Role.java
--
-- 2. ✅ Updated pms_database.sql - updated role ENUM in users table
--    File: database/pms_database.sql
--
-- 3. ✅ Created insert_test_users.sql - SQL script to create test accounts
--    File: database/insert_test_users.sql
--
-- 4. ✅ Created role_based_access_fix.sql - this comprehensive guide
--    File: database/role_based_access_fix.sql
--
-- All test accounts are now ready with proper roles and password hashing!

SELECT 'Role-Based Access Fix Complete ✅' as status;

-- ================================================================================
