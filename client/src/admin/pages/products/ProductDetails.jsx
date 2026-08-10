import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Grid, Chip } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from "@mui/icons-material";
import { productService } from "../../services/productService";
import { CATEGORY_TYPES, CATEGORY_TYPE_COLORS } from "../../constants/categoryTypes";
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
    <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500, wordBreak: "break-word" }}>{value || "—"}</Typography>
  </Grid>
);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getById(id)
      .then(setProduct)
      .catch(() => { toast("Product not found", "error"); navigate("/admin/products"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  if (loading) return <Loading />;
  if (!product) return null;

  const type = CATEGORY_TYPES.find((t) => t.value === product.categoryType);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
          <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/products")} />
          <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2, overflowWrap: "break-word", fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.5rem" } }}>{product.name}</Typography>
            <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", fontWeight: 500 }}>SKU: {product.sku}</Typography>
          </Box>
        </Box>
        <AdminButton variant="primary" size="small" icon={<EditIcon />} onClick={() => navigate(`/admin/products/${id}/edit`)}>
          Edit Product
        </AdminButton>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        {type && (
          <Chip label={type.label} size="small" sx={{ backgroundColor: `${CATEGORY_TYPE_COLORS[product.categoryType]}15`, color: CATEGORY_TYPE_COLORS[product.categoryType], fontWeight: 500 }} />
        )}
        {product.brandName && (
          <Chip label={product.brandName} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
        )}
        {product.categoryName && (
          <Chip label={product.categoryName} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
        )}
        <StatusBadge status={product.isActive ? "active" : "inactive"} />
        {product.isFeatured && <Chip label="Featured" size="small" color="primary" variant="outlined" />}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {product.images?.length > 0 && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Images</Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {product.images.map((img, idx) => (
                <AdminThumbnail key={idx} src={img.url} alt={img.alt || product.name} size={100} sx={{ borderRadius: "var(--radius-admin-badge)" }} />
              ))}
            </Box>
          </Box>
        )}
        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Pricing & Inventory</Typography>
          <Grid container spacing={2}>
            <DetailRow label="Regular Price" value={formatCurrency(product.price)} />
            <DetailRow label="Sale Price" value={product.salePrice ? formatCurrency(product.salePrice) : "—"} />
            <DetailRow label="Currency" value={product.currency || "INR"} />
            <DetailRow label="Sale Period" value={product.saleStart ? `${formatDate(product.saleStart)} → ${product.saleEnd ? formatDate(product.saleEnd) : "Open ended"}` : "—"} />
            <DetailRow label="Stock" value={product.stock} />
            <DetailRow label="Low Stock Threshold" value={product.lowStockThreshold} />
          </Grid>
        </Box>

        {product.description && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Description</Typography>
            <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", whiteSpace: "pre-wrap" }}>{product.description}</Typography>
          </Box>
        )}

        {product.specifications?.length > 0 && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Specifications</Typography>
            <Grid container spacing={1}>
              {product.specifications.map((spec, idx) => (
                <Grid key={idx} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Box sx={{ p: 1.5, backgroundColor: "var(--color-admin-bg-tertiary)", borderRadius: "var(--radius-admin-badge)" }}>
                    <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block" }}>{spec.label}</Typography>
                    <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500, wordBreak: "break-word" }}>{spec.value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {(product.weight != null || product.length != null || product.width != null || product.height != null) && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Measurements</Typography>
            <Grid container spacing={2}>
              <DetailRow label="Weight" value={product.weight != null ? `${product.weight} kg` : "—"} />
              <DetailRow label="Length" value={product.length != null ? `${product.length} cm` : "—"} />
              <DetailRow label="Width" value={product.width != null ? `${product.width} cm` : "—"} />
              <DetailRow label="Height" value={product.height != null ? `${product.height} cm` : "—"} />
            </Grid>
          </Box>
        )}

        {product.warrantyDuration != null && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Warranty</Typography>
            <Grid container spacing={2}>
              <DetailRow label="Duration" value={`${product.warrantyDuration} ${product.warrantyUnit || "month"}${product.warrantyDuration === 1 ? "" : "s"}`} />
              <DetailRow label="Type" value={product.warrantyType || "—"} />
            </Grid>
          </Box>
        )}

        {product.compatibility && Object.keys(product.compatibility).length > 0 && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Compatibility</Typography>
            <Grid container spacing={1}>
              {Object.entries(product.compatibility).map(([key, value]) => (
                <Grid key={key} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Box sx={{ p: 1.5, backgroundColor: "var(--color-admin-bg-tertiary)", borderRadius: "var(--radius-admin-badge)" }}>
                    <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</Typography>
                    <Typography variant="body2" sx={{ color: "var(--color-admin-text)", fontWeight: 500, wordBreak: "break-word" }}>{String(value)}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {(product.metaTitle || product.metaDescription) && (
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>SEO</Typography>
            <Grid container spacing={2}>
              <DetailRow label="Meta Title" value={product.metaTitle} />
              <DetailRow label="Meta Description" value={product.metaDescription} />
            </Grid>
          </Box>
        )}

        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Analytics</Typography>
          <Grid container spacing={2}>
            <DetailRow label="Views" value={product.viewCount ?? 0} />
            <DetailRow label="Units Sold" value={product.soldCount ?? 0} />
            <DetailRow label="Rating" value={product.rating?.average != null ? `${product.rating.average} / 5 (${product.rating.count ?? 0} reviews)` : "—"} />
          </Grid>
        </Box>

        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--color-admin-text)" }}>Details</Typography>
          <Grid container spacing={2}>
            <DetailRow label="Slug" value={product.slug} />
            <DetailRow label="Created" value={formatDate(product.createdAt)} />
            <DetailRow label="Updated" value={formatDate(product.updatedAt)} />
            {product.tags?.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 0.5 }}>Tags</Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {product.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" sx={{ borderRadius: "var(--radius-admin-badge)", fontSize: "0.7rem" }} />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDetails;
