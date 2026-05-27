-- Comprehensive chat tables schema fix
-- This script checks and fixes both chat_conversations and chat_messages

-- 1. Check current schema
SELECT 'Checking chat_conversations table...' as check_step;
DESC chat_conversations;

SELECT 'Checking chat_messages table...' as check_step;
DESC chat_messages;

-- 2. Delete any corrupted records with id=0 or id<0
DELETE FROM chat_messages WHERE id <= 0;
DELETE FROM chat_conversations WHERE id <= 0;

-- 3. Fix chat_conversations table
ALTER TABLE chat_conversations MODIFY id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- 4. Fix chat_messages table (if needed)
-- Check if it already has AUTO_INCREMENT
-- If not, this will add it
ALTER TABLE chat_messages MODIFY id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- 5. Verify the fixes
SELECT 'FINAL SCHEMA - chat_conversations:' as verification;
DESC chat_conversations;

SELECT 'FINAL SCHEMA - chat_messages:' as verification;
DESC chat_messages;

-- 6. Show data integrity
SELECT 'Conversations count:' as data_check, COUNT(*) as count FROM chat_conversations;
SELECT 'Messages count:' as data_check, COUNT(*) as count FROM chat_messages;

SELECT 'Schema fix complete!' as result;
