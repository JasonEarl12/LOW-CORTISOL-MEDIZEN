<?php
require_once __DIR__ . '/../config.php';
$pdo = getPdo();
try {
    echo "Starting patient ID repair...\n";
    // Backup affected tables
    $tables = ['patients','users','patient_credentials','patient_status_history'];
    foreach ($tables as $t) {
        $bak = $t . '_bak_' . time();
        echo "Creating backup table {$bak}...\n";
        $pdo->exec("CREATE TABLE {$bak} AS SELECT * FROM {$t}");
    }

    // Gather stats
    $max = (int) $pdo->query('SELECT COALESCE(MAX(id),0) FROM patients')->fetchColumn();
    echo "Current max patient id: {$max}\n";

    $zeroRows = $pdo->query("SELECT p.*, u.username AS user_username, pc.username AS cred_username FROM patients p LEFT JOIN users u ON u.patient_id = p.id LEFT JOIN patient_credentials pc ON pc.patient_id = p.id WHERE p.id = 0 ORDER BY p.created_at ASC")->fetchAll(PDO::FETCH_ASSOC);
    if (!$zeroRows) {
        echo "No zero-id patients found, nothing to do.\n";
        exit(0);
    }

    $pdo->beginTransaction();

    foreach ($zeroRows as $row) {
        $max++;
        $created_at = $row['created_at'];
        $full_name = $row['full_name'];
        $user_username = $row['user_username'] ?? null;
        $cred_username = $row['cred_username'] ?? null;

        echo "Assigning new id {$max} to patient '{$full_name}' (created_at {$created_at})...\n";

        // Update the patient row: match by id=0 and created_at and full_name
        $update = $pdo->prepare("UPDATE patients SET id = :newid WHERE id = 0 AND full_name = :full_name AND created_at = :created_at LIMIT 1");
        $update->bindValue(':newid', $max, PDO::PARAM_INT);
        $update->bindValue(':full_name', $full_name, PDO::PARAM_STR);
        $update->bindValue(':created_at', $created_at, PDO::PARAM_STR);
        $update->execute();
        $affected = $update->rowCount();
        echo "Patients update affected: {$affected}\n";

        if ($user_username) {
            $u = $pdo->prepare("UPDATE users SET patient_id = :newid WHERE patient_id = 0 AND username = :username");
            $u->bindValue(':newid', $max, PDO::PARAM_INT);
            $u->bindValue(':username', $user_username, PDO::PARAM_STR);
            $u->execute();
            echo "Updated users rows for username {$user_username}: " . $u->rowCount() . "\n";
        } else {
            // update any users with patient_id=0 and no username match conservatively skip
            echo "No matching user_username for this patient, skipping users update.\n";
        }

        if ($cred_username) {
            $c = $pdo->prepare("UPDATE patient_credentials SET patient_id = :newid WHERE patient_id = 0 AND username = :username");
            $c->bindValue(':newid', $max, PDO::PARAM_INT);
            $c->bindValue(':username', $cred_username, PDO::PARAM_STR);
            $c->execute();
            echo "Updated patient_credentials rows for username {$cred_username}: " . $c->rowCount() . "\n";
        } else {
            echo "No matching credential username for this patient, skipping patient_credentials update.\n";
        }

        // Update patient_status_history for entries with patient_id=0 around creation time ±2 minutes
        $ps = $pdo->prepare("UPDATE patient_status_history SET patient_id = :newid WHERE patient_id = 0 AND changed_at BETWEEN DATE_SUB(:created_at, INTERVAL 2 MINUTE) AND DATE_ADD(:created_at, INTERVAL 2 MINUTE)");
        $ps->bindValue(':newid', $max, PDO::PARAM_INT);
        $ps->bindValue(':created_at', $created_at, PDO::PARAM_STR);
        $ps->execute();
        echo "Updated patient_status_history rows: " . $ps->rowCount() . "\n";
    }

    // Ensure users table id primary key and auto-increment
    echo "Altering users.id to PRIMARY KEY AUTO_INCREMENT...\n";
    $pdo->exec("ALTER TABLE users MODIFY COLUMN id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT");

    // Ensure patients.id primary key and auto-increment (set next auto_increment to max+1)
    $nextAi = $max + 1;
    echo "Altering patients.id to PRIMARY KEY AUTO_INCREMENT and setting AUTO_INCREMENT={$nextAi}...\n";
    $pdo->exec("ALTER TABLE patients MODIFY COLUMN id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT, AUTO_INCREMENT={$nextAi}");

    $pdo->commit();
    echo "Patient ID repair completed successfully. New max id: {$max}\n";
} catch (Exception $e) {
    echo 'Error during repair: ' . $e->getMessage() . PHP_EOL;
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
        echo "Transaction rolled back.\n";
    }
}
