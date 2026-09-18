<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['ok' => false, 'message' => 'Method not allowed.'], 405);
if (!requestOriginAllowed()) jsonResponse(['ok' => false, 'message' => 'Origin not allowed.'], 403);

$data = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($data)) $data = $_POST;
if (!empty($data['website'] ?? '')) jsonResponse(['ok' => true, 'message' => 'Withdrawal request received.']);

$accountName = trim((string)($data['accountName'] ?? ''));
$accountPhone = trim((string)($data['accountPhone'] ?? ''));
$accountLogin = trim((string)($data['accountLogin'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$currency = strtoupper(trim((string)($data['sendingCurrency'] ?? '')));
$amount = (string)($data['amount'] ?? '');
$amountWords = trim((string)($data['amountWords'] ?? ''));
$beneficiaryName = trim((string)($data['beneficiaryName'] ?? ''));
$bankCountry = trim((string)($data['beneficiaryBankCountry'] ?? ''));
$bankAccountNumber = trim((string)($data['bankAccountNumber'] ?? ''));
$ifscSortCode = trim((string)($data['ifscSortCode'] ?? ''));

$errors = [];
if ($accountName === '' || mb_strlen($accountName) > 150) $errors['accountName'] = 'Account name is required.';
if ($accountPhone === '' || mb_strlen($accountPhone) > 50) $errors['accountPhone'] = 'Account phone is required.';
if ($accountLogin === '' || mb_strlen($accountLogin) > 190) $errors['accountLogin'] = 'Account login is required.';
if ($email !== '' && (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190)) $errors['email'] = 'Enter a valid email address.';
if (!in_array($currency, ['USD','INR','GBP'], true)) $errors['sendingCurrency'] = 'Select a valid currency.';
if (!is_numeric($amount) || (float)$amount <= 0 || mb_strlen($amount) > 30) $errors['amount'] = 'Enter a valid withdrawal amount.';
if ($amountWords !== '' && mb_strlen($amountWords) > 255) $errors['amountWords'] = 'Amount in words is too long.';
if ($beneficiaryName === '' || mb_strlen($beneficiaryName) > 150) $errors['beneficiaryName'] = 'Beneficiary name is required.';
if ($bankCountry === '' || mb_strlen($bankCountry) > 120) $errors['beneficiaryBankCountry'] = 'Beneficiary bank country is required.';
if ($bankAccountNumber === '' || mb_strlen($bankAccountNumber) > 100) $errors['bankAccountNumber'] = 'Bank account number is required.';
if ($ifscSortCode === '' || mb_strlen($ifscSortCode) > 100) $errors['ifscSortCode'] = 'IFSC / Sort code is required.';

if ($errors) jsonResponse(['ok' => false, 'message' => 'Please check the required fields.', 'errors' => $errors], 422);

ensureWithdrawalTable();
$ref = 'GW-' . gmdate('ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));

try {
    $stmt = db()->prepare(
        'INSERT INTO withdrawal_requests
        (withdrawal_ref, account_name, account_phone, account_login, email, sending_currency, amount, amount_words, beneficiary_name, beneficiary_bank_country, bank_account_number, ifsc_sort_code)
        VALUES (:ref, :account_name, :account_phone, :account_login, :email, :currency, :amount, :amount_words, :beneficiary_name, :bank_country, :bank_account_number, :ifsc_sort_code)'
    );
    $stmt->execute([
        ':ref' => $ref,
        ':account_name' => $accountName,
        ':account_phone' => $accountPhone,
        ':account_login' => $accountLogin,
        ':email' => $email !== '' ? $email : null,
        ':currency' => $currency,
        ':amount' => number_format((float)$amount, 2, '.', ''),
        ':amount_words' => $amountWords !== '' ? $amountWords : null,
        ':beneficiary_name' => $beneficiaryName,
        ':bank_country' => $bankCountry,
        ':bank_account_number' => $bankAccountNumber,
        ':ifsc_sort_code' => $ifscSortCode,
    ]);

    jsonResponse(['ok' => true, 'withdrawalRef' => $ref, 'message' => 'Your withdrawal request has been received. Our team will review the details and contact you if required.'], 201);
} catch (Throwable $e) {
    error_log('GO COIIN withdrawal submission error: ' . $e->getMessage());
    jsonResponse(['ok' => false, 'message' => 'We could not save your withdrawal request right now. Please try again.'], 500);
}
