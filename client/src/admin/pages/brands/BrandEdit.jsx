import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import BrandForm from "../../components/forms/BrandForm";
import { brandService } from "../../services/brandService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";

const BrandEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    brandService.getById(id)
      .then(setBrand)
      .catch(() => {
        toast("Brand not found", "error");
        navigate("/admin/brands");
      })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, website: data.website || undefined };
      if (payload.logo?.file) payload.logo = payload.logo.file;
      await brandService.update(id, payload);
      toast("Brand updated successfully");
      navigate("/admin/brands");
    } catch {
      toast("Failed to update brand", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/brands")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>Edit Brand</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>{brand.name}</Typography>
        </Box>
      </Box>
      <BrandForm defaultValues={brand} onSubmit={handleSubmit} loading={saving} submitLabel="Update Brand" />
    </Box>
  );
};

export default BrandEdit;
