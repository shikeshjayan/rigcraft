import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import DealForm from "../../components/forms/DealForm";
import { dealService } from "../../services/dealService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import { extractError } from "../../utils/extractError";

const processHomeOfferBanners = async (promotion) => {
  const offers = Array.isArray(promotion?.homeOffer) ? promotion.homeOffer : [];
  const processed = await Promise.all(offers.map(async (offer) => {
    if (!offer?.banner?.file) return offer;
    const result = await dealService.uploadImage(offer.banner.file);
    return { ...offer, banner: { ...result, alt: offer.title || "Home offer" } };
  }));
  return { ...promotion, homeOffer: processed };
};

const DealCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const promotion = await processHomeOfferBanners(data.promotion);
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        products: (data.products || []).map((p) => p.id || p._id),
        prebuiltPCs: (data.prebuiltPCs || []).map((p) => p.id || p._id),
        promotion,
      };

      await dealService.create(payload);
      toast("Deal created successfully");
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
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2, fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.5rem" } }}>New Deal</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Create a new marketing campaign</Typography>
        </Box>
      </Box>
      <DealForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Deal" />
    </Box>
  );
};

export default DealCreate;
