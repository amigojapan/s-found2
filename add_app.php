<!DOCTYPE html>
<html>
<head>
    <title>Add App</title>
</head>
<body>
    <h1>Add a New App</h1>
    <form action="" method="post" enctype="multipart/form-data">
        <label for="appname">App Name:</label><br>
        <input type="text" id="appname" name="appname" required><br><br>

        <label for="appdescription">App Description:</label><br>
        <textarea id="appdescription" name="appdescription" required></textarea><br><br>

        <label for="costdollars">Cost (Dollars):</label><br>
        <input type="text" id="costdollars" name="costdollars" required><br><br>

        <label for="costcents">Cost (Cents):</label><br>
        <input type="text" id="costcents" name="costcents" required><br><br>

        <label for="screenshots">Screenshots:</label><br>
        <input type="file" id="screenshots" name="screenshots[]" multiple accept="image/*"><br><br>

        <label for="appjson">App JSON File:</label><br>
        <input type="file" id="appjson" name="appjson" accept=".s-found2" required><br><br>

        <label>Buyers can decide the ammount they want to pay?</label><br>
        <input type="radio" id="payment_yes" name="paymenttype" value="true" required> Yes
        <input type="radio" id="payment_no" name="paymenttype" value="false"> No<br><br>

        <input type="submit" value="Submit">
    </form>

<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate numeric fields
    if (!is_numeric($_POST['costdollars']) || !is_numeric($_POST['costcents'])) {
        echo '<p style="color:red;">Error: you must enter a numeric value for dollars and cents, and htey cant be empty, enter 0 for both values if you want the game to be free.</p>';
        exit;
    }
    // Validate required fields
    if (empty($_POST['appname']) || empty($_POST['appdescription'])  || empty($_POST['paymenttype'])) {
        echo '<p style="color:red;">Error: All fields are required.</p>';
        exit;
    }
    // Connect to SQLite database
    $db = new SQLite3('test.sqlite');

    // Retrieve creatorid from cookie
    if (isset($_SESSION['googleID'])) {
        //** Retrieve ID from users table
        $stmt = $db->prepare('SELECT ID FROM users WHERE googleID = :googleID');
        $stmt->bindValue(':googleID', $_SESSION['googleID'], SQLITE3_TEXT);
        $result = $stmt->execute();
        $user = $result->fetchArray(SQLITE3_ASSOC);
        if(!$user){
            $db->close();
            die("user not found.");
        }
        $creatorid = $user["ID"];
    } else {
        echo '<p style="color:red;">Error: User not logged in.</p>';
        exit;
    }

    // Get form data
    $appname = $_POST['appname'];
    $appdescription = $_POST['appdescription'];
    $costdollars = $_POST['costdollars'];
    $costcents = $_POST['costcents'];
    $paymenttype = $_POST['paymenttype'];

    // Validate paymenttype
    if ($paymenttype !== 'true' && $paymenttype !== 'false') {
        echo '<p style="color:red;">Error: Invalid payment type.</p>';
        exit;
    }

    // Validate cost fields
    if (!is_numeric($costdollars) || !is_numeric($costcents)) {
        echo '<p style="color:red;">Error: Cost must be numeric.</p>';
        exit;
    }

    // Handle appjson upload
    if (isset($_FILES['appjson']) && $_FILES['appjson']['error'] == UPLOAD_ERR_OK) {
        $json_ext = strtolower(pathinfo($_FILES['appjson']['name'], PATHINFO_EXTENSION));
        if ($json_ext !== 's-found2') {
            echo '<p style="color:red;">Error: Only .s-found2 files are allowed.</p>';
            exit;
        }
        $json_file = $_FILES['appjson']['tmp_name'];
        $appjson = file_get_contents($json_file);
        json_decode($appjson);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo '<p style="color:red;">Error: Invalid JSON file.</p>';
            exit;
        }
    } else {
        echo '<p style="color:red;">Error: No JSON file uploaded.</p>';
        exit;
    }
    if(str_contains($appjson,"cookie")){
        echo '<p style="color:red;">Error: sorry, your s-found2 file contains the word "cookie" we don\'t. accept that, remove any string containing such a word</p>';
        exit;
    }

    // Handle screenshots upload
    $upload_base = 'uploads/screenshots/';
    if (!file_exists($upload_base)) {
        mkdir($upload_base, 0777, true);
    }
    $dir_name = preg_replace('/[^a-z0-9]+/', '_', strtolower($appname));
    $upload_dir = $upload_base . $dir_name . '/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $screenshot_paths = [];
    if (isset($_FILES['screenshots']) && !empty($_FILES['screenshots']['tmp_name'][0])) {
        $allowed_ext = ['jpg', 'jpeg', 'png', 'gif'];
        $count = 1;
        foreach ($_FILES['screenshots']['tmp_name'] as $key => $tmp_name) {
            if ($_FILES['screenshots']['error'][$key] == UPLOAD_ERR_OK) {
                $ext = strtolower(pathinfo($_FILES['screenshots']['name'][$key], PATHINFO_EXTENSION));
                if (in_array($ext, $allowed_ext)) {
                    $filename = $dir_name . '_' . $count . '.' . $ext;
                    $destination = $upload_dir . $filename;
                    if (move_uploaded_file($tmp_name, $destination)) {
                        $screenshot_paths[] = $destination;
                    }
                    $count++;
                }
            }
        }
    }
    $screenshots_str = implode(',', $screenshot_paths); // Empty string if no screenshots


    // Prepare INSERT statement
    $stmt = $db->prepare('INSERT INTO appstable (creatorid, appname, appdescription, appjson, costdollars, costcents, screenshots, paymenttypeisuserdecide) VALUES (:creatorid, :appname, :appdescription, :appjson, :costdollars, :costcents, :screenshots, :paymenttype)');

    // Bind values
    //$stmt->bindValue(':appid', NULL, SQLITE3_INTEGER);
    $stmt->bindValue(':creatorid', $creatorid, SQLITE3_INTEGER);
    $stmt->bindValue(':appname', $appname, SQLITE3_TEXT);
    $stmt->bindValue(':appdescription', $appdescription, SQLITE3_TEXT);
    $stmt->bindValue(':appjson', $appjson, SQLITE3_TEXT);
    $stmt->bindValue(':costdollars', $costdollars, SQLITE3_TEXT);
    $stmt->bindValue(':costcents', $costcents, SQLITE3_TEXT);
    $stmt->bindValue(':screenshots', $screenshots_str, SQLITE3_TEXT);
    $stmt->bindValue(':paymenttype', $paymenttype, SQLITE3_TEXT);

    // Execute and handle result
    $result = $stmt->execute();
    if ($result) {
        echo '<p style="color:green;">App added successfully.</p>';
    } else {
        $error = $db->lastErrorMsg();
        if (strpos($error, 'UNIQUE constraint failed: appstable.appname') !== false) {
            echo '<p style="color:red;">Error: App name already exists.</p>';
        } else {
            echo '<p style="color:red;">Error: ' . htmlspecialchars($error) . '</p>';
        }
    }

    // Close database connection
    $db->close();
}
?>
</body>
</html>