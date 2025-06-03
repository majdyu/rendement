<?php
session_start();

// Hardcoded credentials
$users = [
    'admin' => [
        'password' => 'admin123',
        'role' => 'admin'
    ],
    'assistant' => [
        'password' => 'assistant456',
        'role' => 'assistant'
    ]
];

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (isset($users[$username]) && $users[$username]['password'] === $password) {
    $_SESSION['user'] = $username;
    $_SESSION['role'] = $users[$username]['role'];
    if ($users[$username]['role'] === 'admin') {
        header('Location: admin.php');
    } else {
        header('Location: assistant.php');
    }
    exit();
} else {
    $_SESSION['error'] = 'Nom d’utilisateur ou mot de passe incorrect.';
    header('Location: index.php');
    exit();
}
?>