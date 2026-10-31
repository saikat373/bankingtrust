export type UserRole = 'superadmin' | 'admin' | 'customer';

export type AccountType = 'savings' | 'checking' | 'business' | 'money_market';

export type AccountStatus = 'active' | 'frozen' | 'dormant' | 'under_review';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';

export type TransactionStatus = 'completed' | 'pending' | 'flagged' | 'rejected';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';

export type SystemModuleId =
  | 'branch_dashboard'
  | 'customer_accounts'
  | 'create_customer'
  | 'freeze_unfreeze'
  | 'branch_ledger'
  | 'audit_logs'
  | 'export_data'
  | 'modify_limits'
  | 'security_policies'
  | 'soc_cybersecurity';

export interface ModulePermission {
  id: SystemModuleId;
  name: string;
  category: 'Branch Management' | 'Customer Operations' | 'Financial Ledger' | 'Security & Governance';
  description: string;
  defaultAdminGranted: boolean;
}

export const SYSTEM_MODULES: ModulePermission[] = [
  {
    id: 'branch_dashboard',
    name: 'Branch Executive Dashboard',
    category: 'Branch Management',
    description: 'View branch overview, custody asset distribution, and summary KPIs.',
    defaultAdminGranted: true,
  },
  {
    id: 'customer_accounts',
    name: 'Customer Account Registry',
    category: 'Customer Operations',
    description: 'Browse client accounts, view account numbers, and inspect balances.',
    defaultAdminGranted: true,
  },
  {
    id: 'create_customer',
    name: 'Create Account',
    category: 'Customer Operations',
    description: 'Onboard new retail & commercial customers and fund initial deposits.',
    defaultAdminGranted: true,
  },
  {
    id: 'freeze_unfreeze',
    name: 'Freeze & Unfreeze Accounts',
    category: 'Customer Operations',
    description: 'Place administrative holds on suspicious accounts and restore active status.',
    defaultAdminGranted: true,
  },
  {
    id: 'branch_ledger',
    name: 'Branch Ledger',
    category: 'Financial Ledger',
    description: 'Inspect general journal, double-entry settlement entries, and hashes.',
    defaultAdminGranted: true,
  },
  {
    id: 'audit_logs',
    name: 'Branch Audit Trail',
    category: 'Security & Governance',
    description: 'Inspect cryptographic compliance logs of all local branch activities.',
    defaultAdminGranted: true,
  },
  {
    id: 'export_data',
    name: 'Export CSV / JSON Data',
    category: 'Financial Ledger',
    description: 'Download raw customer account rosters, financial ledgers, and logs.',
    defaultAdminGranted: false,
  },
  {
    id: 'modify_limits',
    name: 'Modify Customer Daily Limits',
    category: 'Customer Operations',
    description: 'Adjust individual customer daily withdrawal caps and transaction limits.',
    defaultAdminGranted: false,
  },
  {
    id: 'security_policies',
    name: 'Global Security Policies',
    category: 'Security & Governance',
    description: 'Configure session inactivity timeouts, 2FA rules, and WAF parameters.',
    defaultAdminGranted: false,
  },
  {
    id: 'soc_cybersecurity',
    name: 'SOC Cybersecurity Command Center',
    category: 'Security & Governance',
    description: 'Inspect WAF threat mitigation, telemetry, ciphers, and simulated attacks.',
    defaultAdminGranted: true,
  },
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatarUrl?: string;
  ssnMasked?: string;
  address?: string;
  isLocked?: boolean;
  twoFactorEnabled: boolean;
  pinHash?: string;
  createdAt: string;
  lastLoginAt?: string;
  createdByAdminId?: string;
  department?: string;
  branchId?: string;
  kycStatus?: 'verified' | 'pending' | 'rejected';
  permissions?: SystemModuleId[]; // Granular RBAC permissions
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  routingNumber: string;
  userId: string;
  accountHolderName: string;
  accountType: AccountType;
  balance: number;
  availableBalance: number;
  currency: string;
  status: AccountStatus;
  dailyWithdrawalLimit: number;
  withdrawnToday: number;
  interestRate: number;
  createdAt: string;
  lastActivityAt: string;
  openedByAdminId?: string;
}

export interface Transaction {
  id: string;
  referenceId: string;
  accountId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  fee: number;
  runningBalance: number;
  description: string;
  timestamp: string;
  status: TransactionStatus;
  category: 'Cash Deposit' | 'ATM Withdrawal' | 'Online Wire' | 'Salary' | 'Merchant Purchase' | 'Internal Transfer' | 'Fee';
  sourceAccount?: string;
  targetAccount?: string;
  targetAccountHolder?: string;
  verifiedByPin: boolean;
  ipAddress: string;
  deviceFingerprint: string;
  auditHash: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  severity: AuditSeverity;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
}

export interface SecurityConfig {
  sessionTimeoutMinutes: number;
  dailyWithdrawalCap: number;
  singleWithdrawalOtpThreshold: number;
  maxFailedLogins: number;
  requireTwoFactor: boolean;
  enableVirtualPinPad: boolean;
  maintenanceMode: boolean;
  encryptionStandard: 'AES-256-GCM (Simulated)' | 'RSA-4096 (Simulated)';
  tlsStatus: 'TLS 1.3 Active';
}

export interface StatementFilter {
  accountId: string;
  startDate: string;
  endDate: string;
  type: 'all' | TransactionType;
  searchQuery: string;
  minAmount?: number;
  maxAmount?: number;
}
