import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ── Context ────────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={addToast}>
      {children}

      {/* Toast stack — fixed top-right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg
              text-sm font-medium max-w-sm border animate-slide-in
              ${t.type === "success" ? "bg-white border-green-200 text-green-800" : ""}
              ${t.type === "error"   ? "bg-white border-red-200   text-red-700"   : ""}
              ${t.type === "info"    ? "bg-white border-blue-200  text-blue-800"  : ""}
              ${t.type === "warning" ? "bg-white border-amber-200 text-amber-800" : ""}
            `}
          >
            {/* Icon */}
            <span className="mt-0.5 text-base leading-none shrink-0">
              {t.type === "success" && "✓"}
              {t.type === "error"   && "✕"}
              {t.type === "info"    && "ℹ"}
              {t.type === "warning" && "⚠"}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-gray-300 hover:text-gray-500 transition shrink-0 leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useToast() {
  const addToast = useContext(ToastContext);
  if (!addToast) throw new Error("useToast must be used inside <ToastProvider>");

  return {
    success: (msg)         => addToast(msg, "success"),
    error:   (msg)         => addToast(msg, "error"),
    info:    (msg)         => addToast(msg, "info"),
    warning: (msg)         => addToast(msg, "warning"),
    toast:   (msg, type)   => addToast(msg, type),
  };
}
