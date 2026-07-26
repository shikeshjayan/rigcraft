import { useState } from "react";
import { Box, Typography, Grid, Avatar } from "@mui/material";
import AdminInput from "../../components/common/Input";
import AdminButton from "../../components/common/Button";
import ImageUpload from "../../components/common/ImageUpload";
import { useToast } from "../../components/common/Toast";
import useAuthStore from "../../store/authStore";

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState([]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast("Profile updated");
    setSaving(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2 }}>Profile</Typography>
          <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)", fontWeight: 500, mt: 0.25 }}>Manage your account settings</Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ textAlign: "center", p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Avatar src={user?.avatar || ""} sx={{ width: 100, height: 100, mx: "auto", mb: 2, fontSize: 36, fontWeight: 800, background: "linear-gradient(135deg, var(--color-admin-primary) 0%, var(--color-admin-primary-light) 100%)" }}>
              {user?.name?.charAt(0)}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--color-admin-text)" }}>{user?.name}</Typography>
            <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", mb: 2 }}>{user?.email}</Typography>
            <ImageUpload images={avatar} onChange={setAvatar} maxFiles={1} multiple={false} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>Account Information</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="Full Name" defaultValue={user?.name} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="Email" defaultValue={user?.email} disabled />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="Password" type="password" placeholder="Leave blank to keep current" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="Confirm Password" type="password" placeholder="Confirm new password" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ pt: 2 }}>
                  <AdminButton variant="primary" onClick={handleSave} loading={saving}>Save Changes</AdminButton>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
