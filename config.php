<?php
$host = 'controle-rondement-db.mysql.database.azure.com';
$dbname = 'task_manager';
$username = 'majd007'; // Remplacez par votre utilisateur MySQL
$password = 'vicomteA10!'; // Remplacez par votre mot de passe MySQL

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>