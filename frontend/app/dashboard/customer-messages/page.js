'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Mail, Search, Filter, Trash2, CheckCircle, Clock, 
  Archive, Send, Reply, AlertCircle, RefreshCw, Eye, EyeOff, 
  ExternalLink, Building, Phone, Sparkles, Settings, X, Plus, Check
} from 'lucide-react';

export default function CustomerMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [unreadCount, setUnreadCount] = useState(0);

  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Configure Stats Modal State
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [statsData, setStatsData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsSaving, setStatsSaving] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact/messages');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch customer messages');
      }
      setMessages(data.data || []);
      const unread = (data.data || []).filter((m) => m.status === 'UNREAD').length;
      setUnreadCount(unread);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/contact/messages/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update message status');
      }
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );
      if (newStatus === 'READ' || newStatus === 'ARCHIVED') {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      showToast('success', `Message marked as ${newStatus}`);
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/contact/messages/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete message');
      }
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showToast('success', 'Message deleted successfully');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const openReplyModal = (msg) => {
    setSelectedMsg(msg);
    setReplyText(`Hi ${msg.name},\n\nThank you for reaching out regarding "${msg.subject}".\n\n\n\nBest regards,\nTalentOS Engineering Desk`);
    setReplyModalOpen(true);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMsg) return;

    setReplyLoading(true);
    try {
      const res = await fetch(`/api/contact/messages/${selectedMsg.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyMessage: replyText })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reply email');
      }

      showToast('success', `Reply sent to ${selectedMsg.email}`);
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMsg.id ? { ...m, status: 'REPLIED' } : m))
      );
      setReplyModalOpen(false);
      setSelectedMsg(null);
      setReplyText('');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setReplyLoading(false);
    }
  };

  // Configure Stats Modal functions
  const openStatsModal = async () => {
    setStatsModalOpen(true);
    setStatsLoading(true);
    try {
      const res = await fetch('/api/contact/stats');
      const data = await res.json();
      if (res.ok && data.data) {
        setStatsData(data.data);
      }
    } catch (err) {
      showToast('error', 'Error loading statistics configuration');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleStatChange = (idx, field, value) => {
    setStatsData((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSaveStats = async (e) => {
    e.preventDefault();
    setStatsSaving(true);
    try {
      const res = await fetch('/api/contact/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: statsData })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update statistics');
      }
      showToast('success', 'Public website statistics updated successfully');
      setStatsModalOpen(false);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setStatsSaving(false);
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || m.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['All', 'General Inquiry', 'Sales', 'Technical Support', 'Bug Report', 'Feature Request', 'Feedback', 'Partnership'];
  const statuses = ['All', 'UNREAD', 'READ', 'REPLIED', 'ARCHIVED'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'UNREAD':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Unread</span>
          </span>
        );
      case 'READ':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-[#0047FF] dark:text-blue-400 border border-blue-500/20">
            <Eye size={12} />
            <span>Read</span>
          </span>
        );
      case 'REPLIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle size={12} />
            <span>Replied</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-high text-muted border border-outline">
            <Archive size={12} />
            <span>Archived</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-slide-up">
          <div className={`p-4 rounded-xl border shadow-xl flex items-center gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-semibold">{toast.text}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline dark:border-outline pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-on-surface dark:text-on-surface font-display">
              Customer Messages & Support Desk
            </h1>
            {unreadCount > 0 && (
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-1">
            Manage inquiries, feedback, and sales requests from public website visitors.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={openStatsModal}
            className="px-4 py-2 bg-surface-high dark:bg-surface border border-outline dark:border-outline hover:bg-surface-highest text-xs font-semibold text-on-surface rounded-xl transition-all flex items-center gap-2"
          >
            <Settings size={14} />
            <span>Configure Public Stats</span>
          </button>

          <button
            onClick={fetchMessages}
            disabled={loading}
            className="p-2 bg-surface-high dark:bg-surface border border-outline dark:border-outline hover:bg-surface-highest text-on-surface rounded-xl transition-all"
            aria-label="Refresh messages"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search messages by name, email, company, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-high dark:bg-background border border-outline dark:border-outline rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-surface-high dark:bg-background border border-outline dark:border-outline rounded-xl text-xs text-on-surface focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-surface-high dark:bg-background p-1 rounded-xl border border-outline dark:border-outline">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === st
                    ? 'bg-[#0047FF] text-white shadow-sm'
                    : 'text-muted hover:text-on-surface'
                }`}
              >
                {st === 'All' ? 'All' : st}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* MESSAGES LIST */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#0047FF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-muted">Loading inquiries...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-500/5 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-semibold">
          Error loading messages: {error}
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="py-20 text-center bg-surface dark:bg-surface border border-outline dark:border-outline rounded-2xl space-y-3">
          <MessageSquare size={36} className="text-muted mx-auto" />
          <h4 className="text-base font-bold text-on-surface dark:text-on-surface">No Messages Found</h4>
          <p className="text-xs text-muted">No customer inquiries match your current search and filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 rounded-2xl bg-surface dark:bg-surface border transition-all ${
                msg.status === 'UNREAD'
                  ? 'border-[#0047FF] shadow-sm dark:bg-blue-950/10'
                  : 'border-outline dark:border-outline'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-outline/50">
                
                {/* Sender Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-bold text-on-surface dark:text-on-surface">
                      {msg.name}
                    </h3>
                    {msg.company && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted bg-surface-high px-2 py-0.5 rounded">
                        <Building size={11} />
                        <span>{msg.company}</span>
                      </span>
                    )}
                    {getStatusBadge(msg.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-0.5">
                    <a
                      href={`mailto:${msg.email}`}
                      className="inline-flex items-center gap-1 hover:text-[#0047FF] transition-colors font-medium"
                    >
                      <Mail size={13} />
                      <span>{msg.email}</span>
                    </a>

                    {msg.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={13} />
                        <span>{msg.phone}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} />
                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                {/* Actions Button Bar */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => openReplyModal(msg)}
                    className="px-3 py-1.5 bg-[#0047FF] hover:bg-[#0036C7] text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <Reply size={13} />
                    <span>Reply via Email</span>
                  </button>

                  {msg.status === 'UNREAD' ? (
                    <button
                      onClick={() => handleUpdateStatus(msg.id, 'READ')}
                      className="px-3 py-1.5 bg-surface-high hover:bg-surface-highest text-on-surface text-xs font-semibold rounded-lg transition-all border border-outline flex items-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>Mark Read</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(msg.id, 'UNREAD')}
                      className="px-3 py-1.5 bg-surface-high hover:bg-surface-highest text-muted hover:text-on-surface text-xs font-semibold rounded-lg transition-all border border-outline flex items-center gap-1.5"
                    >
                      <EyeOff size={13} />
                      <span>Mark Unread</span>
                    </button>
                  )}

                  {msg.status !== 'ARCHIVED' ? (
                    <button
                      onClick={() => handleUpdateStatus(msg.id, 'ARCHIVED')}
                      className="p-1.5 bg-surface-high hover:bg-surface-highest text-muted hover:text-on-surface rounded-lg transition-all border border-outline"
                      title="Archive message"
                    >
                      <Archive size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(msg.id, 'READ')}
                      className="p-1.5 bg-surface-high hover:bg-surface-highest text-muted hover:text-on-surface rounded-lg transition-all border border-outline"
                      title="Unarchive message"
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-all border border-red-500/20"
                    title="Delete message"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>

              {/* Message Content */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-surface-high text-on-surface-variant border border-outline">
                    {msg.category}
                  </span>
                  <span className="text-sm font-bold text-on-surface dark:text-on-surface">
                    {msg.subject}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant dark:text-on-surface-variant leading-relaxed whitespace-pre-wrap bg-surface-high dark:bg-background p-4 rounded-xl border border-outline/50">
                  {msg.message}
                </p>
                {msg.attachment && (
                  <div className="pt-1">
                    <a
                      href={msg.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0047FF] hover:underline"
                    >
                      <ExternalLink size={13} />
                      <span>View Attached Document / Screenshot</span>
                    </a>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* REPLY MODAL */}
      {replyModalOpen && selectedMsg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-background border border-outline dark:border-outline rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="bg-[#0047FF] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <div>
                  <h3 className="text-sm font-bold">Reply to Customer Inquiry</h3>
                  <p className="text-[11px] text-blue-100">To: {selectedMsg.name} ({selectedMsg.email})</p>
                </div>
              </div>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
                aria-label="Close reply modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  disabled
                  value={`Re: ${selectedMsg.subject}`}
                  className="w-full px-3 py-2 bg-surface-high dark:bg-surface border border-outline rounded-lg text-xs text-muted"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1">
                  Your Reply Message *
                </label>
                <textarea
                  rows={8}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-high dark:bg-background border border-outline rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40 resize-none font-mono"
                />
                <p className="text-[11px] text-muted mt-1">
                  This message will be formatted with official TalentOS branding and delivered immediately.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 bg-surface-high border border-outline text-xs font-semibold rounded-xl text-on-surface hover:bg-surface-highest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyLoading}
                  className="px-6 py-2 bg-[#0047FF] hover:bg-[#0036C7] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  {replyLoading ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Send Email Reply</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CONFIGURE STATS MODAL */}
      {statsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-background border border-outline dark:border-outline rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="bg-[#0047FF] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={18} />
                <div>
                  <h3 className="text-sm font-bold">Configure Public Platform Statistics</h3>
                  <p className="text-[11px] text-blue-100">These counters appear live on the public About Us page</p>
                </div>
              </div>
              <button
                onClick={() => setStatsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
                aria-label="Close stats configuration modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStats} className="p-6 space-y-4">
              {statsLoading ? (
                <div className="py-12 text-center text-xs font-semibold text-muted">
                  Loading statistics...
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {statsData.map((stat, idx) => (
                    <div
                      key={stat.key}
                      className="p-4 rounded-xl bg-surface-high dark:bg-surface border border-outline space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                          {stat.label}
                        </span>
                        <span className="text-[11px] font-mono text-muted">
                          Key: {stat.key}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[11px] font-semibold text-muted mb-1">
                            Number Value
                          </label>
                          <input
                            type="number"
                            required
                            value={stat.value}
                            onChange={(e) => handleStatChange(idx, 'value', Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-surface dark:bg-background border border-outline rounded-lg text-xs font-bold text-on-surface"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-muted mb-1">
                            Suffix
                          </label>
                          <input
                            type="text"
                            value={stat.suffix || ''}
                            onChange={(e) => handleStatChange(idx, 'suffix', e.target.value)}
                            placeholder="+"
                            className="w-full px-3 py-1.5 bg-surface dark:bg-background border border-outline rounded-lg text-xs font-bold text-on-surface"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline">
                <button
                  type="button"
                  onClick={() => setStatsModalOpen(false)}
                  className="px-4 py-2 bg-surface-high border border-outline text-xs font-semibold rounded-xl text-on-surface hover:bg-surface-highest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statsSaving || statsLoading}
                  className="px-6 py-2 bg-[#0047FF] hover:bg-[#0036C7] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                >
                  {statsSaving ? 'Saving...' : 'Save Statistics'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
