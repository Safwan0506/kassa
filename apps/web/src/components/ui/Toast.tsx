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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastEntry extends ToastOptions {
  id: string;
  variant: ToastVariant;
  /** Timestamp used to key the dismiss timer */
  createdAt: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  toasts: ToastEntry[];
  dismissToast: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Design-token helpers                                                */
/* ------------------------------------------------------------------ */

const variantBorderColor: Record<ToastVariant, string> = {
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  info: 'var(--color-accent)',
};

/* ------------------------------------------------------------------ */
/*  Keyframes (injected once into <head>)                              */
/* ------------------------------------------------------------------ */

const KEYFRAME_ID = 'kassa-toast-keyframes';

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAME_ID)) return;

  const style = document.createElement('style');
  style.id = KEYFRAME_ID;
  style.textContent = `
@keyframes kassa-toast-slide-in {
  from { transform: translateX(calc(100% + 24px)); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes kassa-toast-slide-out {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(calc(100% + 24px)); opacity: 0; }
}
`;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

/* ------------------------------------------------------------------ */
/*  ToastItem                                                          */
/* ------------------------------------------------------------------ */

function ToastItem({
  entry,
  onDismiss,
}: {
  entry: ToastEntry;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Auto-dismiss after 5 s */
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /* After the exit animation completes, actually remove the toast */
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
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        backgroundColor: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        borderLeft: `4px solid ${variantBorderColor[entry.variant]}`,
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text)',
        pointerEvents: 'auto',
        animation: exiting
          ? 'kassa-toast-slide-out 280ms ease-in forwards'
          : 'kassa-toast-slide-in 280ms ease-out forwards',
        willChange: 'transform, opacity',
      }}
    >
      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            lineHeight: 1.4,
            color: 'var(--color-text)',
          }}
        >
          {entry.title}
        </div>

        {entry.description && (
          <div
            style={{
              fontSize: 'var(--text-xs)',
              lineHeight: 1.5,
              color: 'var(--color-text-muted)',
              marginTop: '4px',
            }}
          >
            {entry.description}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={handleClose}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: '24px',
          height: '24px',
          padding: 0,
          border: 'none',
          background: 'transparent',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'background-color 120ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-border)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Viewport (portal)                                                  */
/* ------------------------------------------------------------------ */

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastEntry[];
  onDismiss: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ensureKeyframes();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((entry) => (
        <ToastItem key={entry.id} entry={entry} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/*  ToastProvider                                                       */
/* ------------------------------------------------------------------ */

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

  return (
    <ToastContext.Provider value={{ toast, toasts, dismissToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  useToast hook                                                      */
/* ------------------------------------------------------------------ */

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>.');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Toaster (convenience wrapper)                                      */
/* ------------------------------------------------------------------ */

/**
 * Drop-in component that provides toast context to the tree.
 * Wrap your app (or a subtree) with `<Toaster>` and call `useToast()`
 * anywhere below it.
 *
 * ```tsx
 * <Toaster>
 *   <App />
 * </Toaster>
 * ```
 */
export function Toaster({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
