import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Typography, Grid, Chip, TextField, MenuItem, IconButton, Tabs, Tab, Rating, Tooltip,
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
} from "@mui/icons-material";
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

const ALL_ROLES = ["customer", "admin", "manager"];

const formatPhoneForDisplay = (val) => {
  const digits = (val || "").replace(/[^0-9]/g, "").replace(/^91/, "");
  return digits ? `+91 ${digits}` : "";
};

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
  const { toast } = useToast();
  const currentUser = useAuthStore((state) => state.user);
  const isManager = currentUser?.role === "manager";
  const ROLES = isManager ? ALL_ROLES.filter((r) => r !== "admin") : ALL_ROLES;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/users")} />
        <AdminThumbnail
          src={user.avatar}
          alt={user.name}
          size={52}
          sx={{ borderRadius: "var(--radius-admin-avatar)", border: "none" }}
          fallback={<Box sx={{ width: 52, height: 52, borderRadius: "var(--radius-admin-avatar)", backgroundColor: "var(--color-admin-primary)", color: "var(--color-admin-white)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: 700, flexShrink: 0 }}>{user.name?.charAt(0)}</Box>}
        />
        <Box sx={{ width: 4, height: 28, borderRadius: 2, backgroundColor: "var(--color-admin-primary)" }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>{user.name}</Typography>
            <Chip label={user.role} size="small" variant="outlined" sx={{ textTransform: "capitalize", borderRadius: "var(--radius-admin-badge)", fontSize: "0.7rem" }} />
            <StatusBadge status={user.status} colorMap={USER_STATUS_COLOR} />
          </Box>
          <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", fontWeight: 500 }}>{user.email} {user.phone && `· ${formatPhoneForDisplay(user.phone)}`}</Typography>
        </Box>
        {!isManager && (
        <IconButton onClick={() => { setEditing(!editing); if (!editing) setForm({ firstName: user.firstName || "", lastName: user.lastName || "", email: user.email, phone: formatPhoneForDisplay(user.phone), role: user.role }); }}
          sx={{ color: editing ? "var(--color-admin-primary)" : "var(--color-admin-muted)" }}>
          {editing ? <CloseIcon /> : <EditIcon />}
        </IconButton>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "var(--color-admin-border)" }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.8125rem", minHeight: 48 }, "& .Mui-selected": { color: "var(--color-admin-primary) !important" }, "& .MuiTabs-indicator": { backgroundColor: "var(--color-admin-primary)" } }}>
          {TABS.map((t, i) => <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} />)}
        </Tabs>
      </Box>

      {/* Tab 0: Overview */}
      <TabPanel value={tab} index={0}>
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
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Email Verified</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {user.isEmailVerified ? <VerifiedIcon sx={{ fontSize: 16, color: "var(--color-admin-success)" }} /> : <CloseIcon sx={{ fontSize: 16, color: "var(--color-admin-muted)" }} />}
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500 }}>{user.isEmailVerified ? "Yes" : "No"}</Typography>
                </Box>
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

        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Statistics</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <StatCard label="Orders" value={s.orders ?? 0} icon={<OrdersIcon />} />
          <StatCard label="Total Spent" value={formatCurrency(s.totalSpent ?? 0)} icon={<PeopleIcon />} />
          <StatCard label="Avg Order" value={formatCurrency(s.avgOrderValue ?? 0)} icon={<PeopleIcon />} />
          <StatCard label="Wishlist" value={s.wishlist ?? 0} icon={<WishlistIcon />} />
          <StatCard label="Reviews" value={s.reviews ?? 0} icon={<ReviewsIcon />} />
          <StatCard label="Saved Builds" value={s.savedBuilds ?? 0} icon={<BuildsIcon />} />
        </Box>
      </TabPanel>

      {/* Tab 1: Orders */}
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

      {/* Tab 2: Reviews */}
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
                            <AdminButton variant="success" size="smallest" onClick={() => handleReviewStatus(r._id, "approved")}>Approve</AdminButton>
                            <AdminButton variant="danger" size="smallest" onClick={() => handleReviewStatus(r._id, "rejected")}>Reject</AdminButton>
                          </>
                        )}
                        <AdminButton variant="ghost" size="smallest" icon={<ViewIcon />} onClick={() => navigate(`/admin/reviews/${r._id}`)} />
                        <AdminButton variant="ghost" size="smallest" icon={<DeleteIcon />} onClick={() => handleReviewDelete(r._id)} />
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </TabPanel>

      {/* Tab 3: Addresses */}
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

      {/* Tab 4: Wishlist */}
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

      {/* Tab 5: PC Builds */}
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

      {/* Admin Actions — visible only to admins (block/delete are admin-only operations) */}
      {!isManager && (
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
      )}

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction === "block" ? "Block User" : confirmAction === "unblock" ? "Unblock User" : confirmAction === "deactivate" ? "Deactivate User" : confirmAction === "restore" ? "Restore User" : "Delete User Permanently"}
        message={confirmAction === "block" ? "Are you sure you want to block this user? They will not be able to access their account." : confirmAction === "unblock" ? "Are you sure you want to unblock this user?" : confirmAction === "deactivate" ? "Are you sure you want to deactivate this user's account? They will not be able to sign in until it is restored." : confirmAction === "restore" ? "Are you sure you want to restore this user's account? They will regain access to it." : "Are you sure you want to PERMANENTLY DELETE this user? This action is irreversible and will destroy all their data including orders, reviews, cart, wishlist, builds, and addresses."}
        confirmLabel={confirmAction === "block" ? "Block" : confirmAction === "unblock" ? "Unblock" : confirmAction === "deactivate" ? "Deactivate" : confirmAction === "restore" ? "Restore" : "Delete Permanently"}
        severity={confirmAction === "delete" || confirmAction === "deactivate" ? "danger" : "warning"}
        loading={saving}
        onConfirm={() => { if (confirmAction === "delete") handleDelete(); else if (confirmAction === "deactivate" || confirmAction === "restore") handleDeactivateToggle(); else handleBlockToggle(); }}
        onCancel={() => setConfirmAction(null)}
      />
    </Box>
  );
};

export default UserDetails;
