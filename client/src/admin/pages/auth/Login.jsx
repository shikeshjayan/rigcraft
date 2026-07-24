import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
} from "@mui/icons-material";
import useAuthStore from "../../store/authStore";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/admin/dashboard");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-admin-primary flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            RC
          </div>
          <h1 className="text-2xl font-bold text-admin-text">
            Welcome to RigCraft
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Sign in to your admin account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-admin-card rounded-admin-card p-8 shadow-admin-card"
        >
          {error && (
            <div className="mb-4 p-3 rounded-admin-badge bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined
                        sx={{ color: "var(--color-admin-muted)", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "var(--radius-admin-input)",
                },
              }}
              required
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined
                        sx={{ color: "var(--color-admin-muted)", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "var(--radius-admin-input)",
                },
              }}
              required
            />
          </div>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius: "var(--radius-admin-button)",
              backgroundColor: "var(--color-admin-primary)",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9375rem",
              "&:hover": {
                backgroundColor: "var(--color-admin-primary-hover)",
              },
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center mt-6 text-xs text-admin-muted">
          RigCraft Admin Panel v1.0
        </p>
      </div>
    </div>
  );
};

export default Login;
