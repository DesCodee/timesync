"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };
type ToastContextType = { showToast: (message: string, type?: Toast["type"]) => void };

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let idCounter = 0;

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-3 rounded-2xl shadow-lg text-sm font-medium text-white animate-fade-up pointer-events-auto ${
            t.type === "success" ? "bg-brand-green" : t.type === "error" ? "bg-brand-red" : "bg-black dark:bg-white dark:text-black"
          }`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
