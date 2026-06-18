'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  CalendarDays, 
  PlusCircle, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

export default function EmployeeLeave() {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadLeaves = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await request('/leave');
      setLeaves(data);
    } catch (err) {
      console.error('Failed to load leaves list:', err);
      setError('Could not retrieve leave requests history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!startDate || !endDate) {
      setError('Start date and end date are required.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    setSubmitLoading(true);

    try {
      await request('/leave', {
        method: 'POST',
        body: { leaveType, startDate, endDate, reason }
      });

      setSuccessMsg('Leave request submitted successfully!');
      setStartDate('');
      setEndDate('');
      setReason('');
      
      // Reload history
      await loadLeaves();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Submit leave request error:', err);
      setError(err.message || 'Failed to submit leave request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && leaves.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-muted text-sm">Opening leave tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-2">
          <CalendarDays className="text-indigo-400" /> My Leave Requests
        </h1>
        <p className="text-muted text-sm mt-1">
          Apply for time-off and track your approval status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave Application Form */}
        <div className="glass-panel border border-outline/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-on-surface border-b border-outline/60 pb-3 mb-6 flex items-center gap-2">
              <PlusCircle size={18} className="text-indigo-400" /> Apply for Time-Off
            </h3>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2 mb-4">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2 mb-4 animate-pulse">
                <CheckCircle size={14} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                  Leave Classification
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="input-dark w-full"
                >
                  <option value="annual" className="bg-background text-on-surface">Annual Leave</option>
                  <option value="sick" className="bg-background text-on-surface">Sick Leave</option>
                  <option value="casual" className="bg-background text-on-surface">Casual Leave</option>
                  <option value="unpaid" className="bg-background text-on-surface">Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-dark w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-dark w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                  Reason / Notes
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide details about your request..."
                  className="input-dark w-full resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="btn-primary w-full py-2.5 mt-2 disabled:opacity-50"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} /> Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Leave history */}
        <div className="lg:col-span-2 glass-panel border border-outline/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-outline/60 pb-3">
              <CalendarDays className="text-indigo-400" size={18} />
              <h3 className="font-bold text-lg text-on-surface">Requests Log History</h3>
            </div>

            {leaves.length > 0 ? (
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {leaves.map((leave) => {
                  const startStr = new Date(leave.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  const endStr = new Date(leave.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  
                  return (
                    <div key={leave.id} className="p-4.5 rounded-xl bg-surface/40 border border-outline hover:border-outline/80 transition-colors flex justify-between items-center">
                      <div className="space-y-1.5 flex-1 pr-4">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                            {leave.leaveType} Leave
                          </span>
                          <span className={
                            leave.status === 'approved' ? 'neon-badge-tertiary' :
                            leave.status === 'rejected' ? 'neon-badge-secondary border-rose-500/35 text-rose-350 bg-rose-500/10' :
                            'neon-badge-primary border-amber-500/35 text-amber-350 bg-amber-500/10'
                          }>
                            {leave.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted font-medium">
                          {startStr} to {endStr}
                        </p>
                        {leave.reason && (
                          <p className="text-[11px] text-muted italic mt-2 leading-relaxed bg-background/40 border border-outline px-3 py-2 rounded-lg">
                            "{leave.reason}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-outline/80 rounded-2xl">
                <CalendarDays size={40} className="text-on-surface-variant mx-auto mb-3" />
                <p className="text-muted text-sm font-semibold">No leave requests found</p>
                <p className="text-muted text-xs mt-1">Submit a leave request on the left console.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
