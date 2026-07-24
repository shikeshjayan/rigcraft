import { Alert as MuiAlert, AlertTitle } from "@mui/material";

const severityStyles = {
  success: { bg: "var(--color-admin-success-bg)", border: "var(--color-admin-success-border)", color: "var(--color-admin-success-text)" },
  warning: { bg: "var(--color-admin-warning-bg)", border: "var(--color-admin-warning-border)", color: "var(--color-admin-warning-text)" },
  error: { bg: "var(--color-admin-danger-bg)", border: "var(--color-admin-danger-border)", color: "var(--color-admin-danger-text)" },
  info: { bg: "var(--color-admin-info-bg)", border: "var(--color-admin-info-border)", color: "var(--color-admin-info-text)" },
};

const AdminAlert = ({ severity = "info", title, children, onClose, sx }) => {
  const style = severityStyles[severity] || severityStyles.info;

  return (
    <MuiAlert
      severity={severity}
      onClose={onClose}
      sx={{
        borderRadius: "var(--radius-admin-card)",
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        "& .MuiAlert-icon": { color: style.color },
        ...sx,
      }}
    >
      {title && <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
};

export default AdminAlert;
