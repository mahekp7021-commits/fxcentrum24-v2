<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
requireAdmin();

if (!empty($_SESSION['last_activity']) && time() - (int)$_SESSION['last_activity'] > 1800) {
    session_unset();
    session_destroy();
    jsonResponse(['ok' => false, 'message' => 'Session expired.'], 401);
}
$_SESSION['last_activity'] = time();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'list';
        if ($action === 'stats') {
            $stats = db()->query("SELECT
                COUNT(*) AS total,
                SUM(status = 'New') AS new_count,
                SUM(status = 'Contacted') AS contacted_count,
                SUM(status = 'Verified') AS verified_count,
                SUM(status = 'Approved') AS approved_count,
                SUM(status = 'Rejected') AS rejected_count
                FROM account_applications")->fetch();
            jsonResponse(['ok' => true, 'stats' => $stats]);
        }

        $status = trim((string)($_GET['status'] ?? ''));
        $search = trim((string)($_GET['search'] ?? ''));
        $limit = min(100, max(10, (int)($_GET['limit'] ?? 50)));
        $offset = max(0, (int)($_GET['offset'] ?? 0));

        $where = [];
        $params = [];
        if ($status !== '' && in_array($status, ['New','Contacted','Verified','Approved','Rejected'], true)) {
            $where[] = 'status = :status';
            $params[':status'] = $status;
        }
        if ($search !== '') {
            $where[] = '(application_ref LIKE :search OR first_name LIKE :search OR last_name LIKE :search OR email LIKE :search OR phone LIKE :search OR country LIKE :search)';
            $params[':search'] = '%' . $search . '%';
        }
        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $countStmt = db()->prepare("SELECT COUNT(*) FROM account_applications $whereSql");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $sql = "SELECT id, application_ref, first_name, last_name, email, phone, country, account_type, message, risk_acknowledged, status, admin_notes, created_at, updated_at
                FROM account_applications $whereSql ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        jsonResponse(['ok' => true, 'total' => $total, 'applications' => $stmt->fetchAll()]);
    }

    if ($method === 'PATCH') {
        $payload = json_decode(file_get_contents('php://input') ?: '', true);
        if (!is_array($payload)) jsonResponse(['ok' => false, 'message' => 'Invalid request.'], 400);

        $id = (int)($payload['id'] ?? 0);
        $status = trim((string)($payload['status'] ?? ''));
        $notes = trim((string)($payload['adminNotes'] ?? ''));
        if ($id < 1) jsonResponse(['ok' => false, 'message' => 'Invalid application.'], 422);
        if (!in_array($status, ['New','Contacted','Verified','Approved','Rejected'], true)) {
            jsonResponse(['ok' => false, 'message' => 'Invalid status.'], 422);
        }
        if (mb_strlen($notes) > 10000) jsonResponse(['ok' => false, 'message' => 'Notes are too long.'], 422);

        $stmt = db()->prepare('UPDATE account_applications SET status = :status, admin_notes = :notes WHERE id = :id');
        $stmt->execute([':status' => $status, ':notes' => $notes !== '' ? $notes : null, ':id' => $id]);
        jsonResponse(['ok' => true, 'message' => 'Application updated.']);
    }

    jsonResponse(['ok' => false, 'message' => 'Method not allowed.'], 405);
} catch (Throwable $e) {
    error_log('GO COIIN admin API error: ' . $e->getMessage());
    jsonResponse(['ok' => false, 'message' => 'Server error.'], 500);
}
