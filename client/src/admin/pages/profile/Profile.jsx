import { useState, useEffect } from "react";
import { Box, Typography, Grid, Avatar } from "@mui/material";
import AdminInput from "../../components/common/Input";
import AdminButton from "../../components/common/Button";
import ImageUpload from "../../components/common/ImageUpload";
import { useToast } from "../../components/common/Toast";
import useAuthStore from "../../store/authStore";
import { authService } from "../../../services/auth.service";
import { extractError } from "../../utils/extractError";

const formatPhoneForDisplay = (val) => {
  const digits = (val || "").replace(/[^0-9]/g, "").replace(/^91/, "");
  return digits ? `+91 ${digits}` : "";
};

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatar, setAvatar] = useState([]);

  const [name, setName] = useState(
    user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || ''
  );
  const [phone, setPhone] = useState(formatPhoneForDisplay(user?.phone));
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let active = true;
    authService
      .getProfile()
      .then((res) => {
        if (!active || !res?.data) return;
        const fresh = res.data;
        const fullName = fresh.name || [fresh.firstName, fresh.lastName].filter(Boolean).join(' ') || "";
        setUser({ ...useAuthStore.getState().user, ...fresh, name: fullName, phone: fresh.phone || "" });
        setName(fullName);
        setPhone(formatPhoneForDisplay(fresh.phone));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [setUser]);

  const splitName = (fullName) => {
    const parts = (fullName || "").trim().split(/\s+/);
    return {
      firstName: parts[0] || "",
      ...(parts.length > 1 ? { lastName: parts.slice(1).join(" ") } : {}),
    };
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, "").replace(/^91/, "");
    setPhone(digits ? `+91 ${digits}` : "");
  };

  const handleSaveProfile = async () => {
    if (phone && !/^\+91\d{10}$/.test(phone.replace(/\s/g, ""))) {
      toast("Please enter a valid mobile number", "error");
      return;
    }
    setSaving(true);
    try {
      const { firstName, lastName } = splitName(name);
      const payload = { firstName, lastName, phone: phone.replace(/\s/g, "") };
      if (avatar.length > 0) {
        const fd = new FormData();
        fd.append("avatar", avatar[0]);
        fd.append("body", JSON.stringify(payload));
        const res = await authService.updateProfile(fd);
        setUser({ ...user, ...res.data });
      } else {
        const res = await authService.updateProfile(payload);
        setUser({ ...user, ...res.data });
      }
      toast("Profile updated");
    } catch (err) {
      toast(extractError(err, "Failed to update profile"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast("Password changed");
    } catch (err) {
      toast(extractError(err, "Failed to change password"), "error");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ width: 4, height: 24, borderRadius: 2, backgroundColor: "var(--color-admin-primary)" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-admin-text)", lineHeight: 1.2, fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.5rem" } }}>Profile</Typography>
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
          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>Account Information</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="Email" value={user?.email} disabled />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="Phone Number" value={phone} onChange={handlePhoneChange} placeholder="+91 98765 43210" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} />
              <Grid size={{ xs: 12 }}>
                <AdminButton variant="primary" onClick={handleSaveProfile} loading={saving}>Save Profile</AdminButton>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>Change Password</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} />
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AdminInput label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <AdminButton variant="primary" onClick={handleChangePassword} loading={changingPassword}>Change Password</AdminButton>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
