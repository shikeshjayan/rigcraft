import { Box, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const CompactPagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        borderTop: "1px solid var(--color-admin-border)",
        backgroundColor: "var(--color-admin-bg-secondary)",
      }}
    >
      <Typography variant="caption" sx={{ color: "var(--color-admin-text-secondary)" }}>
        Page {page + 1} of {totalPages}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <IconButton
          size="small"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          sx={{
            color: "var(--color-admin-text-secondary)",
            borderRadius: "var(--radius-admin-button)",
            "&:hover": { backgroundColor: "var(--color-admin-primary-hover)" },
            "&:hover .MuiSvgIcon-root": { color: "#ffffff" },
            "&.Mui-disabled": { opacity: 0.3 },
          }}
        >
          <ChevronLeft fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          sx={{
            color: "var(--color-admin-text-secondary)",
            borderRadius: "var(--radius-admin-button)",
            "&:hover": { backgroundColor: "var(--color-admin-primary-hover)" },
            "&:hover .MuiSvgIcon-root": { color: "#ffffff" },
            "&.Mui-disabled": { opacity: 0.3 },
          }}
        >
          <ChevronRight fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CompactPagination;
