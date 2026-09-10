import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box, Typography, Grid, Chip, TextField, MenuItem, IconButton, Tabs, Tab, Rating, Tooltip,
  Card, CardContent, Switch, FormControlLabel,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  PersonOff as PersonOffIcon,
  Restore as RestoreIcon,
  ShoppingBag as OrdersIcon,
  RateReview as ReviewsIcon,
  LocationOn as AddressesIcon,
  Favorite as WishlistIcon,
  Computer as BuildsIcon,
  Visibility as ViewIcon,
  CheckCircle as VerifiedIcon,
  VpnKey as VpnKeyIcon,
  InfoOutlined as InfoOutlinedIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  LocalOffer as LabelIcon,
  Warehouse as WarehouseIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon,
  Storage as StorageIcon,
  ListAlt as ListAltIcon,
  Extension as ExtensionIcon,
  Image as ImageIcon,
  Publish as PublishIcon,
  ToggleOn as ToggleOnIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import { PERMISSIONS, ROLE_PERMISSIONS } from "../../constants/permissions";
import { userService } from "../../services/userService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDateTime, formatDate } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import StatusBadge from "../../components/common/StatusBadge";
import AdminThumbnail from "../../components/common/AdminThumbnail";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { USER_STATUS_COLOR } from "../../constants/status";
import { extractError } from "../../utils/extractError";
import { reviewService } from "../../services/reviewService";
import useAuthStore from "../../store/authStore";

import { ROLES as STATUS_ROLES } from "../../constants/status";

const ALL_ROLES = Object.values(STATUS_ROLES);

const formatPhoneForDisplay = (val) => {
  const digits = (val || "").replace(/[^0-9]/g, "").replace(/^91/, "");
  return digits ? `+91 ${digits}` : "";
};

const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users", label: "Users" },
  { key: "products", label: "Products" },
  { key: "categories", label: "Categories" },
  { key: "brands", label: "Brands" },
  { key: "orders", label: "Orders" },
  { key: "prebuilts", label: "Prebuilt PCs" },
  { key: "bundles", label: "Bundles" },
  { key: "deals", label: "Deals" },
  { key: "coupons", label: "Coupons" },
  { key: "reviews", label: "Reviews" },
  { key: "support", label: "Support Tickets" },
  { key: "faqs", label: "FAQs" },
  { key: "newsletter", label: "Newsletter" },
  { key: "notifications", label: "Notifications" },
  { key: "settings", label: "Settings" },
  { key: "audit", label: "Audit Logs" },
  { key: "search", label: "Search" },
  { key: "addresses", label: "Addresses" },
  { key: "builds", label: "Builds" },
  { key: "stockAlerts", label: "Stock Alerts" },
  { key: "uploads", label: "Uploads" },
  { key: "ai", label: "AI" },
  { key: "roles", label: "Roles" },
  { key: "permissions", label: "Permissions" },
];

const TABS = [
  { label: "Overview", icon: <PeopleIcon /> },
  { label: "Orders", icon: <OrdersIcon /> },
  { label: "Reviews", icon: <ReviewsIcon /> },
  { label: "Addresses", icon: <AddressesIcon /> },
  { label: "Wishlist", icon: <WishlistIcon /> },
  { label: "PC Builds", icon: <BuildsIcon /> },
];

const StatCard = ({ label, value, icon }) => (
  <Box sx={{ p: 2.5, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", display: "flex", alignItems: "center", gap: 2, minWidth: 160 }}>
    <Box sx={{ width: 40, height: 40, borderRadius: "var(--radius-admin-avatar)", backgroundColor: "var(--color-admin-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-admin-primary)" }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>{label}</Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>{value}</Typography>
    </Box>
  </Box>
);

function PeopleIcon() {
  return <Box component="svg" viewBox="0 0 24 24" sx={{ width: 20, height: 20, fill: "currentColor" }}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></Box>;
}

const TabPanel = ({ children, value, index }) => (
  value === index && <Box sx={{ pt: 3 }}>{children}</Box>
);

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const currentUser = useAuthStore((state) => state.user);
  const ROLES = ALL_ROLES;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [reviewConfirm, setReviewConfirm] = useState(null);
  const [form, setForm] = useState({});

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [wishlist, setWishlist] = useState({ items: [] });
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  const [builds, setBuilds] = useState([]);
  const [buildsLoading, setBuildsLoading] = useState(false);
  const [buildsLoaded, setBuildsLoaded] = useState(false);

  useEffect(() => {
    userService.getById(id)
      .then((u) => { setUser(u); setForm({ firstName: u.firstName || "", lastName: u.lastName || "", email: u.email, phone: formatPhoneForDisplay(u.phone), role: u.role }); })
      .catch((err) => { toast(extractError(err, "User not found"), "error"); navigate("/admin/users"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const [customPermissions, setCustomPermissions] = useState([]);
  const [isPermissionsDirty, setIsPermissionsDirty] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  useEffect(() => {
    if (user && user.role !== STATUS_ROLES.CUSTOMER) {
      setCustomPermissions(user.permissions !== undefined ? user.permissions : (ROLE_PERMISSIONS[user.role] || []));
      setIsPermissionsDirty(false);
    }
  }, [user]);

  const currentUserPermissions = currentUser?.permissions || ROLE_PERMISSIONS[currentUser?.role] || [];
  const canManagePermissions = currentUser?.role === STATUS_ROLES.SUPER_ADMIN || currentUserPermissions.includes(PERMISSIONS.permissions.manage);

  const handlePermissionToggle = (permValue) => {
    setCustomPermissions(prev => {
      const next = prev.includes(permValue) ? prev.filter(p => p !== permValue) : [...prev, permValue];
      return next;
    });
    setIsPermissionsDirty(true);
  };

  const handleSavePermissions = async () => {
    setSavingPermissions(true);
    try {
      const updatedUser = await userService.update(user.id || user._id, { permissions: customPermissions });
      setUser(updatedUser);
      toast("Permissions saved successfully");
      setIsPermissionsDirty(false);
    } catch (err) {
      toast(extractError(err, "Failed to save permissions"), "error");
    } finally {
      setSavingPermissions(false);
    }
  };

  // Lazy-load tab data on demand; synchronous loading flags guard against
  // duplicate fetches when StrictMode re-invokes effects.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (tab === 1 && !ordersLoaded && !ordersLoading) {
      setOrdersLoading(true);
      userService.getOrders(id).then((r) => { setOrders(r.orders || []); setOrdersLoaded(true); }).catch((err) => { toast(extractError(err, "Failed to load orders"), "error"); setOrdersLoaded(true); }).finally(() => setOrdersLoading(false));
    }
    if (tab === 2 && !reviewsLoaded && !reviewsLoading) {
      setReviewsLoading(true);
      userService.getReviews(id).then((r) => { setReviews(r.docs || []); setReviewsLoaded(true); }).catch((err) => { toast(extractError(err, "Failed to load reviews"), "error"); setReviewsLoaded(true); }).finally(() => setReviewsLoading(false));
    }
    if (tab === 3 && !addressesLoaded && !addressesLoading) {
      setAddressesLoading(true);
      userService.getAddresses(id).then((r) => { setAddresses(r); setAddressesLoaded(true); }).catch((err) => { toast(extractError(err, "Failed to load addresses"), "error"); setAddressesLoaded(true); }).finally(() => setAddressesLoading(false));
    }
    if (tab === 4 && !wishlistLoaded && !wishlistLoading) {
      setWishlistLoading(true);
      userService.getWishlist(id).then((r) => { setWishlist(r); setWishlistLoaded(true); }).catch((err) => { toast(extractError(err, "Failed to load wishlist"), "error"); setWishlistLoaded(true); }).finally(() => setWishlistLoading(false));
    }
    if (tab === 5 && !buildsLoaded && !buildsLoading) {
      setBuildsLoading(true);
      userService.getBuilds(id).then((r) => { setBuilds(r.docs || []); setBuildsLoaded(true); }).catch((err) => { toast(extractError(err, "Failed to load builds"), "error"); setBuildsLoaded(true); }).finally(() => setBuildsLoading(false));
    }
  }, [tab, id, toast, ordersLoaded, ordersLoading, reviewsLoaded, reviewsLoading, addressesLoaded, addressesLoading, wishlistLoaded, wishlistLoading, buildsLoaded, buildsLoading]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = async () => {
    const phone = (form.phone || "").replace(/\s/g, "");
    if (phone && !/^\+91\d{10}$/.test(phone)) {
      toast("Please enter a valid mobile number", "error");
      return;
    }
    if (!form.firstName?.trim() || !form.lastName?.trim()) {
      toast("First name and last name are required", "error");
      return;
    }
    setSaving(true);
    try {
      const updated = await userService.update(id, { ...form, phone });
      setUser(updated);
      setEditing(false);
      toast("User updated");
    } catch (err) {
      toast(extractError(err, "Failed to update user"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, "").replace(/^91/, "");
    setForm({ ...form, phone: digits ? `+91 ${digits}` : "" });
  };

  const handleBlockToggle = async () => {
    try {
      const updated = await userService.toggleBlock(id);
      setUser((prev) => ({ ...prev, status: updated.isBlocked ? "blocked" : "active" }));
      toast(updated.isBlocked ? "User blocked" : "User unblocked");
    } catch (err) {
      toast(extractError(err, "Failed to update user"), "error");
    }
    setConfirmAction(null);
  };

  const handleDeactivateToggle = async () => {
    try {
      const updated = await userService.toggleDeactivate(id);
      setUser((prev) => ({
        ...prev,
        status: updated.deactivatedAt ? "deactivated" : updated.isBlocked ? "blocked" : "active",
      }));
      toast(updated.deactivatedAt ? "User deactivated" : "User restored");
    } catch (err) {
      toast(extractError(err, "Failed to update user"), "error");
    }
    setConfirmAction(null);
  };

  const handleDelete = async () => {
    try {
      await userService.remove(id);
      toast("User deleted");
      navigate("/admin/users");
    } catch (err) {
      toast(extractError(err, "Failed to delete user"), "error");
    }
    setConfirmAction(null);
  };

  const handleReviewStatus = async (reviewId, status) => {
    try {
      await reviewService.updateStatus(reviewId, status);
      setReviews((prev) => prev.map((r) => r._id === reviewId ? { ...r, status } : r));
      toast(`Review ${status}`);
    } catch (err) {
      toast(extractError(err, "Failed to update review"), "error");
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      await reviewService.delete(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      toast("Review deleted");
    } catch (err) {
      toast(extractError(err, "Failed to delete review"), "error");
    }
  };

  if (loading) return <Loading />;
  if (!user) return null;

  const isBlocked = user.status === "blocked";
  const isDeactivated = user.status === "deactivated";
  const s = user.stats || {};
  const isCustomer = user.role === STATUS_ROLES.CUSTOMER;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate((location.pathname.startsWith("/admin/roles") || location.pathname.startsWith("/admin/settings/roles")) ? "/admin/settings/roles" : "/admin/users")} />
        <AdminThumbnail
          src={user.avatar}
          alt={user.name}
          size={52}
          sx={{ borderRadius: "var(--radius-admin-avatar)", border: "none" }}
          fallback={<Box sx={{ width: 52, height: 52, borderRadius: "var(--radius-admin-avatar)", backgroundColor: "var(--color-admin-primary)", color: "var(--color-admin-white)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: 700, flexShrink: 0 }}>{user.name?.charAt(0)}</Box>}
        />
        <Box sx={{ width: 4, height: 28, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2, overflowWrap: "break-word", fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.5rem" } }}>{user.name}</Typography>
            <Chip label={user.role} size="small" variant="outlined" sx={{ textTransform: "capitalize", borderRadius: "var(--radius-admin-badge)", fontSize: "0.7rem" }} />
            <StatusBadge status={user.status} colorMap={USER_STATUS_COLOR} />
          </Box>
          <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", fontWeight: 500, overflowWrap: "break-word" }}>{user.email} {user.phone && `· ${formatPhoneForDisplay(user.phone)}`}</Typography>
        </Box>
        <IconButton onClick={() => { setEditing(!editing); if (!editing) setForm({ firstName: user.firstName || "", lastName: user.lastName || "", email: user.email, phone: formatPhoneForDisplay(user.phone), role: user.role }); }}
          sx={{ color: editing ? "var(--color-admin-primary)" : "var(--color-admin-muted)" }}>
          {editing ? <CloseIcon /> : <EditIcon />}
        </IconButton>
      </Box>

      {/* Tabs - Only for Customers */}
      {isCustomer && (
        <Box sx={{ borderBottom: 1, borderColor: "var(--color-admin-border)" }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.8125rem", minHeight: 48 }, "& .Mui-selected": { color: "var(--color-admin-primary) !important" }, "& .MuiTabs-indicator": { backgroundColor: "var(--color-admin-primary)" } }}>
            {TABS.map((t, i) => <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} />)}
          </Tabs>
        </Box>
      )}

      {/* Tab 0: Overview / Staff Profile */}
      {(isCustomer ? tab === 0 : true) && (
        <Box sx={{ pt: 3 }}>
        {editing ? (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3, maxWidth: 520 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Edit Account</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="First Name" size="small" fullWidth value={form.firstName || ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                <TextField label="Last Name" size="small" fullWidth value={form.lastName || ""} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </Box>
              <TextField label="Email" size="small" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <TextField label="Phone" size="small" value={form.phone || ""} onChange={handlePhoneChange} />
              <TextField label="Role" size="small" select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>)}
              </TextField>
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <AdminButton variant="primary" size="small" icon={<CheckIcon />} loading={saving} onClick={handleSave}>Save</AdminButton>
                <AdminButton variant="secondary" size="small" onClick={() => setEditing(false)}>Cancel</AdminButton>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Profile</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Email</Typography>
                <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500 }}>{user.email}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Phone</Typography>
                <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500 }}>{user.phone ? formatPhoneForDisplay(user.phone) : "—"}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>

              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Joined</Typography>
                <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500 }}>{formatDateTime(user.registeredAt)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Last Login</Typography>
                <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500 }}>{user.lastLogin ? formatDateTime(user.lastLogin) : "—"}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}
        {isCustomer && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Statistics</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <StatCard label="Orders" value={s.orders ?? 0} icon={<OrdersIcon />} />
              <StatCard label="Total Spent" value={formatCurrency(s.totalSpent ?? 0)} icon={<PeopleIcon />} />
              <StatCard label="Avg Order" value={formatCurrency(s.avgOrderValue ?? 0)} icon={<PeopleIcon />} />
              <StatCard label="Wishlist" value={s.wishlist ?? 0} icon={<WishlistIcon />} />
              <StatCard label="Reviews" value={s.reviews ?? 0} icon={<ReviewsIcon />} />
              <StatCard label="Saved Builds" value={s.savedBuilds ?? 0} icon={<BuildsIcon />} />
            </Box>
          </>
        )}
        </Box>
      )}

      {/* Tab 1: Orders */}
      {isCustomer && (
      <TabPanel value={tab} index={1}>
        {ordersLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </Box>
        ) : !ordersLoaded ? null : orders.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "var(--color-admin-muted)" }}>No orders found</Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-admin-border)", textAlign: "left" }}>
                  {["Order ID", "Date", "Items", "Amount", "Payment", "Status", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 12px", color: "var(--color-admin-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} style={{ borderBottom: "1px solid var(--color-admin-border)" }}>
                    <td style={{ padding: "12px", fontWeight: 600, color: "var(--color-admin-text)" }}>{o.orderNumber}</td>
                    <td style={{ padding: "12px", color: "var(--color-admin-text-secondary)" }}>{formatDate(o.createdAt)}</td>
                    <td style={{ padding: "12px", color: "var(--color-admin-text-secondary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {o.items?.map((i) => i.item?.name || i.name || "Item").join(", ")}
                    </td>
                    <td style={{ padding: "12px", fontWeight: 600 }}>{formatCurrency(o.total)}</td>
                    <td style={{ padding: "12px" }}><StatusBadge status={o.paymentStatus} colorMap={{ paid: "success", unpaid: "warning", refunded: "info" }} /></td>
                    <td style={{ padding: "12px" }}><StatusBadge status={o.orderStatus} colorMap={{ pending: "warning", confirmed: "info", processing: "info", shipped: "primary", delivered: "success", cancelled: "error" }} /></td>
                    <td style={{ padding: "12px" }}>
                      <Tooltip title="View Order">
                        <IconButton size="small" onClick={() => navigate(`/admin/orders/${o._id}`)} sx={{ color: "var(--color-admin-primary)" }}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </TabPanel>
      )}

      {/* Tab 2: Reviews */}
      {isCustomer && (
      <TabPanel value={tab} index={2}>
        {reviewsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </Box>
        ) : !reviewsLoaded ? null : reviews.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "var(--color-admin-muted)" }}>No reviews found</Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-admin-border)", textAlign: "left" }}>
                  {["Product", "Rating", "Comment", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 12px", color: "var(--color-admin-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r._id} style={{ borderBottom: "1px solid var(--color-admin-border)" }}>
                    <td style={{ padding: "12px", fontWeight: 500, color: "var(--color-admin-text)" }}>{r.item?.name || r.product?.name || "—"}</td>
                    <td style={{ padding: "12px" }}><Rating value={r.rating} readOnly size="small" /></td>
                    <td style={{ padding: "12px", color: "var(--color-admin-text-secondary)", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.comment || r.title}</td>
                    <td style={{ padding: "12px" }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: "12px", color: "var(--color-admin-text-secondary)", whiteSpace: "nowrap" }}>{formatDate(r.createdAt)}</td>
                    <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {r.status === "pending" && (
                          <>
                            <AdminButton variant="success" size="smallest" onClick={() => setReviewConfirm({ action: "approved", reviewId: r._id })}>Approve</AdminButton>
                            <AdminButton variant="danger" size="smallest" onClick={() => setReviewConfirm({ action: "rejected", reviewId: r._id })}>Reject</AdminButton>
                          </>
                        )}
                        <AdminButton variant="ghost" size="smallest" icon={<ViewIcon />} onClick={() => navigate(`/admin/reviews/${r._id}`)} />
                        <AdminButton variant="ghost" size="smallest" icon={<DeleteIcon />} onClick={() => setReviewConfirm({ action: "delete", reviewId: r._id })} />
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </TabPanel>
      )}

      {/* Tab 3: Addresses */}
      {isCustomer && (
      <TabPanel value={tab} index={3}>
        {addressesLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </Box>
        ) : !addressesLoaded ? null : addresses.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "var(--color-admin-muted)" }}>No addresses saved</Box>
        ) : (
          <Grid container spacing={2}>
            {addresses.map((a) => (
              <Grid key={a._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={{ p: 2.5, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", height: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <Chip label={a.label || "Address"} size="small" variant="outlined" sx={{ textTransform: "capitalize", borderRadius: "var(--radius-admin-badge)" }} />
                    {a.isDefault && <Chip label="Default" size="small" color="primary" sx={{ borderRadius: "var(--radius-admin-badge)" }} />}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-admin-text)" }}>{a.fullName}</Typography>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", mt: 0.5 }}>{a.phone}</Typography>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", mt: 0.5 }}>{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ""}</Typography>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>{a.city}, {a.state} — {a.postalCode}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      )}

      {/* Tab 4: Wishlist */}
      {isCustomer && (
      <TabPanel value={tab} index={4}>
        {wishlistLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </Box>
        ) : !wishlistLoaded ? null : !wishlist.items?.length ? (
          <Box sx={{ textAlign: "center", py: 6, color: "var(--color-admin-muted)" }}>Wishlist is empty</Box>
        ) : (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {wishlist.items.map((item, i) => (
              <Box key={i} sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", display: "flex", alignItems: "center", gap: 1.5, minWidth: 200 }}>
                <AdminThumbnail src={item.item?.images?.[0]?.url || item.item?.image} alt={item.item?.name} size={44} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-admin-text)" }}>{item.item?.name}</Typography>
                  <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", textTransform: "capitalize" }}>{item.itemType}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </TabPanel>
      )}

      {/* Tab 5: PC Builds */}
      {isCustomer && (
      <TabPanel value={tab} index={5}>
        {buildsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </Box>
        ) : !buildsLoaded ? null : builds.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "var(--color-admin-muted)" }}>No saved builds</Box>
        ) : (
          <Grid container spacing={2}>
            {builds.map((b) => (
              <Grid key={b._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={{ p: 2.5, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--color-admin-text)", mb: 1 }}>{b.name}</Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                    <Chip label={b.compatibility?.status || "incomplete"} size="small" color={b.compatibility?.status === "compatible" ? "success" : b.compatibility?.status === "incompatible" ? "error" : "default"} sx={{ borderRadius: "var(--radius-admin-badge)", textTransform: "capitalize" }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 600 }}>{formatCurrency(b.totalPrice)}</Typography>
                  <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mt: 0.5 }}>{formatDate(b.createdAt)}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      )}

      {/* Permissions Section (Only for Staff) */}
      {!isCustomer && (
        <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid var(--color-admin-border)" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "var(--color-admin-text)" }}>Access Control</Typography>
            {canManagePermissions && (
              <AdminButton 
                variant="primary" 
                size="small" 
                onClick={handleSavePermissions} 
                loading={savingPermissions}
                disabled={!isPermissionsDirty}
              >
                Save Permissions
              </AdminButton>
            )}
          </Box>
          <Grid container spacing={3}>
            {(() => {
              const MODULE_ICONS = {
                dashboard: <DashboardIcon sx={{ fontSize: 20 }} />,
                users: <GroupIcon sx={{ fontSize: 20 }} />,
                products: <InventoryIcon sx={{ fontSize: 20 }} />,
                categories: <CategoryIcon sx={{ fontSize: 20 }} />,
                brands: <LabelIcon sx={{ fontSize: 20 }} />,
                orders: <OrdersIcon sx={{ fontSize: 20 }} />,
                prebuilts: <BuildsIcon sx={{ fontSize: 20 }} />,
                inventory: <WarehouseIcon sx={{ fontSize: 20 }} />,
                customers: <GroupIcon sx={{ fontSize: 20 }} />,
                reviews: <ReviewsIcon sx={{ fontSize: 20 }} />,
                reports: <AssessmentIcon sx={{ fontSize: 20 }} />,
                administration: <VpnKeyIcon sx={{ fontSize: 20 }} />,
                roles: <VpnKeyIcon sx={{ fontSize: 20 }} />,
                permissions: <VpnKeyIcon sx={{ fontSize: 20 }} />,
                payments: <AttachMoneyIcon sx={{ fontSize: 20 }} />,
                supportTickets: <InfoOutlinedIcon sx={{ fontSize: 20 }} />,
                liveChat: <ChatIcon sx={{ fontSize: 20 }} />,
                coupons: <LabelIcon sx={{ fontSize: 20 }} />,
              };

              const ACTION_ICONS = {
                create: <AddIcon sx={{ fontSize: 16 }} />,
                read: <ViewIcon sx={{ fontSize: 16 }} />,
                update: <EditIcon sx={{ fontSize: 16 }} />,
                delete: <DeleteIcon sx={{ fontSize: 16 }} />,
                managePricing: <AttachMoneyIcon sx={{ fontSize: 16 }} />,
                manageInventory: <StorageIcon sx={{ fontSize: 16 }} />,
                manageSpecifications: <ListAltIcon sx={{ fontSize: 16 }} />,
                manageCompatibility: <ExtensionIcon sx={{ fontSize: 16 }} />,
                manageImages: <ImageIcon sx={{ fontSize: 16 }} />,
                publish: <PublishIcon sx={{ fontSize: 16 }} />,
                toggleStatus: <ToggleOnIcon sx={{ fontSize: 16 }} />,
                updateStock: <EditIcon sx={{ fontSize: 16 }} />,
                productReports: <AssessmentIcon sx={{ fontSize: 16 }} />,
                assignRole: <VpnKeyIcon sx={{ fontSize: 16 }} />,
                manageRoles: <VpnKeyIcon sx={{ fontSize: 16 }} />,
                managePermissions: <VpnKeyIcon sx={{ fontSize: 16 }} />,
                block: <BlockIcon sx={{ fontSize: 16 }} />,
                unblock: <CheckIcon sx={{ fontSize: 16 }} />,
                cancel: <CloseIcon sx={{ fontSize: 16 }} />,
                refund: <AttachMoneyIcon sx={{ fontSize: 16 }} />,
                moderate: <CheckIcon sx={{ fontSize: 16 }} />,
                confirm: <CheckIcon sx={{ fontSize: 16 }} />,
                process: <ListAltIcon sx={{ fontSize: 16 }} />,
                ship: <StorageIcon sx={{ fontSize: 16 }} />,
                deliver: <CheckIcon sx={{ fontSize: 16 }} />,
                handleReturn: <RestoreIcon sx={{ fontSize: 16 }} />,
                readTransaction: <ViewIcon sx={{ fontSize: 16 }} />,
                manage: <EditIcon sx={{ fontSize: 16 }} />,
                salesReports: <AssessmentIcon sx={{ fontSize: 16 }} />,
                readDetails: <ViewIcon sx={{ fontSize: 16 }} />,
                readOrders: <OrdersIcon sx={{ fontSize: 16 }} />,
                readAddresses: <AddressesIcon sx={{ fontSize: 16 }} />,
                suspend: <BlockIcon sx={{ fontSize: 16 }} />,
                readStatus: <ViewIcon sx={{ fontSize: 16 }} />,
                readCompatibility: <ExtensionIcon sx={{ fontSize: 16 }} />,
                approve: <CheckIcon sx={{ fontSize: 16 }} />,
                reply: <ChatIcon sx={{ fontSize: 16 }} />,
                assign: <GroupIcon sx={{ fontSize: 16 }} />,
                close: <CloseIcon sx={{ fontSize: 16 }} />,
                escalate: <PublishIcon sx={{ fontSize: 16 }} />,
                chat: <ChatIcon sx={{ fontSize: 16 }} />,
                transfer: <ArrowBackIcon sx={{ fontSize: 16 }} />,
                supportReports: <AssessmentIcon sx={{ fontSize: 16 }} />,
              };

              const ADMIN_CONFIG = [
                {
                  key: "administration", label: "Administration",
                  permissions: [
                    { key: "create", label: "Create Admin User", value: PERMISSIONS.users.create },
                    { key: "update", label: "Update Admin User", value: PERMISSIONS.users.update },
                    { key: "assignRole", label: "Assign Role", value: PERMISSIONS.users.assignRole },
                  ]
                },
                {
                  key: "roles", label: "Roles",
                  permissions: [
                    { key: "manageRoles", label: "Manage Roles", value: PERMISSIONS.roles.manage },
                  ]
                },
                {
                  key: "permissions", label: "Permissions",
                  permissions: [
                    { key: "managePermissions", label: "Manage Permissions", value: PERMISSIONS.permissions.manage },
                  ]
                },
                {
                  key: "customers", label: "Customers",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.users.read },
                    { key: "update", label: "Update", value: PERMISSIONS.users.update },
                    { key: "block", label: "Block", value: PERMISSIONS.users.block },
                    { key: "unblock", label: "Unblock", value: PERMISSIONS.users.deactivate },
                  ]
                },
                {
                  key: "categories", label: "Categories",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.categories.read },
                    { key: "create", label: "Create", value: PERMISSIONS.categories.create },
                    { key: "update", label: "Update", value: PERMISSIONS.categories.update },
                    { key: "delete", label: "Delete", value: PERMISSIONS.categories.delete },
                  ]
                },
                {
                  key: "brands", label: "Brands",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.brands.read },
                    { key: "create", label: "Create", value: PERMISSIONS.brands.create },
                    { key: "update", label: "Update", value: PERMISSIONS.brands.update },
                    { key: "delete", label: "Delete", value: PERMISSIONS.brands.delete },
                  ]
                },
                {
                  key: "products", label: "Products",
                  permissions: [
                    { key: "create", label: "Create", value: PERMISSIONS.products.create },
                    { key: "read", label: "Read", value: PERMISSIONS.products.read },
                    { key: "update", label: "Update", value: PERMISSIONS.products.update },
                    { key: "delete", label: "Delete", value: PERMISSIONS.products.delete },
                    { key: "publish", label: "Publish", value: PERMISSIONS.products.publish },
                  ]
                },
                {
                  key: "orders", label: "Orders",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.orders.read },
                    { key: "update", label: "Update", value: PERMISSIONS.orders.update },
                    { key: "cancel", label: "Cancel", value: PERMISSIONS.orders.cancel },
                    { key: "refund", label: "Refund", value: PERMISSIONS.orders.refund },
                  ]
                },
                {
                  key: "reviews", label: "Reviews",
                  permissions: [
                    { key: "moderate", label: "Approve / Reject", value: PERMISSIONS.reviews.moderate },
                  ]
                },
                {
                  key: "reports", label: "Reports",
                  permissions: [
                    { key: "read", label: "Read / Export", value: PERMISSIONS.reports?.product },
                  ]
                }
              ];

              const ORDER_MANAGER_CONFIG = [
                {
                  key: "orders", label: "Orders",
                  permissions: [
                    { key: "readDetails", label: "Read Details", value: PERMISSIONS.orders.read },
                    { key: "update", label: "Update", value: PERMISSIONS.orders.update },
                    { key: "confirm", label: "Confirm", value: PERMISSIONS.orders.manageStatus },
                    { key: "process", label: "Process", value: PERMISSIONS.orders.process },
                    { key: "ship", label: "Ship", value: PERMISSIONS.orders.ship },
                    { key: "deliver", label: "Deliver", value: PERMISSIONS.orders.deliver },
                    { key: "cancel", label: "Cancel", value: PERMISSIONS.orders.cancel },
                    { key: "handleReturn", label: "Handle Return", value: PERMISSIONS.orders.return },
                    { key: "refund", label: "Refund", value: PERMISSIONS.orders.refund },
                  ]
                },
                {
                  key: "payments", label: "Payments",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.orders.managePaymentStatus },
                    { key: "readTransaction", label: "Read Transaction", value: PERMISSIONS.settings.managePaymentKeys },
                  ]
                },
                {
                  key: "inventory", label: "Inventory",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.inventory?.read },
                  ]
                },
                {
                  key: "customers", label: "Customers",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.users.read },
                    { key: "block", label: "Block", value: PERMISSIONS.users.block },
                  ]
                },
                {
                  key: "products", label: "Products",
                  permissions: [
                    { key: "update", label: "Update", value: PERMISSIONS.products.update },
                    { key: "delete", label: "Delete", value: PERMISSIONS.products.delete },
                  ]
                },
                {
                  key: "coupons", label: "Coupons",
                  permissions: [
                    { key: "manage", label: "Manage", value: PERMISSIONS.coupons.update },
                  ]
                },
                {
                  key: "reports", label: "Reports",
                  permissions: [
                    { key: "salesReports", label: "Sales Reports", value: PERMISSIONS.reports?.product },
                  ]
                }
              ];

              const SUPPORT_EXECUTIVE_CONFIG = [
                {
                  key: "customers", label: "Customers",
                  permissions: [
                    { key: "readDetails", label: "Read Details", value: PERMISSIONS.users.read },
                    { key: "readOrders", label: "Read Orders", value: PERMISSIONS.orders.list },
                    { key: "readAddresses", label: "Read Addresses", value: PERMISSIONS.addresses.read },
                    { key: "suspend", label: "Suspend", value: PERMISSIONS.users.block },
                  ]
                },
                {
                  key: "orders", label: "Orders",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.orders.list },
                    { key: "readDetails", label: "Read Details", value: PERMISSIONS.orders.read },
                    { key: "update", label: "Update", value: PERMISSIONS.orders.update },
                    { key: "cancel", label: "Cancel", value: PERMISSIONS.orders.cancel },
                    { key: "refund", label: "Refund", value: PERMISSIONS.orders.refund },
                  ]
                },
                {
                  key: "payments", label: "Payments",
                  permissions: [
                    { key: "readStatus", label: "Read Status", value: PERMISSIONS.orders.managePaymentStatus },
                    { key: "readTransaction", label: "Read Transaction", value: PERMISSIONS.settings.managePaymentKeys },
                  ]
                },
                {
                  key: "products", label: "Products",
                  permissions: [
                    { key: "readCompatibility", label: "Read Compatibility", value: PERMISSIONS.builds.compatibilityIssues },
                  ]
                },
                {
                  key: "reviews", label: "Reviews",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.reviews.read },
                    { key: "approve", label: "Approve", value: PERMISSIONS.reviews.moderate },
                  ]
                },
                {
                  key: "supportTickets", label: "Support Tickets",
                  permissions: [
                    { key: "create", label: "Create", value: PERMISSIONS.support.createTicket },
                    { key: "read", label: "Read", value: PERMISSIONS.support.read },
                    { key: "update", label: "Update", value: PERMISSIONS.support.update },
                    { key: "reply", label: "Reply", value: PERMISSIONS.support.reply },
                    { key: "assign", label: "Assign", value: PERMISSIONS.support.assign },
                    { key: "close", label: "Close", value: PERMISSIONS.support.updateStatus },
                    { key: "escalate", label: "Escalate", value: PERMISSIONS.support.updatePriority },
                  ]
                },
                {
                  key: "liveChat", label: "Live Chat",
                  permissions: [
                    { key: "chat", label: "Chat", value: PERMISSIONS.ai.chat },
                    { key: "transfer", label: "Transfer", value: PERMISSIONS.ai.chat },
                  ]
                },
                {
                  key: "reports", label: "Reports",
                  permissions: [
                    { key: "supportReports", label: "Support Reports", value: PERMISSIONS.reports?.product },
                  ]
                }
              ];

              const PRODUCT_MANAGER_CONFIG = [
                {
                  key: "categories", label: "Categories",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.categories.read },
                    { key: "create", label: "Create", value: PERMISSIONS.categories.create },
                    { key: "update", label: "Update", value: PERMISSIONS.categories.update },
                    { key: "delete", label: "Delete", value: PERMISSIONS.categories.delete },
                    { key: "toggleStatus", label: "Change Status", value: PERMISSIONS.categories.toggleStatus },
                  ]
                },
                {
                  key: "brands", label: "Brands",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.brands.read },
                    { key: "create", label: "Create", value: PERMISSIONS.brands.create },
                    { key: "update", label: "Update", value: PERMISSIONS.brands.update },
                    { key: "delete", label: "Delete", value: PERMISSIONS.brands.delete },
                  ]
                },
                {
                  key: "products", label: "Products",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.products.read },
                    { key: "create", label: "Create", value: PERMISSIONS.products.create },
                    { key: "update", label: "Update", value: PERMISSIONS.products.update },
                    { key: "delete", label: "Delete", value: PERMISSIONS.products.delete },
                    { key: "managePricing", label: "Manage Pricing", value: PERMISSIONS.products.managePricing },
                    { key: "manageInventory", label: "Manage Inventory", value: PERMISSIONS.products.manageStock },
                    { key: "manageSpecifications", label: "Manage Specifications", value: PERMISSIONS.products.manageSpecifications },
                    { key: "manageCompatibility", label: "Manage Compatibility", value: PERMISSIONS.products.manageCompatibility },
                    { key: "manageImages", label: "Manage Images", value: PERMISSIONS.products.manageImages },
                    { key: "publish", label: "Publish", value: PERMISSIONS.products.publish },
                  ]
                },
                {
                  key: "prebuilts", label: "Prebuilt PCs",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.prebuilts.read },
                    { key: "create", label: "Create", value: PERMISSIONS.prebuilts.create },
                    { key: "update", label: "Update", value: PERMISSIONS.prebuilts.update },
                    { key: "delete", label: "Delete", value: PERMISSIONS.prebuilts.delete },
                    { key: "publish", label: "Publish", value: PERMISSIONS.prebuilts.publish },
                  ]
                },
                {
                  key: "inventory", label: "Inventory",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.inventory?.read },
                    { key: "updateStock", label: "Update Stock", value: PERMISSIONS.inventory?.updateStock },
                  ]
                },
                {
                  key: "customers", label: "Customers",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.users.read },
                  ]
                },
                {
                  key: "reviews", label: "Reviews",
                  permissions: [
                    { key: "read", label: "Read", value: PERMISSIONS.reviews.read },
                  ]
                },
                {
                  key: "reports", label: "Reports",
                  permissions: [
                    { key: "productReports", label: "Product Reports", value: PERMISSIONS.reports?.product },
                  ]
                }
              ];

              let renderConfig = [];
              if (user.role === STATUS_ROLES.PRODUCT_MANAGER) {
                renderConfig = PRODUCT_MANAGER_CONFIG;
              } else if (user.role === STATUS_ROLES.ADMIN) {
                renderConfig = ADMIN_CONFIG;
              } else if (user.role === STATUS_ROLES.ORDER_MANAGER) {
                renderConfig = ORDER_MANAGER_CONFIG;
              } else if (user.role === STATUS_ROLES.SUPPORT_EXECUTIVE) {
                renderConfig = SUPPORT_EXECUTIVE_CONFIG;
              } else {
                renderConfig = MODULES.map(module => {
                  const modPerms = PERMISSIONS[module.key];
                  if (!modPerms) return null;
                  const keys = Object.keys(modPerms);
                  if (keys.length === 0) return null;
                  return {
                    key: module.key,
                    label: module.label,
                    permissions: keys.map(k => ({
                      key: k,
                      label: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').trim(),
                      value: modPerms[k]
                    }))
                  };
                }).filter(Boolean);
              }

              return renderConfig.map((module) => {
                const total = module.permissions.length;
                const grantedCount = module.permissions.filter(p => customPermissions.includes(p.value)).length;

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={module.key}>
                    <Card sx={{ height: "100%", borderRadius: "var(--radius-admin-card)", border: "1px solid var(--color-admin-border)", boxShadow: "none" }}>
                      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, pb: 1.5, borderBottom: "1px solid var(--color-admin-border)" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: "8px", backgroundColor: "var(--color-admin-primary-bg)", color: "var(--color-admin-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {MODULE_ICONS[module.key] || <DashboardIcon sx={{ fontSize: 20 }} />}
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--color-admin-text)" }}>
                              {module.label}
                            </Typography>
                          </Box>
                          <Box sx={{ px: 1, py: 0.5, borderRadius: "12px", backgroundColor: "var(--color-admin-bg)", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-admin-muted)" }}>
                            {grantedCount}/{total}
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                          {module.permissions.map((perm) => {
                            const isGranted = customPermissions.includes(perm.value);
                            return (
                              <Box key={perm.key} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: isGranted ? "var(--color-admin-text)" : "var(--color-admin-muted)" }}>
                                  {ACTION_ICONS[perm.key] || <ViewIcon sx={{ fontSize: 16 }} />}
                                  <Typography variant="body2" sx={{ fontWeight: isGranted ? 500 : 400 }}>
                                    {perm.label}
                                  </Typography>
                                </Box>
                                <Switch
                                  checked={isGranted}
                                  onChange={() => handlePermissionToggle(perm.value)}
                                  disabled={!canManagePermissions}
                                  size="small"
                                  sx={{
                                    p: 0,
                                    width: 36,
                                    height: 20,
                                    "& .MuiSwitch-switchBase": {
                                      p: "2px",
                                      "&.Mui-checked": {
                                        transform: "translateX(16px)",
                                        color: "#fff",
                                        "& + .MuiSwitch-track": {
                                          backgroundColor: "var(--color-admin-primary)",
                                          opacity: 1,
                                          border: 0,
                                        },
                                      },
                                    },
                                    "& .MuiSwitch-thumb": {
                                      width: 16,
                                      height: 16,
                                      boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
                                    },
                                    "& .MuiSwitch-track": {
                                      borderRadius: 10,
                                      backgroundColor: "var(--color-admin-border)",
                                      opacity: 1,
                                    },
                                    "& .MuiSwitch-switchBase.Mui-disabled": {
                                      opacity: 0.8,
                                    }
                                  }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              });
            })()}
          </Grid>
        </Box>
      )}

      {/* Admin Actions */}
      <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid var(--color-admin-border)" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Admin Actions</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <AdminButton variant={isBlocked ? "success" : "warning"} size="small" icon={<BlockIcon />} onClick={() => setConfirmAction(isBlocked ? "unblock" : "block")}>

            {isBlocked ? "Unblock" : "Block"}
          </AdminButton>
          <AdminButton variant={isDeactivated ? "success" : "warning"} size="small" icon={isDeactivated ? <RestoreIcon /> : <PersonOffIcon />} onClick={() => setConfirmAction(isDeactivated ? "restore" : "deactivate")}>
            {isDeactivated ? "Restore Account" : "Deactivate"}
          </AdminButton>
          <AdminButton variant="danger" size="small" icon={<DeleteIcon />} onClick={() => setConfirmAction("delete")}>
            Delete Permanently
          </AdminButton>
        </Box>
      </Box>

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction === "block" ? "Block User" : confirmAction === "unblock" ? "Unblock User" : confirmAction === "deactivate" ? "Deactivate User" : confirmAction === "restore" ? "Restore User" : "Delete User Permanently"}
        message={confirmAction === "block" ? "Are you sure you want to block this user? They will not be able to access their account." : confirmAction === "unblock" ? "Are you sure you want to unblock this user?" : confirmAction === "deactivate" ? "Are you sure you want to deactivate this user's account? They will not be able to sign in until it is restored." : confirmAction === "restore" ? "Are you sure you want to restore this user's account? They will regain access to it." : "Are you sure you want to PERMANENTLY DELETE this user? This action is irreversible and will destroy all their data including orders, reviews, cart, wishlist, builds, and addresses."}
        confirmLabel={confirmAction === "block" ? "Yes, Block" : confirmAction === "unblock" ? "Yes, Unblock" : confirmAction === "deactivate" ? "Yes, Deactivate" : confirmAction === "restore" ? "Yes, Restore" : "Yes, Delete Permanently"}
        cancelLabel="No, Cancel"
        severity={confirmAction === "delete" || confirmAction === "deactivate" ? "danger" : "warning"}
        loading={saving}
        onConfirm={() => { if (confirmAction === "delete") handleDelete(); else if (confirmAction === "deactivate" || confirmAction === "restore") handleDeactivateToggle(); else handleBlockToggle(); }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={!!reviewConfirm}
        title={reviewConfirm?.action === "approved" ? "Approve Review" : reviewConfirm?.action === "rejected" ? "Reject Review" : "Delete Review"}
        message={reviewConfirm?.action === "approved" ? "Are you sure you want to approve this review? It will be visible on the product page." : reviewConfirm?.action === "rejected" ? "Are you sure you want to reject this review? It will be hidden from the product page." : "Are you sure you want to permanently delete this review? This action cannot be undone."}
        confirmLabel={reviewConfirm?.action === "approved" ? "Yes, Approve" : reviewConfirm?.action === "rejected" ? "Yes, Reject" : "Yes, Delete"}
        cancelLabel={reviewConfirm?.action === "delete" ? "No, Keep Review" : "No, Keep Pending"}
        severity={reviewConfirm?.action === "approved" ? "success" : "danger"}
        loading={saving}
        onConfirm={() => {
          if (reviewConfirm?.action === "delete") handleReviewDelete(reviewConfirm.reviewId);
          else handleReviewStatus(reviewConfirm.reviewId, reviewConfirm.action);
          setReviewConfirm(null);
        }}
        onCancel={() => setReviewConfirm(null)}
      />
    </Box>
  );
};

export default UserDetails;
