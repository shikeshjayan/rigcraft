import { useState, useEffect } from "react";
import { Box, Typography, Grid, Tabs, Tab, Switch as MuiSwitch } from "@mui/material";
import AdminInput from "../../components/common/Input";
import AdminButton from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { settingsService } from "../../services/settingsService";

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

const Settings = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    address: "",
    maintenanceMode: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.get();
        setSettings({
          storeName: data.storeName || "",
          storeEmail: data.storeEmail || "",
          storePhone: data.storePhone || "",
          address: data.address || "",
          maintenanceMode: data.maintenanceMode || false,
        });
      } catch {
        toast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.update(settings);
      toast("Settings saved");
    } catch {
      toast("Failed to save settings", "error");
    } finally {
      setSaving(false);
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
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3} maxWidth={600}>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Store Name" value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Store Email" value={settings.storeEmail} onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Store Phone" value={settings.storePhone} onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Address" multiline rows={2} value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: "var(--color-admin-text)" }}>Maintenance Mode</Typography>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>Disable public access to the store</Typography>
              </Box>
              <MuiSwitch checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminButton variant="primary" onClick={handleSave} loading={saving}>Save Settings</AdminButton>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Typography variant="body2" sx={{ color: "var(--color-admin-muted)" }}>Store configuration options coming soon.</Typography>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Typography variant="body2" sx={{ color: "var(--color-admin-muted)" }}>Shipping settings coming soon.</Typography>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Typography variant="body2" sx={{ color: "var(--color-admin-muted)" }}>Notification settings coming soon.</Typography>
      </TabPanel>
    </Box>
  );
};

export default Settings;
