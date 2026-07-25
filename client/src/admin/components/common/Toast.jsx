import { createContext, useContext, useState, useCallback } from "react";
import { Box } from "@mui/material";
import { CheckCircle, Error as ErrorIcon, Warning, Info } from "@mui/icons-material";

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const ICONS = {
  success: <CheckCircle sx={{ fontSize: 20, color: "var(--color-admin-success)" }} />,
  error: <ErrorIcon sx={{ fontSize: 20, color: "var(--color-admin-danger)" }} />,
  warning: <Warning sx={{ fontSize: 20, color: "var(--color-admin-warning)" }} />,
  info: <Info sx={{ fontSize: 20, color: "var(--color-admin-info)" }} />,
};

const BG_COLORS = {
  success: "var(--color-admin-success-bg)",
  error: "var(--color-admin-danger-bg)",
  warning: "var(--color-admin-warning-bg)",
  info: "var(--color-admin-info-bg)",
};

const BORDER_COLORS = {
  success: "var(--color-admin-success-border)",
  error: "var(--color-admin-danger-border)",
  warning: "var(--color-admin-warning-border)",
  info: "var(--color-admin-info-border)",
};

const ToastItem = ({ message, severity = "success", onClose, style }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 shadow-lg animate-admin-scale-in"
    style={{
      borderRadius: "var(--radius-admin-card)",
      backgroundColor: BG_COLORS[severity],
      border: `1px solid ${BORDER_COLORS[severity]}`,
      minWidth: 320,
      maxWidth: 420,
      ...style,
    }}
  >
    {ICONS[severity]}
    <span
      className="text-sm font-bold flex-1"
      style={{
        color: severity === "success" ? "var(--color-admin-success-text)"
          : severity === "error" ? "var(--color-admin-danger-text)"
          : severity === "warning" ? "var(--color-admin-warning-text)"
          : "var(--color-admin-info-text)",
      }}
    >
      {message}
    </span>
    <button
      onClick={onClose}
      className="text-sm font-bold cursor-pointer"
      style={{
        color: severity === "success" ? "var(--color-admin-success-text)"
          : severity === "error" ? "var(--color-admin-danger-text)"
          : severity === "warning" ? "var(--color-admin-warning-text)"
          : "var(--color-admin-info-text)",
        opacity: 0.6,
        background: "none",
        border: "none",
      }}
    >
      ✕
    </button>
  </div>
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, severity = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, severity }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          alignItems: "center",
        }}
      >
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            message={t.message}
            severity={t.severity}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </Box>
    </ToastContext.Provider>
  );
};
