import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import ProductForm from "../../components/forms/ProductForm";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { brandService } from "../../services/brandService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import { extractError } from "../../utils/extractError";

const ProductCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([categoryService.getAll(), brandService.getAll()])
      .then(([cats, brds]) => { setCategories(cats); setBrands(brds); })
      .catch(() => toast("Failed to load form data", "error"))
      .finally(() => setFetching(false));
  }, [toast]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, comparePrice: data.comparePrice || null, costPrice: data.costPrice || null };
      payload.images = payload.images?.map((img) => img.file).filter(Boolean) || [];
      await productService.create(payload);
      toast("Product created successfully");
      navigate("/admin/products");
    } catch (err) {
      toast(extractError(err, "Failed to create product"), "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/products")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>New Product</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Add a new product to your catalog</Typography>
        </Box>
      </Box>
      <ProductForm onSubmit={handleSubmit} loading={loading} categories={categories} brands={brands} submitLabel="Create Product" />
    </Box>
  );
};

export default ProductCreate;
