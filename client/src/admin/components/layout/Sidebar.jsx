import { useLocation, useNavigate } from "react-router-dom";
import { Drawer, useMediaQuery, useTheme, Tooltip, IconButton } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  BrandingWatermark as BrandingWatermarkIcon,
  Computer as ComputerIcon,
  Receipt as ReceiptIcon,
  Discount as DiscountIcon,
  People as PeopleIcon,
  RateReview as RateReviewIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import useAuthStore from "../../store/authStore";
import { SIDEBAR_SECTIONS } from "../../constants/sidebar";

const iconMap = {
  Dashboard: DashboardIcon,
  Inventory: InventoryIcon,
  Category: CategoryIcon,
  BrandingWatermark: BrandingWatermarkIcon,
  Computer: ComputerIcon,
  Receipt: ReceiptIcon,
  Discount: DiscountIcon,
  People: PeopleIcon,
  RateReview: RateReviewIcon,
  Settings: SettingsIcon,
};

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 68;

const NavItem = ({ item, collapsed, isActive, onNavigate, onClose, isMobile }) => {
  const Icon = iconMap[item.icon];

  const content = (
    <button
      onClick={() => {
        onNavigate(item.path);
        if (isMobile) onClose();
      }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-admin-button text-sm font-medium transition-colors mb-0.5 whitespace-nowrap
        ${
          isActive
            ? "bg-admin-sidebar-active text-admin-sidebar-text-active"
            : "text-admin-sidebar-text hover:bg-admin-sidebar-hover hover:text-white"
        }
        ${collapsed ? "justify-center px-0" : ""}
      `}
    >
      {Icon && <Icon fontSize="small" />}
      {!collapsed && <span>{item.label}</span>}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip title={item.label} placement="right" arrow>
        {content}
      </Tooltip>
    );
  }

  return content;
};

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuthStore();

  const isActive = (path) => {
    if (path === "/admin/dashboard") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const filteredSections = SIDEBAR_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(user?.role)),
  })).filter((section) => section.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-admin-sidebar transition-all duration-300">
      <div className={`flex items-center gap-3 px-6 py-5 border-b border-admin-divider ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-admin-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          RC
        </div>
        {!collapsed && <span className="text-white font-semibold text-lg">RigCraft</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        {filteredSections.map((section, idx) => (
          <div key={idx}>
            {section.section && !collapsed && (
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-admin-sidebar-text">
                {section.section}
              </p>
            )}
            {section.items.map((item) => (
              <NavItem
                key={item.label + item.path}
                item={item}
                collapsed={collapsed}
                isActive={isActive(item.path)}
                onNavigate={navigate}
                onClose={onClose}
                isMobile={isMobile}
              />
            ))}
            {idx < filteredSections.length - 1 && !collapsed && (
              <div className="my-3 mx-3 border-t border-admin-divider" />
            )}
          </div>
        ))}
      </nav>

      <div className={`border-t border-admin-divider px-3 py-3 space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
        <NavItem
          item={{ label: "Profile", path: "/admin/profile", icon: "Person" }}
          collapsed={collapsed}
          isActive={isActive("/admin/profile")}
          onNavigate={navigate}
          onClose={onClose}
          isMobile={isMobile}
        />
        <Tooltip title={collapsed ? "Logout" : ""} placement="right" arrow>
          <button
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-admin-button text-sm font-medium text-admin-sidebar-text hover:bg-admin-sidebar-hover hover:text-white transition-colors
              ${collapsed ? "justify-center px-0" : ""}
            `}
          >
            <LogoutIcon fontSize="small" />
            {!collapsed && <span>Logout</span>}
          </button>
        </Tooltip>

        {!isMobile && (
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            sx={{
              color: "var(--color-admin-sidebar-text)",
              mt: 1,
              "&:hover": { backgroundColor: "var(--color-admin-sidebar-hover)" },
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: SIDEBAR_EXPANDED,
            backgroundColor: "transparent",
            border: "none",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <aside
      className="hidden md:block h-screen sticky top-0 flex-shrink-0 transition-all duration-300"
      style={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
    >
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;
