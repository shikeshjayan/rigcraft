import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Visibility } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import TableActions from "../../components/tables/TableActions";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../components/common/Toast";
import { productService, PRODUCT_TYPE_DISPLAY } from "../../services/productService";
import { CATEGORY_TYPES } from "../../constants/categoryTypes";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";

const ProductList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  useEffect(() => { setPageSize(maxRows); }, [maxRows, setPageSize]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ categoryType: "", isActive: "", isFeatured: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await productService.list({ page, pageSize, search, ...filters });
      setProducts(result.data);
      setTotal(result.total);
    } catch {
      toast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, toast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productService.delete(deleteTarget);
      toast("Product deleted successfully");
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast("Failed to delete product", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map((id) => productService.delete(id)));
      toast(`${selected.length} products deleted`);
      setSelected([]);
      fetchProducts();
    } catch {
      toast("Failed to delete products", "error");
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
    {
      key: "isFeatured",
      label: "Featured",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Featured" },
        { value: "false", label: "Not Featured" },
      ],
    },
  ];

  const columns = [
    { key: "name", label: "Product", render: (val, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: "var(--radius-admin-badge)",
          backgroundColor: `${PRODUCT_TYPE_DISPLAY[row.categoryType]?.color || "var(--color-admin-muted)"}20`,
          border: "1px solid var(--color-admin-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.625rem", fontWeight: 700, color: PRODUCT_TYPE_DISPLAY[row.categoryType]?.color || "var(--color-admin-muted)",
          flexShrink: 0,
        }}>
          {val.charAt(0)}{val.charAt(1)}
        </Box>
        <Box>
          <Box sx={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val}</Box>
          <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)" }}>{row.sku}</Box>
        </Box>
      </Box>
    )},
    { key: "categoryType", label: "Type", render: (val) => {
      const info = PRODUCT_TYPE_DISPLAY[val];
      return info ? (
        <Chip label={info.label} size="small" sx={{ backgroundColor: `${info.color}15`, color: info.color, fontWeight: 500, fontSize: "0.7rem" }} />
      ) : val;
    }},
    { key: "price", label: "Price", render: (val, row) => (
      <Box>
        <Box sx={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{formatCurrency(val)}</Box>
        {row.comparePrice && (
          <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)", textDecoration: "line-through" }}>{formatCurrency(row.comparePrice)}</Box>
        )}
      </Box>
    )},
    { key: "stock", label: "Stock", align: "center", render: (val) => (
      <Chip label={val} size="small" color={val === 0 ? "error" : val < 10 ? "warning" : "default"} variant="outlined" sx={{ fontSize: "0.75rem" }} />
    )},
    { key: "isActive", label: "Status", render: (val) => <StatusBadge status={val ? "active" : "inactive"} /> },
    { key: "createdAt", label: "Created", render: (val) => formatDate(val) },
    { key: "actions", label: "", render: (_, row) => (
      <TableActions
        actions={[
          { label: "View", icon: Visibility, onClick: () => navigate(`/admin/products/${row.id}`) },
          { label: "Edit", icon: EditIcon, onClick: () => navigate(`/admin/products/${row.id}/edit`) },
          { label: "Delete", icon: DeleteIcon, danger: true, onClick: () => handleDelete(row.id) },
        ]}
      />
    )},
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar
        title="Products"
        searchValue={search}
        onSearchChange={setSearch}
        addPath="/admin/products/new"
        addLabel="New Product"
        onRefresh={fetchProducts}
      />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable
        columns={columns}
        rows={products}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(`/admin/products/${row.id}`)}
        selected={selected}
        onSelectAll={() => setSelected(selected.length === products.length ? [] : products.map((r) => r.id))}
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
        rowsPerPageOptions={[maxRows, 10, 25, 50, 100]}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default ProductList;
