import { useState } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Download as DownloadIcon } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import TableActions from "../../components/tables/TableActions";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../components/common/Toast";
import { newsletterService } from "../../services/newsletterService";

import { formatDateTime } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";
import { useAdminList, useAdminMutation } from "../../hooks";

const NEWSLETTER_STATUS_COLOR = {
  active: "success",
  unsubscribed: "muted",
};

const NewsletterList = () => {
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);

  const [filters, setFilters] = useState({ status: "" });
  const { search, setSearch } = useSearch();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selected, setSelected] = useState([]);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ status: "active", notes: "" });

  const {
    data: subscribers,
    total,
    loading,
    refetch,
  } = useAdminList("newsletterList", newsletterService, { page, pageSize, search, ...filters });

  const deleteMutation = useAdminMutation(
    (id) => newsletterService.delete(id),
    { queryKey: "newsletterList", successMessage: "Subscriber deleted" }
  );

  const bulkDeleteMutation = useAdminMutation(
    (ids) => Promise.all(ids.map((id) => newsletterService.delete(id))),
    {
      queryKey: "newsletterList",
      skipSuccessToast: true,
      onSuccess: (_, ids) => {
        toast(`${ids.length} subscribers deleted`);
        setSelected([]);
      },
    }
  );

  const editMutation = useAdminMutation(
    ({ id, payload }) => newsletterService.update(id, payload),
    { queryKey: "newsletterList", successMessage: "Subscriber updated" }
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

  const handleEdit = (subscriber) => {
    setEditTarget(subscriber);
    setEditForm({ status: subscriber.status || "active", notes: subscriber.notes || "" });
  };

  const handleEditSave = () => {
    if (!editTarget) return;
    editMutation.mutate({ id: editTarget.id, payload: editForm });
    setEditTarget(null);
  };

  const handleExport = async () => {
    try {
      const data = await newsletterService.exportCsv(filters);
      if (!data.length) {
        toast("No subscribers to export", "warning");
        return;
      }
      const headers = ["Email", "Status", "Source", "Subscribed At", "Unsubscribed At", "Last Email Sent", "Notes", "Created At"];
      const csvRows = [headers.join(",")];
      for (const row of data) {
        csvRows.push(
          [
            `"${row.email}"`,
            row.status,
            row.source || "",
            row.subscribedAt ? new Date(row.subscribedAt).toISOString() : "",
            row.unsubscribedAt ? new Date(row.unsubscribedAt).toISOString() : "",
            row.lastEmailSent ? new Date(row.lastEmailSent).toISOString() : "",
            `"${(row.notes || "").replace(/"/g, '""')}"`,
            row.createdAt ? new Date(row.createdAt).toISOString() : "",
          ].join(",")
        );
      }
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newsletter-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Export complete");
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to export", "error");
    }
  };

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All" },
        { value: "active", label: "Active" },
          { value: "unsubscribed", label: "Unsubscribed" },
        ],
      },
    ];

  const columns = [
    { key: "email", label: "Email", render: (val) => <span style={{ fontWeight: 500 }}>{val}</span> },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} color={NEWSLETTER_STATUS_COLOR[val] || "muted"} />,
    },
    { key: "subscribedAt", label: "Subscribed At", render: (val) => formatDateTime(val) },
    { key: "lastEmailSent", label: "Last Email", render: (val) => val ? formatDateTime(val) : "—" },
    {
      key: "notes",
      label: "Notes",
      render: (val) => val ? <span style={{ color: "var(--color-admin-text-secondary)", maxWidth: 200, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span> : "—",
    },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <TableActions
          actions={[
            { label: "Edit", icon: EditIcon, onClick: () => handleEdit(row) },
            { label: "Delete", icon: DeleteIcon, danger: true, onClick: () => handleDelete(row.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar
        title="Newsletter Subscribers"
        searchValue={search}
        onSearchChange={setSearch}
        onRefresh={refetch}
        actions={
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-sm border border-[var(--color-admin-border)] text-[var(--color-admin-text-secondary)] hover:bg-[var(--color-admin-bg-tertiary)] transition-colors cursor-pointer"
          >
            <DownloadIcon sx={{ fontSize: 16 }} /> Export CSV
          </button>
        }
      />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable
        columns={columns}
        rows={subscribers}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        selected={selected}
        onSelectAll={() => setSelected(selected.length === subscribers.length ? [] : subscribers.map((r) => r.id))}
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
        title="Delete Subscriber"
        message="Are you sure you want to delete this subscriber? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Subscriber</DialogTitle>
        <DialogContent>
          {editTarget && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                label="Email"
                value={editTarget.email}
                disabled
                size="small"
                fullWidth
              />
              <TextField
                select
                label="Status"
                value={editForm.status}
                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                size="small"
                fullWidth
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="unsubscribed">Unsubscribed</MenuItem>
              </TextField>
              <TextField
                label="Notes"
                value={editForm.notes}
                onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={3}
                size="small"
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: "flex", gap: 1, px: 1, pb: 1 }}>
            <button
              onClick={() => setEditTarget(null)}
              className="px-4 py-2 text-sm font-bold rounded-sm border border-[var(--color-admin-border)] text-[var(--color-admin-text-secondary)] hover:bg-[var(--color-admin-bg-tertiary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              className="px-4 py-2 text-sm font-bold rounded-sm bg-[var(--color-admin-primary)] text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              Save
            </button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewsletterList;
