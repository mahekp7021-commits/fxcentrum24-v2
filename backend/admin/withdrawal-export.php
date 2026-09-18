<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
requireAdmin();

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

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="gocoiin-withdrawals-' . gmdate('Ymd-His') . '.csv"');
$out=fopen('php://output','w');
fputcsv($out,['Withdrawal ID','Account Name','Account Phone','Account Login','Email','Currency','Amount','Amount Words','Beneficiary Name','Bank Country','Bank Account Number','IFSC / Sort Code','Status','Admin Notes','Submitted UTC','Updated UTC']);
$stmt=db()->query('SELECT withdrawal_ref, account_name, account_phone, account_login, email, sending_currency, amount, amount_words, beneficiary_name, beneficiary_bank_country, bank_account_number, ifsc_sort_code, status, admin_notes, created_at, updated_at FROM withdrawal_requests ORDER BY created_at DESC');
while($row=$stmt->fetch(PDO::FETCH_ASSOC)) fputcsv($out,$row);
fclose($out);
exit;
