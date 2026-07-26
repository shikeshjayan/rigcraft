import { useState } from "react";
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link } from "@mui/material";
import StatusBadge from "../common/StatusBadge";
import CompactPagination from "../common/CompactPagination";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ORDER_STATUS_COLOR } from "../../constants/status";

const allOrders = [
  { id: "#ORD-020", customer: "Alice Johnson", date: "2026-07-26", status: "pending", total: 2499.99 },
  { id: "#ORD-019", customer: "Bob Smith", date: "2026-07-26", status: "shipped", total: 1599.99 },
  { id: "#ORD-018", customer: "Carol White", date: "2026-07-25", status: "delivered", total: 3299.99 },
  { id: "#ORD-017", customer: "David Brown", date: "2026-07-25", status: "processing", total: 899.99 },
  { id: "#ORD-016", customer: "Eve Davis", date: "2026-07-24", status: "delivered", total: 4199.99 },
  { id: "#ORD-015", customer: "Frank Miller", date: "2026-07-24", status: "cancelled", total: 1299.99 },
  { id: "#ORD-014", customer: "Grace Wilson", date: "2026-07-23", status: "shipped", total: 2799.99 },
  { id: "#ORD-013", customer: "Henry Taylor", date: "2026-07-23", status: "confirmed", total: 549.99 },
  { id: "#ORD-012", customer: "Ivy Anderson", date: "2026-07-22", status: "delivered", total: 1899.99 },
  { id: "#ORD-011", customer: "Jack Thomas", date: "2026-07-22", status: "processing", total: 3599.99 },
  { id: "#ORD-010", customer: "Karen Jackson", date: "2026-07-21", status: "shipped", total: 749.99 },
  { id: "#ORD-009", customer: "Leo Harris", date: "2026-07-21", status: "delivered", total: 4999.99 },
  { id: "#ORD-008", customer: "Maria Clark", date: "2026-07-20", status: "pending", total: 1199.99 },
  { id: "#ORD-007", customer: "Nathan Lewis", date: "2026-07-20", status: "delivered", total: 2199.99 },
  { id: "#ORD-006", customer: "Olivia Walker", date: "2026-07-19", status: "cancelled", total: 399.99 },
  { id: "#ORD-005", customer: "Paul Hall", date: "2026-07-19", status: "shipped", total: 2899.99 },
  { id: "#ORD-004", customer: "Quinn Young", date: "2026-07-18", status: "delivered", total: 1699.99 },
  { id: "#ORD-003", customer: "Rachel King", date: "2026-07-18", status: "confirmed", total: 4499.99 },
  { id: "#ORD-002", customer: "Sam Wright", date: "2026-07-17", status: "processing", total: 999.99 },
  { id: "#ORD-001", customer: "Tina Lopez", date: "2026-07-17", status: "delivered", total: 3799.99 },
];

const RecentOrders = () => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(allOrders.length / rowsPerPage);
  const paginatedOrders = allOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          Recent Orders
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", mt: 0.5 }}>
          Latest {allOrders.length} orders
        </Typography>
      </div>
      <TableContainer sx={{ flex: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }}>ORDER</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }}>CUSTOMER</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }}>DATE</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-admin-text-secondary)", fontSize: "0.75rem" }} align="right">TOTAL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Link href="#" underline="hover" sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-admin-primary)", cursor: "pointer" }}>
                    {order.id}
                  </Link>
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{order.customer}</TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "var(--color-admin-text-secondary)" }}>{formatDate(order.date)}</TableCell>
                <TableCell>
                  <StatusBadge label={order.status} color={ORDER_STATUS_COLOR[order.status]} />
                </TableCell>
                <TableCell align="right" sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-admin-text)" }}>
                  {formatCurrency(order.total)}
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

export default RecentOrders;
