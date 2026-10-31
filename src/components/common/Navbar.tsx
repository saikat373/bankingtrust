import React, { useState } from 'react';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  LogOut,
  ChevronDown,
  KeyRound,
  ShieldAlert,
  Building2,
  Lock,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme }) => {
  const {
    currentUser,
    users,
    quickSwitchUser,
    logout,
    privacyMode,
    togglePrivacyMode,
    securityConfig,
  } = useBanking();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);

  const roleBadgeStyles = {
    superadmin: 'bg-purple-100 text-purple-800 border-purple-200',
    admin: 'bg-blue-100 text-bank-800 border-bank-200',
    customer: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const roleTitles = {
    superadmin: 'Super Administrator',
    admin: 'Branch Administrator',
    customer: 'Verified Customer',
  };

  return (
    <header className="app-navbar sticky top-0 z-40 border-b print:hidden">
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-bank-600 to-bank-800 text-white shadow-md shadow-bank-600/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
                AEGIS TRUST
              </span>
              <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 sm:inline-block">
                Bank & Reserve
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {securityConfig.tlsStatus}
              </span>
              <span className="text-slate-300">•</span>
              <span className="hidden md:inline text-slate-400">FDIC #94821</span>
            </div>
          </div>
        </div>

        {/* Center: Security Safeguards Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-slate-100/90 px-3 py-1.5 border border-slate-200/70 text-xs text-slate-600">
          <Lock className="h-3.5 w-3.5 text-bank-600" />
          <span>RBAC Protection Active</span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-500">
            Auto-lock: {securityConfig.sessionTimeoutMinutes}m idle
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="theme-toggle flex h-9 w-9 items-center justify-center rounded-xl border transition"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Privacy Mode Toggle (Anti-shoulder surfing) */}
          <button
            onClick={togglePrivacyMode}
            title={privacyMode ? 'Show sensitive balances' : 'Hide sensitive balances (Privacy Mode)'}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition border ${
              privacyMode
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {privacyMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">
              {privacyMode ? 'Privacy On' : 'Hide Balances'}
            </span>
          </button>

          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsPersonaOpen(!isPersonaOpen);
                setIsDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition"
              title="Test application as SuperAdmin, Admin, or Customer"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Switch Role</span>
              <ChevronDown className="hidden h-3 w-3 sm:block" />
            </button>

            {isPersonaOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 z-50 border border-slate-200">
                <div className="flex items-start justify-between border-b border-slate-100 px-3 py-2">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Quick Persona Switcher</p>
                    <p className="text-[11px] text-slate-500">Test different RBAC security tiers</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPersonaOpen(false)}
                    aria-label="Close role switcher"
                    className="ml-2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1 max-h-80 space-y-1 overflow-y-auto">
                  {users.map((u) => {
                    const isCurrent = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          quickSwitchUser(u.id);
                          setIsPersonaOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                          isCurrent
                            ? 'bg-bank-50 text-bank-800 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="font-medium text-slate-900 truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-400 capitalize">{u.role}</p>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            roleBadgeStyles[u.role]
                          }`}
                        >
                          {u.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsPersonaOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
                  {currentUser.name[0]}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1 rounded border ${
                      roleBadgeStyles[currentUser.role]
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="hidden h-3 w-3 text-slate-400 sm:block" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/5 z-50 border border-slate-200">
                  <div className="mb-2 flex items-start justify-between border-b border-slate-100 pb-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Building2 className="h-3 w-3" />
                        <span>{roleTitles[currentUser.role]}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(false)}
                      aria-label="Close profile menu"
                      className="ml-2 shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-600 rounded-lg bg-slate-50">
                      <span>2FA Authentication:</span>
                      <span className="font-semibold text-emerald-600">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-600 rounded-lg bg-slate-50">
                      <span>Security PIN:</span>
                      <span className="font-semibold text-bank-600">Configured</span>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-slate-100 pt-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
