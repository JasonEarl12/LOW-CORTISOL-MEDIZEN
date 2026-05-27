<?php
require_once __DIR__ . '/../config.php';
$pdo = getPdo();
$rows = $pdo->query('SELECT id, username, patient_id FROM users WHERE patient_id = 0')->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT);
