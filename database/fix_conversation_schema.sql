-- Fix chat_conversations schema issue
-- Delete the corrupted row with id=0
DELETE FROM chat_conversations WHERE id=0;

-- Add AUTO_INCREMENT to id column
ALTER TABLE chat_conversations MODIFY id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- Verify the fix
SELECT 'Schema fixed!' as status;
SELECT id, patient_id, admin_id, status FROM chat_conversations ORDER BY id;
