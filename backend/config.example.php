<?php
// Copy this file to config.php on the Hostinger backend server.
// Keep config.php outside public GitHub Pages if possible and NEVER commit real credentials.

const DB_HOST = 'localhost';
const DB_NAME = 'YOUR_DATABASE_NAME';
const DB_USER = 'YOUR_DATABASE_USER';
const DB_PASS = 'YOUR_DATABASE_PASSWORD';

const ADMIN_EMAIL = 'admin@gocoiin.com';

// Frontend origins allowed to submit the public account form.
const ALLOWED_ORIGINS = [
    'https://gocoiin.com',
    'https://www.gocoiin.com',
];

// Optional: set to a long random string if you add a separate setup endpoint.
const APP_NAME = 'GO COIIN';
