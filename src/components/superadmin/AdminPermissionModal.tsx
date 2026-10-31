import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building,
  Users,
  CreditCard,
  FileText,
  History,
  Download,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useBanking } from '../../context/BankingContext';
import { User, SystemModuleId, SYSTEM_MODULES } from '../../types/banking';

interface AdminPermissionModalProps {
  admin: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPermissionModal: React.FC<AdminPermissionModalProps> = ({
  admin,
  isOpen,
  onClose,
}) => {
  const { updateAdminPermissions } = useBanking();
  const [selectedPermissions, setSelectedPermissions] = useState<SystemModuleId[]>(
    admin?.permissions ?? [
      'branch_dashboard',
      'customer_accounts',
      'create_customer',
      'freeze_unfreeze',
      'branch_ledger',
      'audit_logs',
      'soc_cybersecurity',
    ]
  );

  useEffect(() => {
    if (!admin || !isOpen) return;
    setSelectedPermissions(
      admin.permissions ?? [
        'branch_dashboard',
        'customer_accounts',
        'create_customer',
        'freeze_unfreeze',
        'branch_ledger',
        'audit_logs',
        'soc_cybersecurity',
      ]
    );
  }, [admin, isOpen]);

  if (!admin) return null;

  const togglePermission = (id: SystemModuleId) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleApplyPreset = (preset: 'all' | 'manager' | 'kyc' | 'auditor') => {
    if (preset === 'all') {
      setSelectedPermissions(SYSTEM_MODULES.map((m) => m.id));
    } else if (preset === 'manager') {
      setSelectedPermissions([
        'branch_dashboard',
        'customer_accounts',
        'create_customer',
        'freeze_unfreeze',
        'branch_ledger',
        'audit_logs',
        'export_data',
        'soc_cybersecurity',
      ]);
    } else if (preset === 'kyc') {
      setSelectedPermissions(['branch_dashboard', 'customer_accounts', 'create_customer', 'freeze_unfreeze']);
    } else if (preset === 'auditor') {
      setSelectedPermissions(['branch_dashboard', 'customer_accounts', 'branch_ledger', 'audit_logs', 'export_data', 'soc_cybersecurity']);
    }
  };

  const handleSave = () => {
    updateAdminPermissions(admin.id, selectedPermissions);
    onClose();
  };

  // Group by category
  const categories = Array.from(new Set(SYSTEM_MODULES.map((m) => m.category)));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Granular RBAC Module Permissions"
      subtitle={`SuperAdmin Governance: Configure exact menus and capabilities delegated to ${admin.name}`}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Administrator Profile Card */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800 font-bold text-sm">
              {admin.name[0]}
            </div>
            <div>
              <p className="font-bold text-slate-900">{admin.name}</p>
              <p className="text-xs text-slate-500">
                {admin.department || 'Branch Operations'} • Station {admin.branchId || 'BR-NYC-001'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-800 border border-blue-200 uppercase">
              {selectedPermissions.length} of {SYSTEM_MODULES.length} Granted
            </span>
          </div>
        </div>

        {/* Quick Permission Presets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-bank-600" />
              <span>Permission Role Presets</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset('all')}
              className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition"
            >
              Full Access (All Modules)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('manager')}
              className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition"
            >
              Branch Manager
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('kyc')}
              className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition"
            >
              KYC Onboarding Only
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('auditor')}
              className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition"
            >
              Compliance Auditor
            </button>
          </div>
        </div>

        {/* Module Permissions Checklist by Category */}
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
          {categories.map((category) => (
            <div key={category} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {category}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {SYSTEM_MODULES.filter((m) => m.category === category).map((module) => {
                  const isChecked = selectedPermissions.includes(module.id);
                  return (
                    <label
                      key={module.id}
                      className={`flex items-start gap-3.5 p-3.5 cursor-pointer hover:bg-slate-50/70 transition ${
                        isChecked ? 'bg-bank-50/20' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(module.id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-bank-600 focus:ring-bank-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{module.name}</span>
                          {isChecked ? (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Enabled
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{module.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Granted modules are available immediately to this administrator.
          </p>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-bank-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-bank-700 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Save & Propagate Permissions</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
