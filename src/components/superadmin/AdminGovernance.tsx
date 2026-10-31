import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Building,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  CreditCard,
  Phone,
  Mail,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreateAdminModal } from './CreateAdminModal';
import { AdminPermissionModal } from './AdminPermissionModal';
import { Modal } from '../common/Modal';
import { User, BankAccount } from '../../types/banking';
import { Sliders } from 'lucide-react';

export const AdminGovernance: React.FC = () => {
  const { users, accounts, toggleUserLock, privacyMode } = useBanking();
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAdminForDetail, setSelectedAdminForDetail] = useState<User | null>(null);
  const [selectedAdminForPermissions, setSelectedAdminForPermissions] = useState<User | null>(null);

  const adminUsers = users.filter((u) => u.role === 'admin');
  const activeAdmins = adminUsers.filter((u) => !u.isLocked);
  const suspendedAdmins = adminUsers.filter((u) => u.isLocked);

  // Compute customers managed per admin
  const getAdminAccounts = (adminId: string): BankAccount[] => {
    return accounts.filter((a) => a.openedByAdminId === adminId);
  };

  const getAdminTotalCustody = (adminId: string): number => {
    return getAdminAccounts(adminId).reduce((sum, a) => sum + a.balance, 0);
  };

  const filteredAdmins = adminUsers.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase()) ||
      (admin.department && admin.department.toLowerCase().includes(search.toLowerCase())) ||
      (admin.branchId && admin.branchId.toLowerCase().includes(search.toLowerCase()));

    const matchesBranch = branchFilter === 'ALL' || admin.branchId === branchFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'active' && !admin.isLocked) ||
      (statusFilter === 'suspended' && admin.isLocked);

    return matchesSearch && matchesBranch && matchesStatus;
  });

  const branchLocations = [
    {
      id: 'BR-NYC-001',
      name: 'Manhattan Financial Center',
      city: 'New York, NY',
      leadAdmin: 'Marcus Vance',
      accountsCount: accounts.filter((a) => a.openedByAdminId === 'usr-admin-01').length,
    },
    {
      id: 'BR-SFO-002',
      name: 'Silicon Valley Commercial Hub',
      city: 'San Francisco, CA',
      leadAdmin: 'Elena Rostova',
      accountsCount: accounts.filter((a) => a.openedByAdminId === 'usr-admin-02').length,
    },
    {
      id: 'BR-CHI-003',
      name: 'Midwest Corporate Branch',
      city: 'Chicago, IL',
      leadAdmin: 'Unassigned',
      accountsCount: 0,
    },
    {
      id: 'BR-MIA-004',
      name: 'Latin America Private Banking',
      city: 'Miami, FL',
      leadAdmin: 'Unassigned',
      accountsCount: 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Administrator Governance & Access Control
            </h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 border border-purple-200">
              SuperAdmin Clearance
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Dedicated administrative console: SuperAdmin directly delegates branch authority, monitors customer account creation, suspends or restores admin access, and oversees station assignments.
          </p>
        </div>

        <button
          onClick={() => setIsCreateAdminOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-bank-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-bank-600/20 hover:bg-bank-700 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Create New Administrator</span>
        </button>
      </div>

      {/* Governance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Administrators</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{adminUsers.length}</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">
            {activeAdmins.length} Active • {suspendedAdmins.length} Suspended
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Branch Stations</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-bank-600">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">4 Stations</p>
          <p className="mt-1 text-[11px] text-slate-500">NYC, SFO, Chicago, Miami</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Accounts Created</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{accounts.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">Onboarded across branches</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Delegated Security</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">Level 2</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">Mandatory 2FA Enforced</p>
        </div>
      </div>

      {/* Administrators Governance Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Administrator Roster & Clearance</h2>
            <p className="text-xs text-slate-500">
              Manage individual admin credentials, view created client accounts, and revoke or restore access.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search admin name, email..."
                className="w-52 rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs focus:border-bank-500 focus:outline-none"
              />
            </div>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-bank-500 focus:outline-none"
            >
              <option value="ALL">All Branches</option>
              <option value="BR-NYC-001">Manhattan (BR-NYC-001)</option>
              <option value="BR-SFO-002">Silicon Valley (BR-SFO-002)</option>
              <option value="BR-CHI-003">Chicago (BR-CHI-003)</option>
              <option value="BR-MIA-004">Miami (BR-MIA-004)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-bank-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Department & Branch</th>
                <th className="px-4 py-3">Security Level</th>
                <th className="px-4 py-3">Client Accounts Opened</th>
                <th className="px-4 py-3">Custody Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">SuperAdmin Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No matching administrators found.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const managedAccounts = getAdminAccounts(admin.id);
                  const totalCustody = getAdminTotalCustody(admin.id);
                  const isSuspended = admin.isLocked;

                  return (
                    <tr key={admin.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-800 font-bold text-xs">
                            {admin.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{admin.name}</p>
                            <p className="text-[11px] text-slate-400">{admin.email}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{admin.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{admin.department || 'Branch Operations'}</p>
                        <span className="inline-block mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 border border-slate-200">
                          {admin.branchId || 'BR-NYC-001'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-[11px]">
                          <Shield className="h-3.5 w-3.5 text-blue-600" />
                          <span>Level 2 Admin</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium">2FA Verified</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedAdminForDetail(admin)}
                          className="font-bold text-bank-600 hover:text-bank-800 hover:underline flex items-center gap-1"
                          title="Click to view client accounts created by this admin"
                        >
                          <span>{managedAccounts.length} Account{managedAccounts.length !== 1 ? 's' : ''}</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {privacyMode ? '••••••' : formatCurrency(totalCustody)}
                      </td>
                      <td className="px-4 py-3">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                            <Lock className="h-3 w-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedAdminForPermissions(admin)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 border border-purple-200 hover:bg-purple-100 transition shadow-sm"
                            title="Configure Granular RBAC Permissions"
                          >
                            <Sliders className="h-3.5 w-3.5" />
                            <span>RBAC ({admin.permissions?.length || 7})</span>
                          </button>

                          {isSuspended ? (
                            <button
                              onClick={() => toggleUserLock(admin.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
                            >
                              <Unlock className="h-3.5 w-3.5" />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleUserLock(admin.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 border border-rose-200 hover:bg-rose-100 transition shadow-sm"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              <span>Suspend</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional Branch Station Network */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1">Regional Branch Network Coverage</h2>
        <p className="text-xs text-slate-500 mb-4">
          Overview of physical branch allocations and lead administrator assignments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {branchLocations.map((branch) => (
            <div
              key={branch.id}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 border border-slate-200">
                  {branch.id}
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">{branch.name}</h3>
              <p className="text-[11px] text-slate-500">{branch.city}</p>
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Lead Admin:</span>
                <span className="font-semibold text-slate-800">{branch.leadAdmin}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Managed Accounts:</span>
                <span className="font-bold text-bank-600">{branch.accountsCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: View Managed Accounts for Selected Admin */}
      {selectedAdminForDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAdminForDetail(null)}
          title={`Accounts Managed by ${selectedAdminForDetail.name}`}
          subtitle={`Department: ${selectedAdminForDetail.department || 'Operations'} • Station: ${selectedAdminForDetail.branchId || 'BR-NYC-001'}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600">Total Customer Accounts Created:</span>
              <span className="font-bold text-slate-900">
                {getAdminAccounts(selectedAdminForDetail.id).length} accounts
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {getAdminAccounts(selectedAdminForDetail.id).length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  This administrator has not opened any customer accounts yet.
                </p>
              ) : (
                getAdminAccounts(selectedAdminForDetail.id).map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-white"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{acc.accountHolderName}</p>
                      <p className="text-[11px] text-slate-500 uppercase font-mono">
                        {acc.accountType} (•••• {acc.accountNumber.slice(-4)})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">
                        {privacyMode ? '••••••' : formatCurrency(acc.balance)}
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-600 uppercase">
                        {acc.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedAdminForDetail(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal to create Admin */}
      <CreateAdminModal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
      />

      {/* Modal to manage granular RBAC permissions */}
      <AdminPermissionModal
        admin={selectedAdminForPermissions}
        isOpen={!!selectedAdminForPermissions}
        onClose={() => setSelectedAdminForPermissions(null)}
      />
    </div>
  );
};
