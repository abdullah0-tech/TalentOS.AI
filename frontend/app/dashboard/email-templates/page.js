'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  Mail, 
  Sparkles, 
  Save, 
  Trash2, 
  Send, 
  User, 
  Calendar, 
  FileText,
  FileCode,
  CheckCircle,
  Copy,
  ChevronDown
} from 'lucide-react';

export default function EmailTemplatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [emailType, setEmailType] = useState('interview_invitation');
  
  // Dynamic fields
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [salary, setSalary] = useState('');
  const [startDate, setStartDate] = useState('');

  // Generated email states
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'templates'

  // Custom template CRUD form
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchCandidates();
    fetchCustomTemplates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const jobs = await request('/jobs');
      const allCandidates = [];
      for (const job of jobs) {
        const apps = await request(`/applications?jobId=${job.id}`);
        allCandidates.push(...apps.map(a => ({ ...a, jobTitle: job.title })));
      }
      setCandidates(allCandidates);
      if (allCandidates.length > 0) {
        setSelectedCandidate(allCandidates[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    }
  };

  const fetchCustomTemplates = async () => {
    try {
      const data = await request('/ai/email-templates');
      setCustomTemplates(data);
    } catch (err) {
      console.error('Failed to load email templates:', err);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || generating) return;

    setGenerating(true);
    setSubject('');
    setContent('');

    try {
      const details = {};
      if (emailType === 'interview_invitation') {
        details.date = interviewDate;
        details.time = interviewTime;
        details.meetingLink = 'meet.google.com/hfa-meet-up';
      } else if (emailType === 'offer_letter') {
        details.salary = salary;
        details.startDate = startDate;
      }

      const data = await request('/ai/generate-email', {
        method: 'POST',
        body: {
          candidateId: selectedCandidate,
          type: emailType,
          details
        }
      });

      setSubject(data.subject);
      setContent(data.content);
      showNotification('success', 'Email generated successfully.');
    } catch (err) {
      console.error('AI generation failed:', err);
      showNotification('error', 'Failed to generate email via Grok.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateName || !templateSubject || !templateContent) return;

    try {
      const body = {
        name: templateName,
        subject: templateSubject,
        content: templateContent
      };
      if (editingTemplateId) {
        body.id = editingTemplateId;
      }

      await request('/ai/email-templates', {
        method: 'POST',
        body
      });

      showNotification('success', editingTemplateId ? 'Template updated!' : 'Template saved!');
      setTemplateName('');
      setTemplateSubject('');
      setTemplateContent('');
      setEditingTemplateId(null);
      fetchCustomTemplates();
    } catch (err) {
      console.error('Save template failed:', err);
      showNotification('error', 'Failed to save template.');
    }
  };

  const handleEditTemplate = (tmpl) => {
    setEditingTemplateId(tmpl.id);
    setTemplateName(tmpl.name);
    setTemplateSubject(tmpl.subject);
    setTemplateContent(tmpl.content);
    setActiveTab('templates');
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await request(`/ai/email-templates/${id}`, { method: 'DELETE' });
      setCustomTemplates(prev => prev.filter(t => t.id !== id));
      showNotification('success', 'Template deleted.');
    } catch (err) {
      console.error('Delete template failed:', err);
      showNotification('error', 'Failed to delete template.');
    }
  };

  const handleSend = async () => {
    const candidate = candidates.find(c => c.id === selectedCandidate);
    if (!candidate) {
      showNotification('error', 'Please select a candidate first.');
      return;
    }

    setSending(true);
    try {
      await request('/emails/send', {
        method: 'POST',
        body: {
          to: candidate.email,
          subject,
          body: content,
          candidateId: selectedCandidate,
          eventType: emailType
        }
      });
      showNotification('success', 'Email successfully queued and sent to candidate.');
    } catch (err) {
      console.error('Failed to send email:', err);
      showNotification('error', err.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${content}`);
    showNotification('success', 'Copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <Mail className="text-indigo-400" size={32} /> AI Email Automation
        </h1>
        <p className="text-sm text-muted mt-1">
          Compose candidate correspondence instantly with multi-role triggers and context matching.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-outline">
        <button
          onClick={() => setActiveTab('generator')}
          className={`pb-3 font-bold text-sm border-b-2 px-2 transition ${activeTab === 'generator' ? 'border-indigo-500 text-white' : 'border-transparent text-muted hover:text-on-surface-variant'}`}
        >
          AI Draft Generator
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 font-bold text-sm border-b-2 px-2 transition ${activeTab === 'templates' ? 'border-indigo-500 text-white' : 'border-transparent text-muted hover:text-on-surface-variant'}`}
        >
          Manage Templates
        </button>
      </div>

      {notification.message && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${notification.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          <CheckCircle size={14} />
          <span>{notification.message}</span>
        </div>
      )}

      {activeTab === 'generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left panel: Config form (2 cols) */}
          <div className="lg:col-span-2 bg-background/40 border border-outline/80 rounded-2xl p-6 h-fit space-y-4">
            <h3 className="font-bold text-base text-on-surface flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-400" /> Correspondence Context
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Select Applicant</label>
                <div className="relative">
                  <select
                    value={selectedCandidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="w-full bg-surface border border-outline text-xs text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 appearance-none"
                    required
                  >
                    {candidates.length === 0 ? (
                      <option value="">No applicants in system</option>
                    ) : (
                      candidates.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.candidateName} - {c.jobTitle}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 text-muted pointer-events-none" size={14} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Mail Purpose / Template</label>
                <div className="relative">
                  <select
                    value={emailType}
                    onChange={(e) => setEmailType(e.target.value)}
                    className="w-full bg-surface border border-outline text-xs text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="application_received">Application Received</option>
                    <option value="interview_invitation">Interview Invitation</option>
                    <option value="shortlist_notice">Shortlist Notice</option>
                    <option value="offer_letter">Offer Letter Draft</option>
                    <option value="rejection">Rejection Update</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 text-muted pointer-events-none" size={14} />
                </div>
              </div>

              {/* Dynamic Context Block depending on mail purpose */}
              {emailType === 'interview_invitation' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-surface/60 border border-outline rounded-xl animate-fade-in">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Interview Date</label>
                    <input 
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full bg-background border border-outline text-xs text-on-surface p-2 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Interview Time</label>
                    <input 
                      type="text"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full bg-background border border-outline text-xs text-on-surface p-2 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {emailType === 'offer_letter' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-surface/60 border border-outline rounded-xl animate-fade-in">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Annual Salary</label>
                    <input 
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. $95,000"
                      className="w-full bg-background border border-outline text-xs text-on-surface p-2 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Start Date</label>
                    <input 
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="e.g. July 1st, 2026"
                      className="w-full bg-background border border-outline text-xs text-on-surface p-2 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedCandidate || generating}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs shadow-lg shadow-indigo-600/10"
              >
                {generating ? (
                  <>
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></span>
                    Drafting Email...
                  </>
                ) : (
                  <>
                    Generate Draft <Sparkles size={14} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right panel: Editor / View draft (3 cols) */}
          <div className="lg:col-span-3 bg-background/40 border border-outline/80 rounded-2xl p-6 flex flex-col justify-between min-h-[400px]">
            {subject || content ? (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-outline pb-3">
                  <h4 className="font-bold text-sm text-on-surface-variant">Generated AI Draft</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-surface-high text-muted hover:text-on-surface rounded-lg transition"
                      title="Copy to Clipboard"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Subject</label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Body Content</label>
                    <textarea 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full flex-1 bg-surface border border-outline rounded-xl p-4 text-xs text-on-surface focus:outline-none focus:border-indigo-500 leading-relaxed min-h-[220px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-outline pt-4">
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition text-xs flex items-center gap-2"
                  >
                    {sending ? 'Sending...' : 'Schedule / Send Email'} <Send size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Mail size={48} className="text-slate-650 mb-3 animate-pulse" />
                <h4 className="font-bold text-on-surface text-base">No Draft Open</h4>
                <p className="text-xs text-muted mt-1 max-w-sm leading-relaxed">
                  Configure candidate records and trigger email generation from the left panel to output tailored hiring letters.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Custom Template builder form */}
          <div className="lg:col-span-2 bg-background/40 border border-outline/80 rounded-2xl p-6 h-fit">
            <h3 className="font-bold text-base text-on-surface mb-4 flex items-center gap-2">
              <FileCode size={18} className="text-indigo-400" /> 
              {editingTemplateId ? 'Edit Custom Template' : 'New Custom Template'}
            </h3>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Template Identifier Name</label>
                <input 
                  type="text" 
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Technical Test Invite"
                  className="w-full bg-surface border border-outline focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Standard Subject Line</label>
                <input 
                  type="text" 
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="e.g. Schedule: Coding Assessment"
                  className="w-full bg-surface border border-outline focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Standard Body Content</label>
                <textarea 
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  placeholder="Dear [Candidate Name], ..."
                  className="w-full bg-surface border border-outline focus:border-indigo-500 rounded-xl p-4 text-xs text-on-surface focus:outline-none transition min-h-[160px] leading-relaxed"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition text-xs flex items-center justify-center gap-2"
                >
                  <Save size={14} /> Save Template
                </button>
                {editingTemplateId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplateId(null);
                      setTemplateName('');
                      setTemplateSubject('');
                      setTemplateContent('');
                    }}
                    className="px-4 py-3 rounded-xl bg-surface-high hover:bg-slate-700 text-on-surface-variant text-xs font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Custom templates */}
          <div className="lg:col-span-3 bg-background/40 border border-outline/80 rounded-2xl p-6">
            <h3 className="font-bold text-base text-on-surface mb-6">Saved Company Templates</h3>

            {customTemplates.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-outline rounded-2xl">
                <FileText className="mx-auto text-slate-650 mb-3" size={40} />
                <h4 className="font-bold text-on-surface text-sm">No Custom Templates</h4>
                <p className="text-xs text-muted mt-1 max-w-sm mx-auto leading-relaxed">
                  You haven't defined any custom templates yet. Standard templates are available in the generator tool.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {customTemplates.map((tmpl) => (
                  <div 
                    key={tmpl.id}
                    className="p-4 bg-surface/40 border border-outline hover:border-outline rounded-xl flex items-center justify-between gap-4 transition"
                  >
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-on-surface truncate">{tmpl.name}</h4>
                      <p className="text-xs text-muted truncate mt-1">Subject: {tmpl.subject}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTemplate(tmpl)}
                        className="p-2 text-muted hover:text-on-surface hover:bg-surface-high rounded-lg transition text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(tmpl.id)}
                        className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
