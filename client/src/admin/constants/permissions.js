// Replicated from server/src/constants/permissions.js
export const PERMISSIONS = {
  users: {
    create: 'users.create', read: 'users.read', update: 'users.update', delete: 'users.delete', list: 'users.list', block: 'users.block', deactivate: 'users.deactivate', assignRole: 'users.role.assign',
  },
  products: {
    create: 'products.create', read: 'products.read', update: 'products.update', delete: 'products.delete', list: 'products.list', archive: 'products.archive', manageStock: 'products.stock.manage',
  },
  categories: {
    create: 'categories.create', read: 'categories.read', update: 'categories.update', delete: 'categories.delete', list: 'categories.list',
  },
  brands: {
    create: 'brands.create', read: 'brands.read', update: 'brands.update', delete: 'brands.delete', list: 'brands.list',
  },
  prebuilts: {
    create: 'prebuilts.create', read: 'prebuilts.read', update: 'prebuilts.update', delete: 'prebuilts.delete', list: 'prebuilts.list', archive: 'prebuilts.archive',
  },
  bundles: {
    create: 'bundles.create', read: 'bundles.read', update: 'bundles.update', delete: 'bundles.delete', list: 'bundles.list', archive: 'bundles.archive', toggleStatus: 'bundles.status.toggle',
  },
  orders: {
    create: 'orders.create', read: 'orders.read', update: 'orders.update', delete: 'orders.delete', list: 'orders.list', manageStatus: 'orders.status.manage', managePaymentStatus: 'orders.paymentStatus.manage', cancel: 'orders.cancel', process: 'orders.process', ship: 'orders.ship', deliver: 'orders.deliver', return: 'orders.return', refund: 'orders.refund',
  },
  coupons: {
    create: 'coupons.create', read: 'coupons.read', update: 'coupons.update', delete: 'coupons.delete', list: 'coupons.list',
  },
  deals: {
    create: 'deals.create', read: 'deals.read', update: 'deals.update', delete: 'deals.delete', list: 'deals.list', toggleStatus: 'deals.status.toggle',
  },
  reviews: {
    create: 'reviews.create', read: 'reviews.read', update: 'reviews.update', delete: 'reviews.delete', list: 'reviews.list', moderate: 'reviews.moderate', toggleFeatured: 'reviews.featured.toggle', reply: 'reviews.reply', dismissReports: 'reviews.reports.dismiss', clearSpam: 'reviews.spam.clear',
  },
  support: {
    createTicket: 'support.tickets.create', read: 'support.tickets.read', update: 'support.tickets.update', delete: 'support.tickets.delete', list: 'support.tickets.list', reply: 'support.tickets.reply', assign: 'support.tickets.assign', updateStatus: 'support.tickets.status.update', updatePriority: 'support.tickets.priority.update',
  },
  settings: {
    read: 'settings.read', update: 'settings.update', managePaymentKeys: 'settings.paymentKeys.manage',
  },
  dashboard: {
    read: 'dashboard.read', sales: 'dashboard.sales.read', recentOrders: 'dashboard.recentOrders.read', lowStock: 'dashboard.lowStock.read', topProducts: 'dashboard.topProducts.read', orderBreakdown: 'dashboard.orderBreakdown.read',
  },
  notifications: {
    read: 'notifications.read', markRead: 'notifications.markRead', markAllRead: 'notifications.markAllRead', delete: 'notifications.delete', list: 'notifications.list', adminList: 'notifications.admin.list',
  },
  search: {
    public: 'search.public', admin: 'search.admin',
  },
  faqs: {
    read: 'faqs.read', list: 'faqs.list', create: 'faqs.create', update: 'faqs.update', delete: 'faqs.delete',
  },
  newsletter: {
    subscribe: 'newsletter.subscribe', unsubscribe: 'newsletter.unsubscribe', list: 'newsletter.list', read: 'newsletter.read', update: 'newsletter.update', delete: 'newsletter.delete', export: 'newsletter.export',
  },
  stockAlerts: {
    subscribe: 'stockAlerts.subscribe', read: 'stockAlerts.read', cancel: 'stockAlerts.cancel',
  },
  addresses: {
    create: 'addresses.create', read: 'addresses.read', update: 'addresses.update', delete: 'addresses.delete', list: 'addresses.list',
  },
  builds: {
    create: 'builds.create', read: 'builds.read', update: 'builds.update', delete: 'builds.delete', list: 'builds.list', validate: 'builds.validate', duplicate: 'builds.duplicate', addToCart: 'builds.addToCart', adminList: 'builds.admin.list', analytics: 'builds.analytics.read', compatibilityIssues: 'builds.compatibilityIssues.read', settingsRead: 'builds.settings.read', settingsUpdate: 'builds.settings.update',
  },
  uploads: {
    image: 'uploads.image',
  },
  ai: {
    chat: 'ai.chat',
  },
  roles: {
    manage: 'roles.manage',
  },
  permissions: {
    manage: 'permissions.manage',
  },
  audit: {
    logsRead: 'audit.logs.read',
  },
};

const {
  users, products, categories, brands, prebuilts, bundles, orders,
  coupons, deals, reviews, support, settings, dashboard, notifications,
  search, faqs, newsletter, stockAlerts, addresses, builds, uploads, ai,
  roles, permissions: permsNs, audit,
} = PERMISSIONS;

export const ROLE_PERMISSIONS = {
  super_admin: [
    ...Object.values(users),
    ...Object.values(products),
    ...Object.values(categories),
    ...Object.values(brands),
    ...Object.values(prebuilts),
    ...Object.values(bundles),
    ...Object.values(orders),
    ...Object.values(coupons),
    ...Object.values(deals),
    ...Object.values(reviews),
    ...Object.values(support),
    ...Object.values(settings),
    ...Object.values(dashboard),
    ...Object.values(notifications),
    ...Object.values(search),
    ...Object.values(faqs),
    ...Object.values(newsletter),
    ...Object.values(stockAlerts),
    ...Object.values(addresses),
    ...Object.values(builds),
    ...Object.values(uploads),
    ...Object.values(ai),
    ...Object.values(roles),
    ...Object.values(permsNs),
    ...Object.values(audit),
  ],

  admin: [
    users.create, users.read, users.update, users.list,
    users.block, users.deactivate,
    products.create, products.read, products.update, products.delete,
    products.list, products.archive, products.manageStock,
    categories.create, categories.read, categories.update, categories.delete, categories.list,
    brands.create, brands.read, brands.update, brands.delete, brands.list,
    prebuilts.create, prebuilts.read, prebuilts.update, prebuilts.delete,
    prebuilts.list, prebuilts.archive,
    bundles.create, bundles.read, bundles.update, bundles.delete,
    bundles.list, bundles.archive, bundles.toggleStatus,
    orders.read, orders.list, orders.manageStatus, orders.managePaymentStatus,
    orders.cancel, orders.process, orders.ship, orders.deliver,
    orders.return, orders.refund,
    coupons.create, coupons.read, coupons.update, coupons.delete, coupons.list,
    deals.create, deals.read, deals.update, deals.delete, deals.list, deals.toggleStatus,
    reviews.read, reviews.list, reviews.moderate, reviews.toggleFeatured,
    reviews.reply, reviews.dismissReports, reviews.clearSpam, reviews.delete,
    support.list, support.read, support.reply, support.assign,
    support.updateStatus, support.updatePriority, support.delete,
    settings.read, settings.update,
    dashboard.read, dashboard.sales, dashboard.recentOrders,
    dashboard.lowStock, dashboard.topProducts, dashboard.orderBreakdown,
    notifications.read, notifications.markRead, notifications.markAllRead,
    notifications.delete, notifications.list, notifications.adminList,
    search.public, search.admin,
    faqs.read, faqs.list, faqs.create, faqs.update, faqs.delete,
    newsletter.list, newsletter.read, newsletter.update, newsletter.delete, newsletter.export,
    builds.adminList, builds.analytics, builds.compatibilityIssues,
    builds.settingsRead, builds.settingsUpdate,
    uploads.image,
    ai.chat,
  ],

  product_manager: [
    products.create, products.read, products.update, products.list, products.archive, products.manageStock,
    categories.create, categories.read, categories.update, categories.list,
    brands.create, brands.read, brands.update, brands.list,
    prebuilts.create, prebuilts.read, prebuilts.update, prebuilts.list, prebuilts.archive,
    bundles.create, bundles.read, bundles.update, bundles.list, bundles.archive, bundles.toggleStatus,
    deals.read, deals.list,
    reviews.read, reviews.list,
    notifications.read, notifications.markRead, notifications.markAllRead,
    notifications.delete, notifications.list, notifications.adminList,
    search.public, search.admin,
    newsletter.list, newsletter.read,
    uploads.image,
    ai.chat,
  ],

  order_manager: [
    orders.read, orders.list, orders.manageStatus, orders.managePaymentStatus,
    orders.cancel, orders.process, orders.ship, orders.deliver,
    orders.return, orders.refund,
    coupons.read, coupons.list,
    reviews.read, reviews.list,
    users.read,
    support.list, support.read,
    notifications.read, notifications.markRead, notifications.markAllRead,
    notifications.delete, notifications.list, notifications.adminList,
    search.public, search.admin,
    uploads.image,
    ai.chat,
  ],

  support_executive: [
    support.list, support.read, support.reply, support.updateStatus,
    support.createTicket,
    reviews.read, reviews.list,
    users.read,
    orders.read, orders.list,
    notifications.read, notifications.markRead, notifications.markAllRead,
    notifications.delete, notifications.list, notifications.adminList,
    search.public, search.admin,
    uploads.image,
    ai.chat,
  ],

  customer: [
    users.read,
    products.read,
    categories.read, categories.list,
    brands.read, brands.list,
    prebuilts.read,
    bundles.read,
    orders.create, orders.read, orders.cancel,
    coupons.read,
    deals.read,
    reviews.create, reviews.read, reviews.update, reviews.delete,
    support.createTicket, support.read,
    notifications.read, notifications.markRead, notifications.markAllRead, notifications.delete,
    search.public,
    faqs.read,
    newsletter.subscribe, newsletter.unsubscribe,
    stockAlerts.subscribe, stockAlerts.read, stockAlerts.cancel,
    addresses.create, addresses.read, addresses.update, addresses.delete, addresses.list,
    builds.create, builds.read, builds.update, builds.delete,
    builds.list, builds.validate, builds.duplicate, builds.addToCart,
    uploads.image,
    ai.chat,
  ],
};
