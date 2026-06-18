'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  LogOut, 
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function EmployeeAttendance() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [activePunch, setActivePunch] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [punchLoading, setPunchLoading] = useState(false);
  const [workLocation, setWorkLocation] = useState('office'); // 'office' | 'remote'
  const [error, setError] = useState('');

  // Clock ticking effect
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await request('/attendance');
      setLogs(data);

      // Find if we have an active punch today (checkIn present, checkOut missing)
      const todayStr = new Date().toDateString();
      const active = data.find(log => new Date(log.date).toDateString() === todayStr && !log.checkOut);
      setActivePunch(active || null);
    } catch (err) {
      console.error('Failed to load attendance logs:', err);
      setError('Could not retrieve attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handlePunch = async () => {
    setPunchLoading(true);
    setError('');
    try {
      if (activePunch) {
        // Clock Out
        await request('/attendance/checkout', {
          method: 'POST'
        });
      } else {
        // Clock In
        await request('/attendance/checkin', {
          method: 'POST',
          body: { location: workLocation }
        });
      }
      // Reload logs
      await loadAttendance();
    } catch (err) {
      console.error('Failed to register punch action:', err);
      setError(err.message || 'Failed to complete clock punch action.');
    } finally {
      setPunchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-muted text-sm">Opening attendance console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-2">
          <Clock className="text-indigo-400" /> Time & Attendance Console
        </h1>
        <p className="text-muted text-sm mt-1">
          Record your daily check-in and check-out logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clock Punch Interface */}
        <div className="glass-panel border border-outline/80 rounded-2xl p-6 text-center space-y-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -z-10" />
          <div className="space-y-2 relative z-10">
            <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest">Digital Console Clock</h4>
            <div className="text-4xl font-black text-on-surface font-mono tracking-tight drop-shadow-[0_0_12px_rgba(99,102,241,0.25)]">{currentTime}</div>
            <div className="text-xs text-muted font-semibold mt-1">{currentDate}</div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2 justify-center relative z-10">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Punch Button */}
          <div className="flex justify-center py-4 relative z-10">
            <button
              onClick={handlePunch}
              disabled={punchLoading}
              className={`
                w-40 h-40 rounded-full flex flex-col items-center justify-center border-2 shadow-2xl transition-all duration-300 transform active:scale-95 disabled:opacity-50
                ${activePunch 
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/50 text-rose-450 hover:text-white shadow-rose-950/20 border-rose-500/40 glow-active' 
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/50 text-emerald-450 hover:text-white shadow-emerald-950/20 border-emerald-500/40 glow-active'}
              `}
              style={{
                boxShadow: activePunch 
                  ? '0 0 30px rgba(239, 68, 68, 0.15)' 
                  : '0 0 30px rgba(16, 185, 129, 0.15)'
              }}
            >
              {punchLoading ? (
                <Loader2 className="animate-spin" size={36} />
              ) : activePunch ? (
                <>
                  <LogOut size={36} className="text-rose-400 animate-pulse" />
                  <span className="font-extrabold text-sm mt-3 tracking-wide text-rose-400">Clock Out</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={36} className="text-emerald-400 animate-pulse" />
                  <span className="font-extrabold text-sm mt-3 tracking-wide text-emerald-400">Clock In</span>
                </>
              )}
            </button>
          </div>

          {/* Location Choice (Only show when checking in) */}
          {!activePunch && (
            <div className="space-y-3 relative z-10">
              <label className="text-xs font-bold text-muted flex items-center gap-1.5 justify-center uppercase tracking-wider">
                <MapPin size={14} className="text-indigo-400" /> Work Location
              </label>
              <div className="flex gap-2 justify-center bg-surface/60 p-1.5 rounded-xl border border-outline max-w-[200px] mx-auto">
                <button
                  onClick={() => setWorkLocation('office')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${workLocation === 'office' ? 'bg-indigo-650 bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-muted hover:text-on-surface'}`}
                >
                  Office
                </button>
                <button
                  onClick={() => setWorkLocation('remote')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${workLocation === 'remote' ? 'bg-indigo-650 bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-muted hover:text-on-surface'}`}
                >
                  Remote
                </button>
              </div>
            </div>
          )}

          {/* Checked in summary */}
          {activePunch && (
            <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-400 font-medium relative z-10">
              Active Session: Checked in today at {new Date(activePunch.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({activePunch.location})
            </div>
          )}
        </div>

        {/* Punch logs */}
        <div className="lg:col-span-2 glass-panel border border-outline/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-outline/60 pb-3">
              <Calendar className="text-indigo-400" size={18} />
              <h3 className="font-bold text-lg text-on-surface">Punch Logs History</h3>
            </div>

            {logs.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {logs.map((log) => {
                  const checkInTime = new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const checkOutTime = log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending';
                  const dateStr = new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  
                  return (
                    <div key={log.id} className="p-4 rounded-xl bg-surface/40 border border-outline hover:border-outline/80 transition-colors flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-on-surface">{dateStr}</p>
                        <p className="text-[10px] text-muted mt-1 uppercase font-bold flex items-center gap-1.5">
                          <MapPin size={12} className="text-indigo-400/85" /> {log.location}
                        </p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-right">
                          <p className="text-xs text-muted"><span className="font-semibold text-emerald-400">In:</span> <span className="font-mono">{checkInTime}</span></p>
                          <p className="text-xs text-muted mt-0.5"><span className="font-semibold text-rose-400">Out:</span> <span className="font-mono">{checkOutTime}</span></p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-outline/80 rounded-2xl">
                <Clock size={40} className="text-on-surface-variant mx-auto mb-3" />
                <p className="text-muted text-sm font-semibold">No check-in logs found</p>
                <p className="text-muted text-xs mt-1">Clock in using the digital check-in console.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
