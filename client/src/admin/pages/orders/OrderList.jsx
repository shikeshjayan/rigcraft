import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip } from "@mui/material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import StatusBadge from "../../components/common/StatusBadge";
import { orderService } from "../../services/orderService";
import { ORDER_STATUS, ORDER_STATUS_COLOR } from "../../constants/status";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";
import { useAdminList } from "../../hooks";

const OrderList = () => {
  const navigate = useNavigate();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  const [filters, setFilters] = useState({ status: "" });

  const {
    data: orders,
    total,
    loading,
    refetch,
  } = useAdminList("orderList", orderService, { page, pageSize, search, ...filters });

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
    { key: "items", label: "Items", align: "center", render: (items) => (
      <Chip label={Array.isArray(items) ? items.length : "1"} size="small" />
    )},
    { key: "total", label: "Total", render: (val) => <Box sx={{ fontWeight: 500 }}>{formatCurrency(val)}</Box> },
    { key: "paymentMethod", label: "Payment", render: (val) => <Box sx={{ fontSize: "0.8125rem" }}>{val}</Box> },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} colorMap={ORDER_STATUS_COLOR} /> },
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar title="Orders" searchValue={search} onSearchChange={setSearch} onRefresh={refetch} />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable columns={columns} rows={orders} loading={loading} total={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} onRowClick={(row) => navigate(`/admin/orders/${row.id}`)} rowsPerPageOptions={[10, 25, 50, 100]} />
    </Box>
  );
};

export default OrderList;
