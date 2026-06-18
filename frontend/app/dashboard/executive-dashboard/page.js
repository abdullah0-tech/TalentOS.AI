'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  Sparkles, 
  Loader2, 
  TrendingUp, 
  Coins, 
  BrainCircuit, 
  Network, 
  Send,
  AlertCircle,
  ShieldAlert,
  Gauge
} from 'lucide-react';

export default function ExecutiveDashboardPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Executive chat states
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'copilot', text: 'Good day. I am the HireFlow Executive Copilot. Query me on workspace metrics, departmental reviews, or financial overheads.' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchExecutiveReport();
  }, []);

  const fetchExecutiveReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await request('/ai-executive/report');
      setReport(data);
    } catch (err) {
      console.error('Failed to load executive report:', err);
      setError('Failed to compile executive metrics. Make sure backend is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuestion = async (e, customQ = '') => {
    if (e) e.preventDefault();
    const queryText = customQ || question;
    if (!queryText.trim() || chatLoading) return;

    setChatLog(prev => [...prev, { sender: 'user', text: queryText }]);
    if (!customQ) setQuestion('');
    setChatLoading(true);

    try {
      const data = await request('/ai-executive/ask', {
        method: 'POST',
        body: { question: queryText }
      });
      setChatLog(prev => [...prev, { sender: 'copilot', text: data.response }]);
    } catch (err) {
      console.error('Executive chat error:', err);
      setChatLog(prev => [...prev, { sender: 'copilot', text: 'Failed to process this query. Confirm server connection.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <p className="text-muted text-sm">Grok AI compiles executive metrics...</p>
      </div>
    );
  }

  // Fallbacks if backend doesn't respond or sends partial logs
  const healthScore = report?.healthScore || 85;
  const summary = report?.summary || 'No summary configured.';
  const growth = report?.growthAnalysis || 'No growth indicators cataloged.';
  const deptPerf = report?.departmentPerformance || 'No department structures analyzed.';
  const predictions = report?.predictions || 'No future projections compiled.';
  const cost = report?.costAnalysis || 'No cost audits executed.';

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <Sparkles className="text-indigo-400" size={32} />
          Executive Analytics & AI
        </h1>
        <p className="text-sm text-muted mt-1">
          Grok AI compiles aggregated company metrics to deliver business health indexes, attrition predictions, and cost analysis.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Section: Health score dial & Executive Audit Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Dial Widget */}
        <div className="lg:col-span-4 bg-surface/30 border border-outline p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Business Health Score</span>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Styled circular progress background */}
            <div className="absolute inset-0 rounded-full border-[8px] border-outline/80"></div>
            {/* Glowing ring overlay depending on healthScore */}
            <div 
              style={{ 
                borderLeftColor: '#6366F1', 
                borderTopColor: '#6366F1', 
                borderRightColor: healthScore > 75 ? '#10B981' : '#6366F1'
              }}
              className="absolute inset-0 rounded-full border-[8px] border-transparent animate-spin-slow rotate-[45deg]"
            ></div>
            
            <div className="text-center space-y-1">
              <span className="text-4xl font-black text-on-surface">{healthScore}</span>
              <span className="text-muted text-[10px] block">/ 100</span>
            </div>
          </div>

          <div className="bg-background/40 border border-outline rounded-xl px-4 py-2 text-[10px] font-semibold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Stable Growth Level
          </div>
        </div>

        {/* Audit Summary Card */}
        <div className="lg:col-span-8 bg-surface/30 border border-outline p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Gauge size={12} className="text-indigo-400" />
              Executive Audit summary
            </span>
            <h3 className="text-lg font-bold text-on-surface leading-snug">Grok Compiled Assessment</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              {summary}
            </p>
          </div>

          <div className="text-[10px] text-muted pt-4 border-t border-outline flex items-center gap-1.5 mt-4">
            <ShieldAlert size={12} className="text-amber-500" /> 
            This assessment compiles live organization directories, performance audits, and cumulative payroll expense schedules.
          </div>
        </div>

      </div>

      {/* Analytics Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Growth card */}
        <div className="bg-surface/40 border border-outline p-6 rounded-3xl space-y-3 hover:border-outline transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <h4 className="font-bold text-sm text-on-surface">Workforce Growth Velocity</h4>
          <p className="text-xs text-muted leading-relaxed">{growth}</p>
        </div>

        {/* Dept card */}
        <div className="bg-surface/40 border border-outline p-6 rounded-3xl space-y-3 hover:border-outline transition">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <Network size={20} />
          </div>
          <h4 className="font-bold text-sm text-on-surface">Department Splits Ratings</h4>
          <p className="text-xs text-muted leading-relaxed">{deptPerf}</p>
        </div>

        {/* Prediction card */}
        <div className="bg-surface/40 border border-outline p-6 rounded-3xl space-y-3 hover:border-outline transition">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <BrainCircuit size={20} />
          </div>
          <h4 className="font-bold text-sm text-on-surface">Attrition & seat Demands</h4>
          <p className="text-xs text-muted leading-relaxed">{predictions}</p>
        </div>

        {/* Overhead card */}
        <div className="bg-surface/40 border border-outline p-6 rounded-3xl space-y-3 hover:border-outline transition">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Coins size={20} />
          </div>
          <h4 className="font-bold text-sm text-on-surface">Overhead & Cost audits</h4>
          <p className="text-xs text-muted leading-relaxed">{cost}</p>
        </div>

      </div>

      {/* Grok Executive Chatbot Panel */}
      <div className="bg-background border border-outline rounded-3xl overflow-hidden flex flex-col h-[500px]">
        {/* Panel Header */}
        <div className="p-4 border-b border-outline bg-surface/40 flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">Executive Grok Copilot</h4>
            <span className="text-[10px] text-muted">Inquire about staffing analytics, budgets, or department ratings.</span>
          </div>
        </div>

        {/* Preset Question Chips */}
        <div className="p-3 bg-surface/20 border-b border-outline flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => handleSendQuestion(null, 'What departments need hiring?')}
            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-indigo-600/20 border border-outline text-[10px] text-white-variant font-bold whitespace-nowrap transition"
          >
            🔍 Hiring Demands
          </button>
          <button
            onClick={() => handleSendQuestion(null, 'Compare performance ratings across teams')}
            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-indigo-600/20 border border-outline text-[10px] text-white-variant font-bold whitespace-nowrap transition"
          >
            📊 Department Splits
          </button>
          <button
            onClick={() => handleSendQuestion(null, 'Analyze current payroll and operational costs')}
            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-indigo-600/20 border border-outline text-[10px] text-white-variant font-bold whitespace-nowrap transition"
          >
            💰 Costs Summary
          </button>
        </div>

        {/* Chat History Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {chatLog.map((msg, index) => (
            <div 
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] rounded-2xl p-4 leading-relaxed whitespace-pre-wrap shadow-sm
                ${msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white font-medium' 
                  : 'bg-surface border border-outline text-on-surface'}
              `}>
                {msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-surface border border-outline text-muted rounded-2xl p-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-70"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSendQuestion} className="p-4 border-t border-outline bg-surface/40 flex gap-3">
          <input
            type="text"
            placeholder="Ask Grok a question about company metrics or attrition risks..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 bg-background border border-outline text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 text-on-surface placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!question.trim() || chatLoading}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition shadow-md shadow-indigo-600/15"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
