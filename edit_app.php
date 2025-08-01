<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();
// Connect to SQLite database
$db = new SQLite3('test.sqlite');

// Check for googleID cookie
//$cookie_name = "googleID";
if (!isset($_SESSION["googleID"])) {
    echo "Error: User not logged in.";
    $db->close();
    exit;
}
$logged_in_user_id = $_SESSION["googleID"];

if (isset($_GET['appid'])) {
    $appid = (int)$_GET['appid'];

    // Retrieve app details and verify creator
    $stmt = $db->prepare('SELECT * FROM appstable WHERE appid = :appid');
    $stmt->bindValue(':appid', $appid, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $app = $result->fetchArray(SQLITE3_ASSOC);

    if (!$app) {
        echo "App not found.";
        $db->close();
        exit;
    }
    //echo "googleID:".$_SESSION["googleID"];
    //** Retrieve ID from users table
    $stmt = $db->prepare('SELECT ID FROM users WHERE googleID = :googleID');
    $stmt->bindValue(':googleID', $_SESSION["googleID"], SQLITE3_TEXT);
    $result = $stmt->execute();
    $user = $result->fetchArray(SQLITE3_ASSOC);
    if(!$user){
        $db->close();
        die("user nor logged in");
    }
    $logged_in_user_id=(int)$user["ID"];
    //echo "<BR>ID:".$user["ID"].'$app[creatorid]'.$app['creatorid'];
    // Check if the logged-in user is the creator
    if ((int)$app['creatorid'] !== $logged_in_user_id) {
        echo "you cannot edit this data, wrong user.";
        $db->close();
        exit;
    }

    // Handle delete request
    if (isset($_POST['delete']) && $_POST['delete'] == '1') {
        $appid = (int)$_POST['appid'];

        
        // Retrieve app details and verify creator
        $stmt = $db->prepare('SELECT * FROM appstable WHERE appid = :appid');
        $stmt->bindValue(':appid', $appid, SQLITE3_INTEGER);
        $result = $stmt->execute();
        $app = $result->fetchArray(SQLITE3_ASSOC);

        if ($app && $app['creatorid'] === $logged_in_user_id) {
            // Delete the app from database
            $stmt = $db->prepare('DELETE FROM appstable WHERE appid = :appid');
            $stmt->bindValue(':appid', $appid, SQLITE3_INTEGER);
            $result = $stmt->execute();

            if ($result) {
                header("Location: https://amjp.psy-k.org/s-found2/list_apps.php");
                exit;
            } else {
                echo "Error deleting app: " . htmlspecialchars($db->lastErrorMsg());
            }
        } else {
            echo "Error: App not found or you don't have permission to delete it.";
        }
        $db->close();
        exit;
    }

    // Handle form submission for updating the app
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['delete'])) {
        // Get form data
        $appname = $_POST['appname'];
        $appdescription = $_POST['appdescription'];
        $costdollars = $_POST['costdollars'];
        $costcents = $_POST['costcents'];
        $paymenttype = $_POST['paymenttype'];

        // Basic validation
        if (empty($appname) || empty($appdescription) || !is_numeric($costdollars) || !is_numeric($costcents) || !in_array($paymenttype, ['true', 'false'])) {
            echo "Error: All fields are required and cost must be numeric.";
            exit;
        }

        // Get existing screenshots
        $existing_screenshots = !empty($app['screenshots']) ? explode(',', $app['screenshots']) : [];

        // Handle screenshot removals
        if (isset($_POST['remove_screenshots'])) {
            $to_remove = $_POST['remove_screenshots'];
            foreach ($to_remove as $index) {
                $index = (int)$index;
                if (isset($existing_screenshots[$index])) {
                    $file_to_remove = $existing_screenshots[$index];
                    if (file_exists($file_to_remove)) {
                        unlink($file_to_remove);
                    }
                    unset($existing_screenshots[$index]);
                }
            }
            $existing_screenshots = array_values($existing_screenshots); // Reindex array
        }

        // Handle new screenshot uploads
        $upload_base = 'uploads/screenshots/';
        $dir_name = preg_replace('/[^a-z0-9]+/', '_', strtolower($appname));
        $upload_dir = $upload_base . $dir_name . '/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        $new_screenshot_paths = [];
        if (isset($_FILES['new_screenshots']) && !empty($_FILES['new_screenshots']['tmp_name'][0])) {
            $allowed_ext = ['jpg', 'jpeg', 'png', 'gif'];
            $count = count($existing_screenshots) + 1;
            foreach ($_FILES['new_screenshots']['tmp_name'] as $key => $tmp_name) {
                if ($_FILES['new_screenshots']['error'][$key] == UPLOAD_ERR_OK) {
                    $ext = strtolower(pathinfo($_FILES['new_screenshots']['name'][$key], PATHINFO_EXTENSION));
                    if (in_array($ext, $allowed_ext)) {
                        $filename = $dir_name . '_' . $count . '.' . $ext;
                        $destination = $upload_dir . $filename;
                        if (move_uploaded_file($tmp_name, $destination)) {
                            $new_screenshot_paths[] = $destination;
                        }
                        $count++;
                    }
                }
            }
        }

        // Combine existing and new screenshots
        $all_screenshots = array_merge($existing_screenshots, $new_screenshot_paths);
        $screenshots_str = implode(',', $all_screenshots);

        // Handle appjson upload (optional)
        if (isset($_FILES['appjson']) && $_FILES['appjson']['error'] == UPLOAD_ERR_OK) {
            $json_ext = strtolower(pathinfo($_FILES['appjson']['name'], PATHINFO_EXTENSION));
            if ($json_ext !== 's-found2') {
                echo "Error: Only .s-found2 files are allowed.";
                exit;
            }
            $json_file = $_FILES['appjson']['tmp_name'];
            $appjson = file_get_contents($json_file);
            json_decode($appjson);
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo "Error: Invalid JSON file.";
                exit;
            }
            if(str_contains($appjson,"cookie")){
                echo '<p style="color:red;">Error: sorry, your s-found2 file contains the word "cookie" we don\'t. accept that, remove any string containing such a word</p>';
                exit;
            }
        
        } else {
            $appjson = $app['appjson']; // Keep existing appjson if no new file uploaded
        }

        // Update app in database
        $stmt = $db->prepare('UPDATE appstable SET appname = :appname, appdescription = :appdescription, appjson = :appjson, costdollars = :costdollars, costcents = :costcents, screenshots = :screenshots, paymenttypeisuserdecide = :paymenttype WHERE appid = :appid');
        $stmt->bindValue(':appname', $appname, SQLITE3_TEXT);
        $stmt->bindValue(':appdescription', $appdescription, SQLITE3_TEXT);
        $stmt->bindValue(':appjson', $appjson, SQLITE3_TEXT);
        $stmt->bindValue(':costdollars', $costdollars, SQLITE3_TEXT);
        $stmt->bindValue(':costcents', $costcents, SQLITE3_TEXT);
        $stmt->bindValue(':screenshots', $screenshots_str, SQLITE3_TEXT);
        $stmt->bindValue(':paymenttype', $paymenttype, SQLITE3_TEXT);
        $stmt->bindValue(':appid', $appid, SQLITE3_INTEGER);
        $result = $stmt->execute();

        if ($result) {
            header("Location: https://amjp.psy-k.org/s-found2/list_apps.php");
            exit;
        } else {
            echo "Error updating app: " . htmlspecialchars($db->lastErrorMsg());
        }
        $db->close();
        exit;
    }

    // Display edit form
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Edit App - <?php echo htmlspecialchars($app['appname']); ?></title>
    </head>
    <body>
        <h1>Edit App: <?php echo htmlspecialchars($app['appname']); ?></h1>
        <form action="" method="post" enctype="multipart/form-data">
            <input type="hidden" name="appid" value="<?php echo htmlspecialchars($app['appid']); ?>">

            <label for="appname">App Name:</label><br>
            <input type="text" id="appname" name="appname" value="<?php echo htmlspecialchars($app['appname']); ?>" required><br><br>

            <label for="appdescription">App Description:</label><br>
            <textarea id="appdescription" name="appdescription" required><?php echo htmlspecialchars($app['appdescription']); ?></textarea><br><br>

            <label for="costdollars">Cost (Dollars):</label><br>
            <input type="text" id="costdollars" name="costdollars" value="<?php echo htmlspecialchars($app['costdollars']); ?>" required><br><br>

            <label for="costcents">Cost (Cents):</label><br>
            <input type="text" id="costcents" name="costcents" value="<?php echo htmlspecialchars($app['costcents']); ?>" required><br><br>

            <label>Payment Type is User Decide:</label><br>
            <input type="radio" name="paymenttype" value="true" <?php echo $app['paymenttypeisuserdecide'] == 'true' ? 'checked' : ''; ?>> Yes
            <input type="radio" name="paymenttype" value="false" <?php echo $app['paymenttypeisuserdecide'] == 'false' ? 'checked' : ''; ?>> No<br><br>

            <?php if (!empty($app['screenshots'])): ?>
                <h3>Existing Screenshots:</h3>
                <?php
                $screenshots = explode(',', $app['screenshots']);
                foreach ($screenshots as $index => $screenshot):
                ?>
                    <img src="<?php echo htmlspecialchars($screenshot); ?>" alt="Screenshot" style="width:100px; height:100px;">
                    <input type="checkbox" name="remove_screenshots[]" value="<?php echo $index; ?>"> Remove<br>
                <?php endforeach; ?>
                <br>
            <?php endif; ?>

            <label for="new_screenshots">Upload New Screenshots:</label><br>
            <input type="file" id="new_screenshots" name="new_screenshots[]" multiple accept="image/*"><br><br>

            <label for="appjson">Update App JSON File (optional):</label><br>
            <input type="file" id="appjson" name="appjson" accept=".s-found2"><br><br>

            <input type="submit" value="Update App" style="padding:5px 10px; background-color:#4CAF50; color:white; border:none; cursor:pointer;">
        </form>

        <!-- Delete App Form -->
        <form action="" method="post" onsubmit="return confirm('Are you sure you want to delete this app permanently?');">
            <input type="hidden" name="appid" value="<?php echo htmlspecialchars($app['appid']); ?>">
            <input type="hidden" name="delete" value="1">
            <input type="submit" value="Delete App" style="padding:5px 10px; background-color:#f44336; color:white; border:none; cursor:pointer;">
        </form>

        <p><a href="list_apps.php">Back to list</a></p>
    </body>
    </html>
    <?php
} else {
    echo "No app ID provided.";
}

$db->close();
?>