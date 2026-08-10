import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Checkbox, Box, useMediaQuery, useTheme } from "@mui/material";
import Loading from "../common/Loading";
import EmptyState from "../common/EmptyState";

const DataTable = ({
  columns,
  rows,
  loading,
  error,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  selected,
  onSelectAll,
  onSelectOne,
  getRowId = (row) => row.id,
  selectable,
  rowsPerPageOptions,
  headerSlots,
  sx,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  if (loading) return <Loading />;

  if (error) {
    return <EmptyState title="Failed to load data" description="Something went wrong while loading this list. Please try again." />;
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title="No data found" description="No records match your current filters." />;
  }

  const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1);
  const displayPage = Number.isFinite(page) ? Math.min(Math.max(0, Math.floor(page)), maxPage) : 0;

  const primary = columns.find((c) => c.label !== "") || columns[0];
  const headerExtras = columns.filter((c) => c.label === "" && c.key !== "actions");
  const actionCol = columns.find((c) => c.key === "actions");
  const bodyCols = columns.filter((c) => c !== primary && c.label !== "");

  const renderCard = (row) => {
    const id = getRowId(row);
    return (
      <Paper
        key={id}
        elevation={0}
        onClick={() => onRowClick?.(row)}
        sx={{
          borderRadius: "var(--radius-admin-table)",
          border: selected?.includes(id) ? "1px solid var(--color-admin-primary)" : "1px solid var(--color-admin-border)",
          overflow: "hidden",
          cursor: onRowClick ? "pointer" : "default",
          "&:hover": { borderColor: "var(--color-admin-primary)" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5 }}>
          {selectable && (
            <Checkbox
              size="small"
              checked={selected?.includes(id)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => { e.stopPropagation(); onSelectOne?.(id); }}
              sx={{ color: "var(--color-admin-muted)", "&.Mui-checked": { color: "var(--color-admin-primary)" }, mr: -0.5 }}
            />
          )}
          <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden", "& *": { minWidth: 0, maxWidth: "100%", overflowWrap: "anywhere" } }}>
            {primary.render ? primary.render(row[primary.key], row) : row[primary.key]}
          </Box>
          {headerExtras.map((col) => (
            <Box key={col.key} sx={{ display: "flex", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
              {col.render ? col.render(row[col.key], row) : null}
            </Box>
          ))}
          {actionCol && (
            <Box sx={{ ml: "auto" }} onClick={(e) => e.stopPropagation()}>
              {actionCol.render(row[actionCol.key], row)}
            </Box>
          )}
        </Box>
        {bodyCols.length > 0 && (
          <Box sx={{ borderTop: "1px solid var(--color-admin-border)" }}>
            {bodyCols.map((col) => (
              <Box
                key={col.key}
                sx={{
                  display: "flex",
                  gap: 2,
                  px: 2,
                  py: 1.25,
                  alignItems: "flex-start",
                  borderBottom: "1px solid var(--color-admin-border)",
                  "&:last-of-type": { borderBottom: "none" },
                  "&:nth-of-type(odd)": { backgroundColor: "var(--color-admin-table-striped)" },
                }}
              >
                <Box sx={{ width: 104, flexShrink: 0, fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-admin-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", pt: "3px" }}>
                  {col.label}
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: "0.875rem",
                    color: "var(--color-admin-text)",
                    overflowWrap: "anywhere",
                    "& span": { whiteSpace: "normal !important", overflow: "visible !important", maxWidth: "none !important", textOverflow: "clip !important" },
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <>
      {isMobile && selectable && selected.length > 0 && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.25,
            borderRadius: "var(--radius-admin-table)",
            border: "1px solid var(--color-admin-primary)",
            backgroundColor: "var(--color-admin-card)",
            boxShadow: "var(--shadow-admin-dropdown)",
            ...sx,
          }}
        >
          <Checkbox
            size="small"
            checked={selected.length === rows.length}
            indeterminate={selected.length > 0 && selected.length < rows.length}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => { e.stopPropagation(); onSelectAll?.(); }}
            sx={{ color: "var(--color-admin-muted)", "&.Mui-checked": { color: "var(--color-admin-primary)" } }}
          />
          <Box sx={{ flex: 1, fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-admin-text)" }}>
            {selected.length} selected
          </Box>
          {headerSlots?.actions}
        </Box>
      )}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "var(--radius-admin-table)",
          border: "1px solid var(--color-admin-border)",
          overflow: "hidden",
          ...sx,
        }}
      >
        {isMobile ? (
          <Box sx={{ p: { xs: 1, sm: 1.5 }, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {rows.map((row) => renderCard(row))}
          </Box>
        ) : (
        <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={{ backgroundColor: "var(--color-admin-table-header)" }}>
                  <Checkbox
                    indeterminate={selected?.length > 0 && selected?.length < rows.length}
                    checked={rows.length > 0 && selected?.length === rows.length}
                    onChange={onSelectAll}
                    sx={{ color: "var(--color-admin-muted)", "&.Mui-checked": { color: "var(--color-admin-primary)" } }}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || "left"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "var(--color-admin-text-secondary)",
                    backgroundColor: "var(--color-admin-table-header)",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    ...col.sx,
                  }}
                >
                  {headerSlots?.[col.key] ?? col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={getRowId(row)}
                hover
                onClick={() => onRowClick?.(row)}
                sx={{
                  cursor: onRowClick ? "pointer" : "default",
                  "&:hover": { backgroundColor: "var(--color-admin-table-hover)" },
                  "&:nth-of-type(even)": { backgroundColor: "var(--color-admin-table-striped)" },
                }}
              >
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected?.includes(getRowId(row))}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => onSelectOne?.(getRowId(row))}
                      sx={{ color: "var(--color-admin-muted)", "&.Mui-checked": { color: "var(--color-admin-primary)" } }}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.align || "left"}
                    sx={{
                      fontSize: "0.875rem",
                      color: col.color || "var(--color-admin-text)",
                      whiteSpace: col.nowrap ? "nowrap" : undefined,
                      maxWidth: col.maxWidth,
                      ...col.bodySx,
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
        )}

      {total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={displayPage}
          onPageChange={onPageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={rowsPerPageOptions || [10, 25, 50, 100]}
          sx={{
            borderTop: "1px solid var(--color-admin-border)",
            color: "var(--color-admin-text-secondary)",
            fontSize: "0.8125rem",
            "& .MuiTablePagination-toolbar": { minHeight: 52, flexWrap: "wrap", justifyContent: "center", gap: 0.5 },
            "& .MuiTablePagination-selectIcon": { color: "var(--color-admin-muted)" },
            "& .MuiTablePagination-actions .MuiIconButton-root": {
              borderRadius: "var(--radius-admin-button)",
              "&:hover": { backgroundColor: "var(--color-admin-primary-hover)" },
              "&:hover .MuiSvgIcon-root": { color: "#ffffff" },
            },
          }}
        />
      )}
      </Paper>
    </>
  );
};

export default DataTable;
