'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { authService } from '../../../services/auth.service';
import { 
  Zap, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Info,
  ArrowRight,
  Plus,
  Play
} from 'lucide-react';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [trigger, setTrigger] = useState('candidate_hired');
  const [action, setAction] = useState('create_employee_and_setup_onboarding');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const data = await request('/automation');
      setAutomations(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve automations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!trigger || !action) {
      setError('Trigger and action are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await request('/automation', {
        method: 'POST',
        body: { trigger, action }
      });

      setSuccess('Automation rule created successfully!');
      fetchAutomations();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create automation rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      setError('');
      setSuccess('');

      await request(`/automation/${id}`, {
        method: 'PUT',
        body: { active: !currentActive }
      });

      setSuccess(`Automation rule ${!currentActive ? 'enabled' : 'disabled'}.`);
      fetchAutomations();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to toggle rule state.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      await request(`/automation/${id}`, {
        method: 'DELETE'
      });

      setSuccess('Automation rule removed.');
      fetchAutomations();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete rule.');
    }
  };

  // Human-readable labels maps
  const triggerLabels = {
    'candidate_hired': 'Candidate status changes to "Hired"',
    'leave_requested': 'Employee submits a new "Leave Request"'
  };

  const actionLabels = {
    'create_employee_and_setup_onboarding': 'Onboard employee, setup checklists & welcome templates',
    'notify_manager_on_leave': 'Generate instant manager review notifications'
  };

  const userRole = currentUser?.role ? currentUser.role.toLowerCase() : 'member';
  const isAdmin = ['owner', 'admin', 'member'].includes(userRole);

  if (!isAdmin) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-xl mx-auto mt-12 space-y-4">
        <h3 className="font-bold text-on-surface">Access Denied</h3>
        <p className="text-sm">You must have Administrator or Owner privileges to configure workflow automations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
          <Zap className="text-indigo-400" size={32} /> Workflow Automations
        </h1>
        <p className="text-sm text-muted mt-1">Configure event-driven trigger rules that run automatic workplace actions.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Rule Builder Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div>
              <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <Plus size={16} className="text-indigo-400" /> Add Automation Rule
              </h3>
              <p className="text-[10px] text-muted mt-1">Wired-up triggers launch automated workflows.</p>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-muted font-bold uppercase block">WHEN Event Occurs</label>
                <select
                  value={trigger}
                  onChange={(e) => {
                    setTrigger(e.target.value);
                    if (e.target.value === 'candidate_hired') {
                      setAction('create_employee_and_setup_onboarding');
                    } else if (e.target.value === 'leave_requested') {
                      setAction('notify_manager_on_leave');
                    }
                  }}
                  className="w-full bg-background border border-outline px-3 py-2.5 rounded-xl text-xs text-on-surface focus:outline-none"
                >
                  <option value="candidate_hired">Candidate is Hired</option>
                  <option value="leave_requested">Leave is Requested</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted font-bold uppercase block">THEN Execute Action</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full bg-background border border-outline px-3 py-2.5 rounded-xl text-xs text-on-surface focus:outline-none"
                >
                  {trigger === 'candidate_hired' ? (
                    <option value="create_employee_and_setup_onboarding">Create Employee Profile & Onboarding</option>
                  ) : (
                    <option value="notify_manager_on_leave">Notify Managers & Supervisors</option>
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/10 transition flex items-center justify-center gap-1.5"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <span className="flex items-center gap-1.5"><Zap size={14} /> Save Rule</span>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Active Rules Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background/40 border border-outline/80 rounded-2xl p-6">
            <h3 className="font-bold text-on-surface text-base mb-6 font-bold flex items-center gap-2">
              <Zap size={18} className="text-indigo-400" /> Active Automation Pipeline
            </h3>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-surface/40 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : automations.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-outline rounded-2xl">
                <Zap className="mx-auto text-on-surface-variant mb-3" size={36} />
                <h4 className="font-bold text-muted text-xs">No active automation rules configured</h4>
                <p className="text-[10px] text-muted mt-1">Configure WHEN-THEN pipelines to automate operations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {automations.map((rule) => (
                  <div 
                    key={rule.id} 
                    className="p-5 bg-surface/40 border border-outline hover:border-outline rounded-xl space-y-4 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-10/12">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block">When Event:</span>
                          <span className="text-xs font-semibold text-on-surface block">
                            {triggerLabels[rule.trigger] || rule.trigger}
                          </span>
                        </div>
                        
                        <div className="hidden sm:block">
                          <ArrowRight className="text-on-surface-variant" size={16} />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-450 text-emerald-400 uppercase tracking-wide block">Then Action:</span>
                          <span className="text-xs font-semibold text-on-surface-variant block">
                            {actionLabels[rule.action] || rule.action}
                          </span>
                        </div>
                      </div>

                      {/* Rule controls */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Toggle switch */}
                        <button
                          onClick={() => handleToggleActive(rule.id, rule.active)}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition ${
                            rule.active ? 'bg-indigo-600' : 'bg-surface-high'
                          }`}
                        >
                          <div className={`w-4.5 h-4.5 bg-surface rounded-full shadow-md transition transform ${
                            rule.active ? 'translate-x-4.5' : 'translate-x-0'
                          }`} />
                        </button>

                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="p-1.5 hover:bg-red-500/10 text-muted hover:text-red-400 rounded-lg transition"
                          title="Delete Rule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="p-4 bg-surface/60 border border-outline rounded-xl text-[10px] text-muted flex items-start gap-2 max-w-2xl">
        <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Workflow automations help eliminate manual onboarding steps. The rule engine responds in real-time when applications are approved or leaves are requested.
        </p>
      </div>
    </div>
  );
}
