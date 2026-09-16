-- "Talk to Our Corporate Gifting Experts" quote-request popup on the frontend
-- submits here; the admin dashboard's Enquiries page reads/manages these rows.
-- Run once against the `corporate-gifts` database via phpMyAdmin's SQL tab
-- (or `mysql -u root corporate-gifts < 012_create_enquiries.sql`).

CREATE TABLE IF NOT EXISTS enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  giftingFor VARCHAR(150) NOT NULL,
  budgetPerGift VARCHAR(150) NOT NULL,
  quantityRequired VARCHAR(150) NOT NULL,
  additionalInfo TEXT,
  status ENUM('new','contacted','closed') DEFAULT 'new',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  INDEX idx_enquiries_status (status),
  INDEX idx_enquiries_createdAt (createdAt)
) ENGINE=InnoDB;
