<?php
    $db = new SQLite3('test.sqlite');
    $stmt = $db->prepare('SELECT * FROM users');
    $result = $stmt->execute();
    while ($row = $result->fetchArray()) {
      var_dump($row);
    }    
?>