-- Adds autoplay controls to the Brand Carousel (sponsored_sections table).
-- Run once against the `corporate-gifts` database via phpMyAdmin's SQL tab
-- (or `mysql -u root corporate-gifts < 010_add_sponsored_autoplay.sql`).

ALTER TABLE sponsored_sections
  ADD COLUMN autoplay BOOLEAN DEFAULT true,
  ADD COLUMN autoplayDelay INT DEFAULT 3000;
