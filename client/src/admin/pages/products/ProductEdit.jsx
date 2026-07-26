import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import ProductForm from "../../components/forms/ProductForm";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { brandService } from "../../services/brandService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import Loading from "../../components/common/Loading";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      productService.getById(id),
      categoryService.getAll(),
      brandService.getAll(),
    ])
      .then(([prod, cats, brds]) => { setProduct(prod); setCategories(cats); setBrands(brds); })
      .catch(() => { toast("Product not found", "error"); navigate("/admin/products"); })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, comparePrice: data.comparePrice || null, costPrice: data.costPrice || null };
      await productService.update(id, payload);
      toast("Product updated successfully");
      navigate("/admin/products");
    } catch {
      toast("Failed to update product", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/products")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>Edit Product</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>{product.name}</Typography>
        </Box>
      </Box>
      <ProductForm defaultValues={product} onSubmit={handleSubmit} loading={saving} categories={categories} brands={brands} submitLabel="Update Product" />
    </Box>
  );
};

export default ProductEdit;
