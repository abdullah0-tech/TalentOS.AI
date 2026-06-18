'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { request } from '../../../services/api';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Check,
  Sparkles,
  Info,
  Building,
  Save,
  Palette,
  Globe,
  Bell,
  Lock,
  ArrowRight,
  HelpCircle,
  Mail,
  Server,
  Eye,
  EyeOff,
  Zap,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Activity
} from 'lucide-react';

// ─── Automation event definitions ───────────────────────────────────────────
const AUTOMATION_EVENTS = {
  'candidate-applied':      { label: 'Candidate Applied',         category: 'Recruitment',     desc: 'Notify candidate when their application is received.' },
  'shortlisted':            { label: 'Candidate Shortlisted',     category: 'Recruitment',     desc: 'Notify candidate when they are shortlisted for the role.' },
  'interview-scheduled':    { label: 'Interview Scheduled',       category: 'Recruitment',     desc: 'Send interview invitation with .ics calendar attachment.' },
  'interview-reminder':     { label: 'Interview Reminder',        category: 'Recruitment',     desc: 'Auto-send 24-hour reminder before scheduled interview.' },
  'rejected':               { label: 'Candidate Rejected',        category: 'Recruitment',     desc: 'Notify candidate when their application is not moving forward.' },
  'offer-letter':           { label: 'Offer Sent',                category: 'Recruitment',     desc: 'Send formal job offer letter with compensation details.' },
  'hired':                  { label: 'Candidate Hired',           category: 'Recruitment',     desc: 'Welcome email upon candidate accepting the offer.' },
  'employee-invitation':    { label: 'Employee Welcome Email',    category: 'HR Operations',   desc: 'Send portal activation link to new employee accounts.' },
  'account-activated':      { label: 'Portal Account Activated',  category: 'HR Operations',   desc: 'Confirmation email when employee activates their account.' },
  'password-reset':         { label: 'Password Reset',            category: 'HR Operations',   desc: 'Deliver secure password reset token link.' },
  'leave-approved':         { label: 'Leave Approval',            category: 'HR Operations',   desc: 'Notify employee when a leave request is approved.' },
  'leave-rejected':         { label: 'Leave Rejection',           category: 'HR Operations',   desc: 'Notify employee when a leave request is declined.' }
};

// ─── Default form state ──────────────────────────────────────────────────────
const DEFAULT_EMAIL_SETTINGS = {
  provider: 'smtp',
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPass: '',
  smtpEncryption: 'TLS',
  replyToEmail: '',
  senderName: '',
  senderEmail: '',
  resendApiKey: '',
  sendgridApiKey: '',
  enabledEvents: Object.keys(AUTOMATION_EVENTS).join(',')
};

// ─── Notification helper ─────────────────────────────────────────────────────
function useNotification() {
  const [notification, setNotification] = useState({ type: '', message: '' });
  const show = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 6000);
  };
  return { notification, showNotification: show };
}

// ─── Sub-component: Status Badge ─────────────────────────────────────────────
function StatusBadge({ connected }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
      connected
        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
        : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
      {connected ? 'SMTP Connected' : 'SMTP Disconnected'}
    </span>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { lang, changeLanguage, t } = useLanguage();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Will be updated from searchParams in useEffect (client-side only)
    return 'appearance';
  });

  // Appearance state
  const [workspaceName, setWorkspaceName] = useState('Acme Recruiting');
  const [accentColor, setAccentColor] = useState('blue');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // ─── Email Settings state ──────────────────────────────────────────────────
  const [emailSettings, setEmailSettings] = useState(DEFAULT_EMAIL_SETTINGS);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { notification, showNotification } = useNotification();

  // Test Connection state
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null); // { success, message, hint? }

  // Send Test Email state
  const [testEmailTo, setTestEmailTo] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null); // { success, message }

  // Email Status state
  const [emailStatus, setEmailStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = 'Workspace Settings | TalentOS.AI';
    // Read tab from URL query param — supports ?tab=email sidebar link
    const tabParam = searchParams?.get('tab');
    const validTabs = ['appearance', 'general', 'email', 'notifications', 'security'];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Load email settings when tab switches to 'email'
  useEffect(() => {
    if (activeTab === 'email') {
      fetchEmailSettings();
      fetchEmailStatus();
    }
  }, [activeTab]);

  // ─── Fetch email settings ────────────────────────────────────────────────
  const fetchEmailSettings = async () => {
    try {
      setEmailLoading(true);
      const data = await request('/emails/settings');
      setEmailSettings({
        provider: data.provider || 'smtp',
        smtpHost: data.smtpHost || '',
        smtpPort: data.smtpPort ? String(data.smtpPort) : '587',
        smtpUser: data.smtpUser || '',
        smtpPass: data.smtpPassIsSet ? '••••••••••••' : '',
        smtpEncryption: data.smtpEncryption || 'TLS',
        replyToEmail: data.replyToEmail || '',
        senderName: data.senderName || '',
        senderEmail: data.senderEmail || '',
        resendApiKey: data.resendApiKey || '',
        sendgridApiKey: data.sendgridApiKey || '',
        enabledEvents: data.enabledEvents || Object.keys(AUTOMATION_EVENTS).join(',')
      });
    } catch (err) {
      showNotification('error', 'Failed to load email configuration settings.');
    } finally {
      setEmailLoading(false);
    }
  };

  // ─── Fetch email status ──────────────────────────────────────────────────
  const fetchEmailStatus = async () => {
    try {
      setStatusLoading(true);
      const data = await request('/emails/smtp-status');
      setEmailStatus(data);
    } catch (err) {
      console.error('Failed to fetch email status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  // ─── Save email settings ─────────────────────────────────────────────────
  const handleSaveEmailSettings = async (e) => {
    e.preventDefault();
    try {
      setEmailLoading(true);
      setConnectionResult(null);
      const data = await request('/emails/settings', {
        method: 'POST',
        body: {
          ...emailSettings,
          smtpPort: emailSettings.smtpPort ? parseInt(emailSettings.smtpPort, 10) : null
        }
      });
      setEmailSettings(prev => ({
        ...prev,
        smtpPass: data.settings?.smtpPassIsSet ? '••••••••••••' : ''
      }));
      showNotification('success', 'Email configuration saved successfully.');
      fetchEmailStatus();
    } catch (err) {
      showNotification('error', err.message || 'Failed to save email settings.');
    } finally {
      setEmailLoading(false);
    }
  };

  // ─── Test SMTP Connection ────────────────────────────────────────────────
  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setConnectionResult(null);
      // Save first, then test
      await request('/emails/settings', {
        method: 'POST',
        body: {
          ...emailSettings,
          smtpPort: emailSettings.smtpPort ? parseInt(emailSettings.smtpPort, 10) : null
        }
      });
      const data = await request('/emails/test-connection', { method: 'POST' });
      setConnectionResult({ success: true, message: data.message });
      fetchEmailStatus();
    } catch (err) {
      const errData = err?.response ? await err.response.json().catch(() => ({})) : {};
      setConnectionResult({
        success: false,
        message: errData.error || err.message || 'SMTP connection test failed.',
        hint: errData.hint || ''
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // ─── Send Test Email ─────────────────────────────────────────────────────
  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailTo) return;
    try {
      setSendingTestEmail(true);
      setTestEmailResult(null);
      await request('/emails/test', {
        method: 'POST',
        body: { to: testEmailTo }
      });
      setTestEmailResult({ success: true, message: `Test email dispatched to ${testEmailTo}.` });
      setTestEmailTo('');
      fetchEmailStatus();
    } catch (err) {
      setTestEmailResult({ success: false, message: err.message || 'Failed to send test email.' });
    } finally {
      setSendingTestEmail(false);
    }
  };

  // ─── Toggle event automation ─────────────────────────────────────────────
  const handleToggleEvent = async (eventKey) => {
    const currentEnabled = emailSettings.enabledEvents
      ? emailSettings.enabledEvents.split(',').filter(Boolean)
      : Object.keys(AUTOMATION_EVENTS);

    const nextEnabled = currentEnabled.includes(eventKey)
      ? currentEnabled.filter(k => k !== eventKey)
      : [...currentEnabled, eventKey];

    const updatedSettings = { ...emailSettings, enabledEvents: nextEnabled.join(',') };
    setEmailSettings(updatedSettings);

    try {
      await request('/emails/settings', {
        method: 'POST',
        body: { enabledEvents: nextEnabled.join(',') }
      });
    } catch (err) {
      showNotification('error', 'Failed to update automation setting. Reverting...');
      fetchEmailSettings();
    }
  };

  // ─── Gmail Preset ────────────────────────────────────────────────────────
  const applyGmailPreset = () => {
    setEmailSettings(prev => ({
      ...prev,
      provider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpEncryption: 'TLS'
    }));
    showNotification('success', 'Gmail preset applied! Enter your Gmail address and App Password below.');
  };

  // ─── Encryption type change handler ──────────────────────────────────────
  const handleEncryptionChange = (encryption) => {
    setEmailSettings(prev => ({
      ...prev,
      smtpEncryption: encryption,
      smtpPort: encryption === 'SSL' ? '465' : encryption === 'TLS' ? '587' : prev.smtpPort
    }));
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-surface-highest dark:bg-surface-high rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-surface-highest dark:bg-surface rounded-2xl"></div>
          <div className="h-96 bg-surface-highest dark:bg-surface rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const themes = [
    { id: 'light', name: 'Light Mode', desc: 'Clean corporate white aesthetic with sharp typography and high contrast.', icon: Sun, bgColor: 'bg-[#F8FAFC]', surfaceColor: 'bg-surface', textColor: 'text-[#0F172A]', borderColor: 'border-outline' },
    { id: 'dark',  name: 'Dark Mode',  desc: 'Elegant deep blue-gray mode designed to reduce eye strain in low-light environments.', icon: Moon, bgColor: 'bg-[#0B1020]', surfaceColor: 'bg-[#111827]', textColor: 'text-[#F8FAFC]', borderColor: 'border-[rgba(255,255,255,0.08)]' },
    { id: 'system', name: 'System Default', desc: 'Automatically synchronize TalentOS theme preference with your operating system settings.', icon: Monitor, bgColor: 'bg-gradient-to-br from-[#F8FAFC] to-[#0B1020]', surfaceColor: 'bg-gradient-to-br from-white to-[#111827]', textColor: 'text-on-surface', borderColor: 'border-outline' }
  ];

  const accents = [
    { id: 'blue', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', label: 'Indigo Blue' },
    { id: 'purple', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', label: 'Vibrant Purple' },
    { id: 'emerald', color: 'bg-emerald-500', ringColor: 'ring-emerald-500/30', label: 'Emerald Green' },
    { id: 'rose', color: 'bg-rose-500', ringColor: 'ring-rose-500/30', label: 'Corporate Rose' }
  ];

  const enabledList = emailSettings.enabledEvents
    ? emailSettings.enabledEvents.split(',').filter(Boolean)
    : Object.keys(AUTOMATION_EVENTS);

  const tabs = [
    { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
    { id: 'general', label: 'Workspace Info', icon: Building },
    { id: 'email', label: 'Email Configuration', icon: Mail },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'security', label: 'Security & SSO', icon: Lock }
  ];

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline pb-6">
        <div>
          <h1 id="settings-heading" className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3 font-display">
            <Settings className="text-primary" size={32} />
            {t('settings')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
            Manage your workspace configuration, appearance styles, email delivery, and preferences.
          </p>
        </div>
      </div>

      {/* Global Notification */}
      {notification.message && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/10'
                    : 'text-on-surface-variant hover:bg-surface-high dark:hover:bg-surface/50 hover:text-on-surface'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="p-4 bg-surface-high dark:bg-surface/40 border border-outline rounded-2xl mt-4">
            <div className="flex gap-2 text-primary">
              <Info size={14} className="shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-on-surface-variant">
                Settings changes take effect immediately. SMTP credentials are encrypted before storage.
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">

          {/* ─── APPEARANCE TAB ─────────────────────────────────────────────── */}
          {activeTab === 'appearance' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-7 bg-surface border border-outline rounded-2xl p-6 relative overflow-hidden space-y-6">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
                <div>
                  <h2 className="font-bold text-on-surface text-base flex items-center gap-2 font-display">
                    <Palette className="text-primary" size={18} /> Theme Preference
                  </h2>
                  <p className="text-[11px] text-on-surface-variant mt-1">Select how TalentOS should appear on your device screen.</p>
                </div>
                <div className="space-y-3">
                  {themes.map((thm) => {
                    const Icon = thm.icon;
                    const isSelected = theme === thm.id;
                    return (
                      <button
                        key={thm.id}
                        id={`theme-select-${thm.id}`}
                        onClick={() => setTheme(thm.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 hover:shadow-md ${
                          isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary-light/10' : 'border-outline hover:border-surface-highest bg-surface'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl border ${thm.borderColor} ${thm.bgColor} ${thm.textColor} shrink-0`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-on-surface">{thm.name}</span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                                <Check size={12} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{thm.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="pt-4 border-t border-outline space-y-3">
                  <div>
                    <h3 className="font-bold text-on-surface text-xs font-display">Custom Brand Accent</h3>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Customize workspace action buttons and emphasis colors.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {accents.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        id={`accent-select-${acc.id}`}
                        onClick={() => setAccentColor(acc.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                          accentColor === acc.id ? 'border-primary bg-primary-light/25 text-primary' : 'border-outline hover:border-surface-highest text-on-surface-variant'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${acc.color} shadow-sm`} />
                        <span>{acc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-outline space-y-3">
                  <div>
                    <h3 className="font-bold text-on-surface text-xs font-display flex items-center gap-1.5">
                      <Globe size={13} className="text-primary" /> System Interface Language
                    </h3>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Toggle default interface translations and RTL layout.</p>
                  </div>
                  <div className="relative w-full max-w-xs">
                    <select
                      value={lang}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="w-full bg-surface-high dark:bg-surface border border-outline rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer text-on-surface"
                    >
                      <option value="en">English (US)</option>
                      <option value="ur">اردو (Urdu)</option>
                      <option value="ar">العربية (Arabic)</option>
                      <option value="fr">Français (French)</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="de">Deutsch (German)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="xl:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Sparkles size={12} className="text-primary animate-pulse" /> Live Preview
                  </span>
                  <span className="text-[10px] text-muted flex items-center gap-1">
                    <HelpCircle size={10} /> Syncs in real-time
                  </span>
                </div>
                <div className="w-full bg-background border border-outline rounded-2xl shadow-xl overflow-hidden font-sans border-t-4 border-t-primary transition-all duration-300 transform hover:scale-[1.01]">
                  <div className="h-10 border-b border-outline bg-surface px-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-primary shrink-0 animate-pulse" />
                      <span className="text-[9px] font-bold text-on-surface truncate">{workspaceName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-3 h-3 rounded-full bg-surface-highest dark:bg-surface-high flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </span>
                      <span className="w-3 h-3 rounded-full bg-primary-light flex items-center justify-center text-primary text-[7px] font-bold">A</span>
                    </div>
                  </div>
                  <div className="flex h-[280px]">
                    <div className="w-14 bg-surface border-r border-outline p-1.5 space-y-2 shrink-0">
                      <div className="space-y-1">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className={`h-3.5 rounded flex items-center gap-1 px-1 transition ${item === 1 ? 'bg-primary-light text-primary' : 'hover:bg-surface-high dark:hover:bg-surface/50'}`}>
                            <span className={`w-1 h-1 rounded-full ${item === 1 ? 'bg-primary' : 'bg-muted'}`} />
                            <div className={`h-1 rounded-full ${item === 1 ? 'bg-primary w-6' : 'bg-muted w-4'}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 bg-background p-3.5 space-y-3.5 overflow-y-auto no-scrollbar">
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <div className="h-2 bg-on-surface w-16 rounded-full" />
                          <div className="h-1.5 bg-on-surface-variant w-24 rounded-full opacity-60" />
                        </div>
                        <div className="h-3.5 bg-primary rounded px-2 flex items-center justify-center text-[7px] font-bold text-white shadow-sm shrink-0">+ Add Job</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[{ label: 'Active Jobs', val: '14', trend: '+2' }, { label: 'Candidates', val: '312', trend: '+24' }].map((card, idx) => (
                          <div key={idx} className="bg-surface border border-outline rounded-lg p-2 flex flex-col justify-between shadow-sm">
                            <span className="text-[7px] text-on-surface-variant font-medium block leading-none truncate">{card.label}</span>
                            <div className="flex items-baseline justify-between mt-1.5">
                              <span className="text-xs font-bold text-on-surface tracking-tight leading-none">{card.val}</span>
                              <span className="text-[6px] font-bold text-success leading-none">{card.trend}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-surface border border-outline rounded-2xl flex gap-2">
                  <span className="text-primary text-xs mt-0.5">💡</span>
                  <p className="text-[10px] leading-relaxed text-on-surface-variant">
                    The preview adjusts styles automatically to mirror your theme switch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── GENERAL TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'general' && (
            <form onSubmit={(e) => { e.preventDefault(); setSaving(true); setTimeout(() => { setSaving(false); setSavedSuccess(true); setTimeout(() => setSavedSuccess(false), 3000); }, 1000); }} className="bg-surface border border-outline rounded-2xl p-6 relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
              <div>
                <h2 className="font-bold text-on-surface text-base flex items-center gap-2 font-display">
                  <Building className="text-primary" size={18} /> General Workspace Settings
                </h2>
                <p className="text-[11px] text-on-surface-variant mt-1">Configure names and attributes used across your business workspace.</p>
              </div>
              {savedSuccess && (
                <div className="p-3.5 rounded-xl text-xs bg-success/10 border border-success/20 text-success flex items-center gap-2 shadow-sm">
                  <Check size={14} />
                  <span className="font-semibold">Workspace configuration saved successfully!</span>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Company Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full bg-surface-high dark:bg-surface/40 border border-outline rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Workspace Slug</label>
                  <div className="flex rounded-xl overflow-hidden border border-outline bg-surface-high dark:bg-surface/40">
                    <span className="px-3 py-2.5 bg-surface-highest dark:bg-surface-high text-[10px] text-muted font-mono flex items-center">talentos.ai/</span>
                    <input type="text" disabled value="acme-recruiting" className="w-full bg-transparent px-3 py-2.5 text-xs text-on-surface-variant font-mono focus:outline-none" />
                  </div>
                  <p className="text-[9px] text-muted mt-1">Workspace slug cannot be changed without contacting Enterprise Support.</p>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-outline">
                <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 transition-all">
                  {saving ? 'Saving...' : <><Save size={14} />Save Changes</>}
                </button>
              </div>
            </form>
          )}

          {/* ─── EMAIL CONFIGURATION TAB ─────────────────────────────────────── */}
          {activeTab === 'email' && (
            <div className="space-y-6">

              {/* ── Status Card ───────────────────────────────────────────────── */}
              <div className="bg-background/40 border border-outline/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="text-indigo-400" size={16} />
                    <h3 className="font-bold text-on-surface text-sm">Email System Status</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {emailStatus && <StatusBadge connected={emailStatus.smtpConfigured} />}
                    <button
                      onClick={fetchEmailStatus}
                      disabled={statusLoading}
                      className="p-1.5 text-muted hover:text-on-surface transition rounded-lg hover:bg-surface"
                      title="Refresh status"
                    >
                      <RefreshCw size={13} className={statusLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                {emailStatus ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Emails Sent Today */}
                    <div className="bg-surface/40 border border-outline rounded-xl p-3 space-y-1">
                      <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Sent Today</p>
                      <p className="text-2xl font-extrabold text-on-surface">{emailStatus.emailsSentToday}</p>
                      <p className="text-[9px] text-muted">emails dispatched</p>
                    </div>
                    {/* Provider */}
                    <div className="bg-surface/40 border border-outline rounded-xl p-3 space-y-1">
                      <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Active Provider</p>
                      <p className="text-sm font-extrabold text-on-surface uppercase">{emailStatus.provider}</p>
                      <p className="text-[9px] text-muted">{emailStatus.smtpHost || 'not configured'}</p>
                    </div>
                    {/* Last Sent */}
                    <div className="bg-surface/40 border border-outline rounded-xl p-3 space-y-1">
                      <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Last Email Sent</p>
                      {emailStatus.lastEmailSent ? (
                        <>
                          <p className="text-[10px] font-semibold text-on-surface truncate">{emailStatus.lastEmailSent.email}</p>
                          <p className="text-[9px] text-muted">{new Date(emailStatus.lastEmailSent.sentAt).toLocaleString()}</p>
                        </>
                      ) : (
                        <p className="text-[10px] text-muted">No emails sent yet</p>
                      )}
                    </div>
                    {/* Last Error */}
                    <div className="bg-surface/40 border border-outline rounded-xl p-3 space-y-1">
                      <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Last Error</p>
                      {emailStatus.lastError ? (
                        <>
                          <p className="text-[10px] font-semibold text-red-400 truncate">{emailStatus.lastError.errorMessage?.slice(0, 40)}</p>
                          <p className="text-[9px] text-muted">{new Date(emailStatus.lastError.failedAt).toLocaleString()}</p>
                        </>
                      ) : (
                        <p className="text-[10px] text-emerald-400 font-semibold">No recent errors</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-surface/40 border border-outline rounded-xl p-3 h-16 animate-pulse" />
                    ))}
                  </div>
                )}
              </div>

              {/* ── SMTP Configuration Form ─────────────────────────────────── */}
              <form onSubmit={handleSaveEmailSettings} className="bg-background/40 border border-outline/80 rounded-2xl p-6 relative overflow-hidden space-y-6">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                      <Server className="text-indigo-400" size={18} /> SMTP Configuration
                    </h3>
                    <p className="text-[11px] text-muted mt-1">Configure your outbound email delivery server. Credentials are encrypted before storage.</p>
                  </div>
                  {/* Gmail Preset Button */}
                  <button
                    type="button"
                    onClick={applyGmailPreset}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/15 border border-indigo-500/30 hover:bg-indigo-600/25 text-indigo-400 font-bold text-xs transition whitespace-nowrap"
                  >
                    <Mail size={13} />
                    Gmail Preset
                  </button>
                </div>

                {/* Provider Selector */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Email Provider</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'smtp', name: 'SMTP Server', desc: 'Gmail, Outlook, custom' },
                      { id: 'console', name: 'Console Mock', desc: 'Dev/test mode only' },
                      { id: 'resend', name: 'Resend API', desc: 'Preferred SaaS API' },
                      { id: 'sendgrid', name: 'SendGrid API', desc: 'Classic Cloud Email' }
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setEmailSettings(prev => ({ ...prev, provider: p.id }))}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition h-20 ${
                          emailSettings.provider === p.id
                            ? 'border-indigo-500 bg-indigo-600/10 text-white shadow-md'
                            : 'border-outline hover:border-outline bg-surface/30 text-muted'
                        }`}
                      >
                        <span className="font-bold text-xs">{p.name}</span>
                        <span className="text-[9px] leading-tight text-muted mt-1">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SMTP fields — shown when provider is smtp */}
                {emailSettings.provider === 'smtp' && (
                  <div className="space-y-5 p-5 bg-surface/30 border border-outline rounded-xl">
                    {/* Host + Port */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">SMTP Host</label>
                        <input
                          type="text"
                          value={emailSettings.smtpHost}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                          placeholder="smtp.gmail.com"
                          className="w-full bg-background border border-outline rounded-lg px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">SMTP Port</label>
                        <input
                          type="number"
                          value={emailSettings.smtpPort}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                          placeholder="587"
                          className="w-full bg-background border border-outline rounded-lg px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition"
                          required
                        />
                      </div>
                    </div>

                    {/* Encryption Type */}
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Encryption Type</label>
                      <div className="flex gap-2">
                        {['TLS', 'SSL', 'None'].map((enc) => (
                          <button
                            key={enc}
                            type="button"
                            onClick={() => handleEncryptionChange(enc)}
                            className={`px-4 py-2 rounded-lg border text-xs font-bold transition ${
                              emailSettings.smtpEncryption === enc
                                ? 'border-indigo-500 bg-indigo-600/15 text-indigo-400'
                                : 'border-outline text-muted hover:border-slate-600 hover:text-on-surface-variant'
                            }`}
                          >
                            {enc}
                            {enc === 'TLS' && <span className="ml-1 text-[8px] opacity-60">:587</span>}
                            {enc === 'SSL' && <span className="ml-1 text-[8px] opacity-60">:465</span>}
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-muted mt-1.5">TLS is recommended for Gmail. SSL is required for port 465. None for legacy servers only.</p>
                    </div>

                    {/* Username + Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">SMTP Username</label>
                        <input
                          type="email"
                          value={emailSettings.smtpUser}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                          placeholder="you@gmail.com"
                          className="w-full bg-background border border-outline rounded-lg px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Lock size={10} className="text-indigo-400" />
                          SMTP Password / App Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={emailSettings.smtpPass}
                            onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPass: e.target.value }))}
                            placeholder="••••••••••••"
                            className="w-full bg-background border border-outline rounded-lg px-3 py-2.5 pr-10 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-on-surface transition"
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        <p className="text-[9px] text-muted mt-1">Stored encrypted. For Gmail, use a 16-character App Password.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resend API Key */}
                {emailSettings.provider === 'resend' && (
                  <div className="p-4 bg-surface/40 border border-outline rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Lock size={12} className="text-indigo-400" /> Resend API Key
                    </label>
                    <input
                      type="password"
                      value={emailSettings.resendApiKey}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, resendApiKey: e.target.value }))}
                      placeholder="re_..."
                      className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition font-mono"
                    />
                  </div>
                )}

                {/* SendGrid API Key */}
                {emailSettings.provider === 'sendgrid' && (
                  <div className="p-4 bg-surface/40 border border-outline rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Lock size={12} className="text-indigo-400" /> SendGrid API Key
                    </label>
                    <input
                      type="password"
                      value={emailSettings.sendgridApiKey}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, sendgridApiKey: e.target.value }))}
                      placeholder="SG.xxxxx..."
                      className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition font-mono"
                    />
                  </div>
                )}

                {/* Sender Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Sender Name</label>
                    <input
                      type="text"
                      value={emailSettings.senderName}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, senderName: e.target.value }))}
                      placeholder="e.g. TalentOS Recruiting"
                      className="w-full bg-surface/60 border border-outline rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Sender Email</label>
                    <input
                      type="email"
                      value={emailSettings.senderEmail}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, senderEmail: e.target.value }))}
                      placeholder="hiring@company.com"
                      className="w-full bg-surface/60 border border-outline rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Reply-To Email (Optional)</label>
                    <input
                      type="email"
                      value={emailSettings.replyToEmail}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, replyToEmail: e.target.value }))}
                      placeholder="replies@company.com"
                      className="w-full bg-surface/60 border border-outline rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition"
                    />
                    <p className="text-[9px] text-muted mt-1">When recipients hit "Reply", it goes to this address instead of the Sender Email.</p>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end pt-4 border-t border-outline">
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/10 transition"
                  >
                    {emailLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    {emailLoading ? 'Saving...' : 'Save SMTP Settings'}
                  </button>
                </div>
              </form>

              {/* ── Test Buttons Row ───────────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Test Connection Card */}
                <div className="bg-background/40 border border-outline/80 rounded-2xl p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-on-surface text-sm flex items-center gap-2">
                      <Wifi className="text-indigo-400" size={16} /> Test SMTP Connection
                    </h4>
                    <p className="text-[10px] text-muted mt-1">Verify credentials against SMTP server without sending any email.</p>
                  </div>

                  {connectionResult && (
                    <div className={`p-3 rounded-xl text-xs border flex items-start gap-2 ${
                      connectionResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {connectionResult.success ? <CheckCircle size={14} className="shrink-0 mt-0.5" /> : <WifiOff size={14} className="shrink-0 mt-0.5" />}
                      <div>
                        <p className="font-semibold leading-tight">{connectionResult.message}</p>
                        {connectionResult.hint && <p className="mt-1 opacity-80 text-[10px]">💡 {connectionResult.hint}</p>}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="w-full py-2.5 rounded-xl bg-surface-high hover:bg-slate-700 disabled:opacity-50 text-on-surface font-bold text-xs flex items-center justify-center gap-2 border border-outline transition"
                  >
                    {testingConnection ? (
                      <><RefreshCw size={14} className="animate-spin" />Testing Connection...</>
                    ) : (
                      <><ShieldCheck size={14} />Test SMTP Connection</>
                    )}
                  </button>
                </div>

                {/* Send Test Email Card */}
                <div className="bg-background/40 border border-outline/80 rounded-2xl p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-on-surface text-sm flex items-center gap-2">
                      <Send className="text-indigo-400" size={16} /> Send Test Email
                    </h4>
                    <p className="text-[10px] text-muted mt-1">Dispatch a real test message to verify end-to-end delivery.</p>
                  </div>

                  {testEmailResult && (
                    <div className={`p-3 rounded-xl text-xs border flex items-start gap-2 ${
                      testEmailResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {testEmailResult.success ? <CheckCircle size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5" />}
                      <p className="font-semibold leading-tight">{testEmailResult.message}</p>
                    </div>
                  )}

                  <form onSubmit={handleSendTestEmail} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Recipient Email</label>
                      <input
                        type="email"
                        value={testEmailTo}
                        onChange={(e) => setTestEmailTo(e.target.value)}
                        placeholder="test@yourdomain.com"
                        className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sendingTestEmail || !testEmailTo}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      {sendingTestEmail ? (
                        <><RefreshCw size={14} className="animate-spin" />Sending...</>
                      ) : (
                        <><Zap size={14} />Send Test Email</>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* ── Automation Toggles ───────────────────────────────────────── */}
              <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 relative overflow-hidden space-y-5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div>
                  <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                    <Zap className="text-indigo-400" size={18} /> Email Automation Settings
                  </h3>
                  <p className="text-xs text-muted mt-1">Toggle which events automatically trigger outbound email notifications. Changes save instantly.</p>
                </div>

                {/* Group by category */}
                {['Recruitment', 'HR Operations'].map((category) => {
                  const events = Object.entries(AUTOMATION_EVENTS).filter(([, info]) => info.category === category);
                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted font-mono">{category}</span>
                        <div className="flex-1 h-px bg-outline/50" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {events.map(([key, info]) => {
                          const isEnabled = enabledList.includes(key);
                          return (
                            <div
                              key={key}
                              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition ${
                                isEnabled ? 'border-outline bg-surface/10' : 'border-outline/40 opacity-55'
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0">
                                <p className="font-bold text-xs text-on-surface leading-tight">{info.label}</p>
                                <p className="text-[9px] text-muted leading-relaxed">{info.desc}</p>
                              </div>
                              <button
                                onClick={() => handleToggleEvent(key)}
                                className="text-muted hover:text-on-surface transition focus:outline-none shrink-0"
                                title={isEnabled ? 'Disable' : 'Enable'}
                              >
                                {isEnabled
                                  ? <ToggleRight size={28} className="text-indigo-500" />
                                  : <ToggleLeft size={28} className="text-muted" />
                                }
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── NOTIFICATIONS TAB ─────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="bg-surface border border-outline rounded-2xl p-6 relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
              <div>
                <h2 className="font-bold text-on-surface text-base flex items-center gap-2 font-display">
                  <Bell className="text-primary" size={18} /> Notification Preferences
                </h2>
                <p className="text-[11px] text-on-surface-variant mt-1">Control how you receive alerts and summaries about candidates and open pipeline events.</p>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Resume Review Completion', desc: 'Notify me when Grok AI completes analyzing a candidate resume batch.' },
                  { title: 'Candidate Applied Alert', desc: 'Dispatched immediately when an applicant submits their forms.' },
                  { title: 'Daily Digest Summaries', desc: 'Receive a daily audit log summary in your inbox.' }
                ].map((notif, index) => (
                  <div key={index} className="flex items-start justify-between p-3.5 rounded-xl border border-outline bg-surface-high/50 dark:bg-surface/10">
                    <div className="space-y-1 pr-4">
                      <h4 className="font-bold text-xs text-on-surface leading-tight">{notif.title}</h4>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">{notif.desc}</p>
                    </div>
                    <div className="flex items-center mt-1">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={index !== 2} className="sr-only peer" />
                        <div className="w-9 h-5 bg-surface-highest dark:bg-surface-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SECURITY TAB ──────────────────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="bg-surface border border-outline rounded-2xl p-6 relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-rose-500 to-amber-500" />
              <div>
                <h2 className="font-bold text-on-surface text-base flex items-center gap-2 font-display">
                  <Lock className="text-primary" size={18} /> Enterprise Security & SSO
                </h2>
                <p className="text-[11px] text-on-surface-variant mt-1">Configure authentication requirements, password policies, and login settings.</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs leading-relaxed">
                  <h4 className="font-bold mb-1 flex items-center gap-1.5">
                    <Info size={14} /> Multi-Factor Authentication Enforced
                  </h4>
                  Workspace security settings currently require all managers and staff to complete SMS or TOTP MFA verification on login.
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-outline bg-surface-high/50 dark:bg-surface/10">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-on-surface">IP Access Whitelisting</h4>
                    <p className="text-[10px] text-on-surface-variant">Restrict recruitment panels to office network IPs.</p>
                  </div>
                  <button className="px-3 py-1.5 bg-surface-highest hover:bg-surface-highest dark:bg-surface-high dark:hover:bg-slate-700 text-on-surface-variant hover:text-on-surface text-[10px] font-bold rounded-lg transition-colors">
                    Configure IP range
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
