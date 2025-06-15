<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="logo.png" type="image/png">
    <title>Connexion - Controleur de Rendement</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="login-container">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="logo.png" alt="Logo" style="max-width: 120px; height: auto;">
        </div>

        <h2>Connexion</h2>

        <?php
        session_start();
        if (isset($_SESSION['error'])) {
            echo '<p class="error">' . htmlspecialchars($_SESSION['error']) . '</p>';
            unset($_SESSION['error']);
        }
        ?>

        <form method="POST" action="login.php">
            <label for="username">Nom d'utilisateur:</label>
            <input type="text" id="username" name="username" required>
            <label for="password">Mot de passe:</label>
            <input type="password" id="password" name="password" required>
            <button type="submit">Se connecter</button>
        </form>
    </div>
</body>
</html>
