import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../../utils/formatCurrency";

const products = [
  { id: 1, name: "AMD Ryzen 7 7800X3D", sku: "CPU-7800X3D", stock: 3, price: 449.99 },
  { id: 2, name: "NVIDIA RTX 4080 Super", sku: "GPU-4080S", stock: 2, price: 999.99 },
  { id: 3, name: "Corsair Vengeance 32GB DDR5", sku: "RAM-VEN32", stock: 5, price: 189.99 },
  { id: 4, name: "Samsung 990 Pro 2TB NVMe", sku: "SSD-990P2", stock: 4, price: 249.99 },
  { id: 5, name: "ASUS ROG Strix X670E-E", sku: "MB-X670E", stock: 1, price: 499.99 },
];

const getStockColor = (stock) => {
  if (stock <= 2) return "error";
  if (stock <= 5) return "warning";
  return "success";
};

const LowStockProducts = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "var(--radius-admin-card)",
        border: "1px solid var(--color-admin-border)",
        backgroundColor: "var(--color-admin-card)",
        overflow: "hidden",
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
      <TableContainer>
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
            {products.map((product) => (
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
    </Paper>
  );
};

export default LowStockProducts;
