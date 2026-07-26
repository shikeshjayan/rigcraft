import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Grid, Rating, Chip } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Check as ApproveIcon, Close as RejectIcon } from "@mui/icons-material";
import { reviewService } from "../../services/reviewService";
import { REVIEW_STATUS_COLOR } from "../../constants/status";
import { formatDateTime } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import StatusBadge from "../../components/common/StatusBadge";

const DetailRow = ({ label, value }) => (
  <Grid size={{ xs: 12, sm: 6 }}>
    <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>{label}</Typography>
    <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500 }}>{value || "—"}</Typography>
  </Grid>
);

const ReviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    reviewService.getById(id)
      .then(setReview)
      .catch(() => { toast("Review not found", "error"); navigate("/admin/reviews"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleStatus = async (status) => {
    setUpdating(true);
    try {
      const updated = await reviewService.updateStatus(id, status);
      setReview(updated);
      toast(`Review ${status}`);
    } catch {
      toast("Failed to update review", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading />;
  if (!review) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/reviews")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>Review Details</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", fontWeight: 500 }}>Product: {review.product.name}</Typography>
        </Box>
        <StatusBadge status={review.status} colorMap={REVIEW_STATUS_COLOR} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Grid container spacing={2}>
            <DetailRow label="Product" value={review.product.name} />
            <DetailRow label="Customer" value={review.customer.name} />
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Rating</Typography>
              <Rating value={review.rating} readOnly />
            </Grid>
            <DetailRow label="Date" value={formatDateTime(review.createdAt)} />
          </Grid>
        </Box>

        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "var(--color-admin-text)" }}>{review.title}</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", lineHeight: 1.7 }}>{review.comment}</Typography>
        </Box>

        {review.status === "pending" && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", display: "flex", gap: 2 }}>
            <AdminButton variant="success" size="small" icon={<ApproveIcon />} onClick={() => handleStatus("approved")} loading={updating}>
              Approve
            </AdminButton>
            <AdminButton variant="danger" size="small" icon={<RejectIcon />} onClick={() => handleStatus("rejected")} loading={updating}>
              Reject
            </AdminButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ReviewDetails;
