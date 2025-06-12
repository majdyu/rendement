<?php
$host = 'controle-rondement-db.mysql.database.azure.com';
$username = 'majd007@controle-rondement-db'; // Include @servername for Azure MySQL
$password = '{your_password}'; // Replace with your actual MySQL password
$database = 'task_manager'; // Matches the database you created
$caCertPath = '/home/site/wwwroot/cert/DigiCertGlobalRootCA.crt.pem'; // Path in Azure App Service

// Initialize MySQLi
$conn = mysqli_init();

// Set SSL configuration
mysqli_ssl_set($conn, NULL, NULL, $caCertPath, NULL, NULL);

// Establish connection
mysqli_real_connect($conn, $host, $username, $password, $database, 3306, NULL, MYSQLI_CLIENT_SSL);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Connected successfully!";
}

// Optional: Set charset (if needed by your app)
mysqli_set_charset($conn, "utf8");

// Make $conn available globally (if your app requires it)
$GLOBALS['conn'] = $conn;
?>