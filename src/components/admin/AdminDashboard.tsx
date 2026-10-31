import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  UserPlus,
  ShieldAlert,
  Building,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  History,
  CheckCircle2,
  Lock,
  Unlock,
  Radio,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { formatCurrency, formatDate, maskAccountNumber } from '../../utils/formatters';
import { CustomerAccountsView } from './CustomerAccountsView';
import { CreateAccountView } from './CreateAccountView';
import { BranchLedgerView } from './BranchLedgerView';
import { BranchAuditView } from './BranchAuditView';
import { CreateCustomerModal } from './CreateCustomerModal';
import { SocDashboard } from '../common/SocDashboard';
import { AccessRestrictedView } from '../common/AccessRestrictedView';

interface AdminDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    currentUser,
    users,
    accounts,
    transactions,
    auditLogs,
    privacyMode,
    hasPermission,
  } = useBanking();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tab 2: Customer Accounts — RBAC guarded
  if (activeTab === 'customers') {
    if (!hasPermission('customer_accounts')) {
      return (
        <AccessRestrictedView
          moduleName="Customer Accounts"
          requiredPermission="customer_accounts"
          onGoBack={() => setActiveTab('overview')}
        />
      );
    }
    return (
      <CustomerAccountsView
        onOpenCreateAccount={() => setActiveTab('new-customer')}
      />
    );
  }

  // Tab 3: Create Account — RBAC guarded
  if (activeTab === 'new-customer') {
    if (!hasPermission('create_customer')) {
      return (
        <AccessRestrictedView
          moduleName="Create Customer Account"
          requiredPermission="create_customer"
          onGoBack={() => setActiveTab('overview')}
        />
      );
    }
    return (
      <CreateAccountView
        onNavigateToAccounts={() => setActiveTab('customers')}
      />
    );
  }

  // Tab 4: Branch Ledger — RBAC guarded
  if (activeTab === 'transactions') {
    if (!hasPermission('branch_ledger')) {
      return (
        <AccessRestrictedView
          moduleName="Branch Ledger"
          requiredPermission="branch_ledger"
          onGoBack={() => setActiveTab('overview')}
        />
      );
    }
    return <BranchLedgerView />;
  }

  // Tab 5: Audit Logs — RBAC guarded
  if (activeTab === 'audit') {
    if (!hasPermission('audit_logs')) {
      return (
        <AccessRestrictedView
          moduleName="Audit Logs"
          requiredPermission="audit_logs"
          onGoBack={() => setActiveTab('overview')}
        />
      );
    }
    return <BranchAuditView />;
  }

  // Tab 6: SOC Cyber Center — RBAC guarded
  if (activeTab === 'soc') {
    if (!hasPermission('soc_cybersecurity')) {
      return (
        <AccessRestrictedView
          moduleName="SOC Cyber Center"
          requiredPermission="soc_cybersecurity"
          onGoBack={() => setActiveTab('overview')}
        />
      );
    }
    return <SocDashboard />;
  }

  // Default Tab 1: Branch Dashboard (overview)
  const totalCustBalances = accounts.reduce((sum, a) => sum + a.balance, 0);
  const activeCount = accounts.filter((a) => a.status === 'active').length;
  const frozenCount = accounts.filter((a) => a.status === 'frozen').length;

  const quickActions = [
    {
      id: 'customers',
      label: 'Customer Accounts',
      sub: 'Review & Freeze Accounts',
      icon: Users,
      colorClass: 'bg-blue-50 text-bank-700',
      permitted: hasPermission('customer_accounts'),
    },
    {
      id: 'new-customer',
      label: 'Create Account',
      sub: 'KYC Onboarding & Initial Deposit',
      icon: UserPlus,
      colorClass: 'bg-emerald-50 text-emerald-700',
      permitted: hasPermission('create_customer'),
    },
    {
      id: 'transactions',
      label: 'Branch Ledger',
      sub: 'Settlements & Journal',
      icon: FileText,
      colorClass: 'bg-purple-50 text-purple-700',
      permitted: hasPermission('branch_ledger'),
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      sub: 'Security & Access Logs',
      icon: History,
      colorClass: 'bg-amber-50 text-amber-700',
      permitted: hasPermission('audit_logs'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Branch Operations Center
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-bank-800 border border-bank-200">
              Station {currentUser?.branchId || 'BR-NYC-001'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Lead Officer: <strong>{currentUser?.name}</strong> • Dept:{' '}
            {currentUser?.department || 'Branch Operations'} • Clearance: Level 2
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('soc_cybersecurity') && (
            <button
              onClick={() => setActiveTab('soc')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:border-slate-300 transition"
            >
              <Radio className="h-3.5 w-3.5 text-emerald-500" />
              SOC Center
            </button>
          )}
          {hasPermission('create_customer') && (
            <button
              onClick={() => setActiveTab('new-customer')}
              className="flex items-center gap-2 rounded-xl bg-bank-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-bank-600/20 hover:bg-bank-700 transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Open Customer Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Branch Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Branch Custody</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {privacyMode ? '••••••••' : formatCurrency(totalCustBalances)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">100% Backed Reserves</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Managed Accounts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-bank-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{accounts.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            {activeCount} Active • {frozenCount} Frozen
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Transactions</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{transactions.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">SHA-256 audited</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Audit Events</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <History className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{auditLogs.length}</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">Zero Violations</p>
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => action.permitted && setActiveTab(action.id)}
              className={`relative flex items-center justify-between rounded-2xl bg-white p-5 border shadow-sm text-left group transition ${
                action.permitted
                  ? 'border-slate-200/80 hover:border-bank-400 hover:shadow-md cursor-pointer'
                  : 'border-slate-200/60 opacity-60 cursor-not-allowed'
              }`}
              title={!action.permitted ? 'RBAC restricted — contact SuperAdmin' : undefined}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.colorClass} ${action.permitted ? 'group-hover:scale-105' : ''} transition`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{action.label}</h3>
                  <p className="text-xs text-slate-500">{action.sub}</p>
                </div>
              </div>
              {action.permitted ? (
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-bank-600 transition" />
              ) : (
                <Lock className="h-4 w-4 text-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Custody Portfolio Breakdown */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Branch Depository Allocation</h2>
            <p className="text-xs text-slate-500">
              Customer deposits categorized by account classification.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('customers')}
            className="text-xs font-bold text-bank-600 hover:text-bank-800 transition"
          >
            Manage Accounts &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Commercial Enterprise', type: 'business', apy: '2.15% APY', apyColor: 'text-bank-600' },
            { label: 'High-Yield Savings', type: 'savings', apy: '4.65% APY', apyColor: 'text-emerald-600' },
            { label: 'Premier Checking', type: 'checking', apy: '0.85% APY', apyColor: 'text-slate-600' },
          ].map((tier) => {
            const filtered = accounts.filter((a) => a.accountType === tier.type);
            return (
              <div key={tier.type} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold uppercase tracking-wider text-slate-500">{tier.label}</span>
                  <span className={`font-semibold text-[11px] ${tier.apyColor}`}>{tier.apy}</span>
                </div>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {privacyMode ? '••••••' : formatCurrency(filtered.reduce((s, a) => s + a.balance, 0))}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">{filtered.length} accounts</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Ledger Snapshot */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Branch Ledger Entries</h2>
            <p className="text-xs text-slate-500">Latest debits and credits recorded across accounts.</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-bold text-bank-600 hover:text-bank-800 transition"
          >
            View Full Ledger &rarr;
          </button>
        </div>

        <div className="space-y-2">
          {transactions.slice(0, 4).map((txn) => {
            const isDeposit = txn.type === 'deposit' || txn.type === 'transfer_in';
            return (
              <div
                key={txn.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isDeposit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {isDeposit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{txn.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{txn.referenceId}</span>
                      <span>•</span>
                      <span>{formatDate(txn.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xs font-bold ${isDeposit ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isDeposit ? '+' : '-'} {formatCurrency(txn.amount)}
                  </p>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {txn.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for quick add */}
      <CreateCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
