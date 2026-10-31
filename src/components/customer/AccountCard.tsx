import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  ArrowUpRight,
  Printer,
  Wifi,
} from 'lucide-react';
import { BankAccount } from '../../types/banking';
import { formatCurrency, formatAccountType } from '../../utils/formatters';

interface AccountCardProps {
  account: BankAccount;
  privacyMode: boolean;
  onWithdraw: (acc: BankAccount) => void;
  onStatement: (acc: BankAccount) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  privacyMode,
  onWithdraw,
  onStatement,
  isSelected,
  onSelect,
}) => {
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modern refined card finishes
  const cardThemes = {
    checking: {
      bg: 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950',
      border: 'border-slate-700/60',
      accent: 'text-bank-400',
      chip: 'from-amber-200 via-amber-300 to-amber-100 border-amber-400/60',
      badge: 'bg-bank-500/20 text-bank-300 border-bank-400/30',
    },
    savings: {
      bg: 'bg-gradient-to-br from-teal-950 via-emerald-950 to-slate-950',
      border: 'border-emerald-700/50',
      accent: 'text-emerald-400',
      chip: 'from-amber-200 via-amber-300 to-amber-100 border-amber-400/60',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    },
    business: {
      bg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950',
      border: 'border-indigo-700/50',
      accent: 'text-indigo-400',
      chip: 'from-amber-200 via-amber-300 to-amber-100 border-amber-400/60',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    },
    money_market: {
      bg: 'bg-gradient-to-br from-stone-900 via-neutral-900 to-slate-950',
      border: 'border-stone-700/50',
      accent: 'text-amber-400',
      chip: 'from-amber-200 via-amber-300 to-amber-100 border-amber-400/60',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    },
  };

  const theme = cardThemes[account.accountType] || cardThemes.checking;
  const isFrozen = account.status === 'frozen';

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white border shadow-md transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-bank-500 ring-4 ring-bank-100 shadow-xl scale-[1.01]'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-lg'
      }`}
    >
      {/* Upper Card Face (Sleek Physical Bank Card) */}
      <div className={`relative p-6 text-white ${theme.bg} overflow-hidden`}>
        {/* Subtle geometric holographic pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/30 pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-white/90 uppercase block leading-none">
                AEGIS TRUST
              </span>
              <span className="text-[9px] font-medium text-white/60 tracking-wider uppercase">
                Reserve Card
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {account.interestRate > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold border backdrop-blur-sm ${theme.badge}`}
              >
                {account.interestRate}% APY
              </span>
            )}

            {isFrozen ? (
              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40">
                Frozen
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            )}
          </div>
        </div>

        {/* Chip & Contactless Symbol */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          {/* Gold EMV Chip graphic */}
          <div className="h-8 w-11 rounded-md bg-gradient-to-tr from-amber-200 via-amber-300 to-amber-100 border border-amber-400/80 shadow-md flex items-center justify-center p-1">
            <div className="h-full w-full border border-amber-600/40 rounded flex flex-col justify-between">
              <div className="h-[1px] bg-amber-700/30 w-full" />
              <div className="h-[1px] bg-amber-700/30 w-full" />
            </div>
          </div>

          <Wifi className="h-5 w-5 text-white/40 rotate-90" />
        </div>

        {/* Account Number with Reveal/Copy */}
        <div className="relative z-10 mb-4">
          <div className="flex items-center justify-between font-mono text-sm tracking-[0.2em] text-white/90">
            <span>
              {showFullNumber && !privacyMode
                ? account.accountNumber.match(/.{1,4}/g)?.join('  ')
                : `••••  ••••  ••••  ${account.accountNumber.slice(-4)}`}
            </span>

            <div className="flex items-center gap-1 font-sans">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullNumber(!showFullNumber);
                }}
                className="rounded-lg p-1 text-white/60 hover:text-white hover:bg-white/10 transition"
                title={showFullNumber ? 'Hide full number' : 'Reveal full number'}
              >
                {showFullNumber ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                onClick={copyToClipboard}
                className="rounded-lg p-1 text-white/60 hover:text-white hover:bg-white/10 transition"
                title="Copy account number"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Cardholder Name & Routing */}
        <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/10 text-xs">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-white/50 font-medium">Cardholder</p>
            <p className="font-bold uppercase tracking-wider text-white/95 text-[11px] truncate max-w-[170px]">
              {account.accountHolderName}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-white/50 font-medium">Routing Transit</p>
            <p className="font-mono text-white/90 text-[11px] font-semibold">{account.routingNumber}</p>
          </div>
        </div>
      </div>

      {/* Balance & Financial Details Row (Clean White Canvas) */}
      <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {formatAccountType(account.accountType)}
          </span>
          <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {privacyMode ? '••••••••' : formatCurrency(account.balance)}
          </p>
        </div>

        <div className="text-right text-[11px] text-slate-500 font-medium">
          <span>Daily Cap:</span>
          <span className="font-bold text-slate-700 ml-1">
            ₹{account.dailyWithdrawalLimit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Buttons Tray (Clean, spacious, high-contrast) */}
      <div className="grid grid-cols-2 gap-2 bg-white px-5 pb-5 pt-1">
        <button
          type="button"
          disabled={isFrozen}
          onClick={(e) => {
            e.stopPropagation();
            onWithdraw(account);
          }}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 px-3 py-2.5 text-xs font-bold text-rose-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
        >
          <ArrowUpRight className="h-3.5 w-3.5 text-rose-600 shrink-0" />
          <span>Withdraw</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStatement(account);
          }}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition shadow-sm active:scale-95"
        >
          <Printer className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>Statement</span>
        </button>
      </div>
    </div>
  );
};
