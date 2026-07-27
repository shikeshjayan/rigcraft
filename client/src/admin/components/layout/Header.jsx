import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IconButton,
  Avatar,
  InputBase,
  Badge,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import useAuthStore from "../../store/authStore";

const ROUTE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "New Product",
  "/admin/categories": "Categories",
  "/admin/brands": "Brands",
  "/admin/prebuilt": "Prebuilt PCs",
  "/admin/orders": "Orders",
  "/admin/coupons": "Coupons",
  "/admin/reviews": "Reviews",
  "/admin/users": "Users",
  "/admin/settings": "Settings",
  "/admin/profile": "Profile",
};

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
};

const getBreadcrumbs = (pathname) => {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [];
  let acc = "";

  for (const seg of segments) {
    acc += `/${seg}`;
    const title = ROUTE_TITLES[acc];
    if (title) {
      crumbs.push({ label: title, path: acc });
    }
  }

  if (crumbs.length === 0) {
    crumbs.push({ label: "Dashboard", path: "/admin/dashboard" });
  }

  return crumbs;
};

const Header = ({ onToggleSidebar, onToggleCollapse, collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const breadcrumbs = getBreadcrumbs(location.pathname);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header
      className="h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10"
      style={{
        backgroundColor: "var(--color-admin-header)",
        borderBottom: "1px solid var(--color-admin-border)",
        boxShadow: "var(--shadow-admin-header)",
      }}
    >
      <div className="flex items-center gap-3">
        <IconButton
          onClick={isMobile ? onToggleSidebar : onToggleCollapse}
          sx={{ color: "var(--color-admin-text)", display: { md: "inline-flex" } }}
        >
          {isMobile ? <MenuIcon /> : collapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>

        <div className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.path} className="flex items-center gap-1.5">
              {idx > 0 && (
                <NavigateNextIcon
                  sx={{ fontSize: 16, color: "var(--color-admin-muted)" }}
                />
              )}
              <span
                className={idx === breadcrumbs.length - 1 ? "font-bold" : "cursor-pointer"}
                style={{
                  color: idx === breadcrumbs.length - 1 ? "var(--color-admin-text)" : "var(--color-admin-text-secondary)",
                }}
                onClick={() => idx < breadcrumbs.length - 1 && navigate(crumb.path)}
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Paper
          elevation={0}
          sx={{
            display: { xs: searchOpen ? "flex" : "none", md: "flex" },
            alignItems: "center",
            px: 1.5,
            py: 0.5,
            borderRadius: "var(--radius-admin-input)",
            border: "1px solid var(--color-admin-border)",
            backgroundColor: "var(--color-admin-bg-tertiary)",
            width: searchOpen ? 200 : { md: 220 },
            transition: "all 0.2s",
            "&:focus-within": {
              borderColor: "var(--color-admin-primary)",
              backgroundColor: "var(--color-admin-card)",
              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
            },
          }}
        >
          <SearchIcon
            sx={{ fontSize: 18, color: "var(--color-admin-muted)", mr: 1 }}
          />
          <InputBase
            placeholder="Search products..."
            sx={{
              fontSize: "0.8125rem",
              color: "var(--color-admin-text)",
              width: "100%",
              "& input::placeholder": {
                color: "var(--color-admin-muted)",
                opacity: 1,
                fontWeight: 500,
              },
            }}
          />
        </Paper>

        <IconButton
          onClick={() => setSearchOpen(!searchOpen)}
          sx={{ display: { md: "none" }, color: "var(--color-admin-text-secondary)" }}
        >
          <SearchIcon />
        </IconButton>

        <IconButton sx={{ color: "var(--color-admin-text-secondary)" }}>
          <Badge
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#FF3E6C",
                color: "#fff",
                fontSize: 10,
                minWidth: 8,
                height: 8,
              },
            }}
            variant="dot"
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <button
          onClick={() => navigate("/admin/profile")}
          className="flex items-center gap-2 ml-2 p-1 transition-colors cursor-pointer"
          style={{ borderRadius: "var(--radius-admin-button)" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-admin-bg-tertiary)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: 14,
              fontWeight: 700,
              background: "linear-gradient(135deg, var(--color-admin-primary) 0%, var(--color-admin-primary-light) 100%)",
            }}
          >
            {initials}
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold leading-tight" style={{ color: "var(--color-admin-text)" }}>
              {user?.name}
            </p>
            <p className="text-xs font-medium" style={{ color: "var(--color-admin-text-secondary)" }}>
              {ROLE_LABELS[user?.role] || user?.role}
            </p>
          </div>
        </button>

      </div>
    </header>
  );
};

export default Header;
