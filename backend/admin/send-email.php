<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['ok' => false, 'message' => 'Method not allowed.'], 405);
}

function smtpRead($socket): string
{
    $response = '';
    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') {
            break;
        }
    }
    return $response;
}

function smtpCode(string $response): int
{
    return (int)substr(trim($response), 0, 3);
}

function smtpExpect($socket, array $codes, string $step): void
{
    $response = smtpRead($socket);
    $code = smtpCode($response);
    if (!in_array($code, $codes, true)) {
        throw new RuntimeException($step . ' failed. SMTP response: ' . trim($response));
    }
}

function smtpCommand($socket, string $command, array $codes, string $step): void
{
    fwrite($socket, $command . "\r\n");
    smtpExpect($socket, $codes, $step);
}

function sendViaHostingerSmtp(
    string $recipient,
    string $subject,
    string $textBody,
    string $fromEmail
): void {
    if (!defined('MAIL_SMTP_HOST') || !defined('MAIL_SMTP_PORT') ||
        !defined('MAIL_SMTP_USER') || !defined('MAIL_SMTP_PASSWORD') ||
        !defined('MAIL_FROM')) {
        throw new RuntimeException('SMTP configuration is missing.');
    }

    if (MAIL_SMTP_PASSWORD === '' || MAIL_SMTP_PASSWORD === 'YOUR_HOSTINGER_MAILBOX_PASSWORD') {
        throw new RuntimeException('Hostinger SMTP password is not configured.');
    }

    $safeRecipient = str_replace(["\r", "\n"], '', $recipient);
    $safeSubject = str_replace(["\r", "\n"], ' ', $subject);
    $safeFrom = str_replace(["\r", "\n"], '', $fromEmail);

    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false,
            'peer_name' => MAIL_SMTP_HOST,
        ],
    ]);

    $socket = @stream_socket_client(
        'ssl://' . MAIL_SMTP_HOST . ':' . MAIL_SMTP_PORT,
        $errno,
        $errstr,
        20,
        STREAM_CLIENT_CONNECT,
        $context
    );

    if (!$socket) {
        throw new RuntimeException('Could not connect to Hostinger SMTP: ' . $errstr . ' (' . $errno . ')');
    }

    stream_set_timeout($socket, 20);

    try {
        smtpExpect($socket, [220], 'SMTP connection');

        $hostname = $_SERVER['HTTP_HOST'] ?? 'gocoiin.com';
        $hostname = preg_replace('/[^A-Za-z0-9.-]/', '', $hostname) ?: 'gocoiin.com';
        smtpCommand($socket, 'EHLO ' . $hostname, [250], 'EHLO');

        smtpCommand($socket, 'AUTH LOGIN', [334], 'SMTP authentication');
        smtpCommand($socket, base64_encode(MAIL_SMTP_USER), [334], 'SMTP username');
        smtpCommand($socket, base64_encode(MAIL_SMTP_PASSWORD), [235], 'SMTP password');

        smtpCommand($socket, 'MAIL FROM:<' . $safeFrom . '>', [250], 'MAIL FROM');
        smtpCommand($socket, 'RCPT TO:<' . $safeRecipient . '>', [250, 251], 'RCPT TO');

        $body = preg_replace("/\r\n|\r|\n/", "\r\n", $textBody) ?? $textBody;
        $bodyLines = explode("\r\n", $body);
        $bodyLines = array_map(
            static fn(string $line): string => str_starts_with($line, '.') ? '.' . $line : $line,
            $bodyLines
        );
        $body = implode("\r\n", $bodyLines);

        $headers = [
            'From: GO COIIN <' . $safeFrom . '>',
            'Reply-To: ' . $safeFrom,
            'To: ' . $safeRecipient,
            'Subject: ' . $safeSubject,
            'Date: ' . date(DATE_RFC2822),
            'Message-ID: <' . bin2hex(random_bytes(12)) . '@gocoiin.com>',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            'X-Mailer: GO COIIN Admin Panel',
        ];

        fwrite($socket, "DATA\r\n");
        smtpExpect($socket, [354], 'DATA');

        fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.\r\n");
        smtpExpect($socket, [250], 'Message delivery');

        smtpCommand($socket, 'QUIT', [221], 'SMTP QUIT');
    } finally {
        fclose($socket);
    }
}

try {
    $payload = json_decode(file_get_contents('php://input') ?: '', true);

    if (!is_array($payload)) {
        jsonResponse(['ok' => false, 'message' => 'Invalid request.'], 400);
    }

    $applicationId = (int)($payload['applicationId'] ?? 0);
    $recipient = trim((string)($payload['recipient'] ?? ''));
    $subject = trim((string)($payload['subject'] ?? ''));
    $message = trim((string)($payload['message'] ?? ''));

    if ($applicationId < 1) {
        jsonResponse(['ok' => false, 'message' => 'Invalid application.'], 422);
    }

    if ($recipient === '' || !filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['ok' => false, 'message' => 'A valid recipient email is required.'], 422);
    }

    if ($subject === '' || mb_strlen($subject) > 180) {
        jsonResponse(['ok' => false, 'message' => 'Subject is required and must be 180 characters or fewer.'], 422);
    }

    if ($message === '' || mb_strlen($message) > 12000) {
        jsonResponse(['ok' => false, 'message' => 'Message is required and must be 12,000 characters or fewer.'], 422);
    }

    if (!defined('MAIL_FROM') || !filter_var(MAIL_FROM, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['ok' => false, 'message' => 'Mail sender is not configured.'], 500);
    }

    $stmt = db()->prepare(
        'SELECT id, first_name, last_name, email, application_ref
         FROM account_applications
         WHERE id = :id
         LIMIT 1'
    );
    $stmt->execute([':id' => $applicationId]);
    $application = $stmt->fetch();

    if (!$application) {
        jsonResponse(['ok' => false, 'message' => 'Application not found.'], 404);
    }

    $safeRecipient = str_replace(["\r", "\n"], '', $recipient);
    $safeSubject = str_replace(["\r", "\n"], ' ', $subject);

    sendViaHostingerSmtp($safeRecipient, $safeSubject, $message, MAIL_FROM);

    db()->exec(
        "CREATE TABLE IF NOT EXISTS email_logs (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $log = db()->prepare(
        'INSERT INTO email_logs
         (application_id, recipient_email, subject, message, sent_ok)
         VALUES (:application_id, :recipient, :subject, :message, 1)'
    );
    $log->execute([
        ':application_id' => $applicationId,
        ':recipient' => $safeRecipient,
        ':subject' => $safeSubject,
        ':message' => $message,
    ]);

    jsonResponse([
        'ok' => true,
        'message' => 'Email sent successfully to ' . $safeRecipient . '.',
        'recipient' => $safeRecipient,
        'applicationRef' => $application['application_ref']
    ]);
} catch (Throwable $e) {
    error_log('GO COIIN SMTP email error: ' . $e->getMessage());

    try {
        if (isset($applicationId, $recipient, $subject, $message) && $applicationId > 0 && $recipient !== '') {
            db()->exec(
                "CREATE TABLE IF NOT EXISTS email_logs (
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
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
            );
            $log = db()->prepare(
                'INSERT INTO email_logs
                 (application_id, recipient_email, subject, message, sent_ok)
                 VALUES (:application_id, :recipient, :subject, :message, 0)'
            );
            $log->execute([
                ':application_id' => $applicationId,
                ':recipient' => str_replace(["\r", "\n"], '', $recipient),
                ':subject' => str_replace(["\r", "\n"], ' ', $subject),
                ':message' => $message,
            ]);
        }
    } catch (Throwable $logError) {
        error_log('GO COIIN email log error: ' . $logError->getMessage());
    }

    jsonResponse([
        'ok' => false,
        'message' => 'Email could not be sent. Check the Hostinger SMTP configuration and mailbox password.'
    ], 502);
}
