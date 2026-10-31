import { TransactionType, AccountType } from '../types/banking';
export { maskAccountNumber, maskSSN, maskEmail } from './security';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateOnly(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatAccountType(type: AccountType): string {
  switch (type) {
    case 'savings':
      return 'High-Yield Savings';
    case 'checking':
      return 'Premier Checking';
    case 'business':
      return 'Commercial Enterprise';
    case 'money_market':
      return 'Treasury Money Market';
    default:
      return type;
  }
}

export function getTransactionColor(type: TransactionType): {
  text: string;
  bg: string;
  sign: string;
} {
  switch (type) {
    case 'deposit':
    case 'transfer_in':
      return { text: 'text-emerald-700', bg: 'bg-emerald-50', sign: '+' };
    case 'withdrawal':
    case 'transfer_out':
      return { text: 'text-rose-700', bg: 'bg-rose-50', sign: '-' };
    default:
      return { text: 'text-slate-700', bg: 'bg-slate-50', sign: '' };
  }
}
