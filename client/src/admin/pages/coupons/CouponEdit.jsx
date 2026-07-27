import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import Loading from "../../components/common/Loading";

const CouponEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [prebuiltPcs, setPrebuiltPcs] = useState([]);

  useEffect(() => {
    Promise.all([
      couponService.getById(id),
      categoryService.getAll(),
      productService.list({ pageSize: 1000 }),
      prebuiltService.list({ pageSize: 1000 }),
    ]).then(([couponData, cats, prods, prebuilt]) => {
      setCoupon(couponData);
      setCategories(cats);
      setProducts(prods.data || []);
      setPrebuiltPcs(prebuilt.data || []);
    }).catch(() => { toast("Coupon not found", "error"); navigate("/admin/coupons"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await couponService.update(id, data);
      toast("Coupon updated");
      navigate("/admin/coupons");
    } catch (err) {
      toast(extractError(err, "Failed to update coupon"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/coupons")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>Edit Coupon</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>{coupon.code}</Typography>
        </Box>
      </Box>
      <CouponForm defaultValues={coupon} onSubmit={handleSubmit} loading={saving} submitLabel="Update Coupon" products={products} categories={categories} prebuiltPcs={prebuiltPcs} />
    </Box>
  );
};

export default CouponEdit;
