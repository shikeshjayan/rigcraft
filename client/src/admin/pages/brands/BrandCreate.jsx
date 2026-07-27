import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import BrandForm from "../../components/forms/BrandForm";
import { brandService } from "../../services/brandService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import { extractError } from "../../utils/extractError";

const BrandCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, website: data.website || undefined };
      if (payload.logo?.file) payload.logo = payload.logo.file;
      await brandService.create(payload);
      toast("Brand created successfully");
      navigate("/admin/brands");
    } catch (err) {
      toast(extractError(err, "Failed to create brand"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/brands")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>New Brand</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Add a new brand</Typography>
        </Box>
      </Box>
      <BrandForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Brand" />
    </Box>
  );
};

export default BrandCreate;
