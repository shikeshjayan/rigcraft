import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link } from "@mui/material";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ORDER_STATUS_COLOR } from "../../constants/status";

const RecentOrders = ({ orders = [] }) => {
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
          Latest {orders.length} orders
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
              <TableRow key={order.id || order.orderNumber} hover>
                <TableCell>
                  <Link href="#" underline="hover" sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-admin-primary)", cursor: "pointer" }}>
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "var(--color-admin-text)" }}>{order.customer?.name || "N/A"}</TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "var(--color-admin-text-secondary)" }}>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <StatusBadge label={order.status} color={ORDER_STATUS_COLOR[order.status]} />
                </TableCell>
                <TableCell align="right" sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-admin-text)" }}>
                  {formatCurrency(order.total)}
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "var(--color-admin-muted)" }}>
                  No recent orders
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RecentOrders;
