import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Switch } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import AdminInput from "../../components/common/Input";
import AdminButton from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { faqService } from "../../services/faqService";
import { extractError } from "../../utils/extractError";

const FaqCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    question: "",
    answer: "",
    order: "",
    isActive: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await faqService.create({
        ...form,
        order: form.order ? Number(form.order) : undefined,
      });
      toast("FAQ created");
      navigate("/admin/faqs");
    } catch (err) {
      toast(extractError(err, "Failed to create FAQ"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/faqs")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>New FAQ</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Add a new FAQ entry</Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 640 }}>
        <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>FAQ Information</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <AdminInput label="Question" value={form.question} onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminInput label="Answer" multiline rows={4} value={form.answer} onChange={(e) => setForm((prev) => ({ ...prev, answer: e.target.value }))} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AdminInput label="Sort Order" type="number" value={form.order} onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))} helperText="Lower numbers appear first" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: "var(--color-admin-text)" }}>Active</Typography>
                  <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>Show this FAQ on the public site</Typography>
                </Box>
                <Switch checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <AdminButton variant="primary" type="submit" loading={loading}>Create FAQ</AdminButton>
          <AdminButton variant="secondary" onClick={() => navigate("/admin/faqs")}>Cancel</AdminButton>
        </Box>
      </Box>
    </Box>
  );
};

export default FaqCreate;
