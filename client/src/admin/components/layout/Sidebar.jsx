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
  Campaign as CampaignIcon,
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
  Campaign: CampaignIcon,
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
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors mb-0.5 whitespace-nowrap
        ${
          isActive
            ? "bg-admin-sidebar-active text-admin-sidebar-text-active"
            : "text-admin-sidebar-text hover:bg-admin-sidebar-hover hover:text-white"
        }
        ${collapsed ? "justify-center px-0" : ""}
      `}
      style={{ borderRadius: "var(--radius-admin-button)" }}
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
    <div className="flex flex-col h-full transition-all duration-300" style={{ backgroundColor: "var(--color-admin-sidebar)" }}>
      <div className={`flex items-center gap-3 px-6 py-5 ${collapsed ? "justify-center px-0" : ""}`} style={{ borderBottom: "1px solid var(--color-admin-divider)" }}>
        <div
          className="w-8 h-8 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 animate-admin-pulse-glow"
          style={{ borderRadius: "var(--radius-admin-button)" }}
          style={{ background: "linear-gradient(135deg, var(--color-admin-primary) 0%, var(--color-admin-primary-light) 100%)" }}
        >
          RC
        </div>
        {!collapsed && (
          <span className="font-extrabold text-lg">
            <span style={{ color: "var(--color-admin-primary)" }}>Rig</span>
            <span style={{ color: "var(--color-admin-white)" }}>Craft</span>
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        {filteredSections.map((section, idx) => (
          <div key={idx}>
            {section.section && !collapsed && (
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-admin-sidebar-text)" }}>
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
              <div className="my-3 mx-3" style={{ borderTop: "1px solid var(--color-admin-divider)" }} />
            )}
          </div>
        ))}
      </nav>

      <div className={`px-3 py-3 space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`} style={{ borderTop: "1px solid var(--color-admin-divider)" }}>
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors
              ${collapsed ? "justify-center px-0" : ""}`}
            style={{
              borderRadius: "var(--radius-admin-button)",
              color: "var(--color-admin-sidebar-text)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-admin-sidebar-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
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
