export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh-token",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // Dashboard
  DASHBOARD: {
    STATS: "/dashboard/stats",
    SALES: "/dashboard/sales",
    RECENT_ORDERS: "/dashboard/recent-orders",
    LOW_STOCK_PRODUCTS: "/dashboard/low-stock-products",
    TOP_PRODUCTS: "/dashboard/top-products",
    ORDER_BREAKDOWN: "/dashboard/order-breakdown",
  },

  // Categories
  CATEGORY: {
    LIST: "/categories",
    CREATE: "/categories",
    ALL: "/categories/all",
    DETAILS: (id) => `/categories/${id}`,
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },

  // Brands
  BRAND: {
    LIST: "/brands",
    CREATE: "/brands",
    ALL: "/brands/all",
    DETAILS: (id) => `/brands/${id}`,
    UPDATE: (id) => `/brands/${id}`,
    DELETE: (id) => `/brands/${id}`,
  },

  // Products
  PRODUCT: {
    LIST: "/products",
    CREATE: "/products",
    DETAILS: (id) => `/products/${id}`,
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
  },

  // Prebuilt PCs
  PREBUILT: {
    LIST: "/prebuilt-pcs",
    CREATE: "/prebuilt-pcs",
    DETAILS: (id) => `/prebuilt-pcs/${id}`,
    UPDATE: (id) => `/prebuilt-pcs/${id}`,
    DELETE: (id) => `/prebuilt-pcs/${id}`,
  },

  // PC Builder
  BUILDER: {
    LIST: "/builder",
    CREATE: "/builder",
    DETAILS: (id) => `/builder/${id}`,
    UPDATE: (id) => `/builder/${id}`,
    DELETE: (id) => `/builder/${id}`,
    VALIDATE: (id) => `/builder/${id}/validate`,
    DUPLICATE: (id) => `/builder/${id}/duplicate`,
    ADD_TO_CART: (id) => `/builder/${id}/add-to-cart`,
  },

  // Cart
  CART: {
    GET: "/cart",
    ADD_ITEM: "/cart/items",
    UPDATE_ITEM: (id) => `/cart/items/${id}`,
    REMOVE_ITEM: (id) => `/cart/items/${id}`,
    APPLY_COUPON: "/cart/coupon",
    REMOVE_COUPON: "/cart/coupon",
    CLEAR: "/cart",
  },

  // Wishlist
  WISHLIST: {
    GET: "/wishlist",
    ADD_ITEM: "/wishlist/items",
    REMOVE_ITEM: (id) => `/wishlist/items/${id}`,
    CLEAR: "/wishlist",
  },

  // Coupons
  COUPON: {
    LIST: "/coupons",
    CREATE: "/coupons",
    DETAILS: (id) => `/coupons/${id}`,
    UPDATE: (id) => `/coupons/${id}`,
    DELETE: (id) => `/coupons/${id}`,
  },

  // Admin Orders
  ADMIN_ORDER: {
    LIST: "/admin/orders",
    DETAILS: (id) => `/admin/orders/${id}`,
    UPDATE_STATUS: (id) => `/admin/orders/${id}/status`,
  },

  // Admin Reviews
  ADMIN_REVIEW: {
    LIST: "/admin/reviews",
    DETAILS: (id) => `/admin/reviews/${id}`,
    UPDATE_STATUS: (id) => `/admin/reviews/${id}/status`,
    DELETE: (id) => `/admin/reviews/${id}`,
  },

  // Users
  USER: {
    LIST: "/users",
    DETAILS: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  // Uploads
  UPLOAD: {
    IMAGE: "/uploads/image",
  },

  // Settings
  SETTINGS: {
    GET: "/settings",
    UPDATE: "/settings",
  },

  // Addresses
  ADDRESS: {
    LIST: "/addresses",
    CREATE: "/addresses",
    DETAILS: (id) => `/addresses/${id}`,
    UPDATE: (id) => `/addresses/${id}`,
    DELETE: (id) => `/addresses/${id}`,
  },
};
