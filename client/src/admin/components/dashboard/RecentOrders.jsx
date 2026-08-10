import { useState } from "react";
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link, Box, useTheme, useMediaQuery } from "@mui/material";
import StatusBadge from "../common/StatusBadge";
import CompactPagination from "../common/CompactPagination";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ORDER_STATUS_COLOR } from "../../constants/status";

const RecentOrders = ({ orders = [] }) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(orders.length / rowsPerPage);
  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

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
          Latest {orders.length} orders
        </Typography>
      </div>
      {isMobile ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {paginatedOrders.map((order) => (
            <Box
              key={order.id || order.orderNumber}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid var(--color-admin-border)",
                "&:last-of-type": { borderBottom: "none" },
                "&:nth-of-type(odd)": { backgroundColor: "var(--color-admin-table-striped)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-admin-primary)", overflowWrap: "anywhere" }}>
                  {order.orderNumber}
                </Typography>
                <StatusBadge label={order.status} color={ORDER_STATUS_COLOR[order.status]} />
              </Box>
              <Typography sx={{ fontSize: "0.8125rem", color: "var(--color-admin-text)" }}>
                {order.customer?.name || "N/A"}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "var(--color-admin-muted)", mt: 0.25 }}>
                {formatDate(order.createdAt)} · {formatCurrency(order.total)}
              </Typography>
            </Box>
          ))}
          {orders.length === 0 && (
            <Box sx={{ py: 4, textAlign: "center", color: "var(--color-admin-muted)" }}>
              <Typography variant="body2">No recent orders</Typography>
            </Box>
          )}
        </Box>
      ) : (
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
      )}

      <CompactPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </Paper>
  );
};

export default RecentOrders;
