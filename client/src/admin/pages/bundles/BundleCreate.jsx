import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import BundleForm from "../../components/forms/BundleForm";
import { bundleService } from "../../services/bundleService";
import { productService } from "../../services/productService";
import { prebuiltService } from "../../services/prebuiltService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import { extractError } from "../../utils/extractError";

const BundleCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [prebuiltPcs, setPrebuiltPcs] = useState([]);

  useEffect(() => {
    Promise.all([
      productService.list({ pageSize: 1000 }),
      prebuiltService.list({ pageSize: 1000 }),
    ]).then(([prods, prebuilt]) => {
      setProducts(prods.data || []);
      setPrebuiltPcs(prebuilt.data || []);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (payload.image?.file) payload.image = payload.image.file;
      await bundleService.create(payload);
      toast("Bundle created");
      navigate("/admin/bundles");
    } catch (err) {
      toast(extractError(err, "Failed to create bundle"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/bundles")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>New Bundle</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Create a combo deal sold at a discounted price</Typography>
        </Box>
      </Box>
      <BundleForm onSubmit={handleSubmit} loading={loading} products={products} prebuiltPcs={prebuiltPcs} />
    </Box>
  );
};

export default BundleCreate;
