'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { request } from '../../services/api';
import { socketService } from '../../services/socket.service';
import { useLanguage } from '../../context/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import WorkforceLoader from '../../components/WorkforceLoader';
import FeedbackModal from '../../components/FeedbackModal';

function StreamingText({ text, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const textRef = useRef(text);
  textRef.current = text;
  
  useEffect(() => {
    let index = 0;
    const words = textRef.current.split(' ');
    setDisplayedText('');
    const interval = setInterval(() => {
      if (index < words.length) {
        setDisplayedText(prev => prev + (prev ? ' ' : '') + words[index]);
        index++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return <span>{displayedText}</span>;
}

import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Cpu, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X,
  Plus,
  User,
  Sun,
  Moon,
  Monitor,
  Calendar,
  UserCheck,
  BellRing,
  Sparkles,
  Award,
  FileQuestion,
  BookOpen,
  Mail,
  FileClock,
  MessageSquare,
  Send,
  BrainCircuit,
  ClipboardCheck,
  Clock,
  CalendarDays,
  Star,
  Target,
  GraduationCap,
  FolderLock,
  Zap,
  CreditCard,
  Network,
  Link2,
  Coins,
  Shield,
  Palette,
  LineChart,
  Globe,
  Terminal,
  ChevronRight,
  Layers,
  Database,
  Video,
  TrendingUp
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, changeLanguage, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);

  // Profile Dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState('General Feedback');
  const profileDropdownRef = useRef(null);

  // Theme hooks
  const { theme, setTheme } = useTheme();

  // Workspace Switcher
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);

  // Collapsible Sidebar Sections
  const [expandedSections, setExpandedSections] = useState({
    'Key Features': true,
    'Workspace': true,
    'Recruitment': false,
    'Employee Management': false,
    'Workforce Operations': false,
    'Communication Hub': false,
    'Google Integration Hub': false,
    'Meeting Management': false,
    'AI Automation Center': false,
    'Document Center': false,
    'Analytics Center': false,
    'Security & Settings': false
  });

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const expandAll = () => {
    setExpandedSections({
      'Key Features': true,
      'Workspace': true,
      'Recruitment': true,
      'Employee Management': true,
      'Workforce Operations': true,
      'Communication Hub': true,
      'Google Integration Hub': true,
      'Meeting Management': true,
      'AI Automation Center': true,
      'Document Center': true,
      'Analytics Center': true,
      'Security & Settings': true
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      'Key Features': false,
      'Workspace': false,
      'Recruitment': false,
      'Employee Management': false,
      'Workforce Operations': false,
      'Communication Hub': false,
      'Google Integration Hub': false,
      'Meeting Management': false,
      'AI Automation Center': false,
      'Document Center': false,
      'Analytics Center': false,
      'Security & Settings': false
    });
  };

  // CMD + K Command Palette State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);
  const commandInputRef = useRef(null);

  // Copilot Chat Panel states
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState([
    { sender: 'assistant', text: 'Hi! I am your TalentOS Assistant. How can I help you support your hiring funnel, open positions, or team performance details?' }
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [executingTool, setExecutingTool] = useState(null);
  const [streamingMessageId, setStreamingMessageId] = useState(null);

  // Page transition loading states
  const [navLoading, setNavLoading] = useState(false);
  const [navMessage, setNavMessage] = useState("Preparing Workforce Intelligence...");

  // Auth checks
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
    } else {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      setAuthChecked(true);

      fetchUnreadCount();

      if (user?.companyId) {
        const socket = socketService.connect(user.companyId);
        
        socketService.on('new_notification', (notification) => {
          setUnreadCount(prev => prev + 1);

          setActiveToast({
            title: notification.title,
            message: notification.message,
            type: notification.type || 'info'
          });

          setTimeout(() => {
            setActiveToast(null);
          }, 5000);
        });
      }
    }

    return () => {
      socketService.disconnect();
    };
  }, [router]);

  // Click outside profile dropdown handler
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Command Palette event triggers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => {
        commandInputRef.current?.focus();
      }, 50);
      setCommandQuery('');
      setActiveCommandIndex(0);
    }
  }, [commandPaletteOpen]);

  // Watch pathname changes to trigger loading transition
  useEffect(() => {
    setNavLoading(true);
    
    if (pathname.includes('/employees')) {
      setNavMessage("Connecting Team Data...");
    } else if (pathname.includes('/analytics') || pathname.includes('/candidate-ranking')) {
      setNavMessage("Analyzing Organization...");
    } else if (pathname.includes('/jobs')) {
      setNavMessage("Preparing Workforce Requisitions...");
    } else if (pathname.includes('/settings')) {
      setNavMessage("Loading Workspace Configuration...");
    } else if (pathname.includes('/ai-assistant')) {
      setNavMessage("Activating HR Copilot Workspace...");
    } else {
      setNavMessage("Loading Workspace Dashboard...");
    }

    const timer = setTimeout(() => {
      setNavLoading(false);
    }, 600); // 600ms transition delay

    return () => clearTimeout(timer);
  }, [pathname]);

  const fetchUnreadCount = async () => {
    try {
      const data = await request('/notifications');
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load notifications unread count:', err);
    }
  };

  const handleCopilotSend = async (e, customText = null) => {
    if (e) e.preventDefault();
    const text = customText || copilotInput;
    if (!text.trim() || copilotLoading || executingTool) return;

    const userMsg = { sender: 'user', text };
    setCopilotMessages(prev => [...prev, userMsg]);
    if (!customText) setCopilotInput('');

    // Determine tool execution based on keywords
    let tool = null;
    const lowerText = text.toLowerCase();
    if (lowerText.includes('candidate') || lowerText.includes('find candidate')) {
      tool = { label: 'Searching Candidates...', desc: 'Scanning TalentOS pipeline & sourcing matches' };
    } else if (lowerText.includes('resume') || lowerText.includes('analyze resume')) {
      tool = { label: 'Analyzing Resume...', desc: 'Parsing qualifications, skills, and work history' };
    } else if (lowerText.includes('question') || lowerText.includes('generate questions') || lowerText.includes('interview')) {
      tool = { label: 'Generating Questions...', desc: 'Compiling structured technical & behavioral evaluation queries' };
    } else if (lowerText.includes('job') || lowerText.includes('create job') || lowerText.includes('description')) {
      tool = { label: 'Creating Job Post...', desc: 'Drafting requirements, role summary, and benefits context' };
    } else if (lowerText.includes('report') || lowerText.includes('generate report') || lowerText.includes('analytics')) {
      tool = { label: 'Generating HR Reports...', desc: 'Synthesizing pipeline statistics and conversion rates' };
    } else if (lowerText.includes('employee') || lowerText.includes('search')) {
      tool = { label: 'Employee Search...', desc: 'Querying workspace directory and directories matching context' };
    } else if (lowerText.includes('leave') || lowerText.includes('insights')) {
      tool = { label: 'Leave Insights...', desc: 'Analyzing team leave allocation trends' };
    } else if (lowerText.includes('attendance') || lowerText.includes('check')) {
      tool = { label: 'Attendance Insights...', desc: 'Evaluating check-in logs and active work schedules' };
    }

    if (tool) {
      setExecutingTool(tool);
      // Wait 1.5 seconds to show the tool executing
      await new Promise(resolve => setTimeout(resolve, 1500));
      setExecutingTool(null);
    }

    setCopilotLoading(true);

    try {
      const data = await request('/chat', {
        method: 'POST',
        body: { message: text }
      });
      const newMsgId = Date.now();
      setCopilotMessages(prev => [...prev, { 
        id: newMsgId, 
        sender: 'assistant', 
        text: data.response,
        streaming: true 
      }]);
      setStreamingMessageId(newMsgId);
    } catch (err) {
      console.error('Copilot send failure:', err);
      setCopilotMessages(prev => [...prev, { 
        sender: 'assistant', 
        text: 'Sorry, I failed to process that request. Please verify connection to server.' 
      }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleStreamComplete = (msgId) => {
    setStreamingMessageId(null);
    setCopilotMessages(prev => 
      prev.map(m => m.id === msgId ? { ...m, streaming: false } : m)
    );
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  // Navigations categorized inside Sidebar (Grouped & Streamlined)
  const sidebarSections = [
    {
      title: 'Key Features',
      items: [
        { name: 'AI Resume Analysis', key: 'aiResumeAnalysis', href: '/dashboard/candidate-ranking', icon: Cpu },
        { name: 'Automated Recruitment Emails', key: 'automatedRecruitmentEmails', href: '/dashboard/automations', icon: Zap },
        { name: 'Interview Automation', key: 'interviewAutomation', href: '/dashboard/interviews', icon: Calendar },
        { name: 'Employee Self-Service Portal', key: 'employeeSelfServicePortal', href: '/dashboard/employees?tab=self-service', icon: User },
        { name: 'Attendance Tracking', key: 'attendanceTracking', href: '/dashboard/attendance', icon: Clock },
        { name: 'Leave Management', key: 'leaveManagement', href: '/dashboard/leave-management', icon: CalendarDays },
        { name: 'Google Calendar Sync', key: 'googleCalendarSync', href: '/dashboard/integrations?tab=google-calendar', icon: Link2 },
        { name: 'Gmail Automation', key: 'gmailAutomation', href: '/dashboard/gmail', icon: Mail },
        { name: 'AI Workforce Analytics', key: 'aiWorkforceAnalytics', href: '/dashboard/workforce-intelligence', icon: BarChart3 },
        { name: 'AI Copilot', key: 'aiCopilot', href: '/dashboard/ai-assistant', icon: Sparkles }
      ]
    },
    {
      title: 'Workspace',
      items: [
        { name: 'Dashboard', key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Executive Dashboard', key: 'executiveDashboard', href: '/dashboard/executive-dashboard', icon: BarChart3 },
        { name: 'AI Workforce Insights', key: 'aiWorkforceInsights', href: '/dashboard/workforce-intelligence', icon: BrainCircuit }
      ]
    },
    {
      title: 'Recruitment',
      items: [
        { name: 'Jobs', key: 'jobs', href: '/dashboard/jobs', icon: Briefcase },
        { name: 'Candidates', key: 'candidates', href: '/dashboard/candidates', icon: UserCheck },
        { name: 'Candidate Pipeline', key: 'candidatePipeline', href: '/dashboard/candidates?view=pipeline', icon: Layers },
        { name: 'AI Resume Ranking', key: 'aiResumeRanking', href: '/dashboard/candidate-ranking', icon: Cpu },
        { name: 'Interview Management', key: 'interviewManagement', href: '/dashboard/interviews', icon: Calendar },
        { name: 'Career Portal', key: 'careerPortal', href: '/dashboard/jobs?view=career', icon: Globe },
        { name: 'Offer Management', key: 'offerManagement', href: '/dashboard/documents?category=offers', icon: FolderLock }
      ]
    },
    {
      title: 'Employee Management',
      items: [
        { name: 'Employees', key: 'employees', href: '/dashboard/employees', icon: Users },
        { name: 'Employee Directory', key: 'employeeDirectory', href: '/dashboard/employees?view=directory', icon: UserCheck },
        { name: 'Organization Chart', key: 'orgChart', href: '/dashboard/organization', icon: Network },
        { name: 'Onboarding', key: 'onboarding', href: '/dashboard/onboarding', icon: ClipboardCheck },
        { name: 'Offboarding', key: 'offboarding', href: '/dashboard/onboarding?tab=offboarding', icon: LogOut },
        { name: 'Employee Profiles', key: 'employeeProfiles', href: '/dashboard/employees', icon: User }
      ]
    },
    {
      title: 'Workforce Operations',
      items: [
        { name: 'Attendance', key: 'attendance', href: '/dashboard/attendance', icon: Clock },
        { name: 'Leave Management', key: 'leaveTracker', href: '/dashboard/leave-management', icon: CalendarDays },
        { name: 'Payroll Overview', key: 'payrollOverview', href: '/dashboard/payroll', icon: CreditCard },
        { name: 'Performance Reviews', key: 'performanceReviews', href: '/dashboard/performance', icon: Award },
        { name: 'Goals & OKRs', key: 'goals', href: '/dashboard/goals', icon: Target },
        { name: 'Training & LMS', key: 'trainingLms', href: '/dashboard/training', icon: GraduationCap }
      ]
    },
    {
      title: 'Communication Hub',
      items: [
        { name: 'Email Center', key: 'emailCenter', href: '/dashboard/gmail', icon: Mail },
        { name: 'Automated Email Workflows', key: 'automatedEmailWorkflows', href: '/dashboard/automations', icon: Zap },
        { name: 'Interview Invitations', key: 'interviewInvitations', href: '/dashboard/gmail?tab=invitations', icon: Send },
        { name: 'Employee Announcements', key: 'employeeAnnouncements', href: '/dashboard/notifications?tab=announcements', icon: BellRing },
        { name: 'Meeting Scheduler', key: 'meetingScheduler', href: '/dashboard/interviews', icon: Calendar },
        { name: 'Notification Center', key: 'notificationCenter', href: '/dashboard/notifications', icon: Bell },
        { name: 'Email Templates', key: 'emailTemplates', href: '/dashboard/email-templates', icon: FileClock }
      ]
    },
    {
      title: 'Google Integration Hub',
      items: [
        { name: 'Gmail Integration', key: 'gmailIntegration', href: '/dashboard/gmail', icon: Mail },
        { name: 'Google Calendar Integration', key: 'googleCalendarIntegration', href: '/dashboard/integrations?tab=google-calendar', icon: Calendar },
        { name: 'Google Meet Integration', key: 'googleMeetIntegration', href: '/dashboard/integrations?tab=google-meet', icon: Video },
        { name: 'Google Workspace Integration', key: 'googleWorkspaceIntegration', href: '/dashboard/integrations?tab=google-workspace', icon: Layers }
      ]
    },
    {
      title: 'Meeting Management',
      items: [
        { name: 'Interview Scheduling', key: 'interviewScheduling', href: '/dashboard/interviews', icon: Calendar },
        { name: 'Employee Meetings', key: 'employeeMeetings', href: '/dashboard/interviews?tab=employee-meetings', icon: Users },
        { name: 'Team Meetings', key: 'teamMeetings', href: '/dashboard/interviews?tab=team-meetings', icon: Network },
        { name: 'Performance Reviews', key: 'performanceReviews', href: '/dashboard/performance', icon: Award },
        { name: 'Google Meet Links', key: 'googleMeetLinks', href: '/dashboard/integrations?tab=google-meet', icon: Link2 },
        { name: 'Zoom Integration', key: 'zoomIntegration', href: '/dashboard/integrations?tab=zoom', icon: Video },
        { name: 'Microsoft Teams Integration', key: 'microsoftTeamsIntegration', href: '/dashboard/integrations?tab=teams', icon: MessageSquare },
        { name: 'Calendar Sync', key: 'calendarSync', href: '/dashboard/integrations?tab=calendar-sync', icon: Clock }
      ]
    },
    {
      title: 'AI Automation Center',
      items: [
        { name: 'AI Resume Analyzer', key: 'aiResumeAnalyzer', href: '/dashboard/candidate-ranking', icon: Cpu },
        { name: 'AI Candidate Matching', key: 'aiCandidateMatching', href: '/dashboard/candidates?tab=ai-matching', icon: UserCheck },
        { name: 'AI Interview Questions', key: 'aiInterviewQuestions', href: '/dashboard/interview-generator', icon: FileQuestion },
        { name: 'AI Job Description Generator', key: 'aiJobDescriptionGenerator', href: '/dashboard/jobs?tab=ai-generator', icon: Sparkles },
        { name: 'AI HR Reports', key: 'aiHrReports', href: '/dashboard/business-intelligence', icon: BarChart3 },
        { name: 'AI Workforce Insights', key: 'aiWorkforceInsights', href: '/dashboard/workforce-intelligence', icon: BrainCircuit },
        { name: 'AI Copilot', key: 'aiCopilot', href: '/dashboard/ai-assistant', icon: MessageSquare }
      ]
    },
    {
      title: 'Document Center',
      items: [
        { name: 'Offer Letters', key: 'offerLetters', href: '/dashboard/documents?tab=offers', icon: FolderLock },
        { name: 'Contracts', key: 'contracts', href: '/dashboard/documents?tab=contracts', icon: FileClock },
        { name: 'Employee Documents', key: 'employeeDocuments', href: '/dashboard/documents?tab=employee-docs', icon: Users },
        { name: 'Policies', key: 'policies', href: '/dashboard/documents?tab=policies', icon: Shield },
        { name: 'Certificates', key: 'certificates', href: '/dashboard/documents?tab=certificates', icon: Award },
        { name: 'Templates', key: 'templates', href: '/dashboard/documents?tab=templates', icon: Layers }
      ]
    },
    {
      title: 'Analytics Center',
      items: [
        { name: 'Hiring Funnel', key: 'hiringFunnel', href: '/dashboard/analytics?tab=funnel', icon: BarChart3 },
        { name: 'Recruitment Performance', key: 'recruitmentPerformance', href: '/dashboard/analytics?tab=recruitment', icon: LineChart },
        { name: 'Employee Growth', key: 'employeeGrowth', href: '/dashboard/analytics?tab=growth', icon: TrendingUp },
        { name: 'Attendance Analytics', key: 'attendanceAnalytics', href: '/dashboard/analytics?tab=attendance', icon: Clock },
        { name: 'Leave Analytics', key: 'leaveAnalytics', href: '/dashboard/analytics?tab=leave', icon: CalendarDays },
        { name: 'Performance Metrics', key: 'performanceMetrics', href: '/dashboard/analytics?tab=performance', icon: Award },
        { name: 'AI Forecasting', key: 'aiForecasting', href: '/dashboard/workforce-intelligence', icon: BrainCircuit }
      ]
    },
    {
      title: 'Security & Settings',
      items: [
        { name: 'Feedback Center', key: 'feedbackCenter', href: '/dashboard/feedback', icon: MessageSquare },
        { name: 'Workspace Settings', key: 'workspaceSettings', href: '/dashboard/settings', icon: Settings },
        { name: 'Email Configuration', key: 'emailConfiguration', href: '/dashboard/settings?tab=email', icon: Mail },
        { name: 'Roles & Permissions', key: 'rolesPermissions', href: '/dashboard/settings?tab=roles', icon: Users },
        { name: 'Security', key: 'security', href: '/dashboard/security', icon: Shield },
        { name: 'MFA', key: 'mfa', href: '/dashboard/security?tab=mfa', icon: Shield },
        { name: 'Audit Logs', key: 'auditLogs', href: '/dashboard/audit-logs', icon: FileClock },
        { name: 'API Keys', key: 'apiKeys', href: '/dashboard/settings?tab=api-keys', icon: Terminal },
        { name: 'Integrations', key: 'integrations', href: '/dashboard/integrations', icon: Link2 }
      ]
    }
  ];

  // Command Palette options
  const commands = [
    { title: 'Navigate to Dashboard', subtitle: 'Open main recruitment metrics', shortcut: 'G D', action: () => { router.push('/dashboard'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Recruitment', subtitle: 'Manage recruitment pipelines', shortcut: 'G R', action: () => { router.push('/dashboard/candidates'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Employees', subtitle: 'View employee records', shortcut: 'G E', action: () => { router.push('/dashboard/employees'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Analytics', subtitle: 'Open executive metrics', shortcut: 'G A', action: () => { router.push('/dashboard/analytics'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Attendance', subtitle: 'Log working hours and check-ins', shortcut: 'G T', action: () => { router.push('/dashboard/attendance'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Leave Tracker', subtitle: 'Submit or approve leave requests', shortcut: 'G L', action: () => { router.push('/dashboard/leave-management'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Document Vault', subtitle: 'Secure workspace file storage', shortcut: 'G F', action: () => { router.push('/dashboard/documents'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to AI Assistant', subtitle: 'Ask HR assistant questions', shortcut: 'G H', action: () => { router.push('/dashboard/ai-assistant'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Workflows', subtitle: 'Automate repetitive HR tasks', shortcut: 'G W', action: () => { router.push('/dashboard/automations'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Gmail Inbox', subtitle: 'View synced candidate email threads', shortcut: 'G M', action: () => { router.push('/dashboard/gmail'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Integrations', subtitle: 'Connect Slack, Stripe, and Shopify', shortcut: 'G I', action: () => { router.push('/dashboard/integrations'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Settings', subtitle: 'Manage workspace configuration', shortcut: 'G S', action: () => { router.push('/dashboard/settings'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Billing', subtitle: 'Review SaaS subscriptions', shortcut: 'G B', action: () => { router.push('/dashboard/billing'); setCommandPaletteOpen(false); } },
    { title: 'Navigate to Security & MFA', subtitle: 'Workspace access settings', shortcut: 'G X', action: () => { router.push('/dashboard/security'); setCommandPaletteOpen(false); } },
    { title: 'Sign Out Session', subtitle: 'Exit current account', shortcut: '⌥ L', action: () => { handleLogout(); setCommandPaletteOpen(false); } }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(commandQuery.toLowerCase()) || 
    cmd.subtitle.toLowerCase().includes(commandQuery.toLowerCase())
  );

  const handleCommandKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveCommandIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveCommandIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[activeCommandIndex]) {
        filteredCommands[activeCommandIndex].action();
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <WorkforceLoader mode="global" customTitle="Connecting Workspace..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex font-sans overflow-hidden relative">
      <AnimatePresence>
        {navLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-50/80 dark:bg-slate-950/85 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
          >
            <WorkforceLoader mode="global" customTitle={navMessage} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Real-time Toast Alert Notification */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-[999] max-w-sm w-full bg-surface border-2 border-primary text-on-surface rounded-none shadow-xl p-4 flex gap-3 animate-slide-up">
          <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-none bg-primary-light text-primary shrink-0">
            <BellRing size={16} />
          </div>
          <div className="flex-1 overflow-hidden pr-2">
            <h4 className="font-bold text-sm truncate">{activeToast.title}</h4>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{activeToast.message}</p>
          </div>
          <button 
            onClick={() => setActiveToast(null)}
            className="p-1 hover:bg-slate-100 rounded-none text-muted hover:text-on-surface self-start"
          >
            ✕
          </button>
        </div>
      )}

      {/* COMMAND PALETTE MODAL (CMD + K) */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
          <div 
            className="absolute inset-0 bg-surface/40 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <div className="w-full max-w-lg bg-surface border-2 border-primary rounded-none shadow-2xl flex flex-col overflow-hidden animate-slide-up relative z-10">
            <div className="flex items-center px-4 py-3.5 border-b border-outline">
              <Search className="text-primary shrink-0 mr-3" size={18} />
              <input
                ref={commandInputRef}
                type="text"
                value={commandQuery}
                onChange={(e) => { setCommandQuery(e.target.value); setActiveCommandIndex(0); }}
                onKeyDown={handleCommandKeyDown}
                placeholder="Search command actions..."
                className="w-full bg-transparent text-sm text-on-surface focus:outline-none placeholder-muted font-sans"
              />
              <span className="text-[10px] font-mono text-muted bg-surface-high border border-outline px-1.5 py-0.5 rounded-none">ESC</span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted font-mono">No matching command center controls</div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const isActive = idx === activeCommandIndex;
                  return (
                    <button
                      key={cmd.title}
                      onClick={cmd.action}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                        isActive 
                          ? 'bg-primary-light text-primary font-medium' 
                          : 'hover:bg-slate-50 text-on-surface-variant'
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-on-surface'}`}>{cmd.title}</p>
                        <p className="text-[10px] text-muted mt-0.5">{cmd.subtitle}</p>
                      </div>
                      <span className="text-[10px] font-mono text-muted px-2 py-0.5 rounded bg-slate-100">{cmd.shortcut}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Mobile Nav Bar */}
      <div className="lg:hidden w-full navbar-premium h-16 fixed top-0 left-0 right-0 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-sm">T</div>
          <span className="font-bold text-base text-on-surface tracking-tight font-display">TalentOS</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg focus:outline-none"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Full-Height Left Sidebar (Clean White Style) */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface border-r-2 border-primary flex flex-col justify-between
        transform transition-transform duration-355 ease-in-out lg:translate-x-0 lg:static shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="overflow-hidden flex flex-col flex-1">
          {/* Sidebar Brand Logo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-outline">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-none bg-primary flex items-center justify-center font-extrabold text-white text-xs">
                T
              </div>
              <span className="font-bold text-sm text-on-surface tracking-tight font-display">
                TalentOS<span className="text-primary font-mono font-normal">.AI</span>
              </span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-on-surface-variant hover:text-on-surface"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Workspace Info */}
          <div className="px-4 py-3 border-b border-outline">
            <button 
              onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)}
              className="w-full flex items-center justify-between p-2 rounded-none bg-surface-high hover:bg-surface-highest border border-outline transition-all"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-none bg-primary-light flex items-center justify-center text-primary shrink-0 border border-primary">
                  <Layers size={13} />
                </div>
                <div className="overflow-hidden text-left">
                  <p className="text-[8px] text-muted font-bold font-mono uppercase tracking-wider leading-none mb-0.5">Workspace</p>
                  <p className="text-xs font-semibold text-on-surface truncate max-w-[125px]">
                    {currentUser?.company?.name || 'My Company'}
                  </p>
                </div>
              </div>
              <ChevronRight size={12} className={`text-muted transition-transform ${showWorkspaceSwitcher ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Collapse/Expand All Controls */}
          <div className="px-4 py-1.5 flex items-center justify-between text-[8px] text-muted border-b border-outline bg-surface-high font-mono select-none">
            <span>SECTIONS CONTROL</span>
            <div className="flex gap-2">
              <button type="button" onClick={expandAll} className="hover:text-primary font-bold transition-colors">EXPAND ALL</button>
              <span>|</span>
              <button type="button" onClick={collapseAll} className="hover:text-primary font-bold transition-colors">COLLAPSE ALL</button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-2 select-none scrollbar-none">
            {sidebarSections.map((sect) => {
              const isExpanded = expandedSections[sect.title];
              const isHighlighted = sect.title === 'Communication Hub' || sect.title === 'Key Features';
              
              return (
                <div key={sect.title} className="space-y-1">
                  {/* Collapsible Section Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleSection(sect.title)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left font-mono font-bold text-[9px] uppercase tracking-wider transition-all border-l-2 ${
                      sect.title === 'Communication Hub'
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20 border-l-indigo-500'
                        : sect.title === 'Key Features'
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-50/20 dark:bg-amber-950/20 border-l-amber-500 animate-pulse'
                          : 'text-on-surface border-l-transparent hover:bg-surface-high'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {sect.title === 'Key Features' && <Sparkles size={11} className="text-amber-500 animate-spin-slow" />}
                      {sect.title === 'Communication Hub' && <Mail size={11} className="text-indigo-500" />}
                      <span>{sect.title}</span>
                      {sect.title === 'Key Features' && <span className="ml-1 text-[7px] px-1 py-0.5 bg-amber-500 text-white rounded font-sans lowercase font-normal leading-none">demo</span>}
                      {sect.title === 'Communication Hub' && <span className="ml-1 text-[7px] px-1 py-0.5 bg-indigo-500 text-white rounded font-sans lowercase font-normal leading-none">new</span>}
                    </div>
                    <ChevronRight size={10} className={`transition-transform duration-200 text-muted ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Accordion Menu Items Panel */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden space-y-0.5 pl-2.5 border-l border-outline/35 ml-3"
                      >
                        {sect.items.map((item) => {
                          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                                group flex items-center justify-between px-3 py-1.5 rounded-none text-[11px] font-semibold transition-all border-l-2
                                ${isActive 
                                  ? 'bg-primary-light border-l-primary text-primary font-bold' 
                                  : 'border-l-transparent text-on-surface-variant hover:bg-surface-high hover:text-on-surface'}
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <item.icon size={12} className={isActive ? 'text-primary' : 'text-muted group-hover:text-on-surface'} />
                                <span>{t(item.key)}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Subscription and Staff quota details) */}
        <div className="p-3 border-t border-outline bg-surface-high">
          <div className="p-3 bg-surface border-2 border-primary rounded-none">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider block font-mono">Enterprise Plan</span>
            <p className="text-xs font-semibold text-on-surface mt-1">Staging Sandbox</p>
            <div className="mt-2.5 space-y-1">
              <div className="flex justify-between text-[9px] text-on-surface-variant">
                <span>Seat Allocation</span>
                <span className="font-mono font-bold">12 / 20</span>
              </div>
              <div className="w-full h-1 bg-surface-highest rounded-none overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '60%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 py-2 mt-2">
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-on-surface truncate font-display">{currentUser?.name}</p>
              <p className="text-[9px] text-muted truncate font-mono mt-0.5">{currentUser?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-none text-[9px] font-bold text-white-variant hover:bg-error hover:text-white transition-all font-mono uppercase tracking-wider border border-outline hover:border-error"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Top Navbar */}
        <header className="navbar-premium h-16 hidden lg:flex items-center justify-between px-8 z-30 shrink-0">
          
          {/* Search Trigger */}
          <button 
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center justify-between w-80 bg-surface-high hover:bg-surface-highest border border-outline text-xs px-3.5 py-2.5 rounded-none text-muted hover:text-on-surface transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-primary" />
              <span>Search dashboard actions...</span>
            </div>
            <span className="text-[9px] font-mono text-muted bg-surface border border-outline px-1.5 py-0.5 rounded-none">⌘ K</span>
          </button>
          
          <div className="flex items-center gap-4">
            
            {/* Quick Actions trigger */}
            <Link 
              href="/dashboard/jobs" 
              className="px-3.5 py-2 rounded-none bg-primary hover:bg-primary/90 text-xs font-bold text-background transition flex items-center gap-1.5"
            >
              <Plus size={12} />
              Quick Create
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-surface-high border border-outline rounded-none px-2.5 py-2 text-on-surface-variant text-xs">
              <Globe size={13} className="text-primary" />
              <select
                value={lang}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-on-surface"
              >
                <option value="en" className="bg-surface text-on-surface">EN</option>
                <option value="ur" className="bg-surface text-on-surface">UR</option>
                <option value="ar" className="bg-surface text-on-surface">AR</option>
                <option value="fr" className="bg-surface text-on-surface">FR</option>
                <option value="es" className="bg-surface text-on-surface">ES</option>
                <option value="de" className="bg-surface text-on-surface">DE</option>
              </select>
            </div>

            {/* Quick Theme Switcher */}
            <ThemeToggle />

            {/* Notifications */}
            <Link 
              href="/dashboard/notifications"
              className="p-2 text-on-surface-variant hover:text-on-surface rounded-none relative hover:bg-surface-high transition border border-transparent hover:border-outline"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-none"></span>
              )}
            </Link>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-8 h-8 rounded-none bg-primary-light flex items-center justify-center font-bold text-xs text-primary border border-primary hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none"
                aria-label="User Profile"
              >
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border-2 border-primary rounded-none shadow-none py-2 z-50 animate-slide-up">
                  {/* User info */}
                  <div className="px-4 py-2.5 border-b border-outline">
                    <p className="text-xs font-bold text-on-surface truncate font-display">{currentUser?.name}</p>
                    <p className="text-[10px] text-muted truncate font-mono mt-0.5">{currentUser?.email}</p>
                  </div>

                  {/* Theme Switcher Segmented Control */}
                  <div className="px-4 py-2 border-b border-outline">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider block font-mono mb-1.5">Theme Preference</span>
                    <div className="flex rounded-none bg-surface-high border border-outline p-0.5">
                      {[
                        { name: 'light', label: 'Light', icon: Sun },
                        { name: 'dark', label: 'Dark', icon: Moon },
                        { name: 'system', label: 'System', icon: Monitor }
                      ].map((t) => {
                        const Icon = t.icon;
                        const isSelected = theme === t.name;
                        return (
                          <button
                            key={t.name}
                            type="button"
                            onClick={() => setTheme(t.name)}
                            className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-none text-[10px] font-bold transition-all ${
                              isSelected 
                                ? 'bg-primary text-background shadow-none' 
                                : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            <Icon size={11} />
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-1">
                    <Link 
                      href="/dashboard/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full text-left block px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-high hover:text-on-surface transition-colors"
                    >
                      Workspace Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-outline pt-1">
                    <button 
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left block px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Box */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 bg-background relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.25] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 pb-20">
            {user?.email === 'demo@talentos.ai' && (
              <div className="mb-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative z-20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Welcome to the TalentOS Public Demo</h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">This environment is designed for testing and feedback. Actions are non-destructive.</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFeedbackModalType('General Feedback'); setFeedbackModalOpen(true); }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  Provide Feedback
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {/* FLOATING FEEDBACK ACTIONS */}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-2 items-end">
        <button
          onClick={() => { setFeedbackModalType('Bug Report'); setFeedbackModalOpen(true); }}
          className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group relative"
          title="Report Bug"
        >
          <Bug className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setFeedbackModalType('Feature Request'); setFeedbackModalOpen(true); }}
          className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group relative"
          title="Suggest Feature"
        >
          <Lightbulb className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setFeedbackModalType('General Feedback'); setFeedbackModalOpen(true); }}
          className="p-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group relative"
          title="Feedback Center"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

      <FeedbackModal 
        isOpen={feedbackModalOpen} 
        onClose={() => setFeedbackModalOpen(false)} 
        initialType={feedbackModalType} 
      />

      {/* FLOATING WORKPLACE ASSISTANT DRAWER */}
      <AnimatePresence>
        {copilotOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              onClick={() => setCopilotOpen(false)}
              className="fixed inset-0 bg-[#0F172A] z-[998]"
            />
            
            {/* Slide-in panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-surface border-l-2 border-primary shadow-2xl z-[999] flex flex-col overflow-hidden font-sans"
            >
              {/* Header */}
              <div className="p-4 border-b-2 border-primary bg-surface-high flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] flex items-center justify-center text-white shadow-[0_0_12px_rgba(37,99,235,0.2)]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface font-display leading-tight">TalentOS Copilot</h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setCopilotOpen(false)}
                  className="p-1.5 hover:bg-surface-highest border border-outline rounded-xl text-on-surface-variant hover:text-on-surface transition-all"
                  aria-label="Close panel"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Chat Message Content Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background scrollbar-none">
                
                {/* Onboarding Welcome / Capabilities Card */}
                {copilotMessages.length === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-surface border border-outline rounded-2xl space-y-3.5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
                      <BrainCircuit size={14} className="text-[#14B8A6]" />
                      <span>Copilot Platform Capabilities</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      I can help you manage operations, analyze metrics, and write descriptions:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant font-medium">
                      {[
                        'Create Job Posts', 'Find Candidates', 'Analyze Resumes',
                        'Generate Interview Questions', 'Generate HR Reports', 'Leave Insights',
                        'Attendance Insights', 'Employee Search'
                      ].map((cap, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full shrink-0"></span>
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Message logs */}
                {copilotMessages.map((msg, index) => (
                  <motion.div 
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      max-w-[85%] rounded-2xl p-3.5 leading-relaxed text-xs shadow-sm font-sans
                      ${msg.sender === 'user' 
                        ? 'bg-primary text-white font-medium border border-primary' 
                        : 'bg-surface border border-outline text-on-surface'}
                    `}>
                      {msg.streaming && msg.id === streamingMessageId ? (
                        <StreamingText text={msg.text} onComplete={() => handleStreamComplete(msg.id)} />
                      ) : (
                        <span>{msg.text}</span>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Animated Status Execution Cards */}
                {executingTool && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="border border-outline/30 rounded-3xl overflow-hidden p-1.5 shadow-lg bg-surface/50 dark:bg-slate-900/50 backdrop-blur-md"
                  >
                    <WorkforceLoader mode="ai-thinking" customTitle={executingTool.label} isFinished={!executingTool} />
                  </motion.div>
                )}

                {/* Loading typing bubble */}
                {copilotLoading && !executingTool && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-surface border border-outline text-muted rounded-2xl p-3.5 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Quick Click Action Chips */}
              <div className="px-3 py-2.5 bg-surface-high border-t border-outline flex gap-2 overflow-x-auto scrollbar-none shrink-0 select-none">
                {[
                  { name: 'Create Job', text: 'Create a job description for Senior Full-Stack Engineer' },
                  { name: 'Analyze Resume', text: 'Analyze resume fit for lead frontend developer role' },
                  { name: 'Generate Questions', text: 'Generate technical interview questions for a Product Designer' },
                  { name: 'Employee Search', text: 'Search for active employees in Engineering department' },
                  { name: 'Generate Report', text: 'Generate an annual recruitment funnel conversion report' }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => handleCopilotSend(e, p.text)}
                    className="px-3 py-1.5 bg-surface hover:bg-primary hover:text-white border border-outline rounded-full text-xs font-bold text-on-surface-variant transition-all whitespace-nowrap shadow-sm"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleCopilotSend} className="p-4 border-t border-outline bg-surface flex gap-2 shrink-0">
                <input 
                  type="text" 
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  placeholder="Ask TalentOS AI..."
                  className="input-modern flex-1 !py-2.5 !px-4 text-xs font-sans"
                  disabled={copilotLoading || !!executingTool}
                />
                <button 
                  type="submit"
                  disabled={!copilotInput.trim() || copilotLoading || !!executingTool}
                  className="p-2.5 rounded-xl bg-primary text-white border border-primary hover:bg-transparent hover:text-primary disabled:opacity-50 transition shrink-0 flex items-center justify-center shadow-sm"
                >
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Circular Orb Bubble Launcher */}
      {!copilotOpen && (
        <motion.button 
          onClick={() => setCopilotOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] text-white flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] z-[990] cursor-pointer group focus:outline-none"
          title="Ask TalentOS AI"
        >
          {/* Outer glow ring animation */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] opacity-35 animate-ping pointer-events-none group-hover:scale-110 group-hover:opacity-15 transition-all duration-300"></span>
          
          <Sparkles className="w-6 h-6 lg:w-7 lg:h-7 animate-pulse text-white" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 px-3 py-1.5 bg-[#0F172A] text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-md border border-slate-800">
            Ask TalentOS AI
          </div>
        </motion.button>
      )}
    </div>
  );
}
