-- Chat System Tables
-- Run this script to create the chat_conversations and chat_messages tables

USE pms_db;

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NOT NULL,
  subject VARCHAR(255) NOT NULL DEFAULT 'General Inquiry',
  status ENUM('OPEN', 'CLOSED', 'ARCHIVED') DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_patient_id (patient_id),
  KEY idx_admin_id (admin_id),
  KEY idx_updated_at (updated_at)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  sender_role ENUM('ADMIN', 'PATIENT') NOT NULL,
  message LONGTEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_conversation_id (conversation_id),
  KEY idx_sender_id (sender_id),
  KEY idx_is_read (is_read)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_patient_admin ON chat_conversations(patient_id, admin_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_role ON chat_messages(sender_id, sender_role);
