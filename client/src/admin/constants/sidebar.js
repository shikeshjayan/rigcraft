import { ROLES } from "./status";
import { PERMISSIONS } from "./permissions";

export const SIDEBAR_SECTIONS = [
  {
    section: null,
    items: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: "Dashboard",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        requiredPermissions: [PERMISSIONS.dashboard.read],
      },
    ],
  },
  {
    section: "Catalog",
    items: [
      {
        label: "Products",
        path: "/admin/products",
        icon: "Inventory",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER],
        requiredPermissions: [
          PERMISSIONS.products.read, PERMISSIONS.products.create,
          PERMISSIONS.products.update, PERMISSIONS.products.delete,
          PERMISSIONS.products.managePricing, PERMISSIONS.products.manageStock,
          PERMISSIONS.products.manageSpecifications, PERMISSIONS.products.manageCompatibility,
          PERMISSIONS.products.manageImages, PERMISSIONS.products.publish
        ],
      },
      {
        label: "Categories",
        path: "/admin/categories",
        icon: "Category",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER],
        requiredPermissions: [
          PERMISSIONS.categories.read, PERMISSIONS.categories.create,
          PERMISSIONS.categories.update, PERMISSIONS.categories.delete,
          PERMISSIONS.categories.toggleStatus
        ],
      },
      {
        label: "Brands",
        path: "/admin/brands",
        icon: "BrandingWatermark",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER],
        requiredPermissions: [
          PERMISSIONS.brands.read, PERMISSIONS.brands.create,
          PERMISSIONS.brands.update, PERMISSIONS.brands.delete
        ],
      },
      {
        label: "Prebuilt PCs",
        path: "/admin/prebuilt",
        icon: "Computer",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER],
        requiredPermissions: [
          PERMISSIONS.prebuilts.read, PERMISSIONS.prebuilts.create,
          PERMISSIONS.prebuilts.update, PERMISSIONS.prebuilts.delete,
          PERMISSIONS.prebuilts.publish
        ],
      },
    ],
  },
  {
    section: "Sales",
    items: [
      {
        label: "Orders",
        path: "/admin/orders",
        icon: "Receipt",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER],
        requiredPermissions: [PERMISSIONS.orders.read],
      },
      {
        label: "Bundles",
        path: "/admin/bundles",
        icon: "Sell",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER],
        requiredPermissions: [PERMISSIONS.bundles.read],
      },
      {
        label: "Coupons",
        path: "/admin/coupons",
        icon: "Discount",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER],
        requiredPermissions: [PERMISSIONS.coupons.read],
      },
    ],
  },
  {
    section: "Marketing",
    items: [
      {
        label: "Deals",
        path: "/admin/deals",
        icon: "Campaign",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER],
        requiredPermissions: [PERMISSIONS.deals.read],
      },
      {
        label: "Newsletter",
        path: "/admin/newsletter",
        icon: "Campaign",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        requiredPermissions: [PERMISSIONS.newsletter.read],
      },
      {
        label: "Reviews",
        path: "/admin/reviews",
        icon: "RateReview",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT_EXECUTIVE],
        requiredPermissions: [PERMISSIONS.reviews.read],
      },
    ],
  },
  {
    section: "Customers",
    items: [
      {
        label: "Customer List",
        path: "/admin/users",
        icon: "People",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        requiredPermissions: [PERMISSIONS.users.read],
      },
    ],
  },
  {
    section: "Support",
    items: [
      {
        label: "Tickets",
        path: "/admin/support",
        icon: "HeadsetMic",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT_EXECUTIVE],
        requiredPermissions: [PERMISSIONS.support.read],
      },
      {
        label: "FAQs",
        path: "/admin/faqs",
        icon: "QuestionAnswer",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT_EXECUTIVE],
        requiredPermissions: [PERMISSIONS.faqs.read],
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        label: "Notifications",
        path: "/admin/notifications",
        icon: "Notifications",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER, ROLES.ORDER_MANAGER, ROLES.SUPPORT_EXECUTIVE],
        requiredPermissions: [PERMISSIONS.notifications.adminList],
      },
      {
        label: "Settings",
        path: "/admin/settings",
        icon: "Settings",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        requiredPermissions: [PERMISSIONS.settings.read],
      },
      {
        label: "Roles & Permissions",
        path: "/admin/settings/roles",
        icon: "VpnKey",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        requiredPermissions: [PERMISSIONS.roles.manage],
      },
    ],
  },
  {
    section: null,
    items: [
    ],
  },
];
