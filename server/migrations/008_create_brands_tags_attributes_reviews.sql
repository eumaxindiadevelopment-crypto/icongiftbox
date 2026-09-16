-- Adds Brands, global Tags, global Attributes (+terms), and Reviews to corporate-gifts.
-- Run once against the `corporate-gifts` database via phpMyAdmin's SQL tab
-- (or `mysql -u root corporate-gifts < 008_create_brands_tags_attributes_reviews.sql`).

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS attribute_terms;
DROP TABLE IF EXISTS attributes;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS brands;

-- 1. Brands — one brand per product (nullable), like a lightweight second Category
CREATE TABLE brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  logo JSON,
  count INT DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

-- 2. Global Tags — a canonical, manageable list mirroring the free-text values
--    already stored per-product in product_tags (kept as-is; this table just
--    gives Tags a real admin surface, like Categories has). Renaming a tag here
--    cascades into product_tags; deleting removes it from every product too.
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  count INT DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

-- 3. Global Attributes (e.g. "Size", "Color") + reusable terms (e.g. "S", "Red")
CREATE TABLE attributes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE attribute_terms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attributeId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  sortOrder INT DEFAULT 0,
  CONSTRAINT fk_attribute_terms_attribute FOREIGN KEY (attributeId) REFERENCES attributes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Reviews — customer-submitted, moderated before showing publicly
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  customerId INT NULL,
  authorName VARCHAR(255) NOT NULL,
  authorEmail VARCHAR(255),
  rating TINYINT NOT NULL DEFAULT 5,
  title VARCHAR(255),
  comment TEXT NOT NULL,
  status ENUM('pending','approved','spam') DEFAULT 'pending',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_reviews_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_reviews_productId (productId),
  INDEX idx_reviews_status (status)
) ENGINE=InnoDB;

-- 5. Product columns: brand link + denormalized rating rollup
ALTER TABLE products
  ADD COLUMN brandId INT NULL AFTER stockStatus,
  ADD COLUMN averageRating DECIMAL(2,1) DEFAULT 0 AFTER metaDescription,
  ADD COLUMN reviewCount INT DEFAULT 0 AFTER averageRating,
  ADD CONSTRAINT fk_products_brand FOREIGN KEY (brandId) REFERENCES brands(id) ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;
