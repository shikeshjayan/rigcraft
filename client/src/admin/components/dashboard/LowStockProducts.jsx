import { useState } from "react";
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import StatusBadge from "../common/StatusBadge";
import CompactPagination from "../common/CompactPagination";
import { formatCurrency } from "../../utils/formatCurrency";

const allProducts = [
  { id: 1, name: "AMD Ryzen 7 7800X3D", sku: "CPU-7800X3D", stock: 3, price: 449.99 },
  { id: 2, name: "NVIDIA RTX 4080 Super", sku: "GPU-4080S", stock: 2, price: 999.99 },
  { id: 3, name: "Corsair Vengeance 32GB DDR5", sku: "RAM-VEN32", stock: 5, price: 189.99 },
  { id: 4, name: "Samsung 990 Pro 2TB NVMe", sku: "SSD-990P2", stock: 4, price: 249.99 },
  { id: 5, name: "ASUS ROG Strix X670E-E", sku: "MB-X670E", stock: 1, price: 499.99 },
  { id: 6, name: "Intel Core i9-14900K", sku: "CPU-14900K", stock: 3, price: 589.99 },
  { id: 7, name: "Corsair RM850x PSU", sku: "PSU-RM850X", stock: 5, price: 139.99 },
  { id: 8, name: "Noctua NH-D15 Cooler", sku: "COOL-NHD15", stock: 2, price: 109.99 },
  { id: 9, name: "WD Black SN850X 1TB", sku: "SSD-SN850X", stock: 4, price: 169.99 },
  { id: 10, name: "G.Skill Trident Z5 64GB", sku: "RAM-TZ564", stock: 1, price: 329.99 },
  { id: 11, name: "MSI MPG Z790 Carbon WiFi", sku: "MB-Z790C", stock: 3, price: 449.99 },
  { id: 12, name: "AMD Radeon RX 7900 XTX", sku: "GPU-RX7900X", stock: 2, price: 899.99 },
  { id: 13, name: "Lian Li O11 Dynamic EVO", sku: "CASE-O11DE", stock: 5, price: 179.99 },
  { id: 14, name: "Seasonic Prime TX-1000", sku: "PSU-TX1000", stock: 4, price: 279.99 },
  { id: 15, name: "Samsung Odyssey G7 32\"", sku: "MON-G732", stock: 2, price: 699.99 },
  { id: 16, name: "Razer BlackWidow V4 Pro", sku: "KB-BWV4P", stock: 3, price: 229.99 },
  { id: 17, name: "Logitech G Pro X Superlight", sku: "MS-GPROX", stock: 5, price: 149.99 },
  { id: 18, name: "SteelSeries Arctis Nova Pro", sku: "HEAD-ANP", stock: 1, price: 349.99 },
  { id: 19, name: "Thermalright Peerless Assassin", sku: "COOL-PA120", stock: 4, price: 44.99 },
  { id: 20, name: "Fractal Design North ATX", sku: "CASE-FDN", stock: 2, price: 139.99 },
];

const getStockColor = (stock) => {
  if (stock <= 2) return "error";
  if (stock <= 5) return "warning";
  return "success";
};

const LowStockProducts = () => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(allProducts.length / rowsPerPage);
  const paginatedProducts = allProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          Low Stock Products
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", mt: 0.5 }}>
          Products running low on inventory
        </Typography>
      </div>
      <TableContainer sx={{ flex: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }}>PRODUCT</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }}>STOCK</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }} align="right">PRICE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell sx={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-admin-text)" }}>
                  {product.name}
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "var(--color-admin-muted)", fontFamily: "var(--font-admin-mono)" }}>
                  {product.sku}
                </TableCell>
                <TableCell>
                  <StatusBadge label={product.stock} color={getStockColor(product.stock)} />
                </TableCell>
                <TableCell align="right" sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-admin-text)" }}>
                  {formatCurrency(product.price)}
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

export default LowStockProducts;
