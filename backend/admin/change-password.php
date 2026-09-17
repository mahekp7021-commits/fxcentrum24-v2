<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
requireAdmin();

$message = '';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $current = (string)($_POST['current'] ?? '');
    $new = (string)($_POST['new'] ?? '');
    $confirm = (string)($_POST['confirm'] ?? '');
    try {
        $stmt = db()->prepare('SELECT password_hash FROM admin_users WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => (int)$_SESSION['admin_id']]);
        $row = $stmt->fetch();
        if (!$row || !password_verify($current, $row['password_hash'])) $error = 'Current password is incorrect.';
        elseif (strlen($new) < 12) $error = 'New password must be at least 12 characters.';
        elseif ($new !== $confirm) $error = 'New passwords do not match.';
        else {
            $hash = password_hash($new, PASSWORD_DEFAULT);
            $update = db()->prepare('UPDATE admin_users SET password_hash = :hash WHERE id = :id');
            $update->execute([':hash' => $hash, ':id' => (int)$_SESSION['admin_id']]);
            $message = 'Password changed successfully.';
        }
    } catch (Throwable $e) {
        error_log('GO COIIN password change error: ' . $e->getMessage());
        $error = 'Unable to change password right now.';
    }
}
?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Change Password | GO COIIN</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#06111f;color:#fff;font-family:Inter,system-ui,sans-serif}.card{width:min(440px,calc(100% - 32px));padding:30px;border:1px solid rgba(120,180,220,.18);border-radius:18px;background:#0a1b2d}.field{display:grid;gap:7px;margin:14px 0}.field label{font-size:12px;font-weight:700}.field input{padding:12px;border:1px solid rgba(120,180,220,.2);border-radius:8px;background:#061421;color:#fff}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 15px;border:0;border-radius:8px;background:#ff3154;color:#fff;font-weight:800;cursor:pointer;text-decoration:none}.msg{color:#9fe6b5;font-size:12px}.err{color:#ff9bad;font-size:12px}h1{margin:0 0 8px}.muted{color:#8fa5ba;font-size:12px}</style></head><body><main class="card"><h1>Change Password</h1><p class="muted">Update the GO COIIN admin password. Use at least 12 characters.</p><?php if($message):?><p class="msg"><?=htmlspecialchars($message,ENT_QUOTES,'UTF-8')?></p><?php endif;?><?php if($error):?><p class="err"><?=htmlspecialchars($error,ENT_QUOTES,'UTF-8')?></p><?php endif;?><form method="post"><div class="field"><label>Current password</label><input type="password" name="current" required></div><div class="field"><label>New password</label><input type="password" name="new" minlength="12" required></div><div class="field"><label>Confirm new password</label><input type="password" name="confirm" minlength="12" required></div><button class="btn" type="submit">Change Password</button> <a class="btn" style="background:#10283b" href="index.php">Back</a></form></main></body></html>