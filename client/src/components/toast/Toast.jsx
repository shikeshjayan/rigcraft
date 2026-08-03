import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import ToastProgress from "./ToastProgress";
import {
  TOAST_ICONS,
  TOAST_COLORS,
  ENTER_ANIMATION_MS,
  EXIT_ANIMATION_MS,
} from "./toast.constants";

const TICK = 100;

const Toast = ({ toast, onClose }) => {
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);

  const Icon = TOAST_ICONS[toast.type];
  const color = TOAST_COLORS[toast.type];
  const duration = toast.duration;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      elapsedRef.current += TICK;
      if (elapsedRef.current >= duration) {
        clearInterval(id);
        onClose(toast.id);
      } else {
        setElapsed(elapsedRef.current);
      }
    }, TICK);
    return () => clearInterval(id);
  }, [paused, duration, onClose, toast.id]);

  const progress = Math.max(0, 100 - (elapsed / duration) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60, transition: { duration: EXIT_ANIMATION_MS / 1000, ease: "easeIn" } }}
      transition={{ duration: ENTER_ANIMATION_MS / 1000, ease: "easeOut" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="status"
      aria-live="polite"
      className="relative flex items-start gap-3 bg-card border-border overflow-hidden"
      style={{
        width: 360,
        minHeight: 72,
        padding: "12px 12px 12px 0",
        backgroundColor: "var(--color-card, #ffffff)",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "var(--radius-sm, 3px)",
        boxShadow: "var(--shadow-card, 0 4px 16px rgb(0 0 0 / 0.05))",
      }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{
          backgroundColor: color,
          borderTopLeftRadius: "var(--radius-sm, 3px)",
          borderBottomLeftRadius: "var(--radius-sm, 3px)",
        }}
      />
      <div className="flex items-center pl-4" style={{ color }}>
        <Icon sx={{ fontSize: 20 }} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 py-0.5 pr-1">
        {toast.title && (
          <span className="text-sm font-bold" style={{ color: "var(--color-text, #0f172a)" }}>
            {toast.title}
          </span>
        )}
        <span className="text-sm leading-snug" style={{ color: "var(--color-text-secondary, #64748b)" }}>
          {toast.message || toast.description}
        </span>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss notification"
        className="cursor-pointer transition-colors m-1"
        style={{
          color: "var(--color-muted, #94a3b8)",
          background: "none",
          border: "none",
          padding: 4,
          borderRadius: "var(--radius-xs, 3px)",
        }}
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </button>
      <ToastProgress progress={progress} color={color} />
    </motion.div>
  );
};

export default Toast;