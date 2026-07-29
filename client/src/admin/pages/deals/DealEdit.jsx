import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Grid, TextField, MenuItem, Switch } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import AdminInput from "../../components/common/Input";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import { useToast } from "../../components/common/Toast";
import { dealService } from "../../services/dealService";
import { extractError } from "../../utils/extractError";

const DealEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    type: "percentage",
    value: "",
    minOrder: "",
    maxUses: "",
    startDate: "",
    endDate: "",
    isActive: true,
    selectedProduct: null,
    selectedPrebuilt: null,
  });
  const [products, setProducts] = useState([]);
  const [prebuiltPCs, setPrebuiltPCs] = useState([]);

  useEffect(() => {
    dealService.getProductsForDeal()
      .then(setProducts)
      .catch(console.error);
    dealService.getPrebuiltPCsForDeal()
      .then(setPrebuiltPCs)
      .catch(console.error);
  }, []);

  useEffect(() => {
    dealService.getById(id)
      .then((deal) => {
        setForm({
          code: deal.code || "",
          title: deal.title || "",
          description: deal.description || "",
          type: deal.type || "percentage",
          value: deal.value?.toString() || "",
          minOrder: deal.minOrder?.toString() || "",
          maxUses: deal.maxUses?.toString() || "",
          startDate: deal.startDate ? new Date(deal.startDate).toISOString().slice(0, 16) : "",
          endDate: deal.endDate ? new Date(deal.endDate).toISOString().slice(0, 16) : "",
          isActive: deal.isActive ?? true,
          selectedProduct: deal.products && deal.products.length > 0 ? deal.products[0] : null,
          selectedPrebuilt: deal.prebuiltPcs && deal.prebuiltPcs.length > 0 ? deal.prebuiltPcs[0] : null,
        });
      })
      .catch(() => {
        toast("Deal not found", "error");
        navigate("/admin/deals");
      })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleProductChange = async (productId) => {
    if (productId) {
      try {
        const product = await dealService.getProductById(productId);
        setForm((prev) => ({ ...prev, selectedProduct: product }));
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    } else {
      setForm((prev) => ({ ...prev, selectedProduct: null }));
    }
  };

  const handlePrebuiltChange = async (prebuiltId) => {
    if (prebuiltId) {
      try {
        const prebuilt = await dealService.getPrebuiltById(prebuiltId);
        setForm((prev) => ({ ...prev, selectedPrebuilt: prebuilt }));
      } catch (err) {
        console.error("Failed to fetch prebuilt:", err);
      }
    } else {
      setForm((prev) => ({ ...prev, selectedPrebuilt: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedProduct = form.selectedProduct;
      const selectedPrebuilt = form.selectedPrebuilt;
      
const updatedFormData = {
        title: form.title || selectedProduct?.name || selectedPrebuilt?.name || form.code || "Deal",
        description: form.description || selectedProduct?.shortDescription || selectedPrebuilt?.description || `Discount: ${form.type === "percentage" ? form.value + "%" : "$" + form.value}`,
        startDate: form.startDate ? new Date(form.startDate) : new Date(),
        endDate: form.endDate ? new Date(form.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: form.isActive,
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        usedCount: 0,
        products: selectedProduct ? [typeof selectedProduct === "string" ? selectedProduct : selectedProduct._id] : [],
        prebuiltPcs: selectedPrebuilt ? [typeof selectedPrebuilt === "string" ? selectedPrebuilt : selectedPrebuilt._id] : [],
      };
      
      await dealService.update(id, updatedFormData);
      toast("Deal updated");
      navigate("/admin/deals");
    } catch (err) {
      toast(extractError(err, "Failed to update deal"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/deals")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>Edit Deal</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>{form.code}</Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 640 }}>
        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>Deal Information</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Deal Type"
                value={form.type === "percentage" ? "product_bundle" : "discount"}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    type: value === "product_bundle" ? "percentage" : "fixed",
                    code: value === "product_bundle" ? (prev.code || "") : prev.code
                  }));
                }}
                size="small"
                fullWidth
                required
              >
                <MenuItem value="product_bundle">Product Bundle Deal</MenuItem>
                <MenuItem value="discount">Discount Coupon</MenuItem>
              </TextField>
            </Grid>
            {form.type === "percentage" ? (
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="Deal Code" value={form.code} onChange={handleChange("code")} required />
              </Grid>
            ) : (
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="Deal Code" value={form.code} onChange={handleChange("code")} required />
              </Grid>
            )}
            {form.type === "percentage" && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  label="Select Product for Bundle Deal"
                  value={form.selectedProduct?._id || form.selectedProduct?.id || ""}
                  onChange={(e) => handleProductChange(e.target.value)}
                  size="small"
                  fullWidth
                  disabled={!form.type || form.type === "discount"}
                >
                  <MenuItem value="">Select a product...</MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
{form.type === "fixed" && (
               <Grid size={{ xs: 12 }}>
                 <TextField
                   select
                   label="Select Product for Bundle Deal"
                   value={form.selectedProduct ? (typeof form.selectedProduct === "string" ? form.selectedProduct : form.selectedProduct?._id || "") : ""}
                   onChange={(e) => handleProductChange(e.target.value)}
                   size="small"
                   fullWidth
                   disabled={form.type === "percentage"}
                 >
                   <MenuItem value="">Select a product...</MenuItem>
                   {products.map((product) => (
                     <MenuItem key={product._id} value={product._id}>
                       {product.name}
                     </MenuItem>
                   ))}
                 </TextField>
               </Grid>
             )}
            {form.type === "percentage" && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  label="Select Prebuilt PC for Bundle Deal"
                  value={form.selectedPrebuilt?._id || form.selectedPrebuilt?.id || ""}
                  onChange={(e) => handlePrebuiltChange(e.target.value)}
                  size="small"
                  fullWidth
                  disabled={!form.type || form.type === "discount"}
                >
                  <MenuItem value="">Select a prebuilt PC...</MenuItem>
                  {prebuiltPCs.map((prebuilt) => (
                    <MenuItem key={prebuilt._id} value={prebuilt._id}>
                      {prebuilt.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
{form.type === "fixed" && (
               <Grid size={{ xs: 12 }}>
                 <TextField
                   select
                   label="Select Prebuilt PC for Bundle Deal"
                   value={form.selectedPrebuilt ? (typeof form.selectedPrebuilt === "string" ? form.selectedPrebuilt : form.selectedPrebuilt?._id || "") : ""}
                   onChange={(e) => handlePrebuiltChange(e.target.value)}
                   size="small"
                   fullWidth
                   disabled={form.type === "percentage"}
                 >
                   <MenuItem value="">Select a prebuilt PC...</MenuItem>
                   {prebuiltPCs.map((prebuilt) => (
                     <MenuItem key={prebuilt._id} value={prebuilt._id}>
                       {prebuilt.name}
                     </MenuItem>
                   ))}
                 </TextField>
               </Grid>
             )}
<Grid size={{ xs: 12 }}>
               <AdminInput label="Title" value={form.title} onChange={handleChange("title")} required />
             </Grid>
             <Grid size={{ xs: 12 }}>
               <AdminInput label="Description" value={form.description} onChange={handleChange("description")} multiline rows={3} />
             </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AdminInput
                label={form.type === "percentage" ? "Discount (%)" : "Discount Amount ($)"}
                type="number"
                value={form.value}
                onChange={handleChange("value")}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AdminInput label="Minimum Order ($)" type="number" value={form.minOrder} onChange={handleChange("minOrder")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AdminInput label="Max Uses" type="number" value={form.maxUses} onChange={handleChange("maxUses")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AdminInput label="Start Date" type="datetime-local" value={form.startDate} onChange={handleChange("startDate")} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AdminInput label="End Date" type="datetime-local" value={form.endDate} onChange={handleChange("endDate")} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: "var(--color-admin-text)" }}>Active</Typography>
                  <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>Enable this deal immediately</Typography>
                </Box>
                <Switch checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <AdminButton variant="primary" type="submit" loading={saving}>Update Deal</AdminButton>
          <AdminButton variant="secondary" onClick={() => navigate("/admin/deals")}>Cancel</AdminButton>
        </Box>
      </Box>
    </Box>
  );
};

export default DealEdit;
