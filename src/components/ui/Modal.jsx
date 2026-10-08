import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button.jsx';

/** Accessible modal dialog: Escape to close, backdrop click, focus on open. */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  dismissable = true,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissable) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => {
      const focusable = panelRef.current?.querySelector(
        'input,select,textarea,button,[href],[tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }, 40);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(timer);
    };
  }, [open, onClose, dismissable]);

  if (!open) return null;

  return createPortal(
    <div className={`modal ${size === 'lg' ? 'modal--lg' : size === 'sm' ? 'modal--sm' : ''}`}>
      <div
        className="modal__backdrop"
        onClick={dismissable ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
      >
        {(title || dismissable) && (
          <header className="modal__head">
            <div>
              {title ? <h2 className="modal__title">{title}</h2> : null}
              {description ? <p className="modal__desc">{description}</p> : null}
            </div>
            {dismissable ? (
              <button
                type="button"
                className="modal__close"
                onClick={onClose}
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            ) : null}
          </header>
        )}
        <div className="modal__body">{children}</div>
        {footer ? <footer className="modal__foot">{footer}</footer> : null}
      </div>
    </div>,
    document.body
  );
}

/** Confirmation dialog built on Modal — used for destructive actions. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'تأیید عملیات',
  message,
  confirmLabel = 'تأیید',
  cancelLabel = 'انصراف',
  tone = 'danger',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{cancelLabel}</Button>
          <Button
            variant={tone}
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="muted">{message}</p>
    </Modal>
  );
}
