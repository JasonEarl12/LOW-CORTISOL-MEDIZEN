<?php
/**
 * Test Script: Verify messaging system works
 * This tests sending a message from admin to patient
 */

// Include configuration
require_once 'config.php';

try {
    // Get database connection
    $pdo = getPdo();
    
    // Simulate admin user
    $adminUserId = 1;
    $patientUserId = 116059; // Anna Cortez (Patient ID 1)
    $message = "Test message - System is working! " . date('Y-m-d H:i:s');
    
    echo "========== MESSAGING SYSTEM TEST ==========\n";
    echo "Admin User ID: " . $adminUserId . "\n";
    echo "Patient User ID: " . $patientUserId . "\n";
    echo "Message: " . $message . "\n\n";
    
    // Test 1: Check database connection
    echo "Test 1: Database Connection\n";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM chat_conversations");
    $result = $stmt->fetch();
    echo "✓ Database connected. Conversations: " . $result['count'] . "\n\n";
    
    // Test 2: Check if patient user exists
    echo "Test 2: Verify Patient User Exists\n";
    $stmt = $pdo->prepare("SELECT id, patient_id, full_name FROM users WHERE id = :id");
    $stmt->execute([':id' => $patientUserId]);
    $user = $stmt->fetch();
    if ($user) {
        echo "✓ Patient user found: " . $user['full_name'] . " (Patient ID: " . $user['patient_id'] . ")\n\n";
    } else {
        echo "✗ Patient user not found!\n\n";
        exit(1);
    }
    
    // Test 3: Simulate sending a message
    echo "Test 3: Insert Test Message\n";
    $patientId = $user['patient_id'];
    
    // Check if conversation exists
    $stmt = $pdo->prepare("
        SELECT id FROM chat_conversations 
        WHERE patient_id = :patient_id AND admin_id = :admin_id
    ");
    $stmt->execute([':patient_id' => $patientId, ':admin_id' => $adminUserId]);
    $conv = $stmt->fetch();
    
    if ($conv) {
        $conversationId = $conv['id'];
        echo "✓ Conversation exists: ID " . $conversationId . "\n";
    } else {
        // Create new conversation
        echo "  Creating new conversation...\n";
        $stmt = $pdo->prepare("
            INSERT INTO chat_conversations (patient_id, admin_id, status)
            VALUES (:patient_id, :admin_id, :status)
        ");
        $stmt->execute([
            ':patient_id' => $patientId,
            ':admin_id' => $adminUserId,
            ':status' => 'open'
        ]);
        $conversationId = (int) $pdo->lastInsertId();
        echo "✓ New conversation created: ID " . $conversationId . "\n";
    }
    
    // Insert test message
    $stmt = $pdo->prepare("
        INSERT INTO chat_messages (conversation_id, sender_id, sender_role, message)
        VALUES (:conversation_id, :sender_id, :sender_role, :message)
    ");
    $stmt->execute([
        ':conversation_id' => $conversationId,
        ':sender_id' => $adminUserId,
        ':sender_role' => 'ADMIN',
        ':message' => $message
    ]);
    $messageId = (int) $pdo->lastInsertId();
    echo "✓ Message inserted successfully: ID " . $messageId . "\n\n";
    
    // Test 4: Verify message was saved
    echo "Test 4: Verify Message in Database\n";
    $stmt = $pdo->prepare("SELECT id, sender_id, message, created_at FROM chat_messages WHERE id = :id");
    $stmt->execute([':id' => $messageId]);
    $savedMsg = $stmt->fetch();
    if ($savedMsg) {
        echo "✓ Message found in database\n";
        echo "  Message ID: " . $savedMsg['id'] . "\n";
        echo "  Sender ID: " . $savedMsg['sender_id'] . "\n";
        echo "  Created: " . $savedMsg['created_at'] . "\n";
        echo "  Content: " . $savedMsg['message'] . "\n\n";
    }
    
    // Test 5: Get all messages in conversation
    echo "Test 5: Retrieve All Messages in Conversation\n";
    $stmt = $pdo->prepare("
        SELECT id, sender_id, sender_role, message, created_at
        FROM chat_messages
        WHERE conversation_id = :conv_id
        ORDER BY created_at DESC
    ");
    $stmt->execute([':conv_id' => $conversationId]);
    $messages = $stmt->fetchAll();
    echo "Total messages in conversation: " . count($messages) . "\n";
    foreach ($messages as $msg) {
        echo "  - [" . $msg['sender_role'] . "] " . substr($msg['message'], 0, 50) . "...\n";
    }
    
    echo "\n========== ALL TESTS PASSED ✓ ==========\n";
    echo "The messaging system is working correctly!\n";
    
} catch (Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
    exit(1);
}
?>
