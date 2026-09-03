import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip } from "@mui/material";
import { Visibility as ViewIcon, Delete as DeleteIcon } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import TableActions from "../../components/tables/TableActions";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../components/common/Toast";
import { supportService } from "../../services/supportService";
import { formatDateTime } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";
import { useAdminList, useAdminMutation } from "../../hooks";
import { connectSocket } from "../../../shared/socket";
import { ISSUE_TYPE_LABELS } from "../../../utils/supportLabels";

const STATUS_COLOR = {
  open: "info",
  in_progress: "warning",
  waiting_customer: "warning",
  resolved: "success",
  closed: "muted",
};

const SupportList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "", issueType: "" });

  const {
    data: tickets,
    total,
    loading,
    error,
    refetch,
  } = useAdminList("supportList", supportService, { page, pageSize, search, ...filters });

  useEffect(() => {
    const handleUpdate = () => refetch();
    let sock;
    connectSocket().then((s) => {
      if (!s) return;
      sock = s;
      sock.on("support:new-message", handleUpdate);
      sock.on("support:ticket-updated", handleUpdate);
      sock.on("notification:new", handleUpdate);
    });
    return () => {
      if (sock) {
        sock.off("support:new-message", handleUpdate);
        sock.off("support:ticket-updated", handleUpdate);
        sock.off("notification:new", handleUpdate);
      }
    };
  }, [refetch]);

  const deleteMutation = useAdminMutation(
    (id) => supportService.delete(id),
    { queryKey: "supportList", successMessage: "Ticket deleted" }
  );

  const bulkDeleteMutation = useAdminMutation(
    (ids) => Promise.all(ids.map((id) => supportService.delete(id))),
    {
      queryKey: "supportList",
      skipSuccessToast: true,
      onSuccess: (_, ids) => {
        toast(`${ids.length} tickets deleted`);
        setSelected([]);
      },
    }
  );

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
    setDeleteTarget(null);
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(selected);
  };

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All" },
        { value: "open", label: "Open" },
        { value: "in_progress", label: "In Progress" },
        { value: "waiting_customer", label: "Waiting on Customer" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      options: [
        { value: "", label: "All" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "urgent", label: "Urgent" },
      ],
    },
    {
      key: "issueType",
      label: "Issue Type",
      options: [
        { value: "", label: "All" },
        ...Object.entries(ISSUE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
      ],
    },
  ];

  const columns = [
    { key: "id", label: "Ticket ID", render: (val) => <span style={{ fontFamily: "var(--font-admin-mono)", fontSize: "0.75rem", color: "var(--color-admin-muted)", fontWeight: 500 }}>#{val.slice(-6).toUpperCase()}</span> },
    {
      key: "customer",
      label: "Customer",
      render: (val, row) => {
        let name = row?.name || val?.name;
        if (!name && row?.description) {
          const match = row.description.match(/Name:\s*([^\n]+)/);
          if (match && match[1]) name = match[1].trim();
        }
        return <span style={{ fontWeight: 500 }}>{name || "Unknown"}</span>;
      },
    },
    {
      key: "subject",
      label: "Subject",
      render: (val) => <span style={{ maxWidth: 300, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} colorMap={STATUS_COLOR} />,
    },
    {
      key: "priority",
      label: "Priority",
      render: (val) => <Chip label={val || "—"} size="small" sx={{ textTransform: "capitalize", borderRadius: "var(--radius-admin-badge)", fontWeight: 600, fontSize: "0.7rem", backgroundColor: val === "urgent" ? "var(--color-admin-danger-bg)" : val === "high" ? "var(--color-admin-warning-bg)" : "var(--color-admin-bg-tertiary)", color: val === "urgent" ? "var(--color-admin-danger)" : val === "high" ? "var(--color-admin-warning)" : "var(--color-admin-text-secondary)" }} />,
    },
    { key: "updatedAt", label: "Last Updated", render: (val) => val ? formatDateTime(val) : "—" },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <TableActions
          actions={[
            { label: "View", icon: ViewIcon, onClick: () => navigate(`/admin/support/${row.id}`) },
            { label: "Delete", icon: DeleteIcon, danger: true, onClick: () => handleDelete(row.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar
        title="Support Tickets"
        searchValue={search}
        onSearchChange={setSearch}
        onRefresh={refetch}
      />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable
        columns={columns}
        rows={tickets}
        loading={loading}
        error={error}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(`/admin/support/${row.id}`)}
        selected={selected}
        onSelectAll={() => setSelected(selected.length === tickets.length ? [] : tickets.map((r) => r.id))}
        onSelectOne={(id) => setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])}
        selectable
        headerSlots={{
          actions: (
            <Box
              onClick={selected.length > 0 ? handleBulkDelete : undefined}
              sx={{
                cursor: selected.length > 0 ? "pointer" : "default",
                visibility: selected.length > 0 ? "visible" : "hidden",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "var(--color-admin-danger)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
            >
              Delete All
            </Box>
          ),
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Ticket"
        message="Are you sure you want to delete this support ticket? This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep it"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default SupportList;
