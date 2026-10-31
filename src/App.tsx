import React, { useState } from 'react';
import { BankingProvider, useBanking } from './context/BankingContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Login } from './components/auth/Login';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { ToastContainer } from './components/common/Toast';
import { InactivityLockModal } from './components/common/InactivityLockModal';

const BankingAppContent: React.FC = () => {
  const { currentUser } = useBanking();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('aegis_bank_theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('aegis_bank_theme', nextTheme);
  };

  // If user is not logged in, render the secure authentication gateway
  if (!currentUser) {
    return (
      <div className={`app-shell theme-${theme} min-h-screen`}>
        <Login theme={theme} onToggleTheme={toggleTheme} />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className={`app-shell theme-${theme} min-h-screen flex flex-col font-sans`}>
      {/* Top Banking Navigation */}
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      {/* Main Workspace Layout */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col md:flex-row">
        {/* Dynamic RBAC Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Role Work Area */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:px-8 lg:py-7 overflow-y-auto">
          {currentUser.role === 'superadmin' && (
            <SuperAdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {currentUser.role === 'admin' && (
            <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {currentUser.role === 'customer' && (
            <CustomerDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </main>
      </div>

      {/* Global Inactivity Lockdown Screen */}
      <InactivityLockModal />

      {/* Global Security Toasts */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <BankingProvider>
      <BankingAppContent />
    </BankingProvider>
  );
}

export default App;
