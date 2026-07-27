import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import CategoryForm from "../../components/forms/CategoryForm";
import { categoryService } from "../../services/categoryService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import { extractError } from "../../utils/extractError";
import Loading from "../../components/common/Loading";

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [cat, all] = await Promise.all([
          categoryService.getById(id),
          categoryService.getAll(),
        ]);
        setCategory(cat);
        setCategories(all);
      } catch (err) {
        toast(extractError(err, "Category not found"), "error");
        navigate("/admin/categories");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate, toast]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, parentId: data.parentId || null };
      if (payload.image?.file) payload.image = payload.image.file;
      await categoryService.update(id, payload);
      toast("Category updated successfully");
      navigate("/admin/categories");
    } catch (err) {
      toast(extractError(err, "Failed to update category"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/categories")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>Edit Category</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>{category.name}</Typography>
        </Box>
      </Box>
      <CategoryForm
        defaultValues={category}
        onSubmit={handleSubmit}
        loading={saving}
        categories={categories}
        submitLabel="Update Category"
      />
    </Box>
  );
};

export default CategoryEdit;
