'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { request } from '../../services/api';
import { authService } from '../../services/auth.service';
import { 
  Briefcase, Users, Cpu, ArrowUpRight, Plus, Calendar, AlertCircle, 
  TrendingUp, UserCheck, Zap, Activity, Video, Sparkles, Clock, 
  CalendarDays, TrendingDown, Award, Link2, CheckCircle, Play, 
  RotateCw, ArrowRight, ShieldCheck, Mail, Phone, ChevronRight, FileText, Gift, Cake,
  Database
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { MessageSquare } from 'lucide-react';
import { SkeletonCard, SkeletonChart, SkeletonTable } from '../../components/Skeletons';

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Progressive loading states for dashboard sections
  const [metricsLoaded, setMetricsLoaded] = useState(false);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [tablesLoaded, setTablesLoaded] = useState(false);
  
  // Database Query Ticker State
  const [tickerMessage, setTickerMessage] = useState("Loading employee metrics...");
  const [showTicker, setShowTicker] = useState(true);
  
  // Connection states for Stripe, Zapier, Shopify, Stitch Core
  const [connections, setConnections] = useState({
    stripe: true,
    zapier: false,
    shopify: true,
    stitch: true
  });

  const [toastMsg, setToastMsg] = useState(null);

  // Email Automation Demo Sandbox States
  const [demoStep, setDemoStep] = useState(0);
  const [demoLogs, setDemoLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedLogTab, setSelectedLogTab] = useState('log'); // 'log' or 'template'
  
  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setDemoLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  const handleRunDemoStep = async (step) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setDemoStep(step);
    
    if (step === 1) {
      addLog("➔ Event: Candidate Applied (Sarah Jenkins - Senior Full-Stack Engineer)");
      await new Promise(r => setTimeout(r, 600));
      addLog("⚙ Processing trigger rules: 'WHEN candidate_applied'...");
      await new Promise(r => setTimeout(r, 500));
      addLog("✉ Gmail API: Generating Candidate Applied Email template...");
      await new Promise(r => setTimeout(r, 700));
      addLog("✓ SUCCESS: Email delivered to sarah.j@example.com (Status: Sent)");
      setToastMsg("Gmail API: Application acknowledgement sent to Sarah Jenkins!");
    } else if (step === 2) {
      addLog("➔ Event: Candidate Shortlisted (Sarah Jenkins - AI Fit Grade: 92%)");
      await new Promise(r => setTimeout(r, 600));
      addLog("⚙ Processing trigger rules: 'WHEN candidate_shortlisted'...");
      await new Promise(r => setTimeout(r, 500));
      addLog("✉ Gmail API: Generating Shortlist & Assessment Email template...");
      await new Promise(r => setTimeout(r, 700));
      addLog("✓ SUCCESS: Email delivered to sarah.j@example.com (Status: Sent)");
      setToastMsg("Gmail API: Shortlist assessment email sent to Sarah Jenkins!");
    } else if (step === 3) {
      addLog("➔ Event: Interview Scheduled (Sarah Jenkins - Panel Round)");
      await new Promise(r => setTimeout(r, 400));
      addLog("🗓 Google Calendar Sync: Creating event 'Sarah Jenkins Interview'...");
      await new Promise(r => setTimeout(r, 600));
      addLog("📹 Google Meet: Generated Meeting Link: meet.google.com/hrc-tfmd-xyz");
      await new Promise(r => setTimeout(r, 500));
      addLog("✉ Gmail API: Generating Interview Confirmation Email template...");
      await new Promise(r => setTimeout(r, 700));
      addLog("✓ SUCCESS: Email delivered to candidate and panel team (Status: Sent)");
      setToastMsg("Google Meet & Calendar: Interview Scheduled + Meet Link Sent!");
    } else if (step === 4) {
      addLog("➔ Event: Candidate Hired (Sarah Jenkins - Offer Approved)");
      await new Promise(r => setTimeout(r, 500));
      addLog("👤 Stitch Core: Converting candidate to Employee Profile...");
      await new Promise(r => setTimeout(r, 600));
      addLog("🔑 Security: Creating workspace account sarah.jenkins@stitchlabs.com");
      await new Promise(r => setTimeout(r, 500));
      addLog("✉ Gmail API: Generating Welcome & Portal Credentials Email template...");
      await new Promise(r => setTimeout(r, 700));
      addLog("✓ SUCCESS: Email delivered to employee (Status: Sent)");
      setToastMsg("Stitch Core: Employee account initialized & welcome email sent!");
    }
    
    setIsSimulating(false);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRunFullPipeline = async () => {
    if (isSimulating) return;
    setDemoLogs([]);
    addLog("⚡ Initializing End-to-End Automation Pipeline Demo...");
    await new Promise(r => setTimeout(r, 1000));
    
    await handleRunDemoStep(1);
    await new Promise(r => setTimeout(r, 1800));
    if (isSimulating) return; // check in case of interruptions
    
    await handleRunDemoStep(2);
    await new Promise(r => setTimeout(r, 1800));
    
    await handleRunDemoStep(3);
    await new Promise(r => setTimeout(r, 1800));
    
    await handleRunDemoStep(4);
    addLog("🎉 End-to-End Automation Pipeline Demo Completed successfully!");
  };

  const handleResetDemo = () => {
    setDemoStep(0);
    setDemoLogs([]);
    setToastMsg("Demo simulation sandbox reset.");
    setTimeout(() => setToastMsg(null), 2000);
  };

  // Mock Email Template Definitions for Demo Display
  const getMockEmailTemplate = () => {
    switch (demoStep) {
      case 1:
        return {
          to: 'sarah.j@example.com',
          subject: "Application Received: Senior Full-Stack Engineer - Stitch Labs",
          body: `Dear Sarah Jenkins,

Thank you for applying for the Senior Full-Stack Engineer position at Stitch Labs. We have received your application and our recruiting team is currently reviewing your background and qualifications.

You will receive an update as soon as we finish screening the first cohort.

Best regards,
The TalentOS Recruiting Engine`
        };
      case 2:
        return {
          to: 'sarah.j@example.com',
          subject: "Coding Challenge Invitation - Stitch Labs",
          body: `Dear Sarah Jenkins,

Congratulations! Your profile has been shortlisted for the Senior Full-Stack Engineer position (Graded: 92% match).

The next stage of our evaluation is a 60-minute technical assessment designed to gauge your coding skills. Please use the link below to access your sandbox challenge:

Assessment Link: https://talentos.ai/challenge/stch-8472-sjenk

Best of luck!
TalentOS Automation Systems`
        };
      case 3:
        return {
          to: 'sarah.j@example.com',
          subject: "Interview Scheduled: Panel Evaluation - Stitch Labs",
          body: `Hi Sarah Jenkins,

Your technical interview is confirmed for tomorrow, June 17 at 10:00 AM EST.

Details:
- Role: Senior Full-Stack Engineer
- Duration: 45 minutes
- Interviewer: Abdullah (HR Manager)
- Video Room (Google Meet): https://meet.google.com/hrc-tfmd-xyz

A Google Calendar invite has been added to your inbox. Please let us know if you need to reschedule.

Best regards,
Stitch Labs Scheduling`
        };
      case 4:
        return {
          to: 'sarah.jenkins@stitchlabs.com',
          subject: "Welcome to Stitch Labs! Your account is ready",
          body: `Welcome to Stitch Labs, Sarah!

We are thrilled to officially welcome you as our Senior Full-Stack Engineer. Your employee profile has been created and your work tools have been provisioned.

Account Details:
- Workspace Email: sarah.jenkins@stitchlabs.com
- Temporary Password: [sent via SMS / MFA]
- Onboarding Portal: https://talentos.ai/onboard/stitch-labs

Please login to set up your MFA profile and review your onboarding checklist.

Cheers,
Stitch Labs HR Operations`
        };
      default:
        return {
          to: 'N/A',
          subject: 'No step selected',
          body: 'Click one of the steps above or "Play Pipeline" to generate and preview automated email templates in real-time.'
        };
    }
  };

  const emailPreview = getMockEmailTemplate();

  const [leavesList, setLeavesList] = useState([]);
  const [celebrations, setCelebrations] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getDurationDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const formatDates = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const options = { month: 'short', day: 'numeric' };
    if (s.getMonth() === e.getMonth() && s.getDate() === e.getDate()) {
      return s.toLocaleDateString('en-US', options);
    }
    return `${s.toLocaleDateString('en-US', options)} - ${e.toLocaleDateString('en-US', options)}`;
  };

  const getUpcomingCelebrations = (employees) => {
    const today = new Date();
    const list = [];
    
    employees.forEach(emp => {
      if (!emp.joinedAt) return;
      const joinDate = new Date(emp.joinedAt);
      
      const anniversaryThisYear = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());
      const diffTimeThisYear = anniversaryThisYear - today;
      const diffDaysThisYear = Math.ceil(diffTimeThisYear / (1000 * 60 * 60 * 24));
      
      const anniversaryNextYear = new Date(today.getFullYear() + 1, joinDate.getMonth(), joinDate.getDate());
      const diffTimeNextYear = anniversaryNextYear - today;
      const diffDaysNextYear = Math.ceil(diffTimeNextYear / (1000 * 60 * 60 * 24));
      
      let targetDiff = -1;
      let targetAnniversary = null;
      
      if (diffDaysThisYear >= 0 && diffDaysThisYear <= 7) {
        targetDiff = diffDaysThisYear;
        targetAnniversary = anniversaryThisYear;
      } else if (diffDaysNextYear >= 0 && diffDaysNextYear <= 7) {
        targetDiff = diffDaysNextYear;
        targetAnniversary = anniversaryNextYear;
      }
      
      if (targetAnniversary) {
        const years = targetAnniversary.getFullYear() - joinDate.getFullYear();
        if (years > 0) {
          list.push({
            id: emp.id,
            name: emp.name,
            dept: emp.department,
            type: 'anniversary',
            years,
            dateStr: targetAnniversary.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            diffDays: targetDiff
          });
        }
      }
    });
    
    return list.sort((a, b) => a.diffDays - b.diffDays);
  };

  // Database Ticker Message Rotator
  useEffect(() => {
    if (!loading) {
      setTickerMessage("✓ Workspace database synchronized successfully");
      const t = setTimeout(() => setShowTicker(false), 2000);
      return () => clearTimeout(t);
    }

    const messages = [
      "Loading employee metrics...",
      "Fetching hiring pipeline...",
      "Analyzing workforce trends...",
      "Building executive dashboard...",
      "Synchronizing attendance records..."
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setTickerMessage(messages[idx]);
    }, 1500);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());

    async function loadDashboardData() {
      try {
        const res = await request('/analytics');
        setData(res);

        // Fetch leaves
        const leavesRes = await request('/leave');
        const pendingLeaves = leavesRes.filter(l => l.status === 'pending');
        
        if (res.demoMode && pendingLeaves.length === 0) {
          setLeavesList([
            { id: 'mock-leave-1', employee: { name: 'David Jones', department: 'Engineering' }, leaveType: 'Annual Leave', startDate: '2026-06-18', endDate: '2026-06-20', status: 'pending' },
            { id: 'mock-leave-2', employee: { name: 'Sophia Smith', department: 'Marketing' }, leaveType: 'Sick Leave', startDate: '2026-06-19', endDate: '2026-06-19', status: 'pending' },
            { id: 'mock-leave-3', employee: { name: 'Lucas Vance', department: 'Design' }, leaveType: 'Maternity/Paternity', startDate: '2026-06-22', endDate: '2026-06-26', status: 'pending' }
          ]);
        } else {
          setLeavesList(pendingLeaves);
        }

        // Fetch employees for celebrations
        const employeesRes = await request('/employees');
        const upcomingCels = getUpcomingCelebrations(employeesRes);
        if (res.demoMode && upcomingCels.length === 0) {
          setCelebrations([
            { id: 'cel-mock-1', name: 'Sophia Smith', dept: 'Marketing', type: 'birthday', diffDays: 1, dateStr: 'June 17', years: 28 },
            { id: 'cel-mock-2', name: 'Lucas Vance', dept: 'Design', type: 'anniversary', diffDays: 4, dateStr: 'June 20', years: 3 }
          ]);
        } else {
          setCelebrations(upcomingCels);
        }
        
        // Progressive stagger reveal:
        setTimeout(() => setMetricsLoaded(true), 350);
        setTimeout(() => setChartsLoaded(true), 700);
        setTimeout(() => setTablesLoaded(true), 1050);
        setTimeout(() => setLoading(false), 1200);
      } catch (err) {
        console.error('Failed to load dashboard analytics:', err);
        setError('Failed to fetch dashboard metrics. Is the API server running?');
        setMetricsLoaded(true);
        setChartsLoaded(true);
        setTablesLoaded(true);
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, [refreshTrigger]);

  const handleLeaveAction = async (id, action) => {
    const statusMap = {
      approve: 'approved',
      reject: 'rejected'
    };
    const targetStatus = statusMap[action];
    try {
      await request(`/leave/${id}`, {
        method: 'PATCH',
        body: { status: targetStatus }
      });
      
      const targetLeave = leavesList.find(l => l.id === id);
      const employeeName = targetLeave?.employee?.name || 'Employee';
      
      setToastMsg(`Leave request for ${employeeName} has been ${targetStatus}.`);
      setTimeout(() => setToastMsg(null), 3000);

      // Trigger a dashboard data refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to update leave status:', err);
      setToastMsg(`Error: ${err.message || 'Failed to update leave status'}`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const toggleConnection = (key, name) => {
    setConnections(prev => {
      const nextVal = !prev[key];
      setToastMsg(`Integration '${name}' is now ${nextVal ? 'Activated' : 'Suspended'}`);
      setTimeout(() => setToastMsg(null), 3000);
      return { ...prev, [key]: nextVal };
    });
  };

  const summary = data?.summary || {
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    averageAIScore: 0,
    interviewConversionRate: 0,
    hiringRate: 0,
    totalEmployees: 0,
    totalInterviews: 0,
    pendingLeaves: 0,
    attendanceRate: 0,
    emailsSent: 0,
    interviewsScheduledMail: 0,
    offersSent: 0,
    welcomeEmailsSent: 0,
    leaveNotificationsSent: 0
  };

  const totalMins = 
    (summary.emailsSent || 0) * 5 + 
    (summary.interviewsScheduledMail || 0) * 15 + 
    (summary.offersSent || 0) * 30 + 
    (summary.welcomeEmailsSent || 0) * 15 + 
    (summary.leaveNotificationsSent || 0) * 10;
  const hoursSavedVal = Math.round(totalMins / 60);
  const moneySaved = Math.round(hoursSavedVal * 42.5);

  const trends = data?.recruitmentTrends || [];
  const depts = data?.departmentBreakdown || [];
  const activityFeed = data?.activityFeed || [];
  const upcomingInterviews = data?.upcomingInterviews || [];

  // TalentOS Modern Workplace Corporate Colors
  const COLORS = ['#2563EB', '#14B8A6', '#10B981', '#F59E0B', '#EF4444', '#64748B'];
  return (
    <div className="space-y-8 font-sans relative">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] bg-white dark:bg-slate-900 border border-outline text-on-surface px-4 py-2.5 rounded-xl text-xs shadow-2xl flex items-center gap-2 animate-slide-up">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
          <span>{toastMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl flex items-start gap-3 text-xs font-mono">
          <AlertCircle className="shrink-0 mt-0.5" size={14} />
          <div>
            <p className="font-semibold">{error}</p>
            <p className="text-[10px] mt-1 text-on-surface-variant">Make sure backend is accessible on Port 5000.</p>
          </div>
        </div>
      )}

      {/* Database Query Syncing Status Ticker */}
      {showTicker && (
        <div className={`p-3 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-500/10 flex items-center justify-between text-xs font-mono transition-all duration-500 ${!loading ? 'border-green-500/15 bg-green-500/5' : ''}`}>
          <div className="flex items-center gap-2">
            {!loading ? (
              <CheckCircle className="text-green-500 w-4 h-4 shrink-0" size={14} />
            ) : (
              <Database className="text-indigo-500 dark:text-indigo-400 w-4 h-4 animate-pulse shrink-0" size={14} />
            )}
            <span className={!loading ? 'text-green-600 dark:text-green-400 font-bold' : 'text-on-surface-variant'}>
              {tickerMessage}
            </span>
          </div>
          {loading && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
              <span className="font-bold tracking-wider">SYNCING PRISMA QUERY</span>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TOP HERO SECTION: EXECUTIVE GREETING & SUMMARY ----------------- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-2 border-b border-outline">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface font-display">
            Good Morning, {currentUser?.name || 'Abdullah'} 👋
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Here is your executive HR command summary. Check workforce health, hiring flow, and pending approvals.
          </p>
        </div>
        
        {/* Executive summary pill cards */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {[
            { label: 'Employees', val: summary.totalEmployees, color: 'bg-blue-500/10 text-[#2563EB] border-blue-500/25', icon: Users, href: '/dashboard/employees' },
            { label: 'Active Candidates', val: summary.totalApplications, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25', icon: UserCheck, href: '/dashboard/candidates' },
            { label: 'Interviews Scheduled', val: summary.totalInterviews, color: 'bg-amber-500/10 text-amber-600 border-amber-500/25', icon: Calendar, href: '/dashboard/interviews' },
            { label: 'Leaves Pending', val: summary.pendingLeaves, color: 'bg-rose-500/10 text-rose-600 border-rose-500/25', icon: CalendarDays, href: '/dashboard/leave-management' }
          ].map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border ${item.color} text-xs font-bold transition hover:scale-[1.02] shadow-sm`}
            >
              <item.icon size={14} />
              <span>{item.val} {item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ----------------- ROW 1: AI INSIGHT & AUTOMATION ENGINE GRID ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: AI Workforce Insights */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 shadow-md border border-blue-500/20 flex flex-col justify-between min-h-[220px]">
          {/* Background glow effects */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl -z-10" />
          
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles size={13} className="text-amber-400 fill-amber-400" />
              <span>AI Workforce Insights</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">Intelligent Recommendations</h2>
            <ul className="space-y-1.5 text-xs text-blue-100/90 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full shrink-0" />
                <span>3 candidates match open positions above 90%.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                <span>2 leave requests need approval.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-450 rounded-full shrink-0" />
                <span>Interview scheduled for tomorrow.</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-wrap gap-2.5 mt-4 pt-2 border-t border-white/10 relative z-10">
            <Link 
              href="/dashboard/ai-assistant"
              className="px-3.5 py-2 bg-white text-blue-700 text-[11px] font-bold rounded-xl transition hover:bg-slate-100 flex items-center gap-1 shrink-0"
            >
              Ask HR Copilot <ArrowRight size={12} />
            </Link>
            <Link 
              href="/dashboard/candidates"
              className="px-3.5 py-2 bg-blue-550/30 hover:bg-blue-500/40 text-white text-[11px] font-bold rounded-xl transition border border-white/20 flex items-center gap-1 shrink-0"
            >
              Review Candidates
            </Link>
          </div>
        </div>

        {/* Right Column: TalentOS Automation Engine (Executive Value Banner) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-6 shadow-md border border-[#14B8A6]/20 flex flex-col justify-between min-h-[220px]">
          {/* Background glow effects */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-[#14B8A6]/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -z-10" />
          
          <div className="space-y-3 relative z-10 flex-1">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-xs font-bold uppercase tracking-wider text-[#14B8A6]">
                <Zap size={13} className="text-[#14B8A6] fill-[#14B8A6] animate-pulse" />
                <span>TalentOS Automation Engine</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Active Savings</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
              {[
                { label: 'Emails Sent', val: summary.emailsSent?.toLocaleString() || '0', desc: 'Candidate & internal', icon: Mail, color: 'text-indigo-400' },
                { label: 'Interviews Confirmed', val: summary.interviewsScheduledMail?.toLocaleString() || '0', desc: 'Calendar synced', icon: Calendar, color: 'text-teal-400' },
                { label: 'Offers Dispatched', val: summary.offersSent?.toLocaleString() || '0', desc: 'Offer letters', icon: Zap, color: 'text-amber-400' },
                { label: 'Welcome Invites', val: summary.welcomeEmailsSent?.toLocaleString() || '0', desc: 'Workspace accounts', icon: UserCheck, color: 'text-emerald-400' },
                { label: 'Leave Alerts', val: summary.leaveNotificationsSent?.toLocaleString() || '0', desc: 'Request decisions', icon: CalendarDays, color: 'text-pink-400' }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{stat.label}</span>
                      <Icon size={12} className={stat.color} />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-lg font-extrabold tracking-tight block font-display leading-none">{stat.val}</span>
                      <span className="text-[8px] text-slate-400 mt-1 block truncate leading-none">{stat.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400 relative z-10 select-none">
            <span>Average operational wage: $42.50/hr</span>
            <span className="text-emerald-400 font-bold">Estimated ${moneySaved.toLocaleString()} ({hoursSavedVal} hrs) saved this month</span>
          </div>
        </div>

      </div>

      {/* ----------------- ROW 2: REDESIGNED KPI CARDS ----------------- */}
      {!metricsLoaded ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { 
              title: 'Employees', 
              val: summary.totalEmployees, 
              trend: 'Stable', 
              status: 'stable', 
              icon: Users, 
              color: 'text-blue-500 bg-blue-500/10 border-blue-500/15', 
              sparkline: [20, 25, 30, 28, 35, 42] 
            },
            { 
              title: 'Open Jobs', 
              val: summary.activeJobs, 
              trend: 'Active', 
              status: 'active', 
              icon: Briefcase, 
              color: 'text-teal-500 bg-teal-500/10 border-teal-500/15', 
              sparkline: [12, 14, 15, 13, 16, 18] 
            },
            { 
              title: 'Candidates', 
              val: summary.totalApplications, 
              trend: 'Velocity', 
              status: 'velocity', 
              icon: UserCheck, 
              color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/15', 
              sparkline: [60, 75, 88, 92, 104, 112] 
            },
            { 
              title: 'Interviews', 
              val: summary.totalInterviews, 
              trend: 'Optimal', 
              status: 'complete', 
              icon: Calendar, 
              color: 'text-amber-500 bg-amber-500/10 border-amber-500/15', 
              sparkline: [2, 3, 5, 2, 4, 4] 
            },
            { 
              title: 'Attendance', 
              val: `${summary.attendanceRate}%`, 
              trend: 'Healthy', 
              status: 'healthy', 
              icon: Clock, 
              color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/15', 
              sparkline: [95, 96, 95.8, 96.2, 96.5, 96.8] 
            }
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className="glass-card-premium p-5 flex flex-col justify-between border-outline relative hover:-translate-y-1 transition duration-300">
                <div className="flex items-start justify-between">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${kpi.color}`}>
                    <Icon size={16} />
                  </div>
                  
                  {/* Trend percentage */}
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <TrendingUp size={10} /> {kpi.trend}
                  </span>
                </div>
                
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">{kpi.title}</span>
                    <p className="text-2xl font-extrabold text-on-surface mt-1 font-display leading-none">{kpi.val}</p>
                  </div>
                  
                  {/* Mini SVG Sparkline */}
                  <div className="w-16 h-8 flex items-end">
                    <svg className="w-full h-full text-primary" viewBox="0 0 100 50">
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={kpi.sparkline.map((val, i) => `${(i / (kpi.sparkline.length - 1)) * 100},${50 - (val / 120) * 50}`).join(' ')}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- ROW 3: RECRUITMENT & ANALYTICS ----------------- */}
      {!chartsLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SkeletonChart title="Hiring Pipeline Growth" />
          </div>
          <div>
            <div className="bg-surface border border-outline rounded-2xl p-6 space-y-4 shadow-sm h-[340px] relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-1.5 animate-pulse">
                <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-3.5 w-56 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
              <div className="space-y-3.5 py-4 flex-1 justify-center flex flex-col animate-pulse">
                {[100, 80, 60, 35].map((w, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Funnel and Monthly Flow Chart */}
          <div className="lg:col-span-2 glass-panel-premium p-6 border-outline flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-sm text-on-surface font-display">Hiring Pipeline Growth</h3>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Recruitment funnel trends and total application flow</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-primary-light text-primary border border-blue-100 font-mono">
                  Quarterly Report
                </span>
              </div>
            </div>

            <div className="h-72 w-full text-xs">
              {trends.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted font-mono">No recruitment trends.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" stroke="#CBD5E1" tick={{ fill: '#64748B', fontSize: 10 }} />
                    <YAxis stroke="#CBD5E1" tick={{ fill: '#64748B', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                      labelStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area name="Applications" type="monotone" dataKey="applications" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                    <Area name="Hires" type="monotone" dataKey="hires" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorHires)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right 1 Col: Recruitment Funnel Conversion */}
          <div className="glass-panel-premium p-6 border-outline flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-on-surface font-display">Recruitment Funnel Conversion</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Conversion breakdown from Applied to Offered</p>
            </div>

            {(() => {
              const stageCounts = data?.stageCounts || {
                applied: 0,
                shortlisted: 0,
                interview: 0,
                offered: 0,
                hired: 0,
                rejected: 0
              };
              const maxStageCount = Math.max(...Object.values(stageCounts), 1);
              const funnelStages = [
                { stage: 'Applied', count: stageCounts.applied, color: 'bg-blue-500/20 text-[#2563EB]' },
                { stage: 'Shortlisted', count: stageCounts.shortlisted, color: 'bg-teal-500/20 text-teal-600 dark:text-teal-400' },
                { stage: 'Interview', count: stageCounts.interview, color: 'bg-indigo-500/20 text-indigo-650 dark:text-indigo-400' },
                { stage: 'Offered', count: stageCounts.offered, color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
                { stage: 'Hired', count: stageCounts.hired, color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
                { stage: 'Rejected', count: stageCounts.rejected, color: 'bg-rose-500/20 text-rose-600 dark:text-rose-455' }
              ];
              const overallConversion = stageCounts.applied > 0 
                ? ((stageCounts.hired / stageCounts.applied) * 100).toFixed(1)
                : '0.0';

              return (
                <>
                  <div className="space-y-3 py-6">
                    {funnelStages.map((item, idx) => {
                      const widthPct = maxStageCount > 0 ? (item.count / maxStageCount) * 100 : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className="text-on-surface-variant">{item.stage}</span>
                            <span className="text-on-surface font-bold">{item.count}</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 h-6 rounded-lg overflow-hidden relative border border-slate-200/20 dark:border-slate-800">
                            <div 
                              className={`h-full ${item.color} flex items-center px-2 text-[10px] font-bold rounded-lg`} 
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-outline flex items-center justify-between text-[11px] text-muted">
                    <span>Overall Conversion Rate</span>
                    <span className="font-bold text-[#2563EB] text-xs">{overallConversion}%</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ----------------- EMAIL AUTOMATION DEMO HUB ----------------- */}
      <div className="glass-panel-premium p-6 border-outline space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-on-surface font-display flex items-center gap-1.5">
              <Zap className="text-[#14B8A6]" size={15} /> TalentOS Live Automation Sandbox
            </h3>
            <span className="badge-active font-mono text-[9px] font-bold">DEMO ENVIRONMENT</span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            Demonstrate end-to-end recruitment triggers, calendar synchronization, and automated workspace provisioning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Stepper and Control Panel */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            {/* Visual Stepper */}
            <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-4 select-none">
              {/* Background Connective line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-outline hidden md:block -z-10" />
              
              {[
                { step: 1, name: 'Candidate Applies', desc: 'Automatic Email Sent' },
                { step: 2, name: 'Shortlisted', desc: 'Assessment Dispatched' },
                { step: 3, name: 'Interview Confirmed', desc: 'Google Meet Sync' },
                { step: 4, name: 'Marked Hired', desc: 'Welcome & Provisioning' }
              ].map((s) => {
                const isPast = demoStep >= s.step;
                const isCurrent = demoStep === s.step;
                return (
                  <button
                    key={s.step}
                    onClick={() => handleRunDemoStep(s.step)}
                    disabled={isSimulating}
                    className="flex-1 text-left md:text-center flex md:flex-col items-center md:items-center gap-3 md:gap-2 group transition focus:outline-none"
                  >
                    <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 shrink-0 ${
                      isCurrent 
                        ? 'bg-primary border-primary text-white scale-110 shadow-[0_0_12px_rgba(37,99,235,0.4)]' 
                        : isPast 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-surface border-outline text-muted group-hover:border-primary-light group-hover:text-primary'
                    }`}>
                      {isPast && !isCurrent ? '✓' : s.step}
                    </div>
                    <div>
                      <p className={`text-[11px] font-bold tracking-tight block ${isCurrent ? 'text-primary' : isPast ? 'text-emerald-600 dark:text-emerald-400' : 'text-on-surface-variant'}`}>
                        {s.name}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-3.5">
              <button
                onClick={handleRunFullPipeline}
                disabled={isSimulating}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-550 hover:to-indigo-650 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/10 disabled:opacity-50 transition"
              >
                <Play size={13} className="fill-white" />
                Play Pipeline Sequence
              </button>
              
              <button
                onClick={handleResetDemo}
                disabled={isSimulating || demoStep === 0}
                className="px-4 py-2.5 rounded-xl bg-surface border border-outline hover:bg-surface-high font-bold text-xs text-on-surface-variant transition disabled:opacity-40"
              >
                Reset Sandbox
              </button>
              
              <span className="text-[9px] font-mono text-muted flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#14B8A6] rounded-full animate-ping"></span>
                Sandbox Ready
              </span>
            </div>
          </div>

          {/* Logs / Email Preview Tab Container */}
          <div className="lg:col-span-5 flex flex-col min-h-[260px] bg-slate-50/50 dark:bg-slate-900/30 border border-outline rounded-2xl overflow-hidden shadow-sm">
            {/* Header Tabs */}
            <div className="flex border-b border-outline bg-surface-high p-0.5 select-none">
              {[
                { id: 'log', label: 'Sandbox Live Log' },
                { id: 'template', label: 'Gmail Template Preview' }
              ].map((tab) => {
                const isSelected = selectedLogTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedLogTab(tab.id)}
                    className={`flex-1 py-2 text-center text-[10px] font-bold transition-all rounded-xl ${
                      isSelected 
                        ? 'bg-surface text-primary border border-outline' 
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="p-4 flex-1 flex flex-col font-sans overflow-hidden">
              {selectedLogTab === 'log' ? (
                /* Sandbox Live Logs output */
                <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[9px] text-slate-500 max-h-[190px] scrollbar-none flex flex-col-reverse">
                  {demoLogs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-1">
                      <Play className="text-muted w-5 h-5 animate-pulse" />
                      <p className="font-bold text-xs">Waiting for events...</p>
                      <p className="text-[9px] text-muted max-w-[200px]">Trigger steps above to watch the automation engine process rules in real-time.</p>
                    </div>
                  ) : (
                    demoLogs.map((log, i) => {
                      const isSuccess = log.includes('SUCCESS');
                      const isEvent = log.includes('➔');
                      return (
                        <div 
                          key={i} 
                          className={`py-0.5 leading-relaxed truncate ${
                            isSuccess 
                              ? 'text-green-650 text-green-500 font-semibold' 
                              : isEvent 
                                ? 'text-primary font-bold border-l-2 border-primary pl-1.5 my-1 bg-primary/5' 
                                : ''
                          }`}
                        >
                          {log}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* Email HTML Template preview client */
                <div className="flex-1 flex flex-col text-[10px] text-on-surface font-sans max-h-[190px] overflow-y-auto scrollbar-none select-text">
                  <div className="bg-surface border border-outline rounded-xl p-3.5 space-y-2.5 flex-1 flex flex-col shadow-sm">
                    {/* Header */}
                    <div className="space-y-1 border-b border-outline/50 pb-2">
                      <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                        <span>TO:</span>
                        <span className="font-mono text-primary font-bold">{emailPreview.to}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                        <span>SUBJECT:</span>
                        <span className="text-on-surface font-bold truncate max-w-[230px]">{emailPreview.subject}</span>
                      </div>
                    </div>
                    {/* Body */}
                    <div className="flex-1 whitespace-pre-wrap text-[9px] text-on-surface-variant font-medium leading-relaxed max-h-[120px] overflow-y-auto pr-1">
                      {emailPreview.body}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- ROW 4: RECENT ACTIVITY & UPCOMING INTERVIEWS ----------------- */}
      {!tablesLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonTable rows={4} cols={3} />
          <div className="bg-surface border border-outline rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center pb-4 border-b border-outline/40">
              <div className="space-y-1.5 w-1/3">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-3.5 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="space-y-4 pt-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border border-outline/35 rounded-2xl animate-pulse">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-2.5 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Recent Activity Log */}
          <div className="glass-panel-premium p-6 border-outline flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-on-surface font-display flex items-center gap-1.5">
                <Activity className="text-primary" size={15} /> Real-Time HR Event Logs
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Workspace actions, login activities, and AI audit trail logs</p>
            </div>

            <div className="overflow-x-auto flex-1 max-h-[300px] scrollbar-none">
              <table className="min-w-full font-sans text-xs">
                <thead>
                  <tr className="border-b border-outline text-left text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-2.5">Activity Detail</th>
                    <th className="pb-2.5">User</th>
                    <th className="pb-2.5">Verdict</th>
                    <th className="pb-2.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/50 text-on-surface-variant">
                  {activityFeed.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-muted font-mono text-xs">
                        No recent activities logged yet.
                      </td>
                    </tr>
                  ) : (
                    activityFeed.slice(0, 5).map((activity, index) => {
                      const formattedTime = new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <tr key={activity.id || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition duration-150">
                          <td className="py-3 font-semibold text-on-surface truncate max-w-[200px]" title={activity.action}>{activity.action}</td>
                          <td className="py-3 text-primary font-semibold truncate max-w-[80px]">{activity.user || 'SYSTEM'}</td>
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-lg border border-blue-200/40 uppercase">
                              LOGGED
                            </span>
                          </td>
                          <td className="py-3 text-right text-muted">{formattedTime}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Upcoming Interviews */}
          <div className="glass-panel-premium p-6 border-outline">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-sm text-on-surface font-display">Interview Schedule</h3>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Calls and evaluations scheduled with active candidates</p>
              </div>
              <Link href="/dashboard/interviews" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Open Scheduler <ChevronRight size={13} />
              </Link>
            </div>

            {upcomingInterviews.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-outline rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                <Calendar className="mx-auto text-muted mb-2 animate-pulse" size={32} />
                <p className="text-on-surface-variant text-xs font-semibold">No interviews scheduled today</p>
                <p className="text-[10px] text-muted mt-1">Visit candidates pipeline to schedule meetings.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-outline hover:border-primary/20 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-light text-primary flex items-center justify-center rounded-xl shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-on-surface font-display">{interview.candidate}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">Interviewer: {interview.interviewer}</p>
                        <p className="text-[9px] text-primary font-bold mt-1">
                          {new Date(interview.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {interview.meetingLink && (
                        <a 
                          href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-ghost !py-1.5 !px-3 !rounded-xl text-[10px]"
                        >
                          <Video size={12} className="inline mr-1" /> Meet Link
                        </a>
                      )}
                      <span className="badge-active uppercase text-[9px] font-bold">
                        {interview.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- ROW 5: EMPLOYEE OVERVIEW & LEAVE REQUESTS ----------------- */}
      {!tablesLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SkeletonTable rows={3} cols={4} />
          </div>
          <div className="bg-surface border border-outline rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="space-y-4 pt-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3.5 border border-outline/35 rounded-2xl animate-pulse">
                  <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Leave Requests Table */}
          <div className="lg:col-span-2 glass-panel-premium p-6 border-outline flex flex-col justify-between">
            <div className="mb-6">
              <h3 className="font-bold text-sm text-on-surface font-display flex items-center gap-1.5">
                <CalendarDays className="text-primary" size={15} /> Leave Requests Pending Approvals
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Employees requests for sick leave, vacations, and annual leaves</p>
            </div>

            <div className="overflow-x-auto flex-1 max-h-[300px] scrollbar-none">
              <table className="min-w-full font-sans text-xs">
                <thead>
                  <tr className="border-b border-outline text-left text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-2.5">Employee</th>
                    <th className="pb-2.5">Type</th>
                    <th className="pb-2.5">Duration</th>
                    <th className="pb-2.5">Dates</th>
                    <th className="pb-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/50 text-on-surface-variant">
                  {leavesList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-muted font-mono text-xs">
                        No pending leave requests found.
                      </td>
                    </tr>
                  ) : (
                    leavesList.map((leave) => {
                      const durationStr = getDurationDays(leave.startDate, leave.endDate);
                      const datesStr = formatDates(leave.startDate, leave.endDate);
                      return (
                        <tr key={leave.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition duration-150">
                          <td className="py-3 font-semibold text-on-surface">
                            <p className="font-bold text-xs">{leave.employee?.name || 'Unknown'}</p>
                            <span className="text-[10px] text-muted">{leave.employee?.department || 'N/A'}</span>
                          </td>
                          <td className="py-3 font-medium">{leave.leaveType}</td>
                          <td className="py-3">{durationStr}</td>
                          <td className="py-3 font-mono text-[11px]">{datesStr}</td>
                          <td className="py-3 text-center">
                            {leave.status === 'pending' ? (
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleLeaveAction(leave.id, 'approve')}
                                  className="px-2.5 py-1 bg-green-500 hover:bg-green-650 text-white font-bold text-[10px] rounded-lg shadow-sm shadow-green-500/10 transition"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleLeaveAction(leave.id, 'reject')}
                                  className="px-2.5 py-1 bg-red-500 hover:bg-red-650 text-white font-bold text-[10px] rounded-lg shadow-sm shadow-red-500/10 transition"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase ${
                                leave.status === 'approved' 
                                  ? 'text-green-700 bg-green-50 dark:bg-green-950/20 border-green-200/40' 
                                  : 'text-red-700 bg-red-50 dark:bg-red-950/20 border-red-200/40'
                              }`}>
                                {leave.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 1 Col: Birthdays & Anniversaries */}
          <div className="glass-panel-premium p-6 border-outline flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-on-surface font-display">Workplace Celebrations</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Upcoming employee milestones and dates</p>
            </div>

            <div className="space-y-4 py-4 flex-1">
              {celebrations.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-outline rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                  <Gift className="mx-auto text-muted mb-2 animate-pulse" size={24} />
                  <p className="text-on-surface-variant text-xs font-semibold">No team celebrations this week</p>
                  <p className="text-[10px] text-muted mt-1">We'll show upcoming anniversaries here.</p>
                </div>
              ) : (
                celebrations.map((cel) => {
                  const isBirthday = cel.type === 'birthday';
                  const Icon = isBirthday ? Cake : Gift;
                  const bgClass = isBirthday 
                    ? "bg-pink-500/5 dark:bg-pink-950/10 border-pink-500/10" 
                    : "bg-purple-500/5 dark:bg-purple-950/10 border-purple-500/10";
                  const badgeColorClass = isBirthday ? "text-pink-655" : "text-purple-655";
                  const iconBgClass = isBirthday ? "bg-pink-500/10 text-pink-655" : "bg-purple-500/10 text-purple-655";
                  const label = isBirthday 
                    ? (cel.diffDays === 0 ? 'Birthday Today' : cel.diffDays === 1 ? 'Birthday Tomorrow' : `Birthday in ${cel.diffDays} Days`)
                    : (cel.diffDays === 0 ? 'Anniversary Today' : cel.diffDays === 1 ? 'Anniversary Tomorrow' : `Anniversary in ${cel.diffDays} Days`);
                  const desc = isBirthday 
                    ? `Turning ${cel.years} on ${cel.dateStr}`
                    : `Celebrating ${cel.years} year${cel.years > 1 ? 's' : ''} with company on ${cel.dateStr}`;

                  return (
                    <div key={cel.id} className={`p-3.5 border rounded-2xl flex items-center gap-3 ${bgClass}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
                        <Icon size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <span className={`text-[9px] font-bold uppercase block tracking-wider font-mono ${badgeColorClass}`}>
                          {label}
                        </span>
                        <p className="text-xs font-bold text-on-surface mt-0.5">{cel.name} ({cel.dept})</p>
                        <span className="text-[10px] text-muted font-medium block">
                          {desc}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2.5 border-t border-outline text-[11px] text-center text-muted font-mono uppercase tracking-wider">
              YZ% Strengthen Team Bonds
            </div>
          </div>
        </div>
      )}

      {/* Community Feedback Widget */}
      <div className="mt-8 border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Community Feedback Center</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-lg">
              Review what public beta testers are saying. Track feature requests, bug reports, and general feedback directly from the community.
            </p>
          </div>
        </div>
        <Link 
          href="/dashboard/feedback"
          className="shrink-0 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm relative z-10"
        >
          View Feedback <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
