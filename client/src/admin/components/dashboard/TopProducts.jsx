import { useState } from "react";
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from "@mui/material";
import CompactPagination from "../common/CompactPagination";
import { formatCurrency } from "../../utils/formatCurrency";

const TopProducts = ({ products = [] }) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(products.length / rowsPerPage);
  const paginatedProducts = products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const globalIndex = page * rowsPerPage;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "var(--radius-admin-card)",
        border: "1px solid var(--color-admin-border)",
        backgroundColor: "var(--color-admin-card)",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="p-4 border-b border-admin-border">
        <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-admin-text)" }}>
          Top Products
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", mt: 0.5 }}>
          Best selling products
        </Typography>
      </div>
      <TableContainer sx={{ flex: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }}>PRODUCT</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }} align="center">SOLD</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }} align="right">PRICE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((product, index) => (
              <TableRow key={product.id} hover>
                <TableCell sx={{ py: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-admin-button)",
                        backgroundColor: "var(--color-admin-bg-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        color: "var(--color-admin-text-secondary)",
                        flexShrink: 0,
                      }}
                    >
                      {globalIndex + index + 1}
                    </Box>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-admin-text)" }}>
                      {product.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-admin-text)" }}>
                    {product.soldCount || 0}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-admin-text)" }}>
                    {formatCurrency(product.price)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: "var(--color-admin-muted)" }}>
                  No product data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <CompactPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </Paper>
  );
};

export default TopProducts;
