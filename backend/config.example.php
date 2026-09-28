<?php
// Copy this file to config.php on the Hostinger backend server.
// Keep config.php outside public GitHub Pages if possible and NEVER commit real credentials.

const DB_HOST = 'localhost';
const DB_NAME = 'YOUR_DATABASE_NAME';
const DB_USER = 'YOUR_DATABASE_USER';
const DB_PASS = 'YOUR_DATABASE_PASSWORD';

const ADMIN_EMAIL = 'admin@example.com';

// Hostinger SMTP settings. Put the real mailbox password ONLY in the live config.php on Hostinger.
const MAIL_SMTP_HOST = 'smtp.hostinger.com';
const MAIL_SMTP_PORT = 465;
const MAIL_SMTP_USER = 'noreply@gocoiin.com';
const MAIL_SMTP_PASSWORD = 'YOUR_HOSTINGER_MAILBOX_PASSWORD';
const MAIL_FROM = 'noreply@gocoiin.com';

// Frontend origins allowed to submit the public account form.
const ALLOWED_ORIGINS = [
    'https://gocoiin.com',
    'https://www.gocoiin.com',
];

// Optional: set to a long random string if you add a separate setup endpoint.
const APP_NAME = 'GO COIIN';
