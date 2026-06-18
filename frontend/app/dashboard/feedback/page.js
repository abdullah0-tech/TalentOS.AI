'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  ExternalLink,
  MonitorSmartphone,
  Info
} from 'lucide-react';
import { request } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function FeedbackCenterPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const data = await request('/api/feedback');
      setFeedback(data.feedback);
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await request(`/api/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      // Optimistic update
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
      
      // Update metrics optimistically
      if (metrics) {
        let newResolved = metrics.resolvedIssues;
        let newOpen = metrics.openIssues;
        if (newStatus === 'Completed') {
          newResolved++;
          newOpen--;
        } else if (newStatus === 'In Review' || newStatus === 'New') {
          // Simplistic metrics update for UI
        }
        setMetrics({ ...metrics, resolvedIssues: newResolved, openIssues: newOpen });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Are you a demo user?');
    }
  };

  const filteredFeedback = feedback.filter(f => {
    const matchType = filterType === 'All' || f.type === filterType;
    const matchStatus = filterStatus === 'All' || f.status === filterStatus;
    return matchType && matchStatus;
  });

  const getIconForType = (type) => {
    switch(type) {
      case 'Bug Report': return <Bug className="w-4 h-4 text-red-500" />;
      case 'Feature Request': return <Lightbulb className="w-4 h-4 text-amber-500" />;
      default: return <MessageSquare className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      case 'In Review': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/20';
      case 'Planned': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'Rejected': return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/20';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading Feedback Center...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback Center</h1>
          <p className="text-slate-500 dark:text-slate-400">Review and triage community feedback, bugs, and features.</p>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Feedback</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.total}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Feature Requests</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.featureRequests}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg">
                <Bug className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Bug Reports</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.bugReports}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Resolved</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.resolvedIssues}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2"
        >
          <option value="All">All Types</option>
          <option value="General Feedback">General Feedback</option>
          <option value="Bug Report">Bug Reports</option>
          <option value="Feature Request">Feature Requests</option>
        </select>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2"
        >
          <option value="All">All Statuses</option>
          <option value="New">New</option>
          <option value="In Review">In Review</option>
          <option value="Planned">Planned</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Data List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filteredFeedback.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            No feedback found matching the filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredFeedback.map((f) => (
              <div key={f.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col lg:flex-row gap-6">
                
                {/* Left col: Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                      {getIconForType(f.type)}
                      {f.type}
                    </span>
                    {f.priority === 'High' && (
                      <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-xs font-semibold">
                        High Priority
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(f.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-slate-900 dark:text-white font-medium mb-3 whitespace-pre-wrap">{f.message}</p>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">From:</span>
                      {f.user ? `${f.user.name} (${f.user.email})` : 'Anonymous User'}
                    </div>
                    {f.pageUrl && (
                      <div className="flex items-center gap-1.5">
                        <MonitorSmartphone className="w-4 h-4" />
                        <a href={f.pageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors flex items-center gap-1">
                          Source Page <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {f.screenshotUrl && (
                      <div className="flex items-center gap-1.5">
                        <Info className="w-4 h-4" />
                        <a href={f.screenshotUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors flex items-center gap-1">
                          View Screenshot <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right col: Actions */}
                <div className="w-full lg:w-48 shrink-0 flex flex-col gap-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={f.status}
                    onChange={(e) => updateStatus(f.id, e.target.value)}
                    className={`px-3 py-2 border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer appearance-none ${getStatusColor(f.status)}`}
                  >
                    <option value="New">New</option>
                    <option value="In Review">In Review</option>
                    <option value="Planned">Planned</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
