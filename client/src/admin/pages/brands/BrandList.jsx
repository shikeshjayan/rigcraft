import { useState, useEffect, useCallback } from "react";
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
import { brandService } from "../../services/brandService";
import { extractError } from "../../utils/extractError";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";

const BrandList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  useEffect(() => { setPageSize(maxRows); }, [maxRows, setPageSize]);

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ isActive: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const result = await brandService.list({ page, pageSize, search, ...filters });
      setBrands(result.data);
      setTotal(result.total);
    } catch (err) {
      toast(extractError(err, "Failed to load brands"), "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, toast]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await brandService.delete(deleteTarget);
      toast("Brand deleted successfully");
      setDeleteTarget(null);
      fetchBrands();
    } catch (err) {
      toast(extractError(err, "Failed to delete brand"), "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map((id) => brandService.delete(id)));
      toast(`${selected.length} brands deleted`);
      setSelected([]);
      fetchBrands();
    } catch (err) {
      toast(extractError(err, "Failed to delete brands"), "error");
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
        <AdminThumbnail
          src={row.logo?.url}
          alt={val}
          size={36}
          fallback={
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
          }
        />
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
    <Box ref={containerRef}>
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
        selected={selected}
        onSelectAll={() => setSelected(selected.length === brands.length ? [] : brands.map((r) => r.id))}
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
        title="Delete Brand"
        message="Are you sure you want to delete this brand? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default BrandList;
