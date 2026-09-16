-- Phase 1 core-commerce schema for corporate-gifts (MySQL)
-- Run this once against the empty `corporate-gifts` database via phpMyAdmin's SQL tab.

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','shop_manager','editor','product_manager','customer_service') DEFAULT 'editor',
  permissions JSON,
  isActive BOOLEAN DEFAULT TRUE,
  lastLogin DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wcCustomerId INT UNIQUE,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer',
  avatar VARCHAR(500),
  billingAddress JSON,
  shippingAddress JSON,
  isGuest BOOLEAN DEFAULT FALSE,
  totalOrders INT DEFAULT 0,
  totalSpent DECIMAL(12,2) DEFAULT 0,
  averageOrderValue DECIMAL(12,2) DEFAULT 0,
  lastOrderDate DATETIME,
  notes TEXT,
  status ENUM('active','inactive') DEFAULT 'active',
  syncedAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  INDEX idx_customers_totalSpent (totalSpent)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wcCategoryId INT UNIQUE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  parentId INT NULL,
  image JSON,
  count INT DEFAULT 0,
  syncedAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_categories_parent FOREIGN KEY (parentId) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wcProductId INT UNIQUE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  shortDescription TEXT,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(12,2) DEFAULT 0,
  regularPrice DECIMAL(12,2) DEFAULT 0,
  salePrice DECIMAL(12,2),
  onSale BOOLEAN DEFAULT FALSE,
  inStock BOOLEAN DEFAULT TRUE,
  stockQuantity INT DEFAULT 0,
  stockStatus ENUM('instock','outofstock','onbackorder') DEFAULT 'instock',
  type ENUM('simple','variable') DEFAULT 'simple',
  variationOptions JSON,
  weight VARCHAR(50),
  dimensions JSON,
  taxStatus ENUM('taxable','shipping','none') DEFAULT 'taxable',
  taxClass VARCHAR(100),
  managedInventory BOOLEAN DEFAULT FALSE,
  backorderAllowed BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  status ENUM('publish','draft','pending','trash') DEFAULT 'draft',
  visibility ENUM('public','private') DEFAULT 'public',
  catalogVisibility ENUM('visible','catalog','search','hidden') DEFAULT 'visible',
  publishedAt DATETIME,
  syncedAt DATETIME,
  metaTitle VARCHAR(255),
  metaDescription VARCHAR(500),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  INDEX idx_products_status (status),
  INDEX idx_products_stockStatus (stockStatus),
  INDEX idx_products_status_price (status, price),
  FULLTEXT INDEX idx_products_fulltext (name, sku)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  src VARCHAR(500),
  alt VARCHAR(255),
  sortOrder INT DEFAULT 0,
  CONSTRAINT fk_product_images_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_attributes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  name VARCHAR(255),
  visible BOOLEAN DEFAULT TRUE,
  options JSON,
  sortOrder INT DEFAULT 0,
  CONSTRAINT fk_product_attributes_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_variations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  attributes JSON,
  sku VARCHAR(100),
  price DECIMAL(12,2) DEFAULT 0,
  regularPrice DECIMAL(12,2) DEFAULT 0,
  stockQuantity INT DEFAULT 0,
  stockStatus ENUM('instock','outofstock','onbackorder') DEFAULT 'instock',
  image JSON,
  enabled BOOLEAN DEFAULT TRUE,
  sortOrder INT DEFAULT 0,
  CONSTRAINT fk_product_variations_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_categories (
  productId INT NOT NULL,
  categoryId INT NOT NULL,
  PRIMARY KEY (productId, categoryId),
  CONSTRAINT fk_pc_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pc_category FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  tag VARCHAR(100) NOT NULL,
  CONSTRAINT fk_product_tags_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_tags_tag (tag)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wcOrderId INT UNIQUE,
  orderNumber VARCHAR(50),
  status ENUM('pending','processing','on-hold','completed','cancelled','refunded','failed') DEFAULT 'pending',
  currency VARCHAR(10) DEFAULT 'INR',
  total DECIMAL(12,2) DEFAULT 0,
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  shippingTotal DECIMAL(12,2) DEFAULT 0,
  discountTotal DECIMAL(12,2) DEFAULT 0,
  paymentMethod VARCHAR(50),
  paymentMethodTitle VARCHAR(100),
  transactionId VARCHAR(255),
  isPaid BOOLEAN DEFAULT FALSE,
  customerId INT NULL,
  billingAddress JSON,
  shippingAddress JSON,
  notes TEXT,
  datePaid DATETIME,
  dateCompleted DATETIME,
  syncedAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_orders_status (status),
  INDEX idx_orders_customerId (customerId),
  INDEX idx_orders_createdAt (createdAt)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_line_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  productId INT,
  name VARCHAR(255),
  quantity INT,
  price DECIMAL(12,2),
  total DECIMAL(12,2),
  subtotal DECIMAL(12,2),
  sortOrder INT DEFAULT 0,
  CONSTRAINT fk_oli_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_tax_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  rateCode VARCHAR(100),
  label VARCHAR(255),
  taxTotal DECIMAL(12,2),
  CONSTRAINT fk_otl_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_coupon_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  code VARCHAR(100),
  discount DECIMAL(12,2),
  CONSTRAINT fk_ocl_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  author VARCHAR(255),
  note TEXT,
  dateCreated DATETIME,
  customerNote BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_on_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wcCouponId INT UNIQUE,
  code VARCHAR(100) NOT NULL UNIQUE,
  discountType ENUM('percent','fixed_cart','fixed_product','free_shipping') NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  expiryDate DATETIME,
  minimumAmount DECIMAL(12,2),
  maximumAmount DECIMAL(12,2),
  usageCount INT DEFAULT 0,
  usageLimit INT,
  usageLimitPerUser INT,
  freeShipping BOOLEAN DEFAULT FALSE,
  excludeSaleItems BOOLEAN DEFAULT FALSE,
  productIds JSON,
  excludeProductIds JSON,
  categoryIds JSON,
  status ENUM('active','expired','inactive') DEFAULT 'active',
  syncedAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  image VARCHAR(500),
  price VARCHAR(50),
  buttonText VARCHAR(100) DEFAULT 'View Detail',
  productId INT NULL,
  productLink VARCHAR(255) DEFAULT '/product-default',
  sortOrder INT DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_banners_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  value JSON,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
