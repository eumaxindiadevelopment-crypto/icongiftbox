-- Adds the "Our Client" logo carousel section (same shape as the Brand
-- Carousel — logo-only slides, autoplay + delay, nav buttons on the frontend).
-- Run once against the `corporate-gifts` database via phpMyAdmin's SQL tab
-- (or `mysql -u root corporate-gifts < 011_create_our_client.sql`).

CREATE TABLE IF NOT EXISTS our_client_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sectionTitle VARCHAR(255) DEFAULT 'Our Client',
  slides LONGTEXT,
  autoplay BOOLEAN DEFAULT true,
  autoplayDelay INT DEFAULT 3000,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;
