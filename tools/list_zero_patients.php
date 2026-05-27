<?php
require_once __DIR__ . '/../config.php';
$pdo = getPdo();
$rows = $pdo->query("SELECT p.*, u.id AS user_id, u.username AS user_username, pc.id AS cred_id, pc.username AS cred_username FROM patients p LEFT JOIN users u ON u.patient_id = p.id LEFT JOIN patient_credentials pc ON pc.patient_id = p.id WHERE p.id = 0 ORDER BY created_at ASC")->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT);
