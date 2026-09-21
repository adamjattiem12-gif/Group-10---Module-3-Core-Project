# FoodBoxx

FoodBoxx is a meal prep and snack-box e-commerce application for students and young professionals. It supports product browsing, custom-box building, orders, subscriptions, and payments.

## Live deployment

**Live URL:** https://group-10-module-3-core-project-production-30a0.up.railway.app

**Demo credentials:**

```text
Email:    demo@foodboxx.co.za
Password: Demo123!
```

## Single-server architecture

FoodBoxx runs on one Express server. The server exposes all backend endpoints under `/api` and, after the frontend is built, serves the Vue application from `frontend/dist`. Client-side routes return `frontend/dist/index.html`; unknown `/api/*` routes always return a JSON 404 response.

## Requirements

- Node.js 20 LTS and npm
- MySQL 8 or MariaDB 10.4+

## Environment configuration

Copy `.env.example` to `.env` and set the values for your local MySQL/MariaDB instance and PayFast sandbox.

```env
PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=foodboxx
DB_PORT=3306

# Auth
JWT_SECRET=replace-with-a-strong-secret

# CORS
CORS_ORIGIN=http://localhost:3000

# Payments — simulated gateway + PayFast sandbox
PAYMENT_SIMULATED_DELAY_MS=1500
PAYFAST_SANDBOX=true
PAYFAST_MERCHANT_ID=10054335
PAYFAST_MERCHANT_KEY=idbgo8pdnta2j
PAYFAST_PASSPHRASE=
BASE_URL=http://localhost:3000

# Optional email notifications (skipped if not set)
# SMTP_HOST=
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASSWORD=
# SMTP_FROM=FoodBoxx <no-reply@example.com>

# Bcrypt
BCRYPT_ROUNDS=10
```

`DB_HOST`, `DB_USER`, and `DB_NAME` are required. The server verifies its MySQL connection before it begins listening.

## Local setup

From the repository root, run these three commands in order:

```bash
npm run setup
npm run db:schema && npm run db:seed
npm start
```

- `npm run setup` installs root + frontend dependencies and builds the Vue frontend via the `postinstall` hook.
- `npm run db:schema` and `npm run db:seed` load `database/schema.sql` and `database/seed.sql` into the local MySQL instance. They assume `mysql` is on your PATH and prompt for the root password.
- `npm start` boots the Express server at `http://localhost:3000`.

For backend development with Node's watch mode, run:

```bash
npm run dev
```

## Deploying to Railway

1. Create a new Railway project and deploy from this GitHub repository.
2. Add the **MySQL** plugin (New → Database → MySQL). Railway provisions the database automatically.
3. On the app service, add the following environment variables:

   | Variable | Value |
   | --- | --- |
   | `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
   | `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
   | `DB_USER` | `${{MySQL.MYSQLUSER}}` |
   | `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
   | `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
   | `JWT_SECRET` | a long random string |
   | `CORS_ORIGIN` | `https://<your-app>.up.railway.app` |
   | `BASE_URL` | `https://<your-app>.up.railway.app` |
   | `PAYFAST_SANDBOX` | `true` |
   | `PAYFAST_MERCHANT_ID` | `10054335` |
   | `PAYFAST_MERCHANT_KEY` | `idbgo8pdnta2j` |
   | `NODE_ENV` | `production` |

4. Generate a public domain on the app service (Settings → Networking → Generate Domain).
5. Seed the Railway database using the Railway MySQL Console or the Railway CLI:

```bash
railway run --service MySQL mysql -u root -p"$MYSQL_ROOT_PASSWORD" railway < database/schema.sql
railway run --service MySQL mysql -u root -p"$MYSQL_ROOT_PASSWORD" railway < database/seed.sql
```

Note: Railway runs behind a reverse proxy. `server.js` sets `app.set('trust proxy', 1)` so that `express-rate-limit` can identify clients correctly.

## Demo credentials

```text
Email: demo@foodboxx.co.za
Password: Demo123!
```

## Project structure

```text
FoodBoxx/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── TEST_CHECKLIST.md
│   └── presentation/
├── frontend/          (Vue 3 + Vite + Pinia)
├── server/            (Express MVC)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── server.js
└── package.json
```

## API overview

The API is available under `/api`.

- `/api/auth` — authentication (register, login, profile)
- `/api/products` — products and builder items
- `/api/orders` — orders (one-off, custom, subscription)
- `/api/payments` — simulated card gateway
- `/api/subscriptions` — subscription lifecycle
- `/api/payments/payfast` — PayFast sandbox (initiate, confirm, notify)

Detailed endpoint documentation is in [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

## Payment systems

FoodBoxx supports two payment paths that coexist:

1. **Simulated card gateway** (`/api/payments`) — for demonstration. Card ending `0002` declines with HTTP 402; any other card approves.
2. **PayFast sandbox** (`/api/payments/payfast`) — full redirect flow to `sandbox.payfast.co.za`. The sandbox wallet does not return query params, so the frontend has a fallback branch that confirms the payment using the pending reference stored in `sessionStorage`.

## Technologies

- **Frontend:** Vue 3, Vite, Pinia, Vue Router, Bootstrap 5, SweetAlert2, Lucide icons
- **Backend:** Node.js, Express 5, MySQL/MariaDB (mysql2)
- **Auth:** bcryptjs, JSON Web Tokens
- **Payments:** Simulated gateway + PayFast sandbox
- **Optional email:** nodemailer (skipped if SMTP vars are not set)
- **Deployment:** Railway

## Database schema

Exactly five tables, as required by the brief:

- `users` — accounts with bcrypt-hashed passwords and dietary preferences
- `products` — boxes, meals, and snacks with pricing and dietary tags
- `subscriptions` — recurring box subscriptions with status state machine
- `orders` — order headers linking to a user and optional subscription
- `order_items` — order line items with quantity and unit price

All queries use parameterised SQL to prevent injection.
