'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { request } from '../../../services/api';
import { socketService } from '../../../services/socket.service';
import { 
  Users, 
  Cpu, 
  Linkedin, 
  Globe, 
  FileText, 
  Search,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ChevronRight,
  Filter,
  KanbanSquare,
  Table,
  Plus,
  Briefcase,
  HelpCircle,
  Sparkles,
  ArrowRight,
  FileCheck
} from 'lucide-react';

export default function CandidatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterRecommended = searchParams.get('screening') === 'true';

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [tab, setTab] = useState(filterRecommended ? 'recommended' : 'all');
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'table'
  const [error, setError] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  
  // Drag over state for Kanban columns
  const [dragOverCol, setDragOverCol] = useState(null);

  useEffect(() => {
    fetchCandidates();

    const user = JSON.parse(localStorage.getItem('hireflow_user') || '{}');
    if (user?.companyId) {
      socketService.connect(user.companyId);
      
      socketService.on('candidate_status_updated', ({ candidateId, status }) => {
        setCandidates(prev => 
          prev.map(c => c.id === candidateId ? { ...c, status } : c)
        );
      });

      socketService.on('candidate_applied', () => {
        fetchCandidates();
      });
    }

    return () => {
      socketService.off('candidate_status_updated');
      socketService.off('candidate_applied');
    };
  }, []);

  const fetchCandidates = async () => {
    try {
      const data = await request('/applications');
      setCandidates(data);

      const skillsSet = new Set();
      data.forEach(cand => {
        const skills = parseJsonArray(cand.matchedSkills);
        skills.forEach(s => skillsSet.add(s.toLowerCase()));
      });
      setAvailableSkills(Array.from(skillsSet));
    } catch (err) {
      console.error(err);
      setError('Could not retrieve candidate applications.');
    } finally {
      setLoading(false);
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

  const handleMoveCandidate = async (candidateId, newStatus) => {
    try {
      setCandidates(prev => 
        prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c)
      );

      await request(`/applications/${candidateId}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
    } catch (err) {
      console.error('Failed to update candidate status:', err.message);
      setError('Failed to update candidate recruitment stage.');
      fetchCandidates();
    }
  };

  const onDragStart = (e, candidateId) => {
    e.dataTransfer.setData('text/plain', candidateId);
  };

  const onDragOver = (e, colId) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const onDragLeave = () => {
    setDragOverCol(null);
  };

  const onDrop = (e, targetStage) => {
    e.preventDefault();
    setDragOverCol(null);
    const candidateId = e.dataTransfer.getData('text/plain');
    if (candidateId) {
      handleMoveCandidate(candidateId, targetStage);
    }
  };

  const getFilteredCandidates = () => {
    return candidates.filter(c => {
      if (tab === 'recommended' && (c.aiScore || 0) < 70) {
        return false;
      }

      if (searchTerm.trim() !== '') {
        const s = searchTerm.toLowerCase();
        const matchesKeyword = 
          c.candidateName.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          (c.job?.title || '').toLowerCase().includes(s);
        if (!matchesKeyword) return false;
      }

      if (selectedSkill !== 'all') {
        const skills = parseJsonArray(c.matchedSkills).map(sk => sk.toLowerCase());
        if (!skills.includes(selectedSkill.toLowerCase())) return false;
      }

      return true;
    });
  };

  const filteredList = getFilteredCandidates();

  // TalentOS 7 Pipeline Columns
  const COLUMNS = [
    { id: 'applied', title: 'Applied', borderTheme: 'border-t-primary' },
    { id: 'screening', title: 'AI Reviewed', borderTheme: 'border-t-secondary' },
    { id: 'shortlisted', title: 'Shortlisted', borderTheme: 'border-t-amber-500' },
    { id: 'interview', title: 'Interview', borderTheme: 'border-t-rose-500' },
    { id: 'offer', title: 'Offer', borderTheme: 'border-t-accent' },
    { id: 'hired', title: 'Hired', borderTheme: 'border-t-success' },
    { id: 'rejected', title: 'Rejected', borderTheme: 'border-t-muted' }
  ];

  // Helper to generate project checker evaluation badges
  const getEvaluationBadge = (score) => {
    if (score >= 85) {
      return {
        label: 'GRADE_A_FIT',
        extra: 'STRICT_PASS',
        color: 'text-emerald-700 border-emerald-200 bg-emerald-50'
      };
    } else if (score >= 70) {
      return {
        label: 'GRADE_B_FIT',
        extra: 'PASS',
        color: 'text-blue-700 border-blue-200 bg-blue-50'
      };
    } else if (score >= 50) {
      return {
        label: 'GRADE_C_FIT',
        extra: 'WARNING_MISSING_SKILLS',
        color: 'text-amber-700 border-amber-200 bg-amber-50'
      };
    } else {
      return {
        label: 'GRADE_D_FIT',
        extra: 'FLAGGED',
        color: 'text-rose-700 border-rose-200 bg-rose-50'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-xs font-mono text-muted uppercase tracking-wider">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-on-surface font-display">Candidates Management</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Track and manage applicant stages, scores, and interview pipelines.</p>
        </div>
        
        {/* Layout Toggle Buttons */}
        <div className="flex bg-surface-highest p-1 rounded-xl self-start border border-outline">
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'board' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <KanbanSquare size={13} /> Kanban Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Table size={13} /> Project DB
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl text-xs font-mono">
          {error}
        </div>
      )}

      {/* Control Bar (Filters + Tabs) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-outline p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-3">
          {/* Tab Selection */}
          <div className="flex bg-surface-highest p-1 rounded-xl border border-outline">
            <button
              onClick={() => setTab('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                tab === 'all' ? 'bg-surface text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Projects ({candidates.length})
            </button>
            <button
              onClick={() => setTab('recommended')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                tab === 'recommended' ? 'bg-surface text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Cpu size={12} /> GRADE_A Top Pass ({candidates.filter(c => (c.aiScore || 0) >= 70).length})
            </button>
          </div>

          {/* Skill Filter Dropdown */}
          <div className="flex items-center gap-2 bg-surface-high px-3 py-1 rounded-xl border border-outline">
            <Filter size={12} className="text-muted" />
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="bg-transparent text-xs text-on-surface-variant font-bold focus:outline-none border-none outline-none pr-4"
            >
              <option value="all" className="bg-surface text-on-surface">Filter by Tag</option>
              {availableSkills.map((sk) => (
                <option key={sk} value={sk} className="bg-surface text-on-surface">{sk.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Keyword Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-muted" size={15} />
          <input
            type="text"
            placeholder="Search candidate or project title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-outline text-xs pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface placeholder-muted shadow-sm"
          />
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'board' && (
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory min-h-[600px]">
          {COLUMNS.map((col) => {
            const columnCandidates = filteredList.filter(
              (c) => (c.status || 'applied').toLowerCase() === col.id
            );
            const isDraggedOver = dragOverCol === col.id;

            return (
              <div 
                key={col.id} 
                className={`flex-1 min-w-[290px] max-w-[340px] border-t-2 rounded-2xl p-3 flex flex-col gap-3 transition-all duration-300 snap-center ${
                  col.borderTheme
                } ${
                  isDraggedOver 
                    ? 'border-primary bg-primary/5 border-dashed border-x border-b shadow-sm' 
                    : 'border-outline bg-surface-high/50 border-x border-b'
                }`}
                onDragOver={(e) => onDragOver(e, col.id)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="font-bold text-xs text-on-surface uppercase tracking-wider font-mono">{col.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-highest/60 text-on-surface-variant border border-outline font-mono">
                    {columnCandidates.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[600px] scrollbar-none">
                  {columnCandidates.map((cand) => {
                    const score = cand.aiScore || 0;
                    const evalBadge = getEvaluationBadge(score);
                    const skills = parseJsonArray(cand.matchedSkills).slice(0, 3);

                    return (
                      <div
                        key={cand.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, cand.id)}
                        className="glass-card-premium p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-300 group relative overflow-hidden flex flex-col justify-between gap-3"
                      >
                        {/* Top Badge Indicators */}
                        <div className="flex items-center justify-between gap-2 border-b border-outline/30 pb-2">
                          <span className={`text-[8px] font-extrabold font-mono px-1.5 py-0.5 rounded border ${evalBadge.color}`}>
                            {evalBadge.label}
                          </span>
                          <span className="text-[8px] font-mono text-on-surface-variant">{evalBadge.extra}</span>
                        </div>

                        {/* Title and details */}
                        <div>
                          <p className="font-bold text-xs text-on-surface group-hover:text-primary transition truncate font-display">{cand.candidateName}</p>
                          <p className="text-[9px] text-on-surface-variant truncate flex items-center gap-1 mt-1 font-mono">
                            <Briefcase size={10} className="text-primary" /> {cand.job?.title || 'Unknown Project'}
                          </p>
                        </div>

                        {/* Middle score details */}
                        <div className="flex items-center justify-between font-mono text-[9px] text-on-surface-variant">
                          <span>Grade Index</span>
                          <span className="font-bold text-on-surface">{score}/100</span>
                        </div>

                        {/* Skill Tags */}
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {skills.map((sk) => (
                              <span key={sk} className="text-[8px] font-semibold font-mono px-1.5 py-0.2 rounded bg-primary-light text-primary border border-blue-100 uppercase">
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card footer details inspect */}
                        <div className="flex items-center justify-between pt-2 border-t border-outline/30">
                          <span className="text-[9px] text-on-surface-variant font-mono">{cand.experienceLevel || 'Not parsed'}</span>
                          <button 
                            onClick={() => router.push(`/dashboard/candidates/${cand.id}`)}
                            className="text-[9px] font-bold font-mono text-primary hover:text-primary/80 flex items-center gap-0.5 transition uppercase"
                          >
                            Grade File <ChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {columnCandidates.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-outline/80 rounded-xl py-12 text-center text-on-surface-variant text-[9px] font-mono">
                      Drag here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        filteredList.length === 0 ? (
          <div className="bg-surface border border-dashed border-outline rounded-2xl py-16 text-center">
            <FileCheck className="mx-auto text-muted mb-4 animate-pulse" size={36} />
            <h3 className="text-sm font-semibold text-on-surface">No Project Files</h3>
            <p className="text-xs text-on-surface-variant mt-1 font-mono">No submissions matched the filters.</p>
          </div>
        ) : (
          <div className="bg-surface border border-outline rounded-2xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-outline">
              <thead className="bg-surface-high border-b border-outline font-mono text-[10px]">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-on-surface-variant uppercase tracking-wider">Candidate Details</th>
                  <th className="px-6 py-4 text-left font-bold text-on-surface-variant uppercase tracking-wider">Target Job</th>
                  <th className="px-6 py-4 text-left font-bold text-on-surface-variant uppercase tracking-wider">Scoring Index</th>
                  <th className="px-6 py-4 text-left font-bold text-on-surface-variant uppercase tracking-wider">Automated Grade</th>
                  <th className="px-6 py-4 text-left font-bold text-on-surface-variant uppercase tracking-wider">Experience Index</th>
                  <th className="px-6 py-4 text-right font-bold text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/50 font-sans text-xs">
                {filteredList.map((cand) => {
                  const score = cand.aiScore || 0;
                  const evalBadge = getEvaluationBadge(score);

                  return (
                    <tr key={cand.id} className="hover:bg-surface-high transition duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-xs font-bold text-on-surface font-display">{cand.candidateName}</p>
                          <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">{cand.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">
                        {cand.job?.title || 'Unknown Role'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border ${evalBadge.color} font-mono`}>
                          {score}/100 Grade
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-[10px] text-on-surface">
                        <span className="px-2 py-0.5 bg-surface-highest border border-outline rounded-lg text-primary">
                          {evalBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant font-mono text-[11px]">
                        {cand.experienceLevel || 'Not parsed'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <button
                          onClick={() => router.push(`/dashboard/candidates/${cand.id}`)}
                          className="inline-flex items-center gap-0.5 text-xs font-bold text-primary hover:text-primary/80 transition font-mono uppercase"
                        >
                          Grade File <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
