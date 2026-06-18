'use client';

import { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { request } from '../../../../services/api';
import { 
  User, 
  Mail, 
  Building, 
  Briefcase, 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ClipboardCheck, 
  Clock, 
  CalendarDays, 
  Star, 
  Target, 
  GraduationCap, 
  ShieldAlert,
  Send,
  Check,
  Plus,
  History,
  XOctagon,
  Copy,
  KeyRound
} from 'lucide-react';

export default function EmployeeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('onboarding');

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Submit Performance Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewCycle, setReviewCycle] = useState('Q1_2026');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Clipboard copy state
  const [copiedLink, setCopiedLink] = useState('');

  useEffect(() => {
    if (id) {
      fetchEmployeeDetails();
    }
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const data = await request(`/employees/${id}`);
      setEmployee(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load employee details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!reviewFeedback.trim()) {
      setReviewError('Feedback text is required.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');

      await request('/performance-review', {
        method: 'POST',
        body: {
          employeeId: id,
          rating: reviewRating,
          feedback: reviewFeedback,
          reviewCycle
        }
      });

      setReviewSuccess('Performance review recorded successfully.');
      setReviewFeedback('');
      fetchEmployeeDetails();
    } catch (err) {
      console.error(err);
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleResendInvite = async () => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await request('/employees/resend-invite', {
        method: 'POST',
        body: { employeeId: id }
      });
      setSuccessMsg('Invitation email resent successfully.');
      if (res.invite) {
        setCopiedLink(res.invite.url);
      }
      fetchEmployeeDetails();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to resend invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelInvite = async () => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await request('/employees/invite/cancel', {
        method: 'POST',
        body: { employeeId: id }
      });
      setSuccessMsg('Invitation cancelled successfully.');
      fetchEmployeeDetails();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to cancel invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!copiedLink) return;
    navigator.clipboard.writeText(copiedLink);
    setSuccessMsg('Link copied to clipboard!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-xl mx-auto mt-12 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-400 shrink-0" size={24} />
          <h3 className="font-bold text-on-surface">Error Loading Profile</h3>
        </div>
        <p className="text-sm">{error || 'Employee profile not found or access denied.'}</p>
        <Link href="/dashboard/employees" className="inline-block px-4 py-2 bg-surface-high hover:bg-slate-700 text-xs font-semibold rounded-xl text-on-surface transition">
          Back to Directory
        </Link>
      </div>
    );
  }

  // Calculate some aggregate values for display
  const completedTasks = employee.onboardingTasks?.filter(t => t.status === 'completed').length || 0;
  const totalTasks = employee.onboardingTasks?.length || 0;
  const onboardingProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const averageRating = employee.reviews?.length > 0 
    ? (employee.reviews.reduce((acc, r) => acc + r.rating, 0) / employee.reviews.length).toFixed(1)
    : 'N/A';

  const completedCourses = employee.courses?.filter(c => c.completed).length || 0;
  const totalCourses = employee.courses?.length || 0;

  // Invitation Status Badge Helper
  const getInviteStatusInfo = (emp) => {
    if (emp.user?.isActive) {
      return { label: 'Activated', style: 'bg-emerald-500/10 text-emerald-450 text-emerald-400 border-emerald-500/20' };
    }
    
    if (emp.status === 'suspended') {
      return { label: 'Inactive (Suspended)', style: 'bg-rose-500/10 text-rose-455 text-rose-400 border-rose-500/20' };
    }

    if (emp.invites && emp.invites.length > 0) {
      const invite = emp.invites[0];
      const now = new Date();
      const expiresAt = new Date(invite.expiresAt);

      if (invite.status === 'accepted') {
        return { label: 'Activated', style: 'bg-emerald-500/10 text-emerald-450 text-emerald-400 border-emerald-500/20' };
      } else if (invite.status === 'cancelled') {
        return { label: 'Cancelled', style: 'bg-surface-high text-slate-550 text-muted border-slate-750' };
      } else if (invite.status === 'expired' || now > expiresAt) {
        return { label: 'Expired', style: 'bg-rose-500/10 text-rose-455 text-rose-400 border-rose-500/20' };
      } else {
        return { label: 'Pending Invite', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' };
      }
    }

    return { label: 'No Invite Sent', style: 'bg-surface-high text-muted border-slate-750' };
  };

  const statusInfo = getInviteStatusInfo(employee);

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/employees" 
          className="p-2 bg-surface-high hover:bg-surface-high text-muted hover:text-on-surface rounded-xl transition border border-outline/80"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
            Employee Profile
          </h1>
          <p className="text-xs text-muted">View performance reviews, onboarding checklist progress, and invitation logs.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle size={16} className="shrink-0" />
          <span>{successMsg}</span>
          {copiedLink && (
            <button 
              onClick={handleCopyLink} 
              className="ml-auto flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/35 px-2.5 py-1 rounded-lg text-xs font-semibold text-white border border-emerald-500/30 transition-colors"
            >
              <Copy size={12} /> Copy Link
            </button>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-background/40 border border-outline/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 text-indigo-400 font-black flex items-center justify-center text-3xl shadow-inner border border-indigo-500/20 uppercase shrink-0">
            {employee.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold text-on-surface">{employee.name}</h2>
            <p className="text-muted text-sm font-medium flex items-center justify-center sm:justify-start gap-1">
              <Briefcase size={14} className="text-muted" /> {employee.position}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2">
              <span className="text-[10px] bg-surface border border-outline text-muted font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Building size={12} /> {employee.department}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.style}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Small quick stats widget */}
        <div className="grid grid-cols-3 gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-outline pt-6 md:pt-0 md:pl-8">
          <div className="text-center md:text-left">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Avg Rating</span>
            <span className="text-xl font-extrabold text-on-surface mt-1 block flex items-center justify-center md:justify-start gap-1">
              <Star size={16} className="text-amber-400 fill-amber-400" /> {averageRating}
            </span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Onboarding</span>
            <span className="text-xl font-extrabold text-indigo-400 mt-1 block">
              {onboardingProgress}%
            </span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Training</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
              {completedCourses}/{totalCourses}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Meta & Create Review */}
        <div className="lg:col-span-1 space-y-6">
          {/* Metadata Card */}
          <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-on-surface text-sm">Employment Data</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-outline/60">
                <span className="text-muted flex items-center gap-1.5"><Mail size={14} className="text-muted" /> Email Address</span>
                <span className="text-on-surface font-medium select-all">{employee.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline/60">
                <span className="text-muted flex items-center gap-1.5"><Calendar size={14} className="text-muted" /> Joined Company</span>
                <span className="text-on-surface font-medium">{new Date(employee.joinedAt).toLocaleDateString([], { dateStyle: 'medium' })}</span>
              </div>
            </div>
          </div>

          {/* Record Feedback Evaluation */}
          <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <Star size={16} className="text-amber-400" /> Submit Evaluation
              </h3>
              <p className="text-[10px] text-muted mt-1">Submit employee performance score & qualitative notes.</p>
            </div>

            {reviewSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-1.5">
                <CheckCircle size={14} /> {reviewSuccess}
              </div>
            )}

            {reviewError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center gap-1.5">
                <AlertCircle size={14} /> {reviewError}
              </div>
            )}

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted font-bold uppercase">Numerical Score (1-5)</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      className={`flex-1 py-1.5 font-bold rounded-lg border text-xs transition ${
                        reviewRating === num
                          ? 'bg-amber-500 border-amber-400 text-slate-950'
                          : 'bg-background border-outline text-muted hover:border-outline'
                      }`}
                    >
                      {num} ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted font-bold uppercase">Review Cycle</label>
                <select
                  value={reviewCycle}
                  onChange={(e) => setReviewCycle(e.target.value)}
                  className="w-full bg-background border border-slate-855 px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Q1_2026">Q1 2026</option>
                  <option value="Q2_2026">Q2 2026</option>
                  <option value="Q3_2026">Q3 2026</option>
                  <option value="Q4_2026">Q4 2026</option>
                  <option value="Annual_2026">Annual 2026</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted font-bold uppercase">Evaluation Feedback</label>
                <textarea
                  rows={4}
                  placeholder="Record achievements, feedback, and key progression notes..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  required
                  className="w-full bg-background border border-slate-855 px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
              >
                {submittingReview ? <Loader2 className="animate-spin" size={14} /> : <span className="flex items-center gap-1.5"><Send size={12} /> Submit Review</span>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Subsystem Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Navigation Header */}
          <div className="bg-background/40 border border-outline/80 rounded-2xl p-2 flex flex-wrap gap-1">
            {[
              { id: 'onboarding', label: 'Onboarding Checklist', icon: ClipboardCheck },
              { id: 'invites', label: 'Invitations & Email Logs', icon: Mail },
              { id: 'attendance', label: 'Attendance Logs', icon: Clock },
              { id: 'leave', label: 'Leave History', icon: CalendarDays },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'goals', label: 'Goals & OKRs', icon: Target },
              { id: 'courses', label: 'Training (LMS)', icon: GraduationCap }
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-muted hover:text-white hover:bg-surface/60'
                  }`}
                >
                  <IconComp size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panels */}
          <div className="bg-background/40 border border-outline/80 rounded-3xl p-6 min-h-[400px]">
            
            {/* Onboarding checklist Panel */}
            {activeTab === 'onboarding' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-on-surface text-base">Onboarding Checklist Tasks</h3>
                  <p className="text-xs text-muted mt-1">Integration workflow assigned checklists.</p>
                </div>

                {employee.onboardingTasks?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted">
                      <span>Completion Progress</span>
                      <span className="text-on-surface font-bold">{onboardingProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-outline">
                      <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${onboardingProgress}%` }} />
                    </div>
                  </div>
                )}

                {!employee.onboardingTasks || employee.onboardingTasks.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-outline rounded-2xl">
                    <ClipboardCheck className="mx-auto text-on-surface-variant mb-3" size={32} />
                    <h4 className="font-bold text-muted text-xs">No onboarding tasks initialized.</h4>
                    <p className="text-[10px] text-muted mt-1">Checklists populate automatically on hiring conversions.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {employee.onboardingTasks.map((t) => (
                      <div key={t.id} className="p-3.5 bg-surface/40 border border-outline rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            t.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-450 text-emerald-450 text-emerald-400 border border-emerald-500/20'
                              : t.status === 'in_progress'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : 'bg-surface-high text-muted border border-outline'
                          }`}>
                            {t.status === 'completed' ? '✓' : '•'}
                          </div>
                          <div>
                            <span className={`text-xs font-semibold block ${t.status === 'completed' ? 'text-muted line-through' : 'text-on-surface'}`}>
                              {t.title}
                            </span>
                            <span className="text-[9px] text-muted mt-1 block">Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          t.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-450 text-emerald-450 text-emerald-400'
                            : t.status === 'in_progress'
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'bg-surface-high text-muted'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Invitations & Email Logs Panel */}
            {activeTab === 'invites' && (
              <div className="space-y-8">
                {/* Active invite manager */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-on-surface text-base">Workspace Invitation Controls</h3>
                      <p className="text-xs text-muted mt-1">Status of current employee access link.</p>
                    </div>
                    
                    {!employee.user?.isActive && (
                      <div className="flex gap-2">
                        <button
                          disabled={actionLoading}
                          onClick={handleResendInvite}
                          className="px-3 py-1.5 rounded-xl bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 disabled:opacity-50"
                        >
                          {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          Resend Invite
                        </button>

                        {statusInfo.label === 'Pending Invite' && (
                          <button
                            disabled={actionLoading}
                            onClick={handleCancelInvite}
                            className="px-3 py-1.5 rounded-xl bg-surface-high hover:bg-slate-750 text-on-surface-variant text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <XOctagon size={12} />}
                            Cancel Link
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-surface/40 border border-outline p-5 rounded-2xl space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted font-bold block mb-1">Access Status</span>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${statusInfo.style}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      {employee.invites && employee.invites.length > 0 && (
                        <div>
                          <span className="text-muted font-bold block mb-1">Link Expires At</span>
                          <span className="text-on-surface font-mono">
                            {new Date(employee.invites[0].expiresAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {copiedLink && (
                      <div className="border-t border-outline pt-3 flex items-center justify-between gap-4 text-xs font-mono bg-background/60 p-3 rounded-xl">
                        <span className="text-indigo-400 break-all select-all font-bold">{copiedLink}</span>
                        <button 
                          onClick={handleCopyLink} 
                          className="shrink-0 p-1.5 bg-surface-high hover:bg-slate-750 rounded-lg text-on-surface-variant hover:text-on-surface"
                          title="Copy invitation link"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Logs Checklist */}
                <div className="space-y-4 pt-4 border-t border-outline">
                  <div>
                    <h4 className="font-bold text-on-surface text-sm flex items-center gap-2">
                      <History size={16} className="text-indigo-400" /> Email Dispatch Logs
                    </h4>
                    <p className="text-[10px] text-muted mt-1">Audit log of system-generated welcome emails sent to this employee.</p>
                  </div>

                  {!employee.emailLogs || employee.emailLogs.length === 0 ? (
                    <p className="text-xs text-muted italic">No email logs recorded for this employee.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {employee.emailLogs.map((log) => (
                        <div key={log.id} className="p-3 bg-surface/20 border border-outline/60 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="text-on-surface-variant font-bold block">Welcome Invite Email</span>
                            <span className="text-[10px] text-muted mt-0.5 block">{new Date(log.sentAt).toLocaleString()}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                            log.status === 'sent' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attendance Logs Panel */}
            {activeTab === 'attendance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-on-surface text-base">Clock Punch Timesheet</h3>
                  <p className="text-xs text-muted mt-1">Logs of checking in and checking out.</p>
                </div>

                {!employee.attendance || employee.attendance.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-outline rounded-2xl">
                    <Clock className="mx-auto text-on-surface-variant mb-3" size={32} />
                    <h4 className="font-bold text-muted text-xs">No attendance logs found.</h4>
                    <p className="text-[10px] text-muted mt-1">Daily office punches display here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-outline text-muted font-bold">
                          <th className="py-2.5">Date</th>
                          <th className="py-2.5">Location</th>
                          <th className="py-2.5">Check In</th>
                          <th className="py-2.5">Check Out</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employee.attendance.map((att) => (
                          <tr key={att.id} className="border-b border-outline/60 text-on-surface-variant font-medium">
                            <td className="py-3">{new Date(att.date).toLocaleDateString([], { dateStyle: 'medium' })}</td>
                            <td className="py-3 capitalize">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                att.location === 'office' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-surface-high text-muted'
                              }`}>
                                {att.location}
                              </span>
                            </td>
                            <td className="py-3 font-semibold text-emerald-450 text-emerald-400">{new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="py-3 font-semibold text-amber-400">
                              {att.checkOut 
                                ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                : <span className="text-on-surface-variant font-normal italic">On the clock</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Leave Tracker Panel */}
            {activeTab === 'leave' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-on-surface text-base">Leave Requests History</h3>
                  <p className="text-xs text-muted mt-1">Leaves applied, sick days, and approval logs.</p>
                </div>

                {!employee.leaveRequests || employee.leaveRequests.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-outline rounded-2xl">
                    <CalendarDays className="mx-auto text-on-surface-variant mb-3" size={32} />
                    <h4 className="font-bold text-muted text-xs">No leave requests.</h4>
                    <p className="text-[10px] text-muted mt-1">Approved or pending requests display here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {employee.leaveRequests.map((lv) => (
                      <div key={lv.id} className="p-4 bg-surface/40 border border-outline rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-on-surface capitalize">{lv.leaveType} Leave</span>
                          <span className="text-[10px] text-muted block">
                            {new Date(lv.startDate).toLocaleDateString()} &rarr; {new Date(lv.endDate).toLocaleDateString()}
                          </span>
                          {lv.reason && <p className="text-[10px] text-muted italic font-medium mt-1">Reason: "{lv.reason}"</p>}
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                          lv.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-455 text-emerald-400 border-emerald-500/20'
                            : lv.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {lv.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Performance Reviews Panel */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-on-surface text-base">Performance Evaluations</h3>
                  <p className="text-xs text-muted mt-1">Manager ratings, Q1 evaluations, and career progression audits.</p>
                </div>

                {!employee.reviews || employee.reviews.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-outline rounded-2xl">
                    <Star className="mx-auto text-on-surface-variant mb-3" size={32} />
                    <h4 className="font-bold text-muted text-xs">No performance reviews recorded yet.</h4>
                    <p className="text-[10px] text-muted mt-1">Use the panel on the left to submit an evaluation review.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {employee.reviews.map((rev) => (
                      <div key={rev.id} className="p-5 bg-surface/40 border border-outline rounded-2xl space-y-3 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                              {rev.reviewCycle}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-muted mt-1.5 font-semibold">
                              <span>Reviewer: {rev.reviewer?.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-amber-400 font-bold text-sm bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg gap-1">
                            <Star size={12} className="fill-amber-400" /> {rev.rating} / 5
                          </div>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                          {rev.feedback}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Goals & OKRs Panel */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-on-surface text-base">Objectives & Key Results</h3>
                  <p className="text-xs text-muted mt-1">Company, department, and individual goal tracking indices.</p>
                </div>

                {!employee.goals || employee.goals.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-outline rounded-2xl">
                    <Target className="mx-auto text-on-surface-variant mb-3" size={32} />
                    <h4 className="font-bold text-muted text-xs">No goals or OKRs assigned.</h4>
                    <p className="text-[10px] text-muted mt-1">Create goal milestones on the Goals page.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {employee.goals.map((g) => (
                      <div key={g.id} className="p-4 bg-surface/40 border border-outline rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-on-surface">{g.title}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-surface-high text-muted border border-slate-750 font-bold rounded-full capitalize">
                            {g.level}
                          </span>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] text-muted">
                            <span>Target: {new Date(g.targetDate).toLocaleDateString()}</span>
                            <span className="text-on-surface font-bold">{g.progress}% Complete</span>
                          </div>
                          <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-outline">
                            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${g.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Training Courses LMS Panel */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-on-surface text-base">Course Enrolments & LMS History</h3>
                  <p className="text-xs text-muted mt-1">Assigned skills, online learning progressions, and completions.</p>
                </div>

                {!employee.courses || employee.courses.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-outline rounded-2xl">
                    <GraduationCap className="mx-auto text-on-surface-variant mb-3" size={32} />
                    <h4 className="font-bold text-muted text-xs">No active training courses.</h4>
                    <p className="text-[10px] text-muted mt-1">Courses can be assigned through the LMS Training portal.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {employee.courses.map((ec) => (
                      <div key={ec.id} className="p-4 bg-surface/40 border border-outline rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-on-surface">{ec.course?.title}</span>
                          <p className="text-[10px] text-muted max-w-md line-clamp-1">{ec.course?.description}</p>
                          <div className="w-40 h-1.5 bg-surface rounded-full overflow-hidden mt-2 border border-outline">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${ec.progress}%` }} />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {ec.completed ? (
                            <span className="text-[10px] font-bold text-emerald-455 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full flex items-center gap-1 justify-end">
                              <Check size={12} /> Passed
                            </span>
                          ) : (
                            <span className="text-xs font-extrabold text-muted">
                              {ec.progress}% Progress
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
