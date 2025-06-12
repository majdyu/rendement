<?php
// Define database connection values
$host = 'controle-rondement-db.mysql.database.azure.com';
$username = 'majd007';
$password = 'vicomteA10!'; // Replace with your actual password
$database = 'task_manager';
$port = 3306;
$caCertPath = __DIR__ . '/DigiCertGlobalRootCA.crt.pem'; // Path to CA certificate

// Initialize MySQLi connection
$conn = mysqli_init();

// Set SSL options
mysqli_ssl_set($conn, null, null, $caCertPath, null, null);

// Establish secure connection
if (!mysqli_real_connect($conn, $host, $username, $password, $database, $port, null, MYSQLI_CLIENT_SSL)) {
    http_response_code(500);
    die("Secure connection failed: " . mysqli_connect_error());
}

// Set character set to UTF-8
mysqli_set_charset($conn, "utf8");

// Store connection globally
$GLOBALS['conn'] = $conn;

// Optional: Comment out this line in production
// echo "Connected successfully via SSL.";
?>
