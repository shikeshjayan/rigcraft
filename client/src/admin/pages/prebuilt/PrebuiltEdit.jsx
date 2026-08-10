import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import PrebuiltForm from "../../components/forms/PrebuiltForm";
import { prebuiltService } from "../../services/prebuiltService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import { extractError } from "../../utils/extractError";

const PrebuiltEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    prebuiltService.getById(id)
      .then(setItem)
      .catch(() => { toast("Prebuilt PC not found", "error"); navigate("/admin/prebuilt"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, comparePrice: data.comparePrice || null };
      if (payload.image?.file) payload.image = payload.image.file;
      await prebuiltService.update(id, payload);
      toast("Prebuilt PC updated");
      navigate("/admin/prebuilt");
    } catch (err) {
      toast(extractError(err, "Failed to update prebuilt PC"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/prebuilt")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1, flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2, overflowWrap: "break-word", fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.5rem" } }}>Edit Prebuilt PC</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25, overflowWrap: "break-word" }}>{item.name}</Typography>
        </Box>
      </Box>
      <PrebuiltForm defaultValues={item} onSubmit={handleSubmit} loading={saving} submitLabel="Update Prebuilt PC" />
    </Box>
  );
};

export default PrebuiltEdit;
