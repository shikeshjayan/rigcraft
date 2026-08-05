import { useState, useEffect, useRef } from "react";
import { Box, Typography, Grid, Tabs, Tab, Switch as MuiSwitch, IconButton } from "@mui/material";
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import AdminInput from "../../components/common/Input";
import AdminButton from "../../components/common/Button";
import AdminSelect from "../../components/common/Select";
import { useToast } from "../../components/common/Toast";
import { settingsService } from "../../services/settingsService";
import { buildService } from "../../services/buildService";
import useSettingsStore from "../../store/settingsStore";
import { extractError } from "../../utils/extractError";

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

const SectionHeader = ({ title, subtitle }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "var(--color-admin-text)" }}>{title}</Typography>
    {subtitle && <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>{subtitle}</Typography>}
  </Box>
);

const SwitchField = ({ label, caption, checked, onChange }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500, color: "var(--color-admin-text)" }}>{label}</Typography>
      {caption && <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>{caption}</Typography>}
    </Box>
    <MuiSwitch checked={checked} onChange={onChange} />
  </Box>
);

const defaultSettings = {
  storeName: "",
  storeEmail: "",
  storePhone: "",
  description: "",
  address: "",
  whatsapp: "",
  logo: null,
  maintenanceMode: false,
  maintenanceMessage: "",
  shipping: { standardRate: 0, freeShippingThreshold: 0, expressRate: 0, estimatedDelivery: "", codAvailable: false },
  tax: { rate: 0.18, name: "", pricesIncludeTax: false },
  payment: { enableRazorpay: true, enableCod: true, minOrderAmount: 0, maxOrderAmount: 0 },
  currency: { code: "INR", symbol: "₹" },
  social: { facebook: "", instagram: "", youtube: "", linkedin: "", twitter: "" },
  seo: { defaultTitle: "", defaultDescription: "", metaKeywords: "" },
  order: { prefix: "RC-", allowCancellation: true, cancellationTimeLimit: 24, cancelPendingAfter: 24 },
  inventory: { lowStockThreshold: 10, allowBackorders: false, hideOutOfStock: false, autoUpdateInventory: true },
  review: { allowReviews: true, verifiedPurchaseOnly: false, autoApprove: false, allowImages: true, maxImages: 5 },
  notification: { orderConfirmation: true, shippingUpdate: true, paymentConfirmation: true, lowStockAlerts: true, newOrderAlerts: true },
};

const mergeDefaults = (defaults, data) => {
  const merged = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (data[key] !== undefined) {
      if (typeof defaults[key] === "object" && defaults[key] !== null && !Array.isArray(defaults[key])) {
        merged[key] = { ...defaults[key], ...data[key] };
      } else {
        merged[key] = data[key];
      }
    }
  }
  return merged;
};

const defaultBuilderSettings = {
  enabled: true,
  assemblyFeeEnabled: false,
  assemblyFeeType: "percent",
  assemblyFeeValue: 0.5,
  requireCompleteBuild: true,
};

const Settings = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [builderSettings, setBuilderSettings] = useState(defaultBuilderSettings);
  const [builderSaving, setBuilderSaving] = useState(false);
  const [builderLoading, setBuilderLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.get();
        setSettings(mergeDefaults(defaultSettings, data));
      } catch (err) {
        toast(extractError(err, "Failed to load settings"), "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchBuilderSettings = async () => {
      try {
        const data = await buildService.getSettings();
        setBuilderSettings({ ...defaultBuilderSettings, ...data });
      } catch (err) {
        toast(extractError(err, "Failed to load builder settings"), "error");
      } finally {
        setBuilderLoading(false);
      }
    };
    fetchBuilderSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.update(settings);
      toast("Settings saved");
    } catch (err) {
      toast(extractError(err, "Failed to save settings"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleBuilderSave = async () => {
    setBuilderSaving(true);
    try {
      await buildService.updateSettings(builderSettings);
      toast("Builder settings saved");
    } catch (err) {
      toast(extractError(err, "Failed to save builder settings"), "error");
    } finally {
      setBuilderSaving(false);
    }
  };

  const handleBuilderNestedChange = (field, value) => {
    setBuilderSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const updated = await settingsService.uploadLogo(file);
      setSettings(prev => ({ ...prev, logo: updated.logo }));
      useSettingsStore.getState().setBrand(updated.storeName || "RigCraft", updated.logo?.url ? updated.logo : null);
      toast("Logo uploaded");
    } catch (err) {
      toast(extractError(err, "Failed to upload logo"), "error");
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogoRemove = async () => {
    setLogoUploading(true);
    try {
      const updated = await settingsService.deleteLogo();
      setSettings(prev => ({ ...prev, logo: updated.logo }));
      useSettingsStore.getState().setBrand("RigCraft", null);
      toast("Logo removed");
    } catch (err) {
      toast(extractError(err, "Failed to remove logo"), "error");
    } finally {
      setLogoUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", pt: 8 }}>
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>Settings</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Manage your store configuration</Typography>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid var(--color-admin-border)", "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: "0.875rem", color: "var(--color-admin-text-secondary)", "&.Mui-selected": { color: "var(--color-admin-primary)" } }, "& .MuiTabs-indicator": { backgroundColor: "var(--color-admin-primary)" } }}>
        <Tab label="General" />
        <Tab label="Store" />
        <Tab label="Shipping" />
        <Tab label="Notifications" />
        <Tab label="PC Builder" />
      </Tabs>

      {/* ── General Tab ── */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3} maxWidth={600}>
          <Grid size={{ xs: 12 }}>
            <SectionHeader title="Store Identity" subtitle="Basic information about your store" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Box sx={{ width: 100, height: 100, borderRadius: "var(--radius-admin-button)", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--color-admin-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-admin-border)" }}>
                {logoUploading ? (
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                ) : settings.logo?.url ? (
                  <img src={settings.logo.url} alt="Store Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <CloudUploadIcon sx={{ fontSize: 32, color: "var(--color-admin-muted)" }} />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-admin-text)", mb: 0.5 }}>Store Logo</Typography>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)", display: "block", mb: 1.5 }}>JPG, PNG or WEBP. Recommended size: 200x200px.</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <AdminButton variant="outline" size="small" onClick={() => fileInputRef.current?.click()} disabled={logoUploading}>
                    {settings.logo?.url ? "Change" : "Upload"}
                  </AdminButton>
                  {settings.logo?.url && (
                    <IconButton size="small" onClick={handleLogoRemove} disabled={logoUploading} sx={{ color: "var(--color-admin-danger)" }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
              <input type="file" accept="image/jpeg,image/png,image/webp" hidden ref={fileInputRef} onChange={handleLogoUpload} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Store Name" value={settings.storeName} onChange={(e) => handleChange("storeName", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Store Email" value={settings.storeEmail} onChange={(e) => handleChange("storeEmail", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Phone Number" value={settings.storePhone} onChange={(e) => handleChange("storePhone", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="WhatsApp Number" value={settings.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Store Description" multiline rows={2} value={settings.description} onChange={(e) => handleChange("description", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Address" multiline rows={2} value={settings.address} onChange={(e) => handleChange("address", e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader title="Maintenance" subtitle="Control public access to your store" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SwitchField
              label="Maintenance Mode"
              caption="Disable public access to the store"
              checked={settings.maintenanceMode}
              onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
            />
          </Grid>
          {settings.maintenanceMode && (
            <Grid size={{ xs: 12 }}>
              <AdminInput label="Maintenance Message" value={settings.maintenanceMessage} onChange={(e) => handleChange("maintenanceMessage", e.target.value)} />
            </Grid>
          )}

          <Grid size={{ xs: 12, mt: 2 }}>
            <AdminButton variant="primary" onClick={handleSave} loading={saving}>Save Settings</AdminButton>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ── Store Tab ── */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={3} maxWidth={600}>
          <Grid size={{ xs: 12 }}>
            <SectionHeader title="Social Links" subtitle="Connect your social media profiles" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Facebook URL" value={settings.social.facebook} onChange={(e) => handleNestedChange("social", "facebook", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Instagram URL" value={settings.social.instagram} onChange={(e) => handleNestedChange("social", "instagram", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="YouTube URL" value={settings.social.youtube} onChange={(e) => handleNestedChange("social", "youtube", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="LinkedIn URL" value={settings.social.linkedin} onChange={(e) => handleNestedChange("social", "linkedin", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Twitter URL" value={settings.social.twitter} onChange={(e) => handleNestedChange("social", "twitter", e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader title="Tax" subtitle="Tax rate and preferences" />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <AdminInput label="Tax Name" value={settings.tax.name} onChange={(e) => handleNestedChange("tax", "name", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <AdminInput label="Tax Rate (0–1)" type="number" inputProps={{ min: 0, max: 1, step: 0.01 }} value={settings.tax.rate} onChange={(e) => handleNestedChange("tax", "rate", Number(e.target.value))} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SwitchField
              label="Prices Include Tax"
              checked={settings.tax.pricesIncludeTax}
              onChange={(e) => handleNestedChange("tax", "pricesIncludeTax", e.target.checked)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ height: 1, backgroundColor: "var(--color-admin-border)", my: 1 }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SectionHeader title="Payment" subtitle="Payment gateway configuration" />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <SwitchField
              label="Razorpay"
              checked={settings.payment.enableRazorpay}
              onChange={(e) => handleNestedChange("payment", "enableRazorpay", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <SwitchField
              label="Cash on Delivery"
              checked={settings.payment.enableCod}
              onChange={(e) => handleNestedChange("payment", "enableCod", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <AdminInput label="Min Order Amount" type="number" value={settings.payment.minOrderAmount} onChange={(e) => handleNestedChange("payment", "minOrderAmount", Number(e.target.value))} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <AdminInput label="Max Order Amount" type="number" value={settings.payment.maxOrderAmount} onChange={(e) => handleNestedChange("payment", "maxOrderAmount", Number(e.target.value))} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionHeader title="Reviews" subtitle="Product review settings" />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <SwitchField
              label="Allow Reviews"
              checked={settings.review.allowReviews}
              onChange={(e) => handleNestedChange("review", "allowReviews", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <SwitchField
              label="Verified Purchase Only"
              checked={settings.review.verifiedPurchaseOnly}
              onChange={(e) => handleNestedChange("review", "verifiedPurchaseOnly", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <SwitchField
              label="Auto Approve"
              checked={settings.review.autoApprove}
              onChange={(e) => handleNestedChange("review", "autoApprove", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <SwitchField
              label="Allow Images"
              checked={settings.review.allowImages}
              onChange={(e) => handleNestedChange("review", "allowImages", e.target.checked)}
            />
          </Grid>
          {settings.review.allowImages && (
            <Grid size={{ xs: 6 }}>
              <AdminInput label="Max Images per Review" type="number" value={settings.review.maxImages} onChange={(e) => handleNestedChange("review", "maxImages", Number(e.target.value))} inputProps={{ min: 1, max: 10 }} />
            </Grid>
          )}

          <Grid size={{ xs: 12, mt: 2 }}>
            <AdminButton variant="primary" onClick={handleSave} loading={saving}>Save Settings</AdminButton>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ── Shipping Tab ── */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={3} maxWidth={600}>
          <Grid size={{ xs: 12 }}>
            <SectionHeader title="Shipping Rates" subtitle="Configure shipping costs and thresholds" />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <AdminInput label="Standard Rate (₹)" type="number" value={settings.shipping.standardRate} onChange={(e) => handleNestedChange("shipping", "standardRate", Number(e.target.value))} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <AdminInput label="Express Rate (₹)" type="number" value={settings.shipping.expressRate} onChange={(e) => handleNestedChange("shipping", "expressRate", Number(e.target.value))} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Free Shipping Threshold (₹)" type="number" value={settings.shipping.freeShippingThreshold} onChange={(e) => handleNestedChange("shipping", "freeShippingThreshold", Number(e.target.value))} helperText="Orders above this amount get free shipping" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Estimated Delivery Time" value={settings.shipping.estimatedDelivery} onChange={(e) => handleNestedChange("shipping", "estimatedDelivery", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SwitchField
              label="Cash on Delivery Available"
              caption="Enable COD payment option"
              checked={settings.shipping.codAvailable}
              onChange={(e) => handleNestedChange("shipping", "codAvailable", e.target.checked)}
            />
          </Grid>

          <Grid size={{ xs: 12, mt: 2 }}>
            <AdminButton variant="primary" onClick={handleSave} loading={saving}>Save Settings</AdminButton>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ── Notifications Tab ── */}
      <TabPanel value={tab} index={3}>
        <Grid container spacing={3} maxWidth={600}>
          <Grid size={{ xs: 12 }}>
            <SectionHeader title="Customer Notifications" subtitle="Automatic emails sent to customers" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SwitchField
              label="Order Confirmation"
              caption="Send confirmation email when an order is placed"
              checked={settings.notification.orderConfirmation}
              onChange={(e) => handleNestedChange("notification", "orderConfirmation", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SwitchField
              label="Shipping Update"
              caption="Send notification when an order ships"
              checked={settings.notification.shippingUpdate}
              onChange={(e) => handleNestedChange("notification", "shippingUpdate", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SwitchField
              label="Payment Confirmation"
              caption="Send notification on successful payment"
              checked={settings.notification.paymentConfirmation}
              onChange={(e) => handleNestedChange("notification", "paymentConfirmation", e.target.checked)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ height: 1, backgroundColor: "var(--color-admin-border)", my: 1 }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SectionHeader title="Admin Alerts" subtitle="Internal alerts for store administrators" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SwitchField
              label="Low Stock Alerts"
              caption="Notify admin when product inventory is low"
              checked={settings.notification.lowStockAlerts}
              onChange={(e) => handleNestedChange("notification", "lowStockAlerts", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SwitchField
              label="New Order Alerts"
              caption="Notify admin when a new order is placed"
              checked={settings.notification.newOrderAlerts}
              onChange={(e) => handleNestedChange("notification", "newOrderAlerts", e.target.checked)}
            />
          </Grid>

          <Grid size={{ xs: 12, mt: 2 }}>
            <AdminButton variant="primary" onClick={handleSave} loading={saving}>Save Settings</AdminButton>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ── PC Builder Tab ── */}
      <TabPanel value={tab} index={4}>
        {builderLoading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
          </Box>
        ) : (
          <Grid container spacing={3} maxWidth={600}>
            <Grid size={{ xs: 12 }}>
              <SectionHeader title="Assembly Fee" subtitle="Extra charge applied when a customer selects 'Completely Assembled' in the PC Builder" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <SwitchField
                label="Charge Assembly Fee"
                caption="Add an assembly fee to assembled custom builds"
                checked={builderSettings.assemblyFeeEnabled}
                onChange={(e) => handleBuilderNestedChange("assemblyFeeEnabled", e.target.checked)}
              />
            </Grid>
            {builderSettings.assemblyFeeEnabled && (
              <>
                <Grid size={{ xs: 6 }}>
                  <AdminSelect
                    label="Fee Type"
                    options={[
                      { value: "percent", label: "Percentage (%)" },
                      { value: "fixed", label: "Fixed amount (₹)" },
                    ]}
                    value={builderSettings.assemblyFeeType}
                    onChange={(e) => handleBuilderNestedChange("assemblyFeeType", e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <AdminInput
                    label={builderSettings.assemblyFeeType === "percent" ? "Fee (%)" : "Fee (₹)"}
                    type="number"
                    value={builderSettings.assemblyFeeValue}
                    onChange={(e) => handleBuilderNestedChange("assemblyFeeValue", Number(e.target.value))}
                    inputProps={{ min: 0, step: builderSettings.assemblyFeeType === "percent" ? 0.01 : 1 }}
                    helperText={builderSettings.assemblyFeeType === "percent" ? "Percent of component price" : "Flat fee in rupees"}
                  />
                </Grid>
              </>
            )}

            <Grid size={{ xs: 12 }}>
              <Box sx={{ height: 1, backgroundColor: "var(--color-admin-border)", my: 1 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <SectionHeader title="Build Validation" subtitle="Rules applied when customers save a custom build" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <SwitchField
                label="Require Complete Build"
                caption="Block saving builds that are missing required components (CPU, Motherboard, RAM, PSU, Case — GPU only when your CPU needs it)"
                checked={builderSettings.requireCompleteBuild}
                onChange={(e) => handleBuilderNestedChange("requireCompleteBuild", e.target.checked)}
              />
            </Grid>

            <Grid size={{ xs: 12, mt: 2 }}>
              <AdminButton variant="primary" onClick={handleBuilderSave} loading={builderSaving}>Save Builder Settings</AdminButton>
            </Grid>
          </Grid>
        )}
      </TabPanel>
    </Box>
  );
};

export default Settings;
