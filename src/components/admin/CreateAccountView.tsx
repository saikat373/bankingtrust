import React, { useState } from 'react';
import {
  UserPlus,
  Shield,
  CreditCard,
  Building,
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowRight,
  Printer,
  FileCheck,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { BankAccount } from '../../types/banking';
import { formatCurrency, formatAccountType } from '../../utils/formatters';

interface CreateAccountViewProps {
  onAccountCreated?: (newAccount: BankAccount) => void;
  onNavigateToAccounts: () => void;
}

export const CreateAccountView: React.FC<CreateAccountViewProps> = ({
  onAccountCreated,
  onNavigateToAccounts,
}) => {
  const { createCustomerAccount, currentUser } = useBanking();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1 (555) 321-8900');
  const [ssn, setSsn] = useState('123-45-6789');
  const [address, setAddress] = useState('500 Madison Ave, New York, NY 10022');
  const [accountType, setAccountType] = useState<BankAccount['accountType']>('checking');
  const [initialDeposit, setInitialDeposit] = useState('2500');
  const [dailyLimit, setDailyLimit] = useState('5000');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState<{
    account: BankAccount;
    holderName: string;
  } | null>(null);

  const dummyProfiles = [
    {
      name: 'Eleanor Vance',
      email: 'eleanor.vance@primecapital.io',
      phone: '+1 (212) 555-8912',
      ssn: '456-78-9123',
      address: '785 Fifth Avenue, New York, NY 10022',
      type: 'business' as const,
      deposit: '50000',
      daily: '25000',
    },
    {
      name: 'Julian Henderson',
      email: 'j.henderson@biotech-labs.org',
      phone: '+1 (415) 555-3478',
      ssn: '234-56-7890',
      address: '101 Montgomery St, San Francisco, CA 94104',
      type: 'savings' as const,
      deposit: '15000',
      daily: '10000',
    },
    {
      name: 'Dr. Evelyn Reed',
      email: 'evelyn.reed@medreserve.org',
      phone: '+1 (312) 555-9011',
      ssn: '789-01-2345',
      address: '200 E Randolph St, Chicago, IL 60601',
      type: 'checking' as const,
      deposit: '7500',
      daily: '5000',
    },
  ];

  const handleFillDummy = () => {
    const picked = dummyProfiles[Math.floor(Math.random() * dummyProfiles.length)];
    setFullName(picked.name);
    setEmail(picked.email);
    setPhone(picked.phone);
    setSsn(picked.ssn);
    setAddress(picked.address);
    setAccountType(picked.type);
    setInitialDeposit(picked.deposit);
    setDailyLimit(picked.daily);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email) {
      setError('Please provide customer’s legal full name and email.');
      return;
    }

    const depositNum = parseFloat(initialDeposit);
    if (isNaN(depositNum) || depositNum < 25) {
      setError('Minimum opening deposit for depository accounts is ₹25.00.');
      return;
    }

    if (pin.length !== 4) {
      setError('Security PIN must be exactly 4 digits.');
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

    if (res.success && res.newAccount) {
      setCreatedResult({
        account: res.newAccount,
        holderName: fullName,
      });
      if (onAccountCreated) {
        onAccountCreated(res.newAccount);
      }
    } else {
      setError(res.message);
    }
  };

  const handleResetForAnother = () => {
    setCreatedResult(null);
    setFullName('');
    setEmail('');
    setInitialDeposit('2500');
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Customer Account Issuance & Onboarding
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              Authorized Branch Admin
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Originate new retail or commercial accounts with Customer Identification Program (CIP) and immediate opening deposit funding.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillDummy}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition shadow-sm"
        >
          <Sparkles className="h-4 w-4" />
          <span>Auto-Fill Dummy Persona Data</span>
        </button>
      </div>

      {createdResult ? (
        /* Success Onboarding Certificate */
        <div className="rounded-3xl bg-white border border-slate-200/90 p-8 shadow-xl max-w-2xl mx-auto text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Account Successfully Issued
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Welcome, {createdResult.holderName}!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Account funded and registered into the core depository ledger.
            </p>
          </div>

          {/* Account Credential Slip */}
          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200 text-left text-xs space-y-3 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Issued Account Class:</span>
              <span className="font-bold text-slate-900 uppercase">
                {formatAccountType(createdResult.account.accountType)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Account Number:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {createdResult.account.accountNumber.match(/.{1,4}/g)?.join(' ')}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Routing Transit Number (ABA):</span>
              <span className="font-mono font-semibold text-slate-800">
                {createdResult.account.routingNumber}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Initial Opening Deposit:</span>
              <span className="font-mono font-black text-emerald-600 text-sm">
                +{formatCurrency(createdResult.account.balance)}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Authorized By Officer:</span>
              <span className="font-semibold text-slate-700">
                {currentUser?.name} ({currentUser?.department || 'Branch Operations'})
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleResetForAnother}
              className="flex-1 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              + Open Another Account
            </button>

            <button
              onClick={onNavigateToAccounts}
              className="flex-1 rounded-xl bg-bank-600 py-3 text-xs font-bold text-white shadow-md hover:bg-bank-700 transition"
            >
              View Customer Registry &rarr;
            </button>
          </div>
        </div>
      ) : (
        /* The Onboarding Form */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            {/* Step 1: Legal Identity */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bank-600 text-white text-xs font-bold">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Customer Legal Identity & KYC Profile
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Legal Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Evelyn Reed"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. evelyn.reed@medreserve.org"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Social Security Number / Tax ID
                  </label>
                  <input
                    type="text"
                    value={ssn}
                    onChange={(e) => setSsn(e.target.value)}
                    placeholder="•••-••-6789"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Residential or Registered Corporate Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, city, state, zip"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Step 2: Account Terms & Funding */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bank-600 text-white text-xs font-bold">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Account Class, Funding & Security Limits
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Classification
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:border-bank-500 focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="checking">Premier Checking (0.85% APY)</option>
                    <option value="savings">High-Yield Savings (4.65% APY)</option>
                    <option value="business">Commercial Enterprise (2.15% APY)</option>
                    <option value="money_market">Treasury Money Market (5.10% APY)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Withdrawal Ceiling (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="500"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold focus:border-bank-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Opening Deposit Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="25"
                    value={initialDeposit}
                    onChange={(e) => setInitialDeposit(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2.5 text-sm font-black text-slate-900 focus:border-bank-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Quick Chips */}
                <div className="mt-2 flex gap-2">
                  {['500', '1500', '5000', '25000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInitialDeposit(amt)}
                      className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition"
                    >
                      +₹{parseFloat(amt).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Security PIN (4 Digits)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-36 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono tracking-widest text-center focus:border-bank-500 focus:outline-none"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Client uses this PIN to authenticate withdrawals & transfers.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Preview & Action (1 col) */}
          <div className="space-y-6">
            {/* Live Interactive Card Preview */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-bank-950 to-slate-900 p-6 text-white shadow-xl border border-slate-700/60 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  AEGIS RESERVE
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Ready to Issue
                </span>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Account Classification</p>
                <p className="text-sm font-bold capitalize text-white">
                  {formatAccountType(accountType)}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Initial Depository Balance</p>
                <p className="text-2xl font-black text-white">
                  {formatCurrency(parseFloat(initialDeposit) || 0)}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 text-xs font-mono space-y-1">
                <p className="text-slate-300">Account #: 88•• •••• ••••</p>
                <p className="text-slate-400 text-[11px]">Routing: 021000021</p>
                <p className="text-[10px] text-slate-400 font-sans uppercase tracking-wider pt-1">
                  Holder: {fullName || 'New Client Profile'}
                </p>
              </div>
            </div>

            {/* Compliance Checklist Box */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Automated KYC/AML Verification</span>
              </h4>
              <ul className="text-[11px] text-slate-600 space-y-1.5">
                <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Customer Identification Program (CIP) Passed</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>OFAC Specially Designated Nationals (SDN) Clean</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Initial Deposit Ledger Hash Ready</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-bank-600 py-3 text-xs font-bold text-white shadow-md hover:bg-bank-700 transition flex items-center justify-center gap-2"
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Approve KYC & Issue Account</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
