import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import TableActions from "../../components/tables/TableActions";
import StatusBadge from "../../components/common/StatusBadge";
import { useToast } from "../../components/common/Toast";
import { brandService } from "../../services/brandService";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";

const BrandList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { search, setSearch } = useSearch();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ isActive: "" });

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const result = await brandService.list({ page, pageSize, search, ...filters });
      setBrands(result.data);
      setTotal(result.total);
    } catch {
      toast("Failed to load brands", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, toast]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const handleDelete = async (id) => {
    try {
      await brandService.delete(id);
      toast("Brand deleted successfully");
      fetchBrands();
    } catch {
      toast("Failed to delete brand", "error");
    }
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
    { key: "name", label: "Brand", render: (val, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: "var(--radius-admin-badge)",
          backgroundColor: "var(--color-admin-bg-tertiary)",
          border: "1px solid var(--color-admin-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.75rem", fontWeight: 700, color: "var(--color-admin-muted)",
          textTransform: "uppercase", flexShrink: 0,
        }}>
          {val.charAt(0)}{val.charAt(1)}
        </Box>
        <Box>
          <Box sx={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val}</Box>
          <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)" }}>{row.slug}</Box>
        </Box>
      </Box>
    )},
    { key: "website", label: "Website", render: (val) => val ? (
      <Box component="a" href={val} target="_blank" rel="noopener" sx={{ color: "var(--color-admin-primary)", fontSize: "0.8125rem", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
        {val.replace(/^https?:\/\//, "")}
      </Box>
    ) : <Box sx={{ color: "var(--color-admin-muted)" }}>—</Box>},
    { key: "productCount", label: "Products", align: "center" },
    { key: "isActive", label: "Status", render: (val) => <StatusBadge status={val ? "active" : "inactive"} /> },
    { key: "createdAt", label: "Created", render: (val) => formatDate(val) },
    { key: "actions", label: "", render: (_, row) => (
      <TableActions
        actions={[
          { label: "Edit", icon: EditIcon, onClick: () => navigate(`/admin/brands/${row.id}/edit`) },
          { label: "Delete", icon: DeleteIcon, danger: true, onClick: () => handleDelete(row.id) },
        ]}
      />
    )},
  ];

  return (
    <Box>
      <TableToolbar
        title="Brands"
        searchValue={search}
        onSearchChange={setSearch}
        addPath="/admin/brands/new"
        addLabel="New Brand"
        onRefresh={fetchBrands}
      />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable
        columns={columns}
        rows={brands}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(`/admin/brands/${row.id}/edit`)}
      />
    </Box>
  );
};

export default BrandList;
