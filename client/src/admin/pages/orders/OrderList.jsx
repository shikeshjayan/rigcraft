import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import StatusBadge from "../../components/common/StatusBadge";
import { useToast } from "../../components/common/Toast";
import { orderService } from "../../services/orderService";
import { ORDER_STATUS, ORDER_STATUS_COLOR } from "../../constants/status";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";

const OrderList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  useEffect(() => { setPageSize(maxRows); }, [maxRows, setPageSize]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: "" });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await orderService.list({ page, pageSize, search, ...filters });
      setOrders(result.data);
      setTotal(result.total);
    } catch {
      toast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, toast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All" },
        ...Object.entries(ORDER_STATUS).map(([k, v]) => ({ value: v, label: k.charAt(0) + k.slice(1).toLowerCase() })),
      ],
    },
  ];

  const columns = [
    { key: "orderNumber", label: "Order", render: (val, row) => (
      <Box>
        <Box sx={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val}</Box>
        <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)" }}>{formatDate(row.createdAt)}</Box>
      </Box>
    )},
    { key: "customer", label: "Customer", render: (val) => (
      <Box>
        <Box sx={{ fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val.name}</Box>
        <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)" }}>{val.email}</Box>
      </Box>
    )},
    { key: "items", label: "Items", align: "center" },
    { key: "total", label: "Total", render: (val) => <Box sx={{ fontWeight: 500 }}>{formatCurrency(val)}</Box> },
    { key: "paymentMethod", label: "Payment", render: (val) => <Box sx={{ fontSize: "0.8125rem" }}>{val}</Box> },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} colorMap={ORDER_STATUS_COLOR} /> },
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar title="Orders" searchValue={search} onSearchChange={setSearch} onRefresh={fetchOrders} />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable columns={columns} rows={orders} loading={loading} total={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} onRowClick={(row) => navigate(`/admin/orders/${row.id}`)} rowsPerPageOptions={[10, 25, 50, 100]} />
    </Box>
  );
};

export default OrderList;
