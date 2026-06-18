'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { authService } from '../../../services/auth.service';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  User,
  Coffee,
  Info,
  Laptop
} from 'lucide-react';

export default function AttendancePage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [location, setLocation] = useState('office');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Tab for admins
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my_punches'

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchAttendanceLogs();
  }, []);

  const fetchAttendanceLogs = async () => {
    try {
      setLoading(true);
      const data = await request('/attendance');
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const res = await request('/attendance/checkin', {
        method: 'POST',
        body: { location }
      });

      setSuccess('Clocked in successfully!');
      fetchAttendanceLogs();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to clock in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const res = await request('/attendance/checkout', {
        method: 'POST'
      });

      setSuccess('Clocked out successfully!');
      fetchAttendanceLogs();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to clock out.');
    } finally {
      setSubmitting(false);
    }
  };

  const userRole = currentUser?.role ? currentUser.role.toLowerCase() : 'member';
  const isEmployee = userRole === 'employee';

  // Check if user is currently clocked in today
  const myLogs = logs.filter(l => isEmployee || l.employee?.email === currentUser?.email);
  const activeSession = myLogs.find(l => {
    const checkInDate = new Date(l.checkIn);
    const today = new Date();
    return checkInDate.toDateString() === today.toDateString() && !l.checkOut;
  });

  // Calculate statistics for display (Self or team logs)
  const statsLogs = isEmployee ? myLogs : logs;
  const latePunches = statsLogs.filter(l => {
    const checkTime = new Date(l.checkIn);
    // Standard late time: 9:30 AM
    return checkTime.getHours() > 9 || (checkTime.getHours() === 9 && checkTime.getMinutes() > 30);
  }).length;

  const remoteCount = statsLogs.filter(l => l.location === 'remote').length;
  const officeCount = statsLogs.filter(l => l.location === 'office').length;

  const filteredLogs = logs.filter(l => {
    if (isEmployee) return true;
    if (activeTab === 'my_punches') return l.employee?.email === currentUser?.email;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
          <Clock className="text-primary" size={32} /> Time & Attendance
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">Clock check-in, review monthly timesheets, and log workspace parameters.</p>
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

      {/* Grid UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Punch controls and stats */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Punch Card Clock */}
          <div className="bg-surface border border-outline rounded-2xl p-6 text-center space-y-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
            
            <div className="space-y-1">
              <h3 className="font-bold text-on-surface text-base">Punch Station</h3>
              <p className="text-[10px] text-on-surface-variant">Record your work start and stop times.</p>
            </div>

            <div className="py-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-surface-high border-2 border-outline flex items-center justify-center shadow-inner relative">
                <Clock className={`text-primary ${activeSession ? 'animate-pulse' : ''}`} size={40} />
                {activeSession && (
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
                )}
              </div>
              <div className="mt-4 space-y-1">
                <span className="text-xs text-on-surface-variant font-semibold block">Current Session Status</span>
                <span className={`text-xs font-bold ${activeSession ? 'text-emerald-600' : 'text-on-surface-variant'}`}>
                  {activeSession ? 'Active Session (Clocked In)' : 'Not Clocked In'}
                </span>
              </div>
            </div>

            {/* Checkin Options */}
            {!activeSession ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLocation('office')}
                    className={`py-2 px-3 border rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 ${
                      location === 'office'
                        ? 'bg-primary-light border-primary text-primary'
                        : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-high'
                    }`}
                  >
                    <MapPin size={14} /> Office
                  </button>
                  <button
                    onClick={() => setLocation('remote')}
                    className={`py-2 px-3 border rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 ${
                      location === 'remote'
                        ? 'bg-primary-light border-primary text-primary'
                        : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-high'
                    }`}
                  >
                    <Laptop size={14} /> Remote
                  </button>
                </div>

                <button
                  onClick={handleCheckIn}
                  disabled={submitting}
                  className="w-full py-3 bg-primary hover:bg-primary/95 font-bold text-xs text-white rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Clock In Now'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleCheckOut}
                disabled={submitting}
                className="w-full py-3 bg-error hover:bg-error/95 font-bold text-xs text-white rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Clock Out Session'}
              </button>
            )}
          </div>

          {/* Stats Summary Panel */}
          <div className="bg-surface border border-outline rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-on-surface text-sm">Attendance Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-outline">
                <span className="text-xs text-on-surface-variant">Late Arrivals (&gt;9:30 AM)</span>
                <span className={`text-xs font-bold ${latePunches > 0 ? 'text-warning' : 'text-on-surface'}`}>{latePunches} days</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline">
                <span className="text-xs text-on-surface-variant">Office Checkins</span>
                <span className="text-xs font-bold text-primary">{officeCount} times</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-on-surface-variant">Remote Checkins</span>
                <span className="text-xs font-bold text-secondary">{remoteCount} times</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timesheet feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Admin Tabs */}
          {!isEmployee && (
            <div className="bg-surface-highest border border-outline rounded-xl p-1 flex gap-1 self-start inline-flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'all' ? 'bg-surface text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Timesheets
              </button>
              <button
                onClick={() => setActiveTab('my_punches')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'my_punches' ? 'bg-surface text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                My Punches
              </button>
            </div>
          )}

          <div className="bg-surface border border-outline rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-on-surface text-base mb-6">Historical Timesheet Logs</h3>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-surface-highest rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-outline rounded-2xl">
                <Calendar className="mx-auto text-muted mb-3" size={36} />
                <h4 className="font-bold text-on-surface-variant text-xs">No attendance timesheets logged</h4>
                <p className="text-[10px] text-muted mt-1">Clock punches will generate daily records.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-outline text-on-surface-variant font-bold">
                      <th className="py-2.5">Staff Name</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Location</th>
                      <th className="py-2.5">Clock In</th>
                      <th className="py-2.5">Clock Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const checkInTime = new Date(log.checkIn);
                      const isLate = checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30);
                      
                      return (
                        <tr key={log.id} className="border-b border-outline/50 text-on-surface-variant font-medium hover:bg-surface-high/50 transition">
                          <td className="py-3.5 font-bold text-on-surface flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-[10px] uppercase border border-blue-200">
                              {log.employee?.name?.charAt(0) || 'U'}
                            </div>
                            <span>{log.employee?.name}</span>
                          </td>
                          <td className="py-3.5">{new Date(log.date).toLocaleDateString([], { dateStyle: 'medium' })}</td>
                          <td className="py-3.5 capitalize">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              log.location === 'office' 
                                ? 'bg-primary-light text-primary border-blue-100' 
                                : 'bg-surface-highest text-on-surface-variant border-outline'
                            }`}>
                              {log.location}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="font-bold text-success block">
                              {checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isLate && (
                              <span className="text-[9px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1 py-0.2 rounded mt-0.5 inline-block">
                                Late Arrival
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 font-semibold text-on-surface">
                            {log.checkOut 
                              ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                              : <span className="text-primary font-medium italic animate-pulse">On clock</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="p-4 bg-primary-light border border-blue-100 rounded-xl text-[10px] text-white-variant flex items-start gap-2 max-w-2xl">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Daily punches should occur when logging in for the day and logging out. The late arrival threshold is set to 9:30 AM by standard company HR policy. Late arrivals flag red on timesheet metrics.
        </p>
      </div>
    </div>
  );
}
