import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import StatusBadge from "../../components/common/StatusBadge";
import { useToast } from "../../components/common/Toast";
import { userService } from "../../services/userService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";

const UserList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { search, setSearch } = useSearch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ role: "", status: "" });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await userService.list({ page, pageSize, search, ...filters });
      setUsers(result.data);
      setTotal(result.total);
    } catch {
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filterOptions = [
    {
      key: "role",
      label: "Role",
      options: [
        { value: "", label: "All" },
        { value: "customer", label: "Customer" },
        { value: "admin", label: "Admin" },
        { value: "super_admin", label: "Super Admin" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  const columns = [
    { key: "name", label: "User", render: (val, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "var(--color-admin-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{val.charAt(0)}</Box>
        <Box>
          <Box sx={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val}</Box>
          <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)" }}>{row.email}</Box>
        </Box>
      </Box>
    )},
    { key: "role", label: "Role", render: (val) => <Chip label={val} size="small" variant="outlined" sx={{ fontSize: "0.7rem", textTransform: "capitalize", borderRadius: "var(--radius-admin-badge)" }} /> },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} /> },
    { key: "orders", label: "Orders", align: "center" },
    { key: "totalSpent", label: "Total Spent", render: (val) => formatCurrency(val) },
    { key: "registeredAt", label: "Registered", render: (val) => formatDate(val) },
    { key: "lastLogin", label: "Last Login", render: (val) => val ? formatDate(val) : "—" },
  ];

  return (
    <Box>
      <TableToolbar title="Users" searchValue={search} onSearchChange={setSearch} onRefresh={fetchUsers} />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable columns={columns} rows={users} loading={loading} total={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} onRowClick={(row) => navigate(`/admin/users/${row.id}`)} />
    </Box>
  );
};

export default UserList;
