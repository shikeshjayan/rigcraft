import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const StorefrontConfirm = ({
  isOpen,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = true,
}) => (
  createPortal(
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
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="relative bg-white w-full max-w-[400px] rounded-2xl shadow-2xl p-6"
          >
            <h3 className="text-lg font-bold text-[#282C3F] mb-2">{title}</h3>
            {message && <p className="text-sm text-[#696E79] mb-6 leading-relaxed">{message}</p>}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="py-2.5 px-6 border border-[#D4D5D9] text-[#282C3F] font-bold text-[13px] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`py-2.5 px-6 text-white font-bold text-[13px] transition-opacity cursor-pointer ${
                  danger ? 'bg-[#CC0C39] hover:opacity-90' : 'bg-[var(--color-primary)] hover:opacity-90'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
);

export default StorefrontConfirm;
