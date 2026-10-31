import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Lock,
  Unlock,
  CreditCard,
  Download,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { formatCurrency, formatDate, maskAccountNumber } from '../../utils/formatters';
import { BankAccount } from '../../types/banking';
import { Modal } from '../common/Modal';
import { AdminDepositModal } from './AdminDepositModal';
import { AdminWithdrawalModal } from './AdminWithdrawalModal';

interface CustomerAccountsViewProps {
  onOpenCreateAccount: () => void;
}

export const CustomerAccountsView: React.FC<CustomerAccountsViewProps> = ({
  onOpenCreateAccount,
}) => {
  const { accounts, users, toggleAccountStatus, privacyMode, getAccountTransactions } = useBanking();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState<BankAccount | null>(null);
  const [depositAccount, setDepositAccount] = useState<BankAccount | null>(null);
  const [withdrawalAccount, setWithdrawalAccount] = useState<BankAccount | null>(null);

  const customerUsers = users.filter((u) => u.role === 'customer');
  const totalCustody = accounts.reduce((sum, a) => sum + a.balance, 0);
  const activeCount = accounts.filter((a) => a.status === 'active').length;
  const frozenCount = accounts.filter((a) => a.status === 'frozen').length;

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.accountHolderName.toLowerCase().includes(search.toLowerCase()) ||
      acc.accountNumber.includes(search) ||
      acc.accountType.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'ALL' || acc.accountType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || acc.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleExportCsv = () => {
    const headers = [
      'Account Holder',
      'Account Number',
      'Routing Number',
      'Account Type',
      'Balance (INR)',
      'Daily Limit',
      'Status',
      'Created Date',
    ];

    const rows = filteredAccounts.map((a) => [
      `"${a.accountHolderName}"`,
      `"${a.accountNumber}"`,
      `"${a.routingNumber}"`,
      `"${a.accountType.toUpperCase()}"`,
      a.balance.toFixed(2),
      a.dailyWithdrawalLimit.toFixed(2),
      `"${a.status.toUpperCase()}"`,
      `"${formatDate(a.createdAt)}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AegisBank_Customer_Accounts_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getAccountOwner = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  const openDeposit = (account: BankAccount) => {
    setSelectedAccountForDetail(null);
    setDepositAccount(account);
  };

  const openWithdrawal = (account: BankAccount) => {
    setSelectedAccountForDetail(null);
    setWithdrawalAccount(account);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Customer Account Management
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-bank-800 border border-bank-200">
              Account Registry
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Monitor client depository accounts, review compliance status, configure limits, and enforce account freezes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenCreateAccount}
            className="flex items-center gap-2 rounded-xl bg-bank-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-bank-600/20 hover:bg-bank-700 transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Open New Account</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Customer Accounts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-bank-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{accounts.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">Across {customerUsers.length} verified clients</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Depository Custody</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {privacyMode ? '••••••••' : formatCurrency(totalCustody)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">100% FDIC Backed</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Status</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">{activeCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Unrestricted operational accounts</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Frozen Accounts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700">{frozenCount}</p>
          <p className="mt-1 text-[11px] text-rose-600 font-medium">Debits restricted</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Client Depository Roster</h2>
            <p className="text-xs text-slate-500">
              Full directory of checking, savings, and commercial accounts managed at this branch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by holder, account #..."
                className="w-56 rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs focus:border-bank-500 focus:outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-bank-500 focus:outline-none"
            >
              <option value="ALL">All Account Types</option>
              <option value="checking">Premier Checking</option>
              <option value="savings">High-Yield Savings</option>
              <option value="business">Commercial Enterprise</option>
              <option value="money_market">Money Market</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-bank-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="frozen">Frozen Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Account Holder</th>
                <th className="px-4 py-3">Account Number</th>
                <th className="px-4 py-3">Account Class</th>
                <th className="px-4 py-3">Current Balance</th>
                <th className="px-4 py-3">Daily Limit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Admin Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No customer accounts matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isFrozen = acc.status === 'frozen';
                  const owner = getAccountOwner(acc.userId);

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{acc.accountHolderName}</div>
                        <div className="text-[11px] text-slate-400">{owner?.email || 'verified.client@aegis.com'}</div>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-600">
                          ✓ KYC Verified
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                        {maskAccountNumber(acc.accountNumber)}
                        <span className="block text-[10px] text-slate-400 font-sans">
                          Routing: {acc.routingNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-800 border border-slate-200">
                          {acc.accountType}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {acc.interestRate}% APY Yield
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 text-sm">
                        {privacyMode ? '••••••' : formatCurrency(acc.balance)}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {formatCurrency(acc.dailyWithdrawalLimit)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            isFrozen
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isFrozen ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                          {acc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDepositAccount(acc)}
                            disabled={isFrozen}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition disabled:cursor-not-allowed disabled:opacity-40"
                            title={isFrozen ? 'Unfreeze this account before accepting a deposit' : 'Accept a deposit for this account'}
                          >
                            <ArrowDownLeft className="h-3 w-3" />
                            Deposit
                          </button>
                          <button
                            onClick={() => openWithdrawal(acc)}
                            disabled={isFrozen}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200 hover:bg-rose-100 transition disabled:cursor-not-allowed disabled:opacity-40"
                            title={isFrozen ? 'Unfreeze this account before processing a withdrawal' : 'Process a customer withdrawal'}
                          >
                            <ArrowUpRight className="h-3 w-3" />
                            Withdraw
                          </button>
                          <button
                            onClick={() => setSelectedAccountForDetail(acc)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-bank-600 hover:bg-slate-100 transition"
                            title="View Account Details & Recent Transactions"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>

                          {isFrozen ? (
                            <button
                              onClick={() => toggleAccountStatus(acc.id, 'active')}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                            >
                              <Unlock className="h-3 w-3" />
                              Unfreeze
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleAccountStatus(acc.id, 'frozen')}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
                            >
                              <Lock className="h-3 w-3" />
                              Freeze
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Details Modal */}
      {selectedAccountForDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAccountForDetail(null)}
          title={`Account File: ${selectedAccountForDetail.accountHolderName}`}
          subtitle={`Account Number: ${selectedAccountForDetail.accountNumber} • Routing: ${selectedAccountForDetail.routingNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold">Account Tier</span>
                <p className="font-bold text-slate-900 capitalize text-sm">{selectedAccountForDetail.accountType}</p>
                <p className="text-slate-500 mt-1">APY: {selectedAccountForDetail.interestRate}%</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Ledger Balance</span>
                <p className="font-bold text-slate-900 text-lg">
                  {privacyMode ? '••••••' : formatCurrency(selectedAccountForDetail.balance)}
                </p>
                <p className="text-slate-500 mt-1">
                  Daily Limit: {formatCurrency(selectedAccountForDetail.dailyWithdrawalLimit)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Recent Transactions on this Account</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {getAccountTransactions(selectedAccountForDetail.id).length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4">No transactions on this account.</p>
                ) : (
                  getAccountTransactions(selectedAccountForDetail.id).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{t.description}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {t.referenceId} • {formatDate(t.timestamp)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-mono font-bold ${
                            t.type === 'deposit' || t.type === 'transfer_in'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {t.type === 'deposit' || t.type === 'transfer_in' ? '+' : '-'} {formatCurrency(t.amount)}
                        </p>
                        <span className="text-[10px] text-slate-400 uppercase">{t.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 pt-3 border-t border-slate-100 sm:flex-row sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => openDeposit(selectedAccountForDetail)}
                  disabled={selectedAccountForDetail.status === 'frozen'}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  Accept deposit
                </button>
                <button
                  onClick={() => openWithdrawal(selectedAccountForDetail)}
                  disabled={selectedAccountForDetail.status === 'frozen'}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Process withdrawal
                </button>
              </div>
              <button
                onClick={() => setSelectedAccountForDetail(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
      {depositAccount && (
        <AdminDepositModal
          account={depositAccount}
          onClose={() => setDepositAccount(null)}
        />
      )}
      {withdrawalAccount && (
        <AdminWithdrawalModal
          account={withdrawalAccount}
          onClose={() => setWithdrawalAccount(null)}
        />
      )}
    </div>
  );
};
