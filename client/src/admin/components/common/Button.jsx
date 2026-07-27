import { Button as MuiButton, CircularProgress } from "@mui/material";

const variants = {
  primary: {
    bg: "var(--color-admin-primary)",
    hover: "var(--color-admin-primary-hover)",
    color: "var(--color-admin-white)",
    border: "none",
  },
  secondary: {
    bg: "var(--color-admin-bg-tertiary)",
    hover: "var(--color-admin-border)",
    color: "var(--color-admin-text)",
    border: "1px solid var(--color-admin-border)",
  },
  danger: {
    bg: "var(--color-admin-danger)",
    hover: "var(--color-admin-danger-hover)",
    color: "var(--color-admin-white)",
    border: "none",
  },
  success: {
    bg: "var(--color-admin-success)",
    hover: "var(--color-admin-success-hover)",
    color: "var(--color-admin-white)",
    border: "none",
  },
  ghost: {
    bg: "transparent",
    hover: "var(--color-admin-bg-tertiary)",
    color: "var(--color-admin-text-secondary)",
    border: "none",
  },
};

const sizes = {
  small: { py: 0.5, px: 1.5, fontSize: "0.75rem" },
  medium: { py: 1, px: 2.5, fontSize: "0.875rem" },
  large: { py: 1.5, px: 4, fontSize: "1rem" },
};

const AdminButton = ({
  variant = "primary",
  size = "medium",
  loading = false,
  icon,
  children,
  fullWidth,
  sx,
  ...props
}) => {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.medium;

  return (
    <MuiButton
      disableElevation
      startIcon={!loading && icon ? icon : undefined}
      fullWidth={fullWidth}
      sx={{
        py: s.py,
        px: s.px,
        fontSize: s.fontSize,
        fontWeight: 600,
        textTransform: "none",
        borderRadius: "var(--radius-admin-button)",
        backgroundColor: v.bg,
        color: v.color,
        border: v.border,
        minWidth: icon && !children ? 40 : undefined,
        "&:hover": { backgroundColor: v.hover },
        "&.Mui-disabled": {
          opacity: 0.6,
          color: variant === "primary" || variant === "danger" || variant === "success" ? "#fff" : undefined,
        },
        ...sx,
      }}
      {...props}
    >
      {loading ? <CircularProgress size={18} sx={{ color: "inherit" }} /> : children}
    </MuiButton>
  );
};

export default AdminButton;
