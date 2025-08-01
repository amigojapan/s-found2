<?php
session_start();
$db = new SQLite3('test.sqlite');

// Check if account exists using googleID
$qry = $db->prepare('SELECT * FROM users WHERE googleID = :googleID');
$qry->bindValue(':googleID', $_SESSION['googleID'], SQLITE3_TEXT);
$result = $qry->execute();
if ($result->fetchArray()) {
    // Account exists, redirect immediately
    header("Location: https://amjp.psy-k.org/s-found2/list_apps.php");
    exit();
}

// Account doesn’t exist, proceed with form handling or display
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Process form submission
    // Check if nickname is unique
    $qry = $db->prepare('SELECT * FROM users WHERE nickname = :nickname');
    $qry->bindValue(':nickname', $_POST["nickname"], SQLITE3_TEXT);
    $result = $qry->execute();
    if ($result->fetchArray()) {
        // Nickname already exists
        $error = "Nickname already exists, please choose another one.";
    } else {
        // Insert new user
        $qry = $db->prepare('INSERT INTO users (googleID, fullname, nickname, email) VALUES (:googleID, :fullname, :nickname, :email)');
        $qry->bindValue(':googleID', $_SESSION['googleID'], SQLITE3_TEXT);
        $qry->bindValue(':fullname', $_SESSION['user_name'], SQLITE3_TEXT);
        $qry->bindValue(':nickname', $_POST["nickname"], SQLITE3_TEXT);
        $qry->bindValue(':email', $_SESSION['user_email'], SQLITE3_TEXT);
        $qry->execute();
        // Redirect after successful insertion
        header("Location: https://amjp.psy-k.org/s-found2/list_apps.php");
        exit();
    }
}

// Display form with error message if applicable
if ($error) {
    echo "<p style='color: red;'>$error</p>";
}
echo "<form action=\"registernick.php\" method=\"POST\">";
echo "nickname/ハンドル名/alias: <input type=\"text\" name=\"nickname\"><br>";
echo "<input type=\"submit\"></form>";
?>