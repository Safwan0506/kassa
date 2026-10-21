'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Toast.css';

/* ── Types ── */

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastEntry extends ToastOptions {
  id: string;
  variant: ToastVariant;
  createdAt: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  addToast: (title: string, variant?: ToastVariant) => void;
  toasts: ToastEntry[];
  dismissToast: (id: string) => void;
}

/* ── ToastItem ── */

function ToastItem({
  entry,
  onDismiss,
}: {
  entry: ToastEntry;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setExiting(true), 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => onDismiss(entry.id), 280);
    return () => clearTimeout(t);
  }, [exiting, entry.id, onDismiss]);

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setExiting(true);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast toast--${entry.variant} ${exiting ? 'toast--exiting' : 'toast--entering'}`}
    >
      <div className="toast__content">
        <div className="toast__title">{entry.title}</div>
        {entry.description && (
          <div className="toast__description">{entry.description}</div>
        )}
      </div>
      <button
        type="button"
        aria-label="Fermer"
        onClick={handleClose}
        className="toast__close"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ── Viewport ── */

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastEntry[];
  onDismiss: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div aria-label="Notifications" className="toast-viewport">
      {toasts.map((entry) => (
        <ToastItem key={entry.id} entry={entry} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

/* ── Context ── */

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const entry: ToastEntry = {
      ...options,
      id: `toast-${++idCounter}`,
      variant: options.variant ?? 'info',
      createdAt: Date.now(),
    };
    setToasts((prev) => [...prev, entry]);
  }, []);

  const addToast = useCallback((title: string, variant?: ToastVariant) => {
    toast({ title, variant: variant ?? 'info' });
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, addToast, toasts, dismissToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>.');
  }
  return ctx;
}

export function Toaster({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
