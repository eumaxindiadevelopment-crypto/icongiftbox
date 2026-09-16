-- Shipping zone methods table for corporate-gifts (MySQL)
-- Mirrors WooCommerce's core wp_woocommerce_shipping_zone_methods table (cg_ prefix instead of wp_).
-- Run this once against the `corporate-gifts` database via phpMyAdmin's SQL tab.

CREATE TABLE IF NOT EXISTS cg_woocommerce_shipping_zone_methods (
  zone_id BIGINT(20) UNSIGNED NOT NULL,
  instance_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  method_id VARCHAR(200) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  method_order BIGINT(20) UNSIGNED NOT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (instance_id),
  KEY zone_id (zone_id),
  KEY method_id (method_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
