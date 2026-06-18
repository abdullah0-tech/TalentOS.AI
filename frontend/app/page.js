'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import { 
  ArrowRight, Bot, Cpu, Users, Shield, Terminal, ArrowUpRight, Check, 
  FileText, Lock, Star, HelpCircle, ChevronDown, Sparkles, Plus, 
  Calendar, FileCode, Brain, TrendingUp, BarChart3, Clock, DollarSign,
  Menu, X, Briefcase, Award, Zap, ChevronRight, Play, Search, MessageSquare, Settings, CheckSquare
} from 'lucide-react';

export default function Home() {
  const [activeMockupTab, setActiveMockupTab] = useState('dashboard');
  const [billingPeriod, setBillingPeriod] = useState('annual');
  const [activeFaq, setActiveFaq] = useState(null);
  
  // AI Copilot Sandbox State
  const [chatPrompt, setChatPrompt] = useState(null);
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am your TalentOS HR Copilot. Ask me to draft job descriptions, screen resumes, or analyze employee performance.' }
  ]);

  // Employee Portal Live Sandbox State
  const [portalClockedIn, setPortalClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState('--:--');

  // SVG Logos as components for high-quality SaaS style
  const trustLogos = [
    { name: 'Acme Corp', icon: '⚡' },
    { name: 'Orbit Tech', icon: '🪐' },
    { name: 'LinearS', icon: '⧉' },
    { name: 'StripeX', icon: '💳' },
    { name: 'Vercelify', icon: '▲' },
    { name: 'Retooler', icon: '🛠️' }
  ];

  // AI chat simulation handler
  const triggerCopilotSimulation = (promptType) => {
    if (chatLoading) return;
    
    let userMessage = '';
    let responseText = '';
    
    if (promptType === 'assess') {
      userMessage = 'Assess Marcus Vance for the Senior React Developer role.';
      responseText = `### AI Fit Score: 92% (Strong Match)\n\n**Candidate Summary:**\nMarcus Vance has 6+ years of experience with React, Next.js, and TypeScript. He has built scalable state management architectures and optimized frontend render performance.\n\n**Key Strengths:**\n- Proficient in React 18 & Next.js App Router\n- Strong background in architectural design patterns\n- Experiencing leading junior developers\n\n**Potential Risks:**\n- Limited backend experience (Node.js/Prisma details are thin in his profile)\n\n**Recommended Next Action:**\nProceed to Technical Interview stage.`;
    } else if (promptType === 'questions') {
      userMessage = 'Generate 3 technical interview questions for a Senior Node.js Engineer.';
      responseText = `### Recommended Interview Questions:\n\n1. **Prisma & Database Optimization:** "How do you analyze database queries with Prisma? Walk me through how you would optimize a slow relational query in a multi-tenant application."\n2. **Memory Leak Diagnostics:** "Describe a scenario where you debugged a memory leak in a running Express server. What tools and metrics did you use?"\n3. **Event-Driven Architecture:** "When designing microservices with Node.js, how do you handle eventual consistency and message retries between nodes?"`;
    } else if (promptType === 'jd') {
      userMessage = 'Draft a Job Description snippet for an HR Business Partner.';
      responseText = `### Job Description: HR Business Partner (Remote)\n\n**Role Overview:**\nWe are looking for a strategic HR Business Partner to align business objectives with employees and management in designated business units.\n\n**Key Responsibilities:**\n- Partner with department leads to design organization structures and talent pipelines.\n- Oversee employee relations, performance reviews, and retention strategies.\n- Use data analytics to guide workforce development and hiring metrics.`;
    }

    // Add user message
    const updatedHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(updatedHistory);
    setChatLoading(true);

    setTimeout(() => {
      setChatLoading(false);
      setChatHistory(prev => [...prev, { role: 'assistant', content: responseText }]);
    }, 1500);
  };

  const handlePortalClockToggle = () => {
    if (!portalClockedIn) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setClockInTime(timeStr);
      setPortalClockedIn(true);
    } else {
      setPortalClockedIn(false);
      setClockInTime('--:--');
    }
  };

  return (
    <div className="min-h-screen bg-surface-high dark:bg-background text-on-surface dark:text-on-surface flex flex-col font-sans transition-colors duration-200">
      
      {/* Premium Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 dark:bg-background/80 backdrop-blur-md border-b border-outline dark:border-outline/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Elegant Icon Logo */}
            <div className="w-9 h-9 bg-[#0047FF] hover:bg-[#0036C7] rounded-xl flex items-center justify-center text-on-surface transition-all shadow-md shadow-blue-500/10">
              <Sparkles size={18} className="text-on-surface" />
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface dark:text-on-surface font-display">
              TalentOS<span className="text-[#0047FF]">.AI</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface-variant dark:text-on-surface-variant">
            <a href="#features" className="hover:text-[#0047FF] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#0047FF] transition-colors">How It Works</a>
            <a href="#copilot" className="hover:text-[#0047FF] transition-colors">HR Copilot</a>
            <a href="#employee-portal" className="hover:text-[#0047FF] transition-colors">Employee Portal</a>
            <a href="#pricing" className="hover:text-[#0047FF] transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/login" 
              className="text-sm font-semibold text-on-surface-variant dark:text-on-surface-variant hover:text-[#0047FF] dark:hover:text-[#0047FF] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="hidden sm:inline-flex px-4 py-2 bg-[#0047FF] hover:bg-[#0036C7] text-on-surface text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/10"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 pt-16">
        
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
          {/* Neon backdrop blurs for premium aesthetic */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            {/* Category Banner Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/40 text-xs font-semibold text-[#0047FF] dark:text-blue-400 mb-8 animate-fade-in">
              <Sparkles size={12} className="text-[#0047FF] dark:text-blue-400" />
              <span>The Operating System for Modern Workforce Management</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] text-on-surface dark:text-on-surface font-display">
              AI-Powered Hiring & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#0047FF] to-blue-500 bg-clip-text text-transparent">
                Workforce Management
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-xl text-on-surface-variant dark:text-muted max-w-2xl mx-auto leading-relaxed">
              Recruit talent, automate HR operations, manage employees, and unlock workforce intelligence from a single intelligent platform.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-7 py-3.5 bg-[#0047FF] hover:bg-[#0036C7] text-on-surface text-base font-semibold rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <a 
                href="#copilot" 
                className="w-full sm:w-auto px-7 py-3.5 bg-surface dark:bg-surface border border-outline dark:border-outline text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-high dark:hover:bg-surface-high/80 text-base font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Play size={15} className="fill-current text-on-surface-variant dark:text-muted" /> Watch Demo
              </a>
            </div>

            {/* ----------------- INTERACTIVE PRODUCT MOCKUP ----------------- */}
            <div className="mt-16 sm:mt-24 max-w-5xl mx-auto border border-outline dark:border-outline/80 rounded-2xl bg-surface dark:bg-surface shadow-2xl overflow-hidden">
              
              {/* Mockup Header Controls */}
              <div className="px-4 py-3 bg-surface-high dark:bg-background border-b border-outline dark:border-outline/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500/70" />
                  <span className="ml-4 text-xs font-medium text-muted dark:text-muted font-mono">talent-os.cloud/dashboard</span>
                </div>
                
                {/* Desktop Tabs */}
                <div className="hidden sm:flex items-center gap-1.5 bg-surface-highest/60 dark:bg-surface/60 p-0.5 rounded-lg border border-outline/80 dark:border-outline/40">
                  {['dashboard', 'recruitment', 'portal', 'copilot_tab', 'analytics'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveMockupTab(tab)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeMockupTab === tab 
                          ? 'bg-surface dark:bg-surface-high text-[#0047FF] dark:text-white shadow-sm' 
                          : 'text-on-surface-variant dark:text-muted hover:text-on-surface dark:hover:text-on-surface'
                      }`}
                    >
                      {tab === 'copilot_tab' ? 'AI Copilot' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                
                <div className="w-12 h-2" />
              </div>

              {/* Mobile Tab Selector */}
              <div className="sm:hidden grid grid-cols-5 border-b border-outline dark:border-outline/80 bg-surface-high dark:bg-background">
                {['dashboard', 'recruitment', 'portal', 'copilot_tab', 'analytics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveMockupTab(tab)}
                    className={`py-3 text-[10px] font-bold text-center border-r last:border-r-0 border-outline dark:border-outline/80 ${
                      activeMockupTab === tab ? 'text-[#0047FF] dark:text-white bg-surface dark:bg-surface' : 'text-muted'
                    }`}
                  >
                    {tab === 'copilot_tab' ? 'Copilot' : tab.charAt(0).toUpperCase() + tab.slice(1, 4)}
                  </button>
                ))}
              </div>

              {/* Mockup Screen Canvas */}
              <div className="min-h-[380px] sm:min-h-[480px] p-4 sm:p-6 bg-surface-high dark:bg-background text-left font-sans">
                
                {/* 1. DASHBOARD MOCKUP SCREEN */}
                {activeMockupTab === 'dashboard' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-outline dark:border-outline">
                      <div>
                        <h3 className="text-lg font-bold text-on-surface dark:text-on-surface">Workspace Overview</h3>
                        <p className="text-xs text-muted">Welcome back, Recruiter Team</p>
                      </div>
                      <span className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full border border-green-500/20">
                        ● All Systems Operational
                      </span>
                    </div>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl shadow-sm">
                        <span className="text-[10px] font-semibold tracking-wider text-muted block uppercase">Total Employees</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-bold text-on-surface dark:text-on-surface">142</span>
                          <span className="text-xs font-semibold text-green-500">+12%</span>
                        </div>
                      </div>
                      <div className="p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl shadow-sm">
                        <span className="text-[10px] font-semibold tracking-wider text-muted block uppercase">Open Positions</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-bold text-on-surface dark:text-on-surface">18</span>
                          <span className="text-xs font-medium text-muted">3 new</span>
                        </div>
                      </div>
                      <div className="p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl shadow-sm">
                        <span className="text-[10px] font-semibold tracking-wider text-muted block uppercase">Avg. Time to Hire</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-bold text-on-surface dark:text-on-surface">19 days</span>
                          <span className="text-xs font-semibold text-green-500">-5d</span>
                        </div>
                      </div>
                      <div className="p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl shadow-sm">
                        <span className="text-[10px] font-semibold tracking-wider text-muted block uppercase">Attendance Rate</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-bold text-on-surface dark:text-on-surface">98.4%</span>
                          <span className="text-xs font-semibold text-green-500">Optimal</span>
                        </div>
                      </div>
                    </div>
                    {/* Bottom Split */}
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Active Jobs */}
                      <div className="lg:col-span-2 p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-on-surface dark:text-on-surface uppercase tracking-wider">Recent Job Postings</h4>
                        <div className="space-y-2">
                          {[
                            { title: 'Senior Product Designer', dept: 'Design', applicants: '48 candidates', date: '2d ago' },
                            { title: 'Lead Full-Stack Engineer', dept: 'Engineering', applicants: '112 candidates', date: '5d ago' },
                            { title: 'HR Operations Manager', dept: 'People Ops', applicants: '26 candidates', date: '1w ago' }
                          ].map((job, idx) => (
                            <div key={idx} className="p-3 bg-surface-high dark:bg-background rounded-lg flex items-center justify-between border border-outline dark:border-outline">
                              <div>
                                <p className="text-xs font-semibold text-on-surface dark:text-on-surface">{job.title}</p>
                                <span className="text-[10px] text-muted">{job.dept} • {job.applicants}</span>
                              </div>
                              <span className="text-[10px] font-mono text-muted">{job.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Live Activity */}
                      <div className="p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-on-surface dark:text-on-surface uppercase tracking-wider">AI Operations Feed</h4>
                        <div className="space-y-3">
                          {[
                            { text: 'AI screened "Sophia Chen" as 94% fit match for Lead Engineer', time: '10m ago' },
                            { text: 'New job description generated: "Staff Accountant"', time: '1h ago' },
                            { text: 'Auto-approved leave request: David Jones (Annual Leave)', time: '3h ago' }
                          ].map((act, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0047FF] mt-1.5 shrink-0" />
                              <div className="overflow-hidden">
                                <p className="text-[11px] text-on-surface-variant dark:text-on-surface-variant leading-normal">{act.text}</p>
                                <span className="text-[9px] font-mono text-muted block mt-0.5">{act.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. RECRUITMENT MOCKUP SCREEN */}
                {activeMockupTab === 'recruitment' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-outline dark:border-outline">
                      <div>
                        <h3 className="text-lg font-bold text-on-surface dark:text-on-surface">Active Candidate Pipeline</h3>
                        <p className="text-xs text-muted">Role: Senior Product Designer</p>
                      </div>
                      <button className="px-3 py-1.5 bg-[#0047FF] text-on-surface text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5">
                        <Plus size={12} /> Add Candidate
                      </button>
                    </div>
                    {/* Kanban Columns */}
                    <div className="grid grid-cols-4 gap-4 pt-2">
                      {[
                        { 
                          name: 'Applied', 
                          count: 3, 
                          cards: [
                            { name: 'Sarah Jenkins', score: '82%', tag: 'Design System', company: 'Figma' },
                            { name: 'Lucas Rossi', score: '79%', tag: 'SaaS UX', company: 'Sketch' }
                          ]
                        },
                        { 
                          name: 'AI Screening', 
                          count: 2, 
                          cards: [
                            { name: 'Sophia Chen', score: '94%', tag: 'Design Dev', company: 'Stripe', hot: true }
                          ]
                        },
                        { 
                          name: 'Interviewing', 
                          count: 3, 
                          cards: [
                            { name: 'Marcus Vance', score: '88%', tag: 'Web Architect', company: 'Vercel' }
                          ]
                        },
                        { 
                          name: 'Offered', 
                          count: 1, 
                          cards: [
                            { name: 'Emily Zhang', score: '91%', tag: 'Research Lead', company: 'Airbnb' }
                          ]
                        }
                      ].map((col, idx) => (
                        <div key={idx} className="space-y-3">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold text-on-surface-variant dark:text-on-surface-variant">{col.name}</span>
                            <span className="text-[10px] font-bold bg-surface-highest dark:bg-surface-high text-on-surface-variant dark:text-muted px-1.5 py-0.5 rounded-full">{col.count}</span>
                          </div>
                          <div className="space-y-2 min-h-[250px] p-2 bg-surface-highest/40 dark:bg-surface/60 rounded-xl border border-outline/50 dark:border-outline/40">
                            {col.cards.map((card, cIdx) => (
                              <div key={cIdx} className="p-3 bg-surface dark:bg-surface border border-outline/60 dark:border-outline rounded-lg shadow-sm hover:border-[#0047FF] transition-all space-y-2 cursor-pointer">
                                <div className="flex items-start justify-between">
                                  <p className="text-xs font-semibold text-on-surface dark:text-on-surface truncate">{card.name}</p>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    parseInt(card.score) >= 90 
                                      ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-405'
                                  }`}>
                                    {card.score}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-muted font-medium">
                                  <span>Ex: {card.company}</span>
                                  <span className="bg-surface-highest dark:bg-background px-1.5 py-0.5 rounded border border-outline/40 dark:border-outline">{card.tag}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. EMPLOYEE PORTAL MOCKUP SCREEN */}
                {activeMockupTab === 'portal' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-outline dark:border-outline">
                      <div>
                        <h3 className="text-lg font-bold text-on-surface dark:text-on-surface">Employee Self-Service Portal</h3>
                        <p className="text-xs text-muted">Signed in as: **Sarah Jenkins (Product Designer)**</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-muted font-medium">Shift Active</span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Attendance Clocking Widget */}
                      <div className="p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl shadow-sm text-center flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-muted uppercase tracking-wider block">Attendance Clock</h4>
                          <p className="text-3xl font-extrabold text-on-surface dark:text-on-surface mt-2 font-mono">
                            {portalClockedIn ? clockInTime : '09:00'}
                          </p>
                          <span className="text-[10px] text-muted block mt-1">Shift Start: 09:00 AM</span>
                        </div>
                        <button
                          onClick={handlePortalClockToggle}
                          className={`w-full py-2.5 text-xs font-semibold rounded-lg shadow-sm transition-all border ${
                            portalClockedIn 
                              ? 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20' 
                              : 'bg-[#0047FF] text-white border-transparent hover:bg-[#0036C7]'
                          }`}
                        >
                          {portalClockedIn ? 'Clock Out of Shift' : 'Clock In Now'}
                        </button>
                      </div>

                      {/* Leaves Widget */}
                      <div className="p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Leave Balance</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-on-surface-variant dark:text-on-surface-variant">Annual Paid Leave</span>
                            <span className="text-xs font-bold text-on-surface dark:text-on-surface">14 / 20 days</span>
                          </div>
                          <div className="w-full bg-surface-highest dark:bg-background h-2 rounded-full overflow-hidden">
                            <div className="bg-[#0047FF] h-full rounded-full" style={{ width: '70%' }} />
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-xs font-medium text-on-surface-variant dark:text-on-surface-variant">Sick Leave</span>
                            <span className="text-xs font-bold text-on-surface dark:text-on-surface">5 / 7 days</span>
                          </div>
                          <div className="w-full bg-surface-highest dark:bg-background h-2 rounded-full overflow-hidden">
                            <div className="bg-yellow-500 h-full rounded-full" style={{ width: '71%' }} />
                          </div>
                        </div>
                      </div>

                      {/* Documents Vault */}
                      <div className="p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">My Secure Files</h4>
                        <div className="space-y-2">
                          {[
                            { name: 'Passport_Expiry_2028.pdf', size: '1.2 MB' },
                            { name: 'Employment_Contract.pdf', size: '840 KB' },
                            { name: 'Direct_Deposit_Form.pdf', size: '210 KB' }
                          ].map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs p-2 bg-surface-high dark:bg-background hover:bg-surface-highest dark:hover:bg-surface border border-outline dark:border-outline rounded-lg cursor-pointer">
                              <span className="font-semibold text-on-surface-variant dark:text-on-surface-variant truncate max-w-[120px]">{doc.name}</span>
                              <span className="text-[10px] text-muted font-mono font-medium">{doc.size}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. AI COPILOT MOCKUP SCREEN */}
                {activeMockupTab === 'copilot_tab' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-outline dark:border-outline">
                      <div>
                        <h3 className="text-lg font-bold text-on-surface dark:text-on-surface">TalentOS HR Copilot</h3>
                        <p className="text-xs text-muted">AI workflow assistance & analytics</p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-[#0047FF] bg-blue-100 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200/50">
                        ⚡ GPT-4o Enhanced
                      </span>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-4 h-[320px]">
                      {/* Quick Actions List */}
                      <div className="p-3 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl flex flex-col justify-between space-y-2">
                        <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider">Simulate Actions</h4>
                        <div className="space-y-2 flex-1 pt-2">
                          <button 
                            onClick={() => triggerCopilotSimulation('assess')}
                            className="w-full p-2.5 text-left text-xs font-medium text-slate-750 hover:text-[#0047FF] bg-surface-high hover:bg-surface-highest dark:bg-background dark:hover:bg-surface border border-outline/40 dark:border-outline rounded-lg transition-all"
                          >
                            Assess candidate "Marcus Vance"
                          </button>
                          <button 
                            onClick={() => triggerCopilotSimulation('questions')}
                            className="w-full p-2.5 text-left text-xs font-medium text-slate-750 hover:text-[#0047FF] bg-surface-high hover:bg-surface-highest dark:bg-background dark:hover:bg-surface border border-outline/40 dark:border-slate-905 rounded-lg transition-all"
                          >
                            Generate Node.js interview questions
                          </button>
                          <button 
                            onClick={() => triggerCopilotSimulation('jd')}
                            className="w-full p-2.5 text-left text-xs font-medium text-slate-750 hover:text-[#0047FF] bg-surface-high hover:bg-surface-highest dark:bg-background dark:hover:bg-surface border border-outline/40 dark:border-slate-905 rounded-lg transition-all"
                          >
                            Draft JD snippet for HR Partner
                          </button>
                        </div>
                        <p className="text-[10px] text-muted font-medium">Click any action to simulate AI dialogue</p>
                      </div>

                      {/* Chat Console Log */}
                      <div className="lg:col-span-2 bg-surface-highest dark:bg-background border border-outline dark:border-outline/80 rounded-xl overflow-hidden flex flex-col justify-between">
                        {/* Conversation messages */}
                        <div className="p-4 flex-1 overflow-y-auto space-y-3 font-sans text-xs">
                          {chatHistory.slice(-2).map((msg, idx) => (
                            <div key={idx} className={`p-3 rounded-xl max-w-[90%] leading-relaxed ${
                              msg.role === 'user' 
                                ? 'bg-[#0047FF] text-white self-end ml-auto' 
                                : 'bg-surface dark:bg-surface border border-outline dark:border-outline text-on-surface dark:text-on-surface self-start mr-auto whitespace-pre-wrap'
                            }`}>
                              {msg.content}
                            </div>
                          ))}
                          {chatLoading && (
                            <div className="p-3 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl text-muted self-start mr-auto flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                          )}
                        </div>
                        {/* Input bar */}
                        <div className="p-2.5 bg-surface dark:bg-surface border-t border-outline dark:border-outline/85 flex gap-2">
                          <input 
                            readOnly
                            type="text" 
                            placeholder="Type a message to Copilot..." 
                            className="flex-1 bg-surface-high dark:bg-background border border-outline dark:border-outline rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                          />
                          <button className="px-3 bg-surface-highest dark:bg-surface-high rounded-lg text-muted hover:text-on-surface text-xs font-bold border border-outline/50 dark:border-outline">
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. ANALYTICS MOCKUP SCREEN */}
                {activeMockupTab === 'analytics' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-outline dark:border-outline">
                      <div>
                        <h3 className="text-lg font-bold text-on-surface dark:text-on-surface">Workforce Analytics</h3>
                        <p className="text-xs text-muted">Organization intelligence report</p>
                      </div>
                      <span className="text-[10px] font-bold bg-[#0047FF]/10 text-[#0047FF] px-2.5 py-1 rounded-full">Quarterly Data</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Hiring Funnel conversions */}
                      <div className="p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-on-surface dark:text-on-surface uppercase tracking-wider">Hiring Conversion Funnel</h4>
                        <div className="space-y-2">
                          {[
                            { stage: 'Applied', count: 1200, width: '100%', color: 'bg-blue-500/20 text-[#0047FF]' },
                            { stage: 'Screened', count: 480, width: '40%', color: 'bg-blue-500/30 text-blue-600 dark:text-blue-400' },
                            { stage: 'Interviewed', count: 120, width: '10%', color: 'bg-blue-500/40 text-blue-700 dark:text-blue-300' },
                            { stage: 'Hired', count: 32, width: '2.6%', color: 'bg-[#0047FF] text-white' }
                          ].map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[11px] font-semibold">
                                <span className="text-slate-650 dark:text-muted">{item.stage}</span>
                                <span className="text-on-surface dark:text-on-surface">{item.count}</span>
                              </div>
                              <div className="w-full bg-surface-highest dark:bg-background h-6 rounded overflow-hidden relative border border-outline/20 dark:border-outline">
                                <div className={`h-full ${item.color} flex items-center px-2 text-[10px] font-bold`} style={{ width: item.width }}>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Headcount Split */}
                      <div className="p-4 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-on-surface dark:text-on-surface uppercase tracking-wider">Department Distribution</h4>
                        <div className="space-y-3 pt-2">
                          {[
                            { dept: 'Engineering', count: 62, pct: '43.6%', color: 'bg-[#0047FF]' },
                            { dept: 'Sales & Marketing', count: 41, pct: '28.8%', color: 'bg-emerald-500' },
                            { dept: 'Operations & Support', count: 24, pct: '16.9%', color: 'bg-amber-500' },
                            { dept: 'Product & Design', count: 15, pct: '10.5%', color: 'bg-purple-500' }
                          ].map((dept, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-650 dark:text-on-surface-variant flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${dept.color}`} /> {dept.dept}
                                </span>
                                <span className="text-on-surface dark:text-on-surface">{dept.count} ({dept.pct})</span>
                              </div>
                              <div className="w-full bg-surface-highest dark:bg-background h-2 rounded-full overflow-hidden">
                                <div className={`h-full ${dept.color}`} style={{ width: dept.pct }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </section>

        {/* Trust & Social Proof Section */}
        <section className="py-16 bg-surface dark:bg-background border-y border-outline dark:border-outline/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <p className="text-xs font-bold tracking-widest text-muted dark:text-muted uppercase">Trusted By Leading Hyper-Growth Teams</p>
            
            {/* Logos Placeholder Grid */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60 grayscale hover:grayscale-0 transition-all">
              {trustLogos.map((logo, idx) => (
                <div key={idx} className="flex items-center gap-2 text-lg font-bold text-on-surface dark:text-on-surface-variant">
                  <span className="text-xl">{logo.icon}</span>
                  <span className="font-display tracking-tight">{logo.name}</span>
                </div>
              ))}
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-150 dark:border-outline">
              <div className="space-y-1">
                <span className="text-3xl sm:text-5xl font-black text-[#0047FF] font-display">10,000+</span>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mt-1.5">Candidates Processed</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl sm:text-5xl font-black text-[#0047FF] font-display">500+</span>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mt-1.5">Interviews Managed</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl sm:text-5xl font-black text-[#0047FF] font-display">99.9%</span>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mt-1.5">Platform Availability</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid Section */}
        <section id="features" className="py-24 bg-surface-high dark:bg-background relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/50 text-xs font-bold text-[#0047FF] rounded-full uppercase tracking-wider">Capabilities</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface dark:text-on-surface tracking-tight font-display">Features Engineered for Scale</h2>
              <p className="text-muted text-sm sm:text-base leading-relaxed">
                Everything you need to source, grade, manage, and scale your global workforce.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="p-8 bg-surface dark:bg-surface border border-outline dark:border-outline/80 rounded-2xl shadow-sm hover:border-[#0047FF] transition-all duration-300 group flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#0047FF] flex items-center justify-center shrink-0 group-hover:bg-[#0047FF] group-hover:text-white transition-all">
                  <Brain size={22} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-on-surface dark:text-on-surface group-hover:text-[#0047FF] transition-colors font-display">AI Resume Screening</h3>
                  <p className="text-muted text-sm leading-relaxed">
                    Automatically analyze and rank resumes. Grade match scores based on role specifications and technical alignment in seconds.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-8 bg-surface dark:bg-surface border border-outline dark:border-outline/80 rounded-2xl shadow-sm hover:border-[#0047FF] transition-all duration-300 group flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#0047FF] flex items-center justify-center shrink-0 group-hover:bg-[#0047FF] group-hover:text-white transition-all">
                  <Users size={22} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-on-surface dark:text-on-surface group-hover:text-[#0047FF] transition-colors font-display">Smart Recruitment Pipeline</h3>
                  <p className="text-muted text-sm leading-relaxed">
                    Track candidates from application to hiring. Move talent seamlessly through drag-n-drop boards with custom trigger tasks.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-8 bg-surface dark:bg-surface border border-outline dark:border-slate-855 rounded-2xl shadow-sm hover:border-[#0047FF] transition-all duration-300 group flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#0047FF] flex items-center justify-center shrink-0 group-hover:bg-[#0047FF] group-hover:text-white transition-all">
                  <Calendar size={22} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-on-surface dark:text-on-surface group-hover:text-[#0047FF] transition-colors font-display">Employee Management</h3>
                  <p className="text-muted text-sm leading-relaxed">
                    Manage attendance, leave, contracts, and employee records in a secure self-service portal.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-8 bg-surface dark:bg-surface border border-outline dark:border-outline/80 rounded-2xl shadow-sm hover:border-[#0047FF] transition-all duration-300 group flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#0047FF] flex items-center justify-center shrink-0 group-hover:bg-[#0047FF] group-hover:text-white transition-all">
                  <TrendingUp size={22} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-on-surface dark:text-on-surface group-hover:text-[#0047FF] transition-colors font-display">AI Workforce Insights</h3>
                  <p className="text-muted text-sm leading-relaxed">
                    Discover organization trends, check department performance, and make strategic data-driven decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-surface dark:bg-background border-t border-outline dark:border-outline/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/50 text-xs font-bold text-[#0047FF] rounded-full uppercase tracking-wider">Workflow</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface dark:text-on-surface tracking-tight font-display">How TalentOS Works</h2>
              <p className="text-muted text-sm sm:text-base leading-relaxed">
                Move from job definition to employee onboarding in a few integrated steps.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Create a Job', desc: 'Define your role. Set candidate criteria, key skills, and requirements.' },
                { step: '02', title: 'Receive Applications', desc: 'Applications stream into your portal from career pages automatically.' },
                { step: '03', title: 'AI Analyzes Resumes', desc: 'The AI screens candidates, mapping alignment and giving a fit verdict.' },
                { step: '04', title: 'Hire Top Talent', desc: 'Onboard chosen candidates with automated contracts and portal access.' }
              ].map((step, idx) => (
                <div key={idx} className="relative p-6 bg-surface-high dark:bg-surface/40 rounded-2xl border border-outline/60 dark:border-outline/60 space-y-4">
                  <div className="text-4xl font-black text-blue-200 dark:text-blue-900/30 font-display">{step.step}</div>
                  <h3 className="text-lg font-bold text-on-surface dark:text-on-surface font-display">{step.title}</h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------- AI ASSISTANT SECTION ----------------- */}
        <section id="copilot" className="py-24 bg-surface-high dark:bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column Copy */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-950/50 rounded-full text-xs font-bold text-[#0047FF] uppercase tracking-wider">
                  <Bot size={14} /> HR CoPilot
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface dark:text-on-surface tracking-tight leading-tight font-display">
                  Meet Your AI HR Copilot
                </h2>
                
                <p className="text-on-surface-variant dark:text-muted text-sm sm:text-base leading-relaxed">
                  Ask questions, generate interview questions, analyze candidate fit, write job descriptions, and automate day-to-day HR workflows with natural language.
                </p>

                {/* Simulated Trigger Prompt Buttons */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">Click to test simulator:</p>
                  <button 
                    onClick={() => triggerCopilotSimulation('assess')}
                    className="flex items-center justify-between w-full p-4 bg-surface hover:bg-surface-high dark:bg-surface dark:hover:bg-surface-high border border-outline dark:border-outline rounded-xl transition-all shadow-sm group text-left"
                  >
                    <span className="text-xs font-semibold text-on-surface-variant dark:text-on-surface-variant group-hover:text-[#0047FF]">"Assess Marcus Vance for Senior React Developer"</span>
                    <ArrowRight size={14} className="text-muted group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => triggerCopilotSimulation('questions')}
                    className="flex items-center justify-between w-full p-4 bg-surface hover:bg-surface-high dark:bg-surface dark:hover:bg-surface-high border border-outline dark:border-outline rounded-xl transition-all shadow-sm group text-left"
                  >
                    <span className="text-xs font-semibold text-on-surface-variant dark:text-on-surface-variant group-hover:text-[#0047FF]">"Generate 3 Node.js interview questions"</span>
                    <ArrowRight size={14} className="text-muted group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => triggerCopilotSimulation('jd')}
                    className="flex items-center justify-between w-full p-4 bg-surface hover:bg-surface-high dark:bg-surface dark:hover:bg-surface-high border border-outline dark:border-outline rounded-xl transition-all shadow-sm group text-left"
                  >
                    <span className="text-xs font-semibold text-on-surface-variant dark:text-on-surface-variant group-hover:text-[#0047FF]">"Draft a Job Description for HR Business Partner"</span>
                    <ArrowRight size={14} className="text-muted group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right Column: Chat Console */}
              <div className="bg-surface dark:bg-surface border border-outline dark:border-outline rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between h-[450px] relative">
                
                {/* Chat Header */}
                <div className="px-5 py-4 bg-surface-high dark:bg-background border-b border-outline dark:border-outline flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0047FF] flex items-center justify-center text-on-surface">
                      <Bot size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface dark:text-on-surface block">TalentOS Copilot</span>
                      <span className="text-[10px] text-green-500 font-semibold">● Agent Online</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted bg-surface-highest/50 dark:bg-surface-high px-2.5 py-1 rounded-full">v1.2.0-core</span>
                </div>

                {/* Conversation Body */}
                <div className="p-5 flex-1 overflow-y-auto space-y-4">
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                        message.role === 'user' ? 'bg-[#0047FF] text-white' : 'bg-surface-highest dark:bg-surface-high text-on-surface-variant dark:text-on-surface-variant'
                      }`}>
                        {message.role === 'user' ? 'U' : 'AI'}
                      </div>
                      <div className={`p-4 rounded-xl leading-relaxed text-xs ${
                        message.role === 'user' 
                          ? 'bg-[#0047FF] text-white' 
                          : 'bg-surface-high dark:bg-background border border-outline dark:border-outline text-on-surface dark:text-on-surface whitespace-pre-wrap'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-surface-highest dark:bg-slate-855 text-xs">AI</div>
                      <div className="p-4 bg-surface-high dark:bg-background border border-outline dark:border-outline rounded-xl text-muted flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#0047FF] rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-[#0047FF] rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-[#0047FF] rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-4 border-t border-outline dark:border-outline bg-surface-high dark:bg-background flex gap-2.5">
                  <input 
                    readOnly
                    type="text" 
                    placeholder="Click a suggested prompt on the left..." 
                    className="flex-1 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0047FF] transition-all"
                  />
                  <button className="px-5 bg-[#0047FF] hover:bg-[#0036C7] text-on-surface text-xs font-semibold rounded-xl transition-all shadow-sm">
                    Ask
                  </button>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ----------------- EMPLOYEE PORTAL SECTION ----------------- */}
        <section id="employee-portal" className="py-24 bg-surface dark:bg-background border-t border-outline dark:border-outline/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/50 text-xs font-bold text-[#0047FF] rounded-full uppercase tracking-wider">Employee Workspace</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface dark:text-on-surface tracking-tight font-display">Modern Employee Portal</h2>
              <p className="text-muted text-sm sm:text-base leading-relaxed">
                Empower your workforce with custom self-service directories, compliance document vaults, and shift clocking.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Leave Management card */}
              <div className="p-6 bg-surface-high dark:bg-surface/40 border border-outline dark:border-outline/80 rounded-2xl shadow-sm hover:border-[#0047FF] transition-all group">
                <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#0047FF] flex items-center justify-center font-bold text-sm mb-5 group-hover:bg-[#0047FF] group-hover:text-white transition-all">
                  <Calendar size={18} />
                </span>
                <h3 className="text-base font-bold text-on-surface dark:text-on-surface mb-2 font-display">Leave Management</h3>
                <p className="text-muted text-xs leading-relaxed">
                  Employees submit sick leaves and vacations directly. Custom rules auto-approve or route to managers.
                </p>
              </div>

              {/* Attendance Tracking card */}
              <div className="p-6 bg-surface-high dark:bg-surface/40 border border-outline dark:border-outline/80 rounded-2xl shadow-sm hover:border-[#0047FF] transition-all group">
                <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#0047FF] flex items-center justify-center font-bold text-sm mb-5 group-hover:bg-[#0047FF] group-hover:text-white transition-all">
                  <Clock size={18} />
                </span>
                <h3 className="text-base font-bold text-on-surface dark:text-on-surface mb-2 font-display">Attendance Tracking</h3>
                <p className="text-muted text-xs leading-relaxed">
                  Log working hours with geo-fenced digital timesheets, tracking start, break, and completion times in real-time.
                </p>
              </div>

              {/* Employee Documents card */}
              <div className="p-6 bg-surface-high dark:bg-surface/40 border border-outline dark:border-outline/80 rounded-2xl shadow-sm hover:border-[#0047FF] transition-all group">
                <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#0047FF] flex items-center justify-center font-bold text-sm mb-5 group-hover:bg-[#0047FF] group-hover:text-white transition-all">
                  <FileText size={18} />
                </span>
                <h3 className="text-base font-bold text-on-surface dark:text-on-surface mb-2 font-display">Employee Documents</h3>
                <p className="text-muted text-xs leading-relaxed">
                  Centralized secure database for contracts, verification IDs, and bank details. Cryptographically protected.
                </p>
              </div>

              {/* Training Progress card */}
              <div className="p-6 bg-surface-high dark:bg-surface/40 border border-outline dark:border-outline/80 rounded-2xl shadow-sm hover:border-[#0047FF] transition-all group">
                <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#0047FF] flex items-center justify-center font-bold text-sm mb-5 group-hover:bg-[#0047FF] group-hover:text-white transition-all">
                  <Award size={18} />
                </span>
                <h3 className="text-base font-bold text-on-surface dark:text-on-surface mb-2 font-display">Training & Onboarding</h3>
                <p className="text-muted text-xs leading-relaxed">
                  Monitor compliance certification and role training progress. Auto-assign courses to newly hired recruits.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------- ANALYTICS & INTELLIGENCE SECTION ----------------- */}
        <section className="py-24 bg-surface-high dark:bg-background border-t border-outline dark:border-outline/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column Mockup */}
              <div className="p-6 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-2xl shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-outline dark:border-outline pb-3">
                  <span className="text-xs font-bold text-on-surface dark:text-on-surface uppercase tracking-wider">Department Headcount Analytics</span>
                  <span className="text-[10px] font-mono text-muted">Update frequency: Real-time</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-650 dark:text-on-surface-variant mb-1.5">
                      <span>Engineering</span>
                      <span>62 (43.6%)</span>
                    </div>
                    <div className="w-full bg-surface-highest dark:bg-background h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#0047FF] h-full rounded-full" style={{ width: '43.6%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-650 dark:text-on-surface-variant mb-1.5">
                      <span>Sales & Marketing</span>
                      <span>41 (28.8%)</span>
                    </div>
                    <div className="w-full bg-surface-highest dark:bg-background h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '28.8%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-650 dark:text-on-surface-variant mb-1.5">
                      <span>Operations & Customer Support</span>
                      <span>24 (16.9%)</span>
                    </div>
                    <div className="w-full bg-surface-highest dark:bg-background h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '16.9%' }} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-surface-high dark:bg-background border border-outline/60 dark:border-outline/40 rounded-xl">
                    <span className="text-[10px] text-muted font-bold block uppercase">Monthly Growth</span>
                    <span className="text-xl font-bold text-slate-950 dark:text-on-surface mt-1 block">+8.2%</span>
                  </div>
                  <div className="p-3 bg-surface-high dark:bg-background border border-outline/60 dark:border-outline/40 rounded-xl">
                    <span className="text-[10px] text-muted font-bold block uppercase">Turnover Rate</span>
                    <span className="text-xl font-bold text-slate-950 dark:text-on-surface mt-1 block">1.8%</span>
                  </div>
                </div>
              </div>

              {/* Right Column Copy */}
              <div className="space-y-6">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/50 text-xs font-bold text-[#0047FF] rounded-full uppercase tracking-wider">Insights</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface dark:text-on-surface tracking-tight leading-tight font-display">
                  Workforce Intelligence at Your Fingertips
                </h2>
                <p className="text-slate-650 dark:text-muted text-sm sm:text-base leading-relaxed">
                  Make intelligent decisions using consolidated reports. Audit departmental sizes, evaluate employee turnover metrics, track hiring velocities, and review monthly attendance growth.
                </p>
                <div className="flex flex-col gap-3.5 pt-2">
                  <div className="flex gap-3 items-start">
                    <Check className="text-green-500 mt-1 shrink-0" size={16} />
                    <p className="text-xs sm:text-sm text-on-surface-variant dark:text-on-surface-variant">Identify recruitment bottlenecks before they slow down critical hiring.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Check className="text-green-500 mt-1 shrink-0" size={16} />
                    <p className="text-xs sm:text-sm text-on-surface-variant dark:text-on-surface-variant">Compare headcount distributions against target quarterly budgets.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ----------------- TESTIMONIALS SECTION ----------------- */}
        <section className="py-24 bg-surface dark:bg-background border-t border-outline dark:border-outline/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/50 text-xs font-bold text-[#0047FF] rounded-full uppercase tracking-wider">Testimonials</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface dark:text-on-surface tracking-tight font-display">Success Stories</h2>
              <p className="text-muted text-sm sm:text-base leading-relaxed">
                See how teams use TalentOS to scale up and automate their HR systems.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  quote: "TalentOS replaced three separate tools for our team. We now manage all applicants, schedule interviews, and track employee files from one elegant system.",
                  author: "Helen Mercer",
                  role: "VP of HR at Orbit Tech",
                  rating: 5 
                },
                { 
                  quote: "The AI screening accuracy is exceptional. It maps candidate technical competencies accurately, reducing our candidate vetting cycle by nearly 60%.",
                  author: "Marcus Aurel",
                  role: "Director of Engineering at Acme Corp",
                  rating: 5 
                },
                { 
                  quote: "Our employees love the self-service portals. The attendance clock-in and document uploads are clean and fast, saving my team hours in operations.",
                  author: "Sophia Lang",
                  role: "People Operations Lead at Retooler",
                  rating: 5 
                }
              ].map((test, idx) => (
                <div key={idx} className="p-6 bg-surface-high dark:bg-surface/40 border border-outline/60 dark:border-outline/80 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex gap-0.5">
                      {[...Array(test.rating)].map((_, rIdx) => (
                        <Star key={rIdx} size={14} className="fill-[#0047FF] text-[#0047FF]" />
                      ))}
                    </div>
                    <p className="text-on-surface-variant dark:text-on-surface-variant text-xs sm:text-sm leading-relaxed italic">
                      "{test.quote}"
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface dark:text-on-surface font-display">{test.author}</h4>
                    <span className="text-[10px] text-muted font-semibold">{test.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------- PRICING SECTION ----------------- */}
        <section id="pricing" className="py-24 bg-surface-high dark:bg-background border-t border-outline dark:border-outline/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/50 text-xs font-bold text-[#0047FF] rounded-full uppercase tracking-wider">Pricing</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface dark:text-on-surface tracking-tight font-display">Transparent Pricing Plans</h2>
              <p className="text-muted text-sm sm:text-base leading-relaxed">
                Choose the right scope for your workforce. Scale up as you hire.
              </p>

              {/* Annual/Monthly Toggle */}
              <div className="pt-6 flex justify-center items-center gap-3">
                <span className={`text-xs font-bold ${billingPeriod === 'monthly' ? 'text-on-surface dark:text-white' : 'text-muted'}`}>Monthly Billing</span>
                <button 
                  onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                  className="w-12 h-6 bg-surface-highest dark:bg-surface-high rounded-full p-1 transition-all relative border border-outline dark:border-outline"
                >
                  <div className={`w-4 h-4 bg-[#0047FF] rounded-full transition-all ${billingPeriod === 'annual' ? 'translate-x-6' : ''}`} />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${billingPeriod === 'annual' ? 'text-on-surface dark:text-white' : 'text-muted'}`}>Annual Billing</span>
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full border border-green-500/20">Save 20%</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Plan 1 */}
              <div className="p-8 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-2xl shadow-sm space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface dark:text-on-surface font-display">Starter</h3>
                    <p className="text-xs text-muted mt-1">Ideal for growing startups</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-on-surface dark:text-on-surface font-display">
                      ${billingPeriod === 'annual' ? '39' : '49'}
                    </span>
                    <span className="text-xs text-muted font-semibold">/ employee / month</span>
                  </div>
                  <div className="border-t border-outline dark:border-outline pt-4 space-y-3 text-xs">
                    {[
                      'Basic Recruitment ATS',
                      'AI Resume Ingestion (OCR)',
                      'Standard Employee Directory',
                      'Leave & Vacation Requests',
                      'Email & Chat Support'
                    ].map((feat, idx) => (
                      <div key={idx} className="flex gap-2.5 items-center">
                        <Check size={14} className="text-[#0047FF]" />
                        <span className="text-slate-650 dark:text-on-surface-variant">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link 
                  href="/register" 
                  className="w-full py-2.5 bg-surface-highest hover:bg-surface-highest dark:bg-surface-high dark:hover:bg-slate-750 text-on-surface dark:text-on-surface text-xs font-bold rounded-xl transition-all text-center block"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Plan 2 */}
              <div className="p-8 bg-surface dark:bg-surface border-2 border-[#0047FF] rounded-2xl shadow-md space-y-6 flex flex-col justify-between relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 px-2.5 py-0.5 bg-[#0047FF] text-on-surface text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Popular
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface dark:text-on-surface font-display">Professional</h3>
                    <p className="text-xs text-muted mt-1">For scaling middle-market firms</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#0047FF] font-display">
                      ${billingPeriod === 'annual' ? '79' : '99'}
                    </span>
                    <span className="text-xs text-muted font-semibold">/ employee / month</span>
                  </div>
                  <div className="border-t border-outline dark:border-outline pt-4 space-y-3 text-xs">
                    {[
                      'Everything in Starter plan',
                      'Advanced AI Screening & Grading',
                      'Custom Candidate Pipelines',
                      'Attendance Tracking & Timesheets',
                      'Workforce Intelligence Analytics',
                      'Integrations (Slack, Calendar)'
                    ].map((feat, idx) => (
                      <div key={idx} className="flex gap-2.5 items-center">
                        <Check size={14} className="text-[#0047FF]" />
                        <span className="text-slate-650 dark:text-on-surface-variant">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link 
                  href="/register" 
                  className="w-full py-2.5 bg-[#0047FF] hover:bg-[#0036C7] text-on-surface text-xs font-bold rounded-xl transition-all text-center block shadow-md shadow-blue-500/10"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Plan 3 */}
              <div className="p-8 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-2xl shadow-sm space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-on-surface font-display">Enterprise</h3>
                    <p className="text-xs text-muted mt-1">For multinational companies</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-on-surface dark:text-on-surface font-display">Custom</span>
                    <span className="text-xs text-muted font-semibold">/ month</span>
                  </div>
                  <div className="border-t border-outline dark:border-outline pt-4 space-y-3 text-xs">
                    {[
                      'Everything in Professional plan',
                      'Unlimited Candidate Screening',
                      'Dedicated database isolation (Tenant)',
                      'Custom SSO & OAuth login',
                      '24/7 Priority SLA support',
                      'Dedicated Account Manager'
                    ].map((feat, idx) => (
                      <div key={idx} className="flex gap-2.5 items-center">
                        <Check size={14} className="text-[#0047FF]" />
                        <span className="text-slate-650 dark:text-on-surface-variant">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => alert('Please contact sales at sales@talentos.ai')}
                  className="w-full py-2.5 bg-surface-highest hover:bg-surface-highest dark:bg-surface-high dark:hover:bg-slate-750 text-on-surface dark:text-on-surface text-xs font-bold rounded-xl transition-all text-center block"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-surface dark:bg-background border-t border-outline dark:border-outline/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/50 text-xs font-bold text-[#0047FF] rounded-full uppercase tracking-wider">FAQ</span>
              <h2 className="text-3xl font-extrabold text-on-surface dark:text-on-surface tracking-tight font-display">Frequently Asked Questions</h2>
              <p className="text-muted text-sm">
                Everything you need to know about the platform.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { 
                  q: 'How does the AI Resume Screening work?', 
                  a: 'Our AI engine parses PDF and Word documents to extract skills, experience, and certifications. It matches this metadata against your job description to generate a fit score and technical fit explanation.' 
                },
                { 
                  q: 'Is company and candidate data secure?', 
                  a: 'Yes, TalentOS uses strict multi-tenant database isolation. Each company operates in its own logical partition, secured by isolated encryption tokens. No database records are shared or cross-contaminated.' 
                },
                { 
                  q: 'Can I manage existing employees, not just recruitment?', 
                  a: 'Absolutely. TalentOS includes a fully integrated Employee Portal. Employees can clock in, submit leave requests, view active documents, and complete compliance modules.' 
                },
                { 
                  q: 'Does it support dark mode?', 
                  a: 'Yes, the interface supports both dark and light modes, aligning automatically with your system settings or customizable via the toggle button.' 
                },
                { 
                  q: 'How do I start a free trial?', 
                  a: 'Click "Start Free Trial" in the top bar to set up a new workspace in seconds. No credit card is required for the 14-day trial period.' 
                }
              ].map((faq, idx) => (
                <div key={idx} className="border border-outline dark:border-outline rounded-xl overflow-hidden bg-surface-high/50 dark:bg-surface/30">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between font-bold text-left text-xs sm:text-sm text-slate-850 dark:text-on-surface hover:bg-surface-highest/30 dark:hover:bg-surface/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={16} className={`text-muted transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-muted leading-relaxed dark:text-muted border-t border-outline/50 dark:border-outline/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Premium Footer */}
      <footer className="bg-surface text-muted text-xs py-16 border-t border-outline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-outline">
            
            <div className="space-y-4">
              <span className="text-base font-bold text-on-surface tracking-tight font-display">TalentOS.AI</span>
              <p className="text-[11px] text-muted leading-relaxed">
                The operating system for modern recruitment, candidate screening, and employee portal automation.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-on-surface font-bold text-xs uppercase tracking-wider">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-on-surface transition-colors">Features</a></li>
                <li><a href="#copilot" className="hover:text-on-surface transition-colors">HR Copilot</a></li>
                <li><a href="#pricing" className="hover:text-on-surface transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-on-surface font-bold text-xs uppercase tracking-wider">Security</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-on-surface transition-colors">Tenant Isolation</a></li>
                <li><a href="#" className="hover:text-on-surface transition-colors">Data Encryption</a></li>
                <li><a href="#" className="hover:text-on-surface transition-colors">GDPR & Compliance</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-on-surface font-bold text-xs uppercase tracking-wider">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-on-surface transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-on-surface transition-colors">Contact Sales</a></li>
                <li><a href="#" className="hover:text-on-surface transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-muted uppercase font-semibold">
            <p>&copy; {new Date().getFullYear()} TalentOS Technologies Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="px-3 py-1 bg-surface-high text-blue-400 rounded border border-outline">Enterprise Ready</span>
              <span className="px-3 py-1 bg-surface-high text-green-400 rounded border border-outline">Active Stage</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
