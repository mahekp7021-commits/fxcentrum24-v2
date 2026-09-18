CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_applications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_ref VARCHAR(24) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  country VARCHAR(120) NOT NULL,
  account_type VARCHAR(100) NOT NULL,
  message TEXT NULL,
  risk_acknowledged TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('New','Contacted','Verified','Approved','Rejected') NOT NULL DEFAULT 'New',
  admin_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_application_ref (application_ref),
  KEY idx_status (status),
  KEY idx_created_at (created_at),
  KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admin_users (email, password_hash)
VALUES ('admin@gocoiin.com', '$2y$12$WdZR37PlvNtSEEdR5t1cFOYUYP.4K7Bg5Rjo58b74bNQNpXZ8HJSG')
ON DUPLICATE KEY UPDATE email = VALUES(email);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
