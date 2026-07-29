import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, TextField, MenuItem, Switch } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import AdminInput from "../../components/common/Input";
import AdminButton from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { dealService } from "../../services/dealService";
import { extractError } from "../../utils/extractError";

const DealCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        code,
        title,
        description,
        type,
        value,
        minOrder,
        maxUses,
        startDate,
        endDate,
        isActive,
        selectedProduct,
        selectedPrebuilt,
      } = form;

const payload = {
         title: title || selectedProduct?.name || selectedPrebuilt?.name || code || "Deal",
         description: description || selectedProduct?.shortDescription || selectedPrebuilt?.description || `Discount: ${type === "percentage" ? value + "%" : "$" + value}`,
         startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
         endDate: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
         isActive,
         code,
         type,
         value: Number(value),
         minOrder: minOrder ? Number(minOrder) : undefined,
         maxUses: maxUses ? Number(maxUses) : undefined,
         usedCount: 0,
         products: selectedProduct ? [typeof selectedProduct === "string" ? selectedProduct : selectedProduct._id] : [],
         prebuiltPcs: selectedPrebuilt ? [typeof selectedPrebuilt === "string" ? selectedPrebuilt : selectedPrebuilt._id] : [],
       };
      
      await dealService.create(payload);
      toast("Deal created");
      navigate("/admin/deals");
    } catch (err) {
      toast(extractError(err, "Failed to create deal"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = async (productId) => {
    if (productId) {
      try {
        const product = await dealService.getProductById(productId);
        setForm((prev) => ({
          ...prev,
          selectedProduct: product,
          title: product.name,
          description: product.shortDescription,
        }));
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    } else {
      setForm((prev) => ({ ...prev, selectedProduct: null, title: "", description: "" }));
    }
  };

  const handlePrebuiltChange = async (prebuiltId) => {
    if (prebuiltId) {
      try {
        const prebuilt = await dealService.getPrebuiltById(prebuiltId);
        setForm((prev) => ({
          ...prev,
          selectedPrebuilt: prebuilt,
          title: prebuilt.name,
          description: prebuilt.description,
        }));
      } catch (err) {
        console.error("Failed to fetch prebuilt:", err);
      }
    } else {
      setForm((prev) => ({ ...prev, selectedPrebuilt: null, title: "", description: "" }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/deals")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>New Deal</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Create a new promotional deal</Typography>
        </Box>
      </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 640 }}>
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>Deal Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Deal Type"
                  value={form.type === "percentage" ? "product_bundle" : "discount"}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newType = value === "product_bundle" ? "percentage" : "fixed";
                    
                    setForm((prev) => ({
                      ...prev,
                      type: newType,
                      code: value === "product_bundle" ? "" : (prev.code || ""),
                      selectedProduct: newType === "fixed" ? null : prev.selectedProduct,
                      selectedPrebuilt: newType === "fixed" ? null : prev.selectedPrebuilt,
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
              <Grid item xs={12} sm={6}>
                <AdminInput label="Deal Code" value={form.code} onChange={handleChange("code")} required />
              </Grid>

              <Grid item xs={12}>
<TextField
                   select
                   label="Select Product for Bundle Deal"
                   value={form.selectedProduct ? (typeof form.selectedProduct === "string" ? form.selectedProduct : form.selectedProduct?._id || "") : ""}
                   onChange={(e) => handleProductChange(e.target.value)}
                   size="small"
                   fullWidth
                   disabled={form.type !== "percentage"}
                 >
                   <MenuItem value="">Select a product...</MenuItem>
                   {products.map((product) => (
                     <MenuItem key={product._id} value={product._id}>
                       {product.name}
                     </MenuItem>
                   ))}
                 </TextField>
              </Grid>

              <Grid item xs={12}>
<TextField
                   select
                   label="Select Prebuilt PC for Bundle Deal"
                   value={form.selectedPrebuilt ? (typeof form.selectedPrebuilt === "string" ? form.selectedPrebuilt : form.selectedPrebuilt?._id || "") : ""}
                   onChange={(e) => handlePrebuiltChange(e.target.value)}
                   size="small"
                   fullWidth
                   disabled={form.type !== "percentage"}
                 >
                   <MenuItem value="">Select a prebuilt PC...</MenuItem>
                   {prebuiltPCs.map((prebuilt) => (
                     <MenuItem key={prebuilt._id} value={prebuilt._id}>
                       {prebuilt.name}
                     </MenuItem>
                   ))}
                 </TextField>
              </Grid>
              <Grid item xs={12}>
                <AdminInput label="Title" value={form.title} onChange={handleChange("title")} required />
              </Grid>
              <Grid item xs={12}>
                <AdminInput label="Description" value={form.description} onChange={handleChange("description")} multiline rows={3} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AdminInput
                  label={form.type === "percentage" ? "Discount (%)" : "Discount Amount ($)"}
                  type="number"
                  value={form.value}
                  onChange={handleChange("value")}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AdminInput label="Minimum Order ($)" type="number" value={form.minOrder} onChange={handleChange("minOrder")} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AdminInput label="Max Uses" type="number" value={form.maxUses} onChange={handleChange("maxUses")} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AdminInput label="Start Date" type="datetime-local" value={form.startDate} onChange={handleChange("startDate")} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AdminInput label="End Date" type="datetime-local" value={form.endDate} onChange={handleChange("endDate")} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
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
          <AdminButton variant="primary" type="submit" loading={loading}>Create Deal</AdminButton>
          <AdminButton variant="secondary" onClick={() => navigate("/admin/deals")}>Cancel</AdminButton>
        </Box>
      </Box>
    </Box>
  );
};

export default DealCreate;
