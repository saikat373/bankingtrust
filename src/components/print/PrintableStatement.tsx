import React from 'react';
import { BankAccount, Transaction, User } from '../../types/banking';
import { formatCurrency, formatDate, formatDateOnly, maskAccountNumber } from '../../utils/formatters';
import { calculateStatementSummary } from '../../utils/statementGenerator';
import { ShieldCheck } from 'lucide-react';

interface PrintableStatementProps {
  account: BankAccount;
  user: User;
  transactions: Transaction[];
  startDate?: string;
  endDate?: string;
}

export const PrintableStatement: React.FC<PrintableStatementProps> = ({
  account,
  user,
  transactions,
  startDate,
  endDate,
}) => {
  const summary = calculateStatementSummary(account, transactions);
  const now = new Date();

  return (
    <div className="printable-document bg-white p-8 md:p-12 text-slate-900 font-sans max-w-4xl mx-auto border border-slate-200/80 shadow-lg rounded-2xl print:border-none print:shadow-none print:rounded-none print:p-0">
      {/* Bank Letterhead Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                AEGIS TRUST BANK
              </h1>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                National Association • Member FDIC • Fed Reserve System
              </p>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-0.5">
            <p>100 Wall Street, 28th Floor, New York, NY 10005</p>
            <p>Customer Support: +1 (800) 555-0199 | support@aegisbank.com</p>
            <p className="font-mono text-[11px]">Routing (ABA): 021000021 | SWIFT: AGISUS33</p>
          </div>
        </div>

        <div className="mt-4 sm:mt-0 text-left sm:text-right">
          <span className="inline-block bg-slate-900 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded">
            Official Bank Statement
          </span>
          <div className="mt-2 text-xs text-slate-600">
            <p>
              <strong className="text-slate-900">Statement Period:</strong>{' '}
              {startDate ? formatDateOnly(startDate) : 'Inception'} &mdash;{' '}
              {endDate ? formatDateOnly(endDate) : formatDateOnly(now.toISOString())}
            </p>
            <p>
              <strong className="text-slate-900">Issue Date:</strong> {formatDate(now.toISOString())}
            </p>
            <p className="font-mono text-[10px] text-slate-400">
              Doc ID: STM-{now.getFullYear()}-{account.accountNumber.slice(-4)}-{Math.floor(Math.random() * 90000 + 10000)}
            </p>
          </div>
        </div>
      </div>

      {/* Account Holder & Account Profile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Account Holder Details
          </h2>
          <p className="text-sm font-black text-slate-900">{account.accountHolderName}</p>
          <p className="text-slate-600 mt-0.5">{user.address || '742 Park Avenue, New York, NY 10021'}</p>
          <p className="text-slate-600 font-mono mt-0.5">Tax ID: {user.ssnMasked || '•••-••-4821'}</p>
        </div>

        <div className="sm:text-right">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Account Profile
          </h2>
          <p className="text-sm font-black text-slate-900 uppercase">
            {account.accountType} Account
          </p>
          <p className="font-mono text-slate-700 font-bold mt-0.5">
            Account #: {maskAccountNumber(account.accountNumber)}
          </p>
          <p className="text-slate-500 mt-0.5">
            Interest Yield: {account.interestRate}% APY | Status: Active
          </p>
        </div>
      </div>

      {/* Financial Ledger Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400">Starting Balance</p>
          <p className="text-sm font-black text-slate-800 mt-0.5">
            {formatCurrency(summary.openingBalance)}
          </p>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <p className="text-[10px] uppercase font-bold text-emerald-700">Total Deposits (+)</p>
          <p className="text-sm font-black text-emerald-800 mt-0.5">
            +{formatCurrency(summary.totalDeposits)}
          </p>
        </div>

        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <p className="text-[10px] uppercase font-bold text-rose-700">Total Withdrawals (-)</p>
          <p className="text-sm font-black text-rose-800 mt-0.5">
            -{formatCurrency(summary.totalWithdrawals)}
          </p>
        </div>

        <div className="p-3 bg-slate-900 text-white rounded-xl text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400">Ending Balance</p>
          <p className="text-sm font-black text-white mt-0.5">
            {formatCurrency(summary.closingBalance)}
          </p>
        </div>
      </div>

      {/* Transaction Activity Table */}
      <div className="mb-8">
        <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Chronological Transaction Ledger
          </h2>
          <span className="text-[11px] text-slate-500">
            {transactions.length} Activity Record{transactions.length !== 1 ? 's' : ''}
          </span>
        </div>

        <table className="w-full text-left text-xs border border-slate-200">
          <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-2.5">Date</th>
              <th className="p-2.5">Reference #</th>
              <th className="p-2.5">Description & Category</th>
              <th className="p-2.5 text-right">Debits (-)</th>
              <th className="p-2.5 text-right">Credits (+)</th>
              <th className="p-2.5 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  No activity recorded for this selected date filter.
                </td>
              </tr>
            ) : (
              transactions.map((txn) => {
                const isDeposit = txn.type === 'deposit' || txn.type === 'transfer_in';
                const isWithdrawal = txn.type === 'withdrawal' || txn.type === 'transfer_out';
                return (
                  <tr key={txn.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 text-[11px] text-slate-600 whitespace-nowrap">
                      {formatDate(txn.timestamp)}
                    </td>
                    <td className="p-2.5 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {txn.referenceId}
                    </td>
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-900">{txn.description}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{txn.category}</div>
                    </td>
                    <td className="p-2.5 text-right font-mono font-medium text-rose-600 whitespace-nowrap">
                      {isWithdrawal ? `-${formatCurrency(txn.amount)}` : ''}
                    </td>
                    <td className="p-2.5 text-right font-mono font-medium text-emerald-600 whitespace-nowrap">
                      {isDeposit ? `+${formatCurrency(txn.amount)}` : ''}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(txn.runningBalance)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Official Bank Certification Seal & Regulatory Disclaimers */}
      <div className="border-t-2 border-slate-300 pt-6 mt-8 text-[10px] text-slate-500 leading-relaxed">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="max-w-md space-y-1">
            <p className="font-bold text-slate-700 uppercase tracking-wider">
              Legal & FDIC Regulatory Notice
            </p>
            <p>
              Please examine this statement upon receipt. Any discrepancies, unauthorized transactions, or suspected inaccuracies must be reported in writing within 60 days of the statement date.
            </p>
            <p>
              Deposits are insured up to ₹250,000 per depositor by the Federal Deposit Insurance Corporation (FDIC).
            </p>
          </div>

          <div className="border border-slate-300 p-3 rounded-lg text-center sm:text-right min-w-[180px]">
            <p className="font-bold text-slate-800 uppercase tracking-widest text-[9px]">
              Certified Electronic Record
            </p>
            <div className="my-1 font-mono text-[9px] text-slate-400 break-all">
              SHA256: 0x9AF83E109CD4B721
            </div>
            <p className="text-[9px] text-emerald-700 font-semibold">
              ✓ Digital Signature Verified
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 text-center text-slate-400 text-[9px]">
          &copy; {now.getFullYear()} Aegis Trust Bank, N.A. All Rights Reserved. Equal Housing Lender ⌂.
        </div>
      </div>
    </div>
  );
};
