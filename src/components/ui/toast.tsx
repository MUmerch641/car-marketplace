"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, Loader2, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "loading";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastListener = (toast: ToastItem) => void;
type DismissListener = (id: string) => void;

const listeners: Set<ToastListener> = new Set();
const dismissListeners: Set<DismissListener> = new Set();

export const toast = {
  success: (message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type: "success", message, duration };
    listeners.forEach((l) => l(item));
    return id;
  },
  error: (message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type: "error", message, duration };
    listeners.forEach((l) => l(item));
    return id;
  },
  info: (message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type: "info", message, duration };
    listeners.forEach((l) => l(item));
    return id;
  },
  loading: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type: "loading", message, duration: 0 };
    listeners.forEach((l) => l(item));
    return id;
  },
  dismiss: (id?: string) => {
    if (id) {
      dismissListeners.forEach((l) => l(id));
    }
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: ToastItem) => {
    setToasts((prev) => [...prev.filter((t) => t.id !== item.id), item]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    dismissListeners.add(removeToast);
    return () => {
      listeners.delete(addToast);
      dismissListeners.delete(removeToast);
    };
  }, [addToast, removeToast]);

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast: t, onClose }: { toast: ToastItem; onClose: () => void }) {
  useEffect(() => {
    if (t.duration && t.duration > 0) {
      const timer = setTimeout(onClose, t.duration);
      return () => clearTimeout(timer);
    }
  }, [t.duration, onClose]);

  let icon = <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />;
  let borderStyle = "border-emerald-200 bg-white text-slate-900 shadow-2xl shadow-emerald-950/10";

  if (t.type === "error") {
    icon = <AlertCircle size={18} className="text-red-500 shrink-0" />;
    borderStyle = "border-red-200 bg-white text-slate-900 shadow-2xl shadow-red-950/10";
  } else if (t.type === "info") {
    icon = <Info size={18} className="text-blue-500 shrink-0" />;
    borderStyle = "border-blue-200 bg-white text-slate-900 shadow-2xl shadow-blue-950/10";
  } else if (t.type === "loading") {
    icon = <Loader2 size={18} className="animate-spin text-slate-700 shrink-0" />;
    borderStyle = "border-slate-300 bg-white text-slate-900 shadow-2xl";
  }

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs font-bold tracking-wide transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${borderStyle}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon}
        <span className="truncate leading-relaxed">{t.message}</span>
      </div>
      <button
        onClick={onClose}
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </div>
  );
}
