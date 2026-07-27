import { Skeleton as MuiSkeleton, Box, Paper } from "@mui/material";

const CardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: "var(--radius-admin-card)",
      border: "1px solid var(--color-admin-border)",
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
      <MuiSkeleton variant="rounded" width={80} height={16} />
      <MuiSkeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "var(--radius-admin-button)" }} />
    </Box>
    <MuiSkeleton variant="rounded" width={120} height={32} sx={{ mb: 1 }} />
    <MuiSkeleton variant="rounded" width={100} height={14} />
  </Paper>
);

const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: "var(--radius-admin-card)",
      border: "1px solid var(--color-admin-border)",
      overflow: "hidden",
    }}
  >
    <Box sx={{ p: 2, borderBottom: "1px solid var(--color-admin-border)" }}>
      <MuiSkeleton variant="rounded" width={160} height={22} />
    </Box>
    {Array.from({ length: rows }).map((_, i) => (
      <Box
        key={i}
        sx={{
          display: "flex",
          gap: 2,
          p: 2,
          borderBottom: i < rows - 1 ? "1px solid var(--color-admin-border-light)" : "none",
        }}
      >
        {Array.from({ length: cols }).map((_, j) => (
          <MuiSkeleton key={j} variant="rounded" width={`${100 / cols}%`} height={16} />
        ))}
      </Box>
    ))}
  </Paper>
);

const ChartSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: "var(--radius-admin-card)",
      border: "1px solid var(--color-admin-border)",
    }}
  >
    <MuiSkeleton variant="rounded" width={180} height={22} sx={{ mb: 1 }} />
    <MuiSkeleton variant="rounded" width={140} height={14} sx={{ mb: 3 }} />
    <MuiSkeleton variant="rounded" width="100%" height={280} />
  </Paper>
);

export { CardSkeleton, TableSkeleton, ChartSkeleton };
export default MuiSkeleton;
