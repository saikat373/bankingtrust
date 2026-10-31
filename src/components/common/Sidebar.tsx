import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  CreditCard,
  ArrowUpRight,
  Send,
  Printer,
  History,
  Lock,
  UserPlus,
  Radio,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { SystemModuleId } from '../../types/banking';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, securityConfig, hasPermission } = useBanking();
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem('aegis_bank_sidebar_collapsed') === 'true'
  );

  if (!currentUser) return null;

  const role = currentUser.role;
  const toggleCollapsed = () => {
    const nextCollapsed = !isCollapsed;
    setIsCollapsed(nextCollapsed);
    localStorage.setItem('aegis_bank_sidebar_collapsed', String(nextCollapsed));
  };

  const superAdminNav = [
    { id: 'overview', label: 'Master Dashboard', icon: LayoutDashboard },
    { id: 'admins', label: 'Admin Governance', icon: Users, badge: 'RBAC' },
    { id: 'security', label: 'Security Policies', icon: Shield },
    { id: 'soc', label: 'SOC Cyber Center', icon: Radio, badge: 'WAF' },
    { id: 'audit', label: 'Global Audit Trail', icon: History, badge: 'Live' },
  ];

  const adminNav = [
    {
      id: 'overview',
      label: 'Branch Dashboard',
      icon: LayoutDashboard,
      permission: 'branch_dashboard' as SystemModuleId,
    },
    {
      id: 'customers',
      label: 'Customer Accounts',
      icon: Users,
      permission: 'customer_accounts' as SystemModuleId,
    },
    {
      id: 'new-customer',
      label: 'Create Account',
      icon: UserPlus,
      badge: 'New',
      permission: 'create_customer' as SystemModuleId,
    },
    {
      id: 'transactions',
      label: 'Branch Ledger',
      icon: FileText,
      permission: 'branch_ledger' as SystemModuleId,
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: History,
      permission: 'audit_logs' as SystemModuleId,
    },
    {
      id: 'soc',
      label: 'SOC Cyber Center',
      icon: Radio,
      badge: 'WAF',
      permission: 'soc_cybersecurity' as SystemModuleId,
    },
  ];

  const customerNav = [
    { id: 'overview', label: 'Accounts Overview', icon: CreditCard },
    { id: 'withdraw', label: 'Withdraw Money', icon: ArrowUpRight, highlight: 'rose' },
    { id: 'transfer', label: 'Transfer Funds', icon: Send },
    { id: 'statement', label: 'Statement & Print', icon: Printer, badge: 'PDF' },
  ];

  const navItems =
    role === 'superadmin'
      ? superAdminNav
      : role === 'admin'
      ? adminNav
      : customerNav;

  return (
    <aside className={`app-sidebar relative z-50 w-full shrink-0 border-b p-3 print:hidden transition-[width] duration-200 md:sticky md:top-[68px] md:h-[calc(100vh-68px)] md:border-b-0 md:border-r ${isCollapsed ? 'md:w-20 md:p-2' : 'md:w-60 md:p-4'}`}>
      <div>
        {/* Role Identification Header */}
        {!isCollapsed && <div className="mb-5 hidden rounded-2xl border p-3.5 md:block">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Current RBAC Domain
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-bold text-slate-900 capitalize">
              {role === 'superadmin' ? 'Super Administrator' : role === 'admin' ? 'Branch Admin' : 'Retail Customer'}
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">{currentUser.name}</p>
        </div>}

        {/* Navigation Links */}
        <div className="nav-scroll flex gap-2 overflow-x-auto pb-1 md:block md:space-y-1 md:overflow-visible">
          <div className={`mb-2 hidden items-center md:flex ${isCollapsed ? 'justify-center' : 'justify-between px-3'}`}>
            {!isCollapsed && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navigation Modules
              </p>
            )}
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-bank-300 hover:bg-bank-50 hover:text-bank-700 ${isCollapsed ? 'h-9 w-9 justify-center' : 'px-2 py-1 text-[10px] font-semibold'}`}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <span>Collapse</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hasAccess =
              role === 'superadmin' ||
              role === 'customer' ||
              !('permission' in item) ||
              hasPermission(item.permission as SystemModuleId);

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-label={!hasAccess ? `${item.label}, restricted` : item.label}
                className={`group relative flex w-auto min-w-max items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition md:w-full ${
                  isActive
                    ? 'bg-bank-600 text-white shadow-md shadow-bank-600/20'
                    : hasAccess
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-400 hover:bg-slate-50 opacity-70'
                } ${isCollapsed ? 'md:justify-center md:px-2' : ''}`}
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? 'md:justify-center' : ''}`}>
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : hasAccess ? 'text-slate-400' : 'text-slate-300'}`} />
                  <span className={isCollapsed ? 'md:sr-only' : ''}>{item.label}</span>
                </div>

                {isCollapsed && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition duration-150 ease-out md:invisible md:group-hover:visible md:group-hover:translate-x-0 md:group-hover:opacity-100 md:group-focus-visible:visible md:group-focus-visible:translate-x-0 md:group-focus-visible:opacity-100"
                  >
                    {item.label}
                    {!hasAccess && <span className="ml-1.5 text-amber-300">· Restricted</span>}
                    <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-900" />
                  </span>
                )}

                {!isCollapsed && <div className="flex items-center gap-1.5">
                  {!hasAccess && (
                    <span title="RBAC Restricted">
                      <Lock className="h-3 w-3 text-amber-500" />
                    </span>
                  )}
                  {item.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cyber Defense Assurance Badge */}
      <div
        className={`mt-8 hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 text-white shadow-lg md:block ${isCollapsed ? 'p-3' : 'p-4'}`}
        title={isCollapsed ? 'Defense-In-Depth' : undefined}
      >
        <div className={`flex items-center gap-2 mb-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <Shield className="h-4 w-4 text-emerald-400" />
          {!isCollapsed && <span className="text-xs font-bold tracking-wide">Defense-In-Depth</span>}
        </div>
        {!isCollapsed && <p className="text-[11px] text-slate-300 leading-relaxed">
          Zero-trust session with granular module RBAC, WAF threat shield, and SHA-256 ledger integrity.
        </p>}
        {!isCollapsed && <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>TLS 1.3 Active</span>
          <span className="text-emerald-400 font-semibold">SOC 2 Compliant</span>
        </div>}
      </div>
    </aside>
  );
};
