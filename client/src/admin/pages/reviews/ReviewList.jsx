import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Rating, Switch, Tabs, Tab } from "@mui/material";
import {
  Image as ImageIcon,
  Star as StarIcon,
  Report as ReportIcon,
  Flag as FlagIcon,
  HourglassTop as HourglassTopIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FormatQuote as FormatQuoteIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import DataTable from "../../components/tables/DataTable";
import TableToolbar from "../../components/tables/TableToolbar";
import FilterBar from "../../components/tables/FilterBar";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import AdminThumbnail from "../../components/common/AdminThumbnail";
import { useToast } from "../../components/common/Toast";
import { reviewService } from "../../services/reviewService";
import { REVIEW_STATUS_COLOR } from "../../constants/status";
import { formatDate } from "../../utils/formatDate";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import { useViewportRows } from "../../hooks/useViewportRows";
import { useAdminList, useAdminMutation } from "../../hooks";

const TABS = [
  { value: "all", label: "All", reviewType: "" },
  { value: "product", label: "Product Reviews", reviewType: "product" },
  { value: "website", label: "Testimonials", reviewType: "website" },
];

const ReviewList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { maxRows, containerRef } = useViewportRows();
  const { page, pageSize, setPage, setPageSize } = usePagination([], maxRows);
  const { search, setSearch } = useSearch();

  const [filters, setFilters] = useState({ status: "", rating: "", featured: "", reported: "", spamFlagged: "" });

  const tabParam = searchParams.get("tab");
  const activeTab = TABS.some((t) => t.value === tabParam) ? tabParam : "all";
  const activeTabConfig = TABS.find((t) => t.value === activeTab) || TABS[0];

  const {
    data: reviews,
    total,
    loading,
    error,
    refetch,
  } = useAdminList("reviewList", reviewService, {
    page,
    pageSize,
    search,
    reviewType: activeTabConfig.reviewType,
    ...filters,
  });

  const { data: stats } = useQuery({
    queryKey: ["reviewStats"],
    queryFn: () => reviewService.stats(),
    staleTime: 60 * 1000,
  });

  const handleTabChange = (_, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
    setPage(0);
    if (value === "product") setFilters((prev) => ({ ...prev, featured: "" }));
  };

  const featuredMutation = useAdminMutation(
    ({ row, checked }) => reviewService.toggleFeatured(row.id, { featured: checked }),
    {
      queryKey: "reviewList",
      skipSuccessToast: true,
      onSuccess: (updated, { checked }) => {
        toast(checked ? "Testimonial featured" : "Testimonial unfeatured");
      },
    }
  );

  const handleToggleFeatured = (row, checked) => {
    featuredMutation.mutate({ row, checked });
  };

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
    ...(activeTab !== "product"
      ? [{
          key: "featured",
          label: "Featured",
          options: [
            { value: "", label: "All" },
            { value: "true", label: "Featured" },
          ],
        }]
      : []),
    {
      key: "reported",
      label: "Reported",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Reported" },
      ],
    },
    {
      key: "spamFlagged",
      label: "Spam Flag",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Flagged" },
      ],
    },
  ];

  const baseColumns = [
    { key: "type", label: "Type", render: (val) => (
      <StatusBadge label={val === "website" ? "Testimonial" : "Product"} color={val === "website" ? "primary" : "muted"} />
    )},
    { key: "product", label: "Product", render: (val, row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {val ? (
          <>
            <AdminThumbnail src={row.productImage || val.image || val.images?.[0]?.url} alt={val.name} size={32} />
            <Box sx={{ fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{val.name}</Box>
          </>
        ) : (
          <Box sx={{ fontSize: "0.875rem", color: "var(--color-admin-muted)" }}>Website testimonial</Box>
        )}
      </Box>
    )},
    { key: "customer", label: "Customer", render: (val) => <Box sx={{ fontSize: "0.875rem" }}>{val.name}</Box> },
    { key: "rating", label: "Rating", render: (val) => <Rating value={val} readOnly size="small" /> },
    { key: "title", label: "Title", render: (val) => <Box sx={{ fontSize: "0.8125rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val || "—"}</Box> },
    { key: "helpfulCount", label: "Helpful", render: (val) => <Box sx={{ fontSize: "0.875rem", color: "var(--color-admin-text-secondary)" }}>{val || 0}</Box> },
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
    { key: "featured", label: "Featured", render: (val, row) =>
      row.type === "website" ? (
        <Switch
          checked={!!val}
          size="small"
          onChange={(e) => {
            e.stopPropagation();
            handleToggleFeatured(row, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--color-admin-primary)" },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--color-admin-primary)" },
          }}
        />
      ) : (
        <Box sx={{ fontSize: "0.875rem", color: "var(--color-admin-muted)" }}>—</Box>
      )
    },
    { key: "flags", label: "Flags", render: (_, row) => (
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {row.reports?.length > 0 && (
          <StatusBadge label={`${row.reports.length} Report${row.reports.length > 1 ? "s" : ""}`} color="warning" />
        )}
        {row.spamFlagged && <StatusBadge label="Spam" color="error" />}
        {!row.reports?.length && !row.spamFlagged && (
          <Box sx={{ fontSize: "0.875rem", color: "var(--color-admin-muted)" }}>—</Box>
        )}
      </Box>
    )},
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} colorMap={REVIEW_STATUS_COLOR} /> },
    { key: "createdAt", label: "Date", render: (val) => formatDate(val) },
  ];

  const columns = baseColumns.filter((col) => {
    if (activeTab === "product") return col.key !== "type" && col.key !== "featured";
    if (activeTab === "website") return col.key !== "type" && col.key !== "product";
    return true;
  });

  return (
    <Box ref={containerRef}>
      {stats && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)", xl: "repeat(7, 1fr)" }, gap: 2, px: 3, pt: 3 }}>
          <StatCard compact title="Avg Rating" value={stats.avgRating ? `${Number(stats.avgRating).toFixed(1)} ★` : "—"} icon={StarIcon} subtitle="across all reviews" />
          <StatCard compact title="Pending" value={stats.totals?.pending ?? 0} icon={HourglassTopIcon} subtitle="awaiting moderation" />
          <StatCard compact title="Approved" value={stats.totals?.approved ?? 0} icon={CheckCircleIcon} subtitle="live on site" />
          <StatCard compact title="Rejected" value={stats.totals?.rejected ?? 0} icon={CancelIcon} subtitle="hidden from site" />
          <StatCard compact title="Testimonials" value={stats.byType?.website ?? 0} icon={FormatQuoteIcon} subtitle="website reviews" />
          <StatCard compact title="Reported" value={stats.reported ?? 0} icon={FlagIcon} subtitle="needs attention" />
          <StatCard compact title="Spam Flagged" value={stats.flagged ?? 0} icon={ReportIcon} subtitle="auto-detected" />
        </Box>
      )}
      <TableToolbar title="Reviews" searchValue={search} onSearchChange={setSearch} onRefresh={refetch} />
      <Box sx={{ px: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            minHeight: 40,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.8125rem", minHeight: 40, py: 0.75, color: "var(--color-admin-text-secondary)", "&.Mui-selected": { color: "var(--color-admin-primary) !important" } },
            "& .MuiTabs-indicator": { backgroundColor: "var(--color-admin-primary)" },
          }}
        >
          {TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
        </Tabs>
      </Box>
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
      <DataTable columns={columns} rows={reviews} loading={loading} error={error} total={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} onRowClick={(row) => navigate(`/admin/reviews/${row.id}?tab=${activeTab}`)} rowsPerPageOptions={[10, 25, 50, 100]} />
    </Box>
  );
};

export default ReviewList;
