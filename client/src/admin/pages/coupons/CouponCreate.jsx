import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import CouponForm from "../../components/forms/CouponForm";
import { couponService } from "../../services/couponService";
import { categoryService } from "../../services/categoryService";
import { productService } from "../../services/productService";
import { prebuiltService } from "../../services/prebuiltService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import { extractError } from "../../utils/extractError";

const CouponCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [prebuiltPcs, setPrebuiltPcs] = useState([]);

  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
      productService.list({ pageSize: 1000 }),
      prebuiltService.list({ pageSize: 1000 }),
    ]).then(([cats, prods, prebuilt]) => {
      setCategories(cats);
      setProducts(prods.data || []);
      setPrebuiltPcs(prebuilt.data || []);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await couponService.create(data);
      toast("Coupon created");
      navigate("/admin/coupons");
    } catch (err) {
      toast(extractError(err, "Failed to create coupon"), "error");
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
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2, fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.5rem" } }}>New Coupon</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Create a new discount coupon</Typography>
        </Box>
      </Box>
      <CouponForm onSubmit={handleSubmit} loading={loading} products={products} categories={categories} prebuiltPcs={prebuiltPcs} />
    </Box>
  );
};

export default CouponCreate;
