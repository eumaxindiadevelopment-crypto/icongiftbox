-- Rollback for 007_create_wc_order_tables.sql
-- Drops the WooCommerce HPOS-style wc_order_* tables and recreates the original
-- orders/order_line_items/order_tax_lines/order_coupon_lines/order_notes tables
-- exactly as defined in 001_create_schema.sql. This restores the SCHEMA only —
-- any orders placed after the 007 migration are not migrated back (see
-- server/_order_tables_backup/pre_wc_migration_backup.sql for the last backup
-- taken before 007 was applied).

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS wc_order_itemmeta;
DROP TABLE IF EXISTS wc_order_items;
DROP TABLE IF EXISTS wc_order_tax_lookup;
DROP TABLE IF EXISTS wc_order_stats;
DROP TABLE IF EXISTS wc_order_product_lookup;
DROP TABLE IF EXISTS wc_order_coupon_lookup;
DROP TABLE IF EXISTS wc_order_addresses;
DROP TABLE IF EXISTS wc_orders_meta;
DROP TABLE IF EXISTS wc_orders;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wcOrderId INT UNIQUE,
  orderNumber VARCHAR(50),
  status ENUM('pending','processing','on-hold','completed','cancelled','refunded','failed') DEFAULT 'pending',
  currency VARCHAR(10) DEFAULT 'INR',
  total DECIMAL(12,2) DEFAULT 0,
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  shippingTotal DECIMAL(12,2) DEFAULT 0,
  discountTotal DECIMAL(12,2) DEFAULT 0,
  paymentMethod VARCHAR(50),
  paymentMethodTitle VARCHAR(100),
  transactionId VARCHAR(255),
  isPaid BOOLEAN DEFAULT FALSE,
  customerId INT NULL,
  billingAddress JSON,
  shippingAddress JSON,
  notes TEXT,
  datePaid DATETIME,
  dateCompleted DATETIME,
  syncedAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_orders_status (status),
  INDEX idx_orders_customerId (customerId),
  INDEX idx_orders_createdAt (createdAt)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_line_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  productId INT,
  name VARCHAR(255),
  quantity INT,
  price DECIMAL(12,2),
  total DECIMAL(12,2),
  subtotal DECIMAL(12,2),
  sortOrder INT DEFAULT 0,
  CONSTRAINT fk_oli_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_tax_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  rateCode VARCHAR(100),
  label VARCHAR(255),
  taxTotal DECIMAL(12,2),
  CONSTRAINT fk_otl_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_coupon_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  code VARCHAR(100),
  discount DECIMAL(12,2),
  CONSTRAINT fk_ocl_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  author VARCHAR(255),
  note TEXT,
  dateCreated DATETIME,
  customerNote BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_on_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
