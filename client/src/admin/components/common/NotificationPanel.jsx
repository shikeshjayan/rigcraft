import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  Box,
  Typography,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  DoneAll as DoneAllIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { notificationService } from "../../services/notificationService";
import useNotificationStore from "../../store/notificationStore";
import { timeAgo } from "../../utils/formatDate";

const TYPE_CONFIG = {
  order: { color: "#3B82F6", bg: "#EFF6FF", label: "Order" },
  payment: { color: "#8B5CF6", bg: "#F5F3FF", label: "Payment" },
  review: { color: "#06B6D4", bg: "#ECFEFF", label: "Review" },
  support: { color: "#F59E0B", bg: "#FFFBEB", label: "Support" },
  inventory: { color: "#10B981", bg: "#ECFDF5", label: "Inventory" },
  coupon: { color: "#EC4899", bg: "#FDF2F8", label: "Coupon" },
  system: { color: "#6B7280", bg: "#F3F4F6", label: "System" },
  marketing: { color: "#F97316", bg: "#FFF7ED", label: "Marketing" },
};

const NotificationPanel = ({ anchorEl, open, onClose }) => {
  const navigate = useNavigate();
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationService.list({ page: 0, pageSize: 5 });
      setNotifications(result.data);
      fetchUnreadCount();
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open) fetch();
  }, [open, fetch]);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      fetchUnreadCount();
    } catch {
      // silent
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await notificationService.markAsRead(n.id ?? n._id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
        fetchUnreadCount();
      } catch {
        // silent
      }
    }
    onClose();
    navigate(`/admin/notifications/${n.id}`);
  };

  const visibleCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            width: 380,
            maxHeight: 480,
            borderRadius: "var(--radius-admin-card, 12px)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid var(--color-admin-border, #E5E7EB)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "var(--color-admin-text, #111827)" }}>
            Notifications
          </Typography>
          {visibleCount > 0 && (
            <Box
              sx={{
                backgroundColor: "#FF3E6C",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: "10px",
                px: 1,
                py: 0.25,
                lineHeight: 1.4,
              }}
            >
              {visibleCount}
            </Box>
          )}
        </Box>
        {visibleCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs font-bold cursor-pointer"
            style={{
              color: "var(--color-admin-primary, #2563EB)",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            <DoneAllIcon sx={{ fontSize: 14 }} /> Mark all read
          </button>
        )}
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 100 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} sx={{ color: "var(--color-admin-muted, #9CA3AF)" }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ fontSize: 13, color: "var(--color-admin-muted, #9CA3AF)" }}>
              {error}
            </Typography>
            <button
              onClick={fetch}
              className="text-xs font-bold mt-2 cursor-pointer"
              style={{
                color: "var(--color-admin-primary, #2563EB)",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              Try again
            </button>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircleIcon
              sx={{ fontSize: 36, color: "var(--color-admin-muted, #9CA3AF)", mb: 1 }}
            />
            <Typography sx={{ fontSize: 13, color: "var(--color-admin-muted, #9CA3AF)", fontWeight: 500 }}>
              All caught up!
            </Typography>
            <Typography sx={{ fontSize: 12, color: "var(--color-admin-muted, #9CA3AF)", mt: 0.25 }}>
              No new notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((n, idx) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            return (
              <Box key={n.id ?? n._id}>
                {idx > 0 && <Divider sx={{ mx: 2 }} />}
                <Box
                  onClick={() => handleNotificationClick(n)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    cursor: "pointer",
                    display: "flex",
                    gap: 1.5,
                    backgroundColor: !n.isRead ? "var(--color-admin-bg-tertiary, #F9FAFB)" : "transparent",
                    transition: "background-color 0.15s",
                    "&:hover": { backgroundColor: "var(--color-admin-bg-tertiary, #F9FAFB)" },
                  }}
                >
                  <Box sx={{ pt: 0.5, flexShrink: 0 }}>
                    {!n.isRead ? (
                      <CircleIcon sx={{ fontSize: 8, color: "#FF3E6C" }} />
                    ) : (
                      <Box sx={{ width: 8 }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          color: config.color,
                          backgroundColor: config.bg,
                          borderRadius: "var(--radius-admin-badge, 4px)",
                          textTransform: "capitalize",
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "var(--color-admin-muted, #9CA3AF)",
                          ml: "auto",
                          flexShrink: 0,
                        }}
                      >
                        {timeAgo(n.createdAt)}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-admin-text, #111827)",
                        lineHeight: 1.3,
                        mb: 0.25,
                      }}
                    >
                      {n.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "var(--color-admin-text-secondary, #6B7280)",
                        lineHeight: 1.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {n.message}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      <Box
        sx={{
          px: 2,
          py: 1.25,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => { navigate("/admin/notifications"); onClose(); }}
          className="text-sm font-bold cursor-pointer"
          style={{
            color: "var(--color-admin-primary, #2563EB)",
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          View all notifications
        </button>
      </Box>
    </Popover>
  );
};

export default NotificationPanel;
