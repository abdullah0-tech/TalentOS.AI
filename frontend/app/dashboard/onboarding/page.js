'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react';

export default function OnboardingPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOnboardingTasks();
  }, []);

  const fetchOnboardingTasks = async () => {
    try {
      const data = await request('/onboarding');
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve onboarding tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, currentStatus) => {
    const nextStatusMap = {
      'pending': 'in_progress',
      'in_progress': 'completed',
      'completed': 'pending'
    };
    const newStatus = nextStatusMap[currentStatus] || 'pending';
    
    setUpdatingId(taskId);
    try {
      await request(`/onboarding/${taskId}`, {
        method: 'PUT',
        body: { status: newStatus }
      });
      
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error(err);
      setError('Failed to update task status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Completed</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-1"><Clock size={12} /> In Progress</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold text-muted bg-surface-high border border-outline rounded-full flex items-center gap-1"><AlertCircle size={12} /> Pending</span>;
    }
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressRatio = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
            <ClipboardCheck className="text-indigo-400" size={32} /> Onboarding Workflows
          </h1>
          <p className="text-sm text-muted mt-1">Track and complete onboarding checklists for your integration program.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Progress tracker widget */}
      {tasks.length > 0 && (
        <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-muted">
            <span>Overall Onboarding Completion Progress</span>
            <span className="text-on-surface font-bold text-sm">{progressRatio}% ({completedCount}/{tasks.length} Tasks)</span>
          </div>
          <div className="w-full h-3 bg-surface rounded-full overflow-hidden border border-outline">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progressRatio}%` }} />
          </div>
        </div>
      )}

      {/* Tasks listing */}
      <div className="bg-background/40 border border-outline/80 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-on-surface mb-6">Onboarding Tasks Checklist</h3>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-surface/40 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-outline rounded-2xl">
            <ClipboardCheck className="mx-auto text-slate-650 mb-3 animate-bounce" size={40} />
            <h4 className="font-bold text-on-surface text-base">No Tasks Assigned</h4>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto leading-relaxed">
              When a new candidate is onboarded, their checklist tasks are automatically assigned by automation rules.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="p-4 bg-surface/40 border border-outline hover:border-outline rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleStatusUpdate(task.id, task.status)}
                    disabled={updatingId === task.id}
                    className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition shrink-0 ${
                      task.status === 'completed' 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'border-outline hover:border-slate-500 bg-background'
                    }`}
                  >
                    {task.status === 'completed' && '✓'}
                  </button>
                  <div>
                    <h4 className={`font-semibold text-xs leading-normal ${task.status === 'completed' ? 'text-muted line-through' : 'text-on-surface'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] text-muted mt-1.5 font-semibold">
                      <span className="flex items-center gap-1"><User size={12} className="text-on-surface-variant" /> Assigned to: {task.employee?.name}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><Calendar size={12} className="text-on-surface-variant" /> Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {getStatusBadge(task.status)}
                  <button
                    onClick={() => handleStatusUpdate(task.id, task.status)}
                    disabled={updatingId === task.id}
                    className="p-1 hover:bg-surface-high text-muted hover:text-on-surface rounded-lg transition"
                    title="Change Status"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-surface/60 border border-outline rounded-xl text-[10px] text-muted flex items-start gap-2 max-w-2xl">
        <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Employees can mark onboarding items as Completed directly. Supervisors can check this panel to monitor progress. Once all tasks are completed, the employee's onboarding progress displays 100%.
        </p>
      </div>
    </div>
  );
}
