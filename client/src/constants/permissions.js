export const PERMISSION_MODULE_MAP = {
  users: [
    "users.create","users.read","users.update","users.delete","users.list",
    "users.block","users.deactivate","users.role.assign",
  ],
  products: [
    "products.create","products.read","products.update","products.delete",
    "products.list","products.archive","products.manageStock",
  ],
  categories: [
    "categories.create","categories.read","categories.update","categories.delete","categories.list",
  ],
  brands: [
    "brands.create","brands.read","brands.update","brands.delete","brands.list",
  ],
  prebuilts: [
    "prebuilts.create","prebuilts.read","prebuilts.update","prebuilts.delete",
    "prebuilts.list","prebuilts.archive",
  ],
  bundles: [
    "bundles.create","bundles.read","bundles.update","bundles.delete",
    "bundles.list","bundles.archive","bundles.status.toggle",
  ],
  orders: [
    "orders.create","orders.read","orders.update","orders.delete","orders.list",
    "orders.status.manage","orders.paymentStatus.manage","orders.cancel",
    "orders.process","orders.ship","orders.deliver","orders.return","orders.refund",
  ],
  coupons: [
    "coupons.create","coupons.read","coupons.update","coupons.delete","coupons.list",
  ],
  deals: [
    "deals.create","deals.read","deals.update","deals.delete",
    "deals.list","deals.status.toggle",
  ],
  reviews: [
    "reviews.create","reviews.read","reviews.update","reviews.delete","reviews.list",
    "reviews.moderate","reviews.featured.toggle","reviews.reply",
    "reviews.reports.dismiss","reviews.spam.clear",
  ],
  support: [
    "support.tickets.create","support.tickets.read","support.tickets.update",
    "support.tickets.delete","support.tickets.list","support.tickets.reply",
    "support.tickets.assign","support.tickets.status.update",
    "support.tickets.priority.update",
  ],
  settings: [
    "settings.read","settings.update","settings.paymentKeys.manage",
  ],
  dashboard: [
    "dashboard.read","dashboard.sales","dashboard.recentOrders",
    "dashboard.lowStock","dashboard.topProducts","dashboard.orderBreakdown",
  ],
  notifications: [
    "notifications.read","notifications.markRead","notifications.markAllRead",
    "notifications.delete","notifications.list","notifications.admin.list",
  ],
  search: ["search.public","search.admin"],
  faqs: ["faqs.read","faqs.list","faqs.create","faqs.update","faqs.delete"],
  newsletter: [
    "newsletter.subscribe","newsletter.unsubscribe","newsletter.list",
    "newsletter.read","newsletter.update","newsletter.delete","newsletter.export",
  ],
  stockAlerts: [
    "stockAlerts.subscribe","stockAlerts.read","stockAlerts.cancel",
  ],
  addresses: [
    "addresses.create","addresses.read","addresses.update","addresses.delete",
    "addresses.list",
  ],
  builds: [
    "builds.create","builds.read","builds.update","builds.delete","builds.list",
    "builds.validate","builds.duplicate","builds.addToCart",
    "builds.admin.list","builds.analytics.read",
    "builds.compatibilityIssues.read","builds.settings.read","builds.settings.update",
  ],
  uploads: ["uploads.image"],
  ai: ["ai.chat"],
  roles: ["roles.manage"],
  permissions: ["permissions.manage"],
  audit: ["audit.logs.read"],
};
