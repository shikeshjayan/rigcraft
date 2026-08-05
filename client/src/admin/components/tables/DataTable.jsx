import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Checkbox } from "@mui/material";
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
  if (loading) return <Loading />;

  if (error) {
    return <EmptyState title="Failed to load data" description="Something went wrong while loading this list. Please try again." />;
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title="No data found" description="No records match your current filters." />;
  }

  const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1);
  const displayPage = Number.isFinite(page) ? Math.min(Math.max(0, Math.floor(page)), maxPage) : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "var(--radius-admin-table)",
        border: "1px solid var(--color-admin-border)",
        overflow: "hidden",
        ...sx,
      }}
    >
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
            "& .MuiTablePagination-toolbar": { minHeight: 52 },
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
  );
};

export default DataTable;
