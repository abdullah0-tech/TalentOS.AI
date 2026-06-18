'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { request } from '../../../services/api';
import { 
  Users, 
  Search, 
  Filter, 
  Loader2, 
  Plus, 
  Mail, 
  Briefcase, 
  X, 
  CheckCircle,
  Building,
  KeyRound,
  UserCheck,
  UserX,
  UserPlus,
  Copy,
  AlertCircle,
  Send,
  XOctagon
} from 'lucide-react';

import WorkforceLoader from '../../../components/WorkforceLoader';

// Extract unique departments for filtering
const departments = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance'];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Credentials / Invitation link popup modal state
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [activationMethod, setActivationMethod] = useState('invite'); // 'invite' | 'manual'
  const [password, setPassword] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, selectedDept]);

  const fetchEmployees = async () => {
    try {
      const q = new URLSearchParams();
      if (searchTerm) q.append('search', searchTerm);
      if (selectedDept) q.append('department', selectedDept);

      const data = await request(`/employees?${q.toString()}`);
      setEmployees(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve employee registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.department || !formData.position) {
      setError('All fields are required.');
      return;
    }
    if (activationMethod === 'manual' && !password) {
      setError('Please provide a password for manual setup.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const body = {
        ...formData,
        sendEmail: activationMethod === 'invite' ? sendEmail : false
      };
      if (activationMethod === 'manual') {
        body.password = password;
      }

      const res = await request('/employees', {
        method: 'POST',
        body
      });

      setSuccess(activationMethod === 'manual' ? 'Employee account created and activated!' : 'Employee registered successfully!');
      setFormData({ name: '', email: '', department: '', position: '' });
      setPassword('');
      fetchEmployees();

      // Show invitation details
      if (res.credentials) {
        setCredentials({
          title: 'Employee Login Credentials',
          email: res.credentials.email,
          password: res.credentials.password,
          name: res.employee.name,
          isInvite: false
        });
      } else if (res.invite) {
        setCredentials({
          title: 'Employee Invitation Link',
          email: res.employee.email,
          password: res.invite.url,
          name: res.employee.name,
          isInvite: true
        });
      }

      setTimeout(() => {
        setModalOpen(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to onboard employee.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle account state (Active vs Suspended)
  const handleToggleStatus = async (empId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setActionLoading(empId);
    setError('');
    setSuccess('');
    try {
      await request(`/employees/${empId}/status`, {
        method: 'PATCH',
        body: { status: nextStatus }
      });
      setSuccess(`Employee status updated to ${nextStatus}.`);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update employee status.');
    } finally {
      setActionLoading(null);
    }
  };

  // Resend invitation
  const handleResendInvite = async (employeeId, employeeName) => {
    setActionLoading(employeeId);
    setError('');
    setSuccess('');
    try {
      const res = await request('/employees/resend-invite', {
        method: 'POST',
        body: { employeeId }
      });
      
      setCredentials({
        title: 'New Onboarding Invite Link',
        email: employees.find(e => e.id === employeeId)?.email || '',
        password: res.invite?.url || res.url,
        name: employeeName,
        isInvite: true
      });
      setSuccess(`New invitation link generated for ${employeeName}.`);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to regenerate invite link.');
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel invitation
  const handleCancelInvite = async (employeeId, employeeName) => {
    setActionLoading(employeeId);
    setError('');
    setSuccess('');
    try {
      await request('/employees/invite/cancel', {
        method: 'POST',
        body: { employeeId }
      });
      setSuccess(`Invitation cancelled for ${employeeName}.`);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to cancel invitation.');
    } finally {
      setActionLoading(null);
    }
  };

  // Reset password administratively for active users
  const handleResetPassword = async (userId, employeeName) => {
    setActionLoading(userId);
    setError('');
    setSuccess('');
    try {
      const res = await request('/auth/reset-password', {
        method: 'POST',
        body: { userId }
      });
      
      setCredentials({
        title: 'Temporary Reset Credentials',
        email: res.email || employees.find(e => e.user?.id === userId)?.email || 'Employee Email',
        password: res.tempPassword,
        name: employeeName,
        isInvite: false
      });
      setSuccess(`Password for ${employeeName} has been reset.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to reset employee password.');
    } finally {
      setActionLoading(null);
    }
  };

  // Provision login for existing employee profiles without a user login
  const handleProvisionLogin = async (employeeId, employeeName) => {
    const passwordOption = window.prompt(`Enter a password to activate ${employeeName}'s login account immediately, or leave empty to send an email invitation link instead:`);
    if (passwordOption === null) return; // User cancelled prompt
    
    setActionLoading(employeeId);
    setError('');
    setSuccess('');
    try {
      const body = { employeeId };
      if (passwordOption.trim() !== '') {
        body.password = passwordOption.trim();
      }

      const res = await request('/employees/create-account', {
        method: 'POST',
        body
      });

      if (res.credentials) {
        setCredentials({
          title: 'Employee Login Credentials',
          email: res.credentials.email,
          password: res.credentials.password,
          name: employeeName,
          isInvite: false
        });
      } else if (res.invite) {
        setCredentials({
          title: 'Employee Onboarding Link',
          email: employees.find(e => e.id === employeeId)?.email || '',
          password: res.invite.url,
          name: employeeName,
          isInvite: true
        });
      }
      setSuccess(`Account setup complete for ${employeeName}.`);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to provision invitation link.');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = () => {
    if (!credentials) return;
    const text = credentials.isInvite 
      ? `Invitation Link for ${credentials.name}:\n${credentials.password}` 
      : `Email: ${credentials.email}\nTemporary Password: ${credentials.password}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Invitation Status Badge Helper
  const getInviteStatusInfo = (emp) => {
    if (emp.user?.isActive) {
      return { label: 'Activated', style: 'bg-emerald-500/10 text-emerald-450 text-emerald-400 border-emerald-500/20' };
    }
    
    if (emp.status === 'suspended') {
      return { label: 'Inactive', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    }

    if (emp.invites && emp.invites.length > 0) {
      const invite = emp.invites[0];
      const now = new Date();
      const expiresAt = new Date(invite.expiresAt);

      if (invite.status === 'accepted') {
        return { label: 'Activated', style: 'bg-emerald-500/10 text-emerald-450 text-emerald-400 border-emerald-500/20' };
      } else if (invite.status === 'cancelled') {
        return { label: 'Cancelled', style: 'bg-surface-high text-muted border-slate-750' };
      } else if (invite.status === 'expired' || now > expiresAt) {
        return { label: 'Expired', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      } else {
        return { label: 'Pending Invite', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' };
      }
    }

    return { label: 'Inactive', style: 'bg-surface-high text-muted border-slate-750' };
  };

  // Extract unique departments for filtering
  const departments = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance'];

  if (loading && employees.length === 0) {
    return (
      <div className="space-y-8 relative">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline pb-6">
          <div className="space-y-2 w-1/3">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>

        {/* Control filter bar */}
        <div className="h-16 bg-slate-100 dark:bg-slate-900/50 border border-outline rounded-2xl animate-pulse" />

        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface border border-outline rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>
              </div>
              <hr className="border-outline/60" />
              <div className="space-y-2">
                <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
              <div className="pt-4 border-t border-outline/40 flex justify-between items-center">
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Employee Directory</h1>
          <p className="text-sm text-muted mt-1">Manage active onboarded team members, secure link invitations, and system access.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:translate-y-[-1px] self-start"
        >
          <Plus size={16} /> Register Staff
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Control filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-high/20 border border-outline p-4 rounded-2xl">
        <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-xl border border-outline self-start">
          <Filter size={12} className="text-muted" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-transparent text-xs text-on-surface-variant font-semibold focus:outline-none border-none pr-4 outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search name, position, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-outline text-sm pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-on-surface"
          />
        </div>
      </div>

      {/* Employee List Grid Cards */}
      {employees.length === 0 ? (
        <div className="bg-surface-high/10 border border-dashed border-outline rounded-2xl py-20 text-center">
          <Users className="mx-auto text-on-surface-variant mb-4" size={40} />
          <h3 className="text-lg font-semibold text-on-surface-variant">No Employees Found</h3>
          <p className="text-xs text-muted mt-1">No employee matches the search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => {
            const statusInfo = getInviteStatusInfo(emp);
            return (
              <div key={emp.id} className="bg-surface border border-outline hover:border-outline rounded-2xl p-6 flex flex-col justify-between gap-5 hover:shadow-lg transition group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500/10 group-hover:bg-indigo-500/40 transition-colors" />

                <div className="space-y-4">
                  {/* Profile Pic Placeholder & Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-sm shadow-inner uppercase">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-on-surface truncate">{emp.name}</h4>
                      <p className="text-[10px] text-muted mt-0.5 flex items-center gap-1">
                        <Briefcase size={10} /> {emp.position}
                      </p>
                    </div>
                  </div>

                  <hr className="border-outline/60" />

                  {/* Info List */}
                  <div className="space-y-2 text-xs text-muted">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail size={12} className="text-muted" /> {emp.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Building size={12} className="text-muted" /> {emp.department}
                    </p>
                  </div>
                </div>

                {/* Action and status footer */}
                <div className="pt-4 border-t border-outline/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.style}`}>
                      {statusInfo.label}
                    </span>

                    {emp.user ? (
                      <span className="text-[9px] font-semibold text-slate-550 text-muted">
                        Login linked
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-amber-500">
                        No Login Profile
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Active Suspend logic */}
                    {emp.user?.isActive ? (
                      <button
                        disabled={actionLoading === emp.id}
                        onClick={() => handleToggleStatus(emp.id, emp.status)}
                        className="px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 border border-transparent hover:border-outline bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      >
                        {actionLoading === emp.id ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <>
                            <UserX size={10} /> Suspend
                          </>
                        )}
                      </button>
                    ) : emp.user ? (
                      // Unactivated user actions (Resend, Cancel, Activate manually if suspended)
                      <>
                        <button
                          disabled={actionLoading === emp.id}
                          onClick={() => handleResendInvite(emp.id, emp.name)}
                          className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold transition flex items-center gap-1 border border-transparent hover:border-outline"
                        >
                          {actionLoading === emp.id ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <>
                              <Send size={10} /> Resend Invite
                            </>
                          )}
                        </button>

                        {statusInfo.label === 'Pending Invite' && (
                          <button
                            disabled={actionLoading === emp.id}
                            onClick={() => handleCancelInvite(emp.id, emp.name)}
                            className="px-2 py-1 rounded bg-surface-high hover:bg-slate-750 text-muted text-[10px] font-bold transition flex items-center gap-1 border border-transparent hover:border-outline"
                          >
                            {actionLoading === emp.id ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <>
                                <XOctagon size={10} /> Cancel
                              </>
                            )}
                          </button>
                        )}
                        
                        {emp.status === 'suspended' && (
                          <button
                            disabled={actionLoading === emp.id}
                            onClick={() => handleToggleStatus(emp.id, emp.status)}
                            className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold transition flex items-center gap-1 border border-transparent hover:border-outline"
                          >
                            {actionLoading === emp.id ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <>
                                <UserCheck size={10} /> Activate
                              </>
                            )}
                          </button>
                        )}
                      </>
                    ) : (
                      /* Provision login account if missing */
                      <button
                        disabled={actionLoading === emp.id}
                        onClick={() => handleProvisionLogin(emp.id, emp.name)}
                        className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-455 text-amber-400 text-[10px] font-bold transition flex items-center gap-1 border border-transparent hover:border-outline animate-pulse"
                      >
                        {actionLoading === emp.id ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <>
                            <UserPlus size={10} /> Provision Login
                          </>
                        )}
                      </button>
                    )}

                    {/* Reset Password - Only if user is activated */}
                    {emp.user?.isActive && (
                      <button
                        disabled={actionLoading === emp.user.id}
                        onClick={() => handleResetPassword(emp.user.id, emp.name)}
                        className="px-2 py-1 rounded bg-surface-high hover:bg-slate-750 text-on-surface-variant text-[10px] font-bold transition flex items-center gap-1 border border-transparent hover:border-outline"
                      >
                        {actionLoading === emp.user.id ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <>
                            <KeyRound size={10} /> Reset
                          </>
                        )}
                      </button>
                    )}

                    <Link 
                      href={`/dashboard/employees/${emp.id}`}
                      className="ml-auto px-2.5 py-1 text-[10px] text-muted hover:text-on-surface font-bold transition flex items-center hover:underline"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENDER REGISTRATION MODAL POPUP */}
      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-surface border border-outline rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-fade-in">
            {submitting && (
              <div className="absolute inset-0 bg-surface/95 dark:bg-slate-900/95 rounded-3xl flex items-center justify-center p-6 z-[1001] animate-fade-in">
                <WorkforceLoader mode="employee-creation" />
              </div>
            )}
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-muted hover:text-on-surface rounded-lg hover:bg-surface-high"
            >
              ✕
            </button>

            <h3 className="font-extrabold text-on-surface text-xl tracking-tight mb-2 font-display">Register Employee</h3>
            <p className="text-xs text-muted mb-6">Create a profile and generate a secure activation link automatically.</p>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-muted font-semibold uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="Employee name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted font-semibold uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="employee@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted font-semibold uppercase">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  required
                  className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted font-semibold uppercase">Position Title</label>
                <input
                  type="text"
                  placeholder="Software Engineer, Product Manager..."
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  required
                  className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] text-muted font-semibold uppercase block">Activation Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                    <input 
                      type="radio" 
                      name="activationMethod" 
                      value="invite" 
                      checked={activationMethod === 'invite'} 
                      onChange={() => setActivationMethod('invite')}
                      className="text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-background border-outline"
                    />
                    Send Invite Link
                  </label>
                  <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                    <input 
                      type="radio" 
                      name="activationMethod" 
                      value="manual" 
                      checked={activationMethod === 'manual'} 
                      onChange={() => setActivationMethod('manual')}
                      className="text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-background border-outline"
                    />
                    Set Password Manually
                  </label>
                </div>
              </div>

              {activationMethod === 'invite' ? (
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="sendEmailCheck"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded border-outline text-indigo-600 bg-background focus:ring-indigo-500 focus:ring-offset-0 focus:ring-0"
                  />
                  <label htmlFor="sendEmailCheck" className="text-xs text-muted cursor-pointer">
                    Send invitation link automatically via email
                  </label>
                </div>
              ) : (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] text-muted font-semibold uppercase">Password</label>
                  <input
                    type="text"
                    placeholder="Enter password for employee"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={activationMethod === 'manual'}
                    className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Onboard Employee'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC TEMPORARY CREDENTIALS POPUP */}
      {credentials && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-background border border-indigo-500/35 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center animate-fade-in">
            <button 
              onClick={() => setCredentials(null)}
              className="absolute top-4 right-4 p-1 text-muted hover:text-on-surface rounded-lg hover:bg-surface"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
              <KeyRound size={24} />
            </div>

            <h3 className="font-extrabold text-on-surface text-lg tracking-tight mb-1">{credentials.title}</h3>
            <p className="text-xs text-muted mb-6">Linked account for <span className="text-on-surface font-bold">{credentials.name}</span> has been updated.</p>

            <div className="bg-surface border border-outline rounded-2xl p-4 text-left space-y-3 font-mono text-xs relative group">
              <div>
                <span className="text-muted font-semibold text-[10px] block">EMPLOYEE EMAIL</span>
                <span className="text-on-surface select-all font-bold">{credentials.email}</span>
              </div>
              <div className="border-t border-outline/60 pt-2">
                <span className="text-muted font-semibold text-[10px] block">{credentials.isInvite ? 'SECURE INVITE LINK' : 'TEMPORARY PASSWORD'}</span>
                <span className="text-indigo-400 select-all break-all font-bold leading-normal">{credentials.password}</span>
              </div>
            </div>

            <p className="text-[10px] text-muted mt-3 flex items-center gap-1.5 justify-center">
              {credentials.isInvite 
                ? '* Note: Employee must open this link to set their own password and activate.'
                : '* Note: The employee will be forced to change this password on their initial login.'}
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 px-4 rounded-xl border border-outline hover:bg-surface text-on-surface-variant hover:text-on-surface font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Copy size={14} /> {copied ? 'Copied!' : 'Copy Info'}
              </button>
              <button
                onClick={() => setCredentials(null)}
                className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
