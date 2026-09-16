---
# WooCommerce Dashboard - Backend API & Integration Guide
# Complete Node.js/Express implementation with MongoDB
---

# Backend API & Integration Implementation Guide

## Table of Contents

1. [Project Structure](#project-structure)
2. [Database Setup](#database-setup)
3. [Authentication & Middleware](#authentication--middleware)
4. [API Routes Structure](#api-routes-structure)
5. [Model Implementation](#model-implementation)
6. [WooCommerce Integration](#woocommerce-integration)
7. [Data Sync Service](#data-sync-service)
8. [Error Handling](#error-handling)
9. [Testing](#testing)

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── environment.js
│   │   └── woocommerce.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── permissions.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Customer.js
│   │   ├── Category.js
│   │   ├── Coupon.js
│   │   └── Settings.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── customers.js
│   │   ├── reports.js
│   │   ├── coupons.js
│   │   ├── settings.js
│   │   └── dashboard.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── customerController.js
│   │   ├── reportController.js
│   │   └── dashboardController.js
│   ├── services/
│   │   ├── woocommerceService.js
│   │   ├── syncService.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   └── reportService.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── encryption.js
│   └── app.js
├── .env
├── .env.example
├── package.json
└── server.js
```

---

## Database Setup

### MongoDB Connection

**File:** `src/config/database.js`

```javascript
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Setup event listeners
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    return conn;
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Environment Configuration

**File:** `.env.example`

```
# Server
NODE_ENV=development
PORT=5000
BACKEND_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/woocommerce-dashboard
MONGODB_TEST_URI=mongodb://localhost:27017/woocommerce-dashboard-test

# WooCommerce
WC_STORE_URL=https://your-store.com
WC_CONSUMER_KEY=your_consumer_key
WC_CONSUMER_SECRET=your_consumer_secret
WC_API_VERSION=wc/v3

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# Email (optional, for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# CORS
CORS_ORIGIN=http://localhost:3000

# Sync Settings
SYNC_INTERVAL=900000
FULL_SYNC_INTERVAL=21600000
```

---

## Authentication & Middleware

### JWT Authentication Middleware

**File:** `src/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(401).json({ error: 'Invalid token' });
  }
};

const refreshToken = (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

module.exports = { auth, refreshToken };
```

### Permission Middleware

**File:** `src/middleware/permissions.js`

```javascript
const hasPermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userPermissions = getUserPermissions(req.user.role);

    const hasAccess = requiredPermissions.every(permission =>
      userPermissions.includes(permission) || userPermissions.includes('*')
    );

    if (!hasAccess) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const getUserPermissions = (role) => {
  const rolePermissions = {
    admin: ['*'],
    shop_manager: [
      'manage_products',
      'manage_orders',
      'manage_customers',
      'view_reports',
      'manage_settings',
      'manage_coupons'
    ],
    editor: [
      'manage_products',
      'manage_orders',
      'view_customers',
      'view_reports'
    ],
    product_manager: [
      'manage_products'
    ],
    customer_service: [
      'manage_orders',
      'view_customers',
      'edit_customers'
    ]
  };

  return rolePermissions[role] || [];
};

module.exports = { hasPermission, getUserPermissions };
```

### Error Handler Middleware

**File:** `src/middleware/errorHandler.js`

```javascript
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      error: 'Validation failed',
      details: messages 
    });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ 
      error: `${field} already exists` 
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
```

---

## API Routes Structure

### Main App Setup

**File:** `src/app.js`

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const reportRoutes = require('./routes/reports');
const couponRoutes = require('./routes/coupons');
const settingsRoutes = require('./routes/settings');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
```

### Auth Routes

**File:** `src/routes/auth.js`

```javascript
const express = require('express');
const authController = require('../controllers/authController');
const { auth, refreshToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', refreshToken);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/password', auth, authController.changePassword);

module.exports = router;
```

### Product Routes

**File:** `src/routes/products.js`

```javascript
const express = require('express');
const productController = require('../controllers/productController');
const { auth } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');
const { validateProduct } = require('../middleware/validation');

const router = express.Router();

// List & Search
router.get('/', auth, productController.getProducts);
router.get('/search', auth, productController.searchProducts);

// Single product
router.get('/:id', auth, productController.getProductById);

// Create
router.post(
  '/',
  auth,
  hasPermission(['manage_products']),
  validateProduct,
  productController.createProduct
);

// Update
router.put(
  '/:id',
  auth,
  hasPermission(['manage_products']),
  validateProduct,
  productController.updateProduct
);

// Delete
router.delete(
  '/:id',
  auth,
  hasPermission(['manage_products']),
  productController.deleteProduct
);

// Bulk operations
router.post(
  '/bulk/update',
  auth,
  hasPermission(['manage_products']),
  productController.bulkUpdateProducts
);

router.post(
  '/bulk/delete',
  auth,
  hasPermission(['manage_products']),
  productController.bulkDeleteProducts
);

// Publish/Unpublish
router.post(
  '/:id/publish',
  auth,
  hasPermission(['manage_products']),
  productController.publishProduct
);

router.post(
  '/:id/unpublish',
  auth,
  hasPermission(['manage_products']),
  productController.unpublishProduct
);

// Categories
router.get('/categories', auth, productController.getCategories);
router.post(
  '/categories',
  auth,
  hasPermission(['manage_products']),
  productController.createCategory
);

router.put(
  '/categories/:id',
  auth,
  hasPermission(['manage_products']),
  productController.updateCategory
);

router.delete(
  '/categories/:id',
  auth,
  hasPermission(['manage_products']),
  productController.deleteCategory
);

module.exports = router;
```

### Order Routes

**File:** `src/routes/orders.js`

```javascript
const express = require('express');
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

const router = express.Router();

// List & Filter
router.get('/', auth, orderController.getOrders);
router.get('/status/:status', auth, orderController.getOrdersByStatus);

// Single order
router.get('/:id', auth, orderController.getOrderById);

// Create
router.post(
  '/',
  auth,
  hasPermission(['manage_orders']),
  orderController.createOrder
);

// Update
router.put(
  '/:id',
  auth,
  hasPermission(['manage_orders']),
  orderController.updateOrder
);

// Delete
router.delete(
  '/:id',
  auth,
  hasPermission(['manage_orders']),
  orderController.deleteOrder
);

// Status management
router.post(
  '/:id/status',
  auth,
  hasPermission(['manage_orders']),
  orderController.updateOrderStatus
);

// Refund
router.post(
  '/:id/refund',
  auth,
  hasPermission(['manage_orders']),
  orderController.refundOrder
);

// Notes
router.post(
  '/:id/notes',
  auth,
  hasPermission(['manage_orders']),
  orderController.addOrderNote
);

router.get(
  '/:id/notes',
  auth,
  orderController.getOrderNotes
);

// Print/Export
router.get(
  '/:id/export',
  auth,
  orderController.exportOrder
);

module.exports = router;
```

---

## Model Implementation

### Product Model

**File:** `src/models/Product.js`

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    wcProductId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    description: String,
    shortDescription: String,
    sku: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    price: Number,
    regularPrice: Number,
    salePrice: Number,
    onSale: {
      type: Boolean,
      default: false
    },
    inStock: {
      type: Boolean,
      default: true
    },
    stockQuantity: {
      type: Number,
      default: 0
    },
    stockStatus: {
      type: String,
      enum: ['instock', 'outofstock', 'onbackorder'],
      default: 'instock'
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    tags: [String],
    images: [
      {
        id: String,
        src: String,
        alt: String
      }
    ],
    attributes: [
      {
        name: String,
        options: [String],
        visible: Boolean
      }
    ],
    variations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variation'
      }
    ],
    reviews: [
      {
        id: String,
        rating: Number,
        comment: String,
        reviewer: String,
        dateCreated: Date
      }
    ],
    downloadable: {
      type: Boolean,
      default: false
    },
    downloads: [
      {
        id: String,
        name: String,
        file: String
      }
    ],
    virtualProduct: {
      type: Boolean,
      default: false
    },
    weight: String,
    dimensions: {
      length: String,
      width: String,
      height: String
    },
    taxStatus: {
      type: String,
      enum: ['taxable', 'shipping', 'none'],
      default: 'taxable'
    },
    taxClass: String,
    managedInventory: {
      type: Boolean,
      default: true
    },
    backorderAllowed: {
      type: Boolean,
      default: false
    },
    shippingRequired: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['publish', 'draft', 'pending'],
      default: 'draft'
    },
    syncedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    indexes: [
      { name: 1, status: 1 },
      { categories: 1 },
      { sku: 1 },
      { createdAt: -1 }
    ]
  }
);

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });

// Virtual for full text search
productSchema.virtual('searchText').get(function () {
  return [this.name, this.description, this.sku].filter(Boolean).join(' ');
});

// Instance methods
productSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.searchText = this.searchText;
  return obj;
};

// Static methods
productSchema.statics.findBySkuOrId = function (identifier) {
  return this.findOne({
    $or: [
      { sku: identifier },
      { wcProductId: parseInt(identifier) }
    ]
  });
};

productSchema.statics.getByStatus = function (status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

productSchema.statics.getLowStock = function (threshold = 10) {
  return this.find({
    $and: [
      { managedInventory: true },
      { stockQuantity: { $lte: threshold, $gt: 0 } }
    ]
  });
};

productSchema.statics.getOutOfStock = function () {
  return this.find({ stockQuantity: 0 });
};

module.exports = mongoose.model('Product', productSchema);
```

### Order Model

**File:** `src/models/Order.js`

```javascript
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    wcOrderId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    total: {
      type: Number,
      required: true
    },
    subtotal: Number,
    tax: Number,
    shippingTotal: Number,
    discountTotal: {
      type: Number,
      default: 0
    },
    coupons: [String],
    paymentMethod: String,
    paymentMethodTitle: String,
    transactionId: String,
    isPaid: {
      type: Boolean,
      default: false
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    customerId: Number,
    billingAddress: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      company: String,
      address1: String,
      address2: String,
      city: String,
      state: String,
      postcode: String,
      country: String
    },
    shippingAddress: {
      firstName: String,
      lastName: String,
      address1: String,
      address2: String,
      city: String,
      state: String,
      postcode: String,
      country: String,
      company: String
    },
    shippingMethod: String,
    shippingLines: [
      {
        id: String,
        method: String,
        title: String,
        total: Number
      }
    ],
    lineItems: [
      {
        id: String,
        productId: Number,
        variationId: Number,
        name: String,
        quantity: Number,
        taxClass: String,
        subtotal: Number,
        subtotalTax: Number,
        total: Number,
        totalTax: Number
      }
    ],
    taxLines: [
      {
        id: String,
        rateCode: String,
        rateId: String,
        label: String,
        compound: Boolean,
        taxTotal: Number,
        shippingTaxTotal: Number
      }
    ],
    feeLines: [
      {
        id: String,
        name: String,
        taxClass: String,
        taxStatus: String,
        total: Number
      }
    ],
    couponLines: [
      {
        id: String,
        code: String,
        discount: Number,
        discountTax: Number
      }
    ],
    notes: String,
    orderNotes: [
      {
        author: String,
        note: String,
        dateCreated: Date,
        customerNote: Boolean
      }
    ],
    dateCreated: {
      type: Date,
      default: Date.now
    },
    datePaid: Date,
    dateCompleted: Date,
    dateModified: Date,
    syncedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    indexes: [
      { wcOrderId: 1 },
      { status: 1, dateCreated: -1 },
      { customerId: 1 },
      { total: -1 }
    ]
  }
);

// Methods
orderSchema.methods.calculateTotalItems = function () {
  return this.lineItems.reduce((sum, item) => sum + item.quantity, 0);
};

orderSchema.methods.canBeRefunded = function () {
  return ['processing', 'completed'].includes(this.status);
};

orderSchema.methods.addNote = function (author, note, isCustomerNote = false) {
  this.orderNotes.push({
    author,
    note,
    dateCreated: new Date(),
    customerNote: isCustomerNote
  });
  return this.save();
};

// Statics
orderSchema.statics.getByStatus = function (status) {
  return this.find({ status }).sort({ dateCreated: -1 });
};

orderSchema.statics.getPendingOrders = function () {
  return this.find({ status: 'pending' }).sort({ dateCreated: 1 });
};

orderSchema.statics.getRevenueStats = function (fromDate, toDate) {
  return this.aggregate([
    {
      $match: {
        dateCreated: { $gte: fromDate, $lte: toDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        orderCount: { $sum: 1 },
        avgOrderValue: { $avg: '$total' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
```

---

## WooCommerce Integration

### WooCommerce Service

**File:** `src/services/woocommerceService.js`

```javascript
const axios = require('axios');
const logger = require('../utils/logger');

class WooCommerceService {
  constructor() {
    this.baseURL = process.env.WC_STORE_URL;
    this.consumerKey = process.env.WC_CONSUMER_KEY;
    this.consumerSecret = process.env.WC_CONSUMER_SECRET;
    this.version = process.env.WC_API_VERSION || 'wc/v3';
    
    this.client = axios.create({
      baseURL: `${this.baseURL}/wp-json/${this.version}`,
      auth: {
        username: this.consumerKey,
        password: this.consumerSecret
      },
      timeout: 10000
    });

    // Add request/response interceptors
    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.response.use(
      response => response,
      error => {
        logger.error('WooCommerce API Error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          endpoint: error.config?.url
        });
        throw error;
      }
    );
  }

  // Products
  async getProducts(params = {}) {
    const { page = 1, perPage = 100, status = 'any', modifiedAfter } = params;
    
    const queryParams = {
      page,
      per_page: perPage,
      status
    };

    if (modifiedAfter) {
      queryParams.modified_after = modifiedAfter.toISOString();
    }

    const response = await this.client.get('/products', { params: queryParams });
    return {
      data: response.data,
      total: parseInt(response.headers['x-wp-total'] || 0),
      totalPages: parseInt(response.headers['x-wp-totalpages'] || 0)
    };
  }

  async getProduct(id) {
    const response = await this.client.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(productData) {
    const response = await this.client.post('/products', productData);
    return response.data;
  }

  async updateProduct(id, productData) {
    const response = await this.client.put(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id) {
    const response = await this.client.delete(`/products/${id}`, {
      params: { force: true }
    });
    return response.data;
  }

  // Orders
  async getOrders(params = {}) {
    const { page = 1, perPage = 100, status, modifiedAfter } = params;
    
    const queryParams = {
      page,
      per_page: perPage,
      status: status || 'any'
    };

    if (modifiedAfter) {
      queryParams.modified_after = modifiedAfter.toISOString();
    }

    const response = await this.client.get('/orders', { params: queryParams });
    return {
      data: response.data,
      total: parseInt(response.headers['x-wp-total'] || 0),
      totalPages: parseInt(response.headers['x-wp-totalpages'] || 0)
    };
  }

  async getOrder(id) {
    const response = await this.client.get(`/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id, status) {
    const response = await this.client.put(`/orders/${id}`, { status });
    return response.data;
  }

  async refundOrder(id, refundData) {
    const response = await this.client.post(`/orders/${id}/refunds`, refundData);
    return response.data;
  }

  // Customers
  async getCustomers(params = {}) {
    const { page = 1, perPage = 100 } = params;
    
    const response = await this.client.get('/customers', {
      params: { page, per_page: perPage }
    });

    return {
      data: response.data,
      total: parseInt(response.headers['x-wp-total'] || 0)
    };
  }

  async getCustomer(id) {
    const response = await this.client.get(`/customers/${id}`);
    return response.data;
  }

  // Categories
  async getProductCategories(params = {}) {
    const response = await this.client.get('/products/categories', {
      params: { per_page: 100, ...params }
    });
    return response.data;
  }

  // Coupons
  async getCoupons(params = {}) {
    const response = await this.client.get('/coupons', {
      params: { per_page: 100, ...params }
    });
    return response.data;
  }

  // Settings
  async getSettings() {
    const response = await this.client.get('/settings');
    return response.data;
  }

  async getSetting(group) {
    const response = await this.client.get(`/settings/${group}`);
    return response.data;
  }

  // Reports
  async getSalesReport(params = {}) {
    const response = await this.client.get('/reports/sales', { params });
    return response.data;
  }

  async getTopProducts(params = {}) {
    const response = await this.client.get('/reports/top_products', { params });
    return response.data;
  }
}

module.exports = new WooCommerceService();
```

---

## Data Sync Service

### Sync Service

**File:** `src/services/syncService.js`

```javascript
const cron = require('node-cron');
const logger = require('../utils/logger');
const woocommerceService = require('./woocommerceService');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Category = require('../models/Category');

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.lastSyncTime = {};
  }

  start() {
    logger.info('Starting sync service');

    // Incremental sync every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      this.incrementalSync().catch(err =>
        logger.error('Incremental sync failed:', err)
      );
    });

    // Full sync every 6 hours
    cron.schedule('0 */6 * * *', () => {
      this.fullSync().catch(err =>
        logger.error('Full sync failed:', err)
      );
    });

    logger.info('Sync service started');
  }

  async incrementalSync() {
    if (this.isSyncing) {
      logger.warn('Sync already in progress');
      return;
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      logger.info('Starting incremental sync');

      // Sync products
      await this.syncProducts(true);

      // Sync orders
      await this.syncOrders(true);

      // Sync customers
      await this.syncCustomers(true);

      // Sync categories
      await this.syncCategories();

      const duration = Date.now() - startTime;
      logger.info(`Incremental sync completed in ${duration}ms`);
    } catch (error) {
      logger.error('Incremental sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async fullSync() {
    if (this.isSyncing) {
      logger.warn('Sync already in progress');
      return;
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      logger.info('Starting full sync');

      // Full sync products
      await this.syncProducts(false);

      // Full sync orders
      await this.syncOrders(false);

      // Full sync customers
      await this.syncCustomers(false);

      // Sync categories
      await this.syncCategories();

      const duration = Date.now() - startTime;
      logger.info(`Full sync completed in ${duration}ms`);
    } catch (error) {
      logger.error('Full sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async syncProducts(incremental = true) {
    try {
      let params = { status: 'any' };

      if (incremental && this.lastSyncTime.products) {
        params.modifiedAfter = this.lastSyncTime.products;
      }

      let page = 1;
      let hasMore = true;
      let syncedCount = 0;

      while (hasMore) {
        params.page = page;

        const result = await woocommerceService.getProducts(params);
        const { data, totalPages } = result;

        for (const wcProduct of data) {
          await this.upsertProduct(wcProduct);
          syncedCount++;
        }

        hasMore = page < totalPages;
        page++;
      }

      this.lastSyncTime.products = new Date();
      logger.info(`Synced ${syncedCount} products`);
    } catch (error) {
      logger.error('Failed to sync products:', error);
      throw error;
    }
  }

  async upsertProduct(wcProduct) {
    const productData = {
      wcProductId: wcProduct.id,
      name: wcProduct.name,
      slug: wcProduct.slug,
      description: wcProduct.description,
      shortDescription: wcProduct.short_description,
      sku: wcProduct.sku,
      price: parseFloat(wcProduct.price),
      regularPrice: parseFloat(wcProduct.regular_price),
      salePrice: parseFloat(wcProduct.sale_price),
      onSale: wcProduct.on_sale,
      inStock: wcProduct.in_stock,
      stockQuantity: wcProduct.stock_quantity || 0,
      stockStatus: wcProduct.stock_status,
      images: (wcProduct.images || []).map(img => ({
        id: img.id,
        src: img.src,
        alt: img.alt
      })),
      status: wcProduct.status,
      managedInventory: wcProduct.manage_stock,
      syncedAt: new Date()
    };

    return Product.findOneAndUpdate(
      { wcProductId: wcProduct.id },
      productData,
      { upsert: true, new: true }
    );
  }

  async syncOrders(incremental = true) {
    try {
      let params = { status: 'any' };

      if (incremental && this.lastSyncTime.orders) {
        params.modifiedAfter = this.lastSyncTime.orders;
      }

      let page = 1;
      let hasMore = true;
      let syncedCount = 0;

      while (hasMore) {
        params.page = page;

        const result = await woocommerceService.getOrders(params);
        const { data, totalPages } = result;

        for (const wcOrder of data) {
          await this.upsertOrder(wcOrder);
          syncedCount++;
        }

        hasMore = page < totalPages;
        page++;
      }

      this.lastSyncTime.orders = new Date();
      logger.info(`Synced ${syncedCount} orders`);
    } catch (error) {
      logger.error('Failed to sync orders:', error);
      throw error;
    }
  }

  async upsertOrder(wcOrder) {
    const orderData = {
      wcOrderId: wcOrder.id,
      orderNumber: wcOrder.number,
      status: wcOrder.status,
      total: parseFloat(wcOrder.total),
      subtotal: parseFloat(wcOrder.subtotal),
      tax: parseFloat(wcOrder.total_tax),
      shippingTotal: parseFloat(wcOrder.shipping_total),
      discountTotal: parseFloat(wcOrder.discount_total),
      isPaid: wcOrder.date_paid !== null,
      paymentMethod: wcOrder.payment_method,
      paymentMethodTitle: wcOrder.payment_method_title,
      currency: wcOrder.currency,
      customerId: wcOrder.customer_id,
      billingAddress: this.formatAddress(wcOrder.billing),
      shippingAddress: this.formatAddress(wcOrder.shipping),
      lineItems: wcOrder.line_items.map(item => ({
        id: item.id,
        productId: item.product_id,
        variationId: item.variation_id,
        name: item.name,
        quantity: item.quantity,
        total: parseFloat(item.total)
      })),
      dateCreated: new Date(wcOrder.date_created),
      dateModified: new Date(wcOrder.date_modified),
      syncedAt: new Date()
    };

    return Order.findOneAndUpdate(
      { wcOrderId: wcOrder.id },
      orderData,
      { upsert: true, new: true }
    );
  }

  async syncCustomers(incremental = true) {
    try {
      const result = await woocommerceService.getCustomers();
      let syncedCount = 0;

      for (const wcCustomer of result.data) {
        await this.upsertCustomer(wcCustomer);
        syncedCount++;
      }

      this.lastSyncTime.customers = new Date();
      logger.info(`Synced ${syncedCount} customers`);
    } catch (error) {
      logger.error('Failed to sync customers:', error);
      throw error;
    }
  }

  async upsertCustomer(wcCustomer) {
    const customerData = {
      wcCustomerId: wcCustomer.id,
      firstName: wcCustomer.first_name,
      lastName: wcCustomer.last_name,
      email: wcCustomer.email,
      role: wcCustomer.role,
      billingAddress: this.formatAddress(wcCustomer.billing),
      shippingAddress: this.formatAddress(wcCustomer.shipping),
      dateCreated: new Date(wcCustomer.date_created),
      syncedAt: new Date()
    };

    return Customer.findOneAndUpdate(
      { wcCustomerId: wcCustomer.id },
      customerData,
      { upsert: true, new: true }
    );
  }

  async syncCategories() {
    try {
      const categories = await woocommerceService.getProductCategories();
      let syncedCount = 0;

      for (const wcCategory of categories) {
        const categoryData = {
          wcCategoryId: wcCategory.id,
          name: wcCategory.name,
          slug: wcCategory.slug,
          description: wcCategory.description,
          image: wcCategory.image ? {
            id: wcCategory.image.id,
            src: wcCategory.image.src,
            alt: wcCategory.image.alt
          } : null,
          syncedAt: new Date()
        };

        await Category.findOneAndUpdate(
          { wcCategoryId: wcCategory.id },
          categoryData,
          { upsert: true, new: true }
        );

        syncedCount++;
      }

      logger.info(`Synced ${syncedCount} categories`);
    } catch (error) {
      logger.error('Failed to sync categories:', error);
    }
  }

  formatAddress(address) {
    return {
      firstName: address.first_name || '',
      lastName: address.last_name || '',
      address1: address.address_1 || '',
      address2: address.address_2 || '',
      city: address.city || '',
      state: address.state || '',
      postcode: address.postcode || '',
      country: address.country || '',
      email: address.email || '',
      phone: address.phone || ''
    };
  }

  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTimes: this.lastSyncTime
    };
  }

  async manualSync(type = 'all') {
    if (type === 'all') {
      return this.fullSync();
    }

    switch (type) {
      case 'products':
        return this.syncProducts(false);
      case 'orders':
        return this.syncOrders(false);
      case 'customers':
        return this.syncCustomers(false);
      default:
        throw new Error('Invalid sync type');
    }
  }
}

module.exports = new SyncService();
```

---

This comprehensive backend implementation guide covers all aspects of building a production-ready WooCommerce dashboard backend. Continue with specific controller implementations and additional utilities as needed for your specific requirements.
