'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { authService } from '../../../services/auth.service';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Send, 
  User, 
  Info,
  Calendar,
  Check,
  X,
  Loader2
} from 'lucide-react';

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Apply Form States
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter tab for admins
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'my_requests'

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await request('/leave');
      setLeaves(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve leave records.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Start date and End date are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await request('/leave', {
        method: 'POST',
        body: { leaveType, startDate, endDate, reason }
      });

      setSuccess('Leave request submitted successfully!');
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchLeaves();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setError('');
      setSuccess('');
      
      await request(`/leave/${requestId}`, {
        method: 'PATCH',
        body: { status }
      });

      setSuccess(`Leave request has been ${status}.`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update leave request status.');
    }
  };

  const userRole = currentUser?.role ? currentUser.role.toLowerCase() : 'member';
  const isEmployee = userRole === 'employee';

  // Calculate balances (Mock balance details for visual wow factor)
  const totalAccrued = 25;
  const takenDays = leaves
    .filter(l => l.status === 'approved' && (isEmployee || l.employee?.email === currentUser?.email))
    .reduce((acc, l) => {
      const diffTime = Math.abs(new Date(l.endDate) - new Date(l.startDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return acc + (isNaN(diffDays) ? 0 : diffDays);
    }, 0);
  const remainingDays = totalAccrued - takenDays;

  // Filter leaves based on activeTab
  const filteredLeaves = leaves.filter(l => {
    if (isEmployee) return true; // Already filtered by backend
    if (activeTab === 'pending') return l.status === 'pending';
    if (activeTab === 'my_requests') return l.employee?.email === currentUser?.email;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
          <CalendarDays className="text-primary" size={32} /> Leave Tracker
        </h1>
        <p className="text-sm text-on-surface-variant mt-1.5">Request, review, and coordinate time-off balances for teams.</p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 text-success p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Balance widgets & Leave Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Balances & Form */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Balance Cards */}
          <div className="glass-card-premium p-6 space-y-4 shadow-sm border border-outline bg-surface rounded-2xl">
            <h3 className="font-bold text-on-surface text-sm">Your Leave Balances</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-high p-4 rounded-xl border border-outline text-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Accrued / Yr</span>
                <span className="text-2xl font-black text-on-surface mt-1 block">{totalAccrued} Days</span>
              </div>
              <div className="bg-surface-high p-4 rounded-xl border border-outline text-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Days Taken</span>
                <span className="text-2xl font-black text-primary mt-1 block">{takenDays} Days</span>
              </div>
            </div>

            <div className="p-4 bg-primary-light border border-blue-200 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Remaining Balance</span>
                <span className="text-lg font-black text-primary block mt-0.5">{remainingDays > 0 ? remainingDays : 0} Days</span>
              </div>
              <CalendarDays className="text-primary" size={24} />
            </div>
          </div>

          {/* Leave Application Form */}
          <div className="glass-card-premium p-6 space-y-4 shadow-sm border border-outline bg-surface rounded-2xl">
            <div>
              <h3 className="font-bold text-on-surface text-sm">Apply for Leave</h3>
              <p className="text-[10px] text-on-surface-variant mt-1">Submit a leave request for approvals.</p>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="input-modern w-full"
                >
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="input-modern w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="input-modern w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Reason</label>
                <textarea
                  rows={3}
                  placeholder="Note reason for time-off request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-modern w-full resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-1.5"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <span className="flex items-center gap-1.5"><Send size={12} /> Apply Leave</span>}
              </button>
            </form>
          </div>
        </div>

        {/* Leaves Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Admin Tabs */}
          {!isEmployee && (
            <div className="bg-surface-highest border border-outline p-1 flex gap-1.5 self-start inline-flex rounded-xl">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all' ? 'bg-surface text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Requests
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'pending' ? 'bg-surface text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Pending Approvals
              </button>
              <button
                onClick={() => setActiveTab('my_requests')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'my_requests' ? 'bg-surface text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                My Requests
              </button>
            </div>
          )}

          <div className="glass-card-premium p-6 shadow-sm border border-outline bg-surface rounded-2xl">
            <h3 className="font-bold text-on-surface text-base mb-6 border-b border-outline pb-3">Time-Off Requests Feed</h3>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-surface-highest rounded-xl animate-pulse border border-outline"></div>
                ))}
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-outline rounded-2xl">
                <Calendar className="mx-auto text-muted mb-3" size={36} />
                <h4 className="font-bold text-on-surface-variant text-xs">No leave records found</h4>
                <p className="text-[10px] text-muted mt-1">All leave application logs are listed in this panel.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeaves.map((lv) => {
                  const diffTime = Math.abs(new Date(lv.endDate) - new Date(lv.startDate));
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                  return (
                    <div 
                      key={lv.id}
                      className="p-4 bg-surface-high/50 border border-outline hover:border-outline rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-blue-200">
                          {lv.employee?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-xs text-on-surface truncate">{lv.employee?.name}</span>
                            <span className="text-[9px] bg-surface-highest border border-outline px-1.5 py-0.5 rounded text-on-surface-variant uppercase font-semibold">{lv.leaveType}</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant mt-1">
                            {new Date(lv.startDate).toLocaleDateString()} &rarr; {new Date(lv.endDate).toLocaleDateString()} &bull; <span className="font-bold text-on-surface">{diffDays} day{diffDays > 1 ? 's' : ''}</span>
                          </p>
                          {lv.reason && <p className="text-[10px] text-on-surface-variant italic mt-2 bg-surface-highest/50 p-2 rounded-lg border border-outline inline-block">Reason: "{lv.reason}"</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <span className={
                          lv.status === 'approved'
                            ? 'badge-active'
                            : lv.status === 'rejected'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }>
                          {lv.status}
                        </span>

                        {/* Admin Action Buttons */}
                        {!isEmployee && lv.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                               onClick={() => handleUpdateStatus(lv.id, 'approved')}
                               className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-all"
                               title="Approve Request"
                            >
                              <Check size={14} className="font-extrabold" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(lv.id, 'rejected')}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-all"
                              title="Reject Request"
                            >
                              <X size={14} className="font-extrabold" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="p-4 bg-primary-light border border-blue-100 rounded-xl text-[10px] text-white-variant flex items-start gap-2.5 max-w-2xl leading-relaxed">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p>
          Leave requests submit straight to managers for review. Approved requests automatically decrement your remaining balance and log on the shared company calendar dashboard.
        </p>
      </div>
    </div>
  );
}
