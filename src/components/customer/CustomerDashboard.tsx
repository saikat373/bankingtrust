import React, { useState } from 'react';
import {
  ArrowUpRight,
  Send,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { BankAccount } from '../../types/banking';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AccountCard } from './AccountCard';
import { BalanceTrendChart } from './BalanceTrendChart';
import { WithdrawModal } from './WithdrawModal';
import { TransferModal } from './TransferModal';
import { StatementView } from './StatementView';

interface CustomerDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    currentUser,
    getUserAccounts,
    transactions,
    privacyMode,
  } = useBanking();

  const accounts = getUserAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [targetModalAccount, setTargetModalAccount] = useState<BankAccount | undefined>(undefined);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const handleWithdrawAccount = (acc: BankAccount) => {
    setTargetModalAccount(acc);
    setIsWithdrawOpen(true);
  };

  const handleStatementAccount = (acc: BankAccount) => {
    setSelectedAccountId(acc.id);
    setActiveTab('statement');
  };

  if (activeTab === 'statement') {
    return <StatementView initialAccount={activeAccount} />;
  }

  if (activeTab === 'withdraw') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Withdraw Funds</h1>
            <p className="text-xs text-slate-500 mt-1">Debit cash with daily limit enforcement and PIN authorization.</p>
          </div>
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Open Withdrawal Terminal</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              privacyMode={privacyMode}
              isSelected={selectedAccountId === acc.id}
              onSelect={() => setSelectedAccountId(acc.id)}
              onWithdraw={handleWithdrawAccount}
              onStatement={handleStatementAccount}
            />
          ))}
        </div>
        <WithdrawModal
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          defaultAccount={targetModalAccount || activeAccount}
        />
      </div>
    );
  }

  if (activeTab === 'transfer') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Transfer Capital</h1>
            <p className="text-xs text-slate-500 mt-1">Reallocate funds between accounts or send an external wire.</p>
          </div>
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-bank-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-bank-700 transition"
          >
            <Send className="h-4 w-4" />
            <span>Initiate Transfer</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              privacyMode={privacyMode}
              isSelected={selectedAccountId === acc.id}
              onSelect={() => setSelectedAccountId(acc.id)}
              onWithdraw={handleWithdrawAccount}
              onStatement={handleStatementAccount}
            />
          ))}
        </div>
        <TransferModal
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          defaultAccount={activeAccount}
        />
      </div>
    );
  }

  // Filter transactions for this customer
  const customerTxns = transactions.filter((t) => t.userId === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="welcome-panel relative flex flex-col gap-6 overflow-hidden rounded-[28px] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Welcome back, {currentUser?.name?.split(' ')[0]}
            </h1>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-2.5 py-0.5 text-xs font-bold text-emerald-100">
              Verified Client
            </span>
          </div>
          <p className="mt-2 text-xs text-white/65">
            Your money, moving with you. Here&apos;s your financial overview.
          </p>
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Total balance</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {privacyMode ? '••••••••' : formatCurrency(totalBalance)}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Your accounts are protected and active
            </p>
            <p className="mt-3 text-xs text-white/60">
              Need to add funds? A branch administrator can credit your account.
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 sm:max-w-[230px] sm:justify-end">
          <button
            onClick={() => {
              if (activeAccount) setTargetModalAccount(activeAccount);
              setIsWithdrawOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition active:scale-95"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Withdraw</span>
          </button>

          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-bank-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-bank-700 transition active:scale-95"
          >
            <Send className="h-4 w-4" />
            <span>Transfer</span>
          </button>

          <button
            onClick={() => setActiveTab('statement')}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white shadow-sm backdrop-blur hover:bg-white/20 transition active:scale-95"
          >
            <Printer className="h-4 w-4 text-white/70" />
            <span>Statement</span>
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Depository Accounts</h2>
            <p className="text-xs text-slate-500">Review balances, withdraw funds, or open a statement.</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {accounts.length} Active Card{accounts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              privacyMode={privacyMode}
              isSelected={selectedAccountId === acc.id}
              onSelect={() => setSelectedAccountId(acc.id)}
              onWithdraw={handleWithdrawAccount}
              onStatement={handleStatementAccount}
            />
          ))}
        </div>
      </div>

      <BalanceTrendChart account={activeAccount} transactions={customerTxns} privacyMode={privacyMode} />

      {/* Recent Activity Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Account Activity</h2>
            <p className="text-xs text-slate-500">
              Double-entry verified ledger transactions with running balance and cryptographic audit hashes.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('statement')}
            className="flex items-center gap-1.5 text-xs font-bold text-bank-600 hover:text-bank-800 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Generate Certified Statement &rarr;</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reference #</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Running Balance</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {customerTxns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    No transactions recorded on this account yet.
                  </td>
                </tr>
              ) : (
                customerTxns.map((txn) => {
                  const isDeposit = txn.type === 'deposit' || txn.type === 'transfer_in';
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                        {formatDate(txn.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {txn.referenceId}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {txn.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {txn.category}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-bold whitespace-nowrap ${
                          isDeposit ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isDeposit ? '+' : '-'} {formatCurrency(txn.amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {privacyMode ? '••••••' : formatCurrency(txn.runningBalance)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Settled
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        defaultAccount={targetModalAccount || activeAccount}
      />
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        defaultAccount={activeAccount}
      />
    </div>
  );
};
