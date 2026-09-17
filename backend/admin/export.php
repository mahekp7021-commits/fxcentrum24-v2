<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
requireAdmin();

try {
    $stmt = db()->query('SELECT application_ref, created_at, first_name, last_name, email, phone, country, account_type, message, risk_acknowledged, status, admin_notes, updated_at FROM account_applications ORDER BY created_at DESC');
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="gocoiin-applications-' . gmdate('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'wb');
    fputcsv($out, ['Application ID','Submitted (UTC)','First Name','Last Name','Email','Phone','Country / Region','Preferred Account','Message','Risk Acknowledged','Status','Admin Notes','Updated (UTC)']);
    while ($row = $stmt->fetch()) {
        fputcsv($out, [$row['application_ref'],$row['created_at'],$row['first_name'],$row['last_name'],$row['email'],$row['phone'],$row['country'],$row['account_type'],$row['message'],$row['risk_acknowledged'] ? 'Yes' : 'No',$row['status'],$row['admin_notes'],$row['updated_at']]);
    }
    fclose($out);
} catch (Throwable $e) {
    http_response_code(500);
    echo 'Export failed.';
}
