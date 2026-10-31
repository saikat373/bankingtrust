import React from 'react';
import { LockKeyhole, TrendingUp } from 'lucide-react';
import { BankAccount, Transaction } from '../../types/banking';
import { formatCurrency, formatDateOnly } from '../../utils/formatters';

interface BalanceTrendChartProps {
  account: BankAccount | undefined;
  transactions: Transaction[];
  privacyMode: boolean;
}

export const BalanceTrendChart: React.FC<BalanceTrendChartProps> = ({
  account,
  transactions,
  privacyMode,
}) => {
  const history = transactions
    .filter((transaction) => transaction.accountId === account?.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-8);
  const values = history.map((transaction) => transaction.runningBalance);
  const lastRecordedBalance = values[values.length - 1];

  if (account && lastRecordedBalance !== account.balance) {
    values.push(account.balance);
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || Math.max(maxValue * 0.1, 1);
  const left = 14;
  const right = 706;
  const top = 14;
  const bottom = 174;
  const points = values.map((value, index) => {
    const x = values.length < 2 ? (left + right) / 2 : left + (index / (values.length - 1)) * (right - left);
    const y = bottom - ((value - minValue) / range) * (bottom - top);
    return { x, y, value };
  });
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`
    : '';
  const firstValue = values[0] || 0;
  const change = values.length > 1 ? values[values.length - 1] - firstValue : 0;
  const changePercent = firstValue ? (change / firstValue) * 100 : 0;

  return (
    <section className="balance-chart rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Balance history</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {account ? account.accountType.replace('_', ' ') : 'Account'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Based on recorded account transactions</p>
        </div>
        {account && (
          <div className="text-right">
            <p className="text-lg font-extrabold tracking-tight text-slate-900">
              {privacyMode ? '••••••••' : formatCurrency(account.balance)}
            </p>
            {values.length > 1 && (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUp className="h-3.5 w-3.5" />
                {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                <span className="font-normal text-slate-400">since first entry</span>
              </span>
            )}
          </div>
        )}
      </div>

      {privacyMode ? (
        <div className="mt-5 flex h-[190px] flex-col items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
          <LockKeyhole className="mb-2 h-5 w-5" />
          <p className="text-xs font-semibold">Balance history hidden in privacy mode</p>
        </div>
      ) : points.length > 1 ? (
        <div className="mt-4">
          <svg
            className="h-[190px] w-full overflow-visible"
            viewBox="0 0 720 190"
            role="img"
            aria-label={`Balance history for ${account?.accountType} account`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="balance-chart-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0c8fe9" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0c8fe9" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((line) => {
              const y = top + (line / 3) * (bottom - top);
              return <line key={line} x1={left} x2={right} y1={y} y2={y} stroke="currentColor" className="text-slate-100" strokeDasharray="4 6" />;
            })}
            <path d={areaPath} fill="url(#balance-chart-fill)" />
            <path d={linePath} fill="none" stroke="#0785dc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => (
              <g key={`${history[index]?.id || 'current'}-${index}`}>
                <title>{formatCurrency(point.value)}</title>
                <circle cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#0785dc" strokeWidth="3" />
              </g>
            ))}
          </svg>
          <div className="mt-1 flex justify-between gap-2 text-[10px] font-medium text-slate-400">
            <span>{history[0] ? formatDateOnly(history[0].timestamp) : 'Recorded activity'}</span>
            <span>{history.length} transaction{history.length === 1 ? '' : 's'} tracked</span>
            <span>{history.length ? formatDateOnly(history[history.length - 1].timestamp) : 'Current'}</span>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex h-[190px] items-center justify-center rounded-2xl bg-slate-50 text-center">
          <p className="max-w-xs text-xs leading-relaxed text-slate-500">
            Balance history will appear as transactions are recorded for this account.
          </p>
        </div>
      )}
    </section>
  );
};
