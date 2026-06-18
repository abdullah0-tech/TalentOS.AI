'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { request } from '../../../services/api';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  User, 
  Plus, 
  Loader2, 
  X, 
  AlertCircle, 
  CheckCircle,
  Briefcase,
  Layers
} from 'lucide-react';

export default function InterviewsPage() {
  const searchParams = useSearchParams();
  const prefillCandidateName = searchParams.get('candidate');

  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    candidateId: '',
    interviewerId: '',
    date: '',
    meetingLink: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayInterviews, setSelectedDayInterviews] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [interviewsData, candidatesData, usersData] = await Promise.all([
        request('/interviews'),
        request('/applications'),
        request('/auth/users')
      ]);

      setInterviews(interviewsData);
      setCandidates(candidatesData);
      setUsers(usersData);

      // Handle candidate prefilling from query param
      if (prefillCandidateName) {
        const found = candidatesData.find(
          c => c.candidateName.toLowerCase() === prefillCandidateName.toLowerCase()
        );
        if (found) {
          setFormData(prev => ({ ...prev, candidateId: found.id }));
          setModalOpen(true);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not load scheduling data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInterview = async (e) => {
    e.preventDefault();
    if (!formData.candidateId || !formData.interviewerId || !formData.date) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const newInterview = await request('/interviews', {
        method: 'POST',
        body: formData
      });

      setSuccess('Interview scheduled successfully!');
      setFormData({ candidateId: '', interviewerId: '', date: '', meetingLink: '' });
      
      // Reload interviews lists
      const interviewsData = await request('/interviews');
      setInterviews(interviewsData);

      setTimeout(() => {
        setModalOpen(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to schedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dayNum) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    const dayInterviews = interviews.filter(int => {
      const intDate = new Date(int.date);
      return intDate.getDate() === dayNum && 
             intDate.getMonth() === currentDate.getMonth() && 
             intDate.getFullYear() === currentDate.getFullYear();
    });
    setSelectedDayInterviews(dayInterviews);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  // Calculate calendar cells
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const yearName = currentDate.getFullYear();

  const cells = [];
  // Empty slots for previous month offset
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(<div key={`empty-${i}`} className="h-24 bg-surface/10 border border-outline opacity-20" />);
  }

  // Actual day slots
  for (let day = 1; day <= daysInMonth; day++) {
    // Find interviews on this day
    const dayInterviews = interviews.filter(int => {
      const d = new Date(int.date);
      return d.getDate() === day && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });

    const isToday = new Date().getDate() === day && 
                    new Date().getMonth() === currentDate.getMonth() && 
                    new Date().getFullYear() === currentDate.getFullYear();

    cells.push(
      <div 
        key={`day-${day}`} 
        onClick={() => handleDayClick(day)}
        className={`h-24 bg-surface border border-outline p-2 hover:bg-surface-high/40 transition cursor-pointer flex flex-col justify-between items-start ${
          isToday ? 'border-indigo-500/80 bg-indigo-500/5' : ''
        }`}
      >
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
          isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-muted'
        }`}>
          {day}
        </span>
        
        {/* Bullet indicators of interviews */}
        {dayInterviews.length > 0 && (
          <div className="w-full space-y-1">
            {dayInterviews.slice(0, 2).map((int) => (
              <div 
                key={int.id} 
                className="text-[9px] font-semibold text-indigo-300 truncate bg-indigo-500/10 px-1 py-0.5 rounded border border-indigo-500/15"
                title={`${int.candidate?.candidateName} with ${int.interviewer?.name}`}
              >
                {int.candidate?.candidateName}
              </div>
            ))}
            {dayInterviews.length > 2 && (
              <div className="text-[8px] text-muted font-bold pl-1">
                + {dayInterviews.length - 2} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Interview Scheduler</h1>
          <p className="text-sm text-muted mt-1">Coordinate candidate reviews and calendar slots for your hiring team.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:translate-y-[-1px] self-start"
        >
          <Plus size={16} /> Schedule Call
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Grid calendar + detail split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Monthly Calendar */}
        <div className="lg:col-span-2 bg-surface-high/20 border border-outline p-6 rounded-3xl space-y-6">
          {/* Month controller */}
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-on-surface text-lg tracking-tight">
              {monthName} <span className="text-indigo-400">{yearName}</span>
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-outline bg-surface text-muted hover:text-on-surface hover:bg-surface-high transition"
              >
                ◀
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-outline bg-surface text-muted hover:text-on-surface hover:bg-surface-high transition"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Calendar grid headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-muted border-b border-outline pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells}
          </div>
        </div>

        {/* Right Col: Selected Day Interviews list */}
        <div className="bg-surface-high/20 border border-outline p-6 rounded-3xl flex flex-col justify-between min-h-[450px]">
          <div>
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider mb-4 border-b border-outline pb-2">
              Selected Day Interviews
            </h3>
            
            <div className="space-y-4">
              {selectedDayInterviews.length === 0 ? (
                <div className="py-16 text-center text-muted text-xs">
                  <CalendarIcon className="mx-auto text-on-surface-variant mb-2" size={32} />
                  Click a calendar day containing slots to inspect interviews details.
                </div>
              ) : (
                selectedDayInterviews.map((int) => (
                  <div key={int.id} className="p-4 bg-background border border-outline rounded-xl space-y-3">
                    <div>
                      <p className="font-bold text-on-surface text-sm truncate">{int.candidate?.candidateName}</p>
                      <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                        <Briefcase size={10} /> {int.candidate?.job?.title || 'Applied Position'}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-on-surface-variant border-t border-outline pt-2">
                      <p className="flex items-center gap-1.5">
                        <User size={12} className="text-indigo-400" /> Host: {int.interviewer?.name}
                      </p>
                      <p className="flex items-center gap-1.5 mt-1">
                        <Clock size={12} className="text-violet-400" /> {new Date(int.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {int.meetingLink && (
                      <a
                        href={int.meetingLink.startsWith('http') ? int.meetingLink : `https://${int.meetingLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        <Video size={14} /> Join Meeting Room
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="text-[10px] text-muted leading-normal text-center mt-4">
            Recruiter and candidate calendars will sync automatically.
          </div>
        </div>
      </div>

      {/* RENDER SCHEDULING MODAL POPUP */}
      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-surface border border-outline rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-muted hover:text-on-surface rounded-lg hover:bg-surface-high"
            >
              ✕
            </button>

            <h3 className="font-extrabold text-on-surface text-xl tracking-tight mb-2">Schedule Interview</h3>
            <p className="text-xs text-muted mb-6">Create a calendar invitation and meeting room for screening candidate.</p>

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleCreateInterview} className="space-y-4">
              {/* Select Candidate */}
              <div className="space-y-1">
                <label className="text-[10px] text-muted font-semibold uppercase">Candidate Profile</label>
                <select
                  value={formData.candidateId}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidateId: e.target.value }))}
                  required
                  disabled={!!prefillCandidateName}
                  className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Candidate</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>{c.candidateName} - {c.job?.title}</option>
                  ))}
                </select>
              </div>

              {/* Select Interviewer */}
              <div className="space-y-1">
                <label className="text-[10px] text-muted font-semibold uppercase">Interviewer (Host)</label>
                <select
                  value={formData.interviewerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, interviewerId: e.target.value }))}
                  required
                  className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Interviewer</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              {/* Input Date/Time */}
              <div className="space-y-1">
                <label className="text-[10px] text-muted font-semibold uppercase">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Meeting link */}
              <div className="space-y-1">
                <label className="text-[10px] text-muted font-semibold uppercase">Video Meeting URL (Google Meet / Zoom)</label>
                <input
                  type="text"
                  placeholder="meet.google.com/abc-defg-hij"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Save Invitation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
