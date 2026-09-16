-- Phase 2: homepage CMS "section" schema for corporate-gifts (MySQL)
-- Migrates the remaining Mongoose-backed content sections off MongoDB.
-- Run this once against the `corporate-gifts` database via phpMyAdmin's SQL tab.

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS about_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mainImage VARCHAR(500), mainBtnText VARCHAR(100), mainBtnLink VARCHAR(255),
  title VARCHAR(255), description TEXT, aboutLink VARCHAR(255),
  card1Image VARCHAR(500), card1BtnText VARCHAR(100), card1Link VARCHAR(255),
  card2Image VARCHAR(500), card2BtnText VARCHAR(100), card2Link VARCHAR(255), card2Badge VARCHAR(100),
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_section_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255), productCount INT,
  filterTabs JSON,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS summer_sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  panel1Image VARCHAR(500), panel1Badge VARCHAR(100), panel1Heading VARCHAR(100), panel1Year VARCHAR(20),
  panel1BtnText VARCHAR(100), panel1BtnLink VARCHAR(255),
  panel2Image VARCHAR(500), panel2Badge VARCHAR(100), panel2Heading VARCHAR(100),
  panel2BtnText VARCHAR(100), panel2BtnLink VARCHAR(255),
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS all_production_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mainImage VARCHAR(500), title VARCHAR(255), shopLink VARCHAR(255),
  cards JSON,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS great_saving_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bannerImage VARCHAR(500), title VARCHAR(255), subtitle VARCHAR(255),
  btnText VARCHAR(100), btnLink VARCHAR(255), animationText VARCHAR(100),
  cards JSON,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hottest_blog_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255), subtitle VARCHAR(255), seeAllLink VARCHAR(255),
  mapCards JSON, sliderItems JSON,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blockbuster_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sectionTitle VARCHAR(255), seeAllText VARCHAR(100), seeAllLink VARCHAR(255),
  sliderItems JSON,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS offer_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sectionTitle VARCHAR(255), seeAllLink VARCHAR(255),
  slides JSON,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS featured_now_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sectionTitle VARCHAR(255), seeAllLink VARCHAR(255),
  sliderItems JSON,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS short_list_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bannerImage VARCHAR(500), bannerTitle VARCHAR(255), btnText VARCHAR(100),
  btnLink VARCHAR(255), animationText VARCHAR(100),
  cards JSON,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sponsored_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sectionTitle VARCHAR(255), seeAllLink VARCHAR(255),
  slides JSON,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trading_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sectionTitle VARCHAR(255), shopLink VARCHAR(255),
  slides JSON,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS collection_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sectionTitle VARCHAR(255), btnText VARCHAR(100), btnLink VARCHAR(255),
  images JSON,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS featured_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(500),
  url VARCHAR(255) DEFAULT '/shop',
  sortOrder INT DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
