import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { formatDate } from '../../utils/formatters';

export const BranchAuditView: React.FC = () => {
  const { auditLogs, currentUser } = useBanking();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search);

    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const severityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SECURITY':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AegisBank_Branch_Audit_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Branch Security & Compliance Audit Log
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-bank-800 border border-bank-200">
              Station {currentUser?.branchId || 'BR-NYC-001'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Forensic compliance audit trail: All customer account openings, status changes, debit authorizations, and admin logins.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>Export Audit Dump (JSON)</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Audit Records</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-bank-600">
              <History className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{auditLogs.length}</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">100% Verified Log Integrity</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Security Events</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">
            {auditLogs.filter((l) => l.severity === 'SECURITY').length}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">PIN & Auth verifications</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Actions</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700">
            {auditLogs.filter((l) => l.severity === 'CRITICAL').length}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Account openings & policy updates</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Successful Status</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">
            {auditLogs.filter((l) => l.status === 'SUCCESS').length}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">Valid executed transactions</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Event Journal</h2>
            <p className="text-xs text-slate-500">
              Immutable forensic log of all branch activities with source IP and timestamps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search event, actor, details..."
                className="w-56 rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs focus:border-bank-500 focus:outline-none"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-bank-500 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
              <option value="SECURITY">Security Alert</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Action Event</th>
                <th className="px-4 py-3">Actor & Role</th>
                <th className="px-4 py-3">Client IP</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-sans">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${severityBadge(
                          log.severity
                        )}`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-sans">
                      <div className="font-semibold text-slate-800">{log.actorName}</div>
                      <div className="text-[10px] uppercase text-slate-400">{log.actorRole}</div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-sans">
                      <span
                        className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700'
                            : log.status === 'BLOCKED'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-700 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
