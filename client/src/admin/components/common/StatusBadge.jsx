import { Chip } from "@mui/material";

const STATUS_COLORS = {
  success: { bg: "#dcfce7", text: "#166534" },
  warning: { bg: "#fef3c7", text: "#92400e" },
  error: { bg: "#fee2e2", text: "#991b1b" },
  info: { bg: "#dbeafe", text: "#1e40af" },
  primary: { bg: "#eef2ff", text: "#4338ca" },
  muted: { bg: "#f1f5f9", text: "#475569" },
};

const StatusBadge = ({ label, color = "muted", size = "small" }) => {
  const colors = STATUS_COLORS[color] || STATUS_COLORS.muted;

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        borderRadius: "var(--radius-admin-badge)",
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 500,
        fontSize: size === "small" ? "0.75rem" : "0.8125rem",
        height: size === "small" ? 24 : 28,
      }}
    />
  );
};

export default StatusBadge;
