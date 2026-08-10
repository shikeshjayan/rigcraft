import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import CategoryForm from "../../components/forms/CategoryForm";
import { categoryService } from "../../services/categoryService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import { extractError } from "../../utils/extractError";

const CategoryCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, parentId: data.parentId || null };
      if (payload.image?.file) payload.image = payload.image.file;
      await categoryService.create(payload);
      toast("Category created successfully");
      navigate("/admin/categories");
    } catch (err) {
      toast(extractError(err, "Failed to create category"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/categories")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2, fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.5rem" } }}>New Category</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Add a new product category</Typography>
        </Box>
      </Box>
      <CategoryForm onSubmit={handleSubmit} loading={loading} categories={categories} submitLabel="Create Category" />
    </Box>
  );
};

export default CategoryCreate;
