import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import BundleForm from "../../components/forms/BundleForm";
import { bundleService } from "../../services/bundleService";
import { productService } from "../../services/productService";
import { prebuiltService } from "../../services/prebuiltService";
import { useToast } from "../../components/common/Toast";
import AdminButton from "../../components/common/Button";
import { extractError } from "../../utils/extractError";
import Loading from "../../components/common/Loading";

const BundleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [prebuiltPcs, setPrebuiltPcs] = useState([]);

  useEffect(() => {
    Promise.all([
      bundleService.getById(id),
      productService.list({ pageSize: 1000 }),
      prebuiltService.list({ pageSize: 1000 }),
    ]).then(([bundleData, prods, prebuilt]) => {
      setBundle(bundleData);
      setProducts(prods.data || []);
      setPrebuiltPcs(prebuilt.data || []);
    }).catch(() => {
      toast("Bundle not found", "error");
      navigate("/admin/bundles");
    }).finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data };
      if (payload.image?.file) payload.image = payload.image.file;
      await bundleService.update(id, payload);
      toast("Bundle updated");
      navigate("/admin/bundles");
    } catch (err) {
      toast(extractError(err, "Failed to update bundle"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <AdminButton variant="ghost" size="small" icon={<ArrowBackIcon />} onClick={() => navigate("/admin/bundles")} />
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)", ml: 1, flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2, overflowWrap: "break-word", fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.5rem" } }}>Edit Bundle</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25, overflowWrap: "break-word" }}>{bundle?.name}</Typography>
        </Box>
      </Box>
      <BundleForm defaultValues={bundle} onSubmit={handleSubmit} loading={saving} submitLabel="Update Bundle" products={products} prebuiltPcs={prebuiltPcs} />
    </Box>
  );
};

export default BundleEdit;
