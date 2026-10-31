import React, { useState } from 'react';
import { Shield, KeyRound, Clock, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

export const SecuritySettings: React.FC = () => {
  const { securityConfig, updateSecurityConfig } = useBanking();

  const [form, setForm] = useState({
    sessionTimeoutMinutes: securityConfig.sessionTimeoutMinutes,
    dailyWithdrawalCap: securityConfig.dailyWithdrawalCap,
    singleWithdrawalOtpThreshold: securityConfig.singleWithdrawalOtpThreshold,
    maxFailedLogins: securityConfig.maxFailedLogins,
    requireTwoFactor: securityConfig.requireTwoFactor,
    enableVirtualPinPad: securityConfig.enableVirtualPinPad,
    maintenanceMode: securityConfig.maintenanceMode,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSecurityConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Security & Risk Governance</h2>
          <p className="text-xs text-slate-500">
            SuperAdmin Central Command: Configure system-wide risk controls, timeout thresholds, and cryptographic policies.
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-4 w-4" />
            <span>Policy Propagated to Core Engine</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inactivity Session Timeout */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-bank-600" />
              <h3 className="text-sm font-bold text-slate-800">Idle Session Lockout</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Automatically locks active browser terminals after specified minutes of inactivity.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={60}
                value={form.sessionTimeoutMinutes}
                onChange={(e) =>
                  setForm({ ...form, sessionTimeoutMinutes: parseInt(e.target.value) || 5 })
                }
                className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 focus:border-bank-500 focus:outline-none"
              />
              <span className="text-xs font-semibold text-slate-600">Minutes</span>
            </div>
          </div>

          {/* Max Failed Logins Before Lockout */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-800">Failed Authentication Cap</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Consecutive bad password attempts before account lockout and IP throttling.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={10}
                value={form.maxFailedLogins}
                onChange={(e) =>
                  setForm({ ...form, maxFailedLogins: parseInt(e.target.value) || 3 })
                }
                className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 focus:border-bank-500 focus:outline-none"
              />
              <span className="text-xs font-semibold text-slate-600">Attempts allowed</span>
            </div>
          </div>

          {/* Daily Withdrawal Cap */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-800">System Daily Withdrawal Cap</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Maximum aggregate cash/transfer withdrawal limit per customer per 24-hour cycle.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-500">₹</span>
              <input
                type="number"
                step={500}
                min={1000}
                value={form.dailyWithdrawalCap}
                onChange={(e) =>
                  setForm({ ...form, dailyWithdrawalCap: parseFloat(e.target.value) || 10000 })
                }
                className="w-40 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 focus:border-bank-500 focus:outline-none"
              />
              <span className="text-xs text-slate-500">INR</span>
            </div>
          </div>

          {/* Single Withdrawal Step-Up Threshold */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">Step-Up Auth Threshold</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Withdrawals equal to or exceeding this amount enforce multi-factor OTP verification.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-500">₹</span>
              <input
                type="number"
                step={250}
                min={500}
                value={form.singleWithdrawalOtpThreshold}
                onChange={(e) =>
                  setForm({
                    ...form,
                    singleWithdrawalOtpThreshold: parseFloat(e.target.value) || 2000,
                  })
                }
                className="w-40 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 focus:border-bank-500 focus:outline-none"
              />
              <span className="text-xs text-slate-500">INR</span>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            Defensive Countermeasures
          </h3>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-bold text-slate-800">Enforce Virtual Keypad Randomization</p>
              <p className="text-[11px] text-slate-500">
                Randomizes keypad button positions on PIN entry modals to defeat hardware and software keyloggers.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.enableVirtualPinPad}
              onChange={(e) => setForm({ ...form, enableVirtualPinPad: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-bank-600 focus:ring-bank-500"
            />
          </div>

          <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
            <div>
              <p className="text-xs font-bold text-slate-800">Mandatory 2FA for Admin & High-Value Clients</p>
              <p className="text-[11px] text-slate-500">
                Requires time-based one-time password (TOTP) verification on every new device session.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.requireTwoFactor}
              onChange={(e) => setForm({ ...form, requireTwoFactor: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-bank-600 focus:ring-bank-500"
            />
          </div>

          <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
            <div>
              <p className="text-xs font-bold text-rose-700">Emergency Maintenance Freeze Mode</p>
              <p className="text-[11px] text-slate-500">
                Immediately blocks all outward retail withdrawals while allowing incoming deposits and admin operations.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-bank-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-bank-700 transition flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            <span>Apply Global Policy Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
