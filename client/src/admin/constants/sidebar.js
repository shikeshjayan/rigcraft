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
    section: "Customers",
    items: [
      {
        label: "Users",
        path: "/admin/users",
        icon: "People",
        roles: ["super_admin"],
      },
      {
        label: "Customers",
        path: "/admin/users",
        icon: "People",
        roles: ["admin"],
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
    section: null,
    items: [
      {
        label: "Settings",
        path: "/admin/settings",
        icon: "Settings",
        roles: ["super_admin"],
      },
    ],
  },
];
