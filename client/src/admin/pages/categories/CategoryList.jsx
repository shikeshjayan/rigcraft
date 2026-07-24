import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Visibility, VisibilityOff } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import TableActions from "../../components/tables/TableActions";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../components/common/Toast";
import { categoryService } from "../../services/categoryService";
import { CATEGORY_TYPES, CATEGORY_TYPE_COLORS } from "../../constants/categoryTypes";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";

const CategoryList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { search, setSearch } = useSearch();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ categoryType: "", isActive: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await categoryService.list({ page, pageSize, search, ...filters });
      setCategories(result.data);
      setTotal(result.total);
    } catch {
      toast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, toast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await categoryService.delete(deleteTarget);
      toast("Category deleted successfully");
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast("Failed to delete category", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map((id) => categoryService.delete(id)));
      toast(`${selected.length} categories deleted`);
      setSelected([]);
      fetchCategories();
    } catch {
      toast("Failed to delete categories", "error");
    }
  };

  const filterOptions = [
    {
      key: "categoryType",
      label: "Type",
      options: [{ value: "", label: "All" }, ...CATEGORY_TYPES],
    },
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
        <Box
          sx={{
            width: 32, height: 32, borderRadius: "var(--radius-admin-badge)",
            backgroundColor: CATEGORY_TYPE_COLORS[row.categoryType] || "var(--color-admin-muted)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--color-admin-white)", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", flexShrink: 0,
          }}
        >
          {row.name.charAt(0)}{row.name.charAt(1)}
        </Box>
        <Box>
          <Box sx={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val}</Box>
          <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)" }}>{row.slug}</Box>
        </Box>
      </Box>
    )},
    { key: "categoryType", label: "Type", render: (val) => {
      const type = CATEGORY_TYPES.find((t) => t.value === val);
      return type ? (
        <Chip
          label={type.label}
          size="small"
          sx={{
            backgroundColor: `${CATEGORY_TYPE_COLORS[val]}15`,
            color: CATEGORY_TYPE_COLORS[val],
            fontWeight: 500,
            fontSize: "0.75rem",
          }}
        />
      ) : val;
    }},
    { key: "parentId", label: "Parent", render: (val) => {
      const parent = categories.find((c) => c.id === val);
      return parent ? parent.name : <Box sx={{ color: "var(--color-admin-muted)", fontSize: "0.8125rem" }}>—</Box>;
    }},
    { key: "productCount", label: "Products", align: "center" },
    { key: "isActive", label: "Status", render: (val) => <StatusBadge status={val ? "active" : "inactive"} /> },
    { key: "order", label: "Order", align: "center" },
    { key: "createdAt", label: "Created", render: (val) => formatDate(val) },
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
    <Box>
      <TableToolbar
        title="Categories"
        searchValue={search}
        onSearchChange={setSearch}
        addPath="/admin/categories/new"
        addLabel="New Category"
        onRefresh={fetchCategories}
        actions={
          selected.length > 0 && (
            <Tooltip title="Delete selected">
              <IconButton onClick={handleBulkDelete} sx={{ color: "var(--color-admin-danger)" }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )
        }
      />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable
        columns={columns}
        rows={categories}
        loading={loading}
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
