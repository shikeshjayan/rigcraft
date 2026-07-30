export const SIDEBAR_SECTIONS = [
  {
    section: null,
    items: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: "Dashboard",
        roles: ["super_admin", "admin", "manager"],
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
        roles: ["super_admin", "admin", "manager"],
      },
      {
        label: "Categories",
        path: "/admin/categories",
        icon: "Category",
        roles: ["super_admin", "admin", "manager"],
      },
      {
        label: "Brands",
        path: "/admin/brands",
        icon: "BrandingWatermark",
        roles: ["super_admin", "admin", "manager"],
      },
      {
        label: "Prebuilt PCs",
        path: "/admin/prebuilt",
        icon: "Computer",
        roles: ["super_admin", "admin", "manager"],
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
        roles: ["super_admin", "admin", "manager"],
      },
      {
        label: "Coupons",
        path: "/admin/coupons",
        icon: "Discount",
        roles: ["super_admin", "admin"],
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
        roles: ["super_admin", "admin", "manager"],
      },
      {
        label: "Newsletter",
        path: "/admin/newsletter",
        icon: "Campaign",
        roles: ["super_admin", "admin", "manager"],
      },
      {
        label: "Reviews",
        path: "/admin/reviews",
        icon: "RateReview",
        roles: ["super_admin", "admin", "manager"],
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
        roles: ["super_admin", "admin"],
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
        roles: ["super_admin", "admin", "manager"],
      },
      {
        label: "FAQs",
        path: "/admin/faqs",
        icon: "QuestionAnswer",
        roles: ["super_admin", "admin", "manager"],
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
        roles: ["super_admin", "admin", "manager"],
      },
      {
        label: "Settings",
        path: "/admin/settings",
        icon: "Settings",
        roles: ["super_admin", "admin"],
      },
    ],
  },
];
