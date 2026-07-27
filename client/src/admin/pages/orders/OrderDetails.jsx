import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Grid, Chip, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { orderService } from "../../services/orderService";
import { extractError } from "../../utils/extractError";
import { ORDER_STATUS, ORDER_STATUS_COLOR } from "../../constants/status";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import AdminSelect from "../../components/common/Select";
import Loading from "../../components/common/Loading";
import StatusBadge from "../../components/common/StatusBadge";

const DetailRow = ({ label, value }) => (
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>{label}</Typography>
    <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500 }}>{value || "—"}</Typography>
  </Grid>
);

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    orderService.getById(id)
      .then(setOrder)
      .catch((err) => { toast(extractError(err, "Order not found"), "error"); navigate("/admin/orders"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const updated = await orderService.updateStatus(id, newStatus);
      setOrder(updated);
      toast("Order status updated");
    } catch (err) {
      toast(extractError(err, "Failed to update status"), "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading />;
  if (!order) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/orders")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>{order.orderNumber}</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", fontWeight: 500 }}>{order.customer?.email || "—"}</Typography>
        </Box>
        <StatusBadge status={order.status} colorMap={ORDER_STATUS_COLOR} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Order Information</Typography>
          <Grid container spacing={2}>
            <DetailRow label="Order Number" value={order.orderNumber} />
            <DetailRow label="Date" value={formatDateTime(order.createdAt)} />
            <DetailRow label="Last Updated" value={formatDateTime(order.updatedAt)} />
            <DetailRow label="Payment Method" value={order.paymentMethod} />
            <DetailRow label="Item Count" value={order.itemCount} />
            <DetailRow label="Total" value={formatCurrency(order.total)} />
          </Grid>

          {order.items?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: "var(--color-admin-text)", fontWeight: 600 }}>Order Items</Typography>
              <Table size="small" sx={{ "& th, & td": { fontSize: "0.8125rem", color: "var(--color-admin-text)", borderColor: "var(--color-admin-border)" } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.name || "—"}</TableCell>
                      <TableCell>{item.sku || "—"}</TableCell>
                      <TableCell>{item.quantity || 1}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice || 0)}</TableCell>
                      <TableCell>{formatCurrency(item.totalPrice || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Customer</Typography>
          <Grid container spacing={2}>
            <DetailRow label="Name" value={order.customer.name} />
            <DetailRow label="Email" value={order.customer.email} />
          </Grid>
        </Box>

        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Shipping Address</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>{order.shippingAddress}</Typography>
        </Box>

        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Update Status</Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <AdminSelect
              label="Status"
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={Object.entries(ORDER_STATUS).map(([k, v]) => ({ value: v, label: k.charAt(0) + k.slice(1).toLowerCase() }))}
              sx={{ minWidth: 200 }}
              disabled={updating}
            />
          </Box>
        </Box>

        {order.notes && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "var(--color-admin-text)" }}>Notes</Typography>
            <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>{order.notes}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OrderDetails;
