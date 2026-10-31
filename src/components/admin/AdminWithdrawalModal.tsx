import React, { useState } from 'react';
import { ArrowUpRight, CircleDollarSign, ShieldCheck } from 'lucide-react';
import { BankAccount } from '../../types/banking';
import { useBanking } from '../../context/BankingContext';
import { formatAccountType, formatCurrency, maskAccountNumber } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface AdminWithdrawalModalProps {
  account: BankAccount;
  onClose: () => void;
}

export const AdminWithdrawalModal: React.FC<AdminWithdrawalModalProps> = ({ account, onClose }) => {
  const { adminWithdrawMoney } = useBanking();
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [identityVerified, setIdentityVerified] = useState(false);
  const [error, setError] = useState('');
  const remainingDailyLimit = Math.max(0, account.dailyWithdrawalLimit - account.withdrawnToday);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const withdrawalAmount = Number(amount);
    if (!Number.isFinite(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Enter a withdrawal amount greater than ₹0.00.');
      return;
    }

    const result = adminWithdrawMoney(
      account.id,
      withdrawalAmount,
      memo.trim() || 'Branch counter withdrawal',
      identityVerified
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
      title="Process customer withdrawal"
      subtitle="Record cash paid out at the branch and debit the selected account."
      maxWidth="md"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
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

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs">
          <div>
            <p className="text-slate-500">Daily withdrawal limit</p>
            <p className="mt-1 font-bold text-slate-900">{formatCurrency(account.dailyWithdrawalLimit)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">Remaining today</p>
            <p className="mt-1 font-bold text-slate-900">{formatCurrency(remainingDailyLimit)}</p>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="admin-withdrawal-amount" className="mb-1.5 block text-xs font-bold text-slate-700">
            Amount to withdraw (INR)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
            <input
              autoFocus
              id="admin-withdrawal-amount"
              type="number"
              min="0.01"
              step="0.01"
              max={Math.min(account.balance, remainingDailyLimit)}
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-bank-500 focus:ring-4 focus:ring-bank-100"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[500, 1000, 5000]
              .filter((quickAmount) => quickAmount <= account.balance && quickAmount <= remainingDailyLimit)
              .map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(String(quickAmount))}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-700"
                >
                  ₹{quickAmount.toLocaleString('en-IN')}
                </button>
              ))}
          </div>
        </div>

        <div>
          <label htmlFor="admin-withdrawal-memo" className="mb-1.5 block text-xs font-bold text-slate-700">
            Withdrawal note <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="admin-withdrawal-memo"
            type="text"
            maxLength={100}
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="e.g. Cash paid at branch counter"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-bank-500 focus:ring-4 focus:ring-bank-100"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-900">
          <input
            type="checkbox"
            checked={identityVerified}
            onChange={(event) => setIdentityVerified(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-bank-600"
          />
          <span>I verified the customer’s identity in person before paying out cash.</span>
        </label>

        <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-bank-600" />
          <p>This debit is subject to the account balance, frozen status, and remaining daily withdrawal limit.</p>
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
            disabled={!identityVerified}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowUpRight className="h-4 w-4" />
            Debit customer account
          </button>
        </div>
      </form>
    </Modal>
  );
};
