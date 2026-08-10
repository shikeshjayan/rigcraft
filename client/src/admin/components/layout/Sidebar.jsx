import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Drawer, useMediaQuery, useTheme, Tooltip, IconButton, Badge } from "@mui/material";
import ConfirmDialog from "../common/ConfirmDialog";
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  BrandingWatermark as BrandingWatermarkIcon,
  Computer as ComputerIcon,
  Receipt as ReceiptIcon,
  Discount as DiscountIcon,
  Sell as SellIcon,
  People as PeopleIcon,
  RateReview as RateReviewIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  Campaign as CampaignIcon,
  HeadsetMic as HeadsetMicIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Notifications as NotificationsIcon,
  ExitToApp as ExitToAppIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
} from "@mui/icons-material";
import useAuthStore from "../../store/authStore";
import useNotificationStore from "../../store/notificationStore";
import useSettingsStore from "../../store/settingsStore";
import { SIDEBAR_SECTIONS } from "../../constants/sidebar";

const iconMap = {
  Dashboard: DashboardIcon,
  Inventory: InventoryIcon,
  Category: CategoryIcon,
  BrandingWatermark: BrandingWatermarkIcon,
  Computer: ComputerIcon,
  Receipt: ReceiptIcon,
  Discount: DiscountIcon,
  Sell: SellIcon,
  People: PeopleIcon,
  RateReview: RateReviewIcon,
  Settings: SettingsIcon,
  Campaign: CampaignIcon,
  HeadsetMic: HeadsetMicIcon,
  QuestionAnswer: QuestionAnswerIcon,
  Notifications: NotificationsIcon,
  Person: PersonIcon,
};

const sectionIconMap = {
  Catalog: <InventoryIcon sx={{ fontSize: 16 }} />,
  Sales: <ReceiptIcon sx={{ fontSize: 16 }} />,
  Marketing: <CampaignIcon sx={{ fontSize: 16 }} />,
  Customers: <PeopleIcon sx={{ fontSize: 16 }} />,
  Support: <HeadsetMicIcon sx={{ fontSize: 16 }} />,
  System: <SettingsIcon sx={{ fontSize: 16 }} />,
};

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 68;

const NavItem = ({ item, collapsed, isActive, onNavigate, onClose, isMobile, badgeCount }) => {
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
      {Icon && (
        badgeCount > 0 ? (
          <Badge badgeContent={badgeCount} color="error" overlap="circular" sx={{ "& .MuiBadge-badge": { fontSize: 9, height: 16, minWidth: 16 } }}>
            <Icon fontSize="small" />
          </Badge>
        ) : (
          <Icon fontSize="small" />
        )
      )}
      {!collapsed && (
        badgeCount > 0 ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
            <span style={{ flex: 1 }}>{item.label}</span>
            <span style={{ backgroundColor: "var(--color-admin-danger)", color: "white", fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", borderRadius: "var(--radius-admin-badge)", lineHeight: "16px" }}>
              {badgeCount}
            </span>
          </span>
        ) : (
          <span>{item.label}</span>
        )
      )}
    </button>
  );

  if (collapsed) {
    return (
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{ flex: 1 }}>
          <Tooltip title={item.label} placement="right" arrow>
            {content}
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <div style={{ flex: 1 }}>{content}</div>
    </div>
  );
};

const Sidebar = ({ open, onClose, collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuthStore();
  const notifCount = useNotificationStore((s) => s.unreadCount);
  const storeName = useSettingsStore((s) => s.storeName);
  const logo = useSettingsStore((s) => s.logo);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const [activeSection, setActiveSection] = useState("Catalog");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  useEffect(() => {
    const path = location.pathname;
    for (const section of SIDEBAR_SECTIONS) {
      if (!section.section) continue;
      for (const item of section.items) {
        const match = item.path === "/admin/dashboard" ? path === item.path : path.startsWith(item.path);
        if (match) {
          setActiveSection(section.section);
          return;
        }
      }
    }
  }, [location.pathname]);

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
        {logo?.url ? (
          <img
            src={logo.url}
            alt={storeName}
            className="w-8 h-8 object-contain flex-shrink-0"
            style={{ borderRadius: "var(--radius-admin-button)" }}
          />
        ) : (
          <PrecisionManufacturingIcon sx={{ fontSize: 32, color: "var(--color-admin-white)" }} />
        )}
        {!collapsed && (
          <span className="font-extrabold text-lg" style={{ color: "var(--color-admin-white)" }}>
            {storeName || "RigCraft"}
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        {filteredSections.map((section, idx) => {
          const isNamed = !!section.section;
          const isOpen = !isNamed || !collapsed && activeSection === section.section;

          return (
            <div key={idx}>
              {isNamed && !collapsed && (
                <button
                  onClick={() => setActiveSection(activeSection === section.section ? null : section.section)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer hover:opacity-80"
                  style={{ color: "var(--color-admin-sidebar-text)", borderRadius: "var(--radius-admin-button)" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {sectionIconMap[section.section]}
                    <span>{section.section}</span>
                  </span>
                  <ExpandMoreIcon
                    sx={{
                      fontSize: 18,
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
              )}
              {isOpen && section.items.map((item) => (
                <NavItem
                  key={item.label + item.path}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive(item.path)}
                  onNavigate={navigate}
                  onClose={onClose}
                  isMobile={isMobile}
                  badgeCount={item.label === "Notifications" ? notifCount : 0}
                />
              ))}
              {idx < filteredSections.length - 1 && !collapsed && isOpen && (
                <div className="my-3 mx-3" style={{ borderTop: "1px solid var(--color-admin-divider)" }} />
              )}
            </div>
          );
        })}
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
            onClick={() => setLogoutDialogOpen(true)}
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

        <Tooltip title={collapsed ? "Exit" : ""} placement="right" arrow>
          <button
            onClick={() => navigate("/")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors
              ${collapsed ? "justify-center px-0" : ""}`}
            style={{
              borderRadius: "var(--radius-admin-button)",
              color: "var(--color-admin-sidebar-text)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-admin-sidebar-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <ExitToAppIcon fontSize="small" sx={{ transform: "scaleX(-1)" }} />
            {!collapsed && <span>Exit</span>}
          </button>
        </Tooltip>
      </div>

      <ConfirmDialog
        open={logoutDialogOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Yes, Logout"
        cancelLabel="No, Stay Logged In"
        severity="danger"
        onConfirm={() => {
          logout();
          navigate("/login");
          setLogoutDialogOpen(false);
        }}
        onCancel={() => setLogoutDialogOpen(false)}
      />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: SIDEBAR_EXPANDED,
              backgroundColor: "transparent",
              border: "none",
            },
          }
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
