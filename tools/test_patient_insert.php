<?php
require_once __DIR__ . '/../config.php';

$pdo = getPdo();
try {
    $stmt = $pdo->prepare('INSERT INTO patients (full_name, dob, gender, status) VALUES (:full_name, :dob, :gender, :status)');
    $stmt->bindValue(':full_name', 'Test Patient ' . time(), PDO::PARAM_STR);
    $stmt->bindValue(':dob', '1990-01-01', PDO::PARAM_STR);
    $stmt->bindValue(':gender', 'OTHER', PDO::PARAM_STR);
    $stmt->bindValue(':status', 'ADMITTED', PDO::PARAM_STR);
    $stmt->execute();
    $last = $pdo->lastInsertId();
    echo "lastInsertId: " . var_export($last, true) . PHP_EOL;
    $id = (int) $last;
    $row = $pdo->prepare('SELECT id, full_name, dob FROM patients WHERE id = :id LIMIT 1');
    $row->bindValue(':id', $id, PDO::PARAM_INT);
    $row->execute();
    $data = $row->fetch(PDO::FETCH_ASSOC);
    echo "fetched row: " . json_encode($data) . PHP_EOL;
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
