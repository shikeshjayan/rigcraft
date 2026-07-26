import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link } from "@mui/material";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ORDER_STATUS_COLOR } from "../../constants/status";

const orders = [
  { id: "#ORD-007", customer: "Alice Johnson", date: "2026-07-24", status: "delivered", total: 2499.99 },
  { id: "#ORD-006", customer: "Bob Smith", date: "2026-07-23", status: "shipped", total: 1599.99 },
  { id: "#ORD-005", customer: "Carol White", date: "2026-07-22", status: "processing", total: 3299.99 },
  { id: "#ORD-004", customer: "David Brown", date: "2026-07-21", status: "pending", total: 899.99 },
  { id: "#ORD-003", customer: "Eve Davis", date: "2026-07-20", status: "delivered", total: 4199.99 },
];

const RecentOrders = () => {
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
          Recent Orders
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", mt: 0.5 }}>
          Latest 5 orders
        </Typography>
      </div>
      <TableContainer>
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
            {orders.map((order) => (
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
    </Paper>
  );
};

export default RecentOrders;
