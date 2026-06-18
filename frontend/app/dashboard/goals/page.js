'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { authService } from '../../../services/auth.service';
import { 
  Target, 
  User, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Calendar, 
  Info, 
  Plus,
  Percent
} from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [level, setLevel] = useState('individual');
  const [employeeId, setEmployeeId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Progress edit states
  const [updatingId, setUpdatingId] = useState(null);
  const [updateVal, setUpdateVal] = useState(0);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchGoalsAndEmployees(user);
  }, []);

  const fetchGoalsAndEmployees = async (user) => {
    try {
      setLoading(true);
      const goalsData = await request('/goals');
      setGoals(goalsData);

      const userRole = user?.role ? user.role.toLowerCase() : 'member';
      if (userRole !== 'employee') {
        const empData = await request('/employees');
        setEmployees(empData);
        if (empData.length > 0) {
          setEmployeeId(empData[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve goal registries.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title || !targetDate) {
      setError('Title and Target Date are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const userRole = currentUser?.role ? currentUser.role.toLowerCase() : 'member';
      const body = { title, targetDate, level };
      if (userRole !== 'employee' && level === 'individual') {
        body.employeeId = employeeId;
      }

      await request('/goals', {
        method: 'POST',
        body
      });

      setSuccess('Goal objective created successfully!');
      setTitle('');
      setTargetDate('');
      
      const goalsData = await request('/goals');
      setGoals(goalsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgress = async (goalId) => {
    try {
      setUpdatingId(goalId);
      setError('');
      setSuccess('');

      await request(`/goals/${goalId}`, {
        method: 'PUT',
        body: { progress: updateVal }
      });

      setSuccess('Goal progress updated successfully.');
      setUpdatingId(null);
      
      const goalsData = await request('/goals');
      setGoals(goalsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update progress.');
      setUpdatingId(null);
    }
  };

  const userRole = currentUser?.role ? currentUser.role.toLowerCase() : 'member';
  const isEmployee = userRole === 'employee';

  const filteredGoals = goals.filter(g => {
    if (levelFilter === 'all') return true;
    return g.level === levelFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
          <Target className="text-indigo-400" size={32} /> Objectives & OKRs
        </h1>
        <p className="text-sm text-muted mt-1">Establish qualitative objectives, track completion progress, and view key results.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Create Goal Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="font-bold text-on-surface text-sm">Set New Objective</h3>
              <p className="text-[10px] text-muted mt-1">Assign goals at the company, department, or staff level.</p>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-muted font-bold uppercase">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Migrate database servers, Increase Q2 sales..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted font-bold uppercase">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted font-bold uppercase">Goal Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="company">Company</option>
                  <option value="department">Department</option>
                  <option value="individual">Individual</option>
                </select>
              </div>

              {!isEmployee && level === 'individual' && (
                <div className="space-y-1">
                  <label className="text-[10px] text-muted font-bold uppercase">Assign Employee</label>
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/10 transition flex items-center justify-center gap-1.5"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <span className="flex items-center gap-1.5"><Plus size={14} /> Set Objective</span>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Goals Listings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level Filters */}
          <div className="bg-background/40 border border-outline/80 rounded-xl p-1.5 flex gap-1 self-start inline-flex">
            {[
              { id: 'all', label: 'All Goals' },
              { id: 'company', label: 'Company' },
              { id: 'department', label: 'Department' },
              { id: 'individual', label: 'Individual' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLevelFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  levelFilter === tab.id ? 'bg-indigo-600 text-white' : 'text-muted hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Goals Feed */}
          <div className="bg-background/40 border border-outline/80 rounded-2xl p-6">
            <h3 className="font-bold text-on-surface text-base mb-6">Target Objectives Feed</h3>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-surface/40 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredGoals.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-outline rounded-2xl">
                <Target className="mx-auto text-on-surface-variant mb-3" size={36} />
                <h4 className="font-bold text-muted text-xs">No objectives assigned</h4>
                <p className="text-[10px] text-muted mt-1">Assign objectives to begin tracking key results.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGoals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className="p-5 bg-surface/40 border border-outline hover:border-outline rounded-xl space-y-4 transition relative"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-xs text-on-surface">{goal.title}</span>
                          <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-400 font-bold capitalize">
                            {goal.level}
                          </span>
                        </div>
                        {goal.employee && (
                          <span className="text-[10px] text-muted mt-1 block flex items-center gap-1">
                            <User size={12} /> Owner: {goal.employee.name}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted font-semibold">Deadline: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-muted font-semibold">
                        <span>Overall Progress</span>
                        <span className="text-on-surface font-bold">{goal.progress}% Complete</span>
                      </div>
                      <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-outline">
                        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${goal.progress}%` }} />
                      </div>
                    </div>

                    {/* Progress update controls */}
                    <div className="pt-2 border-t border-outline/60 flex items-center justify-between gap-4">
                      {updatingId === goal.id ? (
                        <div className="flex items-center gap-3 w-full">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={updateVal}
                            onChange={(e) => setUpdateVal(parseInt(e.target.value))}
                            className="w-full accent-indigo-500"
                          />
                          <span className="text-xs font-bold text-on-surface w-10 text-right">{updateVal}%</span>
                          <button
                            onClick={() => handleUpdateProgress(goal.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setUpdatingId(null)}
                            className="px-2.5 py-1 bg-surface-high hover:bg-surface-high text-muted text-[10px] rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setUpdatingId(goal.id);
                            setUpdateVal(goal.progress);
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition"
                        >
                          <Percent size={12} /> Update Progress &rarr;
                        </button>
                      )}
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
          Objectives align individuals with wider company key results. Track progress to provide dashboards with metrics for talent promotions and salary audits.
        </p>
      </div>
    </div>
  );
}
