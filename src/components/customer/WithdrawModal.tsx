import React, { useState } from 'react';
import { ArrowUpRight, ShieldAlert, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { PinPadModal } from '../common/PinPadModal';
import { useBanking } from '../../context/BankingContext';
import { BankAccount } from '../../types/banking';
import { formatCurrency, maskAccountNumber } from '../../utils/formatters';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAccount?: BankAccount;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  defaultAccount,
}) => {
  const { getUserAccounts, withdrawMoney } = useBanking();
  const accounts = getUserAccounts();

  const [selectedAccountId, setSelectedAccountId] = useState(
    defaultAccount?.id || accounts[0]?.id || ''
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Counter Cash Withdrawal');
  const [error, setError] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const quickAmounts = [100, 200, 500, 1000];

  const remainingDailyLimit = selectedAccount
    ? Math.max(0, selectedAccount.dailyWithdrawalLimit - selectedAccount.withdrawnToday)
    : 0;

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const withdrawNum = parseFloat(amount);
    if (isNaN(withdrawNum) || withdrawNum <= 0) {
      setError('Please specify a positive withdrawal amount.');
      return;
    }

    if (!selectedAccount) {
      setError('Please select an account.');
      return;
    }

    if (selectedAccount.status === 'frozen') {
      setError('This account is currently frozen. Debits are prohibited.');
      return;
    }

    if (withdrawNum > selectedAccount.balance) {
      setError(`Insufficient funds. Your available balance is ${formatCurrency(selectedAccount.balance)}.`);
      return;
    }

    if (withdrawNum > remainingDailyLimit) {
      setError(
        `Exceeds daily remaining limit. You can withdraw up to ${formatCurrency(remainingDailyLimit)} today.`
      );
      return;
    }

    // Amount is valid, open Security PIN Verification pad!
    setIsPinModalOpen(true);
  };

  const handlePinVerified = (pin: string) => {
    setIsPinModalOpen(false);
    const withdrawNum = parseFloat(amount);

    const res = withdrawMoney(selectedAccount.id, withdrawNum, pin, description);

    if (res.success) {
      setSuccessReceipt({
        amount: withdrawNum,
        referenceId: res.transaction?.referenceId,
        date: res.transaction?.timestamp,
        newBalance: res.transaction?.runningBalance,
        accountNumber: selectedAccount.accountNumber,
      });
      setAmount('');
    } else {
      setError(res.message);
    }
  };

  const handleClose = () => {
    setSuccessReceipt(null);
    setError('');
    setIsPinModalOpen(false);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isPinModalOpen}
        onClose={handleClose}
        title="Withdraw Money"
        subtitle="Security PIN authorization required for all debits"
        maxWidth="md"
      >
        {successReceipt ? (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 ring-8 ring-rose-50">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Withdrawal Authorized & Complete</h3>
              <p className="text-xs text-slate-500">Official Banking Debit Receipt</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Debited Amount:</span>
                <span className="font-bold text-rose-600 text-sm">
                  -{formatCurrency(successReceipt.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Debited Account:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {maskAccountNumber(successReceipt.accountNumber)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining Balance:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(successReceipt.newBalance)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-mono text-[11px]">
                <span className="text-slate-400">Reference ID:</span>
                <span className="font-bold text-slate-700">{successReceipt.referenceId}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full rounded-xl bg-bank-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-bank-700 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleInitialSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Account Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Debit From Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:border-bank-500 focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountHolderName} - {acc.accountType.toUpperCase()} (•••• {acc.accountNumber.slice(-4)}) - Available: {formatCurrency(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Daily Limit Tracker Pill */}
            {selectedAccount && (
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Daily Withdrawal Limit Remaining:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(remainingDailyLimit)} of {formatCurrency(selectedAccount.dailyWithdrawalLimit)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-bank-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (selectedAccount.withdrawnToday / selectedAccount.dailyWithdrawalLimit) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Amount input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Withdrawal Amount (INR)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 focus:border-bank-500 focus:outline-none"
                  required
                />
              </div>

              {/* Quick chips */}
              <div className="mt-2 flex gap-1.5">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition"
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Purpose / Memo
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Travel cash, vendor settlement"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
              />
            </div>

            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                Step 2 will prompt for your 4-digit Security PIN on a virtual encrypted keypad.
              </span>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition flex items-center gap-1.5"
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>Continue to PIN Verification</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Security Virtual Pin Pad Modal */}
      <PinPadModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerify={handlePinVerified}
        title="Authorize Withdrawal"
        actionDescription={`Authorizing withdrawal of ₹${parseFloat(amount || '0').toFixed(2)} from •••• ${selectedAccount?.accountNumber.slice(-4)}`}
      />
    </>
  );
};
