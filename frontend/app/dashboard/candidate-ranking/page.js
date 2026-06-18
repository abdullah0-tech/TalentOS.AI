'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  Award, 
  Sparkles, 
  Cpu, 
  BrainCircuit, 
  ChevronDown, 
  Play, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function CandidateRankingPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchRankings(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    try {
      const data = await request('/jobs');
      setJobs(data);
      if (data.length > 0) {
        setSelectedJobId(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Could not load jobs list.');
      setLoading(false);
    }
  };

  const fetchRankings = async (jobId) => {
    setLoading(true);
    setError('');
    try {
      const res = await request('/ai/rank-candidates', {
        method: 'POST',
        body: { jobId }
      });
      setRankings(res.rankings || []);
    } catch (err) {
      console.error('Failed to load rankings:', err);
      setError(err.message || 'Failed to fetch candidate rankings.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!selectedJobId || calculating) return;
    setCalculating(true);
    setSuccessMsg('');
    setError('');
    
    try {
      const res = await request('/ai/rank-candidates', {
        method: 'POST',
        body: { jobId: selectedJobId }
      });
      setRankings(res.rankings || []);
      setSuccessMsg('Candidate scores recalculation successfully executed!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Recalculate failed:', err);
      setError('Failed to compute AI rankings.');
    } finally {
      setCalculating(false);
    }
  };

  // Helper colors for status chips
  const getStatusStyle = (status) => {
    switch (status) {
      case 'offered': return 'neon-badge-tertiary';
      case 'interviewing': return 'neon-badge-primary';
      case 'screening': return 'neon-badge-secondary';
      case 'rejected': return 'badge-inactive';
      default: return 'badge-inactive';
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3 font-display">
            <Award className="text-primary-light" size={32} /> AI Candidate Ranking Engine
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 font-sans">
            Weighted algorithmic ranking evaluating resume matches, skills fit indices, and interviewer note sentiment.
          </p>
        </div>

        {selectedJobId && (
          <button
            onClick={handleRecalculate}
            disabled={calculating || loading}
            className="btn-primary flex items-center gap-2 glow-active"
          >
            {calculating ? (
              <>
                <span className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></span>
                Re-indexing...
              </>
            ) : (
              <>
                <BrainCircuit size={14} /> Calculate Rankings
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl flex items-start gap-3 text-xs font-semibold">
          <AlertCircle className="shrink-0 mt-0.5" size={14} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-tertiary/10 border border-tertiary/20 text-tertiary p-4 rounded-xl flex items-start gap-3 text-xs font-semibold">
          <CheckCircle2 className="shrink-0 mt-0.5" size={14} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Select Job Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-muted font-mono uppercase tracking-wider">Filter Job:</span>
          <div className="relative w-full sm:w-80">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full bg-surface-container border border-outline/35 text-xs text-on-surface rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-primary font-semibold appearance-none cursor-pointer"
            >
              {jobs.length === 0 ? (
                <option value="">No jobs posted yet</option>
              ) : (
                jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title} ({job.department})</option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-4 top-3 text-muted pointer-events-none" size={14} />
          </div>
        </div>

        <div className="p-3 bg-surface-container/40 border border-outline/10 rounded-xl text-[10px] text-muted max-w-md leading-relaxed flex items-start gap-2 font-mono">
          <Info size={14} className="text-primary-light shrink-0 mt-0.5" />
          <span>FORMULA: <strong>40% RESUME PARSING</strong> + <strong>35% EXACT SKILLS MATCHING</strong> + <strong>25% CULTURE NOTES SENTIMENT</strong>.</span>
        </div>
      </div>

      {/* Rankings Leaderboard */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4 bg-surface/25">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-container/40 border border-outline/10 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <div className="py-24 text-center bg-surface/25">
            <BrainCircuit className="mx-auto text-muted mb-3" size={48} />
            <h4 className="font-bold text-on-surface text-base font-display">No Rankings Generated</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto leading-relaxed">
              No candidates have applied to this job position yet, or the candidate analysis is pending.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs bg-surface/25">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline/25 text-muted bg-surface-container/30 font-bold uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Workflow Status</th>
                  <th className="py-4 px-6">Resume Rating</th>
                  <th className="py-4 px-6">Technical (Skills)</th>
                  <th className="py-4 px-6">Culture Fit</th>
                  <th className="py-4 px-6 text-right">Weighted Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {rankings.map((cand, index) => {
                  const isTop = index === 0;
                  return (
                    <tr 
                      key={cand.candidateId} 
                      className={`hover:bg-surface-container/50 cursor-pointer transition-all duration-300 shimmer-card ${isTop ? 'bg-primary/5 hover:bg-primary/10 border-l-2 border-primary' : ''}`}
                      onClick={() => setSelectedCandidate(cand)}
                    >
                      <td className="py-5 px-6 whitespace-nowrap font-bold">
                        {isTop ? (
                          <span className="flex items-center gap-1 text-primary-light font-display">
                            🥇 Rank 1
                          </span>
                        ) : (
                          <span className="text-muted font-mono font-medium">#{index + 1}</span>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <div className="overflow-hidden">
                          <p className="font-bold text-on-surface text-sm truncate font-display">{cand.candidateName}</p>
                          <p className="text-[10px] text-on-surface-variant/75 mt-0.5 truncate">{cand.feedback}</p>
                        </div>
                      </td>
                      <td className="py-5 px-6 whitespace-nowrap">
                        <span className={getStatusStyle(cand.status)}>
                          {cand.status}
                        </span>
                      </td>
                      {/* Resume score bar */}
                      <td className="py-5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-on-surface font-mono w-8 text-xs">{cand.resumeScore}%</span>
                          <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-primary progress-glow-primary" style={{ width: `${cand.resumeScore}%` }}></div>
                          </div>
                        </div>
                      </td>
                      {/* Tech score bar */}
                      <td className="py-5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-secondary font-mono w-8 text-xs">{cand.technicalScore}%</span>
                          <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-secondary progress-glow-secondary" style={{ width: `${cand.technicalScore}%` }}></div>
                          </div>
                        </div>
                      </td>
                      {/* Culture score bar */}
                      <td className="py-5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-tertiary font-mono w-8 text-xs">{cand.cultureScore}%</span>
                          <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-tertiary progress-glow-tertiary" style={{ width: `${cand.cultureScore}%` }}></div>
                          </div>
                        </div>
                      </td>
                      {/* Final Weighted Score */}
                      <td className="py-5 px-6 text-right whitespace-nowrap font-extrabold text-sm text-on-surface">
                        <div className="inline-flex items-center gap-1.5">
                          {isTop && <Sparkles size={12} className="text-tertiary animate-pulse" />}
                          <span className={`${isTop ? 'text-primary-light font-extrabold text-base font-display' : 'text-on-surface'}`}>
                            {cand.overallScore}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Detail Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm transition-all duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedCandidate(null)}></div>
          <div className="relative w-full max-w-lg bg-surface border-l border-outline/30 h-full shadow-2xl p-8 flex flex-col justify-between overflow-y-auto animate-slide-up">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-outline/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary-light flex items-center justify-center font-bold">
                    {selectedCandidate.candidateName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface font-display">{selectedCandidate.candidateName}</h3>
                    <p className="text-xs text-muted font-mono uppercase tracking-wider">{selectedCandidate.status}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="p-1.5 hover:bg-surface-container rounded-lg text-muted hover:text-on-surface"
                >
                  ✕
                </button>
              </div>

              {/* Matching Summary */}
              <div className="mt-8 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-on-surface font-mono uppercase tracking-wider mb-2">Overall Match Rating</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-extrabold text-primary-light font-display">{selectedCandidate.overallScore}%</span>
                    <span className="text-xs text-on-surface-variant leading-relaxed">
                      This score represents a weighted algorithm evaluating skills, resume profile context, and sentiment analysis.
                    </span>
                  </div>
                </div>

                {/* Score breakdown sliders */}
                <div className="space-y-4 pt-4 border-t border-outline/20">
                  <h4 className="text-xs font-bold text-on-surface font-mono uppercase tracking-wider">Algorithmic Breakdown</h4>
                  
                  {/* Resume parsing match */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-on-surface">Resume Context Match (40%)</span>
                      <span className="text-primary-light font-mono font-bold">{selectedCandidate.resumeScore}%</span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary progress-glow-primary" style={{ width: `${selectedCandidate.resumeScore}%` }}></div>
                    </div>
                  </div>

                  {/* Skills parsing match */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-on-surface">Technical Skills Index (35%)</span>
                      <span className="text-secondary font-mono font-bold">{selectedCandidate.technicalScore}%</span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary progress-glow-secondary" style={{ width: `${selectedCandidate.technicalScore}%` }}></div>
                    </div>
                  </div>

                  {/* Culture notes match */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-on-surface">Culture Notes Sentiment (25%)</span>
                      <span className="text-tertiary font-mono font-bold">{selectedCandidate.cultureScore}%</span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-tertiary progress-glow-tertiary" style={{ width: `${selectedCandidate.cultureScore}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* AI Reviewer Logs */}
                <div className="pt-4 border-t border-outline/20 space-y-2">
                  <h4 className="text-xs font-bold text-on-surface font-mono uppercase tracking-wider">AI Assessment & Feedback</h4>
                  <div className="bg-surface-container/50 border border-outline/10 p-4 rounded-xl text-xs text-on-surface-variant leading-relaxed font-sans italic">
                    "{selectedCandidate.feedback}"
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-6 border-t border-outline/20 flex gap-4 mt-8">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="btn-ghost !py-2.5 !px-4 text-xs font-semibold flex-1 font-mono uppercase tracking-wider"
              >
                Close Drawer
              </button>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="btn-primary !py-2.5 !px-4 text-xs font-semibold flex-1 font-mono uppercase tracking-wider"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
