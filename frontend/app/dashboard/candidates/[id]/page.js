'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { request } from '../../../../services/api';
import { 
  User, 
  Briefcase, 
  Linkedin, 
  Globe, 
  FileText, 
  Cpu, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  ArrowLeft,
  Calendar,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Send,
  Video
} from 'lucide-react';

export default function CandidateDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // Employee promotion details
  const [promoDept, setPromoDept] = useState('');
  const [promoPos, setPromoPos] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

  const fetchCandidateDetails = async () => {
    try {
      const data = await request(`/applications/${id}`);
      setCandidate(data);
      setPromoDept(data.job?.department || '');
      setPromoPos(data.job?.title || '');
    } catch (err) {
      console.error(err);
      setError('Could not load candidate details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setCandidate(prev => ({ ...prev, status: newStatus }));
      await request(`/applications/${id}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
    } catch (err) {
      console.error(err);
      setError('Failed to update pipeline stage.');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setSubmittingNote(true);
      const data = await request(`/applications/${id}/notes`, {
        method: 'POST',
        body: { note: newNote }
      });
      // Append note to candidate notes list
      setCandidate(prev => ({
        ...prev,
        notes: [data.note, ...prev.notes]
      }));
      setNewNote('');
    } catch (err) {
      console.error(err);
      setError('Failed to save recruiter note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handlePromoteToEmployee = async (e) => {
    e.preventDefault();
    if (!promoDept.trim() || !promoPos.trim()) return;

    try {
      setPromoting(true);
      await request('/employees', {
        method: 'POST',
        body: {
          candidateId: id,
          name: candidate.candidateName,
          email: candidate.email,
          department: promoDept,
          position: promoPos
        }
      });
      setPromoSuccess(true);
      setCandidate(prev => ({ ...prev, status: 'hired' }));
      setTimeout(() => {
        router.push('/dashboard/employees');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to convert candidate to employee.');
    } finally {
      setPromoting(false);
    }
  };

  const parseJsonArray = (jsonStr) => {
    if (!jsonStr) return [];
    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return jsonStr.split(',').map(s => s.trim());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-8 text-center text-on-surface bg-surface min-h-screen">
        <p className="text-lg text-muted">Candidate not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-indigo-400 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const score = candidate.aiScore || 0;
  let scoreColor = 'text-red-400 bg-red-500/5 border-red-500/10';
  let scoreProgress = 'bg-red-500';
  if (score >= 75) {
    scoreColor = 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10';
    scoreProgress = 'bg-emerald-500';
  } else if (score >= 50) {
    scoreColor = 'text-amber-400 bg-amber-500/5 border-amber-500/10';
    scoreProgress = 'bg-amber-500';
  }

  const backendBaseUrl = 'http://localhost:5000';

  return (
    <div className="space-y-8 pb-16 bg-surface text-on-surface">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-outline pb-6">
        <button 
          onClick={() => router.push('/dashboard/candidates')}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-on-surface transition"
        >
          <ArrowLeft size={16} /> Back to Screening Board
        </button>
        
        {/* Status controls shortcut bar */}
        <div className="flex bg-background p-1 rounded-xl border border-outline">
          {['applied', 'screening', 'shortlisted', 'interview', 'hired', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider capitalize transition ${
                candidate.status === st 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-muted hover:text-on-surface-variant'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Main Candidate Card */}
      <div className="bg-surface-high/20 border border-outline p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">{candidate.candidateName}</h1>
          <p className="text-muted text-sm flex items-center gap-1.5">
            <Briefcase size={14} /> Applied for <span className="font-semibold text-on-surface">"{candidate.job?.title}"</span>
          </p>
          <p className="text-xs text-muted">Contact: {candidate.email}</p>
        </div>

        {/* Social Profile links */}
        <div className="flex flex-wrap gap-3">
          <a 
            href={`${backendBaseUrl}${candidate.resumeUrl}`} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline bg-surface-high text-xs font-semibold text-on-surface-variant hover:text-on-surface transition"
          >
            <FileText size={14} /> Open Resume
          </a>
          {candidate.linkedinUrl && (
            <a 
              href={candidate.linkedinUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline bg-surface-high text-xs font-semibold text-indigo-400 hover:bg-slate-750 transition"
            >
              <Linkedin size={14} /> LinkedIn
            </a>
          )}
          {candidate.portfolioUrl && (
            <a 
              href={candidate.portfolioUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline bg-surface-high text-xs font-semibold text-violet-400 hover:bg-slate-750 transition"
            >
              <Globe size={14} /> Portfolio
            </a>
          )}
        </div>
      </div>

      {/* Grid: 2/3 Main AI details, 1/3 Side notes & conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main evaluations) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Executive AI overview */}
          <div className="bg-surface-high/30 border border-outline rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-outline pb-4">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <Cpu className="text-indigo-400" size={18} /> Grok AI Match Screening
              </h3>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${scoreColor}`}>
                {score}% Match Rate
              </span>
            </div>

            {/* Match score bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted">
                <span>AI Screening Score</span>
                <span>{score}%</span>
              </div>
              <div className="w-full h-3 bg-background rounded-full overflow-hidden">
                <div className={`h-full ${scoreProgress} transition-all duration-500`} style={{ width: `${score}%` }} />
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Executive Summary</span>
              <p className="text-sm text-on-surface-variant leading-relaxed bg-surface/40 p-4 border border-outline rounded-xl">
                {candidate.aiSummary || 'Summary not compiled.'}
              </p>
            </div>

            {/* Recommendation badge */}
            <div className="p-4 rounded-xl border border-indigo-500/15 bg-indigo-500/5 flex items-start gap-3">
              <CheckCircle className="text-indigo-400 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs text-muted font-semibold uppercase tracking-wider">AI Hiring Recommendation</p>
                <p className="text-sm font-bold text-on-surface mt-0.5">{candidate.recommendation || 'Needs normal manual evaluation.'}</p>
              </div>
            </div>
          </div>

          {/* Deep AI Candidate Insights */}
          <div className="bg-surface-high/30 border border-outline rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-lg text-on-surface">AI Candidate Intelligence</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-muted font-semibold uppercase tracking-wider">Personality Summary</span>
                <p className="text-sm text-on-surface-variant bg-surface/20 p-3 rounded-lg border border-outline/50">{candidate.personalitySummary || 'Review resume details.'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted font-semibold uppercase tracking-wider">Communication Quality</span>
                <p className="text-sm text-slate-355 bg-surface/20 p-3 rounded-lg border border-outline/50">{candidate.communicationAssessment || 'Good documentation traits.'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted font-semibold uppercase tracking-wider">Technical Strengths</span>
                <p className="text-sm text-slate-355 bg-surface/20 p-3 rounded-lg border border-outline/50">{candidate.technicalStrength || 'Proficient in standard technical stacks.'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted font-semibold uppercase tracking-wider">Leadership Potential</span>
                <p className="text-sm text-slate-355 bg-surface/20 p-3 rounded-lg border border-outline/50">{candidate.leadershipPotential || 'Potential mentor and team player.'}</p>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-surface-high/30 border border-outline rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-on-surface text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Key Strengths
              </h4>
              <ul className="space-y-2">
                {parseJsonArray(candidate.strengths).map((str, index) => (
                  <li key={index} className="text-sm text-on-surface-variant flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 mt-1">✓</span> {str}
                  </li>
                ))}
                {parseJsonArray(candidate.strengths).length === 0 && (
                  <li className="text-xs text-muted">None logged.</li>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-surface-high/30 border border-outline rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-on-surface text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Development Areas
              </h4>
              <ul className="space-y-2">
                {parseJsonArray(candidate.weaknesses).map((wk, index) => (
                  <li key={index} className="text-sm text-on-surface-variant flex items-start gap-2">
                    <span className="text-red-500 shrink-0 mt-1">⚠</span> {wk}
                  </li>
                ))}
                {parseJsonArray(candidate.weaknesses).length === 0 && (
                  <li className="text-xs text-muted">None logged.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Skills matching grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched skills */}
            <div className="bg-surface-high/30 border border-outline rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-on-surface text-sm">Matched Core Skills ({parseJsonArray(candidate.matchedSkills).length})</h4>
              <div className="flex flex-wrap gap-2">
                {parseJsonArray(candidate.matchedSkills).map((sk, index) => (
                  <span key={index} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 capitalize">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing skills */}
            <div className="bg-surface-high/30 border border-outline rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-on-surface text-sm">Missing Required Skills ({parseJsonArray(candidate.missingSkills).length})</h4>
              <div className="flex flex-wrap gap-2">
                {parseJsonArray(candidate.missingSkills).map((sk, index) => (
                  <span key={index} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/25 capitalize">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar details) */}
        <div className="space-y-8">
          
          {/* Hired Promotion card */}
          {candidate.status === 'hired' && (
            <div className="bg-surface-high/40 border border-emerald-500/20 rounded-2xl p-6 space-y-4 relative overflow-hidden">
              {/* Subtle top indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
              
              <div className="flex items-center gap-2">
                <UserPlus className="text-emerald-400" size={20} />
                <h3 className="font-bold text-on-surface text-lg">Promote to Employee</h3>
              </div>
              <p className="text-xs text-muted">Convert this candidate's application file into an active profile in your staff directory.</p>

              {promoSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-3 rounded-xl text-xs font-semibold">
                  ✓ Employee profile registered. Redirecting...
                </div>
              ) : (
                <form onSubmit={handlePromoteToEmployee} className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted uppercase font-semibold">Joined Department</label>
                    <input 
                      type="text"
                      value={promoDept}
                      onChange={(e) => setPromoDept(e.target.value)}
                      placeholder="Engineering, Product..."
                      required
                      className="w-full bg-background border border-outline px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted uppercase font-semibold">Position Title</label>
                    <input 
                      type="text"
                      value={promoPos}
                      onChange={(e) => setPromoPos(e.target.value)}
                      placeholder="Software Engineer..."
                      required
                      className="w-full bg-background border border-outline px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-on-surface"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={promoting}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    {promoting ? 'Creating Profile...' : 'Confirm Onboarding'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Interview History */}
          <div className="bg-surface-high/30 border border-outline rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline pb-2">
              <h3 className="font-bold text-on-surface text-sm">Scheduled Interviews</h3>
              <Link 
                href={`/dashboard/interviews?candidate=${encodeURIComponent(candidate.candidateName)}`}
                className="text-[10px] text-indigo-400 hover:underline font-semibold"
              >
                + Schedule
              </Link>
            </div>

            <div className="space-y-3">
              {candidate.interviews?.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No interviews scheduled yet.</p>
              ) : (
                candidate.interviews?.map((int) => (
                  <div key={int.id} className="p-3 bg-surface/60 border border-outline rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-on-surface">{int.interviewer?.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{int.status}</span>
                    </div>
                    <p className="text-[10px] text-muted">{new Date(int.date).toLocaleString()}</p>
                    
                    {int.meetingLink && (
                      <a 
                        href={int.meetingLink.startsWith('http') ? int.meetingLink : `https://${int.meetingLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1 bg-surface-high hover:bg-surface-high border border-slate-750 text-[10px] rounded font-semibold text-on-surface flex items-center justify-center gap-1.5 transition"
                      >
                        <Video size={10} /> Join Call
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Internal Notes Feed */}
          <div className="bg-surface-high/30 border border-outline rounded-2xl p-6 space-y-4 flex flex-col">
            <h3 className="font-bold text-on-surface text-sm border-b border-outline pb-2 flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-400" /> Recruiter Comments
            </h3>

            {/* Note form */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Add feedback note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                required
                className="flex-1 bg-background border border-outline px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-on-surface"
              />
              <button
                type="submit"
                disabled={submittingNote}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
              >
                <Send size={12} />
              </button>
            </form>

            {/* Notes log timeline */}
            <div className="space-y-4 overflow-y-auto max-h-[300px] scrollbar-none pt-2">
              {candidate.notes?.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No internal team comments.</p>
              ) : (
                candidate.notes?.map((n) => (
                  <div key={n.id} className="p-3 bg-surface/30 border border-outline/60 rounded-xl space-y-1">
                    <div className="flex justify-between text-[10px] text-muted">
                      <span className="font-semibold text-on-surface-variant">{n.user?.name}</span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-on-surface leading-normal">{n.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
