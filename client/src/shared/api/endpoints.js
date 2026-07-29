export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh-token",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/password",
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
    LIST: "/builds",
    CREATE: "/builds",
    DETAILS: (id) => `/builds/${id}`,
    UPDATE: (id) => `/builds/${id}`,
    DELETE: (id) => `/builds/${id}`,
    VALIDATE: (id) => `/builds/${id}/validate`,
    DUPLICATE: (id) => `/builds/${id}/duplicate`,
    ADD_TO_CART: (id) => `/builds/${id}/add-to-cart`,
  },

  // Cart
  CART: {
    GET: "/cart",
    ADD_ITEM: "/cart/items",
    UPDATE_ITEM: (id) => `/cart/items/${id}`,
    REMOVE_ITEM: (id) => `/cart/items/${id}`,
    APPLY_COUPON: "/cart/apply-coupon",
    REMOVE_COUPON: "/cart/remove-coupon",
    CLEAR: "/cart",
  },

  // Wishlist
  WISHLIST: {
    GET: "/wishlist",
    ADD_ITEM: "/wishlist",
    REMOVE_ITEM: (id) => `/wishlist/${id}`,
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

  // Newsletter
  NEWSLETTER: {
    SUBSCRIBE: "/newsletter/subscribe",
    UNSUBSCRIBE: "/newsletter/unsubscribe",
    LIST: "/newsletter",
    EXPORT: "/newsletter/export",
    DETAILS: (id) => `/newsletter/${id}`,
    UPDATE: (id) => `/newsletter/${id}`,
    DELETE: (id) => `/newsletter/${id}`,
  },

  // Addresses
  ADDRESS: {
    LIST: "/addresses",
    CREATE: "/addresses",
    DETAILS: (id) => `/addresses/${id}`,
    UPDATE: (id) => `/addresses/${id}`,
    DELETE: (id) => `/addresses/${id}`,
  },

  // Notifications (customer)
  NOTIFICATION: {
    LIST: "/notifications",
    UNREAD: "/notifications/unread",
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
    DELETE: (id) => `/notifications/${id}`,
  },

  // Notifications (admin)
  ADMIN_NOTIFICATION: {
    LIST: "/admin/notifications",
    UNREAD: "/admin/notifications/unread",
    MARK_READ: (id) => `/admin/notifications/${id}/read`,
    MARK_ALL_READ: "/admin/notifications/read-all",
  },

  // Support (customer)
  SUPPORT: {
    CREATE: "/support",
    LIST: "/support",
    DETAILS: (id) => `/support/${id}`,
    MESSAGES: (id) => `/support/${id}/messages`,
    CLOSE: (id) => `/support/${id}/close`,
  },

  // Support (admin)
  ADMIN_SUPPORT: {
    LIST: "/admin/support",
    DETAILS: (id) => `/admin/support/${id}`,
    REPLY: (id) => `/admin/support/${id}/messages`,
    UPDATE_STATUS: (id) => `/admin/support/${id}/status`,
    ASSIGN: (id) => `/admin/support/${id}/assign`,
    PRIORITY: (id) => `/admin/support/${id}/priority`,
    DELETE: (id) => `/admin/support/${id}`,
  },

  // FAQ (public)
  FAQ: {
    LIST: "/faqs",
  },

  // FAQ (admin)
  ADMIN_FAQ: {
    LIST: "/admin/faqs",
    DETAILS: (id) => `/admin/faqs/${id}`,
    CREATE: "/admin/faqs",
    UPDATE: (id) => `/admin/faqs/${id}`,
    DELETE: (id) => `/admin/faqs/${id}`,
  },
};
