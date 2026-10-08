import { useCallback, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
};

/** Presentational toast stack — brand-styled, dismissible, accessible. */
export default function Toaster({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toaster" role="region" aria-live="polite" aria-label="اعلان‌ها">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone] || Info;
        return (
          <div key={t.id} className={`toast toast--${t.tone}`} role="status">
            <Icon size={20} className="toast__icon" aria-hidden="true" />
            <div className="toast__body">
              {t.title ? <div className="toast__title">{t.title}</div> : null}
              <div className="toast__message">{t.message}</div>
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => onDismiss(t.id)}
              aria-label="بستن اعلان"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** Imperative toast API used across the app. */
export function useToaster() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'info', options = {}) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((list) => [...list.slice(-3), { id, message, tone, title: options.title }]);
      const duration = options.duration ?? 4200;
      window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      toast: push,
      success: (m, o) => push(m, 'success', o),
      error: (m, o) => push(m, 'danger', o),
      warning: (m, o) => push(m, 'warning', o),
      info: (m, o) => push(m, 'info', o),
      dismiss,
    }),
    [push, dismiss]
  );

  return { toasts, api };
}
