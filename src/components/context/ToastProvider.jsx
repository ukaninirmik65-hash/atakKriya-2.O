import { useCallback, useMemo, useRef, useState } from "react";
import Toast from "../common/Toast";
import ToastContext from "./ToastContext";

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextIdRef = useRef(0);

  const showToast = useCallback((message, options = {}) => {
    if (typeof message !== "string" || !message.trim()) return;
    const settings =
      options && typeof options === "object" ? options : {};

    const id = `${Date.now()}-${nextIdRef.current++}`;
    const duration = Number.isFinite(settings.duration)
      ? Math.max(0, settings.duration)
      : 3000;
    const toast = {
      id,
      message: message.trim(),
      type: ["success", "error", "warning", "info"].includes(settings.type)
        ? settings.type
        : "info",
      duration,
    };
    setToasts((currentToasts) => [...currentToasts, toast]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-0 top-4 z-[100] flex w-[calc(100%-1rem)] max-w-[25rem] flex-col items-end gap-3 sm:top-6">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            toastId={toast.id}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
