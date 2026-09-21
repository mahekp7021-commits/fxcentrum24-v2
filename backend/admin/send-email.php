<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['ok' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $payload = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($payload)) {
        jsonResponse(['ok' => false, 'message' => 'Invalid request.'], 400);
    }

    $applicationId = (int)($payload['applicationId'] ?? 0);
    $subject = trim((string)($payload['subject'] ?? ''));
    $message = trim((string)($payload['message'] ?? ''));
    $recipient = trim((string)($payload['recipient'] ?? ''));

    if ($applicationId < 1) {
        jsonResponse(['ok' => false, 'message' => 'Invalid application.'], 422);
    }
    if ($subject === '' || mb_strlen($subject) > 180) {
        jsonResponse(['ok' => false, 'message' => 'Subject is required and must be 180 characters or fewer.'], 422);
    }
    if ($message === '' || mb_strlen($message) > 12000) {
        jsonResponse(['ok' => false, 'message' => 'Message is required and must be 12,000 characters or fewer.'], 422);
    }
    if ($recipient === '' || !filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['ok' => false, 'message' => 'A valid recipient email is required.'], 422);
    }
    if (!defined('ADMIN_EMAIL') || !filter_var(ADMIN_EMAIL, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['ok' => false, 'message' => 'Admin email is not configured.'], 500);
    }

    $stmt = db()->prepare('SELECT id, first_name, last_name, email, application_ref FROM account_applications WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $applicationId]);
    $application = $stmt->fetch();
    if (!$application) {
        jsonResponse(['ok' => false, 'message' => 'Application not found.'], 404);
    }

    $safeSubject = str_replace(["\r", "\n"], ' ', $subject);
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: ' . ADMIN_EMAIL,
        'Reply-To: ' . ADMIN_EMAIL,
        'X-Mailer: GO COIIN Admin Panel'
    ];

    $sent = mail(
        $recipient,
        $safeSubject,
        $message,
        implode("\r\n", $headers)
    );

    // Keep a lightweight audit trail in the same database.
    db()->exec("CREATE TABLE IF NOT EXISTS email_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        application_id BIGINT UNSIGNED NOT NULL,
        recipient_email VARCHAR(190) NOT NULL,
        subject VARCHAR(180) NOT NULL,
        message TEXT NOT NULL,
        sent_ok TINYINT(1) NOT NULL DEFAULT 0,
        sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_email_logs_application (application_id),
        KEY idx_email_logs_sent_at (sent_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $log = db()->prepare('INSERT INTO email_logs (application_id, recipient_email, subject, message, sent_ok) VALUES (:application_id, :recipient, :subject, :message, :sent_ok)');
    $log->execute([
        ':application_id' => $applicationId,
        ':recipient' => $recipient,
        ':subject' => $safeSubject,
        ':message' => $message,
        ':sent_ok' => $sent ? 1 : 0,
    ]);

    if (!$sent) {
        jsonResponse(['ok' => false, 'message' => 'The server could not hand the email to the mail service. Please verify the Hostinger mailbox/mail settings.'], 502);
    }

    jsonResponse([
        'ok' => true,
        'message' => 'Email sent to ' . $recipient . '.',
        'recipient' => $application['email'],
        'applicationRef' => $application['application_ref']
    ], 200);
} catch (Throwable $e) {
    error_log('GO COIIN send email error: ' . $e->getMessage());
    jsonResponse(['ok' => false, 'message' => 'Server error while sending email.'], 500);
}
