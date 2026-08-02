import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Tabs, Tab,
} from "@mui/material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import StatusBadge from "../../components/common/StatusBadge";
import AdminThumbnail from "../../components/common/AdminThumbnail";
import AdminButton from "../../components/common/Button";
import { userService } from "../../services/userService";
import { USER_STATUS_COLOR } from "../../constants/status";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";
import { useAdminList, useAdminMutation } from "../../hooks";

import useAuthStore from "../../store/authStore";

const ALL_ROLES = ["customer", "admin", "manager"];

const UserList = () => {
  const navigate = useNavigate();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();
  const currentUser = useAuthStore((state) => state.user);
  const isCurrentUser = (role) => currentUser?.role === role;
  const ROLES = isCurrentUser("manager") ? ALL_ROLES.filter((r) => r !== "admin") : ALL_ROLES;

  const [filters, setFilters] = useState({ role: "", status: "" });

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "", role: "customer" });

  const ROLE_TABS = ["All", "Customers", "Admins", "Managers"];
  const ROLE_FILTER = ["", "customer", "admin", "manager"];
  const [roleTab, setRoleTab] = useState(0);

  const {
    data: users,
    total,
    loading,
    refetch,
  } = useAdminList("userList", userService, { page, pageSize, search, ...filters });

  const createMutation = useAdminMutation(
    (userData) => userService.create(userData),
    { queryKey: "userList", successMessage: "User created" }
  );

  const handleTabChange = (_, v) => {
    setRoleTab(v);
    setFilters((prev) => ({ ...prev, role: ROLE_FILTER[v] }));
    setPage(0);
  };

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All" },
        { value: "active", label: "Active" },
        { value: "blocked", label: "Blocked" },
      ],
    },
  ];

  const columns = [
    { key: "name", label: "User", render: (val, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <AdminThumbnail
          src={row.avatar}
          alt={val}
          size={36}
          sx={{ borderRadius: "var(--radius-admin-avatar)", border: "none" }}
          fallback={
            <Box sx={{ width: 36, height: 36, borderRadius: "var(--radius-admin-avatar)", backgroundColor: "var(--color-admin-primary)", color: "var(--color-admin-white)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{val.charAt(0)}</Box>
          }
        />
        <Box>
          <Box sx={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val}</Box>
          <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)" }}>{row.email}</Box>
        </Box>
      </Box>
    )},
    { key: "role", label: "Role", render: (val) => <Chip label={val} size="small" variant="outlined" sx={{ fontSize: "0.7rem", textTransform: "capitalize", borderRadius: "var(--radius-admin-badge)" }} /> },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} colorMap={USER_STATUS_COLOR} /> },
    { key: "orders", label: "Orders", align: "center" },
    { key: "totalSpent", label: "Total Spent", render: (val) => formatCurrency(val) },
    { key: "registeredAt", label: "Registered", render: (val) => formatDate(val) },
    { key: "lastLogin", label: "Last Login", render: (val) => val ? formatDate(val) : "—" },
  ];

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createMutation.mutateAsync(form);
      setCreateOpen(false);
      setForm({ firstName: "", lastName: "", email: "", password: "", phone: "", role: "customer" });
    } catch {
      // error handled by useAdminMutation
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box ref={containerRef}>
      <TableToolbar
        title="Users"
        searchValue={search}
        onSearchChange={setSearch}
        onRefresh={refetch}
        {...(isCurrentUser("manager") ? {} : { onAdd: () => setCreateOpen(true), addLabel: "New User" })}
      />
      <Box sx={{ px: 3 }}>
        <Tabs
          value={roleTab}
          onChange={handleTabChange}
          sx={{
            minHeight: 40,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.8125rem", minHeight: 40, py: 0.75, color: "var(--color-admin-text-secondary)", "&.Mui-selected": { color: "var(--color-admin-primary) !important" } },
            "& .MuiTabs-indicator": { backgroundColor: "var(--color-admin-primary)" },
          }}
        >
          {ROLE_TABS.map((label) => <Tab key={label} label={label} />)}
        </Tabs>
      </Box>

      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />

      <DataTable
        columns={columns}
        rows={users}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
        rowsPerPageOptions={[10, 25, 50, 100]}
        sx={{ mx: 3, mb: 3 }}
      />

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: "var(--radius-admin-modal)" } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.125rem" }}>New User</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="First Name" fullWidth size="small" value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <TextField label="Last Name" fullWidth size="small" value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Box>
          <TextField label="Email" fullWidth size="small" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Password" fullWidth size="small" type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <TextField label="Phone" fullWidth size="small" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="Role" fullWidth size="small" select value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <AdminButton variant="secondary" size="small" onClick={() => setCreateOpen(false)}>Cancel</AdminButton>
          <AdminButton variant="primary" size="small" loading={creating} onClick={handleCreate}>Create</AdminButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList;
