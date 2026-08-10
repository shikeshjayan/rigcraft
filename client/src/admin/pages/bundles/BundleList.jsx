import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Avatar } from "@mui/material";
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
import { bundleService } from "../../services/bundleService";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";
import { useAdminList, useAdminMutation } from "../../hooks";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const BUNDLE_STATUS_COLOR = {
  active: "success",
  scheduled: "info",
  inactive: "muted",
};

const BundleList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  const [filters, setFilters] = useState({ isActive: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    data: bundles,
    total,
    loading,
  } = useAdminList("bundleList", bundleService, { page, pageSize, search, isActive: filters.isActive });

  const deleteMutation = useAdminMutation(
    (id) => bundleService.delete(id),
    { queryKey: "bundleList", successMessage: "Bundle deleted" }
  );

  const toggleMutation = useAdminMutation(
    (id) => bundleService.toggleStatus(id),
    {
      queryKey: "bundleList",
      skipSuccessToast: true,
      onSuccess: (updated) => {
        toast(`Bundle ${updated.isActive ? "activated" : "deactivated"}`);
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

  const getBundleStatus = (bundle) => {
    const now = new Date();
    const start = bundle.startDate ? new Date(bundle.startDate) : null;
    const end = bundle.endDate ? new Date(bundle.endDate) : null;
    if (!bundle.isActive) return "inactive";
    if (start && start > now) return "scheduled";
    if (end && end < now) return "expired";
    return "active";
  };

  const filterOptions = [
    {
      key: "isActive",
      label: "Status",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  const columns = [
    {
      key: "name",
      label: "Bundle",
      render: (_, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={row.image?.url}
            variant="rounded"
            sx={{ width: 40, height: 40, borderRadius: "var(--radius-admin-badge)", bgcolor: "var(--color-admin-bg-tertiary)" }}
          >
            {row.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Box sx={{ fontWeight: 600, color: "var(--color-admin-text)" }}>{row.name}</Box>
            <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-text-secondary)" }}>
              {row.products?.length || 0} products · {row.prebuiltPcs?.length || 0} prebuilt
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      key: "bundlePrice",
      label: "Bundle Price",
      render: (val) => <Box sx={{ fontWeight: 700, color: "var(--color-admin-text)" }}>{formatINR(val)}</Box>,
    },
    {
      key: "savings",
      label: "You Save",
      render: (val, row) => (
        <Box>
          <Box sx={{ fontWeight: 600, color: "green" }}>{formatINR(val)}</Box>
          <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-text-secondary)" }}>
            {row.discountPct || 0}% OFF
          </Box>
        </Box>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (_, row) => (
        <StatusBadge status={getBundleStatus(row)} colorMap={BUNDLE_STATUS_COLOR} />
      ),
    },
    {
      key: "schedule",
      label: "Schedule",
      render: (_, row) => (
        <Box sx={{ fontSize: "0.8125rem", color: "var(--color-admin-text-secondary)" }}>
          {row.startsAt ? formatDate(row.startsAt) : "Now"} → {row.endsAt ? formatDate(row.endsAt) : "No end"}
        </Box>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <TableActions
          actions={[
            { label: "Edit", icon: EditIcon, onClick: () => navigate(`/admin/bundles/${row.id}/edit`) },
            { divider: true },
            {
              label: row.isActive ? "Deactivate" : "Activate",
              icon: row.isActive ? ToggleOffIcon : ToggleOnIcon,
              onClick: () => handleToggleStatus(row.id),
            },
            { label: "Delete", icon: DeleteIcon, danger: true, onClick: () => handleDelete(row.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <TableToolbar
        title="Bundles"
        description="Combo deals — multiple products sold together at a discounted price"
        searchPlaceholder="Search bundles..."
        search={search}
        onSearch={setSearch}
        onAdd={() => navigate("/admin/bundles/new")}
        addLabel="New Bundle"
      />

      <FilterBar filters={filters} options={filterOptions} onChange={setFilters} />

      <Box ref={containerRef}>
        <DataTable
          columns={columns}
          rows={bundles}
          total={total}
          loading={loading}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRowClick={(row) => navigate(`/admin/bundles/${row.id}/edit`)}
        />
      </Box>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete bundle?"
        message="This will permanently remove this bundle from the store. This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep it"
        severity="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
};

export default BundleList;
