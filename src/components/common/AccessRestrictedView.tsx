import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, KeyRound } from 'lucide-react';

interface AccessRestrictedViewProps {
  moduleName: string;
  requiredPermission: string;
  onGoBack?: () => void;
}

export const AccessRestrictedView: React.FC<AccessRestrictedViewProps> = ({
  moduleName,
  requiredPermission,
  onGoBack,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[460px] p-6 text-center">
      <div className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-xl max-w-lg w-full space-y-4">
        {/* Shield Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/60 border border-amber-200">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div>
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 border border-amber-200">
            RBAC Clearance Required
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            Access to {moduleName} is Restricted
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            SuperAdmin has not delegated permission for this module to your current administrator profile.
          </p>
        </div>

        {/* Security Rule Card */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left text-xs font-mono space-y-1.5">
          <div className="flex justify-between items-center text-slate-500">
            <span>Enforced Policy:</span>
            <span className="text-slate-800 font-bold">Strict Role Access Control</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Required Module Key:</span>
            <span className="text-bank-700 font-bold bg-bank-50 px-2 py-0.5 rounded border border-bank-200">
              {requiredPermission}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Governance Authority:</span>
            <span className="text-slate-800 font-semibold font-sans">SuperAdmin (Victoria Sterling)</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          To request delegation for this menu, please contact the SuperAdmin or switch to a persona with higher clearance.
        </p>

        {onGoBack && (
          <div className="pt-2">
            <button
              onClick={onGoBack}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Permitted Modules</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
