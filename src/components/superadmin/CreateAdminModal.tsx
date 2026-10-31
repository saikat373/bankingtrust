import React, { useState } from 'react';
import { UserCheck, Shield, Building, Phone, Mail, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useBanking } from '../../context/BankingContext';
import { SystemModuleId, SYSTEM_MODULES } from '../../types/banking';

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ isOpen, onClose }) => {
  const { createAdmin } = useBanking();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1 (555) 010-9281');
  const [department, setDepartment] = useState('Branch Operations & Account Services');
  const [branchId, setBranchId] = useState('BR-NYC-001');
  const [pin, setPin] = useState('1234');
  const [selectedPermissions, setSelectedPermissions] = useState<SystemModuleId[]>([
    'branch_dashboard',
    'customer_accounts',
    'create_customer',
    'freeze_unfreeze',
    'branch_ledger',
    'audit_logs',
    'soc_cybersecurity',
  ]);
  const [error, setError] = useState('');

  const departments = [
    'Branch Operations & Account Services',
    'Risk Management & Commercial KYC',
    'Treasury & Capital Liquidity',
    'Customer Success & Premier Wealth',
    'Audit & Regulatory Compliance',
  ];

  const branches = [
    { id: 'BR-NYC-001', name: 'Manhattan Financial Center (NYC)' },
    { id: 'BR-SFO-002', name: 'Silicon Valley Commercial Hub (SFO)' },
    { id: 'BR-CHI-003', name: 'Midwest Corporate Branch (Chicago)' },
    { id: 'BR-MIA-004', name: 'Latin America Private Banking (Miami)' },
  ];

  const togglePermission = (id: SystemModuleId) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please provide the Admin’s full name and email');
      return;
    }

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    const res = createAdmin({
      name,
      email,
      phone,
      department,
      branchId,
      pin,
      permissions: selectedPermissions,
    });

    if (res.success) {
      setName('');
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
      title="Create New Bank Administrator"
      subtitle="SuperAdmin privilege: Delegate branch and granular RBAC menu permissions"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Admin Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jonathan Drake"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Corporate Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. j.drake@aegisbank.com"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Direct Contact Phone
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
              Default Security PIN (4 Digits)
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-bank-500 focus:outline-none font-mono tracking-widest text-center"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department Assignment
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:border-bank-500 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Branch Station
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:border-bank-500 focus:outline-none"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Granular Module Permissions Selector */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-bank-600" />
              <span>Delegated RBAC Permissions ({selectedPermissions.length} Granted)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {SYSTEM_MODULES.map((mod) => {
              const isChecked = selectedPermissions.includes(mod.id);
              return (
                <label
                  key={mod.id}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                    isChecked
                      ? 'bg-white border-bank-300 text-slate-900 font-semibold shadow-xs'
                      : 'bg-slate-100/60 border-slate-200 text-slate-500 hover:bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => togglePermission(mod.id)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-bank-600 focus:ring-bank-500"
                  />
                  <span className="truncate">{mod.name}</span>
                </label>
              );
            })}
          </div>
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
            <UserCheck className="h-4 w-4" />
            <span>Authorize & Create Admin</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
