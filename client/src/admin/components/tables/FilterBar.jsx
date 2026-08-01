import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";

const FilterBar = ({ filters = {}, onChange, options = [] }) => {
  if (!options.length) return null;

  const activeFilters = Object.entries(filters).filter(([, v]) => v !== "");

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          px: 3,
          py: 2,
          borderBottom: "1px solid var(--color-admin-border)",
          flexWrap: "wrap",
        }}>
        {options.map((opt) => (
          <FormControl key={opt.key} size="small" sx={{ minWidth: 160 }}>
            <InputLabel shrink sx={{ fontSize: "0.8125rem" }}>{opt.label}</InputLabel>
            <Select
              value={filters[opt.key] || ""}
              onChange={(e) =>
                onChange({ ...filters, [opt.key]: e.target.value })
              }
              label={opt.label}
              displayEmpty
              sx={{
                borderRadius: "var(--radius-admin-input)",
                fontSize: "0.8125rem",
                "& fieldset": { borderColor: "var(--color-admin-border)" },
                "&:hover fieldset": {
                  borderColor: "var(--color-admin-primary)",
                },
              }}>
              {opt.options.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>
      {activeFilters.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 3,
            py: 1,
            borderBottom: "1px solid var(--color-admin-border)",
            backgroundColor: "var(--color-admin-bg-primary)",
            flexWrap: "wrap",
          }}>
          <Box
            component="span"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--color-admin-text-secondary)",
            }}>
            Active filters:
          </Box>
          {activeFilters.map(([key, value]) => {
            const opt = options.find((o) => o.key === key);
            const item = opt?.options.find((o) => o.value === value);
            return (
              <Chip
                key={key}
                label={`${opt?.label || key}: ${item?.label || value}`}
                onDelete={() => onChange({ ...filters, [key]: "" })}
                deleteIcon={<ClearIcon />}
                size="small"
                sx={{
                  borderRadius: "var(--radius-admin-badge)",
                  fontSize: "0.75rem",
                  height: 26,
                  backgroundColor: "var(--color-admin-bg-tertiary)",
                  color: "var(--color-admin-text)",
                }}
              />
            );
          })}
          {activeFilters.length > 1 && (
            <Chip
              label="Clear all"
              onClick={() =>
                onChange(
                  Object.fromEntries(Object.keys(filters).map((k) => [k, ""])),
                )
              }
              size="small"
              sx={{
                borderRadius: "var(--radius-admin-badge)",
                fontSize: "0.75rem",
                height: 26,
                backgroundColor: "transparent",
                color: "var(--color-admin-danger)",
                "& .MuiChip-deleteIcon": { display: "none" },
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default FilterBar;
