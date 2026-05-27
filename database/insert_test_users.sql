-- ================================================================================
-- MEDIZEN PMS - TEST ACCOUNTS SETUP
-- ================================================================================
-- This script creates the test accounts needed for role-based dashboard testing
-- Password for all accounts: "password"
-- BCrypt Hash: $2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm
-- ================================================================================

USE pms_db;

-- Clear existing test users (OPTIONAL - comment out if you want to keep existing users)
-- DELETE FROM users WHERE username IN ('admin', 'doctor', 'dr_smith', 'nurse', 'staff', 'patient', 'patient2', 'public_user', 'visitor');

-- ================================================================================
-- 1️⃣ ADMIN ACCOUNT
-- ================================================================================
INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES (
  'System Administrator',
  'admin',
  'admin@medizen.com',
  'ADMIN',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

-- ================================================================================
-- 2️⃣ DOCTOR ACCOUNTS
-- ================================================================================
INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES (
  'Dr. Julian Vance',
  'doctor',
  'dr.julian.vance@medizen.com',
  'DOCTOR',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES (
  'Dr. Marcus Chen',
  'dr_smith',
  'dr.marcus.smith@medizen.com',
  'DOCTOR',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

-- ================================================================================
-- 3️⃣ NURSE/STAFF ACCOUNTS
-- ================================================================================
INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES (
  'Sarah Jenkins',
  'nurse',
  'sarah.jenkins@medizen.com',
  'NURSE',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES (
  'John Doe',
  'staff',
  'john.doe@medizen.com',
  'NURSE',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

-- ================================================================================
-- 4️⃣ PATIENT ACCOUNTS (using RECEPTIONIST role as placeholder - may need custom role)
-- NOTE: Current database schema uses ADMIN, DOCTOR, NURSE, RECEPTIONIST roles
-- To use PATIENT role, update the ENUM in users table:
-- ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT','PUBLIC_USER') NOT NULL;
-- ================================================================================
-- For now, using RECEPTIONIST as a temporary role
INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES (
  'Sarah Miller',
  'patient',
  'sarah.miller@email.com',
  'PATIENT',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES (
  'Robert Jenkins',
  'patient2',
  'robert.jenkins@email.com',
  'PATIENT',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Eleanor Miller', 'eleanor_miller', 'eleanor.miller@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Robert Jenkins', 'robert_jenkins', 'robert.jenkins@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Sarah Williams', 'sarah_williams', 'sarah.williams@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Anna Cortez', 'anna_cortez', 'anna.cortez@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Mark Salazar', 'mark_salazar', 'mark.salazar@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Isabella Torres', 'isabella_torres', 'isabella.torres@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Joshua Villanueva', 'joshua_villanueva', 'joshua.villanueva@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Camille Reyes', 'camille_reyes', 'camille.reyes@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Daniel Navarro', 'daniel_navarro', 'daniel.navarro@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Sophia Dela Cruz', 'sophia_dela_cruz', 'sophia.delacruz@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Miguel Aquino', 'miguel_aquino', 'miguel.aquino@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Lara Mendoza', 'lara_mendoza', 'lara.mendoza@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Rodolfo Yapan', 'rodolfo_yapan', 'rodolfo.yapan@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Mika Tan', 'mika_tan', 'mika.tan@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Paolo Vergara', 'paolo_vergara', 'paolo.vergara@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Marco Sta Ana', 'marco_sta_ana', 'marco.staana@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Sofia First', 'sofia_first', 'sofia.first@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Kira Mendoza', 'kira_mendoza', 'kira.mendoza@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Benj Navarro', 'benj_navarro', 'benj.navarro@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Janelle Cruz', 'janelle_cruz', 'janelle.cruz@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Tristan Ong', 'tristan_ong', 'tristan.ong@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Nora Lim', 'nora_lim', 'nora.lim@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Alden Ramos', 'alden_ramos', 'alden.ramos@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Lea Bautista', 'lea_bautista', 'lea.bautista@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Satoru Gojo', 'satoru_gojo', 'satoru.gojo@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Mina Alvarez', 'mina_alvarez', 'mina.alvarez@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Haruto Saito', 'haruto_saito', 'haruto.saito@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Yuna Park', 'yuna_park', 'yuna.park@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Caleb Lim', 'caleb_lim', 'caleb.lim@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Rina Santos', 'rina_santos', 'rina.santos@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Victor Co', 'victor_co', 'victor.co@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Elaine Uy', 'elaine_uy', 'elaine.uy@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Noel Javier', 'noel_javier', 'noel.javier@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES ('Patricia Ong', 'patricia_ong', 'patricia.ong@medizen.com', 'PATIENT', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm', NOW())
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES (
  'Eleanor Miller',
  'eleanor_miller',
  'eleanor.miller@medizen.com',
  'PATIENT',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES (
  'Robert Jenkins',
  'robert_jenkins',
  'robert.jenkins@medizen.com',
  'PATIENT',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES (
  'Sarah Williams',
  'sarah_williams',
  'sarah.williams@medizen.com',
  'PATIENT',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

-- ================================================================================
-- 5️⃣ PUBLIC USER ACCOUNTS (using RECEPTIONIST role as placeholder)
-- ================================================================================
INSERT INTO users (full_name, username, email, role, password_hash, created_at)
VALUES (
  'John Public',
  'public_user',
  'visitor@medizen.com',
  'PUBLIC_USER',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

INSERT INTO users (full_name, username, email, role, password_hash, created_at) 
VALUES (
  'Community Member',
  'visitor',
  'community@medizen.com',
  'PUBLIC_USER',
  '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm',
  NOW()
)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), email=VALUES(email);

-- ================================================================================
-- VERIFICATION
-- ================================================================================
SELECT '✅ Test accounts created successfully' as status;
SELECT username, full_name, role, email FROM users WHERE username IN ('admin', 'doctor', 'dr_smith', 'nurse', 'staff', 'patient', 'patient2', 'eleanor_miller', 'robert_jenkins', 'sarah_williams', 'anna_cortez', 'mark_salazar', 'isabella_torres', 'joshua_villanueva', 'camille_reyes', 'daniel_navarro', 'sophia_dela_cruz', 'miguel_aquino', 'lara_mendoza', 'rodolfo_yapan', 'mika_tan', 'paolo_vergara', 'marco_sta_ana', 'sofia_first', 'kira_mendoza', 'benj_navarro', 'janelle_cruz', 'tristan_ong', 'nora_lim', 'alden_ramos', 'lea_bautista', 'satoru_gojo', 'mina_alvarez', 'haruto_saito', 'yuna_park', 'caleb_lim', 'rina_santos', 'victor_co', 'elaine_uy', 'noel_javier', 'patricia_ong', 'public_user', 'visitor');

-- ================================================================================
-- SUMMARY
-- ================================================================================
-- All test accounts now have:
-- - Username: (as shown in selection above)
-- - Password: password
-- - BCrypt Hash: $2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUm
--
-- You can now test login at http://localhost:5173
-- Test with any username/password above
--
-- ⚠️  IMPORTANT NOTES:
-- 1. The database schema currently supports: ADMIN, DOCTOR, NURSE, RECEPTIONIST
-- 2. To implement full role-based access, you need to upgrade the schema to include:
--    - PATIENT role (for patient users)
--    - PUBLIC_USER role (for public users)
--
-- 3. Update the role ENUM:
--    ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT','PUBLIC_USER') NOT NULL;
--
-- 4. Then update frontend SecurityConfig to handle role checking
--
-- ================================================================================
