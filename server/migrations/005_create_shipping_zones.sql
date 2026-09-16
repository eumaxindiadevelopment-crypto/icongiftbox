-- Shipping zones table for corporate-gifts (MySQL)
-- Mirrors WooCommerce's core wp_woocommerce_shipping_zones table (cg_ prefix instead of wp_).
-- Parent table for cg_woocommerce_shipping_zone_locations and cg_woocommerce_shipping_zone_methods (zone_id).
-- Run this once against the `corporate-gifts` database via phpMyAdmin's SQL tab.

CREATE TABLE IF NOT EXISTS cg_woocommerce_shipping_zones (
  zone_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  zone_name VARCHAR(200) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  zone_order BIGINT(20) UNSIGNED NOT NULL,
  PRIMARY KEY (zone_id),
  KEY zone_order (zone_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
