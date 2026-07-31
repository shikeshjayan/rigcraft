import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Grid, Chip } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from "@mui/icons-material";
import { prebuiltService, COMPONENT_SLOTS } from "../../services/prebuiltService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import StatusBadge from "../../components/common/StatusBadge";
import AdminThumbnail from "../../components/common/AdminThumbnail";

const DetailRow = ({ label, value }) => (
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>{label}</Typography>
    <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500 }}>{value || "—"}</Typography>
  </Grid>
);

const PrebuiltDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prebuiltService.getById(id)
      .then(setItem)
      .catch(() => { toast("Not found", "error"); navigate("/admin/prebuilt"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  if (loading) return <Loading />;
  if (!item) return null;

  return (
    <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/prebuilt")} />
            <AdminThumbnail src={item.image} alt={item.name} size={48} sx={{ borderRadius: "var(--radius-admin-badge)" }} />
            <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)" }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>{item.name}</Typography>
              <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", fontWeight: 500 }}>SKU: {item.sku}</Typography>
            </Box>
          </Box>
          <AdminButton variant="primary" size="small" icon={<EditIcon />} onClick={() => navigate(`/admin/prebuilt/${id}/edit`)}>Edit</AdminButton>
        </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <StatusBadge status={item.isActive ? "active" : "inactive"} />
        {item.isFeatured && <Chip label="Featured" size="small" color="primary" variant="outlined" />}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Pricing & Stock</Typography>
          <Grid container spacing={2}>
            <DetailRow label="Price" value={formatCurrency(item.regularPrice)} />
            <DetailRow label="Sale Price" value={item.salePrice ? formatCurrency(item.salePrice) : "—"} />
            <DetailRow label="Stock" value={item.stock} />
          </Grid>
        </Box>

        {item.shortDescription && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "var(--color-admin-text)" }}>Description</Typography>
            <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>{item.shortDescription}</Typography>
            {item.description && <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", mt: 2, whiteSpace: "pre-wrap" }}>{item.description}</Typography>}
          </Box>
        )}

        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Component Configuration</Typography>
          <Grid container spacing={1}>
            {COMPONENT_SLOTS.map((slot) => {
              const selectedId = item.components?.[slot.key];
              return (
                <Grid key={slot.key} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Box sx={{ p: 1.5, backgroundColor: "var(--color-admin-bg-tertiary)", borderRadius: "var(--radius-admin-badge)" }}>
                    <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block" }}>{slot.label}</Typography>
                    <Typography variant="body2" sx={{ color: selectedId ? "var(--color-admin-text)" : "var(--color-admin-muted)", fontWeight: 500 }}>
                      {selectedId ? `Product #${selectedId}` : "Not assigned"}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <DetailRow label="Created" value={formatDate(item.createdAt)} />
        <DetailRow label="Updated" value={formatDate(item.updatedAt)} />
      </Box>
    </Box>
  );
};

export default PrebuiltDetails;
