import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import DealForm from "../../components/forms/DealForm";
import { dealService } from "../../services/dealService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import { extractError } from "../../utils/extractError";

const DealEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deal, setDeal] = useState(null);

  useEffect(() => {
    dealService.getById(id)
      .then((d) => setDeal(d))
      .catch(() => {
        toast("Deal not found", "error");
        navigate("/admin/deals");
      })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const defaultValues = useMemo(() => {
    if (!deal) return undefined;

    return {
      title: deal.title || "",
      description: deal.description || "",
      startDate: deal.startDate ? new Date(deal.startDate).toISOString().slice(0, 16) : "",
      endDate: deal.endDate ? new Date(deal.endDate).toISOString().slice(0, 16) : "",
      products: Array.isArray(deal.products) ? deal.products : [],
      prebuiltPCs: Array.isArray(deal.prebuiltPCs) ? deal.prebuiltPCs : [],
      promotion: {
        topBar: {
          enabled: deal.promotion?.topBar?.enabled ?? false,
          text: deal.promotion?.topBar?.text || "",
        },
        homeOffer: {
          enabled: deal.promotion?.homeOffer?.enabled ?? false,
          title: deal.promotion?.homeOffer?.title || "",
          description: deal.promotion?.homeOffer?.description || "",
        },
      },
    };
  }, [deal]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        products: (data.products || []).map((p) => p.id || p._id),
        prebuiltPCs: (data.prebuiltPCs || []).map((p) => p.id || p._id),
      };

      await dealService.update(id, payload);
      toast("Deal updated successfully");
      navigate("/admin/deals");
    } catch (err) {
      toast(extractError(err, "Failed to update deal"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (!deal) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/deals")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>Edit Deal</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>{deal.title}</Typography>
        </Box>
      </Box>
      <DealForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel="Update Deal"
      />
    </Box>
  );
};

export default DealEdit;
