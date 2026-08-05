import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import TableActions from "../../components/tables/TableActions";
import StatusBadge from "../../components/common/StatusBadge";
import AdminThumbnail from "../../components/common/AdminThumbnail";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../components/common/Toast";
import { categoryService } from "../../services/categoryService";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";
import { useAdminList, useAdminMutation } from "../../hooks";

const CategoryList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ isActive: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    data: categories,
    total,
    loading,
    error,
    refetch,
  } = useAdminList("categoryList", categoryService, { page, pageSize, search, ...filters });

  const deleteMutation = useAdminMutation(
    (id) => categoryService.delete(id),
    { queryKey: "categoryList", successMessage: "Category deleted" }
  );

  const bulkDeleteMutation = useAdminMutation(
    (ids) => Promise.all(ids.map((id) => categoryService.delete(id))),
    {
      queryKey: "categoryList",
      skipSuccessToast: true,
      onSuccess: (_, ids) => {
        toast(`${ids.length} categories deleted`);
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
    { key: "name", label: "Name", render: (val, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AdminThumbnail
          src={row.image?.url}
          alt={val}
          size={32}
          fallback={
            <Box sx={{
              width: 32, height: 32, borderRadius: "var(--radius-admin-badge)",
              backgroundColor: "var(--color-admin-bg-tertiary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-admin-white)", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", flexShrink: 0,
            }}>
              {row.name.charAt(0)}{row.name.charAt(1)}
            </Box>
          }
        />
        <Box>
          <Box sx={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val}</Box>
          <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)" }}>{row.slug}</Box>
        </Box>
      </Box>
    )},
    { key: "parentId", label: "Parent", render: (val) => {
      const parent = categories.find((c) => c.id === val);
      return parent ? parent.name : <Box sx={{ color: "var(--color-admin-muted)", fontSize: "0.8125rem" }}>—</Box>;
    }},
    { key: "productCount", label: "Products", align: "center" },
    { key: "isActive", label: "Status", render: (val) => <StatusBadge status={val ? "active" : "inactive"} /> },
    { key: "order", label: "Order", align: "center" },
    { key: "createdAt", label: "Created", render: (val) => val ? new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—" },
    { key: "actions", label: "", render: (_, row) => (
      <TableActions
        actions={[
          { label: "Edit", icon: EditIcon, onClick: () => navigate(`/admin/categories/${row.id}/edit`) },
          { label: "Delete", icon: DeleteIcon, danger: true, onClick: () => handleDelete(row.id) },
        ]}
      />
    )},
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar
        title="Categories"
        searchValue={search}
        onSearchChange={setSearch}
        addPath="/admin/categories/new"
        addLabel="New Category"
        onRefresh={refetch}
      />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable
        columns={columns}
        rows={categories}
        loading={loading}
        error={error}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(`/admin/categories/${row.id}/edit`)}
        selected={selected}
        onSelectAll={() => setSelected(selected.length === categories.length ? [] : categories.map((c) => c.id))}
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
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default CategoryList;
