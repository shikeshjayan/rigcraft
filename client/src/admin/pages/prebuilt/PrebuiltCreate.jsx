import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import PrebuiltForm from "../../components/forms/PrebuiltForm";
import { prebuiltService } from "../../services/prebuiltService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";

const PrebuiltCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await prebuiltService.create({ ...data, comparePrice: data.comparePrice || null });
      toast("Prebuilt PC created");
      navigate("/admin/prebuilt");
    } catch {
      toast("Failed to create", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/prebuilt")} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--color-admin-text)" }}>New Prebuilt PC</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Create a new prebuilt configuration</Typography>
        </Box>
      </Box>
      <PrebuiltForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Prebuilt PC" />
    </Box>
  );
};

export default PrebuiltCreate;
