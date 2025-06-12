<?php
// Define database connection values
$host = 'controle-rondement-db.mysql.database.azure.com';
$db   = 'task_manager';
$user = 'majd007';
$pass = 'vicomteA10!';
$port = 3306;
$caCertPath = __DIR__ . '/DigiCertGlobalRootCA.crt.pem';

// DSN with SSL
$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4;sslmode=VERIFY_CA;sslca=$caCertPath";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::MYSQL_ATTR_SSL_CA       => $caCertPath,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}
?>
