<?php
// Define database connection values
$host = 'controle-rondement-db.mysql.database.azure.com';
$username = 'majd007';
$password = 'vicomteA10!'; // Replace with your secure password
$database = 'task_manager';
$port = 3306;

// Path to Azure's CA certificate (Download it from Azure portal if needed)
$caCertPath = __DIR__ . '/BaltimoreCyberTrustRoot.crt.pem'; // Make sure the file exists here

// Initialize MySQLi
$conn = mysqli_init();

// Configure SSL
mysqli_ssl_set($conn, NULL, NULL, $caCertPath, NULL, NULL);

// Establish secure connection
if (!mysqli_real_connect($conn, $host, $username, $password, $database, $port, NULL, MYSQLI_CLIENT_SSL)) {
    die("Connection failed: " . mysqli_connect_error());
}

// Optional: Set charset
mysqli_set_charset($conn, "utf8");

// Optional: Make it globally accessible
$GLOBALS['conn'] = $conn;

// Connection success message (can be removed in production)
echo "Connected successfully via SSL.";
?>
