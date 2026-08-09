import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDialog } from '../hooks/useDialog';

const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = true,
  confirmDangerHover = false,
}) => {
  const containerRef = useDialog({ open: isOpen, onClose: onCancel });

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onCancel}
          />
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="relative bg-[var(--color-bg-primary)] w-full max-w-[400px] shadow-[var(--shadow-card)] p-6"
            style={{ borderRadius: 'var(--radius-sm)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-message"
          >
            <h3 id="confirm-modal-title" className="text-lg font-bold text-[var(--color-text)] mb-2">{title}</h3>
            {message && <p id="confirm-modal-message" className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">{message}</p>}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className={danger
                  ? "py-2.5 px-6 border border-[var(--color-border)] text-[var(--color-text)] font-bold text-[13px] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  : "py-2.5 px-6 text-white font-bold text-[13px] transition-opacity cursor-pointer bg-[var(--color-primary)] hover:opacity-90"}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={danger
                  ? "py-2.5 px-6 text-white font-bold text-[13px] transition-opacity cursor-pointer bg-[var(--color-danger)] hover:opacity-90"
                  : confirmDangerHover
                    ? "py-2.5 px-6 border border-[var(--color-border)] text-[var(--color-text)] font-bold text-[13px] hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
                    : "py-2.5 px-6 border border-[var(--color-border)] text-[var(--color-text)] font-bold text-[13px] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmModal;
