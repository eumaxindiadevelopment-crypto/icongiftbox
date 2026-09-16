-- Sessions table for corporate-gifts (MySQL)
-- Mirrors WooCommerce's core wp_woocommerce_sessions table (cg_ prefix instead of wp_).
-- Run this once against the `corporate-gifts` database via phpMyAdmin's SQL tab.

CREATE TABLE IF NOT EXISTS cg_woocommerce_sessions (
  session_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  session_key CHAR(32) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  session_value LONGTEXT COLLATE utf8mb4_unicode_520_ci NOT NULL,
  session_expiry BIGINT(20) UNSIGNED NOT NULL,
  PRIMARY KEY (session_id),
  UNIQUE KEY session_key (session_key),
  KEY session_expiry (session_expiry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
