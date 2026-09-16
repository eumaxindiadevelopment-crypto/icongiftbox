-- Shipping zone locations table for corporate-gifts (MySQL)
-- Mirrors WooCommerce's core wp_woocommerce_shipping_zone_locations table (cg_ prefix instead of wp_).
-- Run this once against the `corporate-gifts` database via phpMyAdmin's SQL tab.

CREATE TABLE IF NOT EXISTS cg_woocommerce_shipping_zone_locations (
  location_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  zone_id BIGINT(20) UNSIGNED NOT NULL,
  location_code VARCHAR(200) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  location_type VARCHAR(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  PRIMARY KEY (location_id),
  KEY location_type_code (location_type, location_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO cg_woocommerce_shipping_zone_locations (location_id, zone_id, location_code, location_type)
VALUES (1, 1, 'IN', 'country');
