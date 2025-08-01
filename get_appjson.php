<?php
header('Content-Type: application/json');

$db = new SQLite3('test.sqlite');

// Check if user is logged in
if (!isset($_COOKIE['googleID'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}
$userid = (int)$_COOKIE['googleID'];

// Get appid from GET parameter
if (!isset($_GET['appid'])) {
    echo json_encode(['error' => 'No appid provided']);
    exit;
}
$appid = (int)$_GET['appid'];

// Retrieve app details
$stmt = $db->prepare('SELECT * FROM appstable WHERE appid = :appid');
$stmt->bindValue(':appid', $appid, SQLITE3_INTEGER);
$result = $stmt->execute();
$app = $result->fetchArray(SQLITE3_ASSOC);

if (!$app) {
    echo json_encode(['error' => 'App not found']);
    exit;
}

// Check if app is free
$costdollars = (int)$app['costdollars'];
$costcents = (int)$app['costcents'];
if ($costdollars == 0 && $costcents == 0) {
    echo $app['appjson'];
    exit;
}

// Check if user has purchased the app
$stmt = $db->prepare('SELECT COUNT(*) as count FROM purchasestable WHERE userid = :userid AND appid = :appid');
$stmt->bindValue(':userid', $userid, SQLITE3_INTEGER);
$stmt->bindValue(':appid', $appid, SQLITE3_INTEGER);
$result = $stmt->execute();
$row = $result->fetchArray(SQLITE3_ASSOC);

if ($row['count'] > 0) {
    echo $app['appjson'];
    exit;
}

echo json_encode(['error' => 'Access denied']);

$db->close();
?>