-- Controls the "Talk to Our Corporate Gifting Experts" popup on the frontend:
-- whether it's shown at all, and how many seconds after page load it appears.
-- Run once against the `corporate-gifts` database via phpMyAdmin's SQL tab
-- (or `mysql -u root corporate-gifts < 013_create_enquiry_settings.sql`).

CREATE TABLE IF NOT EXISTS enquiry_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  delaySeconds DECIMAL(4,1) DEFAULT 1.0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;
