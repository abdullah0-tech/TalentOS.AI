'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { request } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  LayoutDashboard, 
  User, 
  Clock, 
  CalendarDays, 
  FolderLock, 
  GraduationCap, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Send,
  MessageSquare,
  Globe
} from 'lucide-react';

export default function EmployeeLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, changeLanguage, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Copilot Panel states
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState([
    { sender: 'assistant', text: 'Hi! I am your TalentOS Employee Assistant. How can I help you with your profile, leaves, attendance, or training today?' }
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
    } else {
      const user = authService.getCurrentUser();
      if (user && user.mustChangePassword) {
        router.push('/change-password');
      } else {
        setCurrentUser(user);
        setAuthChecked(true);
      }
    }
  }, [router]);

  const handleCopilotSend = async (e, customText = null) => {
    if (e) e.preventDefault();
    const text = customText || copilotInput;
    if (!text.trim() || copilotLoading) return;

    const userMsg = { sender: 'user', text };
    setCopilotMessages(prev => [...prev, userMsg]);
    if (!customText) setCopilotInput('');
    setCopilotLoading(true);

    try {
      const data = await request('/chat', {
        method: 'POST',
        body: { message: text }
      });
      setCopilotMessages(prev => [...prev, { sender: 'assistant', text: data.response }]);
    } catch (err) {
      console.error('Copilot send failure:', err);
      setCopilotMessages(prev => [...prev, { sender: 'assistant', text: 'Sorry, I failed to process that request.' }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner"></div>
          <p className="text-muted text-xs font-mono uppercase tracking-wider">Verifying Employee Account...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', key: 'dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', key: 'profile', href: '/employee/profile', icon: User },
    { name: 'Time & Attendance', key: 'attendance', href: '/employee/attendance', icon: Clock },
    { name: 'Leave Requests', key: 'leaveTracker', href: '/employee/leave', icon: CalendarDays },
    { name: 'Documents Vault', key: 'documents', href: '/employee/documents', icon: FolderLock },
    { name: 'LMS & Training', key: 'training', href: '/employee/training', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-background flex font-sans overflow-hidden relative">
      {/* Horizontal Mobile Nav Bar */}
      <div className="lg:hidden w-full navbar-premium h-16 fixed top-0 left-0 right-0 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-none bg-primary flex items-center justify-center font-bold text-white">T</div>
          <span className="font-bold text-lg text-on-surface tracking-tight font-display">TalentOS</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-on-surface-variant hover:text-on-surface focus:outline-none"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Section */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface border-r-2 border-primary flex flex-col justify-between
        transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="overflow-hidden flex flex-col flex-1">
          {/* Sidebar Brand Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-outline">
            <Link href="/employee/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-none bg-primary flex items-center justify-center font-extrabold text-white text-xs">
                T
              </div>
              <span className="font-bold text-sm text-on-surface tracking-tight font-display">
                TalentOS<span className="text-primary font-mono font-normal">.Portal</span>
              </span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-on-surface-variant hover:text-on-surface"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Profile Summary */}
          <div className="px-4 py-4 border-b border-outline">
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-none bg-surface-high border border-outline">
              <div className="w-8 h-8 rounded-none bg-primary-light flex items-center justify-center text-primary font-bold text-sm border border-primary">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[8px] text-muted font-bold font-mono uppercase tracking-wider leading-none mb-0.5">Employee Portal</p>
                <p className="text-xs font-semibold text-on-surface truncate max-w-[125px]">
                  {currentUser?.name || 'Employee'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-none">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/employee/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center justify-between px-3 py-2 rounded-none text-xs font-medium transition-all border-l-2
                    ${isActive 
                      ? 'bg-primary-light border-l-primary text-primary font-bold' 
                      : 'border-l-transparent text-on-surface-variant hover:bg-surface-high hover:text-on-surface'}
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={14} className={isActive ? 'text-primary' : 'text-muted group-hover:text-on-surface'} />
                    <span>{t ? t(item.key) : item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-outline bg-surface-high">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-none text-xs font-bold text-white-variant hover:bg-error hover:text-white transition-all font-mono uppercase tracking-wider border border-outline hover:border-error"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative z-10">
        {/* Top Navbar */}
        <header className="navbar-premium h-16 hidden lg:flex items-center justify-between px-8 z-30 shrink-0">
          <div className="text-on-surface font-semibold text-xs">
            Welcome back, <span className="text-primary">{currentUser?.name}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-surface-high border border-outline rounded-none px-2.5 py-2 text-on-surface-variant text-xs">
              <Globe size={13} className="text-primary" />
              <select
                value={lang}
                onChange={(e) => changeLanguage && changeLanguage(e.target.value)}
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

            <div className="w-8 h-8 rounded-none bg-primary-light flex items-center justify-center font-bold text-xs text-primary border border-primary">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Box */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 bg-background relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.25] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 pb-20">
            {children}
          </div>
        </main>
      </div>

      {/* FLOATING AI COPILOT PANEL */}
      <div className="fixed bottom-6 right-6 z-[900] flex flex-col items-end font-sans">
        {/* Chat window panel */}
        {copilotOpen && (
          <div className="w-[390px] h-[510px] bg-surface border-2 border-primary text-on-surface rounded-none shadow-xl flex flex-col overflow-hidden mb-4 animate-slide-up">
            {/* Header */}
            <div className="p-4 border-b-2 border-primary bg-surface-high flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary-light rounded-none text-primary border border-primary">
                  <Sparkles size={15} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-on-surface">Employee Copilot</h4>
                  <span className="text-[9px] text-primary font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-primary rounded-none animate-pulse"></span> Support Active
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setCopilotOpen(false)}
                className="p-1 hover:bg-surface-high border border-outline rounded-none text-muted hover:text-on-surface"
              >
                ✕
              </button>
            </div>

            {/* Quick action chips */}
            <div className="p-3 bg-surface-high flex gap-2 overflow-x-auto shrink-0 border-b border-outline no-scrollbar">
              <button 
                onClick={(e) => handleCopilotSend(e, 'How many leave days do I have left?')}
                className="px-2.5 py-1 rounded-none bg-surface hover:bg-primary-light border border-outline hover:border-primary text-[10px] text-white-variant font-semibold whitespace-nowrap transition"
              >
                📅 Check Leaves
              </button>
              <button 
                onClick={(e) => handleCopilotSend(e, 'What is the company leave policy?')}
                className="px-2.5 py-1 rounded-none bg-surface hover:bg-primary-light border border-outline hover:border-primary text-[10px] text-white-variant font-semibold whitespace-nowrap transition"
              >
                📜 Leave Policy
              </button>
              <button 
                onClick={(e) => handleCopilotSend(e, 'Show my contact information')}
                className="px-2.5 py-1 rounded-none bg-surface hover:bg-primary-light border border-outline hover:border-primary text-[10px] text-white-variant font-semibold whitespace-nowrap transition"
              >
                👤 Profile Info
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-background scrollbar-none">
              {copilotMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] rounded-none p-3 leading-relaxed whitespace-pre-wrap text-[11px]
                    ${msg.sender === 'user' 
                      ? 'bg-primary text-background font-medium border border-primary' 
                      : 'bg-surface border border-outline text-on-surface'}
                  `}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-outline text-muted rounded-none p-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-muted rounded-none animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-muted rounded-none animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-muted rounded-none animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleCopilotSend} className="p-3 border-t border-outline bg-surface flex gap-2">
              <input 
                type="text" 
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                placeholder="Ask about leaves, training, attendance..."
                className="input-modern flex-1 !py-2 !px-3 text-xs"
              />
              <button 
                type="submit"
                disabled={!copilotInput.trim() || copilotLoading}
                className="p-2 rounded-none bg-primary text-background border-2 border-primary hover:bg-transparent hover:text-primary disabled:opacity-50 transition"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        )}

        {/* Bubble Button */}
        <button 
          onClick={() => setCopilotOpen(!copilotOpen)}
          className="flex items-center gap-2 px-4 py-3 rounded-none bg-primary text-background border-2 border-primary shadow-xl transition hover:scale-105"
        >
          <Sparkles size={18} className="animate-pulse" />
          <span className="font-semibold text-sm">Ask Copilot</span>
        </button>
      </div>
    </div>
  );
}
