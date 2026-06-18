'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  Shield, 
  Key, 
  Loader2, 
  QrCode, 
  Plus, 
  Trash, 
  AlertCircle, 
  CheckCircle2, 
  Terminal,
  Activity
} from 'lucide-react';

export default function SecurityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // MFA states
  const [mfaSecret, setMfaSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [mfaConfigured, setMfaConfigured] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);

  // IP Whitelisting states
  const [ipList, setIpList] = useState(['127.0.0.1', '192.168.1.1']);
  const [newIp, setNewIp] = useState('');
  const [ipSaving, setIpSaving] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    setError('');
    try {
      const logsData = await request('/security/logs');
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load security logs:', err);
      setError('Could not fetch security trails. Verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    setMfaLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await request('/security/mfa/enable', {
        method: 'POST'
      });
      setMfaSecret(data.mfaSecret);
      setQrCodeUrl(data.qrCodeUrl);
    } catch (err) {
      console.error('MFA setup error:', err);
      setError('Could not configure Multi-Factor Authentication.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    if (!totpToken || totpToken.length !== 6) return;
    setMfaLoading(true);
    setError('');
    setSuccess('');

    try {
      await request('/security/mfa/verify', {
        method: 'POST',
        body: { token: totpToken }
      });
      setSuccess('MFA verification successful! Two-Factor protection is active.');
      setMfaConfigured(true);
      setMfaSecret('');
      setQrCodeUrl('');
      setTotpToken('');
      
      // Refresh logs
      const updatedLogs = await request('/security/logs');
      setLogs(updatedLogs);
    } catch (err) {
      console.error('MFA verification error:', err);
      setError(err.message || 'Token verification failed.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleAddIp = () => {
    if (!newIp.trim()) return;
    // Basic IP validator regex
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipPattern.test(newIp.trim())) {
      setError('Please provide a valid IPv4 address structure.');
      return;
    }
    setIpList(prev => [...prev, newIp.trim()]);
    setNewIp('');
    setError('');
  };

  const handleRemoveIp = (ipToRemove) => {
    setIpList(prev => prev.filter(ip => ip !== ipToRemove));
  };

  const handleSaveWhitelist = async () => {
    setIpSaving(true);
    setError('');
    setSuccess('');

    try {
      await request('/security/ip-whitelist', {
        method: 'PUT',
        body: { ipAddresses: ipList }
      });
      setSuccess('IP Whitelist rules updated and active across middlewares!');
      
      // Refresh logs
      const updatedLogs = await request('/security/logs');
      setLogs(updatedLogs);
    } catch (err) {
      console.error('Whitelist error:', err);
      setError(err.message || 'Failed to sync IP Whitelists.');
    } finally {
      setIpSaving(false);
    }
  };

  const getEventBadge = (event) => {
    switch (event) {
      case 'MFA_ENABLED':
      case 'MFA_VERIFIED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'IP_WHITELIST_MODIFIED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'SSO_LOGIN':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'IP_BLOCKED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-surface-high0/10 text-muted border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <p className="text-muted text-sm">Validating compliance certificates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <Shield className="text-indigo-400" size={32} />
          Security & Compliance
        </h1>
        <p className="text-sm text-muted mt-1">
          Configure Multi-Factor Authentication, lock company subdomains to whitelisted IP addresses, and monitor security access logs.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Security configurations split grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Two-factor Authentication */}
        <div className="bg-surface/30 border border-outline p-6 rounded-3xl space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <Key className="text-indigo-400" size={18} />
              Multi-Factor Authentication (MFA)
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Activate TOTP credentials to require secondary validation checks on security logins.
            </p>
          </div>

          {!qrCodeUrl && !mfaConfigured && (
            <div className="p-6 border border-dashed border-outline rounded-2xl flex flex-col items-center justify-center py-12 space-y-4">
              <QrCode size={36} className="text-on-surface-variant" />
              <div className="text-center">
                <p className="text-xs font-semibold text-on-surface-variant">MFA Protection Inactive</p>
                <p className="text-[10px] text-muted mt-1">Generate a temporary TOTP key to authorize setup.</p>
              </div>
              <button
                onClick={handleEnableMFA}
                disabled={mfaLoading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
              >
                {mfaLoading ? <Loader2 size={12} className="animate-spin" /> : 'Configure MFA'}
              </button>
            </div>
          )}

          {mfaConfigured && (
            <div className="p-6 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl flex items-center gap-4 py-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} className="animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">TOTP Authentication Active</p>
                <p className="text-[10px] text-muted mt-1">
                  Your profile requires a verification token generated by Google Authenticator during credentials queries.
                </p>
              </div>
            </div>
          )}

          {qrCodeUrl && (
            <div className="bg-background/40 border border-outline p-6 rounded-2xl space-y-6 flex flex-col items-center">
              <div className="bg-surface p-3 rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={qrCodeUrl} 
                  alt="MFA QR Code" 
                  className="w-36 h-36"
                />
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-on-surface">Scan with Google Authenticator</p>
                <p className="text-[10px] font-mono text-muted">Manual Key: {mfaSecret}</p>
              </div>

              <form onSubmit={handleVerifyMFA} className="w-full space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted">6-Digit Verification Token</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full text-center tracking-[0.5em] bg-background border border-outline px-3 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={mfaLoading || totpToken.length !== 6}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
                >
                  {mfaLoading ? <Loader2 size={12} className="animate-spin" /> : 'Verify Token'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right: IP Whitelisting */}
        <div className="bg-surface/30 border border-outline p-6 rounded-3xl space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <Terminal className="text-violet-400" size={18} />
              IP Access Whitelist
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Restrict access to your workspace portals. Any queries from unauthorized IPs will be blocked.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 192.168.1.50"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="flex-1 bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface"
              />
              <button
                type="button"
                onClick={handleAddIp}
                className="px-4 rounded-xl bg-surface-high hover:bg-slate-750 text-on-surface border border-outline font-bold text-xs transition flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="bg-background border border-outline rounded-2xl max-h-48 overflow-y-auto divide-y divide-slate-850">
              {ipList.length === 0 ? (
                <p className="text-center text-muted text-[10px] py-4">No IP restrictions active. Accessible universally.</p>
              ) : (
                ipList.map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-3 text-xs text-on-surface-variant">
                    <span className="font-mono">{ip}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIp(ip)}
                      className="p-1 hover:bg-surface-high text-muted hover:text-red-400 rounded transition"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveWhitelist}
              disabled={ipSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
            >
              {ipSaving ? <Loader2 size={12} className="animate-spin" /> : 'Save Whitelist Rules'}
            </button>
          </div>
        </div>

      </div>

      {/* Security Audit Trail Logs */}
      <div className="bg-surface/30 border border-outline p-6 rounded-3xl">
        <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 mb-6">
          <Activity size={18} className="text-indigo-400" />
          Security Access Log Trail
        </h3>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-muted text-xs border border-dashed border-outline rounded-2xl">
            No compliance security actions recorded yet in database audits.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline text-muted font-bold uppercase tracking-wider">
                  <th className="py-4 px-3">Audit ID</th>
                  <th className="py-4 px-3">Timestamp</th>
                  <th className="py-4 px-3">Event Action</th>
                  <th className="py-4 px-3">IP Address</th>
                  <th className="py-4 px-3 text-right">User Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-high/10 text-on-surface-variant transition">
                    <td className="py-4 px-3 font-mono text-[10px] text-muted">{log.id.slice(0, 12)}...</td>
                    <td className="py-4 px-3">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getEventBadge(log.event)}`}>
                        {log.event}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-mono">{log.ipAddress}</td>
                    <td className="py-4 px-3 text-right font-mono text-[10px] text-muted">{log.userId.slice(0, 12)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
