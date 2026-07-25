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
import { prebuiltService } from "../../services/prebuiltService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";

const PrebuiltList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  useEffect(() => { setPageSize(maxRows); }, [maxRows, setPageSize]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ isActive: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selected, setSelected] = useState([]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await prebuiltService.list({ page, pageSize, search, ...filters });
      setItems(result.data);
      setTotal(result.total);
    } catch {
      toast("Failed to load prebuilt PCs", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, toast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await prebuiltService.delete(deleteTarget);
      toast("Prebuilt PC deleted");
      setDeleteTarget(null);
      fetchItems();
    } catch {
      toast("Failed to delete", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map((id) => prebuiltService.delete(id)));
      toast(`${selected.length} prebuilt PCs deleted`);
      setSelected([]);
      fetchItems();
    } catch {
      toast("Failed to delete prebuilt PCs", "error");
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
    { key: "name", label: "Name", render: (val, row) => (
      <Box>
        <Box sx={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val}</Box>
        <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)" }}>{row.sku}</Box>
      </Box>
    )},
    { key: "price", label: "Price", render: (val, row) => (
      <Box>
        <Box sx={{ fontWeight: 500, color: "var(--color-admin-text)" }}>{formatCurrency(val)}</Box>
        {row.comparePrice && <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)", textDecoration: "line-through" }}>{formatCurrency(row.comparePrice)}</Box>}
      </Box>
    )},
    { key: "stock", label: "Stock", align: "center", render: (val) => <Chip label={val} size="small" color={val === 0 ? "error" : val < 5 ? "warning" : "default"} variant="outlined" sx={{ fontSize: "0.75rem" }} /> },
    { key: "isFeatured", label: "Featured", render: (val) => val ? <Chip label="Featured" size="small" color="primary" variant="outlined" sx={{ fontSize: "0.7rem" }} /> : "—" },
    { key: "isActive", label: "Status", render: (val) => <StatusBadge status={val ? "active" : "inactive"} /> },
    { key: "createdAt", label: "Created", render: (val) => formatDate(val) },
    { key: "actions", label: "", render: (_, row) => (
      <TableActions
        actions={[
          { label: "View", icon: Visibility, onClick: () => navigate(`/admin/prebuilt/${row.id}`) },
          { label: "Edit", icon: EditIcon, onClick: () => navigate(`/admin/prebuilt/${row.id}/edit`) },
          { label: "Delete", icon: DeleteIcon, danger: true, onClick: () => handleDelete(row.id) },
        ]}
      />
    )},
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar
        title="Prebuilt PCs"
        searchValue={search}
        onSearchChange={setSearch}
        addPath="/admin/prebuilt/new"
        addLabel="New Prebuilt"
        onRefresh={fetchItems}
      />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(`/admin/prebuilt/${row.id}`)}
        selected={selected}
        onSelectAll={() => setSelected(selected.length === items.length ? [] : items.map((r) => r.id))}
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
        title="Delete Prebuilt PC"
        message="Are you sure you want to delete this prebuilt PC? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default PrebuiltList;
