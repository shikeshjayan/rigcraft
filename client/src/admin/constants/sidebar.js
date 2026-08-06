export const SIDEBAR_SECTIONS = [
  {
    section: null,
    items: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: "Dashboard",
        roles: ["admin", "manager"],
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
        roles: ["admin", "manager"],
      },
      {
        label: "Categories",
        path: "/admin/categories",
        icon: "Category",
        roles: ["admin", "manager"],
      },
      {
        label: "Brands",
        path: "/admin/brands",
        icon: "BrandingWatermark",
        roles: ["admin", "manager"],
      },
      {
        label: "Prebuilt PCs",
        path: "/admin/prebuilt",
        icon: "Computer",
        roles: ["admin", "manager"],
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
        roles: ["admin", "manager"],
      },
      {
        label: "Bundles",
        path: "/admin/bundles",
        icon: "Sell",
        roles: ["admin", "manager"],
      },
      {
        label: "Coupons",
        path: "/admin/coupons",
        icon: "Discount",
        roles: ["admin"],
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
        roles: ["admin", "manager"],
      },
      {
        label: "Newsletter",
        path: "/admin/newsletter",
        icon: "Campaign",
        roles: ["admin", "manager"],
      },
      {
        label: "Reviews",
        path: "/admin/reviews",
        icon: "RateReview",
        roles: ["admin", "manager"],
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
        roles: ["admin"],
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
        roles: ["admin", "manager"],
      },
      {
        label: "FAQs",
        path: "/admin/faqs",
        icon: "QuestionAnswer",
        roles: ["admin", "manager"],
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
        roles: ["admin", "manager"],
      },
      {
        label: "Settings",
        path: "/admin/settings",
        icon: "Settings",
        roles: ["admin"],
      },
    ],
  },
];
