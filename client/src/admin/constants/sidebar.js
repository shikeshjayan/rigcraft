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
        requiredPermission: PERMISSIONS.dashboard.read,
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
        requiredPermission: PERMISSIONS.products.read,
      },
      {
        label: "Categories",
        path: "/admin/categories",
        icon: "Category",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER],
        requiredPermission: PERMISSIONS.categories.read,
      },
      {
        label: "Brands",
        path: "/admin/brands",
        icon: "BrandingWatermark",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER],
        requiredPermission: PERMISSIONS.brands.read,
      },
      {
        label: "Prebuilt PCs",
        path: "/admin/prebuilt",
        icon: "Computer",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER],
        requiredPermission: PERMISSIONS.prebuilts.read,
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
        requiredPermission: PERMISSIONS.orders.read,
      },
      {
        label: "Bundles",
        path: "/admin/bundles",
        icon: "Sell",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER],
        requiredPermission: PERMISSIONS.bundles.read,
      },
      {
        label: "Coupons",
        path: "/admin/coupons",
        icon: "Discount",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER],
        requiredPermission: PERMISSIONS.coupons.read,
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
        requiredPermission: PERMISSIONS.deals.read,
      },
      {
        label: "Newsletter",
        path: "/admin/newsletter",
        icon: "Campaign",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        requiredPermission: PERMISSIONS.newsletter.read,
      },
      {
        label: "Reviews",
        path: "/admin/reviews",
        icon: "RateReview",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER],
        requiredPermission: PERMISSIONS.reviews.read,
      },
    ],
  },
  {
    section: "Customers",
    items: [
      {
        label: "Users",
        path: "/admin/users",
        icon: "People",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        requiredPermission: PERMISSIONS.users.read,
      },
      {
        label: "Roles & Access",
        path: "/admin/roles",
        icon: "VpnKey",
        roles: [ROLES.SUPER_ADMIN],
        requiredPermission: PERMISSIONS.roles.manage,
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
        requiredPermission: PERMISSIONS.support.read,
      },
      {
        label: "FAQs",
        path: "/admin/faqs",
        icon: "QuestionAnswer",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT_EXECUTIVE],
        requiredPermission: PERMISSIONS.faqs.read,
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
        requiredPermission: PERMISSIONS.notifications.adminList,
      },
      {
        label: "Settings",
        path: "/admin/settings",
        icon: "Settings",
        roles: [ROLES.SUPER_ADMIN],
        requiredPermission: PERMISSIONS.settings.read,
      },
    ],
  },
];
