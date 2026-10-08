import { createContext, useContext, useMemo } from 'react';
import Toaster, { useToaster } from '../components/ui/Toaster.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { toasts, api } = useToaster();

  const value = useMemo(() => api, [api]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={api.dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
