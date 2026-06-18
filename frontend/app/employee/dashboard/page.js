'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { authService } from '../../../services/auth.service';
import { 
  Calendar, 
  Clock, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  CalendarDays, 
  CheckCircle,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendanceRate: '0%',
    leavesTaken: 0,
    leavesPending: 0,
    coursesCompleted: 0
  });
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [recentPayrolls, setRecentPayrolls] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([
    { name: 'Independence Day', date: 'July 4, 2026', type: 'National' },
    { name: 'Labor Day', date: 'September 7, 2026', type: 'National' },
    { name: 'Thanksgiving', date: 'November 26, 2026', type: 'Company' },
    { name: 'Christmas Day', date: 'December 25, 2026', type: 'National' }
  ]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch leaves
        const leaves = await request('/leave');
        const pending = leaves.filter(l => l.status === 'pending').length;
        const approved = leaves.filter(l => l.status === 'approved').length;

        // Fetch attendance
        const logs = await request('/attendance');
        const checkInsThisMonth = logs.length;
        // Mocking attendance rate out of 20 working days
        const attRate = checkInsThisMonth > 0 ? Math.min(100, Math.round((checkInsThisMonth / 20) * 100)) + '%' : '0%';

        // Check if checked in today
        const todayStr = new Date().toDateString();
        const checkedInToday = logs.find(log => new Date(log.date).toDateString() === todayStr);
        setAttendanceToday(checkedInToday || null);

        // Fetch courses/training
        let coursesDone = 0;
        try {
          const enrollments = await request('/training/enrollments');
          coursesDone = enrollments.filter(e => e.completed).length;
        } catch (e) {
          console.log('LMS load skipped or error:', e.message);
        }

        setStats({
          attendanceRate: attRate,
          leavesTaken: approved,
          leavesPending: pending,
          coursesCompleted: coursesDone
        });

        // Fetch payroll
        try {
          const payrollHistory = await request('/payroll/history');
          setRecentPayrolls(payrollHistory.slice(0, 3));
        } catch (e) {
          console.log('Payroll load error:', e.message);
        }

      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-muted text-sm">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Punch Status */}
      <div className="relative overflow-hidden glass-panel bg-grid-pattern border border-outline/80 rounded-3xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
              Hello, <span className="text-gradient">{currentUser?.name || 'Team Member'}</span>!
            </h1>
            <p className="text-muted text-sm mt-2 font-medium">
              Welcome back. Here is your overview for today.
            </p>
          </div>
          
          <div className={`flex items-center gap-4 bg-background/60 border px-5 py-3.5 rounded-2xl transition-all duration-300 ${attendanceToday ? 'border-emerald-500/30 glow-active' : 'border-outline'}`}>
            <div className={`w-3.5 h-3.5 rounded-full ${attendanceToday ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
            <div className="text-xs">
              <p className="text-muted font-bold uppercase tracking-wider">Punch Status</p>
              <p className="text-on-surface font-black mt-1">
                {attendanceToday ? `Clocked In at ${new Date(attendanceToday.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not Checked In'}
              </p>
            </div>
            <Link 
              href="/employee/attendance" 
              className="ml-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20"
            >
              Console <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="card-ai shimmer-card p-6">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock size={20} />
            </div>
            <span className="neon-badge-tertiary flex items-center gap-1">
              <TrendingUp size={10} /> Active
            </span>
          </div>
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mt-5">Attendance Rate</h4>
          <p className="text-3xl font-black text-on-surface mt-1.5">{stats.attendanceRate}</p>
        </div>

        {/* Card 2 */}
        <div className="card-ai shimmer-card p-6">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/25">
              <CalendarDays size={20} />
            </div>
            <span className="neon-badge-primary">
              Approved
            </span>
          </div>
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mt-5">Leaves Approved</h4>
          <p className="text-3xl font-black text-on-surface mt-1.5">{stats.leavesTaken} Days</p>
        </div>

        {/* Card 3 */}
        <div className="card-ai shimmer-card p-6">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/25">
              <AlertCircle size={20} />
            </div>
            <span className="neon-badge-secondary">
              Pending
            </span>
          </div>
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mt-5">Pending Requests</h4>
          <p className="text-3xl font-black text-on-surface mt-1.5">{stats.leavesPending} Requests</p>
        </div>

        {/* Card 4 */}
        <div className="card-ai shimmer-card p-6">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <FileCheck size={20} />
            </div>
            <span className="neon-badge-tertiary">
              LMS
            </span>
          </div>
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mt-5">Completed Training</h4>
          <p className="text-3xl font-black text-on-surface mt-1.5">{stats.coursesCompleted} Courses</p>
        </div>
      </div>

      {/* Mid Section Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Holidays & Upcoming Events */}
        <div className="lg:col-span-2 glass-panel border border-outline/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-outline/60 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-indigo-400" size={18} />
                <h3 className="font-bold text-lg text-on-surface">Upcoming Company Holidays</h3>
              </div>
            </div>
            <div className="space-y-4">
              {upcomingHolidays.map((holiday, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-surface/40 border border-outline/60 hover:border-outline transition-colors">
                  <div>
                    <h5 className="font-bold text-sm text-on-surface">{holiday.name}</h5>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mt-0.5">{holiday.type} Holiday</p>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">{holiday.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payslips & Payroll card */}
        <div className="glass-panel border border-outline/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-outline/60 pb-3">
              <FileText className="text-indigo-400" size={18} />
              <h3 className="font-bold text-lg text-on-surface">Recent Payslips</h3>
            </div>

            {recentPayrolls.length > 0 ? (
              <div className="space-y-4">
                {recentPayrolls.map((payroll) => (
                  <div key={payroll.id} className="p-3.5 rounded-xl bg-surface/40 border border-outline/60 flex justify-between items-center hover:border-outline transition-colors">
                    <div>
                      <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">{payroll.cycle}</p>
                      <p className="text-sm font-bold text-on-surface mt-1">${payroll.netPay.toFixed(2)}</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      {payroll.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={36} className="text-slate-655 text-slate-700 mx-auto mb-2" />
                <p className="text-muted text-sm font-medium">No payslips issued yet</p>
                <p className="text-muted text-xs mt-1">Check back when payroll is calculated.</p>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-outline/60 mt-6">
            <Link 
              href="/employee/documents" 
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center justify-center gap-1 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 py-2 rounded-xl"
            >
              Access Document Vault <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
