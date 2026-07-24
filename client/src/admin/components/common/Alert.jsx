import { Alert as MuiAlert, AlertTitle } from "@mui/material";

const severityStyles = {
  success: { bg: "#dcfce7", border: "#bbf7d0", color: "#166534" },
  warning: { bg: "#fef3c7", border: "#fde68a", color: "#92400e" },
  error: { bg: "#fee2e2", border: "#fecaca", color: "#991b1b" },
  info: { bg: "#dbeafe", border: "#bfdbfe", color: "#1e40af" },
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
