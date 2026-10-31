import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  TrendingUp,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { formatCurrency, formatDate, maskAccountNumber } from '../../utils/formatters';

export const BranchLedgerView: React.FC = () => {
  const { transactions, accounts, privacyMode } = useBanking();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Compute metrics
  let totalDeposits = 0;
  let totalWithdrawals = 0;

  transactions.forEach((t) => {
    if (t.type === 'deposit' || t.type === 'transfer_in') {
      totalDeposits += t.amount;
    } else if (t.type === 'withdrawal' || t.type === 'transfer_out') {
      totalWithdrawals += t.amount;
    }
  });

  const netVolume = totalDeposits - totalWithdrawals;

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.description.toLowerCase().includes(search.toLowerCase()) ||
      txn.referenceId.toLowerCase().includes(search.toLowerCase()) ||
      txn.category.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'deposits' && (txn.type === 'deposit' || txn.type === 'transfer_in')) ||
      (typeFilter === 'withdrawals' && (txn.type === 'withdrawal' || txn.type === 'transfer_out'));

    const matchesCategory = categoryFilter === 'ALL' || txn.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const handleExportCsv = () => {
    const headers = [
      'Reference ID',
      'Timestamp',
      'Description',
      'Category',
      'Type',
      'Amount',
      'Running Balance',
      'Audit Hash',
      'Status',
    ];

    const rows = filteredTransactions.map((t) => [
      `"${t.referenceId}"`,
      `"${formatDate(t.timestamp)}"`,
      `"${t.description}"`,
      `"${t.category}"`,
      `"${t.type.toUpperCase()}"`,
      (t.type === 'withdrawal' || t.type === 'transfer_out' ? -t.amount : t.amount).toFixed(2),
      t.runningBalance.toFixed(2),
      `"${t.auditHash}"`,
      `"${t.status.toUpperCase()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AegisBank_Branch_Ledger_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAccountInfo = (accountId: string) => {
    return accounts.find((a) => a.id === accountId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Branch Depository Ledger
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              Double-Entry Settlement
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time chronological record of all debits, credits, transfers, and settlements originating through this branch.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Ledger Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Inflow (Deposits)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {privacyMode ? '••••••••' : `+${formatCurrency(totalDeposits)}`}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Settled wires & cash credits</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Outflow (Debits)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">
            {privacyMode ? '••••••••' : `-${formatCurrency(totalWithdrawals)}`}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">ATM withdrawals & ACH debits</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Net Settlement Delta</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bank-50 text-bank-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {privacyMode ? '••••••••' : formatCurrency(netVolume)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">Positive Liquidity Inflow</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Transactions</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{transactions.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">All ledger records intact</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">General Branch Journal</h2>
            <p className="text-xs text-slate-500">
              Filter by reference ID, counterparty, or transaction type.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference #, memo..."
                className="w-56 rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs focus:border-bank-500 focus:outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-bank-500 focus:outline-none"
            >
              <option value="ALL">All Debits & Credits</option>
              <option value="deposits">Deposits (+)</option>
              <option value="withdrawals">Withdrawals (-)</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-bank-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Cash Deposit">Cash Deposit</option>
              <option value="ATM Withdrawal">ATM Withdrawal</option>
              <option value="Online Wire">Online Wire</option>
              <option value="Salary">Salary Direct Deposit</option>
              <option value="Internal Transfer">Internal Transfer</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Reference ID</th>
                <th className="px-4 py-3">Account & Holder</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Debit (-)</th>
                <th className="px-4 py-3 text-right">Credit (+)</th>
                <th className="px-4 py-3 text-right">Running Balance</th>
                <th className="px-4 py-3">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No ledger transactions matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const isDeposit = txn.type === 'deposit' || txn.type === 'transfer_in';
                  const isWithdrawal = txn.type === 'withdrawal' || txn.type === 'transfer_out';
                  const acc = getAccountInfo(txn.accountId);

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                        {formatDate(txn.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                        {txn.referenceId}
                      </td>
                      <td className="px-4 py-3 font-sans whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {acc?.accountHolderName || 'Depository Client'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {acc ? maskAccountNumber(acc.accountNumber) : '••••'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-sans font-medium text-slate-800 max-w-xs truncate" title={txn.description}>
                        {txn.description}
                      </td>
                      <td className="px-4 py-3 font-sans whitespace-nowrap">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                          {txn.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600 whitespace-nowrap">
                        {isWithdrawal ? `-${formatCurrency(txn.amount)}` : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                        {isDeposit ? `+${formatCurrency(txn.amount)}` : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {privacyMode ? '••••••' : formatCurrency(txn.runningBalance)}
                      </td>
                      <td className="px-4 py-3 text-[10px] text-slate-400 whitespace-nowrap">
                        {txn.auditHash}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
