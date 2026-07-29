import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import { MarkEmailRead as MarkReadIcon, DoneAll as MarkAllReadIcon } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import { useToast } from "../../components/common/Toast";
import { notificationService } from "../../services/notificationService";
import { extractError } from "../../utils/extractError";
import { formatDateTime } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useViewportRows } from "../../hooks/useViewportRows";

const NOTIFICATION_TYPE_COLOR = {
  order: "primary",
  review: "info",
  support: "warning",
  system: "muted",
  promotion: "success",
};

const NotificationList = () => {
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);

  useEffect(() => { setPageSize(maxRows); }, [maxRows, setPageSize]);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationService.list({ page, pageSize });
      setNotifications(result.data);
      setTotal(result.total);
      setUnreadCount(result.unreadCount ?? 0);
    } catch (err) {
      toast(extractError(err, "Failed to load notifications"), "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, toast]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast(extractError(err, "Failed to mark as read"), "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast("All notifications marked as read");
    } catch (err) {
      toast(extractError(err, "Failed to mark all as read"), "error");
    }
  };

  const columns = [
    {
      key: "read",
      label: "",
      width: 40,
      render: (val) => !val && <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--color-admin-primary)", display: "inline-block" }} />,
    },
    {
      key: "type",
      label: "Type",
      render: (val) => <Chip label={val || "general"} size="small" sx={{ textTransform: "capitalize", borderRadius: "var(--radius-admin-badge)", fontWeight: 600, fontSize: "0.7rem" }} color={NOTIFICATION_TYPE_COLOR[val] || "default"} variant="outlined" />,
    },
    {
      key: "message",
      label: "Message",
      render: (val) => <span style={{ maxWidth: 400, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>,
    },
    {
      key: "createdAt",
      label: "Date",
      render: (val) => formatDateTime(val),
    },
    {
      key: "read",
      label: "",
      render: (val, row) =>
        !val ? (
          <Tooltip title="Mark as read">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMarkAsRead(row.id); }} sx={{ color: "var(--color-admin-primary)" }}>
              <MarkReadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar
        title="Notifications"
        onRefresh={fetchNotifications}
        actions={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-sm border border-[var(--color-admin-border)] text-[var(--color-admin-text-secondary)] hover:bg-[var(--color-admin-bg-tertiary)] transition-colors cursor-pointer"
            >
              <MarkAllReadIcon sx={{ fontSize: 16 }} /> Mark All Read ({unreadCount})
            </button>
          ) : undefined
        }
      />
      <Box sx={{ px: 3, pb: 2 }}>
        <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", fontWeight: 500 }}>
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
        </Typography>
      </Box>
      <DataTable
        columns={columns}
        rows={notifications}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
};

export default NotificationList;
