import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import TableActions from "../../components/tables/TableActions";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../components/common/Toast";
import { faqService } from "../../services/faqService";
import { extractError } from "../../utils/extractError";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";

const FaqList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  useEffect(() => { setPageSize(maxRows); }, [maxRows, setPageSize]);

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selected, setSelected] = useState([]);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await faqService.list({ page, pageSize, search });
      setFaqs(result.data);
      setTotal(result.total);
    } catch (err) {
      toast(extractError(err, "Failed to load FAQs"), "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, toast]);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await faqService.delete(deleteTarget);
      toast("FAQ deleted");
      setDeleteTarget(null);
      fetchFaqs();
    } catch (err) {
      toast(extractError(err, "Failed to delete FAQ"), "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map((id) => faqService.delete(id)));
      toast(`${selected.length} FAQs deleted`);
      setSelected([]);
      fetchFaqs();
    } catch (err) {
      toast(extractError(err, "Failed to delete FAQs"), "error");
    }
  };

  const columns = [
    {
      key: "question",
      label: "Question",
      render: (val) => <span style={{ fontWeight: 500, maxWidth: 350, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>,
    },
    {
      key: "answer",
      label: "Answer",
      render: (val) => val ? <span style={{ color: "var(--color-admin-text-secondary)", maxWidth: 350, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span> : "—",
    },
    { key: "order", label: "Order", align: "center" },
    { key: "isActive", label: "Status", render: (val) => <StatusBadge status={val ? "active" : "inactive"} /> },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <TableActions
          actions={[
            { label: "Edit", icon: EditIcon, onClick: () => navigate(`/admin/faqs/${row.id}/edit`) },
            { label: "Delete", icon: DeleteIcon, danger: true, onClick: () => handleDelete(row.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar
        title="FAQs"
        searchValue={search}
        onSearchChange={setSearch}
        addPath="/admin/faqs/new"
        addLabel="New FAQ"
        onRefresh={fetchFaqs}
      />
      <DataTable
        columns={columns}
        rows={faqs}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(`/admin/faqs/${row.id}/edit`)}
        selected={selected}
        onSelectAll={() => setSelected(selected.length === faqs.length ? [] : faqs.map((r) => r.id))}
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
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default FaqList;
