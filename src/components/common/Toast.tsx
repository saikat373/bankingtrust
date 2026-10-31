import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useBanking();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white/95',
    error: 'border-rose-200 bg-white/95',
    warning: 'border-amber-200 bg-white/95',
    info: 'border-blue-200 bg-white/95',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none print:hidden">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-right duration-300 ${borders[toast.type]}`}
        >
          {icons[toast.type]}
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
            <p className="mt-0.5 text-xs text-slate-600 leading-relaxed break-words">{toast.description}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 transition"
            aria-label="Dismiss toast"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
