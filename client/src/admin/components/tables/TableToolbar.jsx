import { InputBase, Paper, IconButton, Tooltip } from "@mui/material";
import { Search as SearchIcon, Add as AddIcon, Download as DownloadIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import AdminButton from "../common/Button";
import { useNavigate } from "react-router-dom";

const TableToolbar = ({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  onAdd,
  addLabel = "Add New",
  addPath,
  onRefresh,
  onExport,
  actions,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-admin-border">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <h3 className="text-lg font-semibold text-admin-text whitespace-nowrap">{title}</h3>
        {onRefresh && (
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={onRefresh} sx={{ color: "var(--color-admin-muted)" }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1.5,
            py: 0.5,
            borderRadius: "var(--radius-admin-input)",
            border: "1px solid var(--color-admin-border)",
            backgroundColor: "var(--color-admin-bg-tertiary)",
            width: { xs: "100%", sm: 220 },
            "&:focus-within": {
              borderColor: "var(--color-admin-primary)",
              backgroundColor: "var(--color-admin-card)",
            },
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: "var(--color-admin-muted)", mr: 1 }} />
          <InputBase
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              fontSize: "0.8125rem",
              color: "var(--color-admin-text)",
              width: "100%",
              "& input::placeholder": { color: "var(--color-admin-muted)", opacity: 1 },
            }}
          />
        </Paper>

        {onExport && (
          <Tooltip title="Export">
            <IconButton onClick={onExport} sx={{ color: "var(--color-admin-muted)" }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}

        {(onAdd || addPath) && (
          <AdminButton
            variant="primary"
            size="small"
            icon={<AddIcon />}
            onClick={() => (onAdd ? onAdd() : navigate(addPath))}
          >
            {addLabel}
          </AdminButton>
        )}

        {actions}
      </div>
    </div>
  );
};

export default TableToolbar;
