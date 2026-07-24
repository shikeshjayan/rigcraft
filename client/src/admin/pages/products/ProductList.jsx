import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Visibility } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import TableActions from "../../components/tables/TableActions";
import StatusBadge from "../../components/common/StatusBadge";
import { useToast } from "../../components/common/Toast";
import { productService } from "../../services/productService";
import { CATEGORY_TYPES, CATEGORY_TYPE_COLORS } from "../../constants/categoryTypes";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";

const ProductList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { search, setSearch } = useSearch();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ categoryType: "", isActive: "", isFeatured: "" });

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
    try {
      await productService.delete(id);
      toast("Product deleted successfully");
      fetchProducts();
    } catch {
      toast("Failed to delete product", "error");
    }
  };

  const filterOptions = [
    {
      key: "categoryType",
      label: "Type",
      options: CATEGORY_TYPES,
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
          backgroundColor: `${CATEGORY_TYPE_COLORS[row.categoryType] || "var(--color-admin-muted)"}20`,
          border: "1px solid var(--color-admin-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.625rem", fontWeight: 700, color: CATEGORY_TYPE_COLORS[row.categoryType],
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
      const type = CATEGORY_TYPES.find((t) => t.value === val);
      return type ? (
        <Chip label={type.label} size="small" sx={{ backgroundColor: `${CATEGORY_TYPE_COLORS[val]}15`, color: CATEGORY_TYPE_COLORS[val], fontWeight: 500, fontSize: "0.7rem" }} />
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
    <Box>
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
      />
    </Box>
  );
};

export default ProductList;
