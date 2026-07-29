import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import TableActions from "../../components/tables/TableActions";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../components/common/Toast";
import { dealService } from "../../services/dealService";
import { extractError } from "../../utils/extractError";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";

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

  useEffect(() => { setPageSize(maxRows); }, [maxRows, setPageSize]);

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selected, setSelected] = useState([]);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await dealService.list({ page, pageSize, search, ...filters });
      setDeals(result.data);
      setTotal(result.total);
    } catch (err) {
      toast(extractError(err, "Failed to load deals"), "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, toast]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dealService.delete(deleteTarget);
      toast("Deal deleted");
      setDeleteTarget(null);
      fetchDeals();
    } catch (err) {
      toast(extractError(err, "Failed to delete deal"), "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map((id) => dealService.delete(id)));
      toast(`${selected.length} deals deleted`);
      setSelected([]);
      fetchDeals();
    } catch (err) {
      toast(extractError(err, "Failed to delete deals"), "error");
    }
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
      key: "code",
      label: "Code",
      render: (val) => <Chip label={val} size="small" sx={{ fontFamily: "var(--font-admin-mono)", fontWeight: 700, borderRadius: "var(--radius-admin-badge)", backgroundColor: "var(--color-admin-bg-tertiary)", letterSpacing: "0.05em" }} />,
    },
    {
      key: "discount",
      label: "Discount",
      render: (_, row) => row.type === "percentage" ? `${row.value}%` : row.type === "fixed" ? formatCurrency(row.value) : "—",
    },
    { key: "minOrder", label: "Min Order", render: (val) => val ? formatCurrency(val) : "—" },
    { key: "usage", label: "Usage", render: (_, row) => `${row.usedCount || 0} / ${row.maxUses || "∞"}` },
    { key: "startDate", label: "Start", render: (val) => val ? formatDate(val) : "—" },
    { key: "endDate", label: "End", render: (val) => val ? formatDate(val) : "—" },
    {
      key: "isActive",
      label: "Status",
      render: (_, row) => <StatusBadge status={getDealStatus(row)} colorMap={DEAL_STATUS_COLOR} />,
    },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <TableActions
          actions={[
            { label: "Edit", icon: EditIcon, onClick: () => navigate(`/admin/deals/${row.id}/edit`) },
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
        onRefresh={fetchDeals}
      />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable
        columns={columns}
        rows={deals}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(`/admin/deals/${row.id}/edit`)}
        selected={selected}
        onSelectAll={() => setSelected(selected.length === deals.length ? [] : deals.map((r) => r.id))}
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
        title="Delete Deal"
        message="Are you sure you want to delete this deal? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default DealList;
