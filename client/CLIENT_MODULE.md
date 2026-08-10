# Client Module — RigCraft

The `client/` directory is the complete frontend for the **RigCraft** e-commerce platform — a React + Vite single-page application serving both the public storefront and the administrative dashboard from a single codebase.

## At a Glance

| Concern | Technology |
|---|---|
| Build tool | Vite 8 with the React SWC plugin |
| UI framework | React 19 + Tailwind CSS v4 |
| Component library | MUI v9 (`@mui/material`, icons, data-grid) |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 |
| State | React Context (runtime) + Zustand v5 (admin, persisted) |
| HTTP | Axios (interceptor-based auth + token refresh) + Socket.IO client |
| Auth | JWT in `localStorage`, Google OAuth (`@react-oauth/google`) |
| Forms | `react-hook-form` + Zod |
| Animations | `framer-motion` |
| Testing | Vitest + Testing Library |
| Linting | Flat-config ESLint with React Hooks + Refresh rules |

## Project Layout

```
client/
├── index.html              # HTML entry; loads /src/main.jsx
├── vite.config.js          # Vite config: React plugin + Tailwind
├── eslint.config.js        # Flat ESLint config
├── vercel.json             # SPA rewrite for Vercel deploys
├── .env / .env.development # Vite-prefixed env vars
├── package.json
├── src/
│   ├── main.jsx            # React entry — providers bootstrap
│   ├── App.jsx             # Root router (public + admin routes)
│   ├── index.css           # Tailwind base + shared theme tokens
│   │
│   ├── api/                # Thin Axios request wrappers (public app)
│   │   ├── client.js       # axios instance (baseURL /api/v1)
│   │   ├── auth.js
│   │   ├── cart.js
│   │   └── wishlist.js
│   │
│   ├── shared/             # Cross-cutting utilities shared by both apps
│   │   ├── api/
│   │   │   ├── axios.js          # Shared axios instance
│   │   │   ├── endpoints.js      # Central API endpoint map
│   │   │   └── interceptors.js   # Request/response interceptors (auth + 401 redirect)
│   │   ├── auth/token.js         # localStorage JWT get/set/clear
│   │   ├── socket.js             # Socket.IO client wrapper
│   │   └── utils/formDataHelper.js
│   │
│   ├── context/            # React Context providers (public app)
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── WishlistContext.jsx
│   │   └── BuilderContext.jsx    # PC Builder stateful engine
│   │
│   ├── components/         # Reusable UI primitives (public)
│   ├── sections/           # Page-level section blocks (Home, Deals, Builder)
│   ├── pages/              # Route-level React components (public)
│   ├── hooks/              # Custom hooks (useSearch, useDialog)
│   ├── services/           # Higher-level API service modules (public)
│   ├── constants/          # Static data (categories.js)
│   ├── utils/              # Pure utilities (builder logic, sanitizers)
│   └── tests/              # Vitest unit tests
│
│   ├── admin/              # — Admin console application —
│   │   ├── routes/          # AdminRoutes.jsx + ProtectedRoute.jsx
│   │   ├── components/      # MUI-based admin components (tables, forms, layout)
│   │   ├── pages/            # CRUD pages per resource (brands, categories, etc.)
│   │   ├── services/         # Admin API service objects (normalize response)
│   │   ├── store/            # Zustand stores (auth, notifications, settings)
│   │   ├── hooks/            # Admin-specific hooks (useAdminList, useAdminMutation)
│   │   ├── constants/        # Static admin data (sidebar, routes, status enums)
│   │   ├── utils/            # Admin utilities (error extraction, formatting)
│   │   └── styles/           # Admin theme CSS variables
│   └── data/                 # Local static data (items.js, mockData.js)
```

## Bootstrapping & Provider Tree

`main.jsx` mounts the application. Google OAuth is only wrapped when `VITE_GOOGLE_CLIENT_ID` is set.

```
GoogleOAuthProvider? ── App
App
 ├─ QueryClientProvider (TanStack)
 ├─ BrowserRouter
 │    ├─ ScrollToTop
 │    ├─ ToastProvider
 │    │    └─ ToastContext (positions admin ↔ top-right, public ↔ bottom-right)
 │    ├─ AuthProvider       ── AuthContext
 │    ├─ CartProvider       ── CartContext
 │    ├─ WishlistProvider   ── WishlistContext
 │    └─ Routes
 │         ├─ /admin/*      → <AdminRoutes />  (protected, role-gated)
 │         └─ PublicLayout  → <Outlet />        (Navbar / Footer / Chatbot / BackToTop)
```

### Public vs. Admin split

The two applications share the same dependency tree but are otherwise isolated:

**Public storefront** (`src/` root-level)
- Routing, state, services, and pages under `src/pages`, `src/components`, `src/sections`, `src/context`.
- Uses React Context for auth/cart/wishlist.
- Guest cart & wishlist are persisted to `localStorage` under `rigcraft_cart_guest` / `rigcraft_wishlist_guest` keys.
- Toast position: bottom-right.

**Admin console** (`src/admin/`)
- Own route tree rooted at `/admin/*`, guarded by `ProtectedRoute` + Zustand `useAuthStore` (persisted to `admin-auth-storage`).
- Uses Zustand for auth, notification, and site-settings stores.
- Toast position: top-right.
- All admin API traffic uses the shared `shared/api/axios` instance with the auth interceptor.

The two apps never import each other — `src/admin/` re-exports the toast primitives from `src/components/toast/` in `services/Toast.jsx` for convenience, but otherwise the dependency direction is strictly admin → shared.

## API Layer

The HTTP layer lives in `src/shared/api/` and is consumed by both apps.

**`src/shared/api/axios.js`** — the canonical Axios instance:
- `baseURL` = `VITE_API_URL` (`http://localhost:5000/api/v1` in dev).
- `withCredentials: true` + 30 s timeout.

**`src/shared/api/interceptors.js`** — mounted once at `src/main.jsx:5` (`import "./shared/api/interceptors"`):
- *Request*: reads the JWT via `getToken()` and attaches `Authorization: Bearer <token>`.
- *Response*: 
  - On token-issuing routes (`/auth/login`, `/auth/register`, `/auth/google`, `/auth/refresh-token`), the access token from `data.data.accessToken` is persisted to `localStorage` via `setToken()`.
  - On any `401` from a **non-public** route, it clears the token, flushes `accessToken` from legacy `localStorage`, and hard-redirects to `/admin/login` or `/login` depending on the current path.

**Token storage** (`src/shared/auth/token.js`):
- Key `rigcraft_token` in `localStorage`. `getToken`/`setToken`/`clearToken` are all try/catch-wrapped to survive private-browsing errors.

**Endpoint map** (`src/shared/api/endpoints.js`) — a single `ENDPOINTS` constant object groups endpoints by resource: `AUTH`, `PRODUCT`, `PREBUILT`, `CATEGORY`, `BRAND`, `CART`, `WISHLIST`, `ORDER`, `DEAL`, `COUPON`, `BUILDER`, `DASHBOARD`, `SETTINGS`, `SUPPORT`, `REVIEW`, `USER`, `NOTIFICATION`, `SEARCH`, `FAQ`, `UPLOAD`, and `ADMIN_*` variants. Many accept a parameterized closure, e.g. `PRODUCT.DETAILS(id)` → `/products/${id}`.

### Service objects

Two parallel service trees exist:

1. **Public `src/services/*.service.js`** (18 files) — thin async functions returning `data` directly (e.g. `auth.service.js`, `product.service.js`, `prebuilt.service.js`).
2. **Admin `src/admin/services/*.js`** (18 files) — each returns a *normalized* `{ data, total }` list shape and maps API field names to the admin form's expected fields (e.g. `productService` converts `price` → `regularPrice`, `salePrice`; `orderService` flattens `user` to `customer`).

**Normalization pattern** — every admin service follows the same structure:
```js
const normalizeItem = (raw) => ({ ...raw, id: raw._id, _id: undefined, __v: undefined, /* renamed fields */ });
const normalizeList   = (res) => {
  const docs = res.docs || res.data || res.[plural] || [];
  return { data: docs.map(normalizeItem), total: res.pagination?.total ?? res.totalDocs ?? docs.length };
};
```
Mutation methods (`create`, `update`, `delete`, `toggleStatus`, etc.) unwrap `data.data` and pass payloads through `adaptPayload` (field renaming + `toFormData` for file uploads) before dispatching.

### Real-time: Socket.IO

`src/shared/socket.js` exposes a lazily-connected `io()` client:
- `connectSocket()` sets `socket.auth = { token: getToken() }` and connects (`autoConnect: false` by default).
- `AdminLayout` connects on mount (when `isAuthenticated`) and listens for `notification:new`, refreshing the unread count.
- The client supports up to 10 reconnection attempts with exponential backoff.

## State Management

Three distinct patterns are used, intentionally:

| Pattern | Where | Purpose |
|---|---|---|
| **React Context** | `src/context/*` | Public-app runtime state — auth, cart, wishlist, PC builder |
| **Zustand (persisted)** | `src/admin/store/*` | Admin global state with `localStorage` persistence |
| **TanStack Query** | Both apps | Server cache (list, detail, mutations) with invalidation |

### Auth — two parallel systems

**Public app** (`src/context/AuthContext.jsx`):
- Tracks `isLoggedIn` + `user` object, persisted to `localStorage` under `rigcraft_auth` / `rigcraft_user`.
- Listens for a window-level `rigcraft:auth-logout` event so logout dispatched from the admin panel propagates.
- `handleAuthSuccess()` (`src/utils/authSuccess.js`) writes to **both** `AuthContext` (via `login()`) and `useAuthStore` (via `setState`), then routes admins to `/admin/dashboard` or public users to `/`. This is the bridge between the two systems.

**Admin app** (`src/admin/store/authStore.js`):
- Zustand store with `persist` middleware → key `admin-auth-storage`, v1 schema migration.
- `login()` posts to `/auth/login`, normalizes the user shape, and sets `isAuthenticated: true`.
- `logout()` optionally calls `/auth/logout` server-side, then clears all client state and dispatches the `rigcraft:auth-logout` window event so the public `AuthContext` reacts.

### Cart & Wishlist

`CartContext` (`src/context/CartContext.jsx`) and `WishlistContext` implement a **dual-mode** strategy:
- **Authenticated** → data is fetched via TanStack Query (`getCart` / `getWishlist`), mutations go through `api/cart.js` + `api/wishlist.js`.
- **Guest** → data lives in React state, serialized to `localStorage` (`rigcraft_cart_guest` / `rigcraft_wishlist_guest`).

Both contexts expose the same interface (`addToCart`, `removeFromCart`, `updateQuantity`, `clearCart` / `addToWishlist`, `removeFromWishlist`) so consuming components are auth-agnostic. `api/cart.js` provides the authenticated server path.

### PC Builder

`src/context/BuilderContext.jsx` is the most complex context — a self-contained state machine for the PC configurator (`src/pages/Pcbuilder.jsx`). Key concepts:

- **9 steps** (`STEPS` constant): CPU → Motherboard → Memory → Storage → GPU → Case → PSU → Cooling → Review.
- **Multi-slot categories** (`MULTI_SLOT_CATEGORIES = ['ram', 'ssd']`): RAM and storage can have multiple entries, each tracked as `{ item, quantity }`. Slot capacity is derived from the selected motherboard's `maxMemorySlots` / `storageSlots`.
- **Draft restoration**: A build passed via React Router navigation state (or legacy `draftBuild` localStorage key) is normalized through `normalizeDraftBuild` + `DRAFT_CATEGORY_MAP`.
- **Derived state** (computed via `useMemo`): `basePrice`, `assemblyFee`, `totalPrice`, `estWattage`, `compatibility`, `progressPercent`, `isSlotFilled`.
- **Compatibility**: Delegates to `src/utils/builderCompatibility.js` (client-side mirror of `server/src/services/compatibility.service.js`). Two functions:
  - `validateBuilderBuild(parts)` → `{ status: 'compatible' | 'incompatible' | 'incomplete', issues[], required[], optional[] }`
  - `validateBuilderBuildDetailed(parts)` → per-pairing `{ checks: [{id, label, status, message}] }` for the live UI.
- **Performance**: `src/utils/builderPerformance.js` provides `estimatePerformance(parts)` → `{ gaming: {1080p, 1440p, 4K}, productivity, overall }` scores derived from price tiers, VRAM, TDP, and RAM/storage capacity.
- Builder settings (assembly fee, completeness requirement) are fetched from `/builds/settings`.

### Admin stores (Zustand)

- **`authStore`** — `user`, `isAuthenticated`, `login`, `logout`, `setUser`.
- **`notificationStore`** — `unreadCount`, `fetchUnreadCount()`. Wired to Socket.IO `notification:new`.
- **`settingsStore`** — `storeName`, `logo`, `fetchSettings()`. Populated from `/settings/public` on sidebar load.

## Routing

### Public routes (`src/App.jsx`)

All public routes render inside `PublicLayout` — a wrapper that provides the shared `Navbar`, `FirstOrderCoupon` banner, animated page transitions (`framer-motion` + `PageTransition`), `Footer`, `Chatbot`, and `BackToTop`. Notable routes:

```
/                     → Home         (Hero + sections)
/prebuild             → Prebuild     (prebuilt catalog)
/builder              → Pcbuilder    (BuilderContext provider)
/components           → Components   (+ /:category)
/detail/:id           → Detail       (product/prebuilt detail)
/cart, /wishlist      → Cart, Wishlist
/deals, /alldeals     → Deal pages
/login, /register     → Auth flows
/profile, /orders     → Account pages
/my-tickets, /contact → Support
/help, /faq, /about   → Static pages
```

### Admin routes (`src/admin/routes/AdminRoutes.jsx`)

Rooted at `/admin/*`, wrapped in `AdminLayout` (sidebar + header + `Outlet`). Every route is gated by `ProtectedRoute` which requires `isAuthenticated` and (where specified) a role of `admin` or `manager`. The resource hierarchy follows a standard CRUD pattern:

```
/admin/dashboard                 → Dashboard
/admin/products[/:id[/edit]]     → List / Detail / Create / Edit
/admin/categories[/:id[/edit]]
/admin/brands[/:id[/edit]]
/admin/prebuilt[/:id[/edit]]
/admin/orders/:id                → List / Detail
/admin/coupons[/:id[/edit]]
/admin/deals[/:id[/edit]]
/admin/reviews/:id               → List / Detail
/admin/users/:id                 → List / Detail
/admin/settings, /admin/profile
/admin/support/:id, /admin/faqs[/:id[/edit]]
/admin/notifications[/:id]
/admin/newsletter
```

`Sidebar` (`src/admin/components/layout/Sidebar.jsx`) is driven by the `SIDEBAR_SECTIONS` constant in `src/admin/constants/sidebar.js` — each section has an icon map and role requirements. Sidebar state (open/collapsed/mobile) is local to `AdminLayout`.

## Key Hooks

### Public `src/hooks/`
- **`useSearch.js`** — A full-featured debounced search controller used by `Navbar`/`SearchBar`. Manages query state, async fetching (300 ms debounce, request-id staleness guard), recent searches (localStorage), keyboard navigation (arrow keys / Enter / Escape), and click-outside dismissal. Returns refs for desktop + mobile search containers.
- **`useDialog.js`** — Trap-focus + Escape-to-close + body-scroll-lock for modal dialogs.

### Admin `src/admin/hooks/`
- **`useAdminList.js`** — TanStack Query wrapper around paginated list endpoints. Accepts a `service` object (with `.list(params)`), maps `params` → `{ page, pageSize, search, ...filters }`, auto-toasts errors (suppressible via `skipErrorToast`), and uses `keepPreviousData` for smooth page transitions.
- **`useAdminMutation.js`** — Wraps `useMutation` with automatic query invalidation (one or more `queryKey`s), success/error toasts, and optional `onSuccess`/`onError` callbacks.
- **`useDebounce`** (300 ms, used by `useSearch`), **`usePagination`** (page + `rowsPerPage` state with `localStorage` persistence of the page-size preference), **`useViewportRows`** (ResizeObserver-based row count for virtualized-looking tables).

## Key Components

### Shared UI primitives

| Component | Location | Summary |
|---|---|---|
| `AdminButton` | `admin/components/common/Button.jsx` | MUI Button wrapper with variant/size tokens (primary, secondary, danger, success, ghost) and a `loading` prop that swaps children for a `CircularProgress`. Admin-only. |
| `AdminAlert` | `admin/components/common/Alert.jsx` | MUI Alert themed via admin CSS variables; severity maps to success/warning/error/info. |
| `DataTable` | `admin/components/tables/DataTable.jsx` | MUI Table + Paper with built-in loading (`Loading`), empty state (`EmptyState`), optional row-selection checkbox, column renderer hooks (`col.render`), and sticky `TablePagination`. |
| `Toast` system | `src/components/toast/*` | Framer Motion animated toasts. `ToastProvider` exposes `toast`/`success`/`error`/`warning`/`info`/`dismiss` via context; supports rich objects (`title`, `description`) or plain strings. Position is route-aware. |

### Public-facing

| Component | Summary |
|---|---|
| `Navbar` | Desktop + mobile navigation with mega-menu, search bar, cart/wishlist counters, auth profile dropdown. |
| `Chatbot` | AI assistant (`@google/generative-ai`) embedded in a floating widget on all public pages. |
| `Card` | Reusable product card with rating stars, pricing, badges, and `framer-motion` hover. |

### Admin forms

The `src/admin/components/forms/` directory contains large form components (`ProductForm.jsx` ~27 KB, `PrebuiltForm`, `DealForm`, `CouponForm`, `CategoryForm`, `BrandForm`, `ComponentSelector`). They use `react-hook-form` + Zod, render dynamic spec/compatibility field tables driven by `SPEC_TEMPLATES` from `src/admin/constants/compatibilityFields.js`, and submit via `toFormData` when file uploads are present.

## Styling

Tailwind CSS v4 is configured in `vite.config.js` via `@tailwindcss/vite`. Two style layers:

1. **`src/index.css`** — `@import "tailwindcss"` + CSS `@theme` block with shared design tokens (`--color-primary`, `--color-bg-primary`, etc.) and global cursor rules.
2. **`src/admin/styles/`** — `--color-admin-*` design tokens (sidebar, cards, borders, status colors) consumed exclusively by MUI `sx` props in admin components.

Tailwind is used for the public app's layout utilities; MUI's `sx`/`styled` approach dominates the admin console.

## Environment & Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api/v1` | Base API URL (both axios instances) |
| `VITE_SOCKET_URL` | same origin | Socket.IO server origin |
| `VITE_GOOGLE_CLIENT_ID` | (see `.env`) | Google OAuth client ID |

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`. Production deploys target Vercel (`vercel.json` rewrites all routes to `index.html` for SPA fallback).

## Testing

- **Framework**: Vitest (`vitest.config.js`).
- **Setup**: `src/tests/setup.js` imports `@testing-library/jest-dom`.
- **Structure**: `src/tests/{components,pages,services,utils}/` mirrors the `src/` tree.
- Scripts: `npm test` (run), `npm run test:watch` (watch), `npm run test:coverage` (v8 coverage).

## Connecting to the Backend

The frontend assumes a separate Express/Mongoose API at `http://localhost:5000`:

- **Auth**: `/auth/login`, `/auth/register`, `/auth/refresh-token`, `/auth/google`, `/auth/profile`, `/auth/cart` (PUT to merge guest cart on login), `/auth/wishlist` (PUT).
- **Catalog**: `/products`, `/categories`, `/brands`, `/prebuilt-pcs`, `/deals`, `/builds`.
- **Orders**: `/cart`, `/cart/items`, `/cart/apply-coupon`, `/orders`.
- **Admin**: `/admin/*`, `/dashboard/*`, `/users`, `/reviews`, `/settings`, `/support`, `/faqs`, `/coupons`.
- **Media**: `/uploads/*` (proxied) serves images; `toFormData` + `uploadService` handle file uploads via `FormData`.
- **Real-time**: Socket.IO events `notification:new`, `support:join`/`support:leave`.

The 401 interceptor and `clearToken()` provide the client-side half of the auth refresh flow; the server is expected to issue tokens at `data.data.accessToken`.
