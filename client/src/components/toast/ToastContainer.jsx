import { AnimatePresence } from "framer-motion";
import Toast from "./Toast";

const POSITIONS = {
  "bottom-right": "fixed bottom-4 right-4 flex flex-col justify-end",
  "top-right": "fixed top-4 right-4 flex flex-col",
};

const ToastContainer = ({ toasts, position, onClose }) => {
  const pos = POSITIONS[position] || POSITIONS["bottom-right"];

  return (
    <div className={`${pos} gap-2 w-max max-w-[90vw] pointer-events-none`} style={{ zIndex: 2000 }}>
      <AnimatePresence>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;