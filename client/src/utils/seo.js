import { useEffect } from "react";

const BRAND = "Rig Craft";

const ROUTE_META = [
  { test: (p) => p === "/", title: `${BRAND} - PC Building Destination`, description: "Build your dream PC with Rig Craft. Browse prebuilt rigs, custom PC builder, components, deals and more." },
  { test: (p) => p === "/prebuild", title: `${BRAND} - Prebuilt Gaming PCs`, description: "Hand-picked prebuilt gaming PCs ready to ship." },
  { test: (p) => p === "/builder", title: `${BRAND} - Custom PC Builder`, description: "Configure your dream custom PC with our interactive builder." },
  { test: (p) => p.startsWith("/components"), title: `${BRAND} - Components`, description: "Browse PC components: CPUs, GPUs, motherboards, RAM, storage and more." },
  { test: (p) => p.startsWith("/detail"), title: `${BRAND} - Product Detail`, description: "Detailed specs and pricing for PC components and systems." },
  { test: (p) => p === "/wishlist", title: `${BRAND} - Wishlist`, description: "Your saved products on Rig Craft." },
  { test: (p) => p === "/notifications", title: `${BRAND} - Notifications`, description: "Your latest updates from Rig Craft." },
  { test: (p) => p === "/cart", title: `${BRAND} - Cart`, description: "Review the items in your cart before checkout." },
  { test: (p) => p === "/deals", title: `${BRAND} - Deals`, description: "Latest PC deals, discounts and offers on Rig Craft." },
  { test: (p) => p === "/alldeals", title: `${BRAND} - All Deals`, description: "Browse all deals and bundle offers on Rig Craft." },
  { test: (p) => p.startsWith("/bundle"), title: `${BRAND} - Bundle Deals`, description: "Bundle offers on PCs and accessories." },
  { test: (p) => p === "/login", title: `${BRAND} - Login`, description: "Sign in to your Rig Craft account." },
  { test: (p) => p === "/register", title: `${BRAND} - Create Account`, description: "Create your Rig Craft account to start building." },
  { test: (p) => p === "/forgot-password", title: `${BRAND} - Reset Password`, description: "Reset your Rig Craft password." },
  { test: (p) => p === "/profile", title: `${BRAND} - My Profile`, description: "Manage your Rig Craft profile and settings." },
  { test: (p) => p === "/orders", title: `${BRAND} - My Orders`, description: "Track and manage your Rig Craft orders." },
  { test: (p) => p.startsWith("/my-tickets"), title: `${BRAND} - Support Tickets`, description: "Manage your support tickets with Rig Craft." },
  { test: (p) => p === "/warranty", title: `${BRAND} - Warranty`, description: "Warranty policy for Rig Craft products." },
  { test: (p) => p === "/returns", title: `${BRAND} - Returns & Refunds`, description: "Returns and refund policy for Rig Craft." },
  { test: (p) => p === "/contact", title: `${BRAND} - Contact Us`, description: "Get in touch with the Rig Craft team." },
  { test: (p) => p === "/pc-builder-guide", title: `${BRAND} - PC Builder Guide`, description: "Step-by-step guide to building your own PC." },
  { test: (p) => p === "/faq", title: `${BRAND} - FAQ`, description: "Frequently asked questions about Rig Craft." },
  { test: (p) => p === "/help", title: `${BRAND} - Help Center`, description: "Help and support for Rig Craft." },
  { test: (p) => p === "/privacy-policy", title: `${BRAND} - Privacy Policy`, description: "How Rig Craft handles your data." },
  { test: (p) => p === "/terms-of-service", title: `${BRAND} - Terms of Service`, description: "Terms of service for using Rig Craft." },
  { test: (p) => p === "/about", title: `${BRAND} - About Us`, description: "Learn more about Rig Craft." },
  { test: (p) => p.startsWith("/admin"), title: `${BRAND} Admin Panel`, description: "Rig Craft admin panel." },
];

export function useRouteMeta(pathname) {
  useEffect(() => {
    const entry = ROUTE_META.find((route) => route.test(pathname));
    document.title = entry ? entry.title : `${BRAND} - 404`;
    if (entry?.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = entry.description;
    }
  }, [pathname]);
}
