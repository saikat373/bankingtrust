import React, { useState } from 'react';
import {
  Printer,
  Download,
  Filter,
  Search,
  Calendar,
  Building,
  CreditCard,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { BankAccount, TransactionType } from '../../types/banking';
import { formatCurrency } from '../../utils/formatters';
import { exportStatementToCsv, triggerPrintStatement } from '../../utils/statementGenerator';
import { PrintableStatement } from '../print/PrintableStatement';

interface StatementViewProps {
  initialAccount?: BankAccount;
}

export const StatementView: React.FC<StatementViewProps> = ({ initialAccount }) => {
  const { currentUser, getUserAccounts, getAccountTransactions, addAuditLog } = useBanking();
  const accounts = getUserAccounts();

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    initialAccount?.id || accounts[0]?.id || ''
  );

  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const allAccountTxns = selectedAccount ? getAccountTransactions(selectedAccount.id) : [];

  // Filter transactions
  const filteredTransactions = allAccountTxns.filter((txn) => {
    // Type Filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'deposits' && txn.type !== 'deposit' && txn.type !== 'transfer_in') {
        return false;
      }
      if (typeFilter === 'withdrawals' && txn.type !== 'withdrawal' && txn.type !== 'transfer_out') {
        return false;
      }
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        txn.description.toLowerCase().includes(q) ||
        txn.referenceId.toLowerCase().includes(q) ||
        txn.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Date Range Filter
    const txnDate = new Date(txn.timestamp).getTime();
    const now = Date.now();

    if (dateRangeFilter === '30days') {
      const cutoff = now - 30 * 24 * 60 * 60 * 1000;
      if (txnDate < cutoff) return false;
    } else if (dateRangeFilter === '90days') {
      const cutoff = now - 90 * 24 * 60 * 60 * 1000;
      if (txnDate < cutoff) return false;
    } else if (dateRangeFilter === 'custom') {
      if (customStartDate && txnDate < new Date(customStartDate).getTime()) return false;
      if (customEndDate && txnDate > new Date(customEndDate).getTime() + 86400000) return false;
    }

    return true;
  });

  const handlePrint = () => {
    if (selectedAccount && currentUser) {
      addAuditLog(
        'STATEMENT_PRINTED',
        `Official statement printed for Account •••• ${selectedAccount.accountNumber.slice(-4)} (${filteredTransactions.length} records)`,
        'INFO'
      );
      triggerPrintStatement();
    }
  };

  const handleExportCsv = () => {
    if (selectedAccount && currentUser) {
      addAuditLog(
        'STATEMENT_EXPORTED_CSV',
        `Exported CSV statement for Account •••• ${selectedAccount.accountNumber.slice(-4)}`,
        'INFO'
      );
      exportStatementToCsv(
        selectedAccount,
        currentUser,
        filteredTransactions,
        customStartDate,
        customEndDate
      );
    }
  };

  if (!selectedAccount || !currentUser) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
        No accounts available for statement generation.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden during actual print) */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Official Account Statement</h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                Audited & Certified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generate, filter, print, and export bank-grade account records with full ledger integrity.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-bank-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-bank-600/20 hover:bg-bank-700 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Statement</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Account Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Select Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:border-bank-500 focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountType.toUpperCase()} (•••• {acc.accountNumber.slice(-4)}) - {formatCurrency(acc.balance)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Time Period
            </label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:border-bank-500 focus:outline-none"
            >
              <option value="all">Complete Account Inception</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Activity Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:border-bank-500 focus:outline-none"
            >
              <option value="all">All Debits & Credits</option>
              <option value="deposits">Deposits Only (+)</option>
              <option value="withdrawals">Withdrawals & Debits (-)</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Search Transactions
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Description or ref #"
                className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Custom Date Pickers if selected */}
        {dateRangeFilter === 'custom' && (
          <div className="mt-3 flex items-center gap-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-semibold">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-700"
            />
            <span className="text-xs text-slate-500 font-semibold">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-700"
            />
          </div>
        )}
      </div>

      {/* Official Printable Statement Layout */}
      <div className="printable-container">
        <PrintableStatement
          account={selectedAccount}
          user={currentUser}
          transactions={filteredTransactions}
          startDate={dateRangeFilter === 'custom' ? customStartDate : undefined}
          endDate={dateRangeFilter === 'custom' ? customEndDate : undefined}
        />
      </div>
    </div>
  );
};
