import React, { useState } from 'react';
import { ArrowDownLeft, CircleDollarSign, ShieldCheck } from 'lucide-react';
import { BankAccount } from '../../types/banking';
import { useBanking } from '../../context/BankingContext';
import { formatAccountType, formatCurrency, maskAccountNumber } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface AdminDepositModalProps {
  account: BankAccount;
  onClose: () => void;
}

export const AdminDepositModal: React.FC<AdminDepositModalProps> = ({ account, onClose }) => {
  const { depositMoney } = useBanking();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'Branch Cash' | 'Wire Transfer' | 'Mobile Check'>('Branch Cash');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const depositAmount = Number(amount);
    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      setError('Enter a deposit amount greater than ₹0.00.');
      return;
    }

    const result = depositMoney(
      account.id,
      depositAmount,
      method,
      memo.trim() || `${method} deposit accepted by branch`
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Accept customer deposit"
      subtitle="Record funds received at the branch and credit the selected account."
      maxWidth="md"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bank-100 text-bank-700">
            <CircleDollarSign className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{account.accountHolderName}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatAccountType(account.accountType)} · {maskAccountNumber(account.accountNumber)}
            </p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Current balance</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{formatCurrency(account.balance)}</p>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-deposit-amount" className="mb-1.5 block text-xs font-bold text-slate-700">
              Amount to credit (INR)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
              <input
                autoFocus
                id="admin-deposit-amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-bank-500 focus:ring-4 focus:ring-bank-100"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[500, 1000, 5000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(String(quickAmount))}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:border-bank-300 hover:text-bank-700"
                >
                  +₹{quickAmount.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="admin-deposit-method" className="mb-1.5 block text-xs font-bold text-slate-700">
              Deposit method
            </label>
            <select
              id="admin-deposit-method"
              value={method}
              onChange={(event) => setMethod(event.target.value as typeof method)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-bank-500 focus:ring-4 focus:ring-bank-100"
            >
              <option>Branch Cash</option>
              <option>Wire Transfer</option>
              <option>Mobile Check</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="admin-deposit-memo" className="mb-1.5 block text-xs font-bold text-slate-700">
            Receipt note <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="admin-deposit-memo"
            type="text"
            maxLength={100}
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="e.g. Cash deposit received at counter"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-bank-500 focus:ring-4 focus:ring-bank-100"
          />
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[11px] leading-relaxed text-emerald-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Posting this deposit updates the account balance and records the transaction in the customer and branch ledgers.</p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-bank-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-bank-600/20 hover:bg-bank-700"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Credit customer account
          </button>
        </div>
      </form>
    </Modal>
  );
};
