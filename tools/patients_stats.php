<?php
require_once __DIR__ . '/../config.php';
$pdo = getPdo();
$total = (int) $pdo->query('SELECT COUNT(*) FROM patients')->fetchColumn();
$zeros = (int) $pdo->query('SELECT COUNT(*) FROM patients WHERE id = 0')->fetchColumn();
$max = (int) $pdo->query('SELECT COALESCE(MAX(id),0) FROM patients')->fetchColumn();
echo "patients_count={$total} zeros={$zeros} max_id={$max}\n";
$rows=$pdo->query('SELECT id, full_name, created_at FROM patients ORDER BY id ASC LIMIT 10')->fetchAll(PDO::FETCH_ASSOC);
echo "sample rows: " . json_encode($rows) . PHP_EOL;
