import { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert as MuiAlert, Box } from "@mui/material";

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

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
      <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 2000, display: "flex", flexDirection: "column", gap: 1 }}>
        {toasts.map((t) => (
          <Snackbar
            key={t.id}
            open
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            sx={{ position: "static" }}
          >
            <MuiAlert
              severity={t.severity}
              onClose={() => removeToast(t.id)}
              variant="filled"
              sx={{
                borderRadius: "var(--radius-admin-card)",
                boxShadow: "var(--shadow-admin-modal)",
                minWidth: 300,
              }}
            >
              {t.message}
            </MuiAlert>
          </Snackbar>
        ))}
      </Box>
    </ToastContext.Provider>
  );
};
