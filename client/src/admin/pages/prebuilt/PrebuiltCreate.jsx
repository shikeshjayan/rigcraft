import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import PrebuiltForm from "../../components/forms/PrebuiltForm";
import { prebuiltService } from "../../services/prebuiltService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import { extractError } from "../../utils/extractError";

const PrebuiltCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, comparePrice: data.comparePrice || null };
      if (payload.image?.file) payload.image = payload.image.file;
      await prebuiltService.create(payload);
      toast("Prebuilt PC created");
      navigate("/admin/prebuilt");
    } catch (err) {
      toast(extractError(err, "Failed to create prebuilt PC"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/prebuilt")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2, fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.5rem" } }}>New Prebuilt PC</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Create a new prebuilt configuration</Typography>
        </Box>
      </Box>
      <PrebuiltForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Prebuilt PC" />
    </Box>
  );
};

export default PrebuiltCreate;
