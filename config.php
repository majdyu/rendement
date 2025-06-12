<?php
$host = 'controle-rondement-db.mysql.database.azure.com';
$dbname = 'task_manager';
$username = 'majd007';
$password = 'vicomteA10!';

$options = [
    PDO::MYSQL_ATTR_SSL_CA => __DIR__ . '/DigiCertGlobalRootCA.crt.pem',
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, $options);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>
