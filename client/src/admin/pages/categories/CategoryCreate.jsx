import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import CategoryForm from "../../components/forms/CategoryForm";
import { categoryService } from "../../services/categoryService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";

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
    } catch {
      toast("Failed to create category", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/categories")} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--color-admin-text)" }}>New Category</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Add a new product category</Typography>
        </Box>
      </Box>
      <CategoryForm onSubmit={handleSubmit} loading={loading} categories={categories} submitLabel="Create Category" />
    </Box>
  );
};

export default CategoryCreate;
