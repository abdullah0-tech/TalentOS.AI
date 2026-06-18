'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { authService } from '../../../services/auth.service';
import { 
  BrainCircuit, 
  TrendingUp, 
  ShieldAlert, 
  Award, 
  Compass, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  Users,
  Heart,
  CheckCircle,
  Sparkles,
  Info
} from 'lucide-react';

export default function WorkforceIntelligencePage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await request('/workforce-insights');
      setInsights(data);
    } catch (err) {
      console.error(err);
      setError('Could not compile AI Workforce Intelligence. Check if the database contains active employee and evaluation records.');
    } finally {
      setLoading(false);
    }
  };

  const userRole = currentUser?.role ? currentUser.role.toLowerCase() : 'member';
  const isAdmin = ['owner', 'admin', 'member'].includes(userRole);

  if (!isAdmin) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-xl mx-auto mt-12 space-y-4">
        <h3 className="font-bold text-on-surface">Access Denied</h3>
        <p className="text-sm">You must have Administrator or Owner privileges to view workforce intelligence reports.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <span className="text-xs text-muted font-semibold animate-pulse">Grok AI compiles workforce database signals...</span>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-xl mx-auto mt-12 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-400 shrink-0" size={24} />
          <h3 className="font-bold text-on-surface">Error Compiling Insights</h3>
        </div>
        <p className="text-xs">{error || 'Could not compile analytics reports.'}</p>
        <button
          onClick={fetchInsights}
          className="px-4 py-2 bg-surface-high hover:bg-slate-700 text-xs font-semibold rounded-xl text-on-surface transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Attrition color coding
  const getAttritionBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return <span className="px-2.5 py-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full">High Attrition Risk</span>;
      case 'medium':
        return <span className="px-2.5 py-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full">Medium Attrition Risk</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">Low Attrition Risk</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
            <BrainCircuit className="text-indigo-400" size={32} /> Workforce Intelligence
          </h1>
          <p className="text-sm text-muted mt-1">AI-driven aggregate statistics reflecting company attrition rates, skill sets, and promotion forecasts.</p>
        </div>
        <button
          onClick={fetchInsights}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-on-surface bg-surface-high hover:bg-slate-750 border border-outline rounded-xl transition"
        >
          <Sparkles size={14} className="text-amber-400" /> Compile Report
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Health Score Circular Indicator */}
        <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 flex items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500/20" />
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Workforce Health</span>
            <span className="text-2xl font-black text-on-surface block mt-0.5">Health Score</span>
            <p className="text-[10px] text-muted leading-normal mt-1 max-w-[140px]">AI assessed index based on reviews, goals & absences.</p>
          </div>
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-850 fill-none"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-indigo-500 fill-none transition-all duration-1000"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - (insights.healthScore || 80) / 100)}`}
              />
            </svg>
            <span className="absolute text-sm font-black text-on-surface">{insights.healthScore || 80}%</span>
          </div>
        </div>

        {/* Attrition Risk Alert */}
        <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-500/20" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Burnout & Retention</span>
            {getAttritionBadge(insights.attritionRisk)}
          </div>
          <div className="space-y-1 pt-1.5">
            <span className="text-xs font-bold text-on-surface block">Retention Analysis</span>
            <p className="text-[10px] text-muted leading-relaxed font-medium">
              {insights.attritionReason || 'Absences and reviews trend in stable ranges.'}
            </p>
          </div>
        </div>

        {/* Hiring Forecast */}
        <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-pink-500/20" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Workforce Planning</span>
            <span className="text-[10px] font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp size={10} /> Forecast
            </span>
          </div>
          <div className="space-y-1 pt-1.5">
            <span className="text-xs font-bold text-on-surface block">Capacity Advice</span>
            <p className="text-[10px] text-muted leading-relaxed font-medium">
              {insights.hiringForecast || 'Capacity matches roadmap requirements.'}
            </p>
          </div>
        </div>

      </div>

      {/* Workforce Summary */}
      <div className="bg-background/40 border border-outline/80 rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-indigo-400 fill-indigo-400/10" />
          <h3 className="font-bold text-on-surface text-base">Executive AI Synthesis</h3>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
          {insights.workforceSummary || 'Aggregation completed.'}
        </p>
      </div>

      {/* Detailed Analysis Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Skill Gaps Analysis */}
        <div className="lg:col-span-1 bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
              <Compass size={16} className="text-indigo-400" /> Skill Gaps & Training Needs
            </h3>
            <p className="text-[10px] text-muted mt-1">Skill gaps detected from performance evaluation feedback.</p>
          </div>

          {(!insights.skillsAnalysis || insights.skillsAnalysis.length === 0) ? (
            <div className="py-8 text-center text-on-surface-variant text-xs italic">
              No skill gaps detected currently.
            </div>
          ) : (
            <div className="space-y-2.5">
              {insights.skillsAnalysis.map((gap, index) => (
                <div key={index} className="p-3 bg-surface/40 border border-outline rounded-xl flex items-start gap-2.5 text-xs text-on-surface-variant">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                  <span className="font-medium leading-relaxed">{gap}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Promotion Recommendations */}
        <div className="lg:col-span-2 bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
              <Award size={16} className="text-amber-400" /> Promotion Readiness Track
            </h3>
            <p className="text-[10px] text-muted mt-1">High performers flagged for potential advancement.</p>
          </div>

          {(!insights.promotions || insights.promotions.length === 0) ? (
            <div className="py-16 text-center border border-dashed border-outline rounded-2xl">
              <Award className="mx-auto text-on-surface-variant mb-3" size={32} />
              <h4 className="font-bold text-muted text-xs">No promotion candidates identified</h4>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">
                Employees rating 4.5 or above on evaluations will generate promotion readiness signals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.promotions.map((promo, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-surface/40 border border-outline rounded-xl flex flex-col justify-between gap-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2">
                    <Sparkles className="text-amber-400/20" size={16} />
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-background text-indigo-400 flex items-center justify-center font-bold text-[10px] uppercase border border-outline shrink-0">
                        {promo.name?.charAt(0) || 'U'}
                      </div>
                      <span className="font-bold text-xs text-on-surface truncate">{promo.name}</span>
                    </div>
                    <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-400 font-bold capitalize inline-block">
                      {promo.role}
                    </span>
                  </div>

                  <p className="text-[10px] text-muted leading-relaxed font-semibold italic bg-background/50 p-2.5 rounded-lg border border-outline/60">
                    "{promo.reason}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="p-4 bg-surface/60 border border-outline rounded-xl text-[10px] text-muted flex items-start gap-2 max-w-2xl">
        <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          AI workforce intelligence aggregates company data in real-time. This report is compiled on-demand and does not cache raw evaluations to maintain strict regulatory compliance.
        </p>
      </div>
    </div>
  );
}
