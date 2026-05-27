<?php
require_once __DIR__ . '/../config.php';
$pdo = getPdo();
$tables = ['users','appointments','patient_status_history','patient_credentials','event_registrations','chat_conversations','appointments'];
foreach ($tables as $t) {
    try {
        $c = (int) $pdo->query("SELECT COUNT(*) FROM {$t} WHERE patient_id = 0")->fetchColumn();
        echo "{$t}:{$c}\n";
    } catch (Exception $e) {
        echo "{$t}: ERROR - " . $e->getMessage() . "\n";
    }
}
