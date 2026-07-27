const STATUS_COLORS = {
  success: { bg: "var(--color-admin-success-bg)", text: "var(--color-admin-success-text)", border: "var(--color-admin-success-border)" },
  warning: { bg: "var(--color-admin-warning-bg)", text: "var(--color-admin-warning-text)", border: "var(--color-admin-warning-border)" },
  error: { bg: "var(--color-admin-danger-bg)", text: "var(--color-admin-danger-text)", border: "var(--color-admin-danger-border)" },
  info: { bg: "var(--color-admin-info-bg)", text: "var(--color-admin-info-text)", border: "var(--color-admin-info-border)" },
  primary: { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" },
  muted: { bg: "var(--color-admin-bg-tertiary)", text: "var(--color-admin-text-secondary)", border: "var(--color-admin-border)" },
};

const StatusBadge = ({ label, color = "muted", size = "small", status, colorMap }) => {
  const displayLabel = label || status || "";
  const displayColor = colorMap ? (colorMap[status] || "muted") : color;
  const colors = STATUS_COLORS[displayColor] || STATUS_COLORS.muted;

  return (
    <span
      className="font-bold uppercase tracking-wider inline-block"
      style={{
        fontSize: size === "small" ? "10px" : "11px",
        padding: size === "small" ? "2px 8px" : "3px 10px",
        borderRadius: "var(--radius-admin-badge)",
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        lineHeight: 1.5,
      }}
    >
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
