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
    CHECK: "/auth/check",
    GOOGLE: "/auth/google",
  },

  // Deals (public)
  DEAL: {
    LIST: "/deals",
    ACTIVE: "/deals/active",
    DETAILS: (slug) => `/deals/${slug}`,
  },

  // Deals (admin)
  ADMIN_DEAL: {
    LIST: "/admin/deals",
    DETAILS: (id) => `/admin/deals/${id}`,
    CREATE: "/admin/deals",
    UPDATE: (id) => `/admin/deals/${id}`,
    DELETE: (id) => `/admin/deals/${id}`,
    TOGGLE_STATUS: (id) => `/admin/deals/${id}/status`,
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
    FEATURED: "/prebuilt-pcs/featured",
    CATEGORY: (category) => `/prebuilt-pcs/category/${category}`,
    SIMILAR: (slugOrId) => `/prebuilt-pcs/${slugOrId}/similar`,
    COMPONENTS: (slugOrId) => `/prebuilt-pcs/${slugOrId}/components`,
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
    SETTINGS: "/builds/settings",
  },

  // PC Builder (admin)
  ADMIN_BUILDER: {
    LIST: "/builds/admin",
    ANALYTICS: "/builds/admin/analytics",
    ISSUES: "/builds/admin/issues",
    SETTINGS: "/builds/admin/settings",
    SETTINGS_GET: "/builds/admin/settings",
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
    GET: "/wishlists",
    ADD_ITEM: "/wishlists",
    REMOVE_ITEM: (id) => `/wishlists/${id}`,
    CLEAR: "/wishlists",
    MOVE_TO_CART: (id) => `/wishlists/${id}/move-to-cart`,
  },

  // Reviews (public)
  REVIEW: {
    LIST: "/reviews",
    CREATE: "/reviews",
    CREATE_PRODUCT: "/reviews/product",
    CREATE_TESTIMONIAL: "/reviews/testimonial",
    TESTIMONIALS: "/reviews/testimonials",
    HELPFUL: (id) => `/reviews/${id}/helpful`,
    REPORT: (id) => `/reviews/${id}/report`,
    DETAILS: (id) => `/reviews/${id}`,
    UPDATE: (id) => `/reviews/${id}`,
    DELETE: (id) => `/reviews/${id}`,
  },

  // Coupons
  COUPON: {
    LIST: "/coupons",
    CREATE: "/coupons",
    DETAILS: (id) => `/coupons/${id}`,
    UPDATE: (id) => `/coupons/${id}`,
    DELETE: (id) => `/coupons/${id}`,
  },

  // Orders (user)
  ORDER: {
    CHECKOUT: "/orders/checkout",
    LIST: "/orders",
    DETAILS: (id) => `/orders/${id}`,
    CANCEL: (id) => `/orders/${id}/cancel`,
  },

  // Admin Orders
  ADMIN_ORDER: {
    LIST: "/admin/orders",
    DETAILS: (id) => `/admin/orders/${id}`,
    UPDATE_STATUS: (id) => `/admin/orders/${id}/status`,
    UPDATE_PAYMENT_STATUS: (id) => `/admin/orders/${id}/payment-status`,
  },

  // Admin Reviews
  ADMIN_REVIEW: {
    LIST: "/admin/reviews",
    DETAILS: (id) => `/admin/reviews/${id}`,
    UPDATE_STATUS: (id) => `/admin/reviews/${id}/status`,
    FEATURE: (id) => `/admin/reviews/${id}/feature`,
    REPLY: (id) => `/admin/reviews/${id}/reply`,
    DISMISS_REPORTS: (id) => `/admin/reviews/${id}/dismiss-reports`,
    CLEAR_SPAM: (id) => `/admin/reviews/${id}/clear-spam`,
    STATS: "/admin/reviews/stats",
    DELETE: (id) => `/admin/reviews/${id}`,
  },

  // Users
  USER: {
    LIST: "/users",
    CREATE: "/users",
    DETAILS: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    TOGGLE_BLOCK: (id) => `/users/${id}/block`,
    ORDERS: (id) => `/users/${id}/orders`,
    ADDRESSES: (id) => `/users/${id}/addresses`,
    REVIEWS: (id) => `/users/${id}/reviews`,
    WISHLIST: (id) => `/users/${id}/wishlist`,
    BUILDS: (id) => `/users/${id}/builds`,
  },

  // Uploads
  UPLOAD: {
    IMAGE: "/uploads/image",
  },

  // Settings
  SETTINGS: {
    GET: "/settings",
    UPDATE: "/settings",
    PUBLIC: "/settings/public",
    LOGO: "/settings/logo",
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
    DETAILS: (id) => `/admin/notifications/${id}`,
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

  // Search
  SEARCH: {
    PUBLIC: "/search",
    ADMIN: "/admin/search",
  },
};
