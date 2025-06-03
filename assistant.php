<?php
session_start();
if (!isset($_SESSION['user']) || $_SESSION['role'] !== 'assistant') {
    header('Location: index.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suivi des Tâches - Assistant</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body data-role="assistant">
    <header>
        <h1>Suivi des Tâches - Assistant (<?php echo htmlspecialchars($_SESSION['user']); ?>)</h1>
        <a href="logout.php" class="logout-btn">Déconnexion</a>
    </header>
    <main>
        <section class="controls">
            <button id="addTaskBtn">➕ Ajouter une tâche</button>
            <button id="calcMonthlyBtn">📊 Calcul Rendement Mensuel</button>
            <select id="workerFilter">
                <option value="all">Tous</option>
            </select>
        </section>
        <section>
            <h2>Liste des tâches</h2>
            <table id="taskTable">
                <thead>
                    <tr>
                        <th>Terminé</th>
                        <th>Date</th>
                        <th>Ouvrier</th>
                        <th>N°</th>
                        <th>Tâche</th>
                        <th>Durée estimée</th>
                        <th>Durée réelle</th>
                        <th>Statut</th>
                        <th>Commentaire</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </section>
        <section>
            <h2>Récapitulatif</h2>
            <table id="summaryTable">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Ouvrier</th>
                        <th>Total</th>
                        <th>Terminé</th>
                        <th>Heures prévues</th>
                        <th>Heures réelles</th>
                        <th>% Rendement</th>
                        <th>% Efficacité</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </section>
    </main>

    <div id="taskModal" class="modal">
        <div class="modal-content">
            <span class="close">×</span>
            <h2>Ajouter/Modifier une tâche</h2>
            <form id="taskForm">
                <input type="hidden" name="id">
                <label>Date: <input type="date" name="date" required></label>
                <label>Ouvrier: <input type="text" name="ouvrier" required></label>
                <label>Tâche: <input type="text" name="tache" required></label>
                <label>Durée estimée (h): <input type="number" name="estimee" step="0.1" required></label>
                <label>Durée réelle (h): <input type="number" name="reelle" step="0.1" required></label>
                <label>Commentaire: <textarea name="commentaire"></textarea></label>
                <button type="submit">Enregistrer</button>
            </form>
        </div>
    </div>

    <div id="monthlyModal" class="modal">
        <div class="modal-content">
            <span id="monthlyClose" class="close">×</span>
            <h2>Rendement Mensuel</h2>
            <form id="monthlyForm">
                <label>Ouvrier: <input type="text" name="ouvrier" required></label>
                <label>Mois: <input type="month" name="mois" required></label>
                <button type="submit">Calculer</button>
            </form>
            <div id="result"></div>
        </div>
    </div>

    <div id="viewModal" class="modal">
        <div class="modal-content">
            <span class="close">×</span>
            <h2>Détails de la tâche</h2>
            <div id="viewDetails"></div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>