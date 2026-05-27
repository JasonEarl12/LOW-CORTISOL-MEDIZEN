<?php
declare(strict_types=1);
// Test script: fix id=0 rows for billing and inventory, ensure AUTO_INCREMENT, insert test records
chdir(__DIR__ . '/..');
require_once __DIR__ . '/../config.php';

ini_set('display_errors', '1');
error_reporting(E_ALL);

function out($s) { echo $s . PHP_EOL; }

try {
    $pdo = getPdo();
    out("Connected to database.");

    // Ensure patients exist (billing requires patient_id)
    $patientId = null;
    $pstmt = $pdo->query('SELECT id FROM patients ORDER BY id ASC LIMIT 1');
    $first = $pstmt->fetchColumn();
    if ($first) {
        $patientId = (int)$first;
        out("Found existing patient id: {$patientId}");
    } else {
        out("No patients found — creating a test patient.");
        $ins = $pdo->prepare('INSERT INTO patients (full_name, dob, gender, status) VALUES (:name, :dob, :gender, :status)');
        $ins->execute([':name' => 'Test Patient', ':dob' => date('Y-m-d', strtotime('-30 years')), ':gender' => 'OTHER', ':status' => 'ADMITTED']);
        $patientId = (int)$pdo->lastInsertId();
        out("Created patient id: {$patientId}");
    }

    // Fix billing table id=0 rows by assigning new sequential ids (in-place updates)
    $rows0 = (int)$pdo->query('SELECT COUNT(*) FROM billing WHERE id = 0')->fetchColumn();
    if ($rows0 > 0) {
        out("Found {$rows0} billing rows with id=0. Assigning new ids in-place.");
        // Disable foreign key checks temporarily while renumbering
        $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
        for ($i = 0; $i < $rows0; $i++) {
            $maxBilling = (int)$pdo->query('SELECT IFNULL(MAX(id),0) FROM billing')->fetchColumn();
            $newId = $maxBilling + 1;
            // Update one row with id=0 to new id
            $upd = $pdo->prepare('UPDATE billing SET id = :newId WHERE id = 0 LIMIT 1');
            $upd->execute([':newId' => $newId]);
            out("Assigned billing id 0 -> {$newId}");
        }
        $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
        out('Completed renumbering billing id=0 rows.');
    } else {
        out('No billing id=0 rows found.');
    }

    // Ensure billing id column is AUTO_INCREMENT and set next value
    $maxBilling = (int)$pdo->query('SELECT IFNULL(MAX(id),0) FROM billing')->fetchColumn();
    $next = $maxBilling + 1;
    $pdo->exec('ALTER TABLE billing MODIFY COLUMN id bigint(20) unsigned NOT NULL AUTO_INCREMENT');
    $pdo->exec("ALTER TABLE billing AUTO_INCREMENT = {$next}");
    out("Modified billing.id to AUTO_INCREMENT and set next to {$next}");

    // Insert test billing record
    $insB = $pdo->prepare('INSERT INTO billing (patient_id, amount, payment_status) VALUES (:patient_id, :amount, :payment_status)');
    $insB->execute([':patient_id' => $patientId, ':amount' => 1234.50, ':payment_status' => 'PENDING']);
    $billingId = (int)$pdo->lastInsertId();
    out("Inserted test billing record id={$billingId}");
    $row = $pdo->prepare('SELECT * FROM billing WHERE id = :id'); $row->execute([':id' => $billingId]);
    out('Billing row: ' . json_encode($row->fetch(PDO::FETCH_ASSOC)));

    // Fix inventory id=0 rows by assigning new ids in-place
    $inv0 = (int)$pdo->query('SELECT COUNT(*) FROM inventory WHERE id = 0')->fetchColumn();
    if ($inv0 > 0) {
        out("Found {$inv0} inventory rows with id=0. Assigning new ids in-place.");
        $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
        for ($i = 0; $i < $inv0; $i++) {
            $maxInv = (int)$pdo->query('SELECT IFNULL(MAX(id),0) FROM inventory')->fetchColumn();
            $newInvId = $maxInv + 1;
            $upd = $pdo->prepare('UPDATE inventory SET id = :newId WHERE id = 0 LIMIT 1');
            $upd->execute([':newId' => $newInvId]);
            out("Assigned inventory id 0 -> {$newInvId}");
        }
        $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
        out('Completed renumbering inventory id=0 rows.');
    } else {
        out('No inventory id=0 rows found.');
    }

    $maxInv = (int)$pdo->query('SELECT IFNULL(MAX(id),0) FROM inventory')->fetchColumn();
    $nextInv = $maxInv + 1;
    $pdo->exec('ALTER TABLE inventory MODIFY COLUMN id bigint(20) unsigned NOT NULL AUTO_INCREMENT');
    $pdo->exec("ALTER TABLE inventory AUTO_INCREMENT = {$nextInv}");
    out("Modified inventory.id to AUTO_INCREMENT and set next to {$nextInv}");

    // Insert test inventory record
    $insI = $pdo->prepare('INSERT INTO inventory (item_name, quantity, expiration_date, alert_threshold) VALUES (:item_name, :quantity, :expiration_date, :alert_threshold)');
    $insI->execute([':item_name' => 'Test Item ' . date('YmdHis'), ':quantity' => 10, ':expiration_date' => null, ':alert_threshold' => 1]);
    $invId = (int)$pdo->lastInsertId();
    out("Inserted test inventory id={$invId}");
    $row = $pdo->prepare('SELECT * FROM inventory WHERE id = :id'); $row->execute([':id' => $invId]);
    out('Inventory row: ' . json_encode($row->fetch(PDO::FETCH_ASSOC)));

    out('All operations completed.');

} catch (Throwable $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
    exit(1);
}

?>