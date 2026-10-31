import React, { useState } from 'react';
import {
  Users,
  Shield,
  Building,
  TrendingUp,
  UserPlus,
  KeyRound,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreateAdminModal } from './CreateAdminModal';
import { SecuritySettings } from './SecuritySettings';
import { GlobalAuditLog } from './GlobalAuditLog';
import { AdminGovernance } from './AdminGovernance';
import { SocDashboard } from '../common/SocDashboard';

interface SuperAdminDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { users, accounts, transactions, auditLogs, privacyMode } = useBanking();
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);

  // Compute aggregate banking metrics
  const totalReserves = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalCustomerAccounts = accounts.length;
  const adminUsers = users.filter((u) => u.role === 'admin');
  const customerUsers = users.filter((u) => u.role === 'customer');

  if (activeTab === 'admins') {
    return <AdminGovernance />;
  }

  if (activeTab === 'security') {
    return <SecuritySettings />;
  }

  if (activeTab === 'soc') {
    return <SocDashboard />;
  }

  if (activeTab === 'audit') {
    return <GlobalAuditLog />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Executive Sovereign Portal
            </h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 border border-purple-200">
              SuperAdmin Clearance
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Federal regulatory compliance level 1: Full governance across all branch administrators, capital reserves, and zero-trust policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateAdminOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-bank-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-bank-600/20 hover:bg-bank-700 transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create New Admin</span>
          </button>
        </div>
      </div>

      {/* Aggregate Financial Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidity */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bank Reserves</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {privacyMode ? '••••••••' : formatCurrency(totalReserves)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            100% Fully Backed Reserves
          </p>
        </div>

        {/* Branch Admins Count */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Branch Administrators</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{adminUsers.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Authorized to create & verify accounts
          </p>
        </div>

        {/* Customer Accounts */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Bank Accounts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bank-50 text-bank-600">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCustomerAccounts}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Across {customerUsers.length} retail & corporate clients
          </p>
        </div>

        {/* Security Events Recorded */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Audit Records Logged</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{auditLogs.length}</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">
            Zero integrity breaches
          </p>
        </div>
      </div>

      {/* Executive Quick Control Center */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('admins')}
          className="flex items-center justify-between rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:border-bank-400 hover:shadow-md transition text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700 group-hover:scale-105 transition">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Admin Governance</h3>
              <p className="text-xs text-slate-500">Manage {adminUsers.length} Branch Admins & Hubs</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-bank-600 transition" />
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className="flex items-center justify-between rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:border-bank-400 hover:shadow-md transition text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bank-50 text-bank-700 group-hover:scale-105 transition">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security Policies</h3>
              <p className="text-xs text-slate-500">Limits, Timeouts & 2FA Governance</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-bank-600 transition" />
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className="flex items-center justify-between rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:border-bank-400 hover:shadow-md transition text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Audit Trail Ledger</h3>
              <p className="text-xs text-slate-500">{auditLogs.length} Cryptographic Events</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-bank-600 transition" />
        </button>
      </div>

      {/* Capital Reserve & Liquidity Breakdown by Asset Tier */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Custody Reserves by Asset Tier</h2>
            <p className="text-xs text-slate-500">
              Distribution of customer capital across reserve accounts and yield yields.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            FDIC Insured Reserves
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider">Commercial Enterprise</span>
              <span className="font-semibold text-bank-600">2.15% APY</span>
            </div>
            <p className="text-xl font-black text-slate-900">
              {privacyMode
                ? '••••••'
                : formatCurrency(
                    accounts
                      .filter((a) => a.accountType === 'business')
                      .reduce((s, a) => s + a.balance, 0)
                  )}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {accounts.filter((a) => a.accountType === 'business').length} Corporate Entities
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider">High-Yield Savings</span>
              <span className="font-semibold text-emerald-600">4.65% APY</span>
            </div>
            <p className="text-xl font-black text-slate-900">
              {privacyMode
                ? '••••••'
                : formatCurrency(
                    accounts
                      .filter((a) => a.accountType === 'savings')
                      .reduce((s, a) => s + a.balance, 0)
                  )}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {accounts.filter((a) => a.accountType === 'savings').length} Liquid Reserve Accounts
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider">Premier Checking</span>
              <span className="font-semibold text-slate-600">0.85% APY</span>
            </div>
            <p className="text-xl font-black text-slate-900">
              {privacyMode
                ? '••••••'
                : formatCurrency(
                    accounts
                      .filter((a) => a.accountType === 'checking')
                      .reduce((s, a) => s + a.balance, 0)
                  )}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {accounts.filter((a) => a.accountType === 'checking').length} Operational Transaction Accounts
            </p>
          </div>
        </div>
      </div>

      {/* Recent High-Priority Audit Logs */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Security Audit Events</h2>
            <p className="text-xs text-slate-500">
              Real-time feed of privileged administrative & system transactions.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('audit')}
            className="text-xs font-bold text-bank-600 hover:text-bank-800 transition"
          >
            View Full Audit Trail &rarr;
          </button>
        </div>

        <div className="space-y-2.5">
          {auditLogs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-50 transition"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 rounded-lg p-1.5 ${
                    log.severity === 'CRITICAL'
                      ? 'bg-purple-100 text-purple-700'
                      : log.severity === 'SECURITY'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-bank-100 text-bank-700'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-mono">{log.action}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      by {log.actorName} ({log.actorRole})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{log.details}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                {formatDate(log.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal to create new Admin */}
      <CreateAdminModal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
      />
    </div>
  );
};
