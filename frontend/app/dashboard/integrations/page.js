'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  Link2, 
  Unlink, 
  Check, 
  Loader2, 
  Settings2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Info
} from 'lucide-react';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Connect modal states
  const [activeProvider, setActiveProvider] = useState(null);
  const [credentials, setCredentials] = useState('');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await request('/integrations');
      setIntegrations(data);
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
      setError('Could not retrieve integration providers. Ensure backend is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!activeProvider) return;
    setConnecting(true);
    setError('');
    setSuccess('');

    try {
      await request('/integrations/connect', {
        method: 'POST',
        body: {
          provider: activeProvider.provider,
          credentials: credentials ? { api_token: credentials } : null
        }
      });
      setSuccess(`Established connection to ${activeProvider.name} successfully!`);
      setActiveProvider(null);
      setCredentials('');
      
      // Refresh integration lists
      const updated = await request('/integrations');
      setIntegrations(updated);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message || 'Could not connect integration provider.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (integrationId, providerName) => {
    if (!confirm(`Are you sure you want to disconnect ${providerName}?`)) return;
    setError('');
    setSuccess('');

    try {
      await request(`/integrations/${integrationId}`, {
        method: 'DELETE'
      });
      setSuccess(`Disconnected from ${providerName}.`);
      
      // Refresh integration lists
      const updated = await request('/integrations');
      setIntegrations(updated);
    } catch (err) {
      console.error('Disconnection error:', err);
      setError(err.message || 'Failed to disconnect integration provider.');
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat.toLowerCase()) {
      case 'communication': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'calendar': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'storage': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'hr systems': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'recruitment': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-surface-high0/10 text-muted border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <p className="text-muted text-sm">Querying integrations registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <Link2 className="text-indigo-400" size={32} />
          Integrations Hub
        </h1>
        <p className="text-sm text-muted mt-1">
          Sync third-party communication channels, calendars, document directories, and master HR management systems.
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

      {/* Info notice about credentials security */}
      <div className="bg-surface/30 border border-outline p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">Encrypted API Credentials</h4>
            <p className="text-xs text-muted mt-0.5">
              HireFlow secures all authentication tokens and OAuth secrets utilizing AES-256-GCM tenant key isolations.
            </p>
          </div>
        </div>
        <div className="text-xs font-bold text-muted flex items-center gap-1.5 shrink-0 bg-background border border-outline px-3.5 py-1.5 rounded-xl">
          <Cpu size={14} className="text-indigo-400" /> AES-256 Secured
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div 
            key={item.provider}
            className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
              item.connected 
                ? 'bg-background/80 border-indigo-500/40 shadow-md' 
                : 'bg-surface/40 border-outline hover:border-outline'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>

                {item.connected ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                    Connected
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wide">
                    Disconnected
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-on-surface">{item.name}</h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed min-h-[40px]">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted">
                Provider: {item.provider}
              </span>

              {item.connected ? (
                <button
                  onClick={() => handleDisconnect(item.integrationId, item.name)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold transition"
                >
                  <Unlink size={12} /> Disconnect
                </button>
              ) : (
                <button
                  onClick={() => setActiveProvider(item)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/10"
                >
                  <Settings2 size={12} /> Configure
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connect popup credentials Modal */}
      {activeProvider && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-outline rounded-3xl p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="font-bold text-lg text-on-surface">Connect {activeProvider.name}</h3>
              <p className="text-xs text-muted mt-1">
                Provide client access configurations or authentication tokens to establish connector synchronization.
              </p>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Authentication Token / Client Secret
                </label>
                <textarea
                  placeholder="Paste OAuth client token or click below to simulate..."
                  rows={4}
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-2 font-mono"
                />
              </div>

              <div className="bg-background border border-outline rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-muted leading-normal">
                <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>Leaving token empty will simulate an automated webhook handshake (convenient for local validation).</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveProvider(null);
                    setCredentials('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-surface-high hover:bg-slate-750 text-on-surface-variant font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
                >
                  {connecting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <>Establish Connection</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
