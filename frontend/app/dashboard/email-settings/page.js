'use client';

import { useState, useEffect, useRef } from 'react';
import { request } from '../../../services/api';
import { socketService } from '../../../services/socket.service';
import { authService } from '../../../services/auth.service';
import {
  Mail,
  Sliders,
  FileCode,
  History,
  Save,
  Send,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Settings,
  Server,
  Lock,
  Globe,
  ToggleLeft,
  ToggleRight,
  EyeOff
} from 'lucide-react';

const EVENTS_INFO = {
  'candidate-applied': { label: 'Candidate Applied', category: 'Recruitment', desc: 'Dispatched immediately when an applicant submits their resume.' },
  'shortlisted': { label: 'Candidate Shortlisted', category: 'Recruitment', desc: 'Dispatched when HR changes applicant stage to "Shortlisted".' },
  'interview-scheduled': { label: 'Interview Invitation', category: 'Recruitment', desc: 'Dispatched when an interview is created. Attaches an .ics invite.' },
  'interview-reminder': { label: 'Interview Reminder', category: 'Recruitment', desc: 'Auto-dispatched 24 hours prior to the scheduled interview start.' },
  'rejected': { label: 'Candidate Rejected', category: 'Recruitment', desc: 'Dispatched when an applicant is moved to the "Rejected" status.' },
  'offer-letter': { label: 'Job Offer Sent', category: 'Recruitment', desc: 'Dispatched when candidate status is moved to "Offer". Includes contract details.' },
  'hired': { label: 'Candidate Hired', category: 'Recruitment', desc: 'Dispatched when candidate accepts the offer and is officially hired.' },
  'employee-invitation': { label: 'Employee Invitation', category: 'HR Operations', desc: 'Contains the secure link for new employees to activate their portal profile.' },
  'account-activated': { label: 'Employee Portal Activated', category: 'HR Operations', desc: 'Sent after an employee completes password setups and portal activation.' },
  'password-reset': { label: 'Secure Password Reset', category: 'HR Operations', desc: 'Sent when an employee requests a password reset token.' },
  'leave-approved': { label: 'Leave Approved', category: 'HR Operations', desc: 'Dispatched when manager approves employee leave requests.' },
  'leave-rejected': { label: 'Leave Rejected', category: 'HR Operations', desc: 'Dispatched when manager rejects leave requests. Includes rejection reasons.' }
};

export default function EmailSettingsPage() {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'workflows' | 'templates' | 'logs'
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Settings states
  const [settings, setSettings] = useState({
    provider: 'console',
    resendApiKey: '',
    sendgridApiKey: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpSecure: true,
    senderName: 'HireFlow AI',
    senderEmail: 'noreply@hireflow.ai',
    enabledEvents: ''
  });

  // Test Email state
  const [testEmailTarget, setTestEmailTarget] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Custom templates CRUD states
  const [customTemplates, setCustomTemplates] = useState([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState('candidate-applied');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const iframeRef = useRef(null);

  // Audit Logs states
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('');
  const [logEventFilter, setLogEventFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [retryingLogId, setRetryingLogId] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchCustomTemplates();
    fetchLogs();

    // Configure Socket.io listener
    const currentUser = authService.getCurrentUser();
    if (currentUser?.companyId) {
      const socket = socketService.getIo ? socketService.getIo() : null;
      if (socket) {
        socket.on('email_log_updated', (data) => {
          // If logs tab is active or we want fresh background data
          setLogs(prev => prev.map(log => log.id === data.id ? { ...log, ...data } : log));
        });
      }
    }

    return () => {
      const socket = socketService.getIo ? socketService.getIo() : null;
      if (socket) {
        socket.off('email_log_updated');
      }
    };
  }, []);

  // Update template preview when editor state changes
  useEffect(() => {
    if (activeTab === 'templates') {
      const delayDebounceFn = setTimeout(() => {
        generatePreview();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [templateSubject, templateContent, selectedTemplateName, activeTab]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await request('/emails/settings');
      setSettings(data);
    } catch (err) {
      showNotification('error', 'Failed to retrieve email configuration settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const data = await request('/emails/settings', {
        method: 'POST',
        body: settings
      });
      setSettings(data.settings);
      showNotification('success', 'Email configurations updated successfully.');
    } catch (err) {
      showNotification('error', err.message || 'Failed to save email settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEvent = async (eventKey) => {
    const currentEnabled = settings.enabledEvents
      ? settings.enabledEvents.split(',')
      : ['candidate-applied', 'shortlisted', 'interview-scheduled', 'interview-reminder', 'rejected', 'offer-letter', 'hired', 'employee-invitation', 'account-activated', 'password-reset', 'leave-approved', 'leave-rejected'];

    let nextEnabled;
    if (currentEnabled.includes(eventKey)) {
      nextEnabled = currentEnabled.filter(k => k !== eventKey);
    } else {
      nextEnabled = [...currentEnabled, eventKey];
    }

    const updatedSettings = {
      ...settings,
      enabledEvents: nextEnabled.join(',')
    };

    setSettings(updatedSettings);

    try {
      await request('/emails/settings', {
        method: 'POST',
        body: updatedSettings
      });
    } catch (err) {
      showNotification('error', 'Failed to update workflow triggers.');
      fetchSettings(); // Revert
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testEmailTarget) return;

    try {
      setSendingTest(true);
      await request('/emails/test', {
        method: 'POST',
        body: { to: testEmailTarget }
      });
      showNotification('success', `Test email successfully dispatched to ${testEmailTarget}.`);
      setTestEmailTarget('');
      fetchLogs(); // Reload logs
    } catch (err) {
      showNotification('error', err.message || 'Failed to dispatch test email.');
    } finally {
      setSendingTest(false);
    }
  };

  const fetchCustomTemplates = async () => {
    try {
      const data = await request('/ai/email-templates');
      setCustomTemplates(data);
      loadTemplateContent(selectedTemplateName, data);
    } catch (err) {
      console.error('Failed to load custom templates:', err);
    }
  };

  const loadTemplateContent = (templateName, templatesList = customTemplates) => {
    const custom = templatesList.find(t => t.name === templateName);
    if (custom) {
      setTemplateSubject(custom.subject);
      setTemplateContent(custom.content);
    } else {
      // Fetch default preview fields
      request(`/emails/preview/${templateName}`)
        .then(res => {
          setTemplateSubject(res.subject);
          setTemplateContent(res.rawBody);
        })
        .catch(() => {
          setTemplateSubject('');
          setTemplateContent('');
        });
    }
  };

  const handleTemplateSelect = (name) => {
    setSelectedTemplateName(name);
    loadTemplateContent(name);
  };

  const generatePreview = async () => {
    if (!selectedTemplateName) return;
    try {
      setPreviewLoading(true);
      // Fetch dynamic preview with temporary draft text
      const res = await request(`/emails/preview/${selectedTemplateName}`);
      setPreviewSubject(templateSubject || res.subject);
      
      // Dynamic client-side markdown to html wrapper compilation simulator
      // to display preview without hitting DB/Backend on every keystroke
      const markedBody = templateContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\*\s*(.*?)$/gm, '<li>$1</li>')
        .replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul style="margin: 16px 0; padding-left: 20px; color: #94a3b8;">${match}</ul>`)
        .replace(/^###\s*(.*?)$/gm, '<h3 style="color: #ffffff; font-size: 16px; margin: 24px 0 12px 0; border-bottom: 1px solid #334155; padding-bottom: 6px;">$1</h3>')
        .split('\n\n')
        .map(p => {
          p = p.trim();
          if (!p) return '';
          if (p.startsWith('<h3') || p.startsWith('<ul') || p.startsWith('<li')) return p;
          return `<p style="margin: 0 0 16px 0; color: #94a3b8; line-height: 1.6;">${p}</p>`;
        }).join('\n');

      // Substitute mock tags
      const companyName = settings.senderName || 'My Company';
      const mockVars = {
        candidate_name: 'John Doe',
        employee_name: 'Jane Smith',
        job_title: 'Senior Software Architect',
        company_name: companyName,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        time: '3:30 PM EST',
        interview_type: 'Technical Video Interview',
        meeting_link: 'https://meet.google.com/xyz-abc-123',
        recruiter_name: 'Sarah HR Partner',
        location: '100 Broadway, NY',
        salary: '$135,000 / year',
        start_date: 'August 1st, 2026',
        department: 'Engineering',
        manager_name: 'Michael Director',
        invite_link: 'https://hireflow.ai/activate-account?token=mock-token',
        reset_link: 'https://hireflow.ai/change-password?token=mock-reset-token',
        leave_type: 'Paid Sick Leave',
        reason: 'Resting due to flu symptoms'
      };

      let compiledBody = markedBody.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
        return mockVars[key] !== undefined ? mockVars[key] : '';
      });

      const compiledSubject = (templateSubject || res.subject).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
        return mockVars[key] !== undefined ? mockVars[key] : '';
      });
      setPreviewSubject(compiledSubject);

      // Wrap in shell
      const fullHtml = res.html.replace(/<div style="font-size: 15px; color: #94a3b8; line-height: 1.6;">[\s\S]*?<\/div>/, `<div style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">${compiledBody}</div>`);
      setPreviewHtml(fullHtml);

      // Write to iframe document
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument;
        doc.open();
        doc.write(fullHtml);
        doc.close();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateSubject || !templateContent) return;

    try {
      setSavingTemplate(true);
      const existing = customTemplates.find(t => t.name === selectedTemplateName);
      
      const body = {
        name: selectedTemplateName,
        subject: templateSubject,
        content: templateContent
      };
      if (existing) {
        body.id = existing.id;
      }

      await request('/ai/email-templates', {
        method: 'POST',
        body
      });

      showNotification('success', 'Email template customization saved.');
      fetchCustomTemplates();
    } catch (err) {
      showNotification('error', 'Failed to save customized template.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleRestoreTemplateDefault = async () => {
    const existing = customTemplates.find(t => t.name === selectedTemplateName);
    if (!existing) {
      showNotification('info', 'This template is already operating on default values.');
      return;
    }

    if (!confirm('Are you sure you want to revert all customizations for this template back to factory defaults?')) return;

    try {
      setSavingTemplate(true);
      await request(`/ai/email-templates/${existing.id}`, {
        method: 'DELETE'
      });
      showNotification('success', 'Customizations cleared. Reverted to default template.');
      
      // Reload templates
      const data = await request('/ai/email-templates');
      setCustomTemplates(data);
      loadTemplateContent(selectedTemplateName, data);
    } catch (err) {
      showNotification('error', 'Failed to revert template.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const fetchLogs = async (page = 1) => {
    try {
      setLogsLoading(true);
      const data = await request(`/emails/logs?page=${page}&limit=10&search=${logSearch}&status=${logStatusFilter}&eventType=${logEventFilter}`);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch email logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleRetryEmail = async (logId) => {
    try {
      setRetryingLogId(logId);
      await request(`/emails/logs/${logId}/retry`, {
        method: 'POST'
      });
      showNotification('success', 'Email successfully queued for retry.');
      // Instantly update status locally to pending
      setLogs(prev => prev.map(log => log.id === logId ? { ...log, status: 'pending', retryCount: 0 } : log));
    } catch (err) {
      showNotification('error', err.message || 'Failed to trigger retry.');
    } finally {
      setRetryingLogId(null);
    }
  };

  const handleLogsPageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchLogs(newPage);
  };

  const currentEnabledEvents = settings.enabledEvents
    ? settings.enabledEvents.split(',')
    : ['candidate-applied', 'shortlisted', 'interview-scheduled', 'interview-reminder', 'rejected', 'offer-letter', 'hired', 'employee-invitation', 'account-activated', 'password-reset', 'leave-approved', 'leave-rejected'];

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline/35 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3 font-display">
            <Mail className="text-indigo-400" size={32} /> Email Workflows & logs
          </h1>
          <p className="text-sm text-muted mt-1.5 leading-relaxed">
            Configure delivery settings, toggle automated recruitment pipelines, audit logs, and test integrations.
          </p>
        </div>
        
        {/* Connection status badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-surface/60 border border-outline rounded-xl w-fit">
          <span className={`w-2 h-2 rounded-full ${settings.provider === 'console' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
          <span className="text-xs font-semibold text-on-surface-variant font-mono uppercase">
            Active Provider: {settings.provider}
          </span>
        </div>
      </div>

      {/* Action Notifications */}
      {notification.message && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex gap-4 border-b border-outline overflow-x-auto no-scrollbar">
        {[
          { id: 'settings', label: 'Email Configuration', icon: Settings },
          { id: 'workflows', label: 'Workflow Triggers', icon: Sliders },
          { id: 'templates', label: 'Template Customizer', icon: FileCode },
          { id: 'logs', label: 'Delivery Audit Logs', icon: History }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3.5 font-bold text-sm border-b-2 px-3 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-muted hover:text-on-surface-variant'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Credentials Panel (2 Cols) */}
          <div className="lg:col-span-2 bg-background/40 border border-outline/80 rounded-2xl p-6 relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            
            <div>
              <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                <Server className="text-indigo-400" size={18} /> Credentials Settings
              </h3>
              <p className="text-[11px] text-muted mt-1">Configure your active SaaS mail sender. Custom values are encrypted.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Provider Selector */}
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Email Service Provider</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'console', name: 'Console Simulator', desc: 'Mock logs to terminal' },
                    { id: 'smtp', name: 'Gmail SMTP', desc: 'Secure standard SMTP' },
                    { id: 'resend', name: 'Resend API', desc: 'Preferred SaaS API' },
                    { id: 'sendgrid', name: 'SendGrid API', desc: 'Classic Cloud Email' }
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setSettings(prev => ({ ...prev, provider: p.id }))}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition h-24 ${
                        settings.provider === p.id 
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

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Sender Name</label>
                  <input
                    type="text"
                    value={settings.senderName}
                    onChange={(e) => setSettings(prev => ({ ...prev, senderName: e.target.value }))}
                    placeholder="e.g. HireFlow Recruiting"
                    className="w-full bg-surface/60 border border-outline rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Sender Email Address</label>
                  <input
                    type="email"
                    value={settings.senderEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, senderEmail: e.target.value }))}
                    placeholder="e.g. hiring@company.com"
                    className="w-full bg-surface/60 border border-outline rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Conditional provider inputs */}
              {settings.provider === 'resend' && (
                <div className="space-y-2 p-4 bg-surface/40 border border-outline rounded-xl animate-fade-in">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Lock size={12} className="text-indigo-400" /> Resend API Key
                  </label>
                  <input
                    type="password"
                    value={settings.resendApiKey || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, resendApiKey: e.target.value }))}
                    placeholder="re_..."
                    className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition font-mono"
                    required
                  />
                </div>
              )}

              {settings.provider === 'sendgrid' && (
                <div className="space-y-2 p-4 bg-surface/40 border border-outline rounded-xl animate-fade-in">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Lock size={12} className="text-indigo-400" /> SendGrid API Key
                  </label>
                  <input
                    type="password"
                    value={settings.sendgridApiKey || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, sendgridApiKey: e.target.value }))}
                    placeholder="SG.xxxxx..."
                    className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition font-mono"
                    required
                  />
                </div>
              )}

              {settings.provider === 'smtp' && (
                <div className="p-4 bg-surface/40 border border-outline rounded-xl space-y-4 animate-fade-in">
                  <h4 className="font-bold text-on-surface-variant text-xs flex items-center gap-1.5 border-b border-outline pb-2">
                    <Globe size={14} className="text-indigo-400" /> SMTP Host & Port Configuration
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">SMTP Server Host</label>
                      <input
                        type="text"
                        value={settings.smtpHost || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                        placeholder="smtp.gmail.com"
                        className="w-full bg-background border border-outline rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Port</label>
                      <input
                        type="text"
                        value={settings.smtpPort || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                        placeholder="587"
                        className="w-full bg-background border border-outline rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">SMTP Username</label>
                      <input
                        type="text"
                        value={settings.smtpUser || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                        placeholder="user@gmail.com"
                        className="w-full bg-background border border-outline rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">SMTP Password</label>
                      <input
                        type="password"
                        value={settings.smtpPass || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpPass: e.target.value }))}
                        placeholder="••••••••••••"
                        className="w-full bg-background border border-outline rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="smtpSecure"
                      checked={settings.smtpSecure}
                      onChange={(e) => setSettings(prev => ({ ...prev, smtpSecure: e.target.checked }))}
                      className="rounded border-outline text-indigo-600 bg-background focus:ring-indigo-500 focus:ring-offset-0 focus:ring-0"
                    />
                    <label htmlFor="smtpSecure" className="text-xs text-on-surface-variant font-semibold cursor-pointer">
                      Use SSL/TLS secure connection (Default for port 465)
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-outline">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/10"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Saving settings...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Email Config
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Test connection panel (1 Col) */}
          <div className="lg:col-span-1 bg-background/40 border border-outline/80 rounded-2xl p-6 h-fit space-y-4">
            <div>
              <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <Send className="text-indigo-400" size={16} /> Test Connection
              </h3>
              <p className="text-[10px] text-muted mt-1">Send a test dispatch using the configured active provider.</p>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Recipient Test Email</label>
                <input
                  type="email"
                  value={testEmailTarget}
                  onChange={(e) => setTestEmailTarget(e.target.value)}
                  placeholder="test@domain.com"
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sendingTest || !testEmailTarget}
                className="w-full py-2.5 rounded-xl bg-surface-high hover:bg-slate-700 disabled:opacity-50 text-on-surface hover:text-on-surface font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                {sendingTest ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Sending Test...
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    Send Test Email
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          
          <div>
            <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
              <Sliders className="text-indigo-400" size={18} /> Automated Pipeline Triggers
            </h3>
            <p className="text-sm text-muted mt-1">
              Select which events automatically trigger emails. Disabling an event will prevent it from queuing emails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {Object.entries(EVENTS_INFO).map(([key, info]) => {
              const isEnabled = currentEnabledEvents.includes(key);
              return (
                <div 
                  key={key}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition bg-surface/10 ${
                    isEnabled ? 'border-outline hover:border-slate-750' : 'border-outline opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-on-surface">{info.label}</span>
                      <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-surface-high text-muted border border-outline">
                        {info.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted leading-normal max-w-sm">{info.desc}</p>
                  </div>

                  <button
                    onClick={() => handleToggleEvent(key)}
                    className="text-muted hover:text-on-surface transition focus:outline-none shrink-0"
                    title={isEnabled ? 'Disable Email' : 'Enable Email'}
                  >
                    {isEnabled ? (
                      <ToggleRight size={28} className="text-indigo-500" />
                    ) : (
                      <ToggleLeft size={28} className="text-slate-650" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Panel: Template List & Editor (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* List */}
            <div className="bg-background/40 border border-outline/80 rounded-2xl p-4 space-y-3">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1 px-1">Select Active Template</label>
              <div className="relative">
                <select
                  value={selectedTemplateName}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full bg-surface border border-outline text-xs text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  {Object.entries(EVENTS_INFO).map(([key, info]) => (
                    <option key={key} value={key}>
                      [{info.category}] {info.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Editor */}
            <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 relative overflow-hidden space-y-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              
              <div className="flex justify-between items-center border-b border-outline pb-3">
                <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                  <FileCode className="text-indigo-400" size={16} /> Customize Template
                </h3>
                {customTemplates.some(t => t.name === selectedTemplateName) && (
                  <span className="text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Customized
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveTemplate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Subject Template</label>
                  <input
                    type="text"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="Enter subject line..."
                    className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Body Text Content (Markdown / Text)</label>
                  <span className="text-[8px] text-muted block mb-2 leading-relaxed">
                    Placeholders supported: {"{{candidate_name}}"}, {"{{employee_name}}"}, {"{{job_title}}"}, {"{{company_name}}"}, {"{{date}}"}, {"{{time}}"}, {"{{meeting_link}}"}, {"{{salary}}"}, {"{{start_date}}"}, {"{{department}}"}, {"{{manager_name}}"}, {"{{leave_type}}"}, {"{{reason}}"}
                  </span>
                  <textarea
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    placeholder="Enter template body..."
                    className="w-full bg-surface border border-outline rounded-xl p-4 text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition leading-relaxed min-h-[300px] font-mono"
                    required
                  />
                </div>

                <div className="flex gap-2 border-t border-outline pt-4">
                  <button
                    type="submit"
                    disabled={savingTemplate}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
                  >
                    {savingTemplate ? <RefreshCw className="animate-spin" size={12} /> : <Save size={12} />}
                    Save Template
                  </button>

                  <button
                    type="button"
                    onClick={handleRestoreTemplateDefault}
                    className="px-4 py-2.5 rounded-xl bg-surface-high hover:bg-surface-high text-muted hover:text-on-surface font-bold text-xs transition border border-outline"
                  >
                    Restore Default
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Panel: High-fidelity preview (3 Cols) */}
          <div className="lg:col-span-3 bg-background/40 border border-outline/80 rounded-2xl p-6 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-outline pb-3">
                <h4 className="font-bold text-sm text-on-surface-variant flex items-center gap-2">
                  <Eye className="text-indigo-400" size={16} /> Live Responsive Preview
                </h4>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-outline rounded-lg text-[9px] text-muted font-mono">
                  <span>HTML View (Width: 100%)</span>
                </div>
              </div>

              {/* Subject box preview */}
              <div className="bg-surface/40 border border-outline rounded-xl p-4 flex gap-3 items-center">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Subject:</span>
                <span className="text-xs font-semibold text-on-surface">{previewSubject || 'No Subject Line'}</span>
              </div>

              {/* Iframe preview box */}
              <div className="flex-1 border border-outline rounded-xl overflow-hidden min-h-[380px] bg-surface relative">
                {previewLoading && (
                  <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <RefreshCw className="animate-spin text-indigo-400" size={24} />
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  title="Live email preview"
                  className="w-full h-full border-none bg-surface"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                <History className="text-indigo-400" size={18} /> Delivery Audit Logs
              </h3>
              <p className="text-[11px] text-muted mt-1">Real-time trace logs auditing all outbound automated workflows.</p>
            </div>

            {/* Logs controls */}
            <button
              onClick={() => fetchLogs(pagination.page)}
              disabled={logsLoading}
              className="px-4 py-2 rounded-xl bg-surface border border-outline hover:border-slate-750 text-on-surface-variant hover:text-on-surface font-bold text-xs flex items-center gap-1.5 transition self-end"
            >
              <RefreshCw className={logsLoading ? 'animate-spin' : ''} size={12} />
              Refresh
            </button>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-surface/20 border border-outline rounded-xl">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-3.5 text-muted" size={14} />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLogs(1)}
                placeholder="Search recipient email or subject..."
                className="w-full bg-surface border border-outline pl-9 pr-4 py-2.5 rounded-xl text-xs text-on-surface focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="relative">
              <select
                value={logStatusFilter}
                onChange={(e) => { setLogStatusFilter(e.target.value); setTimeout(() => fetchLogs(1), 0); }}
                className="w-full bg-surface border border-outline text-xs text-on-surface rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="sent">Sent Successfully</option>
                <option value="pending">Pending Queue</option>
                <option value="failed">Failed Delivery</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={logEventFilter}
                onChange={(e) => { setLogEventFilter(e.target.value); setTimeout(() => fetchLogs(1), 0); }}
                className="w-full bg-surface border border-outline text-xs text-on-surface rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="">All Events</option>
                {Object.entries(EVENTS_INFO).map(([key, info]) => (
                  <option key={key} value={key}>{info.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="border border-outline rounded-xl overflow-hidden">
            {logsLoading && logs.length === 0 ? (
              <div className="py-24 text-center">
                <RefreshCw className="animate-spin mx-auto text-indigo-400 mb-3" size={28} />
                <p className="text-xs text-muted">Loading delivery trace logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-20 text-center">
                <Mail className="mx-auto text-on-surface-variant mb-3 animate-pulse" size={36} />
                <h4 className="font-bold text-muted text-xs">No email delivery logs found</h4>
                <p className="text-[10px] text-muted mt-1">Audit logs will appear here when automated emails are triggered.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface/60 border-b border-outline text-muted font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Recipient</th>
                      <th className="p-4">Workflow Event</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Channel</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-surface/10 text-on-surface-variant transition-colors">
                        <td className="p-4 whitespace-nowrap text-muted font-mono text-[10px]">
                          {new Date(log.sentAt).toLocaleString()}
                        </td>
                        <td className="p-4 font-semibold text-on-surface">
                          <div className="flex flex-col">
                            <span>{log.email}</span>
                            {log.candidate?.candidateName && (
                              <span className="text-[10px] text-muted font-normal">Candidate: {log.candidate.candidateName}</span>
                            )}
                            {log.employee?.name && (
                              <span className="text-[10px] text-muted font-normal">Employee: {log.employee.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-surface-high text-muted border border-outline">
                            {EVENTS_INFO[log.eventType]?.label || log.eventType}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs truncate" title={log.subject}>
                          {log.subject}
                        </td>
                        <td className="p-4 whitespace-nowrap font-mono text-[10px] uppercase text-muted">
                          {log.provider}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2 py-1.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                            log.status === 'sent' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                              : log.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                              : 'bg-red-500/10 text-red-400 border border-red-500/25'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              log.status === 'sent' ? 'bg-emerald-400' : log.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
                            }`} />
                            {log.status === 'sent' ? 'Sent' : log.status === 'pending' ? `Pending (Retries: ${log.retryCount})` : 'Failed'}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          {(log.status === 'failed' || log.status === 'pending') && (
                            <button
                              onClick={() => handleRetryEmail(log.id)}
                              disabled={retryingLogId === log.id}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white hover:text-white rounded-lg transition font-bold text-[10px] flex items-center gap-1 ml-auto"
                            >
                              <RefreshCw className={retryingLogId === log.id ? 'animate-spin' : ''} size={10} />
                              Retry
                            </button>
                          )}
                          {log.status === 'sent' && (
                            <span className="text-[10px] text-muted font-mono">Trace: OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-outline pt-4">
              <span className="text-[10px] text-muted font-bold uppercase">
                Page {pagination.page} of {pagination.pages} ({pagination.total} records)
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleLogsPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 bg-surface border border-outline hover:border-slate-750 disabled:opacity-30 rounded-lg text-muted hover:text-on-surface transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => handleLogsPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 bg-surface border border-outline hover:border-slate-750 disabled:opacity-30 rounded-lg text-muted hover:text-on-surface transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
