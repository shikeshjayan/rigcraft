# RigCraft Backend — Complete Flow Documentation

## Base URL: `/api/v1`

---

## 1. Authentication Flow

### 1.1 Register
**`POST /auth/register`**
- Rate limited (50 req/15min)
- Validation: `firstName`, `lastName`, `email`, `password`, `confirmPassword`, optional `phone`
- Checks for duplicate email → returns `409 Conflict`
- Hashes password via bcrypt (12 rounds), creates user
- Sets JWT access token in `httpOnly` cookie + response body
- Default role: `customer`

### 1.2 Login (4 modes)
**`POST /auth/login`**

| Mode | Payload | Flow |
|------|---------|------|
| **Email + Password** | `{ email, password }` | Find user by email → compare password → set JWT |
| **Phone + Password** | `{ phone, password }` | Find user by phone → compare password → set JWT |
| **Phone → OTP** | `{ phone }` | Generate 6-digit OTP → store with 10min expiry → log to console (SMS stub) |
| **Phone + OTP** | `{ phone, otp }` | Verify OTP & expiry → clear OTP → set JWT |

- Optional `rememberMe: true` → generates refresh token (30d), stored in separate `httpOnly` cookie with `path: /api/v1/auth`
- Updates `lastLogin` timestamp

### 1.3 Refresh Token
**`POST /auth/refresh-token`**
- Reads `refreshToken` cookie → verifies against DB → issues new tokens
- Rate limited

### 1.4 Logout
**`POST /auth/logout`** — `[auth required]`
- Clears both `token` and `refreshToken` cookies (sets to `"none"` with 5s expiry)

### 1.5 Forgot Password
**`POST /auth/forgot-password`** — Rate limited
- Generates random 32-byte token → SHA256 hash → stores with 10min expiry
- Sends reset URL to email: `<CLIENT_URL>/reset-password/<rawToken>`
- Silent on non-existent email (no enumeration)

### 1.6 Reset Password
**`POST /auth/reset-password`** — Rate limited
- Hashes provided `token` → finds user by hash + expiry check
- Validates `password` + `confirmPassword` match
- Updates password (bcrypt re-hashed via pre-save hook)

### 1.7 Get Profile
**`GET /auth/profile`** — `[auth required]`
- Returns current user document

### 1.8 Update Profile
**`PUT /auth/profile`** — `[auth required]`
- Fields: `firstName`, `lastName`, `email`, `phone`

### 1.9 Update Password
**`PUT /auth/password`** — `[auth required]`
- Validates `currentPassword` → saves `newPassword` (pre-save hook hashes)

### 1.10 Update User Role (Admin)
**`PATCH /auth/users/:id/role`** — `[auth required, admin]`
- Role must be `"admin"`

### Middleware: `protect`
- Reads token from `Authorization: Bearer <token>` header OR `token` cookie
- Verifies JWT → fetches user → checks `isBlocked`

### Middleware: `authorize(...roles)`
- Checks `req.user.role` against allowed roles

---

## 2. Category Flow

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/categories` | List all categories. Query: `?isActive=true`, `?parent=null` (roots), `?parent=<id>` (children) |
| `GET` | `/categories/:id` | Get single category |

### Admin
| Method | Endpoint | Middleware |
|--------|----------|------------|
| `POST` | `/categories` | auth + admin + uploadSingleImage("image") + validate |
| `PUT` | `/categories/:id` | auth + admin + uploadSingleImage("image") + validate |
| `DELETE` | `/categories/:id` | auth + admin |

- Slug auto-generated from name via slugify
- Prevents deletion if has subcategories
- Parent self-reference validation

---

## 3. Brand Flow

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/brands` | List all. Query: `?isActive=true` |
| `GET` | `/brands/:id` | Get single brand |

### Admin
| Method | Endpoint | Middleware |
|--------|----------|------------|
| `POST` | `/brands` | auth + admin + uploadSingleImage("logo") + validate |
| `PUT` | `/brands/:id` | auth + admin + uploadSingleImage("logo") + validate |
| `DELETE` | `/brands/:id` | auth + admin |

---

## 4. Product Flow

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List with pagination + filters |
| `GET` | `/products/featured` | Featured products (default 8) |
| `GET` | `/products/:slug/related` | Related products by category |
| `GET` | `/products/:slug` | Get by slug |

### Admin
| Method | Endpoint | Middleware |
|--------|----------|------------|
| `POST` | `/products` | auth + admin + uploadMultipleImages("images", 10) + validate |
| `PUT` | `/products/:id` | auth + admin + uploadMultipleImages("images", 10) + validate |
| `DELETE` | `/products/:id` | auth + admin |

### Query Params (list)
`category`, `brand`, `productType`, `status`, `minPrice`, `maxPrice`, `search`, `isFeatured`, `page`, `limit`, `sort` (`price_asc`, `price_desc`, `rating`, `sold`, `name`)

- Images uploaded to Cloudinary → stored as `{ url, publicId, alt, isPrimary }`
- Soft-delete via `isDeleted` flag (removed from JSON output)
- Rating auto-updated when reviews change

---

## 5. Prebuilt PC Flow

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/prebuilt-pcs` | List with pagination + filters |
| `GET` | `/prebuilt-pcs/featured` | Featured prebuilt PCs |
| `GET` | `/prebuilt-pcs/category/:category` | Filter by category (gaming, streaming, workstation, office, budget) |
| `GET` | `/prebuilt-pcs/:slug/similar` | Similar prebuilt PCs |
| `GET` | `/prebuilt-pcs/:slug/components` | Get component products |
| `GET` | `/prebuilt-pcs/:slug` | Get by slug (increments viewCount) |

### Admin
| Method | Endpoint | Middleware |
|--------|----------|------------|
| `POST` | `/prebuilt-pcs` | auth + admin + uploadMultipleImages("images", 10) + validate |
| `PUT` | `/prebuilt-pcs/:id` | auth + admin + uploadMultipleImages("images", 10) + validate |
| `DELETE` | `/prebuilt-pcs/:id` | auth + admin |

- Validates required components: CPU, Motherboard, GPU, RAM, PSU, Cabinet
- Pricing stored in `pricing` sub-object (`price`, `salePrice`, `saleStart`, `saleEnd`)

---

## 6. PC Builder Flow

### User
| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| `POST` | `/builds` | auth + validate | Create a new build |
| `GET` | `/builds` | auth | Get user's builds (paginated) |
| `GET` | `/builds/:id` | auth | Get single build |
| `PUT` | `/builds/:id` | auth + validate | Update build (name, components, isPublic) |
| `DELETE` | `/builds/:id` | auth | Delete build |
| `POST` | `/builds/:id/duplicate` | auth + validate | Duplicate a build |
| `POST` | `/builds/:id/validate` | auth | Validate compatibility |
| `POST` | `/builds/:id/add-to-cart` | auth | Add saved build to cart as `savedBuild` item |

### Admin
| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| `GET` | `/builds/admin` | auth + admin | List all builds |
| `GET` | `/builds/admin/analytics` | auth + admin | Build analytics |
| `GET` | `/builds/admin/issues` | auth + admin | Compatibility issues report |
| `POST` | `/builds/admin/settings` | auth + admin + validate | Toggle builder enabled/disabled |

### Compatibility Engine
Validates component pairings:
- CPU socket ↔ Motherboard socket
- RAM type ↔ Motherboard memory type
- GPU length ↔ Cabinet max GPU length
- Cooler height ↔ Cabinet max cooler height
- Motherboard form factor ↔ Cabinet form factor
- Storage interface ↔ Motherboard storage interface
- CPU TDP ↔ Cooler TDP capacity
- Calculates total price, sale price, estimated power (sum TDP × 1.2 safety factor)
- States: `incomplete` (missing required parts), `compatible`, `incompatible`
- Required parts: CPU, Motherboard, GPU, RAM, PSU, Cabinet

---

## 7. Cart Flow

**All endpoints require authentication.**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cart` | Get current cart (creates if not exists) |
| `POST` | `/cart/items` | Add item (product/prebuilt/savedBuild) |
| `PUT` | `/cart/items/:itemId` | Update item quantity |
| `DELETE` | `/cart/items/:itemId` | Remove item from cart |
| `DELETE` | `/cart` | Clear entire cart |
| `POST` | `/cart/apply-coupon` | Apply coupon code |
| `DELETE` | `/cart/remove-coupon` | Remove applied coupon |

### Cart Item Types
| Type | Model | Price Source |
|------|-------|-------------|
| `product` | `Product` | `salePrice` or `price` |
| `prebuilt` | `PrebuiltPC` | `pricing.salePrice` or `pricing.price` |
| `savedBuild` | `SavedBuild` | `totalSalePrice` or `totalPrice` |

### Auto-coupon-removal triggers
Coupon is automatically removed when:
- Item quantity changes above coupon-applicable stock
- An item covered by the coupon is removed
- Items no longer satisfy coupon eligibility rules

### Cart totals calculation
`subtotal` → `discount` (from coupon) → `shippingCharge` → `tax` (18% GST default) → `total`
- Free shipping threshold: ₹500+ (configurable in Settings)
- Coupon discount can be `percentage` (capped at `maximumDiscount`) or `fixed`

---

## 8. Wishlist Flow

**All endpoints require authentication.**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/wishlist` | Get user's wishlist (creates if not exists) |
| `POST` | `/wishlist` | Add item — body: `{ "itemType": "product" / "prebuilt", "itemId": "..." }` |
| `DELETE` | `/wishlist/:itemId` | Remove item (by product/prebuilt ID) |
| `POST` | `/wishlist/:itemId/move-to-cart` | Move item to cart (validates active + stock) then removes from wishlist |
| `DELETE` | `/wishlist` | Clear entire wishlist |

### Database Design
- One wishlist document per user (`{ user: unique }` with embedded `items[]`)
- Wishlist items have auto-generated `_id` for internal use, but CRUD uses product/prebuilt ObjectId
- Item types: `product` (→ `Product` model), `prebuilt` (→ `PrebuiltPC` model)
- Duplicate prevention: same `itemType` + `item` cannot be added twice

### Move-to-Cart Flow
```
POST /wishlist/:itemId/move-to-cart
  1. Validate item exists in wishlist (by product/prebuilt ID)
  2. Validate product/prebuilt is active & has stock
  3. Add to cart via cartService.addItem() (quantity: 1)
  4. Remove item from wishlist
  5. Return updated wishlist
```

### Key Rules
- No duplicate entries
- Saved Builds are excluded (only products + prebuilt PCs)
- Removing an item does not affect the product or inventory
- Deleting a product does not auto-delete the wishlist entry

---

## 9. Coupon Flow (Admin)

| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| `POST` | `/coupons` | auth + admin + validate | Create coupon |
| `GET` | `/coupons` | auth + admin | List coupons (with filters) |
| `GET` | `/coupons/:id` | auth + admin | Get single coupon |
| `PUT` | `/coupons/:id` | auth + admin + validate | Update coupon |
| `DELETE` | `/coupons/:id` | auth + admin | Delete coupon |

### Coupon Properties
- `discountType`: `percentage`, `fixed`, `free_shipping`
- `applicableTo`: `all`, `product`, `category`, `prebuilt`
- Validation: active status, date range, minimum purchase, usage limits (global + per user), first-order-only
- Eligibility scoped to matching items in cart

---

## 10. Address Flow

**All endpoints require authentication.**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/addresses` | Create address |
| `GET` | `/addresses` | List user's addresses |
| `GET` | `/addresses/:id` | Get single address |
| `PUT` | `/addresses/:id` | Update address |
| `DELETE` | `/addresses/:id` | Delete address |
| `PATCH` | `/addresses/:id/default` | Set as default address |

- Auto-sets first address as default
- Clearing a default promotes the next available address

---

## 11. Order Flow

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders/checkout` | Place order (from cart) |
| `GET` | `/orders` | List user's orders (paginated) |
| `GET` | `/orders/:id` | Get single order |
| `PATCH` | `/orders/:id/cancel` | Cancel order (only if `pending` or `confirmed`) |

### Admin (`/admin/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/orders` | List all orders (with filters) |
| `GET` | `/admin/orders/:id` | Get order with user details |
| `PATCH` | `/admin/orders/:id/status` | Update order status |
| `PATCH` | `/admin/orders/:id/payment-status` | Update payment status |

### Checkout Flow
```
POST /orders/checkout { addressId, paymentMethod }
  1. Validate cart is not empty
  2. Validate stock for all items
  3. Re-validate coupon if present
  4. Validate address belongs to user
  5. Generate order number: RIG-YYMMDD-<random hex>

  ┌─ paymentMethod = "cod"
  │   status: confirmed
  │   reduces stock (transactional)
  │   increments coupon usage
  │   clears cart
  │
  └─ paymentMethod = "razorpay"
      status: pending (awaiting payment)
      checkoutExpiresAt: +30 minutes
      does NOT reduce stock yet
```

### Order Status Machine
```
pending → confirmed → processing → shipped → delivered
       ↘ cancelled
```
Status transitions are enforced. Cancellation with `paid` payment → `refunded`.

---

## 12. Payment Flow (Razorpay)

### Create Razorpay Order
**`POST /payments/create-razorpay-order`** — `[auth required]`
```
{ orderId } → validates order is unpaid & not expired → creates Razorpay order (amount × 100, INR)
→ returns { order, razorpay: { orderId, amount, currency, keyId } }
```

### Verify Payment (frontend callback)
**`POST /payments/verify`**
```
{ razorpay_order_id, razorpay_payment_id, razorpay_signature }
  → HMAC SHA256 signature verification
  → finds order by razorpay_order_id
  → calls confirmPayment() which:
      - sets paymentStatus = "paid"
      - sets orderStatus = "confirmed"
      - clears checkoutExpiresAt
      - reduces stock (transactional)
      - increments coupon usage
      - clears cart
```

### Webhook (server-to-server)
**`POST /payments/webhook`**
- Validates HMAC SHA256 signature using `RAZORPAY_WEBHOOK_SECRET`
- Only processes `payment.captured` events
- Same `confirmPayment()` flow as verify

---

## 13. Review Flow

### User
| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| `POST` | `/reviews` | auth + uploadMultipleImages("images", 5) + validate | Create review |
| `PUT` | `/reviews/:id` | auth + uploadMultipleImages("images", 5) + validate | Update review |
| `DELETE` | `/reviews/:id` | auth | Delete own review |
| `GET` | `/reviews/me` | auth | Get my reviews |
| `GET` | `/reviews/product/:productId` | public | Get product reviews |
| `GET` | `/reviews/prebuilt/:id` | public | Get prebuilt PC reviews |

### Admin (`/admin/reviews`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/reviews` | List all reviews |
| `PATCH` | `/admin/reviews/:id/visibility` | Toggle visibility |
| `DELETE` | `/admin/reviews/:id` | Force delete review |

### Review Constraints
- Must have purchased the item (checks paid orders)
- One review per user per item (unique compound index)
- Rating 1–5, max 5 images, max 1000 chars comment
- Auto-recalculates parent product/prebuilt PC average rating on create/update/delete

---

## 14. Image Upload Service

Uses Cloudinary via multer memory storage (buffer).

### Endpoints with uploads
- Categories: `uploadSingleImage("image")`
- Brands: `uploadSingleImage("logo")`
- Products: `uploadMultipleImages("images", 10)`
- Prebuilt PCs: `uploadMultipleImages("images", 10)`
- Reviews: `uploadMultipleImages("images", 5)`

### Cloudinary folders
`rigcraft/products`, `rigcraft/categories`, `rigcraft/brands`, `rigcraft/reviews`, `rigcraft/prebuilt-pcs`

On update, old images are deleted before uploading new ones.

---

## 15. Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

### ApiError static factories
| Method | Status |
|--------|--------|
| `badRequest` | 400 |
| `unauthorized` | 401 |
| `forbidden` | 403 |
| `notFound` | 404 |
| `conflict` | 409 |
| `internal` | 500 |

### Global Error Middleware Handles
- `CastError` → 400 (invalid MongoDB ObjectId)
- `11000` → 409 (unique constraint violation)
- `ValidationError` → 400 (Mongoose validation)
- `JsonWebTokenError` / `TokenExpiredError` → 401
- Stack trace shown only in development

---

## 16. Constants Reference

| Constant | Values |
|----------|--------|
| `CUSTOMER_ROLES` | `customer`, `admin` |
| `PRODUCT_STATUS` | `draft`, `active`, `out_of_stock`, `archived` |
| `PRODUCT_TYPES` | `component`, `prebuilt`, `accessory` |
| `COMPONENT_TYPES` | `cpu`, `motherboard`, `gpu`, `ram`, `storage`, `psu`, `cabinet`, `cooler`, `operatingSystem`, `accessory` |
| `CART_ITEM_TYPES` | `product`, `prebuilt`, `savedBuild` |
| `DISCOUNT_TYPES` | `percentage`, `fixed`, `free_shipping` |
| `COUPON_APPLICABLE_TO` | `all`, `product`, `category`, `prebuilt` |
| `PREBUILT_PC_STATUS` | `draft`, `active`, `out_of_stock`, `archived` |
| Prebuilt PC Categories | `gaming`, `streaming`, `workstation`, `office`, `budget` |
| Order Status | `pending` → `confirmed` → `processing` → `shipped` → `delivered` (+ `cancelled`) |
| Payment Status | `pending`, `paid`, `failed`, `refunded` |
| Payment Methods | `razorpay`, `cod` |

---

## 17. Middleware Stack Order

For protected routes: `protect` → `authorize(roles)` → (optional) `upload` → `validate(schema)` → `controller`

---

## 18. Data Models Overview

| Model | Key Fields | Relations |
|-------|------------|-----------|
| **User** | firstName, lastName, email, phone, password, role, avatar, isBlocked, refreshToken, otp | — |
| **Category** | name, slug, image, parent, isActive, order | self-referencing parent |
| **Brand** | name, slug, logo, isActive | — |
| **Product** | name, slug, sku, productType, category, brand, price, salePrice, stock, images, compatibility, specifications, rating, status | → Category, → Brand |
| **PrebuiltPC** | name, slug, sku, components[], pricing, stock, category, rating, status | components[].product → Product |
| **SavedBuild** | user, name, components[], totalPrice, totalSalePrice, compatibility | → User, components[].product → Product |
| **Cart** | user, items[], coupon, subtotal, discount, shippingCharge, tax, total | → User, → Coupon |
| **Order** | orderNumber, user, items[], shippingAddress, coupon, subtotal, discount, shippingCharge, tax, total, paymentMethod, paymentStatus, orderStatus, razorpay | → User |
| **Coupon** | code, name, discountType, discountValue, validFrom, validUntil, usageLimit, products[], categories[], prebuiltPcs[] | → Product*, → Category*, → PrebuiltPC* |
| **Address** | user, label, fullName, phone, addressLine1/2, city, state, country, postalCode, isDefault | → User |
| **Review** | user, itemType, item, itemModel, rating, title, comment, images, isVisible, isVerifiedPurchase | → User, → Product/PrebuiltPC |
| **Settings** | shipping (standardRate, freeShippingThreshold), tax (rate, name), currency | singleton |
| **BuildSetting** | enabled | singleton |
