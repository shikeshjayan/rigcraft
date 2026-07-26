import { useState } from "react";
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from "@mui/material";
import CompactPagination from "../common/CompactPagination";
import { formatCurrency } from "../../utils/formatCurrency";

const allProducts = [
  { id: 1, name: "RTX 4080 Super Gaming PC", sold: 86, revenue: 344000 },
  { id: 2, name: "AMD Ryzen 7 Pro Workstation", sold: 64, revenue: 204800 },
  { id: 3, name: "NVIDIA RTX 4070 Build", sold: 52, revenue: 129900 },
  { id: 4, name: "Intel Core i7-14700K Bundle", sold: 47, revenue: 98700 },
  { id: 5, name: "AMD Ryzen 5 Budget Build", sold: 38, revenue: 56900 },
  { id: 6, name: "RTX 4060 Gaming Desktop", sold: 35, revenue: 78750 },
  { id: 7, name: "Intel Core i5-14600KF Combo", sold: 31, revenue: 52700 },
  { id: 8, name: "AMD Ryzen 9 7950X3D Build", sold: 28, revenue: 165200 },
  { id: 9, name: "Entry Level Office PC", sold: 26, revenue: 33800 },
  { id: 10, name: "Corsair 5000D Build", sold: 24, revenue: 64800 },
  { id: 11, name: "NVIDIA RTX 4090 Ultimate", sold: 21, revenue: 241500 },
  { id: 12, name: "AMD Radeon RX 7800 XT Build", sold: 19, revenue: 43700 },
  { id: 13, name: "Mini ITX Gaming Rig", sold: 17, revenue: 45900 },
  { id: 14, name: "Streaming Pro Workstation", sold: 15, revenue: 52500 },
  { id: 15, name: "Home Server NAS Build", sold: 13, revenue: 22100 },
  { id: 16, name: "Deep Learning Workstation", sold: 11, revenue: 49500 },
  { id: 17, name: "White Theme Gaming PC", sold: 9, revenue: 30600 },
  { id: 18, name: "VR Ready Gaming Build", sold: 8, revenue: 26400 },
  { id: 19, name: "Silent Office PC", sold: 6, revenue: 9000 },
  { id: 20, name: "ESports Competition Rig", sold: 4, revenue: 14000 },
];

const TopProducts = () => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(allProducts.length / rowsPerPage);
  const paginatedProducts = allProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
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
          Best selling products this month
        </Typography>
      </div>
      <TableContainer sx={{ flex: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }}>PRODUCT</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }} align="center">SOLD</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }} align="right">REVENUE</TableCell>
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
                        backgroundColor: globalIndex + index === 0 ? "var(--color-admin-warning)" : "var(--color-admin-bg-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        color: globalIndex + index === 0 ? "#fff" : "var(--color-admin-text-secondary)",
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
                    {product.sold}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-admin-text)" }}>
                    {formatCurrency(product.revenue)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CompactPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </Paper>
  );
};

export default TopProducts;
