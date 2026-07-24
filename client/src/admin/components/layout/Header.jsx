import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
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
  Person as PersonIcon,
  Logout as LogoutIcon,
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
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const breadcrumbs = getBreadcrumbs(location.pathname);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/admin/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="h-16 bg-admin-header border-b border-admin-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <IconButton
          onClick={isMobile ? onToggleSidebar : onToggleCollapse}
          className="text-admin-text"
          sx={{ display: { md: "inline-flex" } }}
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
                className={
                  idx === breadcrumbs.length - 1
                    ? "font-medium text-admin-text"
                    : "text-admin-text-secondary hover:text-admin-text cursor-pointer"
                }
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
            width: searchOpen ? 200 : { md: 200 },
            transition: "all 0.2s",
            "&:focus-within": {
              borderColor: "var(--color-admin-primary)",
              backgroundColor: "var(--color-admin-card)",
            },
          }}
        >
          <SearchIcon
            sx={{ fontSize: 18, color: "var(--color-admin-muted)", mr: 1 }}
          />
          <InputBase
            placeholder="Search..."
            sx={{
              fontSize: "0.8125rem",
              color: "var(--color-admin-text)",
              width: "100%",
              "& input::placeholder": {
                color: "var(--color-admin-muted)",
                opacity: 1,
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
          <Badge badgeContent={3} color="error" variant="dot">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <button
          onClick={handleMenuOpen}
          className="flex items-center gap-2 ml-2 p-1 rounded-admin-button hover:bg-admin-bg-tertiary transition-colors"
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "var(--color-admin-primary)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-admin-text leading-tight">
              {user?.name}
            </p>
            <p className="text-xs text-admin-text-secondary">
              {ROLE_LABELS[user?.role] || user?.role}
            </p>
          </div>
        </button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: "var(--radius-admin-modal)",
              boxShadow: "var(--shadow-admin-dropdown)",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/admin/profile");
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
};

export default Header;
