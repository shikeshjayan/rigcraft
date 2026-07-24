import { Box, Chip } from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";

const FilterBar = ({ filters = [], onRemove, onClear }) => {
  if (!filters.length) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 3,
        py: 1.5,
        borderBottom: "1px solid var(--color-admin-border)",
        backgroundColor: "var(--color-admin-bg-primary)",
        flexWrap: "wrap",
      }}
    >
      <span className="text-xs font-medium text-admin-text-secondary">Filters:</span>
      {filters.map((filter) => (
        <Chip
          key={filter.key}
          label={
            <span>
              <strong>{filter.label}:</strong> {filter.value}
            </span>
          }
          onDelete={() => onRemove(filter.key)}
          deleteIcon={<ClearIcon />}
          size="small"
          sx={{
            borderRadius: "var(--radius-admin-badge)",
            fontSize: "0.75rem",
            height: 28,
            backgroundColor: "var(--color-admin-bg-tertiary)",
            color: "var(--color-admin-text)",
          }}
        />
      ))}
      {filters.length > 1 && (
        <Chip
          label="Clear all"
          onDelete={onClear}
          size="small"
          sx={{
            borderRadius: "var(--radius-admin-badge)",
            fontSize: "0.75rem",
            height: 28,
            backgroundColor: "transparent",
            color: "var(--color-admin-danger)",
          }}
        />
      )}
    </Box>
  );
};

export default FilterBar;
