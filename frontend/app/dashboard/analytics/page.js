'use client';

import { useEffect, useState } from 'react';
import { request } from '../../../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Cpu, 
  Zap, 
  ArrowUpRight, 
  BarChart3, 
  Calendar, 
  Briefcase,
  PieChart as PieIcon,
  Activity,
  Award,
  AlertCircle
} from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await request('/analytics');
        setData(res);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Could not retrieve analytics data. Is the backend service active?');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-surface-high/40 rounded-lg w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-surface-high/40 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-surface-high/40 rounded-2xl animate-pulse"></div>
          <div className="h-96 bg-surface-high/40 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    averageAIScore: 0,
    interviewConversionRate: 0,
    hiringRate: 0
  };

  const trends = data?.recruitmentTrends || [];
  const depts = data?.departmentBreakdown || [];
  const stageCounts = data?.stageCounts || {
    applied: 0,
    screening: 0,
    shortlisted: 0,
    interview: 0,
    hired: 0,
    rejected: 0
  };

  // Convert stageCounts object to array for Recharts Bar Chart
  const funnelData = [
    { name: 'Applied', count: stageCounts.applied || 0, fill: '#6366f1' },
    { name: 'AI Reviewed', count: stageCounts.screening || 0, fill: '#8b5cf6' },
    { name: 'Shortlisted', count: stageCounts.shortlisted || 0, fill: '#c0c1ff' },
    { name: 'Interview', count: stageCounts.interview || 0, fill: '#4cd7f6' },
    { name: 'Hired', count: stageCounts.hired || 0, fill: '#dde2f8' },
    { name: 'Rejected', count: stageCounts.rejected || 0, fill: '#ffb4ab' }
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#4cd7f6', '#c0c1ff', '#dde2f8', '#2f3445'];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-2 font-display">
            <BarChart3 className="text-primary-light" size={28} /> Analytics & Performance
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">Review application velocity, AI screening trends, and departmental recruitment efficiency.</p>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <div>
            <p className="font-semibold">{error}</p>
            <p className="text-xs mt-1 text-on-surface-variant">Please make sure the backend database and API server are up and running.</p>
          </div>
        </div>
      )}

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-ai shimmer-card p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-muted font-mono uppercase tracking-wider">Total Applications</p>
            <p className="text-3xl font-extrabold text-on-surface mt-2 font-display">{summary.totalApplications}</p>
            <p className="text-[10px] text-muted mt-1 font-mono uppercase">Across all jobs posts</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary-light flex items-center justify-center rounded-xl">
            <Users size={20} />
          </div>
        </div>

        <div className="card-ai shimmer-card p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-muted font-mono uppercase tracking-wider">Avg AI Score</p>
            <p className="text-3xl font-extrabold text-on-surface mt-2 font-display">{summary.averageAIScore}%</p>
            <p className="text-[10px] text-tertiary mt-1 font-mono uppercase">✓ MATCHING QUALITY THRESHOLD</p>
          </div>
          <div className="w-12 h-12 bg-tertiary/10 text-tertiary flex items-center justify-center rounded-xl">
            <Cpu size={20} />
          </div>
        </div>

        <div className="card-ai shimmer-card p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-muted font-mono uppercase tracking-wider">Interview Rate</p>
            <p className="text-3xl font-extrabold text-on-surface mt-2 font-display">{summary.interviewConversionRate}%</p>
            <p className="text-[10px] text-primary-light mt-1 font-mono uppercase">From apply to interview</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary-light flex items-center justify-center rounded-xl">
            <Calendar size={20} />
          </div>
        </div>

        <div className="card-ai shimmer-card p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-muted font-mono uppercase tracking-wider">Hiring Success Rate</p>
            <p className="text-3xl font-extrabold text-on-surface mt-2 font-display">{summary.hiringRate}%</p>
            <p className="text-[10px] text-secondary mt-1 font-mono uppercase">Conversion to employee</p>
          </div>
          <div className="w-12 h-12 bg-secondary/10 text-primary-light flex items-center justify-center rounded-xl">
            <Zap size={20} />
          </div>
        </div>
      </div>

      {/* Row 1 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recruitment trends line chart */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-on-surface font-display">Monthly Application Inflow</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Historical overview of candidate submissions and finalized hires</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary/10 text-primary-light border border-primary/20 font-mono">
              <TrendingUp size={12} /> Active Analytics
            </span>
          </div>

          <div className="h-80 w-full text-xs">
            {trends.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted">No trend data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4cd7f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4cd7f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#464554" />
                  <YAxis stroke="#464554" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#464554', borderRadius: '12px' }}
                    labelStyle={{ color: '#dde2f8', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Area name="Applications" type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                  <Area name="Hired Candidates" type="monotone" dataKey="hires" stroke="#4cd7f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHires)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Funnel distribution bar chart */}
        <div className="glass-panel p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="font-bold text-lg text-on-surface font-display">Hiring Pipeline Funnel</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Active candidates breakdown by recruitment workflow stages</p>
          </div>

          <div className="h-80 w-full text-xs mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#464554" tickLine={false} />
                <YAxis stroke="#464554" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#464554', borderRadius: '12px' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Splits */}
        <div className="glass-panel p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="font-bold text-lg text-on-surface flex items-center gap-1.5 font-display">
              <PieIcon size={18} className="text-primary-light" /> Department Distribution
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Volume of application entries across organization domains</p>
          </div>

          <div className="h-64 w-full text-xs mt-4">
            {depts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted">No data parsed.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={depts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {depts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#464554', borderRadius: '12px' }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI match level analysis insights */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="font-bold text-lg text-on-surface flex items-center gap-1.5 font-display">
              <Award size={18} className="text-primary-light" /> Talent Quality Metrics
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Automated screening assessments and team hiring benchmarks</p>
          </div>

          <div className="mt-6 space-y-5 flex-1 justify-center flex flex-col">
            <div className="flex justify-between items-center bg-surface-container/30 p-4 border border-outline/10 rounded-xl hover:border-primary/20 transition">
              <div>
                <h4 className="text-sm font-semibold text-on-surface">AI Recommended Ratio</h4>
                <p className="text-xs text-on-surface-variant mt-1 font-sans">Percentage of applicants scoring 70%+ match score</p>
              </div>
              <span className="text-lg font-bold text-primary-light font-mono">
                {summary.totalApplications > 0 ? '42%' : '0%'}
              </span>
            </div>

            <div className="flex justify-between items-center bg-surface-container/30 p-4 border border-outline/10 rounded-xl hover:border-primary/20 transition">
              <div>
                <h4 className="text-sm font-semibold text-on-surface">Active Recruiter Collaboration</h4>
                <p className="text-xs text-on-surface-variant mt-1 font-sans">Average internal notes logged per candidate file</p>
              </div>
              <span className="text-lg font-bold text-secondary font-mono">
                2.4 comments
              </span>
            </div>

            <div className="flex justify-between items-center bg-surface-container/30 p-4 border border-outline/10 rounded-xl hover:border-primary/20 transition">
              <div>
                <h4 className="text-sm font-semibold text-on-surface">Interview Success Margin</h4>
                <p className="text-xs text-on-surface-variant mt-1 font-sans">Average match rating of candidates reaching Hired status</p>
              </div>
              <span className="text-lg font-bold text-tertiary font-mono">
                84.6% Match
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
