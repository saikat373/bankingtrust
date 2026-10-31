import React, { useState } from 'react';
import { Lock, LogOut, ShieldAlert, ArrowRight } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

export const InactivityLockModal: React.FC = () => {
  const { isLocked, currentUser, unlockSession, logout } = useBanking();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockSession(pin);
    if (!success) {
      setError(true);
      setPin('');
    } else {
      setError(false);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl border border-slate-200">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-8 ring-amber-50">
          <Lock className="h-8 w-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200 mb-2">
          <ShieldAlert className="h-3.5 w-3.5" />
          Idle Inactivity Lockdown
        </div>

        <h2 className="text-xl font-bold text-slate-900">Session Locked</h2>
        <p className="mt-1 text-xs text-slate-500">
          For your protection, banking sessions are locked after idle inactivity. Enter your security PIN to resume where you left off.
        </p>

        <div className="mt-5 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-left flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-bank-600 text-white font-bold flex items-center justify-center text-sm">
            {currentUser.name[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-left">
              Enter 4-Digit Security PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              autoFocus
              onChange={(e) => {
                setError(false);
                setPin(e.target.value.replace(/\D/g, ''));
              }}
              placeholder="••••"
              className={`w-full rounded-xl border text-center text-2xl tracking-[0.5em] py-3 focus:outline-none focus:ring-2 ${
                error
                  ? 'border-rose-400 bg-rose-50 text-rose-800 focus:ring-rose-300'
                  : 'border-slate-300 bg-white text-slate-900 focus:border-bank-500 focus:ring-bank-200'
              }`}
            />
            {error && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                Incorrect security PIN. Please try again.
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              Demo PIN: SuperAdmin (9988), Admin (1234), Customer (7788)
            </p>
          </div>

          <button
            type="submit"
            disabled={pin.length < 4}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-bank-600 py-3 text-sm font-semibold text-white shadow-lg shadow-bank-600/30 hover:bg-bank-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span>Unlock Session</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition mx-auto"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out Completely
          </button>
        </div>
      </div>
    </div>
  );
};
