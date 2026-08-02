import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { MarkEmailRead as MarkReadIcon, DoneAll as MarkAllReadIcon } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import { notificationService } from "../../services/notificationService";
import useNotificationStore from "../../store/notificationStore";

import { formatDateTime } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useViewportRows } from "../../hooks/useViewportRows";
import { useAdminList, useAdminMutation } from "../../hooks";

const TYPE_COLORS = {
  order: "primary",
  review: "info",
  support: "warning",
  system: "default",
  promotion: "success",
  payment: "secondary",
  inventory: "success",
  coupon: "error",
  marketing: "warning",
};

const NotificationList = () => {
  const navigate = useNavigate();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  const {
    data: notifications,
    total,
    loading,
    refetch,
  } = useAdminList("notificationList", notificationService, { page, pageSize });

  useEffect(() => {
    fetchUnreadCount();
  }, [notifications, fetchUnreadCount]);

  const markAsReadMutation = useAdminMutation(
    (id) => notificationService.markAsRead(id),
    { queryKey: "notificationList", skipSuccessToast: true, onSuccess: () => fetchUnreadCount() }
  );

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsReadMutation = useAdminMutation(
    () => notificationService.markAllAsRead(),
    { queryKey: "notificationList", successMessage: "All notifications marked as read", onSuccess: () => fetchUnreadCount() }
  );

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const columns = [
    {
      key: "isRead",
      label: "",
      width: 40,
      render: (val) => !val && <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--color-admin-primary)", display: "inline-block" }} />,
    },
    {
      key: "type",
      label: "Type",
      render: (val) => <Chip label={val || "general"} size="small" sx={{ textTransform: "capitalize", borderRadius: "var(--radius-admin-badge)", fontWeight: 600, fontSize: "0.7rem" }} color={TYPE_COLORS[val] || "default"} variant="outlined" />,
    },
    {
      key: "message",
      label: "Message",
      render: (val, row) => (
        <span style={{ maxWidth: 400, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.title ? `${row.title} — ${val || ""}` : val}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (val) => formatDateTime(val),
    },
    {
      key: "markRead",
      label: "",
      render: (val, row) =>
        !row.isRead ? (
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
        onRefresh={refetch}
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
      <DataTable
        columns={columns}
        rows={notifications}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(`/admin/notifications/${row.id}`)}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
};

export default NotificationList;
