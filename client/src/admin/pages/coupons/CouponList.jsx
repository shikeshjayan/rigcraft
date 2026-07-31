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
import { couponService } from "../../services/couponService";
import { extractError } from "../../utils/extractError";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";

const CouponList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  useEffect(() => { setPageSize(maxRows); }, [maxRows, setPageSize]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ isActive: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selected, setSelected] = useState([]);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const result = await couponService.list({ page, pageSize, search, ...filters });
      setCoupons(result.data);
      setTotal(result.total);
    } catch (err) {
      toast(extractError(err, "Failed to load coupons"), "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, toast]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await couponService.delete(deleteTarget);
      toast("Coupon deleted");
      setDeleteTarget(null);
      fetchCoupons();
    } catch (err) {
      toast(extractError(err, "Failed to delete coupon"), "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map((id) => couponService.delete(id)));
      toast(`${selected.length} coupons deleted`);
      setSelected([]);
      fetchCoupons();
    } catch (err) {
      toast(extractError(err, "Failed to delete coupons"), "error");
    }
  };

  const filterOptions = [
    { key: "isActive", label: "Status", options: [{ value: "", label: "All" }, { value: "true", label: "Active" }, { value: "false", label: "Inactive" }] },
  ];

  const columns = [
    { key: "code", label: "Code", render: (val) => <Chip label={val} size="small" sx={{ fontFamily: "var(--font-admin-mono)", fontWeight: 700, borderRadius: "var(--radius-admin-badge)", backgroundColor: "var(--color-admin-bg-tertiary)", letterSpacing: "0.05em" }} /> },
    { key: "type", label: "Type", render: (val) => val === "percentage" ? "Percentage" : val === "fixed" ? "Fixed Amount" : "Free Shipping" },
    { key: "value", label: "Value", render: (val, row) => row.type === "percentage" ? `${val}%` : row.type === "fixed" ? `$${val}` : "—" },
    { key: "minOrder", label: "Min Order", render: (val) => val ? `₹${val}` : "—" },
    { key: "usage", label: "Usage", render: (_, row) => `${row.usedCount} / ${row.maxUses}` },
    { key: "isActive", label: "Status", render: (val) => <StatusBadge status={val ? "active" : "inactive"} /> },
    { key: "expiresAt", label: "Expires", render: (val) => formatDate(val) },
    { key: "actions", label: "", render: (_, row) => (
      <TableActions
        actions={[
          { label: "Edit", icon: EditIcon, onClick: () => navigate(`/admin/coupons/${row.id}/edit`) },
          { label: "Delete", icon: DeleteIcon, danger: true, onClick: () => handleDelete(row.id) },
        ]}
      />
    )},
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar
        title="Coupons"
        searchValue={search}
        onSearchChange={setSearch}
        addPath="/admin/coupons/new"
        addLabel="New Coupon"
        onRefresh={fetchCoupons}
      />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable
        columns={columns}
        rows={coupons}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(`/admin/coupons/${row.id}/edit`)}
        selected={selected}
        onSelectAll={() => setSelected(selected.length === coupons.length ? [] : coupons.map((r) => r.id))}
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
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default CouponList;
