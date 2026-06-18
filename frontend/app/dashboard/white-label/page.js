'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  Palette, 
  Globe, 
  Mail, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

export default function WhiteLabelPage() {
  const [branding, setBranding] = useState({
    customDomain: '',
    primaryColor: '#6366F1',
    secondaryColor: '#4f46e5',
    logoUrl: '',
    emailBranding: 'HireFlow AI Recruiter'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await request('/white-label');
      setBranding(data);
    } catch (err) {
      console.error('Failed to fetch branding:', err);
      setError('Could not retrieve company branding profiles.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = await request('/white-label', {
        method: 'PUT',
        body: branding
      });
      setSuccess('Enterprise white-label branding parameters updated successfully!');
      setBranding(data.branding);
    } catch (err) {
      console.error('Failed to update branding:', err);
      setError(err.message || 'Could not save branding configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, val) => {
    setBranding(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const simulateLogo = () => {
    handleChange('logoUrl', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80');
    setSuccess('Mock logo loaded into configuration preview!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <p className="text-muted text-sm">Loading branding templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <Palette className="text-indigo-400" size={32} />
          White Labeling & Customization
        </h1>
        <p className="text-sm text-muted mt-1">
          Customize corporate color palettes, mount custom CNAME DNS subdomains, and upload company branding assets.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 columns: Configuration forms */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface/30 border border-outline p-6 rounded-3xl">
            <h3 className="font-bold text-lg text-on-surface mb-6">Branding Parameters</h3>

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Custom CNAME domain */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Globe size={12} className="text-indigo-400" />
                  Custom CNAME Subdomain
                </label>
                <input
                  type="text"
                  placeholder="e.g. careers.mycompany.com"
                  value={branding.customDomain}
                  onChange={(e) => handleChange('customDomain', e.target.value)}
                  className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
                />
                <p className="text-[10px] text-muted mt-1.5">
                  Point your DNS CNAME records to <code className="text-indigo-400 font-mono">cname.hireflow.ai</code> to establish DNS handshake mapping.
                </p>
              </div>

              {/* Theme Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Primary Theme Color</label>
                  <div className="flex gap-2.5 items-center mt-1.5">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="w-10 h-10 bg-background border border-outline rounded-xl cursor-pointer p-1"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="flex-1 bg-background border border-outline px-3 py-2 rounded-xl text-xs font-mono text-on-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Secondary Accent Color</label>
                  <div className="flex gap-2.5 items-center mt-1.5">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      className="w-10 h-10 bg-background border border-outline rounded-xl cursor-pointer p-1"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      className="flex-1 bg-background border border-outline px-3 py-2 rounded-xl text-xs font-mono text-on-surface"
                    />
                  </div>
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-violet-400" />
                  Branding Logo URL
                </label>
                <div className="flex gap-2.5 mt-1.5">
                  <input
                    type="url"
                    placeholder="https://mycompany.com/logo.png"
                    value={branding.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    className="flex-1 bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={simulateLogo}
                    className="px-4 rounded-xl bg-surface-high hover:bg-slate-750 text-on-surface border border-outline font-bold text-xs transition whitespace-nowrap"
                  >
                    Simulate Logo
                  </button>
                </div>
              </div>

              {/* Email Suffix footer */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Mail size={12} className="text-pink-400" />
                  Custom Email Signature Suffix
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Company HR Communications"
                  value={branding.emailBranding}
                  onChange={(e) => handleChange('emailBranding', e.target.value)}
                  className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 mt-4"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Branding Configurations'}
              </button>

            </form>
          </div>
        </div>

        {/* Right 5 columns: Live Portal UI Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface/30 border border-outline p-6 rounded-3xl space-y-6">
            <div>
              <h3 className="font-bold text-lg text-on-surface">Live Interface Preview</h3>
              <p className="text-xs text-muted mt-0.5">Real-time preview of the candidate portals structure.</p>
            </div>

            <div className="bg-background border border-outline rounded-2xl p-6 space-y-6 relative overflow-hidden">
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-surface border border-outline text-[8px] text-muted font-bold uppercase">
                Simulated Screen
              </span>

              {/* Preview header */}
              <div className="flex items-center justify-between border-b border-outline pb-3">
                <div className="flex items-center gap-2">
                  {branding.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={branding.logoUrl} alt="Logo preview" className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <div 
                      style={{ backgroundColor: branding.primaryColor }}
                      className="w-6 h-6 rounded flex items-center justify-center text-on-surface font-bold text-[10px]"
                    >
                      P
                    </div>
                  )}
                  <span className="font-bold text-xs text-on-surface">Custom Portal</span>
                </div>
                
                <span className="text-[9px] text-muted font-mono">
                  {branding.customDomain || 'tenant.hireflow.ai'}
                </span>
              </div>

              {/* Preview dashboard widget */}
              <div className="space-y-3">
                <div 
                  style={{ borderLeftColor: branding.primaryColor }}
                  className="bg-surface/50 p-4 rounded-xl border-l-2 space-y-2"
                >
                  <p className="text-[10px] font-bold text-muted flex items-center gap-1">
                    <LayoutDashboard size={10} /> Active Recruitment Pipeline
                  </p>
                  <div className="flex gap-2">
                    <div className="w-12 h-2 rounded bg-surface-high animate-pulse"></div>
                    <div className="w-16 h-2 rounded bg-surface-high animate-pulse"></div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    style={{ backgroundColor: branding.primaryColor }}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-on-surface transition-opacity hover:opacity-95"
                  >
                    Primary Button
                  </button>
                  <button
                    style={{ borderColor: branding.secondaryColor, color: branding.secondaryColor }}
                    className="flex-1 py-1.5 rounded-lg border text-[10px] font-bold bg-transparent"
                  >
                    Secondary Button
                  </button>
                </div>
              </div>

              {/* Preview Email suffix */}
              <div className="border-t border-outline pt-3 text-center text-[9px] text-muted font-medium">
                {branding.emailBranding} &bull; Powered by HireFlow.AI
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
