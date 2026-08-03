import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import Warning from "@mui/icons-material/Warning";
import Info from "@mui/icons-material/Info";

export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

export const DEFAULT_TYPE = TOAST_TYPES.SUCCESS;

export const TOAST_DURATIONS = {
  [TOAST_TYPES.SUCCESS]: 3000,
  [TOAST_TYPES.INFO]: 3000,
  [TOAST_TYPES.WARNING]: 5000,
  [TOAST_TYPES.ERROR]: 5000,
};

export const DEFAULT_DURATION = 3000;

export const MAX_VISIBLE_TOASTS = 5;

export const ENTER_ANIMATION_MS = 200;
export const EXIT_ANIMATION_MS = 150;

export const TOAST_ICONS = {
  [TOAST_TYPES.SUCCESS]: CheckCircle,
  [TOAST_TYPES.ERROR]: Cancel,
  [TOAST_TYPES.WARNING]: Warning,
  [TOAST_TYPES.INFO]: Info,
};

export const TOAST_COLORS = {
  [TOAST_TYPES.SUCCESS]: "var(--color-success, #22c55e)",
  [TOAST_TYPES.ERROR]: "var(--color-danger, #ef4444)",
  [TOAST_TYPES.WARNING]: "var(--color-warning, #f59e0b)",
  [TOAST_TYPES.INFO]: "var(--color-info, #3b82f6)",
};