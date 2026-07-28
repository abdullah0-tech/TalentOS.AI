'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FloatingContactButton from '../../components/FloatingContactButton';
import { 
  Sparkles, Shield, Cpu, Users, Zap, CheckCircle, Bot, Mail, 
  BarChart3, Cloud, Layout, Lock, Briefcase, Award, ArrowRight, 
  Globe, Code, Server, Database, Terminal, Heart, Rocket, Target, Flag
} from 'lucide-react';

// Animated Counter Hook
function useAnimatedCounter(endValue, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(endValue) || 0;
    if (end === 0) return;

    const increment = end / (duration / 20);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [endValue, duration]);

  return count.toLocaleString();
}

export default function AboutUsPage() {
  const [stats, setStats] = useState([
    { key: 'organizations_using', label: 'Organizations Using TalentOS', value: 240, suffix: '+' },
    { key: 'active_employees', label: 'Active Employees Managed', value: 18500, suffix: '+' },
    { key: 'applications_processed', label: 'Applications Processed', value: 142000, suffix: '+' },
    { key: 'emails_automated', label: 'Emails Automated', value: 850000, suffix: '+' },
    { key: 'ai_resume_analyses', label: 'AI Resume Analyses', value: 98000, suffix: '+' }
  ]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/contact/stats');
        const data = await res.json();
        if (res.ok && data.data && data.data.length > 0) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Error loading configurable stats:', err);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const coreValues = [
    {
      title: 'Innovation',
      icon: Sparkles,
      color: 'bg-blue-500/10 text-[#0047FF] border-blue-500/20',
      description: 'We continuously build intelligent HR solutions powered by cutting-edge AI.'
    },
    {
      title: 'Security',
      icon: Shield,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      description: 'Enterprise-grade security to protect every organization and employee dataset.'
    },
    {
      title: 'Automation',
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      description: 'Reduce repetitive HR work through intelligent automation and workflows.'
    },
    {
      title: 'Customer Success',
      icon: Heart,
      color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      description: 'Every feature is designed to improve the hiring and workplace experience.'
    },
    {
      title: 'Reliability',
      icon: Server,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      description: 'Built using scalable cloud technologies for maximum uptime and stability.'
    }
  ];

  const whyChooseFeatures = [
    { title: 'AI Resume Screening', icon: Sparkles, desc: 'Automatically score and rank candidate resumes using xAI Grok.' },
    { title: 'Smart Candidate Pipeline', icon: Users, desc: 'Visual Kanban tracking from application to onboarding.' },
    { title: 'Employee Management', icon: Briefcase, desc: 'Integrated portal for leave tracking, attendance, and reviews.' },
    { title: 'Email Automation', icon: Mail, desc: 'Custom HTML templates for candidate offers, alerts, and feedback.' },
    { title: 'HR AI Copilot', icon: Bot, desc: 'Conversational AI assistant for HR policy queries and drafting.' },
    { title: 'Analytics Dashboard', icon: BarChart3, desc: 'Deep workforce metrics, conversion funnels, and time-to-hire insights.' },
    { title: 'Role-Based Access', icon: Shield, desc: 'Granular permissions for Owners, Admins, Hiring Managers, and Employees.' },
    { title: 'Cloud SaaS Platform', icon: Cloud, desc: 'Multi-tenant architecture with isolated workspaces per company.' },
    { title: 'Modern UI', icon: Layout, desc: 'Sleek, glassmorphic interface with full Light & Dark mode support.' },
    { title: 'Fast Performance', icon: Zap, desc: 'Optimized Next.js App Router with responsive layouts.' },
    { title: 'Secure Authentication', icon: Lock, desc: 'Enterprise-ready JWT auth, API tokens, and audit logs.' },
    { title: 'Production Ready', icon: CheckCircle, desc: 'Comprehensive test coverage, reliable database schemas, and backups.' }
  ];

  const techStack = [
    { category: 'Frontend Architecture', tech: 'Next.js 14, React, Tailwind CSS', icon: Layout, color: 'text-blue-500' },
    { category: 'Backend Engine', tech: 'Node.js, Express.js REST API', icon: Server, color: 'text-emerald-500' },
    { category: 'Database & ORM', tech: 'PostgreSQL, Prisma ORM', icon: Database, color: 'text-indigo-500' },
    { category: 'Artificial Intelligence', tech: 'xAI Grok API, Embedding Models', icon: Cpu, color: 'text-purple-500' },
    { category: 'Cloud Infrastructure', tech: 'Vercel Edge, Railway Cloud', icon: Cloud, color: 'text-cyan-500' },
    { category: 'Email Automation', tech: 'SMTP, Nodemailer HTML Templates', icon: Mail, color: 'text-amber-500' }
  ];

  return (
    <div className="min-h-screen bg-surface-high dark:bg-background text-on-surface dark:text-on-surface flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 pt-20">
        
        {/* 1. HERO SECTION */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Hero Left Content */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/40 text-xs font-semibold text-[#0047FF] dark:text-blue-400">
                  <Sparkles size={13} className="text-[#0047FF] dark:text-blue-400" />
                  <span>The Operating System for Modern Recruitment</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface dark:text-on-surface leading-tight font-display">
                  Transforming Modern Recruitment with <span className="text-[#0047FF]">Artificial Intelligence</span>
                </h1>

                <p className="text-base sm:text-lg text-on-surface-variant dark:text-on-surface-variant leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  TalentOS is an AI-powered HR, Recruitment, and Employee Management platform built to help organizations hire faster, automate repetitive HR tasks, and create an exceptional employee experience.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#0047FF] hover:bg-[#0036C7] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                  >
                    <span>Start Free</span>
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    href="/contact"
                    className="w-full sm:w-auto px-6 py-3.5 bg-surface dark:bg-surface border border-outline dark:border-outline text-on-surface dark:text-on-surface hover:bg-surface-high dark:hover:bg-surface-high font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>Contact Sales</span>
                  </Link>
                </div>
              </div>

              {/* Hero Right AI HR Illustration */}
              <div className="lg:col-span-5 relative">
                <div className="relative bg-surface dark:bg-surface border border-outline dark:border-outline rounded-3xl p-6 shadow-2xl space-y-4">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-outline dark:border-outline">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="text-xs font-mono text-muted ml-2">TalentOS AI Engine v2.4</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0047FF]/10 text-[#0047FF]">
                      Active Node
                    </span>
                  </div>

                  {/* AI Pipeline Card 1 */}
                  <div className="p-4 rounded-2xl bg-surface-high dark:bg-background border border-outline dark:border-outline/80 flex items-center justify-between hover:border-[#0047FF]/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#0047FF]">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-on-surface dark:text-on-surface">AI Resume Screener</h4>
                        <p className="text-xs text-muted">Grok-powered candidate matching</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      99.2% Accuracy
                    </span>
                  </div>

                  {/* AI Pipeline Card 2 */}
                  <div className="p-4 rounded-2xl bg-surface-high dark:bg-background border border-outline dark:border-outline/80 flex items-center justify-between hover:border-[#0047FF]/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Bot size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-on-surface dark:text-on-surface">Automated Interviewer</h4>
                        <p className="text-xs text-muted">Smart multi-stage scheduling</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0047FF] bg-blue-500/10 px-2.5 py-1 rounded-full">
                      Live
                    </span>
                  </div>

                  {/* AI Pipeline Card 3 */}
                  <div className="p-4 rounded-2xl bg-surface-high dark:bg-background border border-outline dark:border-outline/80 flex items-center justify-between hover:border-[#0047FF]/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Users size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-on-surface dark:text-on-surface">Employee Portal</h4>
                        <p className="text-xs text-muted">Seamless leave & review tracking</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      Synchronized
                    </span>
                  </div>

                  <div className="text-center pt-2">
                    <span className="text-[11px] font-semibold text-muted tracking-wide uppercase">
                      Enterprise SaaS &bull; High Availability &bull; Real-Time
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. OUR STORY TIMELINE */}
        <section className="py-20 bg-surface dark:bg-surface border-y border-outline dark:border-outline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
                Our Story
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface dark:text-on-surface font-display">
                Building the Future of Workforce Operations
              </p>
              <p className="text-sm text-muted">
                From a bold idea to a production-ready AI recruitment ecosystem.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Timeline Card 1 */}
              <div className="p-8 rounded-2xl bg-surface-high dark:bg-background border border-outline dark:border-outline relative space-y-4 hover:border-[#0047FF]/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#0047FF]/10 text-[#0047FF] flex items-center justify-center font-bold text-lg">
                  <Rocket size={24} />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#0047FF]">
                  01 / The Beginning
                </div>
                <h3 className="text-xl font-bold text-on-surface dark:text-on-surface">
                  The Genesis
                </h3>
                <p className="text-sm text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                  TalentOS started as a vision to simplify recruitment and HR operations by combining artificial intelligence, automation, and modern cloud technologies into one intelligent platform.
                </p>
              </div>

              {/* Timeline Card 2 */}
              <div className="p-8 rounded-2xl bg-surface-high dark:bg-background border border-outline dark:border-outline relative space-y-4 hover:border-[#0047FF]/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-lg">
                  <Target size={24} />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-purple-500">
                  02 / The Mission
                </div>
                <h3 className="text-xl font-bold text-on-surface dark:text-on-surface">
                  Our Purpose
                </h3>
                <p className="text-sm text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                  To help organizations save time, improve hiring decisions, and provide employees with a seamless workplace experience.
                </p>
              </div>

              {/* Timeline Card 3 */}
              <div className="p-8 rounded-2xl bg-surface-high dark:bg-background border border-outline dark:border-outline relative space-y-4 hover:border-[#0047FF]/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">
                  <Flag size={24} />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                  03 / The Vision
                </div>
                <h3 className="text-xl font-bold text-on-surface dark:text-on-surface">
                  Global Standard
                </h3>
                <p className="text-sm text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                  Become one of the leading AI-powered HR SaaS platforms used by companies worldwide.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 3. CORE VALUES SECTION */}
        <section className="py-20 bg-surface-high dark:bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
                Core Values
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface dark:text-on-surface font-display">
                What Drives Us Every Day
              </p>
              <p className="text-sm text-muted">
                The foundational principles behind the TalentOS engineering and product philosophy.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreValues.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-surface dark:bg-surface border border-outline dark:border-outline hover:border-[#0047FF]/50 transition-all shadow-sm group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${value.color}`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-on-surface dark:text-on-surface mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. WHY CHOOSE TALENTOS (12-FEATURE GRID) */}
        <section className="py-20 bg-surface dark:bg-surface border-y border-outline dark:border-outline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
                Why Choose TalentOS
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface dark:text-on-surface font-display">
                Enterprise Capabilities Built for Speed
              </p>
              <p className="text-sm text-muted">
                12 robust reasons why modern HR teams choose TalentOS over legacy systems.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChooseFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-surface-high dark:bg-background border border-outline dark:border-outline hover:border-[#0047FF]/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-[#0047FF]/10 text-[#0047FF] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-base font-bold text-on-surface dark:text-on-surface mb-2">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-outline/40 flex items-center justify-between text-[11px] font-semibold text-[#0047FF]">
                      <span>Included</span>
                      <CheckCircle size={14} className="text-emerald-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. PLATFORM STATISTICS (CONFIGURABLE VIA ADMIN) */}
        <section className="py-20 bg-[#0047FF] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-200">
                Platform Statistics
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
                Delivering Measurable Impact at Scale
              </p>
              <p className="text-sm text-blue-100">
                Configurable live metrics reflecting our growing AI recruitment community.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all"
                >
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1">
                    {useAnimatedCounter(stat.value)}{stat.suffix || ''}
                  </div>
                  <div className="text-xs font-semibold text-blue-100 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. TECHNOLOGY STACK SECTION */}
        <section className="py-20 bg-surface-high dark:bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
                Technology Stack
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface dark:text-on-surface font-display">
                Engineered with Modern Cloud Standards
              </p>
              <p className="text-sm text-muted">
                Built on reliable, production-ready frameworks and industry-leading AI models.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {techStack.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-surface dark:bg-surface border border-outline dark:border-outline flex items-center gap-4 hover:border-[#0047FF]/50 transition-all shadow-sm"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-surface-high dark:bg-background border border-outline flex items-center justify-center ${item.color}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        {item.category}
                      </h3>
                      <p className="text-base font-bold text-on-surface dark:text-on-surface">
                        {item.tech}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. TEAM SECTION (EXACT REQUIRED STATEMENT) */}
        <section className="py-20 bg-surface dark:bg-surface border-t border-outline dark:border-outline">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 text-center relative overflow-hidden shadow-2xl space-y-6">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-400">
                <Code size={14} />
                <span>Our Engineering Culture</span>
              </div>

              <blockquote className="text-2xl sm:text-3xl font-extrabold leading-relaxed font-display text-slate-100">
                &ldquo;Built by passionate software engineers focused on creating the future of HR technology.&rdquo;
              </blockquote>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span>No Fake Team Profiles</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-blue-400" />
                  <span>100% Engineering Focused</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-purple-400" />
                  <span>Production SaaS Built</span>
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* 8. CONTACT CTA */}
        <section className="py-20 bg-surface-high dark:bg-background border-t border-outline dark:border-outline text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface dark:text-on-surface font-display">
              Ready to Transform Your Hiring Process?
            </h2>
            <p className="text-base text-on-surface-variant dark:text-on-surface-variant max-w-xl mx-auto">
              Join modern HR leaders who use TalentOS to screen resumes 10x faster and elevate their candidate experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0047FF] hover:bg-[#0036C7] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25"
              >
                Start Free
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-surface dark:bg-surface border border-outline dark:border-outline text-on-surface dark:text-on-surface hover:bg-surface-high dark:hover:bg-surface-high font-semibold rounded-xl transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <FloatingContactButton />
    </div>
  );
}
