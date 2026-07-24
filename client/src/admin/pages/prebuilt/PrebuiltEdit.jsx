import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import PrebuiltForm from "../../components/forms/PrebuiltForm";
import { prebuiltService } from "../../services/prebuiltService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";

const PrebuiltEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    prebuiltService.getById(Number(id))
      .then(setItem)
      .catch(() => { toast("Not found", "error"); navigate("/admin/prebuilt"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await prebuiltService.update(Number(id), { ...data, comparePrice: data.comparePrice || null });
      toast("Prebuilt PC updated");
      navigate("/admin/prebuilt");
    } catch {
      toast("Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/prebuilt")} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--color-admin-text)" }}>Edit Prebuilt PC</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>{item.name}</Typography>
        </Box>
      </Box>
      <PrebuiltForm defaultValues={item} onSubmit={handleSubmit} loading={saving} submitLabel="Update Prebuilt PC" />
    </Box>
  );
};

export default PrebuiltEdit;
