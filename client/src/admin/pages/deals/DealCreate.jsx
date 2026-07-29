import { useState } from "react";
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
    type: "percentage",
    value: "",
    minOrder: "",
    maxUses: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dealService.create({
        ...form,
        value: Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      });
      toast("Deal created");
      navigate("/admin/deals");
    } catch (err) {
      toast(extractError(err, "Failed to create deal"), "error");
    } finally {
      setLoading(false);
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <AdminInput label="Deal Code" value={form.code} onChange={handleChange("code")} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Discount Type"
                value={form.type}
                onChange={handleChange("type")}
                size="small"
                fullWidth
                required
              >
                <MenuItem value="percentage">Percentage (%)</MenuItem>
                <MenuItem value="fixed">Fixed Amount ($)</MenuItem>
              </TextField>
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
          <AdminButton variant="primary" type="submit" loading={loading}>Create Deal</AdminButton>
          <AdminButton variant="secondary" onClick={() => navigate("/admin/deals")}>Cancel</AdminButton>
        </Box>
      </Box>
    </Box>
  );
};

export default DealCreate;
