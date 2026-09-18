<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['ok' => false, 'message' => 'Method not allowed.'], 405);

try {
    $payload = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($payload)) jsonResponse(['ok' => false, 'message' => 'Invalid request.'], 400);

    $id = (int)($payload['withdrawalId'] ?? 0);
    $subject = trim((string)($payload['subject'] ?? ''));
    $message = trim((string)($payload['message'] ?? ''));

    if ($id < 1) jsonResponse(['ok' => false, 'message' => 'Invalid withdrawal request.'], 422);
    if ($subject === '' || mb_strlen($subject) > 180) jsonResponse(['ok' => false, 'message' => 'Subject is required.'], 422);
    if ($message === '' || mb_strlen($message) > 12000) jsonResponse(['ok' => false, 'message' => 'Message is required.'], 422);

    $stmt = db()->prepare('SELECT email, withdrawal_ref FROM withdrawal_requests WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) jsonResponse(['ok' => false, 'message' => 'Withdrawal request not found.'], 404);
    if (!$row['email'] || !filter_var($row['email'], FILTER_VALIDATE_EMAIL)) jsonResponse(['ok' => false, 'message' => 'This withdrawal request has no valid email address.'], 422);
    if (!defined('ADMIN_EMAIL') || !filter_var(ADMIN_EMAIL, FILTER_VALIDATE_EMAIL)) jsonResponse(['ok' => false, 'message' => 'Admin email is not configured.'], 500);

    $safeSubject = str_replace(["","
"], ' ', $subject);
    $headers = "MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
From: " . ADMIN_EMAIL . "
Reply-To: " . ADMIN_EMAIL . "
X-Mailer: GO COIIN Admin Panel";
    $sent = mail($row['email'], $safeSubject, $message, $headers);
    if (!$sent) jsonResponse(['ok' => false, 'message' => 'The server could not hand the email to the mail service. Please verify the Hostinger mailbox/mail settings.'], 502);

    jsonResponse(['ok' => true, 'message' => 'Email sent to ' . $row['email'] . '.', 'withdrawalRef' => $row['withdrawal_ref']], 200);
} catch (Throwable $e) {
    error_log('GO COIIN withdrawal email error: ' . $e->getMessage());
    jsonResponse(['ok' => false, 'message' => 'Server error while sending email.'], 500);
}
