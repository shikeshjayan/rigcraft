import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  PhoneOutlined,
} from "@mui/icons-material";
import useAuthStore from "../../store/authStore";
import { extractError } from "../../utils/extractError";
import api from "../../../shared/api/axios";
import { ENDPOINTS } from "../../../shared/api/endpoints";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const inputRefs = useRef([]);
  const [loginMethod, setLoginMethod] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const [phone, setPhone] = useState("");
  const [phoneStep, setPhoneStep] = useState("input");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSentTo, setOtpSentTo] = useState("");

  const handleEmailSubmit = async (e) => {
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSendingOtp(true);
    try {
      const res = await api.post(ENDPOINTS.AUTH.LOGIN, { phone });
      setOtpSentTo(res.data?.data?.email || phone);
      setOtp(["", "", "", "", "", ""]);
      setPhoneStep("otp");
    } catch (err) {
      setError(extractError(err, "Failed to send OTP"));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return;
    setError("");
    setLoading(true);
    try {
      await login({ phone, otp: otpString });
      navigate("/admin/dashboard");
    } catch (err) {
      setError(extractError(err, "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  const switchMethod = (method) => {
    setLoginMethod(method);
    setError("");
    setPhoneStep("input");
    setPhone("");
    setOtp(["", "", "", "", "", ""]);
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

            {/* Tab Switcher */}
            <div className="flex mb-6 rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-admin-border)" }}>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${loginMethod === "email" ? "text-white" : "text-gray-500 hover:text-gray-700"}`}
                style={{
                  backgroundColor: loginMethod === "email" ? "var(--color-admin-primary)" : "transparent",
                }}
                onClick={() => switchMethod("email")}
              >
                <EmailOutlined sx={{ fontSize: 16 }} />
                Email
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${loginMethod === "phone" ? "text-white" : "text-gray-500 hover:text-gray-700"}`}
                style={{
                  backgroundColor: loginMethod === "phone" ? "var(--color-admin-primary)" : "transparent",
                }}
                onClick={() => switchMethod("phone")}
              >
                <PhoneOutlined sx={{ fontSize: 16 }} />
                Phone
              </button>
            </div>

            <form onSubmit={loginMethod === "email" ? handleEmailSubmit : (phoneStep === "otp" ? handleVerifyOtp : handleSendOtp)}>
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

              {loginMethod === "email" ? (
                <>
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
                </>
              ) : phoneStep === "input" ? (
                <>
                  <div className="space-y-4">
                    <TextField
                      fullWidth
                      label="Phone Number"
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError(""); }}
                      placeholder="+1 (555) 123-4567"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneOutlined
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
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={sendingOtp || !phone.trim()}
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
                    {sendingOtp ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-center mb-6" style={{ color: "var(--color-admin-text-secondary)" }}>
                    We've sent a 6-digit code to <span className="font-semibold" style={{ color: "var(--color-admin-text)" }}>{otpSentTo}</span>
                  </p>

                  <div className="flex justify-center items-center gap-2 mb-6">
                    {otp.map((digit, index) => (
                      <React.Fragment key={index}>
                        <input
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-11 h-12 text-center text-xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                          style={{
                            borderColor: "var(--color-admin-border)",
                            borderRadius: "var(--radius-admin-input)",
                            color: "var(--color-admin-text)",
                          }}
                        />
                        {index === 2 && <span className="text-gray-300 font-bold mx-0.5">-</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || otp.join("").length !== 6}
                    sx={{
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
                    {loading ? "Verifying..." : "Verify"}
                  </Button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => { setPhoneStep("input"); setError(""); }}
                      className="text-xs font-medium hover:underline cursor-pointer"
                      style={{ color: "var(--color-admin-primary)" }}
                    >
                      Change phone number
                    </button>
                  </div>
                </>
              )}
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
