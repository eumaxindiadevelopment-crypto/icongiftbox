---
name: corporate-giftslatest
description: Full-stack corporate gifts e-commerce website built with React (frontend + admin) and Node.js/Express/MySQL backend. Three separate apps — frontend (customer site), admin (dashboard), server (API). Use this as the complete reference for project structure, startup commands, API routes, component connections, and database setup.
compatibility: React 18, TypeScript, Vite, Node.js, Express, MySQL, Sequelize, JWT
---

# Corporate Gifts Website — Project Reference

---

## Project Structure

```
corporate-giftslatest/
├── frontend/        →  Customer website   (port 5173)
├── admin/           →  Admin dashboard        (port 5174)
├── server/          →  Backend API + MySQL    (port 5000)
├── node_modules/
├── comman.txt       →  Quick reference commands
└── SKILL.md         →  This file
```

---

## How to Start Everything

### Step 1 — Start MySQL (via XAMPP)
Start MySQL from the XAMPP Control Panel (or ensure `mysqld.exe` is already running — check with `Get-NetTCPConnection -State Listen | Where LocalPort -eq 3306`). phpMyAdmin manages the `corporate-gifts` database.

### Step 2 — Start Backend Server (new terminal)
```powershell
cd d:\ReactWebsite\corporate-giftslatest\server
npm start
```

### Step 3 — Start Frontend (new terminal)
```powershell
cd d:\ReactWebsite\corporate-giftslatest\frontend
npm run dev
```

### Step 4 — Start Admin (new terminal)
```powershell
cd d:\ReactWebsite\corporate-giftslatest\admin
npm run dev
```

---

## URLs

| App | URL |
|---|---|
| Customer website | http://localhost:5173 |
| Admin panel | http://localhost:5173/admin |
| Admin (direct) | http://localhost:5174/admin |
| API health check | http://localhost:5000/api/health |

---

## Admin Login

| Field | Value |
|---|---|
| Email | admin@corporategifts.in |
| Password | Admin@123 |

---

## Tech Stack

### Frontend (`frontend/`)
- React 18 + TypeScript
- Vite (port 5173)
- React Router v6
- Axios (API calls via `src/lib/api.ts`)
- Bootstrap + custom SCSS
- Swiper.js (sliders)
- Framer Motion (animations)
- React Toastify (notifications)

### Admin (`admin/`)
- React 18 + JavaScript (JSX)
- Vite (port 5174, base `/admin`)
- React Router v6
- Axios with JWT interceptor (`src/lib/api.js`)
- Zustand (auth state — `src/store/authStore.js`)
- Tailwind CSS

### Server (`server/`)
- Node.js + Express
- MySQL + Sequelize (`src/config/database.js`, `src/models/`)
- MVC structure: `src/routes/` (thin routers) → `src/controllers/` (handler logic) → `src/models/` (Sequelize models)
- JWT authentication (`src/middleware/auth.js`)
- Multer (file uploads → `uploads/` folder)
- dotenv, helmet, cors, morgan, express-rate-limit

---

## Environment Variables (`server/.env`)

```env
PORT=5000
JWT_SECRET=corporategifts_jwt_secret_key_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=corporate-gifts
DB_USER=root
DB_PASSWORD=
DB_DIALECT=mysql
```

---

## Database

- **Engine:** MySQL (via XAMPP), managed through phpMyAdmin
- **Name:** `corporate-gifts`
- **Connection:** `localhost:3306`, user `root`, no password (XAMPP default)
- **Schema:** hand-authored SQL in `server/migrations/001_create_schema.sql` (core commerce) and `002_create_sections_schema.sql` (homepage CMS sections) — paste into phpMyAdmin's SQL tab to (re)create the schema; Sequelize does not auto-sync
- **Seeded automatically** on first server start (`server/src/seed.js`)
- Seed creates: 1 admin user, 6 categories, 12 products
- IDs: MySQL auto-increment integers, aliased to `_id` (stringified) in every JSON response via `server/src/models/_base.js` so the frontend/admin's existing `_id`-based code kept working unchanged
- MongoDB is no longer used anywhere in this project

---

## Backend API Routes

All routes prefixed with `/api`

### Core E-commerce
| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/products` | List / create products |
| GET/PUT/DELETE | `/api/products/:id` | Get / update / delete product |
| GET/POST | `/api/categories` | List / create categories |
| GET/PUT/DELETE | `/api/categories/:id` | Get / update / delete category |
| GET/POST | `/api/orders` | List / create orders |
| GET/PUT/DELETE | `/api/orders/:id` | Get / update / delete order |
| GET/POST | `/api/customers` | List / create customers |
| GET/PUT/DELETE | `/api/customers/:id` | Get / update / delete customer |
| GET/POST | `/api/coupons` | List / create coupons |
| GET/PUT/DELETE | `/api/coupons/:id` | Get / update / delete coupon |

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login → returns JWT |
| POST | `/api/auth/register` | Register user |
| GET | `/api/auth/me` | Get current user |

### Content Sections (Homepage)
| Route | Frontend Component | Admin Page |
|---|---|---|
| `/api/banners` | `MainBannerSlider2` | Content → Banners |
| `/api/about-section` | `AboutusBlog` | Content → About Blog |
| `/api/summer-sale` | `SummerSaleBlog` | Content → Summer Sale |
| `/api/all-production` | `AllProduction` | Content → All Production |
| `/api/great-saving` | `GreatSaving` | Content → Great Saving |
| `/api/hottest-blog` | `HottestBlog` | Content → Hottest Blog |
| `/api/blockbuster` | `BlockbusterDeal` | Content → Blockbuster |
| `/api/offer-section` | `OffersectionSlider` | Content → Offer Section |
| `/api/featured-now` | `FeaturedNowSlider` | Content → Featured Now |
| `/api/shortlist` | `ShortListBlog` | Content → Shortlist |
| `/api/sponsored` | `SponsoredSlider` | Content → Sponsored |
| `/api/trading` | `TradingSliderBlog` | Content → Trading |
| `/api/collection` | `CollectionBlog` | Content → Collection |
| `/api/featured-categories` | `FeaturedCategorySlider` | Content → Featured Categories |
| `/api/product-section-settings` | `ProductSection` | Content → Product Section |

### Other
| Method | Route | Description |
|---|---|---|
| GET | `/api/reports` | Sales / revenue reports |
| GET/PUT | `/api/settings` | Store settings |
| POST | `/api/upload` | Upload image files |
| GET | `/api/health` | Health check |

---

## Frontend Pages (`frontend/src/pages/`)

| Route | Page | Description |
|---|---|---|
| `/` | `Home.tsx` | Homepage with all sections |
| `/shop` | `Shop/ShopStandard.tsx` | Product listing |
| `/shop-list` | `Shop/ShopList.tsx` | Product list view |
| `/product-default` | `Shop/ShopProductDefault.tsx` | Product detail |
| `/shop-cart` | `Shop/ShopCart.tsx` | Shopping cart |
| `/shop-checkout` | `Shop/ShopCheckout.tsx` | Checkout |
| `/shop-order-success` | `Shop/ShopOrderSuccess.tsx` | Order success |
| `/login` | `LoginPage.tsx` | Customer login |
| `/registration` | `Registration.tsx` | Customer register |
| `/account-dashboard` | `Account/DashboardPage.tsx` | Account dashboard |
| `/account-orders` | `Account/AccountOrder.tsx` | Order history |
| `/blogs` | `Blog/BlogDark2Sidebar.tsx` | Blog listing |
| `/about-us` | `About/AboutUs.tsx` | About page |
| `/contact-us-1` | `Contact/ContactUs1.tsx` | Contact page |

---

## Homepage Sections (`frontend/src/elements/Home/`)

All sections fetch from API with static data fallback:

| Component | API Endpoint | Data Field |
|---|---|---|
| `MainbannerSlider2.tsx` | `/api/banners` | `banners[]` |
| `AboutusBlog.tsx` | `/api/about-section` | section data |
| `ProductSection.tsx` | `/api/products` | `products[]` |
| `SummerSaleBlog.tsx` | `/api/summer-sale` | section data |
| `AllProduction.tsx` | `/api/all-production` | section data |
| `GreatSaving.tsx` | `/api/great-saving` | section data |
| `HottestBlog.tsx` | `/api/hottest-blog` | section data |
| `BlockbusterDeal.tsx` | `/api/blockbuster` | `sliderItems[]` |
| `OffersectionSlider.tsx` | `/api/offer-section` | `slides[]` |
| `FeaturedNowSlider.tsx` | `/api/featured-now` | `sliderItems[]` |
| `ShortListBlog.tsx` | `/api/shortlist` | `cards[]` |
| `SponsoredSlider.tsx` | `/api/sponsored` | `slides[]` |
| `TradingSliderBlog.tsx` | `/api/trading` | `slides[]` |
| `CollectionBlog.tsx` | `/api/collection` | `images[]` |
| `FeaturedCategorySlider.tsx` | `/api/featured-categories` | categories |

---

## Admin Pages (`admin/src/pages/`)

| Admin Route | Page | Description |
|---|---|---|
| `/` | `dashboard/DashboardPage` | Sales overview |
| `/products` | `products/ProductsPage` | Product list |
| `/products/new` | `products/ProductFormPage` | Add product |
| `/products/:id/edit` | `products/ProductFormPage` | Edit product |
| `/products/categories` | `products/CategoriesPage` | Categories |
| `/orders` | `orders/OrdersPage` | All orders |
| `/orders/:id` | `orders/OrderDetailPage` | Order detail |
| `/customers` | `customers/CustomersPage` | All customers |
| `/customers/:id` | `customers/CustomerDetailPage` | Customer detail |
| `/reports` | `reports/ReportsPage` | Sales reports |
| `/marketing/coupons` | `marketing/CouponsPage` | Coupons |
| `/inventory` | `inventory/InventoryPage` | Stock management |
| `/media` | `media/MediaPage` | Image uploads |
| `/content/banners` | `content/BannersPage` | Manage banners |
| `/content/featured-categories` | `content/FeaturedCategoriesPage` | Featured cats |
| `/content/about-blog` | `content/AboutBlogPage` | About section |
| `/content/product-section` | `content/ProductSectionPage` | Product section |
| `/content/summer-sale` | `content/SummerSalePage` | Summer sale |
| `/content/all-production` | `content/AllProductionPage` | All production |
| `/content/great-saving` | `content/GreatSavingPage` | Great saving |
| `/content/hottest-blog` | `content/HottestBlogPage` | Hottest blog |
| `/payments` | `payments/PaymentsPage` | Payments |
| `/settings` | `settings/SettingsPage` | Store settings |

---

## API Connection

### Frontend (`frontend/src/lib/api.ts`)
```ts
const api = axios.create({ baseURL: 'http://localhost:5000/api' })
```

### Admin (`admin/src/lib/api.js`)
```js
const api = axios.create({ baseURL: 'http://localhost:5000/api' })
// Auto-attaches JWT token from localStorage key: 'cg_token'
// Redirects to /login on 401
```

---

## File Uploads

- Upload endpoint: `POST /api/upload`
- Files saved to: `server/uploads/`
- Served at: `http://localhost:5000/uploads/filename.jpg`
- Cross-origin enabled for admin (port 5174) to load images

---

## Vite Proxy (frontend → admin)

The frontend Vite config proxies `/admin` to port 5174:
```js
// frontend/vite.config.js
proxy: { '/admin': { target: 'http://localhost:5174' } }
```
So `http://localhost:5173/admin` loads the admin app.

---

## Key Server Files

| File | Purpose |
|---|---|
| `server/src/app.js` | Express app + MySQL connection + all routes |
| `server/src/config/database.js` | Sequelize connection config + JSON-column typeCast fix (MySQL reports JSON columns as BLOB over the wire) |
| `server/src/seed.js` | Seeds admin user, categories, products on startup |
| `server/src/middleware/auth.js` | JWT protect middleware |
| `server/src/middleware/errorHandler.js` | Global error handler |
| `server/src/models/` | All Sequelize models (`_base.js` holds the shared `id`→`_id` JSON alias) |
| `server/src/models/index.js` | All model associations (belongsTo/hasMany/belongsToMany) |
| `server/src/controllers/` | Route handler logic (MVC) — one controller per route file; `_singletonSection.js` is a shared factory for the 13 homepage CMS section controllers |
| `server/src/routes/` | Thin Express routers — path + middleware wiring only, logic lives in controllers |
| `server/src/utils/categoryCounts.js` | Denormalized Category.count maintenance |
| `server/migrations/001_create_schema.sql` | Core commerce schema (users/customers/categories/products/orders/coupons/banners/settings) |
| `server/migrations/002_create_sections_schema.sql` | Homepage CMS section schema (about/summer-sale/hottest-blog/etc. + featured_categories) |
| `server/.env` | Environment variables (MySQL connection, JWT secret) |
| `server/uploads/` | Uploaded images |
| `server/_mongo_backup_phase1/` | Backup of the original Mongoose models/routes, kept for reference (MongoDB itself is no longer used by this project) |
