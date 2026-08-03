import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ToastContainer from "./ToastContainer";
import { ToastContext } from "./toast-context";
import {
  TOAST_TYPES,
  DEFAULT_TYPE,
  TOAST_DURATIONS,
  DEFAULT_DURATION,
  MAX_VISIBLE_TOASTS,
} from "./toast.constants";

const PENDING_TOAST_KEY = "rigcraft_pending_toast";

let idCounter = 0;
const nextId = () => `${Date.now()}-${++idCounter}`;

const normalizeToast = (input, type) => {
  if (typeof input === "string") {
    const t = type || DEFAULT_TYPE;
    return { message: input, type: t, duration: TOAST_DURATIONS[t] || DEFAULT_DURATION };
  }
  if (input && typeof input === "object") {
    const { type: t, message, title, description, duration, ...rest } = input;
    return {
      message: message || description || title || "",
      title: title || undefined,
      description: description || undefined,
      type: t || type || DEFAULT_TYPE,
      duration: duration || TOAST_DURATIONS[t || type] || DEFAULT_DURATION,
      ...rest,
    };
  }
  const t = type || DEFAULT_TYPE;
  return { message: String(input ?? ""), type: t, duration: TOAST_DURATIONS[t] || DEFAULT_DURATION };
};

export const ToastProvider = ({ children }) => {
  const location = useLocation();
  const [toasts, setToasts] = useState([]);

  const position = location.pathname.startsWith("/admin") ? "top-right" : "bottom-right";

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((input, type) => {
    const toast = { id: nextId(), ...normalizeToast(input, type) };
    setToasts((prev) => [toast, ...prev].slice(0, MAX_VISIBLE_TOASTS));
    return toast.id;
  }, []);

  const dismiss = useCallback((id) => {
    removeToast(id);
  }, [removeToast]);

  useEffect(() => {
    let raw;
    try {
      raw = sessionStorage.getItem(PENDING_TOAST_KEY);
    } catch {
      raw = null;
    }
    if (!raw) return;
    let pending;
    try {
      pending = JSON.parse(raw);
      sessionStorage.removeItem(PENDING_TOAST_KEY);
    } catch {
      return;
    }
    const timer = setTimeout(() => {
      push(pending.message ?? "", pending.type);
    }, 0);
    return () => clearTimeout(timer);
  }, [push]);

  const success = useCallback((input) => push(input, TOAST_TYPES.SUCCESS), [push]);
  const error = useCallback((input) => push(input, TOAST_TYPES.ERROR), [push]);
  const warning = useCallback((input) => push(input, TOAST_TYPES.WARNING), [push]);
  const info = useCallback((input) => push(input, TOAST_TYPES.INFO), [push]);

  const value = useMemo(
    () => ({ toast: push, success, error, warning, info, dismiss }),
    [push, success, error, warning, info, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;