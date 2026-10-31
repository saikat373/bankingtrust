import React, { useState } from 'react';
import { UserPlus, Shield, CreditCard, Building2, Lock, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useBanking } from '../../context/BankingContext';
import { BankAccount } from '../../types/banking';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createCustomerAccount } = useBanking();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1 (555) 321-8900');
  const [ssn, setSsn] = useState('123-45-6789');
  const [address, setAddress] = useState('500 Madison Ave, New York, NY 10022');
  const [accountType, setAccountType] = useState<BankAccount['accountType']>('checking');
  const [initialDeposit, setInitialDeposit] = useState('1500');
  const [dailyLimit, setDailyLimit] = useState('5000');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');

  const handleFillDummy = () => {
    const dummyNames = [
      { name: 'Chloe Montgomery', email: 'chloe.m@fintechcapital.com', type: 'business' as const, dep: '25000' },
      { name: 'Julian Vance', email: 'julian.vance@prime.net', type: 'savings' as const, dep: '8500' },
      { name: 'Dr. Evelyn Reed', email: 'evelyn.reed@medreserve.org', type: 'checking' as const, dep: '3200' },
    ];
    const picked = dummyNames[Math.floor(Math.random() * dummyNames.length)];
    setFullName(picked.name);
    setEmail(picked.email);
    setAccountType(picked.type);
    setInitialDeposit(picked.dep);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email) {
      setError('Please provide the customer’s full legal name and email.');
      return;
    }

    const depositNum = parseFloat(initialDeposit);
    if (isNaN(depositNum) || depositNum < 25) {
      setError('Minimum opening deposit for this account class is ₹25.00');
      return;
    }

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    const res = createCustomerAccount({
      fullName,
      email,
      phone,
      ssn,
      address,
      accountType,
      initialDeposit: depositNum,
      dailyLimit: parseFloat(dailyLimit) || 5000,
      pin,
    });

    if (res.success) {
      setFullName('');
      setEmail('');
      setError('');
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Open New Customer Bank Account"
      subtitle="Admin Authorization: Complete KYC onboarding and initial deposit funding"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center bg-bank-50/60 p-2.5 rounded-xl border border-bank-100">
          <span className="text-xs text-bank-800 font-semibold">Testing helper:</span>
          <button
            type="button"
            onClick={handleFillDummy}
            className="text-xs text-bank-600 font-bold hover:underline"
          >
            Auto-fill Dummy Client Data &rarr;
          </button>
        </div>

        {/* Customer Identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Customer Legal Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. eleanor.vance@example.com"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Social Security / Tax ID (Masked in Logs)
            </label>
            <input
              type="text"
              value={ssn}
              onChange={(e) => setSsn(e.target.value)}
              placeholder="•••-••-6789"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Residential / Registered Business Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
          />
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Account Type
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:border-bank-500 focus:outline-none"
            >
              <option value="checking">Premier Checking (0.85% APY)</option>
              <option value="savings">High-Yield Savings (4.65% APY)</option>
              <option value="business">Commercial Enterprise (2.15% APY)</option>
              <option value="money_market">Treasury Money Market (5.10% APY)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Initial Deposit (₹ INR)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="25"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-7 pr-3 py-2 text-xs font-bold focus:border-bank-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Daily Withdrawal Limit
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                ₹
              </span>
              <input
                type="number"
                step="500"
                min="500"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-7 pr-3 py-2 text-xs font-bold focus:border-bank-500 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Customer Transaction Security PIN (4 Digits)
          </label>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="1234"
            className="w-36 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none font-mono tracking-widest text-center"
            required
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Customer will use this PIN to authenticate withdrawals and transfers.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-bank-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-bank-700 transition flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Approve & Issue Account</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
