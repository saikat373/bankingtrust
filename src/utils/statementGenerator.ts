import { BankAccount, Transaction, User } from '../types/banking';
import { formatCurrency, formatDate, formatDateOnly } from './formatters';

export interface StatementSummary {
  openingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  netCashflow: number;
  closingBalance: number;
  transactionCount: number;
}

export function calculateStatementSummary(
  account: BankAccount,
  transactions: Transaction[]
): StatementSummary {
  let totalDeposits = 0;
  let totalWithdrawals = 0;

  transactions.forEach((t) => {
    if (t.type === 'deposit' || t.type === 'transfer_in') {
      totalDeposits += t.amount;
    } else if (t.type === 'withdrawal' || t.type === 'transfer_out') {
      totalWithdrawals += t.amount;
    }
  });

  const netCashflow = totalDeposits - totalWithdrawals;
  const closingBalance = account.balance;
  // Estimate opening balance relative to the transactions in this period
  const openingBalance = closingBalance - netCashflow;

  return {
    openingBalance: Math.max(0, openingBalance),
    totalDeposits,
    totalWithdrawals,
    netCashflow,
    closingBalance,
    transactionCount: transactions.length,
  };
}

export function exportStatementToCsv(
  account: BankAccount,
  user: User,
  transactions: Transaction[],
  startDate: string,
  endDate: string
): void {
  const headers = [
    'Reference ID',
    'Date & Time',
    'Description',
    'Category',
    'Type',
    'Amount (INR)',
    'Running Balance (INR)',
    'Status',
    'Integrity Hash',
  ];

  const rows = transactions.map((t) => [
    `"${t.referenceId}"`,
    `"${formatDate(t.timestamp)}"`,
    `"${t.description.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    `"${t.type.toUpperCase()}"`,
    (t.type === 'withdrawal' || t.type === 'transfer_out' ? -t.amount : t.amount).toFixed(2),
    t.runningBalance.toFixed(2),
    `"${t.status.toUpperCase()}"`,
    `"${t.auditHash}"`,
  ]);

  const csvContent = [
    `"AEGIS TRUST BANK - OFFICIAL ACCOUNT STATEMENT"`,
    `"Account Holder:","${user.name}"`,
    `"Account Number:","•••• •••• ${account.accountNumber.slice(-4)}"`,
    `"Account Type:","${account.accountType.toUpperCase()}"`,
    `"Statement Period:","${startDate || 'Inception'} to ${endDate || 'Current'}"`,
    `"Generated On:","${new Date().toISOString()}"`,
    '',
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `AegisBank_Statement_${account.accountNumber.slice(-4)}_${formatDateOnly(new Date().toISOString()).replace(/\s+/g, '_')}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrintStatement(): void {
  window.print();
}
