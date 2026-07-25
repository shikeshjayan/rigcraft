import { useState } from "react";
import { Box, Typography, Grid, Tabs, Tab, Switch as MuiSwitch } from "@mui/material";
import AdminInput from "../../components/common/Input";
import AdminButton from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

const Settings = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast("Settings saved");
    setSaving(false);
  };

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
            <AdminInput label="Store Name" defaultValue="RigCraft" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Store Email" defaultValue="hello@rigcraft.com" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Store Phone" defaultValue="+1 (555) 123-4567" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AdminInput label="Address" multiline rows={2} defaultValue="123 Tech Lane, Silicon Valley, CA" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: "var(--color-admin-text)" }}>Maintenance Mode</Typography>
                <Typography variant="caption" sx={{ color: "var(--color-admin-muted)" }}>Disable public access to the store</Typography>
              </Box>
              <MuiSwitch />
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
