# Corporate Gifts Website

Full-stack corporate gifts e-commerce platform: a customer-facing storefront, an admin dashboard, and a REST API backend.

| App | Folder | Port | Stack |
|---|---|---|---|
| Customer website | `frontend/` | 5173 | React 18 + TypeScript + Vite |
| Admin dashboard | `admin/` | 5174 | React 18 + JavaScript + Vite |
| API server | `server/` | 5000 | Node.js + Express + MySQL/Sequelize |

---

## Quick Start

**Prerequisites:** Node.js 18+, XAMPP (MySQL + phpMyAdmin) with a database named `corporate-gifts`.

```powershell
# 1. Start MySQL from the XAMPP Control Panel
#    (or confirm it's already running: Get-NetTCPConnection -State Listen | Where LocalPort -eq 3306)

# 2. Backend API
cd server
npm install
npm start          # http://localhost:5000

# 3. Customer frontend
cd frontend
npm install
npm run dev         # http://localhost:5173

# 4. Admin dashboard
cd admin
npm install
npm run dev         # http://localhost:5174/admin
```

The server auto-creates its schema-independent seed data on first boot (`server/src/seed.js`): 1 admin user, 6 categories, 12 products. Table structure itself comes from the SQL migration files in `server/migrations/` — run those once against `corporate-gifts` via phpMyAdmin before first boot.

**Admin login:** `admin@corporategifts.in` / `Admin@123`

---

## Project Structure

```
corporate-giftslatest/
├── frontend/                    Customer website (port 5173)
│   └── src/
│       ├── pages/               Route-level pages (Shop, Account, Blog, etc.)
│       ├── elements/            Reusable page sections (Home sections, MyAccount, Shop)
│       ├── components/          Shared UI (Header, Footer, RequireCustomerAuth, ...)
│       ├── context/             CartContext, CustomerAuthContext
│       ├── router/Index.tsx     All frontend routes
│       └── lib/api.ts           Axios client + typed API calls
│
├── admin/                       Admin dashboard (port 5174, base path /admin)
│   └── src/
│       ├── pages/                Dashboard, Products, Orders, Customers, Content, Settings...
│       ├── store/authStore.js   Zustand auth state
│       └── lib/api.js           Axios client with JWT interceptor
│
├── server/                      API (port 5000)
│   └── src/
│       ├── routes/              Thin Express routers (path + middleware wiring only)
│       ├── controllers/         Route handler logic (MVC) — one file per route group
│       ├── models/               Sequelize models; models/index.js wires associations
│       ├── middleware/          auth.js (JWT), errorHandler.js
│       ├── config/database.js   Sequelize connection + MySQL JSON-column typeCast fix
│       └── seed.js              Idempotent seed data on startup
│   └── migrations/              Hand-authored SQL schema (run once via phpMyAdmin)
│
├── comman.txt                   Personal quick-reference command notes
└── SKILL.md                     Full architecture/route reference (for AI-assisted dev)
```

---

## Architecture Notes

- **MVC on the server**: `routes/` just wires `path → [middleware] → controller.handler`; all logic lives in `controllers/`. The 13 near-identical homepage CMS "section" endpoints (banners, about-section, summer-sale, etc.) share one factory, `controllers/_singletonSection.js`.
- **Database**: MySQL only — there is no MongoDB anywhere in this project. Sequelize models map onto tables created by the SQL files in `server/migrations/`; Sequelize does **not** auto-sync, so phpMyAdmin/the SQL files are the source of truth for schema.
- **`_id` compatibility shim**: the frontend/admin code was originally written against MongoDB's `_id` field. Rather than rewrite every consumer, `server/src/models/_base.js` aliases every model's integer `id` to a stringified `_id` in JSON responses (recursing into eager-loaded associations), and converts MySQL `DECIMAL` columns (which Sequelize serializes as strings) back into real numbers for every price/total/amount field.
- **Auth**: JWT-based for both admin users (`server/src/middleware/auth.js`) and customers (separate `protectCustomer` in `customersController.js`). The frontend guards `/account-*` routes with `RequireCustomerAuth` (`frontend/src/components/RequireCustomerAuth.tsx`).
- **File uploads**: `POST /api/upload` (Multer) saves to `server/uploads/`, served statically and cross-origin so the admin app (port 5174) can load images.

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

## API Overview

All routes are prefixed with `/api`. Full route-by-route table (including all 15 homepage CMS section endpoints and their frontend/admin component mappings) is in [`SKILL.md`](SKILL.md#backend-api-routes).

| Group | Base route |
|---|---|
| Products | `/api/products` |
| Categories | `/api/categories` |
| Orders | `/api/orders` |
| Customers | `/api/customers` |
| Coupons | `/api/coupons` |
| Auth (admin) | `/api/auth` |
| Reports | `/api/reports` |
| Settings | `/api/settings` |
| Uploads | `/api/upload` |
| Health check | `/api/health` |

---

## Further Reference

See [`SKILL.md`](SKILL.md) for the exhaustive reference: every API route, every frontend page/component, every admin page, key server files, and the Vite proxy setup that lets `http://localhost:5173/admin` load the admin app.
