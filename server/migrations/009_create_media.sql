-- Adds WordPress-style metadata (title, alt text, caption, description) to
-- the Media Library. Files themselves still live on disk under
-- uploads/products/ (see routes/upload.js) — this table only stores the SEO
-- metadata keyed by filename, added lazily for any file that predates it.
-- Run once against the `corporate-gifts` database via phpMyAdmin's SQL tab
-- (or `mysql -u root corporate-gifts < 009_create_media.sql`).

CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255),
  altText VARCHAR(255),
  caption TEXT,
  description TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;
