import { useCallback, useEffect, useRef, useState } from "react";

const styles = {
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    symbol: "✓",
  },
  error: {
    container: "border-red-200 bg-red-50 text-red-900",
    icon: "text-red-600",
    symbol: "!",
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "text-amber-600",
    symbol: "!",
  },
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-900",
    icon: "text-blue-600",
    symbol: "i",
  },
};

const Toast = ({
  toastId,
  message,
  type = "info",
  duration = 3000,
  onDismiss,
}) => {
  const [phase, setPhase] = useState("entering");
  const phaseRef = useRef("entering");
  const enteredRef = useRef(false);
  const dismissedRef = useRef(false);
  const enterFrameRef = useRef(null);
  const enterFallbackRef = useRef(null);
  const dwellTimerRef = useRef(null);
  const exitFallbackRef = useRef(null);
  const appearance = styles[type] || styles.info;

  const changePhase = useCallback((nextPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onDismiss(toastId);
  }, [onDismiss, toastId]);

  const startExit = useCallback(() => {
    if (phaseRef.current === "exiting") return;
    window.cancelAnimationFrame(enterFrameRef.current);
    window.clearTimeout(dwellTimerRef.current);
    window.clearTimeout(enterFallbackRef.current);
    changePhase("exiting");
  }, [changePhase]);

  const startVisibleDuration = useCallback(() => {
    if (enteredRef.current || phaseRef.current !== "visible") return;
    enteredRef.current = true;
    window.clearTimeout(enterFallbackRef.current);
    dwellTimerRef.current = window.setTimeout(startExit, duration);
  }, [duration, startExit]);

  useEffect(() => {
    enterFrameRef.current = window.requestAnimationFrame(() => {
      if (phaseRef.current !== "entering") return;
      changePhase("visible");
      enterFallbackRef.current = window.setTimeout(
        startVisibleDuration,
        550,
      );
    });

    return () => {
      window.cancelAnimationFrame(enterFrameRef.current);
      window.clearTimeout(enterFallbackRef.current);
      window.clearTimeout(dwellTimerRef.current);
      window.clearTimeout(exitFallbackRef.current);
    };
  }, [changePhase, startVisibleDuration]);

  useEffect(() => {
    if (phase !== "exiting") return undefined;

    exitFallbackRef.current = window.setTimeout(dismiss, 600);
    return () => window.clearTimeout(exitFallbackRef.current);
  }, [dismiss, phase]);

  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") {
      return;
    }

    if (phaseRef.current === "visible") {
      startVisibleDuration();
    } else if (phaseRef.current === "exiting") {
      dismiss();
    }
  };

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={`w-full pr-4 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        phase === "visible"
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
    >
      <div
        role={type === "error" ? "alert" : "status"}
        aria-live={type === "error" ? "assertive" : "polite"}
        className={`pointer-events-auto ml-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg ${appearance.container}`}
      >
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold ${appearance.icon}`}
        >
          {appearance.symbol}
        </span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          type="button"
          aria-label="Close notification"
          onClick={startExit}
          className="rounded p-1 text-current opacity-60 transition hover:bg-black/5 hover:opacity-100"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  );
};

export default Toast;
