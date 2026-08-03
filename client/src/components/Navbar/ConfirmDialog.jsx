import FadeUp from '../FadeUp';
import { useDialog } from '../../hooks/useDialog';

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const containerRef = useDialog({ open, onClose: onCancel });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="presentation">
      <FadeUp>
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-message"
          className="bg-white rounded-md p-6 max-w-sm w-full shadow-2xl"
        >
          <h3 id="confirm-dialog-title" className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p id="confirm-dialog-message" className="text-gray-600 mb-6 text-sm">{message}</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </FadeUp>
    </div>
  );
};

export default ConfirmDialog;
