import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Building,
  User as UserIcon,
  Crown,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

interface LoginProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Login: React.FC<LoginProps> = ({ theme, onToggleTheme }) => {
  const { login, users, failedLoginAttempts, securityConfig } = useBanking();
  const [activeTab, setActiveTab] = useState<'personas' | 'manual'>('personas');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLockoutTriggered = failedLoginAttempts >= securityConfig.maxFailedLogins;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address');
      return;
    }

    if (isLockoutTriggered) {
      setError('Too many failed attempts. Terminal is temporarily locked.');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const ok = login(email);
      setIsLoading(false);
      if (!ok) {
        setError('Invalid credentials or account unrecognized. Please check email.');
      }
    }, 350);
  };

  const handleQuickPersona = (userEmail: string) => {
    setIsLoading(true);
    setTimeout(() => {
      login(userEmail);
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className={`login-shell min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <button
        type="button"
        onClick={onToggleTheme}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        className="theme-toggle absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border transition sm:right-6 sm:top-6"
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>

      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-bank-600/10 blur-[120px]" />
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-bank-600 to-bank-400 text-white shadow-xl shadow-bank-600/30 mb-3">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          AEGIS TRUST BANK
        </h1>
        <p className={`login-subtitle mt-1 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          Zero-Trust Protected Core Banking Gateway
        </p>
      </div>

      {/* Central Login Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="rounded-3xl bg-white p-7 sm:p-9 shadow-2xl border border-slate-200/80">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('personas')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'personas'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-bank-600" />
              <span>1-Click Demo Personas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5 text-slate-500" />
              <span>Standard Sign In</span>
            </button>
          </div>

          {/* Security alerts */}
          {failedLoginAttempts > 0 && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Security Notice: {failedLoginAttempts} of {securityConfig.maxFailedLogins} allowed login attempts used.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: 1-Click Demo Personas */}
          {activeTab === 'personas' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-1">
                Select an authorized persona to test different banking tiers:
              </p>

              {/* Customer Persona (Alexander Wright) */}
              <button
                type="button"
                onClick={() => handleQuickPersona('alex.wright@executive.io')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition text-left group shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-105 transition">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">Alexander Wright</p>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        Customer
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Depository Accounts, Money Deposit, Withdrawal & Statements
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
              </button>

              {/* Branch Admin (Marcus Vance) */}
              <button
                type="button"
                onClick={() => handleQuickPersona('marcus.vance@aegisbank.com')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-bank-500 hover:bg-bank-50/40 transition text-left group shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-bank-700 group-hover:scale-105 transition">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">Marcus Vance</p>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-bank-800 uppercase">
                        Branch Admin
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Create Customer Accounts, KYC Approvals, Freeze/Unfreeze
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-bank-600 group-hover:translate-x-1 transition" />
              </button>

              {/* SuperAdmin (Victoria Sterling) */}
              <button
                type="button"
                onClick={() => handleQuickPersona('superadmin@aegisbank.com')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition text-left group shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700 group-hover:scale-105 transition">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">Victoria Sterling</p>
                      <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 uppercase">
                        SuperAdmin
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Create Administrators, Risk Policy Governance, Global Audit
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
              </button>
            </div>
          )}

          {/* TAB 2: Standard Manual Credentials */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Banking Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex.wright@executive.io"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-bank-500 focus:outline-none focus:ring-2 focus:ring-bank-200"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Security Passphrase
                  </label>
                  <span className="text-[11px] text-bank-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-bank-500 focus:outline-none focus:ring-2 focus:ring-bank-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isLockoutTriggered}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-bank-600 py-3 text-xs font-bold text-white shadow-lg shadow-bank-600/30 hover:bg-bank-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Authenticate Session</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Seal Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <Lock className="h-3 w-3 text-emerald-600" />
            <span>256-Bit SSL/TLS Encryption • FIPS 140-3 Cryptographic Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};
