import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Grid, Chip } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { userService } from "../../services/userService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import StatusBadge from "../../components/common/StatusBadge";

const DetailRow = ({ label, value }) => (
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>{label}</Typography>
    <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500 }}>{value || "—"}</Typography>
  </Grid>
);

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getById(Number(id))
      .then(setUser)
      .catch(() => { toast("User not found", "error"); navigate("/admin/users"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  if (loading) return <Loading />;
  if (!user) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/users")} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--color-admin-text)" }}>{user.name}</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-muted)" }}>{user.email}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <Chip label={user.role} size="small" variant="outlined" sx={{ textTransform: "capitalize", borderRadius: "var(--radius-admin-badge)" }} />
        <StatusBadge status={user.status} />
      </Box>

      <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Account Details</Typography>
        <Grid container spacing={2}>
          <DetailRow label="Name" value={user.name} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Role" value={user.role} />
          <DetailRow label="Status" value={user.status} />
          <DetailRow label="Orders" value={user.orders} />
          <DetailRow label="Total Spent" value={formatCurrency(user.totalSpent)} />
          <DetailRow label="Registered" value={formatDateTime(user.registeredAt)} />
          <DetailRow label="Last Login" value={user.lastLogin ? formatDateTime(user.lastLogin) : "—"} />
        </Grid>
      </Box>
    </Box>
  );
};

export default UserDetails;
