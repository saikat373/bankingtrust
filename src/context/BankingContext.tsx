import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  BankAccount,
  Transaction,
  AuditLog,
  SecurityConfig,
  AccountStatus,
  AuditSeverity,
  SystemModuleId,
} from '../types/banking';
import {
  initialUsers,
  initialAccounts,
  initialTransactions,
  initialAuditLogs,
  initialSecurityConfig,
} from '../data/mockData';
import {
  generateHash,
  generateReferenceId,
  getMockClientIp,
  validateAmount,
  generateCsrfToken,
} from '../utils/security';

export interface ToastNotification {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}

interface BankingContextType {
  currentUser: User | null;
  users: User[];
  accounts: BankAccount[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  securityConfig: SecurityConfig;
  isLocked: boolean;
  privacyMode: boolean;
  toasts: ToastNotification[];
  failedLoginAttempts: number;
  
  // Actions
  login: (email: string, role?: string) => boolean;
  logout: () => void;
  quickSwitchUser: (userId: string) => void;
  unlockSession: (pin: string) => boolean;
  togglePrivacyMode: () => void;
  addToast: (title: string, description: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
  
  // SuperAdmin Operations
  createAdmin: (adminData: {
    name: string;
    email: string;
    phone: string;
    department: string;
    branchId: string;
    pin: string;
    permissions?: SystemModuleId[];
  }) => { success: boolean; message: string };
  updateSecurityConfig: (newConfig: Partial<SecurityConfig>) => void;
  toggleUserLock: (userId: string) => void;
  updateAdminPermissions: (adminId: string, permissions: SystemModuleId[]) => void;
  hasPermission: (moduleId: SystemModuleId, user?: User | null) => boolean;
  csrfToken: string;
  refreshCsrfToken: () => string;
  
  // Admin Operations
  createCustomerAccount: (params: {
    fullName: string;
    email: string;
    phone: string;
    ssn: string;
    address: string;
    accountType: BankAccount['accountType'];
    initialDeposit: number;
    pin: string;
    dailyLimit?: number;
  }) => { success: boolean; message: string; newAccount?: BankAccount };
  toggleAccountStatus: (accountId: string, status: AccountStatus) => void;
  
  // Customer Banking Operations
  depositMoney: (accountId: string, amount: number, depositMethod: string, description: string) => { success: boolean; message: string; transaction?: Transaction };
  withdrawMoney: (accountId: string, amount: number, pin: string, description: string) => { success: boolean; message: string; transaction?: Transaction };
  adminWithdrawMoney: (accountId: string, amount: number, description: string, customerIdentityVerified: boolean) => { success: boolean; message: string; transaction?: Transaction };
  transferMoney: (sourceAccountId: string, targetAccountOrNumber: string, amount: number, pin: string, description: string) => { success: boolean; message: string; transaction?: Transaction };
  
  // Utility
  verifyPin: (pin: string, user?: User | null) => boolean;
  getUserAccounts: (userId?: string) => BankAccount[];
  getAccountTransactions: (accountId: string) => Transaction[];
  addAuditLog: (action: string, details: string, severity?: AuditSeverity, status?: 'SUCCESS' | 'FAILED' | 'BLOCKED') => void;
  resetSessionTimer: () => void;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'aegis_bank_';

export const BankingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load stored state or mock defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}accounts`);
    return saved
      ? (JSON.parse(saved) as BankAccount[]).map((account) => ({ ...account, currency: 'INR' }))
      : initialAccounts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}security_config`);
    return saved ? JSON.parse(saved) : initialSecurityConfig;
  });

  // Current active user (default to SuperAdmin for initial preview or saved)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem(`${STORAGE_KEY_PREFIX}active_user_id`);
    if (savedId) {
      const found = (users.length ? users : initialUsers).find(u => u.id === savedId);
      if (found) return found;
    }
    // Default to SuperAdmin so user lands right in the full system
    return initialUsers[0];
  });

  useEffect(() => {
    if (!currentUser) return;
    const updatedUser = users.find((user) => user.id === currentUser.id);
    if (updatedUser && updatedUser !== currentUser) {
      setCurrentUser(updatedUser);
    }
  }, [users, currentUser]);

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState<number>(0);
  const [csrfToken, setCsrfToken] = useState<string>(() => generateCsrfToken());

  const refreshCsrfToken = useCallback(() => {
    const newToken = generateCsrfToken();
    setCsrfToken(newToken);
    return newToken;
  }, []);

  // Sync state to localStorage for persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}accounts`, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}security_config`, JSON.stringify(securityConfig));
  }, [securityConfig]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}active_user_id`, currentUser.id);
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}active_user_id`);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key?.startsWith(STORAGE_KEY_PREFIX) || event.newValue === null) return;

      try {
        switch (event.key) {
          case `${STORAGE_KEY_PREFIX}users`:
            setUsers((current) => {
              const next = JSON.parse(event.newValue!) as User[];
              return JSON.stringify(current) === event.newValue ? current : next;
            });
            break;
          case `${STORAGE_KEY_PREFIX}accounts`:
            setAccounts((current) => {
              const next = (JSON.parse(event.newValue!) as BankAccount[]).map((account) => ({
                ...account,
                currency: 'INR',
              }));
              return JSON.stringify(current) === JSON.stringify(next) ? current : next;
            });
            break;
          case `${STORAGE_KEY_PREFIX}transactions`:
            setTransactions((current) => {
              const next = JSON.parse(event.newValue!) as Transaction[];
              return JSON.stringify(current) === event.newValue ? current : next;
            });
            break;
          case `${STORAGE_KEY_PREFIX}audit_logs`:
            setAuditLogs((current) => {
              const next = JSON.parse(event.newValue!) as AuditLog[];
              return JSON.stringify(current) === event.newValue ? current : next;
            });
            break;
          case `${STORAGE_KEY_PREFIX}security_config`:
            setSecurityConfig((current) => {
              const next = JSON.parse(event.newValue!) as SecurityConfig;
              return JSON.stringify(current) === event.newValue ? current : next;
            });
            break;
        }
      } catch (error) {
        console.error(`Unable to synchronize banking state from storage key "${event.key}".`, error);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Toast helper
  const addToast = useCallback((title: string, description: string, type: ToastNotification['type'] = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, title, description, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Audit Log helper
  const addAuditLog = useCallback(
    (action: string, details: string, severity: AuditSeverity = 'INFO', status: 'SUCCESS' | 'FAILED' | 'BLOCKED' = 'SUCCESS') => {
      const newEntry: AuditLog = {
        id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        actorId: currentUser ? currentUser.id : 'anonymous',
        actorName: currentUser ? currentUser.name : 'Unauthenticated Client',
        actorRole: currentUser ? currentUser.role : 'customer',
        action,
        details,
        severity,
        ipAddress: getMockClientIp(),
        status,
      };
      setAuditLogs((prev) => [newEntry, ...prev]);
    },
    [currentUser]
  );

  // Inactivity Auto-Lock Timer
  useEffect(() => {
    if (!currentUser || isLocked) return;

    let timeoutId: NodeJS.Timeout;
    const idleLimitMs = securityConfig.sessionTimeoutMinutes * 60 * 1000;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsLocked(true);
        addAuditLog('SESSION_IDLE_LOCKOUT', `Session locked due to ${securityConfig.sessionTimeoutMinutes} min inactivity`, 'WARNING');
        addToast('Session Locked', 'Terminal was locked due to idle inactivity. Enter your PIN to resume.', 'warning');
      }, idleLimitMs);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [currentUser, isLocked, securityConfig.sessionTimeoutMinutes, addAuditLog, addToast]);

  const resetSessionTimer = useCallback(() => {
    // triggers event
  }, []);

  // PIN verification
  const verifyPin = useCallback(
    (pin: string, userToVerify: User | null = currentUser): boolean => {
      if (!userToVerify || !userToVerify.pinHash) {
        // Fallback demo match for default pins
        return pin === '1234' || pin === '9988' || pin === '7788';
      }
      return userToVerify.pinHash === generateHash(pin);
    },
    [currentUser]
  );

  // Unlock session
  const unlockSession = useCallback(
    (pin: string): boolean => {
      if (!currentUser) return false;
      const isValid = verifyPin(pin, currentUser);
      if (isValid) {
        setIsLocked(false);
        addAuditLog('SESSION_UNLOCKED', `User unlocked session successfully`, 'INFO');
        addToast('Session Restored', 'Welcome back to your secure banking session.', 'success');
        return true;
      } else {
        addAuditLog('SESSION_UNLOCK_FAILED', `Incorrect PIN entered during session unlock`, 'SECURITY', 'FAILED');
        addToast('Invalid PIN', 'The security PIN you entered is incorrect.', 'error');
        return false;
      }
    },
    [currentUser, verifyPin, addAuditLog, addToast]
  );

  // Switch user (demo persona switcher)
  const quickSwitchUser = useCallback(
    (userId: string) => {
      const found = users.find((u) => u.id === userId);
      if (found) {
        setCurrentUser(found);
        setIsLocked(false);
        addAuditLog('PERSONA_SWITCH', `Switched active session to ${found.name} (${found.role.toUpperCase()})`, 'INFO');
        addToast('Persona Switched', `Active session: ${found.name} [${found.role.toUpperCase()}]`, 'info');
      }
    },
    [users, addAuditLog, addToast]
  );

  // Standard Login
  const login = useCallback(
    (email: string, role?: string): boolean => {
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || (role && u.role === role)
      );

      if (!found) {
        setFailedLoginAttempts((prev) => prev + 1);
        addAuditLog('LOGIN_FAILED', `Unrecognized email ${email}`, 'WARNING', 'FAILED');
        addToast('Login Failed', 'No account found with this email address.', 'error');
        return false;
      }

      if (found.isLocked) {
        addAuditLog('LOGIN_BLOCKED', `Attempted login to locked account ${email}`, 'SECURITY', 'BLOCKED');
        addToast('Account Locked', 'This account has been administratively locked.', 'error');
        return false;
      }

      setCurrentUser(found);
      setIsLocked(false);
      setFailedLoginAttempts(0);
      addAuditLog('USER_LOGIN', `User ${found.name} logged into ${found.role.toUpperCase()} portal`, 'INFO');
      addToast('Welcome back', `Secure session established for ${found.name}`, 'success');
      return true;
    },
    [users, addAuditLog, addToast]
  );

  // Logout
  const logout = useCallback(() => {
    if (currentUser) {
      addAuditLog('USER_LOGOUT', `User ${currentUser.name} logged out securely`, 'INFO');
    }
    setCurrentUser(null);
    setIsLocked(false);
    addToast('Logged Out', 'You have been securely signed out.', 'info');
  }, [currentUser, addAuditLog, addToast]);

  const togglePrivacyMode = useCallback(() => {
    setPrivacyMode((prev) => !prev);
  }, []);

  // Check granular RBAC permission for module or menu
  const hasPermission = useCallback(
    (moduleId: SystemModuleId, userToCheck?: User | null): boolean => {
      const user = userToCheck || currentUser;
      if (!user) return false;
      // SuperAdmin has full bypass clearance across all menus & modules
      if (user.role === 'superadmin') return true;
      if (user.role === 'customer') return false;

      // Check admin's granular assigned permissions
      if (user.permissions && Array.isArray(user.permissions)) {
        return user.permissions.includes(moduleId);
      }

      // Default permissions if array is not set
      return [
        'branch_dashboard',
        'customer_accounts',
        'create_customer',
        'freeze_unfreeze',
        'branch_ledger',
        'audit_logs',
        'soc_cybersecurity',
      ].includes(moduleId);
    },
    [currentUser]
  );

  // SUPERADMIN: Update Admin RBAC Permissions
  const updateAdminPermissions = useCallback(
    (adminId: string, permissions: SystemModuleId[]) => {
      if (currentUser?.role !== 'superadmin') {
        addToast('Unauthorized', 'Only SuperAdmin can modify RBAC permissions.', 'error');
        return;
      }

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === adminId) {
            return { ...u, permissions };
          }
          return u;
        })
      );

      const target = users.find((u) => u.id === adminId);
      addAuditLog(
        'RBAC_PERMISSIONS_UPDATED',
        `SuperAdmin updated granular menu/module permissions for ${target?.name || adminId} (${permissions.length} modules granted)`,
        'CRITICAL',
        'SUCCESS'
      );
      addToast(
        'RBAC Permissions Updated',
        `Permissions for ${target?.name || 'Administrator'} updated and synchronized across all terminals.`,
        'success'
      );
    },
    [currentUser, users, addAuditLog, addToast]
  );

  // SUPERADMIN: Create Admin
  const createAdmin = useCallback(
    (adminData: {
      name: string;
      email: string;
      phone: string;
      department: string;
      branchId: string;
      pin: string;
      permissions?: SystemModuleId[];
    }) => {
      if (currentUser?.role !== 'superadmin') {
        return { success: false, message: 'Unauthorized: Only SuperAdmin can create Admin accounts' };
      }

      // Check unique email
      if (users.some((u) => u.email.toLowerCase() === adminData.email.toLowerCase())) {
        return { success: false, message: 'An account with this email address already exists' };
      }

      const defaultPerms: SystemModuleId[] = [
        'branch_dashboard',
        'customer_accounts',
        'create_customer',
        'freeze_unfreeze',
        'branch_ledger',
        'audit_logs',
        'soc_cybersecurity',
      ];

      const newAdmin: User = {
        id: 'usr-admin-' + Date.now(),
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        role: 'admin',
        department: adminData.department || 'Branch Operations',
        branchId: adminData.branchId || 'BR-GEN-01',
        twoFactorEnabled: true,
        pinHash: generateHash(adminData.pin || '1234'),
        createdAt: new Date().toISOString(),
        lastLoginAt: undefined,
        isLocked: false,
        permissions: adminData.permissions && adminData.permissions.length > 0 ? adminData.permissions : defaultPerms,
      };

      setUsers((prev) => [...prev, newAdmin]);
      addAuditLog(
        'ADMIN_ACCOUNT_CREATED',
        `SuperAdmin created Admin user: ${newAdmin.name} (${newAdmin.email}) with ${newAdmin.permissions?.length} granular module permissions`,
        'CRITICAL',
        'SUCCESS'
      );
      addToast('Admin Created', `New administrator ${newAdmin.name} successfully registered.`, 'success');
      return { success: true, message: 'Admin account created successfully' };
    },
    [currentUser, users, addAuditLog, addToast]
  );

  // ADMIN: Create Customer Account
  const createCustomerAccount = useCallback(
    (params: {
      fullName: string;
      email: string;
      phone: string;
      ssn: string;
      address: string;
      accountType: BankAccount['accountType'];
      initialDeposit: number;
      pin: string;
      dailyLimit?: number;
    }) => {
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return { success: false, message: 'Unauthorized: Only authorized Admins can create customer accounts' };
      }

      if (!hasPermission('create_customer')) {
        return { success: false, message: 'Your administrator account is not permitted to create customer accounts.' };
      }

      const val = validateAmount(params.initialDeposit);
      if (!val.valid) {
        return { success: false, message: val.error || 'Invalid initial deposit amount' };
      }

      // Check if user already exists
      let existingUser = users.find((u) => u.email.toLowerCase() === params.email.toLowerCase());
      let customerUser: User;

      if (!existingUser) {
        const last4 = params.ssn.replace(/\D/g, '').slice(-4) || '9999';
        customerUser = {
          id: 'usr-cust-' + Date.now(),
          name: params.fullName,
          email: params.email,
          phone: params.phone,
          role: 'customer',
          ssnMasked: `•••-••-${last4}`,
          address: params.address,
          twoFactorEnabled: true,
          pinHash: generateHash(params.pin || '1234'),
          createdAt: new Date().toISOString(),
          isLocked: false,
          kycStatus: 'verified',
          createdByAdminId: currentUser.id,
        };
        setUsers((prev) => [...prev, customerUser]);
      } else {
        customerUser = existingUser;
      }

      // Generate realistic 12-digit account number starting with 88 or 99
      const randomAccNum = '88' + Math.floor(1000000000 + Math.random() * 9000000000).toString();

      const newAccount: BankAccount = {
        id: 'acc-' + Date.now(),
        accountNumber: randomAccNum,
        routingNumber: '021000021',
        userId: customerUser.id,
        accountHolderName: customerUser.name,
        accountType: params.accountType,
        balance: params.initialDeposit,
        availableBalance: params.initialDeposit,
        currency: 'INR',
        status: 'active',
        dailyWithdrawalLimit: params.dailyLimit || (params.accountType === 'business' ? 25000 : 5000),
        withdrawnToday: 0,
        interestRate: params.accountType === 'savings' ? 4.25 : params.accountType === 'business' ? 2.5 : 0.75,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        openedByAdminId: currentUser.id,
      };

      setAccounts((prev) => [...prev, newAccount]);

      // Initial deposit transaction
      const initialTxn: Transaction = {
        id: 'txn-' + Date.now(),
        referenceId: generateReferenceId('DEP'),
        accountId: newAccount.id,
        userId: customerUser.id,
        type: 'deposit',
        amount: params.initialDeposit,
        fee: 0,
        runningBalance: params.initialDeposit,
        description: `Initial Opening Deposit - ${newAccount.accountType.toUpperCase()}`,
        timestamp: new Date().toISOString(),
        status: 'completed',
        category: 'Cash Deposit',
        verifiedByPin: true,
        ipAddress: getMockClientIp(),
        deviceFingerprint: 'DEV-ADMIN-DESK-' + currentUser.id.slice(-4),
        auditHash: generateHash(randomAccNum + params.initialDeposit),
      };

      setTransactions((prev) => [initialTxn, ...prev]);

      addAuditLog(
        'CUSTOMER_ACCOUNT_OPENED',
        `Admin ${currentUser.name} opened ${newAccount.accountType} account for ${customerUser.name} with initial deposit of ₹${params.initialDeposit}`,
        'CRITICAL',
        'SUCCESS'
      );

      addToast(
        'Account Opened',
        `Successfully opened ${params.accountType} account for ${customerUser.name}. Account #: •••• ${randomAccNum.slice(-4)}`,
        'success'
      );

      return {
        success: true,
        message: 'Customer account successfully created and funded.',
        newAccount,
      };
    },
    [currentUser, users, hasPermission, addAuditLog, addToast]
  );

  // ADMIN: Toggle account status (Freeze / Unfreeze / Close)
  const toggleAccountStatus = useCallback(
    (accountId: string, status: AccountStatus) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === accountId) {
            return { ...acc, status };
          }
          return acc;
        })
      );
      addAuditLog(
        'ACCOUNT_STATUS_CHANGE',
        `Admin changed account ${accountId} status to ${status.toUpperCase()}`,
        'WARNING',
        'SUCCESS'
      );
      addToast('Status Updated', `Account status changed to ${status.toUpperCase()}`, 'info');
    },
    [addAuditLog, addToast]
  );

  // SUPERADMIN: Toggle user/admin lock status (Suspend / Activate)
  const toggleUserLock = useCallback(
    (userId: string) => {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            const nextLocked = !u.isLocked;
            addAuditLog(
              nextLocked ? 'ADMIN_SUSPENDED' : 'ADMIN_ACTIVATED',
              `SuperAdmin ${nextLocked ? 'suspended' : 're-activated'} account access for ${u.name} (${u.role.toUpperCase()})`,
              'CRITICAL',
              'SUCCESS'
            );
            addToast(
              nextLocked ? 'Access Suspended' : 'Access Restored',
              `${u.name}'s privileges have been ${nextLocked ? 'suspended' : 'restored'}.`,
              nextLocked ? 'warning' : 'success'
            );
            return { ...u, isLocked: nextLocked };
          }
          return u;
        })
      );
    },
    [addAuditLog, addToast]
  );

  // ADMIN: Credit deposits to customer-owned accounts
  const depositMoney = useCallback(
    (accountId: string, amount: number, depositMethod: string, description: string) => {
      const val = validateAmount(amount);
      if (!val.valid) {
        return { success: false, message: val.error || 'Invalid amount' };
      }

      if (currentUser?.role !== 'admin') {
        return { success: false, message: 'Only branch administrators can post customer deposits.' };
      }

      const targetAcc = accounts.find((a) => a.id === accountId);
      if (!targetAcc) {
        return { success: false, message: 'Account not found' };
      }

      const accountOwner = users.find((user) => user.id === targetAcc.userId);
      if (!accountOwner || accountOwner.role !== 'customer') {
        return { success: false, message: 'Deposits can only be posted to verified customer accounts.' };
      }

      if (targetAcc.status === 'frozen') {
        addAuditLog('TRANSACTION_REJECTED', `Deposit to frozen account ${targetAcc.accountNumber} rejected`, 'WARNING', 'BLOCKED');
        return { success: false, message: 'Account is currently frozen by administration. Deposits are restricted.' };
      }

      const newBalance = Math.round((targetAcc.balance + amount) * 100) / 100;

      // Update account
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === accountId) {
            return {
              ...acc,
              balance: newBalance,
              availableBalance: newBalance,
              lastActivityAt: new Date().toISOString(),
            };
          }
          return acc;
        })
      );

      const newTxn: Transaction = {
        id: 'txn-' + Date.now(),
        referenceId: generateReferenceId('DEP'),
        accountId: targetAcc.id,
        userId: targetAcc.userId,
        type: 'deposit',
        amount,
        fee: 0,
        runningBalance: newBalance,
        description: description || `${depositMethod} Deposit`,
        timestamp: new Date().toISOString(),
        status: 'completed',
        category: depositMethod === 'Mobile Check' || depositMethod === 'Wire Transfer' ? 'Online Wire' : 'Cash Deposit',
        verifiedByPin: false,
        ipAddress: getMockClientIp(),
        deviceFingerprint: 'DEV-PORTAL-CLIENT',
        auditHash: generateHash(targetAcc.accountNumber + amount + newBalance),
      };

      setTransactions((prev) => [newTxn, ...prev]);

      addAuditLog(
        'MONEY_DEPOSITED',
        `Deposit of ₹${amount.toFixed(2)} (${depositMethod}) credited to Account •••• ${targetAcc.accountNumber.slice(-4)}. New Balance: ₹${newBalance.toFixed(2)}`,
        'INFO',
        'SUCCESS'
      );

      addToast(
        'Deposit Confirmed',
        `₹${amount.toFixed(2)} was successfully deposited. New balance: ₹${newBalance.toFixed(2)}`,
        'success'
      );

      return {
        success: true,
        message: 'Deposit successfully processed and settled.',
        transaction: newTxn,
      };
    },
    [accounts, users, currentUser, addAuditLog, addToast]
  );

  const processWithdrawal = useCallback(
    (
      targetAcc: BankAccount,
      amount: number,
      description: string,
      verifiedByPin: boolean,
      hashMaterial: string,
      auditAction: string
    ) => {
      const val = validateAmount(amount);
      if (!val.valid) {
        return { success: false, message: val.error || 'Invalid withdrawal amount' };
      }

      if (targetAcc.status === 'frozen') {
        addAuditLog('TRANSACTION_REJECTED', `Withdrawal from frozen account ${targetAcc.accountNumber} blocked`, 'WARNING', 'BLOCKED');
        return { success: false, message: 'Account is currently frozen. All debits are restricted.' };
      }

      if (targetAcc.balance < amount) {
        addAuditLog('WITHDRAWAL_FAILED', `Insufficient funds: attempted ₹${amount}, balance ₹${targetAcc.balance}`, 'WARNING', 'FAILED');
        return { success: false, message: `Insufficient funds. Available balance: ₹${targetAcc.balance.toFixed(2)}` };
      }

      if (targetAcc.withdrawnToday + amount > targetAcc.dailyWithdrawalLimit) {
        const remainingToday = Math.max(0, targetAcc.dailyWithdrawalLimit - targetAcc.withdrawnToday);
        addAuditLog(
          'WITHDRAWAL_LIMIT_EXCEEDED',
          `Attempted ₹${amount} exceeds daily cap of ₹${targetAcc.dailyWithdrawalLimit} (Remaining today: ₹${remainingToday.toFixed(2)})`,
          'WARNING',
          'BLOCKED'
        );
        return {
          success: false,
          message: `Exceeds daily withdrawal limit (₹${targetAcc.dailyWithdrawalLimit.toFixed(2)}). You can withdraw up to ₹${remainingToday.toFixed(2)} today.`,
        };
      }

      const newBalance = Math.round((targetAcc.balance - amount) * 100) / 100;
      const newWithdrawnToday = targetAcc.withdrawnToday + amount;

      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === targetAcc.id) {
            return {
              ...acc,
              balance: newBalance,
              availableBalance: newBalance,
              withdrawnToday: newWithdrawnToday,
              lastActivityAt: new Date().toISOString(),
            };
          }
          return acc;
        })
      );

      const newTxn: Transaction = {
        id: 'txn-' + Date.now(),
        referenceId: generateReferenceId('WTH'),
        accountId: targetAcc.id,
        userId: targetAcc.userId,
        type: 'withdrawal',
        amount,
        fee: 0,
        runningBalance: newBalance,
        description: description || 'Direct Cash / Counter Withdrawal',
        timestamp: new Date().toISOString(),
        status: 'completed',
        category: 'ATM Withdrawal',
        verifiedByPin,
        ipAddress: getMockClientIp(),
        deviceFingerprint: 'DEV-PORTAL-CLIENT',
        auditHash: generateHash(targetAcc.accountNumber + amount + newBalance + hashMaterial),
      };

      setTransactions((prev) => [newTxn, ...prev]);

      addAuditLog(
        auditAction,
        `Withdrawal of ₹${amount.toFixed(2)} successfully debited from Account •••• ${targetAcc.accountNumber.slice(-4)}. New Balance: ₹${newBalance.toFixed(2)}`,
        'INFO',
        'SUCCESS'
      );

      addToast(
        'Withdrawal Confirmed',
        `₹${amount.toFixed(2)} has been withdrawn. Remaining balance: ₹${newBalance.toFixed(2)}`,
        'success'
      );

      return {
        success: true,
        message: 'Withdrawal successfully processed.',
        transaction: newTxn,
      };
    },
    [setAccounts, setTransactions, addAuditLog, addToast]
  );

  // CUSTOMER: Withdraw money with PIN validation.
  const withdrawMoney = useCallback(
    (accountId: string, amount: number, pin: string, description: string) => {
      const val = validateAmount(amount);
      if (!val.valid) {
        return { success: false, message: val.error || 'Invalid withdrawal amount' };
      }

      const targetAcc = accounts.find((a) => a.id === accountId);
      if (!targetAcc) {
        return { success: false, message: 'Selected account could not be found' };
      }

      if (currentUser?.role !== 'customer' || targetAcc.userId !== currentUser.id) {
        return { success: false, message: 'You can only withdraw from your own customer account.' };
      }

      if (targetAcc.status === 'frozen') {
        addAuditLog('TRANSACTION_REJECTED', `Withdrawal from frozen account ${targetAcc.accountNumber} blocked`, 'WARNING', 'BLOCKED');
        return { success: false, message: 'Account is currently frozen. All debits are restricted.' };
      }

      // Security PIN verification
      const user = users.find((u) => u.id === targetAcc.userId) || currentUser;
      if (!verifyPin(pin, user)) {
        addAuditLog('SECURITY_ALERT', `Failed PIN verification on withdrawal of ₹${amount} from account ${targetAcc.accountNumber}`, 'SECURITY', 'FAILED');
        return { success: false, message: 'Security PIN verification failed. Transaction terminated.' };
      }

      return processWithdrawal(targetAcc, amount, description, true, pin, 'MONEY_WITHDRAWN');
    },
    [accounts, users, currentUser, verifyPin, processWithdrawal, addAuditLog]
  );

  // ADMIN: Record customer withdrawals processed at the branch counter.
  const adminWithdrawMoney = useCallback(
    (accountId: string, amount: number, description: string, customerIdentityVerified: boolean) => {
      if (currentUser?.role !== 'admin' || !hasPermission('customer_accounts')) {
        return { success: false, message: 'Only authorized branch administrators can process customer withdrawals.' };
      }

      if (!customerIdentityVerified) {
        return { success: false, message: 'Confirm the customer identity check before processing this withdrawal.' };
      }

      const targetAcc = accounts.find((account) => account.id === accountId);
      if (!targetAcc) {
        return { success: false, message: 'Selected account could not be found' };
      }

      const accountOwner = users.find((user) => user.id === targetAcc.userId);
      if (!accountOwner || accountOwner.role !== 'customer') {
        return { success: false, message: 'Withdrawals can only be processed from customer accounts.' };
      }

      return processWithdrawal(
        targetAcc,
        amount,
        description || 'Branch counter withdrawal',
        false,
        '',
        'BRANCH_WITHDRAWAL'
      );
    },
    [accounts, users, currentUser, hasPermission, processWithdrawal]
  );

  // Transfer Money between accounts
  const transferMoney = useCallback(
    (sourceAccountId: string, targetAccountOrNumber: string, amount: number, pin: string, description: string) => {
      const val = validateAmount(amount);
      if (!val.valid) {
        return { success: false, message: val.error || 'Invalid transfer amount' };
      }

      const sourceAcc = accounts.find((a) => a.id === sourceAccountId);
      if (!sourceAcc) {
        return { success: false, message: 'Source account not found' };
      }

      if (sourceAcc.status === 'frozen') {
        return { success: false, message: 'Source account is frozen. Debits are prohibited.' };
      }

      const user = users.find((u) => u.id === sourceAcc.userId) || currentUser;
      if (!verifyPin(pin, user)) {
        addAuditLog('TRANSFER_PIN_FAILED', `PIN error during transfer of ₹${amount}`, 'SECURITY', 'FAILED');
        return { success: false, message: 'Invalid security PIN. Transfer aborted.' };
      }

      if (sourceAcc.balance < amount) {
        return { success: false, message: `Insufficient funds. Balance: ₹${sourceAcc.balance.toFixed(2)}` };
      }

      // Check if target is internal account
      const targetAcc = accounts.find(
        (a) => a.accountNumber === targetAccountOrNumber.replace(/\s+/g, '') || a.id === targetAccountOrNumber
      );

      const sourceNewBalance = Math.round((sourceAcc.balance - amount) * 100) / 100;

      // Update source
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === sourceAccountId) {
            return {
              ...acc,
              balance: sourceNewBalance,
              availableBalance: sourceNewBalance,
              lastActivityAt: new Date().toISOString(),
            };
          }
          if (targetAcc && acc.id === targetAcc.id) {
            const targetNewBalance = Math.round((acc.balance + amount) * 100) / 100;
            return {
              ...acc,
              balance: targetNewBalance,
              availableBalance: targetNewBalance,
              lastActivityAt: new Date().toISOString(),
            };
          }
          return acc;
        })
      );

      const debitTxn: Transaction = {
        id: 'txn-' + Date.now(),
        referenceId: generateReferenceId('TXN'),
        accountId: sourceAcc.id,
        userId: sourceAcc.userId,
        type: 'transfer_out',
        amount,
        fee: 0,
        runningBalance: sourceNewBalance,
        description: description || `Transfer to ${targetAcc ? targetAcc.accountHolderName : 'External Account ' + targetAccountOrNumber.slice(-4)}`,
        timestamp: new Date().toISOString(),
        status: 'completed',
        category: 'Internal Transfer',
        verifiedByPin: true,
        targetAccount: targetAcc?.accountNumber || targetAccountOrNumber,
        targetAccountHolder: targetAcc?.accountHolderName,
        ipAddress: getMockClientIp(),
        deviceFingerprint: 'DEV-PORTAL-CLIENT',
        auditHash: generateHash(sourceAcc.accountNumber + amount + sourceNewBalance),
      };

      setTransactions((prev) => {
        const list = [debitTxn, ...prev];
        if (targetAcc) {
          const creditTxn: Transaction = {
            id: 'txn-' + (Date.now() + 1),
            referenceId: generateReferenceId('TXN'),
            accountId: targetAcc.id,
            userId: targetAcc.userId,
            type: 'transfer_in',
            amount,
            fee: 0,
            runningBalance: targetAcc.balance + amount,
            description: `Transfer from ${sourceAcc.accountHolderName}`,
            timestamp: new Date().toISOString(),
            status: 'completed',
            category: 'Internal Transfer',
            verifiedByPin: false,
            sourceAccount: sourceAcc.accountNumber,
            ipAddress: getMockClientIp(),
            deviceFingerprint: 'DEV-SYSTEM-AUTO',
            auditHash: generateHash(targetAcc.accountNumber + amount),
          };
          list.unshift(creditTxn);
        }
        return list;
      });

      addAuditLog(
        'FUNDS_TRANSFERRED',
        `Transfer of ₹${amount.toFixed(2)} from •••• ${sourceAcc.accountNumber.slice(-4)} to ${targetAcc ? '•••• ' + targetAcc.accountNumber.slice(-4) : targetAccountOrNumber}`,
        'INFO',
        'SUCCESS'
      );

      addToast(
        'Transfer Complete',
        `Transferred ₹${amount.toFixed(2)} successfully. New balance: ₹${sourceNewBalance.toFixed(2)}`,
        'success'
      );

      return {
        success: true,
        message: 'Funds transferred successfully.',
        transaction: debitTxn,
      };
    },
    [accounts, users, currentUser, verifyPin, addAuditLog, addToast]
  );

  // Update Security Config (SuperAdmin only)
  const updateSecurityConfig = useCallback(
    (newConfig: Partial<SecurityConfig>) => {
      setSecurityConfig((prev) => ({ ...prev, ...newConfig }));
      addAuditLog(
        'SECURITY_CONFIG_UPDATED',
        `SuperAdmin updated global bank security parameters`,
        'CRITICAL',
        'SUCCESS'
      );
      addToast('Security Policy Updated', 'Global security settings have been propagated.', 'success');
    },
    [addAuditLog, addToast]
  );

  // Query helpers
  const getUserAccounts = useCallback(
    (userId?: string) => {
      const uid = userId || currentUser?.id;
      if (!uid) return [];
      return accounts.filter((a) => a.userId === uid);
    },
    [accounts, currentUser]
  );

  const getAccountTransactions = useCallback(
    (accountId: string) => {
      return transactions.filter((t) => t.accountId === accountId);
    },
    [transactions]
  );

  return (
    <BankingContext.Provider
      value={{
        currentUser,
        users,
        accounts,
        transactions,
        auditLogs,
        securityConfig,
        isLocked,
        privacyMode,
        toasts,
        failedLoginAttempts,
        login,
        logout,
        quickSwitchUser,
        unlockSession,
        togglePrivacyMode,
        addToast,
        removeToast,
        createAdmin,
        updateSecurityConfig,
        toggleUserLock,
        updateAdminPermissions,
        hasPermission,
        csrfToken,
        refreshCsrfToken,
        createCustomerAccount,
        toggleAccountStatus,
        depositMoney,
        withdrawMoney,
        adminWithdrawMoney,
        transferMoney,
        verifyPin,
        getUserAccounts,
        getAccountTransactions,
        addAuditLog,
        resetSessionTimer,
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};
