<!DOCTYPE html>
<html>

<head>
    <script>

        <?php
        if (isset($_POST["jsonapp"]) && !empty(trim($_POST["jsonapp"]))) {
            // Use json_encode to safely output the data as a JavaScript string
            echo "var data = " . json_encode(rtrim($_POST["jsonapp"])) . ";";
        } else {
            echo "var data = 'empty';";
        }
        ?>
        function afterLoading(){
            if(data=="empty") {
                alert("error, program is empty");
                return;
            }
            const iframe = document.getElementById("iframe");
            iframe.contentWindow.postMessage({ action: "RUN", data: data }, "https://sandbox.psy-k.org/s-found2.php");
        }
    </script>
    <title>full screen iframe</title>
    <style type="text/css">
        html {
            overflow: auto;
        }
        
        html,
        body,
        div,
        iframe {
            margin: 0px;
            padding: 0px;
            height: 100%;
            border: none;
        }
        
        iframe {
            display: block;
            width: 100%;
            border: none;
            overflow-y: auto;
            overflow-x: hidden;
        }
    </style>
</head>

<body>
    <iframe ID="iframe" onload="afterLoading()" src="https://sandbox.psy-k.org/s-found2.php"
            frameborder="0" 
            marginheight="0" 
            marginwidth="0" 
            width="100%" 
            height="100%" 
            scrolling="auto">
  </iframe>
</body>

</html>