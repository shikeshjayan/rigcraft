import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import CouponForm from "../../components/forms/CouponForm";
import { couponService } from "../../services/couponService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";

const CouponCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await couponService.create(data);
      toast("Coupon created");
      navigate("/admin/coupons");
    } catch {
      toast("Failed to create", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/coupons")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>New Coupon</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Create a new discount coupon</Typography>
        </Box>
      </Box>
      <CouponForm onSubmit={handleSubmit} loading={loading} />
    </Box>
  );
};

export default CouponCreate;
