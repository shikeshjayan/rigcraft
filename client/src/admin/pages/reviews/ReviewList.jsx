import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Rating } from "@mui/material";
import { Image as ImageIcon } from "@mui/icons-material";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import StatusBadge from "../../components/common/StatusBadge";
import AdminThumbnail from "../../components/common/AdminThumbnail";
import { useToast } from "../../components/common/Toast";
import { reviewService } from "../../services/reviewService";
import { REVIEW_STATUS, REVIEW_STATUS_COLOR } from "../../constants/status";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";
import { extractError } from "../../utils/extractError";

const ReviewList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  useEffect(() => { setPageSize(maxRows); }, [maxRows, setPageSize]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: "", rating: "" });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const result = await reviewService.list({ page, pageSize, search, ...filters });
      setReviews(result.data);
      setTotal(result.total);
    } catch (err) {
      toast(extractError(err, "Failed to load reviews"), "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, toast]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    {
      key: "rating",
      label: "Rating",
      options: [
        { value: "", label: "All" },
        { value: "5", label: "5 Stars" },
        { value: "4", label: "4 Stars" },
        { value: "3", label: "3 Stars" },
        { value: "2", label: "2 Stars" },
        { value: "1", label: "1 Star" },
      ],
    },
  ];

  const columns = [
    { key: "product", label: "Product", render: (val, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AdminThumbnail src={row.productImage || val.image || val.images?.[0]?.url} alt={val.name} size={32} />
        <Box sx={{ fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val.name}</Box>
      </Box>
    )},
    { key: "customer", label: "Customer", render: (val) => <Box sx={{ fontSize: "0.875rem" }}>{val.name}</Box> },
    { key: "rating", label: "Rating", render: (val) => <Rating value={val} readOnly size="small" /> },
    { key: "title", label: "Title", render: (val) => <Box sx={{ fontSize: "0.8125rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</Box> },
    { key: "images", label: "Images", render: (val, row) => {
      const images = row.images || val;
      if (!images?.length) return null;
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ImageIcon sx={{ fontSize: 16, color: "var(--color-admin-muted)" }} />
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {images.slice(0, 3).map((img, i) => (
              <Box
                key={i}
                component="img"
                src={img.url || img}
                alt=""
                sx={{ width: 28, height: 28, borderRadius: "4px", objectFit: "cover", border: "1px solid var(--color-admin-border)" }}
              />
            ))}
            {images.length > 3 && (
              <Box sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)", display: "flex", alignItems: "center" }}>+{images.length - 3}</Box>
            )}
          </Box>
        </Box>
      );
    }},
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} colorMap={REVIEW_STATUS_COLOR} /> },
    { key: "createdAt", label: "Date", render: (val) => formatDate(val) },
  ];

  return (
    <Box ref={containerRef}>
      <TableToolbar title="Reviews" searchValue={search} onSearchChange={setSearch} onRefresh={fetchReviews} />
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable columns={columns} rows={reviews} loading={loading} total={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} onRowClick={(row) => navigate(`/admin/reviews/${row.id}`)} rowsPerPageOptions={[10, 25, 50, 100]} />
    </Box>
  );
};

export default ReviewList;
