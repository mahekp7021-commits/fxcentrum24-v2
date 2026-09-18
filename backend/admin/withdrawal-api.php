<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
requireAdmin();

function ensureWithdrawalTable(): void {
    db()->exec("CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        withdrawal_ref VARCHAR(24) NOT NULL,
        account_name VARCHAR(150) NOT NULL,
        account_phone VARCHAR(50) NOT NULL,
        account_login VARCHAR(190) NOT NULL,
        email VARCHAR(190) NULL,
        sending_currency VARCHAR(10) NOT NULL,
        amount DECIMAL(18,2) NOT NULL,
        amount_words VARCHAR(255) NULL,
        beneficiary_name VARCHAR(150) NOT NULL,
        beneficiary_bank_country VARCHAR(120) NOT NULL,
        bank_account_number VARCHAR(100) NOT NULL,
        ifsc_sort_code VARCHAR(100) NOT NULL,
        status ENUM('New','Processing','Completed','Rejected') NOT NULL DEFAULT 'New',
        admin_notes TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_withdrawal_ref (withdrawal_ref),
        KEY idx_withdrawal_status (status),
        KEY idx_withdrawal_created_at (created_at),
        KEY idx_withdrawal_login (account_login),
        KEY idx_withdrawal_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}
ensureWithdrawalTable();

if (!empty($_SESSION['last_activity']) && time() - (int)$_SESSION['last_activity'] > 1800) {
    session_unset();
    session_destroy();
    jsonResponse(['ok' => false, 'message' => 'Session expired.'], 401);
}
$_SESSION['last_activity'] = time();

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'list';
        if ($action === 'stats') {
            $stats = db()->query("SELECT
                COUNT(*) AS total,
                SUM(status = 'New') AS new_count,
                SUM(status = 'Processing') AS processing_count,
                SUM(status = 'Completed') AS completed_count,
                SUM(status = 'Rejected') AS rejected_count
                FROM withdrawal_requests")->fetch();
            jsonResponse(['ok' => true, 'stats' => $stats]);
        }

        $status = trim((string)($_GET['status'] ?? ''));
        $search = trim((string)($_GET['search'] ?? ''));
        $limit = min(100, max(10, (int)($_GET['limit'] ?? 50)));
        $offset = max(0, (int)($_GET['offset'] ?? 0));
        $where = [];
        $params = [];

        if ($status !== '' && in_array($status, ['New','Processing','Completed','Rejected'], true)) {
            $where[] = 'status = :status';
            $params[':status'] = $status;
        }
        if ($search !== '') {
            $where[] = '(withdrawal_ref LIKE :search OR account_name LIKE :search OR account_phone LIKE :search OR account_login LIKE :search OR email LIKE :search OR beneficiary_name LIKE :search OR beneficiary_bank_country LIKE :search)';
            $params[':search'] = '%' . $search . '%';
        }

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $countStmt = db()->prepare("SELECT COUNT(*) FROM withdrawal_requests $whereSql");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $stmt = db()->prepare("SELECT id, withdrawal_ref, account_name, account_phone, account_login, email, sending_currency, amount, amount_words, beneficiary_name, beneficiary_bank_country, bank_account_number, ifsc_sort_code, status, admin_notes, created_at, updated_at
            FROM withdrawal_requests $whereSql ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
        $stmt->execute($params);

        jsonResponse(['ok' => true, 'total' => $total, 'withdrawals' => $stmt->fetchAll()]);
    }

    if ($method === 'PATCH') {
        $payload = json_decode(file_get_contents('php://input') ?: '', true);
        if (!is_array($payload)) jsonResponse(['ok' => false, 'message' => 'Invalid request.'], 400);

        $id = (int)($payload['id'] ?? 0);
        $status = trim((string)($payload['status'] ?? ''));
        $notes = trim((string)($payload['adminNotes'] ?? ''));

        if ($id < 1) jsonResponse(['ok' => false, 'message' => 'Invalid withdrawal request.'], 422);
        if (!in_array($status, ['New','Processing','Completed','Rejected'], true)) jsonResponse(['ok' => false, 'message' => 'Invalid status.'], 422);
        if (mb_strlen($notes) > 10000) jsonResponse(['ok' => false, 'message' => 'Notes are too long.'], 422);

        $stmt = db()->prepare('UPDATE withdrawal_requests SET status = :status, admin_notes = :notes WHERE id = :id');
        $stmt->execute([':status' => $status, ':notes' => $notes !== '' ? $notes : null, ':id' => $id]);
        jsonResponse(['ok' => true, 'message' => 'Withdrawal request updated.']);
    }

    jsonResponse(['ok' => false, 'message' => 'Method not allowed.'], 405);
} catch (Throwable $e) {
    error_log('GO COIIN withdrawal admin API error: ' . $e->getMessage());
    jsonResponse(['ok' => false, 'message' => 'Server error.'], 500);
}
