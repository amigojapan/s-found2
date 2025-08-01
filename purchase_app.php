<?php
// Ensure user is logged in
if (!isset($_COOKIE['googleID'])) {
    echo "Error: User not logged in.";
    exit;
}
$userid = (int)$_COOKIE['googleID'];

// Ensure appid is provided
if (!isset($_POST['appid'])) {
    echo "Error: No app selected.";
    exit;
}
$appid = (int)$_POST['appid'];

// Connect to database and enable foreign keys
$db = new SQLite3('test.sqlite');
$db->exec('PRAGMA foreign_keys = ON;');

// Check if userid exists in users table
$stmt_user = $db->prepare('SELECT ID FROM users WHERE ID = :userid');
$stmt_user->bindValue(':userid', $userid, SQLITE3_INTEGER);
$result_user = $stmt_user->execute();
$user_exists = $result_user->fetchArray() !== false;

if (!$user_exists) {
    echo "Error: User with ID $userid does not exist in the users table.";
    $db->close();
    exit;
}

// Check if appid exists in appstable
$stmt_app = $db->prepare('SELECT appid FROM appstable WHERE appid = :appid');
$stmt_app->bindValue(':appid', $appid, SQLITE3_INTEGER);
$result_app = $stmt_app->execute();
$app_exists = $result_app->fetchArray() !== false;

if (!$app_exists) {
    echo "Error: App with ID $appid does not exist in the appstable.";
    $db->close();
    exit;
}

// Insert the purchase
$stmt = $db->prepare('INSERT INTO purchasestable (userid, appid) VALUES (:userid, :appid)');
$stmt->bindValue(':userid', $userid, SQLITE3_INTEGER);
$stmt->bindValue(':appid', $appid, SQLITE3_INTEGER);
$result = $stmt->execute();

// Check if the insert was successful
if ($db->changes() > 0) {
    header("Location: list_apps.php");
    exit;
} else {
    $error_code = $db->lastErrorCode();
    $error_msg = $db->lastErrorMsg();
    if ($error_code == 787) {
        echo "Error: Foreign key constraint failed. User or app does not exist.";
    } else {
        echo "Error: " . htmlspecialchars($error_msg) . " (Code: $error_code)";
    }
}

$db->close();
?>