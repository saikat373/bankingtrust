import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { Modal } from '../common/Modal';
import { PinPadModal } from '../common/PinPadModal';
import { useBanking } from '../../context/BankingContext';
import { BankAccount } from '../../types/banking';
import { formatCurrency, maskAccountNumber } from '../../utils/formatters';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAccount?: BankAccount;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  defaultAccount,
}) => {
  const { getUserAccounts, accounts: allAccounts, transferMoney } = useBanking();
  const myAccounts = getUserAccounts();

  const [sourceAccountId, setSourceAccountId] = useState(
    defaultAccount?.id || myAccounts[0]?.id || ''
  );
  const [targetAccountNumber, setTargetAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Account Reallocation');
  const [error, setError] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  const sourceAccount = myAccounts.find((a) => a.id === sourceAccountId) || myAccounts[0];

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const transferNum = parseFloat(amount);
    if (isNaN(transferNum) || transferNum <= 0) {
      setError('Please specify a positive transfer amount.');
      return;
    }

    if (!targetAccountNumber) {
      setError('Please provide or select a target account number.');
      return;
    }

    if (!sourceAccount) {
      setError('Please select a source account.');
      return;
    }

    if (sourceAccount.balance < transferNum) {
      setError(`Insufficient funds. Your balance is ${formatCurrency(sourceAccount.balance)}.`);
      return;
    }

    setIsPinModalOpen(true);
  };

  const handlePinVerified = (pin: string) => {
    setIsPinModalOpen(false);
    const transferNum = parseFloat(amount);

    const res = transferMoney(
      sourceAccount.id,
      targetAccountNumber,
      transferNum,
      pin,
      description
    );

    if (res.success) {
      setSuccessReceipt({
        amount: transferNum,
        referenceId: res.transaction?.referenceId,
        sourceAccount: sourceAccount.accountNumber,
        targetAccount: targetAccountNumber,
        newBalance: res.transaction?.runningBalance,
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
        title="Transfer Funds"
        subtitle="Secure encrypted transfer between internal or external accounts"
        maxWidth="md"
      >
        {successReceipt ? (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Transfer Completed Successfully</h3>
              <p className="text-xs text-slate-500">Official Electronic Transfer Receipt</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Transferred Amount:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatCurrency(successReceipt.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">From Account:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {maskAccountNumber(successReceipt.sourceAccount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">To Destination:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {maskAccountNumber(successReceipt.targetAccount)}
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

            {/* Source Account */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                From Account
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:border-bank-500 focus:outline-none"
              >
                {myAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountType.toUpperCase()} (•••• {acc.accountNumber.slice(-4)}) - {formatCurrency(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Account */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  To Destination Account
                </label>
                <div className="flex gap-2">
                  {myAccounts
                    .filter((a) => a.id !== sourceAccountId)
                    .map((other) => (
                      <button
                        key={other.id}
                        type="button"
                        onClick={() => setTargetAccountNumber(other.accountNumber)}
                        className="text-[10px] text-bank-600 font-bold hover:underline"
                      >
                        + My {other.accountType}
                      </button>
                    ))}
                </div>
              </div>
              <input
                type="text"
                value={targetAccountNumber}
                onChange={(e) => setTargetAccountNumber(e.target.value)}
                placeholder="Enter 12-digit account number or choose from above"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono focus:border-bank-500 focus:outline-none"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (INR)
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
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reference Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Rent, savings split, contractor invoice"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
              />
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
                className="rounded-xl bg-bank-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-bank-700 transition flex items-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                <span>Verify & Transfer</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      <PinPadModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerify={handlePinVerified}
        title="Authorize Transfer"
        actionDescription={`Enter security PIN to authorize transfer of ₹${parseFloat(amount || '0').toFixed(2)}`}
      />
    </>
  );
};
