# RigCraft

RigCraft is a full-stack PC e-commerce platform that lets users browse computer components
and pre-built PCs, assemble their own rig with a PC builder, and complete purchases with
Razorpay payments. It includes a full admin/manager dashboard, coupons, deals, support
tickets, reviews, notifications (REST + real-time via Socket.IO), newsletters, and more.

## Features

- **Product catalog** — components, pre-built PCs, and accessories with categories, brands, filters, search, and featured/related items
- **PC Builder** — pick components by slot (CPU, motherboard, GPU, RAM, storage, PSU, cabinet, cooler, OS) with compatibility validation and saved builds
- **Shopping** — cart with coupons, wishlist, checkout (Razorpay + Cash on Delivery), order tracking and cancellation
- **Reviews** — verified user reviews on products and pre-built PCs with moderation
- **Support** — user-facing tickets and an admin queue with real-time messaging via Socket.IO
- **Notifications** — per-user and role-scoped admin notifications, REST + Socket.IO push
- **Storefront tools** — deals/banners, FAQ, newsletter (CSV export), site settings, maintenance mode
- **Admin dashboard** — stats, sales charts, recent orders, top/low-stock products, order breakdown
- **Auth** — email or phone login, password and phone-OTP login, remember-me with refresh tokens, forgot/reset password, role-based access control (`customer`, `manager`, `admin`)

## Tech Stack

### Server (`server/`)

- **Node.js + Express 4** — REST API under `/api/v1`
- **MongoDB + Mongoose** — data layer (with `mongoose-paginate-v2`)
- **JWT + httpOnly cookies** — authentication & refresh tokens
- **Zod** — request validation
- **Socket.IO** — real-time support chat & notifications
- **Cloudinary** — image storage & CDN
- **Razorpay** — payment gateway
- **Nodemailer** — transactional email (OTP, password reset)
- **express-rate-limit, helmet, cors, hpp, morgan** — security & logging
- **Vitest + supertest** — testing

### Client (`client/`)

- **React 19 + Vite** — SPA
- **React Router 7** — routing
- **MUI (Material UI) + Tailwind CSS** — UI
- **React Query + Axios** — data fetching & caching
- **Zustand** — state management
- **react-hook-form + zod** — forms
- **Recharts** — admin dashboard charts
- **Google Generative AI** — optional AI assistant (`VITE_GEMINI_API_KEY`)

## Repository Structure

```
├── server/                  # Express + MongoDB backend
│   ├── src/
│   │   ├── config/          # DB, Cloudinary, Razorpay config
│   │   ├── constants/       # Enums (roles, statuses, types)
│   │   ├── controllers/     # HTTP handlers
│   │   ├── middlewares/     # Auth, upload, validation, error, maintenance
│   │   ├── models/          # Mongoose models
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # Express routers
│   │   ├── schemas/         # Mongoose schemas
│   │   ├── scripts/         # One-off migration scripts
│   │   ├── services/        # Business logic
│   │   ├── socket/          # Socket.IO handlers & emitters
│   │   ├── tests/           # Vitest integration tests
│   │   ├── uploads/         # Local upload dir (dev)
│   │   ├── utils/           # ApiError, ApiResponse, asyncHandler
│   │   └── app.js           # Express app
│   ├── seed/                # Seed data & seeder
│   └── api/                 # Vercel serverless adapter
├── client/                  # React + Vite frontend
│   └── src/
│       ├── pages/           # Storefront pages
│       ├── admin/           # Admin dashboard
│       ├── services/        # API service modules
│       ├── shared/          # Axios instance, endpoints, UI kit
│       └── store/           # Zustand stores
├── API.md                   # REST + WebSocket API reference
└── DESIGN.md                # Design system reference
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or Atlas)
- **Cloudinary** account (for image uploads)
- **Razorpay** account (for payments)

### 1. Server

```bash
cd server
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # starts on http://localhost:5000
```

### 2. Client

```bash
cd client
npm install
# create a .env file with the variables listed below (reuse an existing one if present)
npm run dev            # starts on http://localhost:5173
```

The Vite dev server proxies `/uploads` requests to `http://localhost:5000`.

### Environment Variables

#### `server/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for access tokens |
| `JWT_EXPIRES_IN` | No | Access token lifetime (default `7d`) |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens (used with remember-me) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | No* | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | No* | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | No | Razorpay webhook signing secret |
| `EMAIL_HOST` | No* | SMTP host for transactional email |
| `EMAIL_PORT` | No | SMTP port |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASS` | No | SMTP password |
| `EMAIL_FROM` | No | From address for outgoing email |
| `CLIENT_URL` | Yes | Frontend URL (used in password-reset links) |
| `CORS_ORIGIN` | No | Allowed CORS origin (defaults to `http://localhost:5173`) |
| `SERVER_ORIGIN` | No | Public server origin used to build absolute image URLs |
| `PORT` | No | Server port (default `5000`) |
| `NODE_ENV` | No | `development` or `production` |

> \* Marked optional only because the store can run without them; **payments and email
> require their respective credentials**. For development, password-reset and OTP emails
> are also printed to the server console.

#### `client/.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (default `http://localhost:5000/api/v1`) |
| `VITE_API_BASE_URL` | Fallback API base URL |
| `VITE_GEMINI_API_KEY` | Optional Google Gemini key for the AI assistant |

### Seed Database

Populate the database with sample categories, brands, products, pre-built PCs, coupons,
deals, FAQs, newsletter subscribers, and mock orders/reviews:

```bash
cd server
npm run seed
```

The seeder creates these login accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@rigcraft.com` | `Admin@123` |
| Manager | `manager@rigcraft.com` | `Manager@123` |
| Customer | (random `customer-N@rigcraft.com`) | `Customer@123` |

## Scripts

### Server

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Start the production server |
| `npm run seed` | Seed the database |
| `npm test` | Run Vitest integration tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run migrate:category-type` | Run the category-type migration script |

### Client

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest tests |

## API Documentation

Full endpoint reference — REST routes, request/response bodies, auth requirements, and
WebSocket events — is in **[API.md](./API.md)**.

## Deployment

- **Server**: deployable on **Vercel** (see `server/vercel.json` + `server/api/index.js`).
  Set the environment variables above in the Vercel dashboard. In production, the
  `uploads` directory resolves to `/tmp/uploads` (ephemeral — uploads should use
  Cloudinary for persistence).
- **Client**: static build (`npm run build`) deployable to Vercel, Netlify, or any static
  host. Configure `VITE_API_URL` to point at your deployed server.

## Testing

Integration tests live in `server/src/tests/` and client tests in `client/src/tests/`.
Both projects use **Vitest** and can be run with `npm test`.
