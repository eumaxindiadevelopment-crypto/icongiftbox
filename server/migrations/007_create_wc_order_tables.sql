-- WooCommerce HPOS-style order schema for corporate-gifts (MySQL 8.x, InnoDB, utf8mb4)
-- Replaces the old Sequelize-backed orders/order_line_items/order_tax_lines/
-- order_coupon_lines/order_notes tables with a schema modeled on WooCommerce's
-- High-Performance Order Storage (wp_wc_orders and friends), prefixed wc_ instead of wp_wc_.
-- Run this once against the `corporate-gifts` database via phpMyAdmin's SQL tab
-- (or `mysql -u root corporate-gifts < 007_create_wc_order_tables.sql`).
--
-- NOTE ON NUMBERING: this project's migrations are already numbered 001-006
-- (server/migrations/001_create_schema.sql .. 006_create_sessions.sql), so this
-- file is 007 rather than 001 to avoid colliding with the existing 001_create_schema.sql.

SET FOREIGN_KEY_CHECKS = 0;

-- TASK 1: drop the old order tables being replaced
DROP TABLE IF EXISTS order_notes;
DROP TABLE IF EXISTS order_coupon_lines;
DROP TABLE IF EXISTS order_tax_lines;
DROP TABLE IF EXISTS order_line_items;
DROP TABLE IF EXISTS orders;

-- Also drop the new tables if re-running this migration
DROP TABLE IF EXISTS wc_order_itemmeta;
DROP TABLE IF EXISTS wc_order_items;
DROP TABLE IF EXISTS wc_order_tax_lookup;
DROP TABLE IF EXISTS wc_order_stats;
DROP TABLE IF EXISTS wc_order_product_lookup;
DROP TABLE IF EXISTS wc_order_coupon_lookup;
DROP TABLE IF EXISTS wc_order_addresses;
DROP TABLE IF EXISTS wc_orders_meta;
DROP TABLE IF EXISTS wc_orders;

-- 1. wc_orders — main order table
CREATE TABLE wc_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  type VARCHAR(20) NOT NULL DEFAULT 'shop_order',
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  customer_id BIGINT UNSIGNED NULL,
  billing_email VARCHAR(320) NULL,
  date_created_gmt DATETIME NOT NULL,
  date_updated_gmt DATETIME NULL,
  parent_order_id BIGINT UNSIGNED NULL,
  payment_method VARCHAR(100) NULL,
  payment_method_title VARCHAR(200) NULL,
  transaction_id VARCHAR(200) NULL,
  ip_address VARCHAR(100) NULL,
  user_agent VARCHAR(255) NULL,
  customer_note TEXT NULL,
  PRIMARY KEY (id),
  KEY status (status),
  KEY customer_id (customer_id),
  KEY billing_email (billing_email),
  KEY date_created_gmt (date_created_gmt),
  KEY parent_order_id (parent_order_id),
  KEY type_status_date (type, status, date_created_gmt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- 2. wc_orders_meta — key/value meta for orders (also used here for order notes
--    and subtotal/shipping/discount breakdowns, matching WooCommerce's own
--    convention of storing extension fields as meta rather than new columns)
CREATE TABLE wc_orders_meta (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  meta_key VARCHAR(255) NULL,
  meta_value LONGTEXT NULL,
  PRIMARY KEY (id),
  KEY order_id (order_id),
  KEY meta_key (meta_key(191)),
  CONSTRAINT fk_wc_orders_meta_order FOREIGN KEY (order_id) REFERENCES wc_orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- 3. wc_order_addresses — billing & shipping addresses
CREATE TABLE wc_order_addresses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  address_type VARCHAR(20) NOT NULL,
  first_name VARCHAR(255) NULL,
  last_name VARCHAR(255) NULL,
  company VARCHAR(255) NULL,
  address_1 VARCHAR(255) NULL,
  address_2 VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  postcode VARCHAR(20) NULL,
  -- VARCHAR(100), not WooCommerce's usual 2-letter ISO code, because this
  -- app's checkout form sends full country names (e.g. "India"), not codes.
  country VARCHAR(100) NULL,
  email VARCHAR(320) NULL,
  phone VARCHAR(100) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY order_id_address_type (order_id, address_type),
  KEY order_id (order_id),
  CONSTRAINT fk_wc_order_addresses_order FOREIGN KEY (order_id) REFERENCES wc_orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- 4. wc_order_coupon_lookup
CREATE TABLE wc_order_coupon_lookup (
  order_id BIGINT UNSIGNED NOT NULL,
  coupon_id BIGINT UNSIGNED NOT NULL,
  date_created DATETIME NULL,
  discount_amount DECIMAL(26,8) NOT NULL DEFAULT 0,
  PRIMARY KEY (order_id, coupon_id),
  KEY coupon_id (coupon_id),
  CONSTRAINT fk_wc_order_coupon_lookup_order FOREIGN KEY (order_id) REFERENCES wc_orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- 5. wc_order_product_lookup
CREATE TABLE wc_order_product_lookup (
  order_item_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  variation_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
  customer_id BIGINT UNSIGNED NULL,
  date_created DATETIME NULL,
  product_qty INT NOT NULL DEFAULT 0,
  product_net_revenue DECIMAL(26,8) NOT NULL DEFAULT 0,
  product_gross_revenue DECIMAL(26,8) NOT NULL DEFAULT 0,
  coupon_amount DECIMAL(26,8) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(26,8) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(26,8) NOT NULL DEFAULT 0,
  shipping_tax_amount DECIMAL(26,8) NOT NULL DEFAULT 0,
  PRIMARY KEY (order_item_id),
  KEY order_id (order_id),
  KEY product_id (product_id),
  KEY customer_id (customer_id),
  KEY date_created (date_created),
  CONSTRAINT fk_wc_order_product_lookup_order FOREIGN KEY (order_id) REFERENCES wc_orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- 6. wc_order_stats — denormalized per-order stats, the table WooCommerce-style
--    dashboard/report queries read from instead of scanning wc_orders directly
CREATE TABLE wc_order_stats (
  order_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
  date_created DATETIME NULL,
  date_paid DATETIME NULL,
  date_completed DATETIME NULL,
  num_items_sold INT NOT NULL DEFAULT 0,
  total_sales DECIMAL(26,8) NOT NULL DEFAULT 0,
  tax_total DECIMAL(26,8) NOT NULL DEFAULT 0,
  shipping_total DECIMAL(26,8) NOT NULL DEFAULT 0,
  net_total DECIMAL(26,8) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL,
  customer_id BIGINT UNSIGNED NULL,
  PRIMARY KEY (order_id),
  KEY date_created (date_created),
  KEY status (status),
  KEY customer_id (customer_id),
  CONSTRAINT fk_wc_order_stats_order FOREIGN KEY (order_id) REFERENCES wc_orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- 7. wc_order_tax_lookup
CREATE TABLE wc_order_tax_lookup (
  order_id BIGINT UNSIGNED NOT NULL,
  tax_rate_id BIGINT UNSIGNED NOT NULL,
  date_created DATETIME NULL,
  shipping_tax DECIMAL(26,8) NOT NULL DEFAULT 0,
  order_tax DECIMAL(26,8) NOT NULL DEFAULT 0,
  total_tax DECIMAL(26,8) NOT NULL DEFAULT 0,
  PRIMARY KEY (order_id, tax_rate_id),
  KEY tax_rate_id (tax_rate_id),
  CONSTRAINT fk_wc_order_tax_lookup_order FOREIGN KEY (order_id) REFERENCES wc_orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- 8. wc_order_items — generic line item rows (line_item / shipping / fee / coupon / tax)
-- Column widths and the meta_key(32) index prefix below match WooCommerce's
-- actual wp_woocommerce_order_items/_itemmeta tables exactly. The one
-- intentional deviation from stock WooCommerce is the FOREIGN KEY constraints
-- here and on wc_order_itemmeta/wc_orders_meta/wc_order_addresses/etc. — real
-- WooCommerce has none (WordPress's dbDelta() can't create them), but this
-- app isn't WordPress, so real FKs are used for referential integrity.
CREATE TABLE wc_order_items (
  order_item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_item_name TEXT NOT NULL,
  order_item_type VARCHAR(200) NOT NULL DEFAULT '',
  order_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (order_item_id),
  KEY order_id (order_id),
  CONSTRAINT fk_wc_order_items_order FOREIGN KEY (order_id) REFERENCES wc_orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- 9. wc_order_itemmeta — key/value meta per order item
CREATE TABLE wc_order_itemmeta (
  meta_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_item_id BIGINT UNSIGNED NOT NULL,
  meta_key VARCHAR(255) NULL,
  meta_value LONGTEXT NULL,
  PRIMARY KEY (meta_id),
  KEY order_item_id (order_item_id),
  KEY meta_key (meta_key(32)),
  CONSTRAINT fk_wc_order_itemmeta_item FOREIGN KEY (order_item_id) REFERENCES wc_order_items (order_item_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

SET FOREIGN_KEY_CHECKS = 1;
