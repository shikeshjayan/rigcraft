import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import TableActions from "../../components/tables/TableActions";
import StatusBadge from "../../components/common/StatusBadge";
import { useToast } from "../../components/common/Toast";
import { couponService } from "../../services/couponService";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";

const CouponList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { search, setSearch } = useSearch();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ isActive: "" });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const result = await couponService.list({ page, pageSize, search, ...filters });
      setCoupons(result.data);
      setTotal(result.total);
    } catch {
      toast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, toast]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleDelete = async (id) => {
    try {
      await couponService.delete(id);
      toast("Coupon deleted");
      fetchCoupons();
    } catch {
      toast("Failed to delete", "error");
    }
  };

  const filterOptions = [
    { key: "isActive", label: "Status", options: [{ value: "", label: "All" }, { value: "true", label: "Active" }, { value: "false", label: "Inactive" }] },
  ];

  const columns = [
    { key: "code", label: "Code", render: (val) => <Chip label={val} size="small" sx={{ fontFamily: "var(--font-admin-mono)", fontWeight: 700, borderRadius: "var(--radius-admin-badge)", backgroundColor: "var(--color-admin-bg-tertiary)", letterSpacing: "0.05em" }} /> },
    { key: "type", label: "Type", render: (val) => val === "percentage" ? "Percentage" : val === "fixed" ? "Fixed Amount" : "Free Shipping" },
    { key: "value", label: "Value", render: (val, row) => row.type === "percentage" ? `${val}%` : row.type === "fixed" ? `$${val}` : "—" },
    { key: "minOrder", label: "Min Order", render: (val) => val ? `$${val}` : "—" },
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
    <Box>
      <TableToolbar title="Coupons" searchValue={search} onSearchChange={setSearch} addPath="/admin/coupons/new" addLabel="New Coupon" onRefresh={fetchCoupons} />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable columns={columns} rows={coupons} loading={loading} total={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} onRowClick={(row) => navigate(`/admin/coupons/${row.id}/edit`)} />
    </Box>
  );
};

export default CouponList;
