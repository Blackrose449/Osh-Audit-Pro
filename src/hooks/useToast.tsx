import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastContextValue {
  toast: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: Tone = 'success') => {
      const id = ++counter.current;
      setToasts((items) => [...items.slice(-3), { id, message, tone }]);
      const timer = window.setTimeout(() => dismiss(id), 4200);
      timers.current.push(timer);
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:left-auto sm:right-4 sm:items-end">
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border bg-white px-4 py-3 shadow-lg animate-slide-in',
              item.tone === 'success' && 'border-emerald-200',
              item.tone === 'error' && 'border-rose-200',
              item.tone === 'info' && 'border-brand-border',
            )}
          >
            <span
              className={cn(
                'mt-0.5',
                item.tone === 'success' && 'text-emerald-600',
                item.tone === 'error' && 'text-rose-600',
                item.tone === 'info' && 'text-brand-primary',
              )}
            >
              {item.tone === 'success' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : item.tone === 'error' ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Info className="h-5 w-5" />
              )}
            </span>
            <p className="flex-1 text-sm font-medium text-brand-ink">{item.message}</p>
            <button
              onClick={() => dismiss(item.id)}
              className="rounded p-1 text-brand-ink/40 transition hover:bg-brand-light hover:text-brand-ink"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
