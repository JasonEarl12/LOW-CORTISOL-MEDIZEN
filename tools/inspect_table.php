<?php
require_once __DIR__ . '/../config.php';
if ($argc < 2) {
    echo "Usage: php inspect_table.php <table_name>\n";
    exit(1);
}
$tbl = $argv[1];
$pdo = getPdo();
try {
    $row = $pdo->query("SHOW CREATE TABLE `" . $tbl . "`")->fetch(PDO::FETCH_ASSOC);
    echo "SHOW CREATE TABLE {$tbl}:\n" . ($row['Create Table'] ?? json_encode($row)) . "\n\n";
    $ai = $pdo->query("SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '" . $tbl . "'")->fetchColumn();
    echo "AUTO_INCREMENT: " . var_export($ai, true) . "\n\n";
    $cols = $pdo->query("SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '" . $tbl . "'")->fetchAll(PDO::FETCH_ASSOC);
    echo "COLUMNS:\n" . json_encode($cols, JSON_PRETTY_PRINT) . "\n";
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
