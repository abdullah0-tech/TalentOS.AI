'use client';

import { useState, useEffect, Fragment } from 'react';
import { request } from '../../../services/api';
import { 
  FileClock, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Expand states for JSON payloads
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, userFilter, page]);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = `/audit-logs?page=${page}&limit=20`;
      if (actionFilter) {
        endpoint += `&action=${actionFilter}`;
      }
      if (userFilter) {
        endpoint += `&userId=${userFilter}`;
      }

      const data = await request(endpoint);
      setLogs(data.logs);
      setTotalPages(data.pagination.pages || 1);
      setTotalCount(data.pagination.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError('Could not retrieve compliance logs. Make sure you are logged in as an Administrator.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const actionTypes = [
    { label: 'All Operations', value: '' },
    { label: 'Recruiter Chat (AI_CHAT)', value: 'AI_CHAT' },
    { label: 'Generate Job Decription', value: 'AI_GENERATE_JD' },
    { label: 'Rank Candidates', value: 'AI_RANK_CANDIDATES' },
    { label: 'Generate Email Drafts', value: 'AI_GENERATE_EMAIL' },
    { label: 'Upload Documents', value: 'CREATE_KNOWLEDGE_DOCUMENT' },
    { label: 'Delete Documents', value: 'DELETE_KNOWLEDGE_DOCUMENT' },
    { label: 'Update Templates', value: 'UPDATE_EMAIL_TEMPLATE' },
    { label: 'Create Templates', value: 'CREATE_EMAIL_TEMPLATE' }
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <FileClock className="text-indigo-400" size={32} /> Compliance Audit Trail
        </h1>
        <p className="text-sm text-muted mt-1">
          Historical log tracking platform activity, document ingestion, candidate ranking executions, and AI copilot actions.
        </p>
      </div>

      {error ? (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-6 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm">Access Restricted</h4>
            <p className="text-xs text-muted mt-1 leading-relaxed">{error}</p>
            <p className="text-[10px] text-muted mt-2 font-medium">Only roles with 'Super Admin', 'HR Director' or 'Owner' are permitted to inspect compliance audit stores.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-background/40 border border-outline/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <select
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                  className="w-full bg-surface border border-outline focus:border-indigo-500 text-xs text-on-surface-variant rounded-xl pl-4 pr-10 py-2.5 focus:outline-none appearance-none font-semibold cursor-pointer"
                >
                  {actionTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <Filter className="absolute right-4 top-3 text-muted pointer-events-none" size={14} />
              </div>
            </div>

            <div className="text-xs text-muted font-bold shrink-0">
              Total Log Entries: <span className="text-on-surface">{totalCount}</span>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-background/40 border border-outline/80 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-surface/60 border border-outline rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="py-24 text-center">
                <Activity className="mx-auto text-on-surface-variant mb-3" size={40} />
                <h4 className="font-bold text-on-surface text-sm">No Logs Registered</h4>
                <p className="text-xs text-muted mt-1 max-w-sm mx-auto leading-relaxed">
                  No activities corresponding to this filter have occurred on the tenant workspace yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline text-muted bg-surface/40 font-bold tracking-wider uppercase text-[10px]">
                      <th className="py-3 px-6">Timestamp</th>
                      <th className="py-3 px-6">User</th>
                      <th className="py-3 px-6">Operation</th>
                      <th className="py-3 px-6">Target Entity</th>
                      <th className="py-3 px-6 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {logs.map((log) => {
                      const isExpanded = expandedLogId === log.id;
                      return (
                        <Fragment key={log.id}>
                          <tr 
                            className={`hover:bg-surface/30 transition-all ${isExpanded ? 'bg-surface/10' : ''}`}
                          >
                            <td className="py-4 px-6 text-muted font-medium whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <Clock size={12} className="text-on-surface-variant" />
                                {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-on-surface font-bold whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <User size={12} className="text-indigo-400" />
                                {log.user?.name || 'System Operator'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-surface-high text-on-surface-variant border border-slate-750">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-on-surface-variant font-medium max-w-xs truncate">
                              {log.entity}
                            </td>
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              {log.details ? (
                                <button
                                  onClick={() => toggleExpand(log.id)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
                                >
                                  {isExpanded ? (
                                    <>Collapse <ChevronUp size={12} /></>
                                  ) : (
                                    <>Inspect <ChevronDown size={12} /></>
                                  )}
                                </button>
                              ) : (
                                <span className="text-on-surface-variant">-</span>
                              )}
                            </td>
                          </tr>

                          {/* Expanded JSON details panel */}
                          {isExpanded && log.details && (
                            <tr key={`${log.id}-details`} className="bg-background">
                              <td colSpan={5} className="py-4 px-6 border-b border-outline">
                                <div className="p-4 bg-surface/60 border border-outline rounded-xl">
                                  <p className="font-bold text-[10px] text-muted uppercase tracking-wider mb-2">Request Payload Details</p>
                                  <pre className="text-[10px] font-mono text-indigo-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                    {(() => {
                                      try {
                                        return JSON.stringify(JSON.parse(log.details), null, 2);
                                      } catch (e) {
                                        return log.details;
                                      }
                                    })()}
                                  </pre>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-[10px] font-bold text-muted uppercase">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3.5 py-2 bg-surface-high hover:bg-slate-750 disabled:opacity-50 text-xs font-bold text-on-surface rounded-xl transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3.5 py-2 bg-surface-high hover:bg-slate-750 disabled:opacity-50 text-xs font-bold text-on-surface rounded-xl transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
