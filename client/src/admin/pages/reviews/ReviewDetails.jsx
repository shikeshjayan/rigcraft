import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box, Typography, Grid, Rating, Divider } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Flag as FlagIcon,
  Reply as ReplyIcon,
  DeleteSweep as DismissIcon,
} from "@mui/icons-material";
import { reviewService } from "../../services/reviewService";
import { REVIEW_STATUS_COLOR } from "../../constants/status";
import { formatDateTime } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import AdminInput from "../../components/common/Input";
import AdminTextarea from "../../components/common/Textarea";
import AdminSwitch from "../../components/common/Switch";
import Loading from "../../components/common/Loading";
import StatusBadge from "../../components/common/StatusBadge";
import AdminThumbnail from "../../components/common/AdminThumbnail";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { extractError } from "../../utils/extractError";

const DetailRow = ({ label, value }) => (
  <Grid size={{ xs: 12, sm: 6 }}>
    <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>{label}</Typography>
    <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500 }}>{value || "—"}</Typography>
  </Grid>
);

const ReviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const tabParam = searchParams.get("tab");
  const currentTab = ["all", "product", "website"].includes(tabParam) ? tabParam : "all";
  const listPath = currentTab === "all" ? "/admin/reviews" : `/admin/reviews?tab=${currentTab}`;

  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [replyText, setReplyText] = useState("");

  const loadReview = () => {
    setLoading(true);
    reviewService.getById(id)
      .then((r) => {
        setReview(r);
        setFeatured(!!r.featured);
        setDisplayOrder(r.displayOrder || 0);
        setReplyText(r.adminReply?.text || "");
      })
      .catch((err) => { toast(extractError(err, "Review not found"), "error"); navigate(listPath); })
      .finally(() => setLoading(false));
  };

  useEffect(loadReview, [id, navigate, toast, listPath]);

  const handleStatus = async (status) => {
    setUpdating(true);
    try {
      const updated = await reviewService.updateStatus(id, status);
      setReview(updated);
      toast(`Review ${status}`);
    } catch (err) {
      toast(extractError(err, "Failed to update review"), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleFeatured = async (checked) => {
    setUpdating(true);
    try {
      const updated = await reviewService.toggleFeatured(id, { featured: checked, displayOrder });
      setReview(updated);
      setFeatured(!!updated.featured);
      toast(checked ? "Testimonial featured" : "Testimonial unfeatured");
    } catch (err) {
      toast(extractError(err, "Failed to update featured status"), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDisplayOrder = async () => {
    setUpdating(true);
    try {
      const updated = await reviewService.toggleFeatured(id, { featured, displayOrder: Number(displayOrder) });
      setReview(updated);
      toast("Display order saved");
    } catch (err) {
      toast(extractError(err, "Failed to save display order"), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleReply = async () => {
    setUpdating(true);
    try {
      const updated = await reviewService.reply(id, replyText);
      setReview(updated);
      toast("Reply saved");
    } catch (err) {
      toast(extractError(err, "Failed to save reply"), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDismiss = async () => {
    setUpdating(true);
    try {
      const updated = await reviewService.dismissReports(id);
      setReview(updated);
      toast("Reports dismissed");
    } catch (err) {
      toast(extractError(err, "Failed to dismiss reports"), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleClearSpam = async () => {
    setUpdating(true);
    try {
      const updated = await reviewService.clearSpam(id);
      setReview(updated);
      toast("Spam flag cleared");
    } catch (err) {
      toast(extractError(err, "Failed to clear spam flag"), "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading />;
  if (!review) return null;

  const isTestimonial = review.type === "website";

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate(listPath)} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>Review Details</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", fontWeight: 500 }}>
            {isTestimonial ? "Website Testimonial" : `Product: ${review.product.name}`}
          </Typography>
        </Box>
        <StatusBadge label={isTestimonial ? "Testimonial" : "Product"} color={isTestimonial ? "primary" : "muted"} />
        <StatusBadge status={review.status} colorMap={REVIEW_STATUS_COLOR} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Grid container spacing={2}>
            {!isTestimonial && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Product</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AdminThumbnail src={review.product.image} alt={review.product.name} size={28} />
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500 }}>{review.product.name}</Typography>
                </Box>
              </Grid>
            )}
            <DetailRow label="Customer" value={review.customer.name} />
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Rating</Typography>
              <Rating value={review.rating} readOnly />
            </Grid>
            <DetailRow label="Date" value={formatDateTime(review.createdAt)} />
            <DetailRow label="Helpful Votes" value={review.helpfulCount || 0} />
            {review.isVerifiedPurchase && <DetailRow label="Verified Purchase" value="Yes" />}
          </Grid>

          {isTestimonial && (
            <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid var(--color-admin-border)", display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
              <AdminSwitch
                label="Featured"
                checked={featured}
                onChange={(e) => handleFeatured(e.target.checked)}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ minWidth: 160 }}>
                  <AdminInput
                    label="Display Order"
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                  />
                </Box>
                <AdminButton variant="secondary" size="small" loading={updating} onClick={handleDisplayOrder}>
                  Save
                </AdminButton>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "var(--color-admin-text)" }}>{review.title || "(no title)"}</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", lineHeight: 1.7 }}>{review.comment}</Typography>

          {review.adminReply?.text && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ p: 2, borderRadius: 1, backgroundColor: "var(--color-admin-bg-tertiary)", border: "1px solid var(--color-admin-border)" }}>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Admin Reply
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-admin-text)", lineHeight: 1.6 }}>{review.adminReply.text}</Typography>
                {review.adminReply.repliedAt && (
                  <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mt: 1 }}>
                    {formatDateTime(review.adminReply.repliedAt)}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Box>

        {review.images?.length > 0 && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 1.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Review Images ({review.images.length})
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {review.images.map((img, i) => (
                <Box
                  key={i}
                  component="img"
                  src={img.url}
                  alt={img.alt || "Review image"}
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: 1,
                    objectFit: "cover",
                    border: "1px solid var(--color-admin-border)",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                    "&:hover": { opacity: 0.85 },
                  }}
                  onClick={() => window.open(img.url, "_blank")}
                />
              ))}
            </Box>
          </Box>
        )}

        {review.spamFlagged && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-danger-border)", borderRadius: "var(--radius-admin-card)", backgroundColor: "var(--color-admin-danger-bg)", display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <FlagIcon sx={{ color: "var(--color-admin-danger)" }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-admin-danger-text)" }}>
                Flagged as spam (score: {review.spamScore != null ? review.spamScore.toFixed(2) : "N/A"})
              </Typography>
              {review.spamReason && (
                <Typography variant="caption" sx={{ color: "var(--color-admin-danger-text)", opacity: 0.8 }}>{review.spamReason}</Typography>
              )}
            </Box>
            <AdminButton variant="secondary" size="small" icon={<ApproveIcon />} loading={updating} onClick={handleClearSpam}>
              Mark as not spam
            </AdminButton>
          </Box>
        )}

        {review.reports?.length > 0 && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
              <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Reports ({review.reports.length})
              </Typography>
              <AdminButton variant="secondary" size="small" icon={<DismissIcon />} loading={updating} onClick={handleDismiss}>
                Dismiss Reports
              </AdminButton>
            </Box>
            {review.reports.map((r, i) => (
              <Box key={i} sx={{ p: 1.5, mb: 1, borderRadius: 1, backgroundColor: "var(--color-admin-bg-tertiary)", border: "1px solid var(--color-admin-border)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-admin-text)" }}>
                    <StatusBadge label={r.reason} color={r.reason === "spam" ? "error" : "warning"} size="small" />
                    {r.note && <Box component="span" sx={{ ml: 1 }}>{r.note}</Box>}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>{formatDateTime(r.createdAt)}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 1.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Admin Reply
          </Typography>
          <AdminTextarea label="Reply text (leave empty to clear)" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
          <Box sx={{ mt: 1.5 }}>
            <AdminButton variant="primary" size="small" icon={<ReplyIcon />} loading={updating} onClick={handleReply}>
              Save Reply
            </AdminButton>
          </Box>
        </Box>

        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", display: "flex", gap: 2 }}>
          {review.status !== "approved" && (
            <AdminButton variant="success" size="small" icon={<ApproveIcon />} onClick={() => setConfirmAction("approved")}>
              Approve
            </AdminButton>
          )}
          {review.status !== "rejected" && (
            <AdminButton variant="danger" size="small" icon={<RejectIcon />} onClick={() => setConfirmAction("rejected")}>
              Reject
            </AdminButton>
          )}
        </Box>

        <ConfirmDialog
          open={!!confirmAction}
          title={confirmAction === "approved" ? "Approve Review" : "Reject Review"}
          message={
            confirmAction === "approved"
              ? "Are you sure you want to approve this review? It will become visible on the public site."
              : "Are you sure you want to reject this review? It will be hidden from the public site."
          }
          confirmLabel={confirmAction === "approved" ? "Approve" : "Reject"}
          severity={confirmAction === "approved" ? "success" : "danger"}
          loading={updating}
          onConfirm={() => {
            handleStatus(confirmAction);
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      </Box>
    </Box>
  );
};

export default ReviewDetails;
