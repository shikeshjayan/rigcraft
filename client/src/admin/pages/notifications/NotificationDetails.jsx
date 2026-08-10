import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Grid, Chip } from "@mui/material";
import { ArrowBack as ArrowBackIcon, OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import { notificationService } from "../../services/notificationService";
import useNotificationStore from "../../store/notificationStore";
import { formatDateTime } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";

const TYPE_COLORS = {
  order: { bg: "#EFF6FF", text: "#3B82F6" },
  payment: { bg: "#F5F3FF", text: "#8B5CF6" },
  review: { bg: "#ECFEFF", text: "#06B6D4" },
  support: { bg: "#FFFBEB", text: "#F59E0B" },
  inventory: { bg: "#ECFDF5", text: "#10B981" },
  coupon: { bg: "#FDF2F8", text: "#EC4899" },
  system: { bg: "#F3F4F6", text: "#6B7280" },
  marketing: { bg: "#FFF7ED", text: "#F97316" },
};

const PRIORITY_COLORS = {
  low: { bg: "#F3F4F6", text: "#6B7280" },
  normal: { bg: "#EFF6FF", text: "#3B82F6" },
  high: { bg: "#FFFBEB", text: "#F59E0B" },
  critical: { bg: "#FEF2F2", text: "#EF4444" },
};

const DetailRow = ({ label, value }) => (
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>{label}</Typography>
    <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500, wordBreak: "break-word" }}>{value || "—"}</Typography>
  </Grid>
);

const NotificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.getById(id)
      .then(setNotification)
      .catch(() => { toast("Notification not found", "error"); navigate("/admin/notifications"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleMarkAsRead = async () => {
    try {
      await notificationService.markAsRead(id);
      setNotification((prev) => ({ ...prev, isRead: true }));
      fetchUnreadCount();
      toast("Marked as read");
    } catch {
      toast("Failed to mark as read", "error");
    }
  };

  if (loading) return <Loading />;
  if (!notification) return null;

  const typeStyle = TYPE_COLORS[notification.type] || TYPE_COLORS.system;
  const priorityStyle = PRIORITY_COLORS[notification.priority] || PRIORITY_COLORS.normal;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
          <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/notifications")} />
          <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2, overflowWrap: "break-word", fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.5rem" } }}>
              {notification.title || "Notification"}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", fontWeight: 500 }}>
              {notification.type} · {formatDateTime(notification.createdAt)}
            </Typography>
          </Box>
        </Box>
        {!notification.isRead && (
          <AdminButton variant="primary" size="small" onClick={handleMarkAsRead}>
            Mark as read
          </AdminButton>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <Chip
          label={notification.type || "general"}
          size="small"
          sx={{ backgroundColor: typeStyle.bg, color: typeStyle.text, fontWeight: 600, textTransform: "capitalize", borderRadius: "var(--radius-admin-badge)" }}
        />
        <Chip
          label={notification.priority || "normal"}
          size="small"
          sx={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text, fontWeight: 600, textTransform: "capitalize", borderRadius: "var(--radius-admin-badge)" }}
        />
        {!notification.isRead && (
          <Chip label="Unread" size="small" color="error" sx={{ borderRadius: "var(--radius-admin-badge)", fontWeight: 600 }} />
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Message</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
            {notification.message}
          </Typography>
        </Box>

        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Details</Typography>
          <Grid container spacing={2}>
            <DetailRow label="Module" value={notification.module} />
            <DetailRow label="Priority" value={notification.priority} />
            <DetailRow label="Status" value={notification.isRead ? "Read" : "Unread"} />
            <DetailRow label="Reference ID" value={notification.reference || "—"} />
            <DetailRow label="Created" value={formatDateTime(notification.createdAt)} />
            <DetailRow label="Updated" value={formatDateTime(notification.updatedAt)} />
          </Grid>
        </Box>

        {notification.actionUrl && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <AdminButton
              variant="primary"
              size="medium"
              icon={<OpenInNewIcon />}
              onClick={() => navigate(notification.actionUrl)}
            >
              Open related page
            </AdminButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NotificationDetails;
