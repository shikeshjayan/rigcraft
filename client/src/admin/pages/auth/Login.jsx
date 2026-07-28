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
import { extractError } from "../../utils/extractError";

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
    } catch (err) {
      setError(extractError(err, "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "var(--color-admin-bg-primary)" }}
    >
      <div
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(circle, var(--color-admin-primary) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, var(--color-admin-primary) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="w-full max-w-md relative animate-admin-fade-in-up">
        <div className="relative p-[1px]" style={{ borderRadius: "var(--radius-admin-card)" }}>
          <div
            className="absolute inset-0"
            style={{
              borderRadius: "var(--radius-admin-card)",
              background: "linear-gradient(135deg, var(--color-admin-primary) 0%, var(--color-admin-primary-light) 100%)",
            }}
          />
          <div
            className="relative bg-white p-8"
            style={{ margin: 1, borderRadius: 2 }}
          >
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-4 cursor-default animate-admin-float"
                style={{
                  borderRadius: "var(--radius-admin-button)",
                  background: "linear-gradient(135deg, var(--color-admin-primary) 0%, var(--color-admin-primary-light) 100%)",
                }}
              >
                RC
              </div>
              <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-admin-text)" }}>
                Welcome to <span style={{ color: "var(--color-admin-primary)" }}>Rig</span>Craft
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--color-admin-text-secondary)" }}>
                Sign in to your admin account
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  className="mb-4 p-3 text-sm font-medium"
                  style={{
                    borderRadius: "var(--radius-admin-badge)",
                    backgroundColor: "var(--color-admin-danger-bg)",
                    border: "1px solid var(--color-admin-danger-border)",
                    color: "var(--color-admin-danger-text)",
                  }}
                >
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
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  "&:hover": {
                    backgroundColor: "var(--color-admin-primary-hover)",
                  },
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center mt-6 text-xs font-medium" style={{ color: "var(--color-admin-muted)" }}>
          RigCraft Admin Panel v1.0
        </p>
      </div>
    </div>
  );
};

export default Login;
