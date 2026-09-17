<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name('gocoiin_admin');
    session_set_cookie_params([
        'httponly' => true,
        'secure' => true,
        'samesite' => 'Strict',
        'path' => '/'
    ]);
    session_start();
}

function adminLoggedIn(): bool {
    return !empty($_SESSION['admin_id']);
}

function requireAdmin(): void {
    if (!adminLoggedIn()) {
        if (str_contains($_SERVER['REQUEST_URI'] ?? '', '/api.php')) {
            jsonResponse(['ok' => false, 'message' => 'Authentication required.'], 401);
        }
        header('Location: login.php');
        exit;
    }
}
