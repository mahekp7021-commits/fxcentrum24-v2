<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';

if (adminLoggedIn()) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim((string)($_POST['email'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    if ($email === '' || $password === '') {
        $error = 'Enter your email and password.';
    } else {
        try {
            $stmt = db()->prepare('SELECT id, email, password_hash FROM admin_users WHERE email = :email LIMIT 1');
            $stmt->execute([':email' => $email]);
            $admin = $stmt->fetch();
            if ($admin && password_verify($password, $admin['password_hash'])) {
                session_regenerate_id(true);
                $_SESSION['admin_id'] = (int)$admin['id'];
                $_SESSION['admin_email'] = $admin['email'];
                $_SESSION['last_activity'] = time();
                header('Location: index.php');
                exit;
            }
            $error = 'Invalid email or password.';
        } catch (Throwable $e) {
            error_log('GO COIIN admin login error: ' . $e->getMessage());
            $error = 'Admin database is not configured yet.';
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Login | GO COIIN</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#06111f;color:#fff;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.card{width:min(420px,calc(100% - 32px));padding:34px;border:1px solid rgba(120,180,220,.18);border-radius:20px;background:linear-gradient(145deg,#0b2034,#071725);box-shadow:0 24px 70px rgba(0,0,0,.35)}.brand{font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:8px}.brand strong{color:#ff3154}.muted{color:#8fa5ba;font-size:13px;line-height:1.6;margin:0 0 24px}.field{display:grid;gap:8px;margin-bottom:16px}.field label{font-size:12px;font-weight:700}.field input{width:100%;padding:13px 14px;border:1px solid rgba(120,180,220,.2);border-radius:9px;background:#061421;color:#fff;outline:none}.field input:focus{border-color:#00a8ff;box-shadow:0 0 0 3px rgba(0,168,255,.08)}button{width:100%;min-height:48px;border:0;border-radius:8px;background:linear-gradient(135deg,#ff3154,#ff4766);color:#fff;font-weight:800;cursor:pointer}.error{margin:0 0 16px;padding:11px 12px;border-radius:8px;background:rgba(255,49,84,.1);border:1px solid rgba(255,49,84,.25);color:#ff9bad;font-size:12px}
</style>
</head>
<body><main class="card"><div class="brand"><strong>GO</strong> COIIN</div><p class="muted">Secure administration panel for account applications.</p><?php if ($error): ?><p class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?><form method="post" autocomplete="on"><div class="field"><label for="email">Admin Email</label><input id="email" name="email" type="email" autocomplete="username" required></div><div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required></div><button type="submit">Sign in to Admin Panel</button></form></main></body></html>