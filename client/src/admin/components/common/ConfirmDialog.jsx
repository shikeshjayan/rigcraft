import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import AdminButton from "./Button";

const ConfirmDialog = ({ open, title, message, confirmLabel = "Delete", cancelLabel = "Cancel", severity = "danger", onConfirm, onCancel, loading }) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "var(--radius-admin-modal)",
            boxShadow: "var(--shadow-admin-modal)",
            minWidth: { xs: 0, sm: 400 },
            maxWidth: { xs: "calc(100vw - 32px)", sm: "none" },
            margin: 1,
          },
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: "1.125rem", color: "var(--color-admin-text)" }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "var(--color-admin-text-secondary)", fontSize: "0.875rem" }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <AdminButton variant="secondary" size="small" onClick={onCancel}>
          {cancelLabel}
        </AdminButton>
        <AdminButton variant={severity} size="small" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </AdminButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;