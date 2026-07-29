import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 ${
              toast.type === 'success'
                ? 'border-emerald-500/30 bg-slate-900/90 text-emerald-400'
                : toast.type === 'error'
                ? 'border-rose-500/30 bg-slate-900/90 text-rose-400'
                : 'border-slate-800 bg-slate-900/90 text-slate-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <XCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-800"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
