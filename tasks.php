<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
header('Access-Control-Allow-Origin: *'); // Allow CORS for testing (remove in production)
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

// Log the incoming request to diagnose 404
$requestData = file_get_contents('php://input');
error_log("Received request - Method: " . $_SERVER['REQUEST_METHOD'] . " URL: " . $_SERVER['REQUEST_URI'] . " Data: " . $requestData);

if (!isset($pdo)) {
    error_log('PDO is not set!');
    http_response_code(500);
    echo json_encode(['error' => 'PDO connection not initialized.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM tasks ORDER BY date ASC");
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($tasks);
        } catch (Exception $e) {
            error_log("GET Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode($requestData, true);
            error_log("POST Data: " . print_r($data, true));

            $id = isset($data['id']) && !empty($data['id']) ? (int)$data['id'] : null;
            $date = $data['date'];
            $ouvrier = $data['ouvrier'];
            $tache = $data['tache'];
            $estimee = (float)$data['estimee'];
            $reelle = (float)$data['reelle'];
            $commentaire = $data['commentaire'] ?? '';
            $termine = isset($data['termine']) ? (int)((bool)$data['termine']) : 0;



            if (!$date || !$ouvrier || !$tache || !$estimee || !$reelle) {
                throw new Exception("Données incomplètes");
            }

            if ($id) {
                if (isset($_SESSION['role']) && $_SESSION['role'] === 'assistant') {
                    $stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = ?");
                    $stmt->execute([$id]);
                    $existingTask = $stmt->fetch(PDO::FETCH_ASSOC);
                    if (!$existingTask) {
                        throw new Exception("Tâche non trouvée");
                    }
                    if ($date !== $existingTask['date'] || $ouvrier !== $existingTask['ouvrier'] || 
                        $tache !== $existingTask['tache'] || $estimee != $existingTask['estimee'] || 
                        $termine !== (bool)$existingTask['termine']) {
                        throw new Exception("Modification non autorisée des champs restreints");
                    }
                    $stmt = $pdo->prepare("UPDATE tasks SET reelle = ?, commentaire = ? WHERE id = ?");
                    $stmt->execute([$reelle, $commentaire, $id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE tasks SET date = ?, ouvrier = ?, tache = ?, estimee = ?, reelle = ?, commentaire = ?, termine = ? WHERE id = ?");
                    $stmt->execute([$date, $ouvrier, $tache, $estimee, $reelle, $commentaire, $termine, $id]);
                }
            } else {
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM tasks WHERE date = ?");
                $stmt->execute([$date]);
                $numero = $stmt->fetchColumn() + 1;

                $stmt = $pdo->prepare("INSERT INTO tasks (date, ouvrier, tache, numero, estimee, reelle, commentaire, termine) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$date, $ouvrier, $tache, $numero, $estimee, $reelle, $commentaire, $termine]);
                $data['id'] = $pdo->lastInsertId();
                $data['numero'] = $numero;
            }
            echo json_encode($data);
        } catch (Exception $e) {
            error_log("POST Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
    try {
        $data = json_decode($requestData, true);
        $id = (int)$data['id'];
        $termine = isset($data['termine']) ? (int)((bool)$data['termine']) : 0;
        $stmt = $pdo->prepare("UPDATE tasks SET termine = ? WHERE id = ?");
        $stmt->execute([$termine, $id]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        error_log("PUT Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    break;

    case 'DELETE':
        try {
            if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Accès interdit']);
                exit();
            }
            $data = json_decode($requestData, true);
            $id = (int)$data['id'];
            $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("DELETE Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Méthode non autorisée']);
}
?>