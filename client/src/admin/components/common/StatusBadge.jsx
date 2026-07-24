import { Chip } from "@mui/material";

const STATUS_COLORS = {
  success: { bg: "var(--color-admin-success-bg)", text: "var(--color-admin-success-text)" },
  warning: { bg: "var(--color-admin-warning-bg)", text: "var(--color-admin-warning-text)" },
  error: { bg: "var(--color-admin-danger-bg)", text: "var(--color-admin-danger-text)" },
  info: { bg: "var(--color-admin-info-bg)", text: "var(--color-admin-info-text)" },
  primary: { bg: "#eef2ff", text: "#4338ca" },
  muted: { bg: "var(--color-admin-bg-tertiary)", text: "var(--color-admin-text-secondary)" },
};

const StatusBadge = ({ label, color = "muted", size = "small", status, colorMap }) => {
  const displayLabel = label || status || "";
  const displayColor = colorMap ? (colorMap[status] || "muted") : color;
  const colors = STATUS_COLORS[displayColor] || STATUS_COLORS.muted;

  return (
    <Chip
      label={displayLabel}
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
