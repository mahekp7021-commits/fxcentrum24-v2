<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['ok' => false, 'message' => 'Method not allowed.'], 405);
}
if (!requestOriginAllowed()) {
    jsonResponse(['ok' => false, 'message' => 'Origin not allowed.'], 403);
}

$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

// Quiet bot trap. Real visitors never see/use this field.
if (!empty($data['website'] ?? '')) {
    jsonResponse(['ok' => true, 'message' => 'Application received.']);
}

$firstName = trim((string)($data['firstName'] ?? ''));
$lastName = trim((string)($data['lastName'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$phone = trim((string)($data['phone'] ?? ''));
$country = trim((string)($data['country'] ?? ''));
$accountType = trim((string)($data['accountType'] ?? ''));
$message = trim((string)($data['message'] ?? ''));
$risk = filter_var($data['riskAck'] ?? false, FILTER_VALIDATE_BOOLEAN);

$errors = [];
if ($firstName === '' || mb_strlen($firstName) > 100) $errors['firstName'] = 'First name is required.';
if ($lastName === '' || mb_strlen($lastName) > 100) $errors['lastName'] = 'Last name is required.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) $errors['email'] = 'A valid email address is required.';
if ($phone === '' || mb_strlen($phone) > 50) $errors['phone'] = 'Phone number is required.';
if ($country === '' || mb_strlen($country) > 120) $errors['country'] = 'Country / region is required.';
if ($accountType === '' || mb_strlen($accountType) > 100) $errors['accountType'] = 'Preferred account is required.';
if (mb_strlen($message) > 5000) $errors['message'] = 'Message is too long.';
if (!$risk) $errors['riskAck'] = 'Risk acknowledgement is required.';

if ($errors) {
    jsonResponse(['ok' => false, 'message' => 'Please check the required fields.', 'errors' => $errors], 422);
}

$ref = 'GC-' . gmdate('ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));

try {
    $stmt = db()->prepare(
        'INSERT INTO account_applications
        (application_ref, first_name, last_name, email, phone, country, account_type, message, risk_acknowledged)
        VALUES (:ref, :first_name, :last_name, :email, :phone, :country, :account_type, :message, 1)'
    );
    $stmt->execute([
        ':ref' => $ref,
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':email' => $email,
        ':phone' => $phone,
        ':country' => $country,
        ':account_type' => $accountType,
        ':message' => $message !== '' ? $message : null,
    ]);

    jsonResponse([
        'ok' => true,
        'applicationRef' => $ref,
        'message' => 'Your application has been received. Our team will review your details and contact you.'
    ], 201);
} catch (Throwable $e) {
    error_log('GO COIIN application error: ' . $e->getMessage());
    jsonResponse(['ok' => false, 'message' => 'We could not save your application right now. Please try again.'], 500);
}
