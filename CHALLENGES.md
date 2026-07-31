# RigCraft — Challenges Faced & Solutions

This document records the technical challenges encountered while building the RigCraft
e-commerce platform and how each one was solved. Entries are grouped by area, and every
item includes a reference to the code that implements the solution.

---

## 1. Architecture & Code Organization

### Keeping the API maintainable as it grew
**Challenge:** The platform spans many features — products, orders, payments, reviews,
support, notifications, newsletters, coupons, deals, and an admin dashboard — and a
single layer of handlers quickly became unmanageable.

**Solution:** The server was split into a layered architecture:
`routes → controllers → services → repositories`. Routes define endpoints, controllers
handle HTTP concerns, services hold business logic, and repositories isolate Mongoose
data access. This makes each feature independently testable and easy to extend.

**Where:** `server/src/routes/`, `server/src/controllers/`, `server/src/services/`, `server/src/repositories/`

### Inconsistent error handling across endpoints
**Challenge:** Different endpoints returned different error shapes and status codes,
making frontend error handling fragile.

**Solution:** Standard `ApiError` and `ApiResponse` utility classes were introduced, and
a central error middleware normalizes database errors (duplicate keys → 409, cast
errors → 400, validation errors → 400) and JWT errors (→ 401).

**Where:** `server/src/utils/ApiError.js`, `server/src/utils/ApiResponse.js`, `server/src/middlewares/error.js`

---

## 2. Deployment & Serverless (Vercel)

### Serverless cold starts re-initializing the Express app
**Challenge:** On Vercel, every invocation could re-create the Express app, re-connect to
MongoDB, and cause slow responses and connection churn.

**Solution:** A singleton app instance is cached at module level, and the MongoDB
connection is stored on `global.mongoose` so it is reused across warm invocations,
with command buffering disabled to fail fast instead of hanging.

**Where:** `server/api/index.js`, `server/src/config/db.js`

### Vercel's ephemeral filesystem
**Challenge:** Uploaded files written to disk on Vercel vanish between requests, and the
default upload directory was not writable.

**Solution:** In production the uploads directory resolves to `/tmp/uploads` and uploads
are kept in memory and streamed to Cloudinary for persistence instead of being saved to
local disk.

**Where:** `server/src/app.js`, `server/src/middlewares/upload.middleware.js`

### DNS resolution failures in the deployment environment
**Challenge:** Outbound connections (to MongoDB, Cloudinary, Razorpay) intermittently
failed DNS resolution in the cloud environment.

**Solution:** The app forces well-known public DNS resolvers (Google `8.8.8.8`,
Cloudflare `1.1.1.1`) at boot.

**Where:** `server/src/app.js`

### Environment variables not loaded before CORS checks
**Challenge:** CORS preflight failed because `dotenv` had not loaded when the CORS
origin list was built, so the allowed origin was undefined.

**Solution:** `dotenv.config()` was moved to the top of `app.js`, before any middleware
configuration.

**Where:** `server/src/app.js`

---

## 3. Authentication & Security

### Protecting session tokens from XSS theft
**Challenge:** Tokens in `localStorage` can be stolen by injected scripts, yet API clients
need a way to send credentials.

**Solution:** Access tokens are set as `httpOnly` + `sameSite: lax` cookies for browser
sessions, while also returned in the response body so mobile/API clients can use an
`Authorization: Bearer` header. The middleware accepts either.

**Where:** `server/src/services/auth.service.js`, `server/src/middlewares/auth.js`

### Stateless JWT refresh tokens cannot be revoked
**Challenge:** A stolen or logged-out refresh token would stay valid until expiry, with no
way to invalidate it server-side.

**Solution:** Refresh tokens are stored on the user document and compared against the
presented token at refresh time. Logging out or being blocked instantly kills the
session. The refresh cookie is also path-scoped to `/api/v1/auth` to minimize exposure.

**Where:** `server/src/services/auth.service.js`

### Deleted or blocked users keeping valid tokens
**Challenge:** A stateless JWT remains valid even if the user is deleted or blocked.

**Solution:** The `protect` middleware re-fetches the user fresh from the database on
every protected request and rejects the request if the user is missing or `isBlocked`.

**Where:** `server/src/middlewares/auth.js`

### User enumeration via the forgot-password flow
**Challenge:** Returning "email not found" revealed which accounts exist.

**Solution:** The forgot-password endpoint behaves identically for unknown and known
emails (silently returns), and password-reset tokens are SHA-256 hashed before storage so
a database leak does not expose usable reset links.

**Where:** `server/src/services/auth.service.js`

### Brute force and OTP guessing
**Challenge:** Login, registration, password reset, and OTP endpoints were exposed to
automated guessing.

**Solution:** `express-rate-limit` (50 requests / 15 minutes) was applied to all auth
routes only, protecting credentials without throttling the rest of the API.

**Where:** `server/src/routes/auth.routes.js`

### Securing passwords and OTPs at rest
**Challenge:** Plain-text passwords or OTPs in the database are catastrophic if leaked.

**Solution:** Passwords are hashed with bcrypt (12 rounds) via a pre-save hook, and OTPs
are stored with `select: false` so they are only ever fetched explicitly. OTPs are
6-digit, expire after 10 minutes, and are cleared after a single use.

**Where:** `server/src/models/user.model.js`, `server/src/services/auth.service.js`

### No SMS gateway for phone-based login
**Challenge:** Phone-OTP login required a real SMS provider, which was unavailable.

**Solution:** The OTP is delivered via email, and the response only reveals a masked email
address — never the full address or the OTP. The SMS service remains a console-log stub
ready for a future provider.

**Where:** `server/src/services/auth.service.js`, `server/src/services/sms.service.js`

---

## 4. Payments & Order Management (Razorpay)

### Webhook signature verification broken by JSON parsing
**Challenge:** Razorpay signs the exact raw request body, but `express.json()` consumes the
stream and re-serialized JSON changes whitespace/key order, breaking the HMAC.

**Solution:** A `verify` callback on `express.json()` captures the untouched raw body into
`req.rawBody` before parsing, and the webhook hashes that raw string.

**Where:** `server/src/app.js`, `server/src/services/payment.service.js`

### Webhook forgery and timing attacks
**Challenge:** An unauthenticated webhook endpoint could be replayed or forged to mark
orders as paid.

**Solution:** The webhook verifies the HMAC-SHA256 signature computed with the Razorpay
webhook secret and compares it using `crypto.timingSafeEqual`, which is resistant to
timing attacks.

**Where:** `server/src/services/payment.service.js`

### Verify callback and webhook both firing (race condition)
**Challenge:** Payment confirmation can arrive twice (client-side verify + server
webhook), risking double stock deduction or double coupon usage.

**Solution:** `confirmPayment` is idempotent — it returns early if the order is already
`paid`, and the webhook path short-circuits on the same check.

**Where:** `server/src/services/order.service.js`, `server/src/services/payment.service.js`

### Abandoned checkouts locking inventory
**Challenge:** If stock were reduced at checkout, abandoned Razorpay orders would hold
stock indefinitely.

**Solution:** Stock is not reduced when a Razorpay checkout is created. It is decremented
only after payment confirmation (or immediately for Cash on Delivery), and checkout
sessions expire after 30 minutes.

**Where:** `server/src/services/order.service.js`

### Payment verification endpoint exposed without auth
**Challenge:** The payment-verify endpoint was originally unprotected, allowing payment
confirmation forgery.

**Solution:** Auth middleware and user context were added to the endpoint so only the
authenticated user who owns the order can verify it.

**Where:** `server/src/routes/payment.routes.js`

### Atomic multi-item stock deduction
**Challenge:** Reducing stock across several products (and pre-built PC components) must
be all-or-nothing — a partial failure would corrupt inventory.

**Solution:** Stock reduction runs inside a MongoDB session transaction so all
decrements commit together or roll back together.

**Where:** `server/src/services/order.service.js`

### Unique order-number collisions under concurrency
**Challenge:** Randomly generated order numbers could collide, failing the unique index.

**Solution:** The generator uses `crypto.randomBytes(3)` with a five-attempt uniqueness
retry loop, and any residual duplicate-key error maps to a 409.

**Where:** `server/src/services/order.service.js`, `server/src/middlewares/error.js`

---

## 5. Real-Time Features (Socket.IO)

### CORS blocking WebSocket upgrades
**Challenge:** Cross-origin Socket.IO connections were rejected by the browser.

**Solution:** The Socket.IO server mirrors the HTTP CORS configuration (allowed origins +
credentials) so upgrades match the REST API policy.

**Where:** `server/src/socket/index.js`

### Authenticating socket connections
**Challenge:** Socket handshakes are not covered by the REST auth middleware, leaving the
socket channel open to unauthenticated users.

**Solution:** A Socket.IO middleware verifies the JWT from the handshake (auth token or
query token), stamps `socket.userId` / `socket.userRole`, and rejects invalid tokens.

**Where:** `server/src/socket/index.js`

### Notifications lost when the socket is unavailable
**Challenge:** If no socket connection exists, emitting a notification could crash or
silently drop data.

**Solution:** Notifications are persisted to MongoDB first and the socket emit is wrapped
in a try/catch, so a missing connection never loses the notification.

**Where:** `server/src/services/notification.service.js`

### Unread counts counting a user's own messages
**Challenge:** Marking a ticket as read also counted the sender's own messages as unread.

**Solution:** The read and unread-count queries exclude the sender (`$ne`), so only the
other party's messages are counted.

**Where:** `server/src/repositories/support-message.repository.js`

---

## 6. File Uploads & Media

### Uploading files to a serverless environment
**Challenge:** Files written to disk on Vercel are lost, and large base64 payloads bloat
requests.

**Solution:** Multer uses `memoryStorage` (files kept in memory, never on disk) and each
buffer is streamed directly to Cloudinary.

**Where:** `server/src/middlewares/upload.middleware.js`, `server/src/services/upload.service.js`

### Cloudinary outage or missing credentials
**Challenge:** The store must not break if Cloudinary is misconfigured or unreachable.

**Solution:** Uploads check whether Cloudinary is configured and fall back to local
storage (`/tmp/uploads` in production) when a Cloudinary upload fails.

**Where:** `server/src/services/upload.service.js`

### Large product images slowing the site
**Challenge:** High-resolution uploads increased page load times.

**Solution:** Cloudinary's on-the-fly optimization (`quality: auto`, `fetch_format: auto`)
is applied at upload time, delegating compression to the CDN.

**Where:** `server/src/services/upload.service.js`

### Multipart forms cannot carry nested JSON
**Challenge:** A single form submission mixes file uploads with complex nested JSON
payloads that multipart encoding cannot express.

**Solution:** The client sends the whole JSON as one `body` form field, and the upload
middleware parses and merges it back into `req.body` before validation.

**Where:** `server/src/middlewares/upload.middleware.js`

---

## 7. Client-Side (React) Challenges

### Cart/wishlist local state racing the backend
**Challenge:** On login, the freshly restored localStorage cart could overwrite the
server cart (or vice versa), losing items.

**Solution:** The cart and wishlist contexts use an `isInitialized` flag plus a short delay
before any backend push, so the hydration of local state never clobbers the server data.
Keys are scoped per user (`rigcraft_cart_<email>`) so switching accounts does not mix
carts.

**Where:** `client/src/context/CartContext.jsx`, `client/src/context/WishlistContext.jsx`

### Expired sessions causing redirect loops
**Challenge:** Automatically refreshing tokens on every 401 could loop or leak stale
React state into the next session.

**Solution:** The Axios interceptor clears the stored token and hard-redirects to the
login page on any unauthenticated error, a deliberately simple and predictable strategy.

**Where:** `client/src/shared/api/interceptors.js`

### Inconsistent product taxonomy between server and builder
**Challenge:** Server category names (`processor`, `graphic`, `power-supply`) do not match
the builder's slot enums (`cpu`, `gpu`, `psu`), causing parts to be filtered out.

**Solution:** The builder normalizes server category names to builder slots with a mapping
before filtering, so every product lands in the correct slot.

**Where:** `client/src/sections/BuilderWorkspace.jsx`

### Browser refresh re-triggering a resumed draft build
**Challenge:** After resuming a saved draft build, a refresh re-applied the draft and
overwrote the user's new selections.

**Solution:** The draft is applied once, then removed from localStorage and the React
Router state is replaced with `navigate('.', { replace: true, state: {} })` so a refresh
does not replay it.

**Where:** `client/src/sections/BuilderWorkspace.jsx`

### Slow multi-step product loading in the PC Builder
**Challenge:** Fetching products per-step caused noticeable lag across the nine-step
wizard.

**Solution:** All products are fetched once (`limit=1000`) and filtered client-side with
`useMemo` per slot, trading one larger request for instant step transitions.

**Where:** `client/src/sections/BuilderWorkspace.jsx`

### Unstructured AI (Gemini) output for the builder
**Challenge:** Free-form AI responses could not drive the build UI reliably.

**Solution:** The AI is constrained with a strict prompt contract using `[PRODUCT_CARD:
id]` and `[BUILD_COMPLETE]` markers, parsed by regex into clickable product selections,
with budget enforcement in the prompt.

**Where:** `client/src/components/Chatbot.jsx`

### Admin settings arriving as partial payloads
**Challenge:** The backend could return incomplete settings, crashing the settings page or
showing blank fields.

**Solution:** The page deep-merges the API payload over a full default settings object, so
missing keys always have sane values.

**Where:** `client/src/admin/pages/settings/Settings.jsx`

---

## 8. Testing

### Integration tests needing a real database
**Challenge:** Tests required a running MongoDB, which made CI and local runs
non-deterministic.

**Solution:** Vitest integration tests run against `mongodb-memory-server`, an in-memory
MongoDB instance spun up per test run, combined with `supertest` against the Express app.

**Where:** `server/src/tests/`, `server/package.json`

### Testing React interactions without a browser
**Challenge:** Component behavior (forms, auth, API calls) needed automated coverage.

**Solution:** Client tests use Vitest with `@testing-library/react` for rendering and
interactions and MSW (Mock Service Worker) to intercept and mock API requests.

**Where:** `client/src/tests/`, `client/package.json`

---

## Summary

The most significant engineering effort centered on **production readiness**: deploying a
stateful Express/MongoDB app to a serverless platform, hardening authentication and
payment flows against real attack vectors, and keeping a feature-heavy codebase
maintainable through strict layering. These challenges were addressed with idempotent
payment confirmation, deferred stock handling, raw-body webhook verification,
DB-backed revocable sessions, and a serverless-aware upload pipeline.
