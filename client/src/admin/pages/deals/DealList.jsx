import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import TableActions from "../../components/tables/TableActions";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../components/common/Toast";
import { dealService } from "../../services/dealService";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";
import { useAdminList, useAdminMutation } from "../../hooks";

const DEAL_STATUS_COLOR = {
  active: "success",
  scheduled: "info",
  expired: "muted",
};

const DealList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  const [filters, setFilters] = useState({ status: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    data: deals,
    total,
    loading,
    error,
    refetch,
  } = useAdminList("dealList", dealService, { page, pageSize, search, status: filters.status });

  const deleteMutation = useAdminMutation(
    (id) => dealService.delete(id),
    { queryKey: "dealList", successMessage: "Deal deleted" }
  );

  const toggleMutation = useAdminMutation(
    (id) => dealService.toggleStatus(id),
    {
      queryKey: "dealList",
      skipSuccessToast: true,
      onSuccess: (updated) => {
        toast(`Deal ${updated.isActive ? "activated" : "deactivated"}`);
      },
    }
  );

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
    setDeleteTarget(null);
  };

  const handleToggleStatus = (id) => {
    toggleMutation.mutate(id);
  };

  const getDealStatus = (deal) => {
    const now = new Date();
    const start = deal.startDate ? new Date(deal.startDate) : null;
    const end = deal.endDate ? new Date(deal.endDate) : null;
    if (!deal.isActive) return "expired";
    if (start && start > now) return "scheduled";
    if (end && end < now) return "expired";
    return "active";
  };

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All" },
        { value: "active", label: "Active" },
        { value: "scheduled", label: "Scheduled" },
        { value: "expired", label: "Expired" },
      ],
    },
  ];

  const columns = [
    {
      key: "banner",
      label: "Banner",
      render: (_, row) => {
        const url = row.desktopBanner?.url || row.mobileBanner?.url;
        return url ? (
          <Box
            component="img"
            src={url}
            alt={row.title}
            sx={{ width: 60, height: 36, borderRadius: "var(--radius-admin-badge)", objectFit: "cover", border: "1px solid var(--color-admin-border)" }}
          />
        ) : (
          <Box sx={{ width: 60, height: 36, borderRadius: "var(--radius-admin-badge)", backgroundColor: "var(--color-admin-bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.625rem", color: "var(--color-admin-muted)" }}>
            No img
          </Box>
        );
      },
    },
    {
      key: "title",
      label: "Title",
      render: (val, row) => (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val}</Box>
            {row.isFeatured && (
              <Chip label="Main" size="small" sx={{ fontWeight: 700, minWidth: 44, height: 20, backgroundColor: "var(--color-admin-primary)", color: "var(--color-admin-white)" }} />
            )}
          </Box>
          {row.slug && <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)", fontFamily: "var(--font-admin-mono)" }}>{row.slug}</Box>}
        </Box>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (_, row) => <StatusBadge status={getDealStatus(row)} colorMap={DEAL_STATUS_COLOR} />,
    },
    {
      key: "products",
      label: "Products",
      render: (val) => {
        const count = Array.isArray(val) ? val.length : 0;
        return <Chip label={count} size="small" sx={{ fontWeight: 600, minWidth: 32 }} />;
      },
    },
    {
      key: "prebuiltPCs",
      label: "Prebuilt PCs",
      render: (val) => {
        const count = Array.isArray(val) ? val.length : 0;
        return <Chip label={count} size="small" sx={{ fontWeight: 600, minWidth: 32 }} />;
      },
    },
    { key: "startDate", label: "Start Date", render: (val) => val ? formatDate(val) : "—" },
    { key: "endDate", label: "End Date", render: (val) => val ? formatDate(val) : "—" },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <TableActions
          actions={[
            { label: "Edit", icon: EditIcon, onClick: () => navigate(`/admin/deals/${row.id}/edit`) },
            {
              label: row.isActive ? "Deactivate" : "Activate",
              icon: row.isActive ? ToggleOffIcon : ToggleOnIcon,
              onClick: () => handleToggleStatus(row.id),
            },
            { divider: true },
            { label: "Delete", icon: DeleteIcon, danger: true, onClick: () => handleDelete(row.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar
        title="Deals"
        searchValue={search}
        onSearchChange={setSearch}
        addPath="/admin/deals/new"
        addLabel="New Deal"
        onRefresh={refetch}
      />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable
        columns={columns}
        rows={deals}
        loading={loading}
        error={error}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(`/admin/deals/${row.id}/edit`)}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Deal"
        message="Are you sure you want to delete this deal? This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep it"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default DealList;
