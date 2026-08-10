import { createPortal } from "react-dom";
import { useDialog } from "../../../hooks/useDialog";

const severityStyles = {
  danger: {
    bg: "var(--color-admin-danger)",
    hover: "var(--color-admin-danger-hover)",
    text: "var(--color-admin-white)",
  },
  warning: {
    bg: "var(--color-admin-warning)",
    hover: "var(--color-admin-warning)",
    text: "var(--color-admin-white)",
  },
  success: {
    bg: "var(--color-admin-success)",
    hover: "var(--color-admin-success-hover)",
    text: "var(--color-admin-white)",
  },
};

const ConfirmDialog = ({ open, title, message, confirmLabel = "Delete", cancelLabel = "Cancel", severity = "danger", onConfirm, onCancel, loading }) => {
  const containerRef = useDialog({ open, onClose: onCancel });

  if (!open) return null;

  const s = severityStyles[severity] || severityStyles.danger;

  return createPortal(
    <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="presentation">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-dialog-title"
        aria-describedby="admin-confirm-dialog-message"
        className="w-full max-w-sm p-6 animate-admin-scale-in"
        style={{ backgroundColor: "var(--color-admin-bg-secondary)", borderRadius: "var(--radius-admin-modal)", boxShadow: "var(--shadow-admin-modal)" }}
      >
        <h3 id="admin-confirm-dialog-title" style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-admin-text)", marginBottom: "0.5rem" }}>
          {title}
        </h3>
        <p id="admin-confirm-dialog-message" style={{ fontSize: "0.875rem", color: "var(--color-admin-text-secondary)", marginBottom: "1.5rem" }}>
          {message}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 font-semibold text-sm rounded-sm transition-colors cursor-pointer"
            style={{ color: "var(--color-admin-text)", backgroundColor: "var(--color-admin-bg-tertiary)", border: "1px solid var(--color-admin-border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-admin-border)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-admin-bg-tertiary)")}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 font-semibold text-sm rounded-sm transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ color: s.text, backgroundColor: s.bg }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = s.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = s.bg)}
          >
            {loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
