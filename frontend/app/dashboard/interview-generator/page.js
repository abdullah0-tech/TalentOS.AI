'use client';

import { useState } from 'react';
import { request } from '../../../services/api';
import { 
  FileQuestion, 
  Sparkles, 
  HelpCircle, 
  Printer, 
  Copy, 
  BrainCircuit, 
  ChevronDown,
  Info,
  CheckCircle,
  Award,
  Users,
  Compass
} from 'lucide-react';

export default function InterviewGeneratorPage() {
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('Mid-level');
  const [skills, setSkills] = useState('');
  const [difficulty, setDifficulty] = useState('Mid-level');
  
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!role || generating) return;

    setGenerating(true);
    setError('');
    setSuccessMsg('');
    setQuestions([]);

    try {
      const data = await request('/ai/interview-questions', {
        method: 'POST',
        body: {
          role,
          level,
          skills,
          difficulty
        }
      });
      
      setQuestions(data.questions || []);
      setSuccessMsg('Successfully created custom interview sheets!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to generate interview questions:', err);
      setError('AI generation failed. Make sure Express backend is online.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const formatted = questions.map((q, idx) => (
      `Q${idx + 1} [${q.category.toUpperCase()}] (${q.difficulty})\nQuestion: ${q.question}\nPurpose: ${q.purpose}\nExpected Answer: ${q.expectedAnswer}\n`
    )).join('\n---\n\n');

    navigator.clipboard.writeText(formatted);
    setSuccessMsg('Copied all questions to clipboard!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const printDocument = () => {
    window.print();
  };

  // Group questions by category
  const categories = {
    technical: questions.filter(q => q.category === 'technical'),
    behavioral: questions.filter(q => q.category === 'behavioral'),
    'culture-fit': questions.filter(q => q.category === 'culture-fit' || q.category === 'culture'),
    scenario: questions.filter(q => q.category === 'scenario')
  };

  return (
    <div className="space-y-8 print:p-0 print:bg-surface print:text-black">
      {/* Title Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
            <FileQuestion className="text-indigo-400" size={32} /> Interview Question Generator
          </h1>
          <p className="text-sm text-muted mt-1">
            Instantly create position-tailored technical, scenario, and culture-fit assessment questionnaires.
          </p>
        </div>

        {questions.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="p-2.5 rounded-xl border border-outline bg-surface/60 hover:bg-surface-high text-muted hover:text-on-surface transition"
              title="Copy Questions"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={printDocument}
              className="p-2.5 rounded-xl border border-outline bg-surface/60 hover:bg-surface-high text-muted hover:text-on-surface transition"
              title="Print / Export PDF"
            >
              <Printer size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
        {/* Left panel: Config form (1 col) */}
        <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 h-fit space-y-4 print:hidden">
          <h3 className="font-bold text-lg text-on-surface mb-2 flex items-center gap-2">
            <BrainCircuit size={20} className="text-indigo-400" /> Target Profile
          </h3>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-start gap-2">
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-start gap-2">
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Job Role Name</label>
              <input 
                type="text" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                className="w-full bg-surface border border-outline focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Level</label>
                <div className="relative">
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-surface border border-outline text-xs text-on-surface-variant rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 appearance-none font-semibold cursor-pointer"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-muted pointer-events-none" size={12} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Difficulty</label>
                <div className="relative">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-surface border border-outline text-xs text-on-surface-variant rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 appearance-none font-semibold cursor-pointer"
                  >
                    <option value="Junior">Easy</option>
                    <option value="Mid-level">Medium</option>
                    <option value="Senior">Hard</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-muted pointer-events-none" size={12} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Target Stack / Skills</label>
              <input 
                type="text" 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Next.js, Redux"
                className="w-full bg-surface border border-outline focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={!role || generating}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs shadow-lg shadow-indigo-600/10"
            >
              {generating ? (
                <>
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></span>
                  Formulating QA...
                </>
              ) : (
                <>
                  Generate Question Sheet <Sparkles size={14} />
                </>
              )}
            </button>
          </form>

          <div className="p-4 bg-surface/60 border border-outline rounded-xl text-[10px] text-muted flex items-start gap-2">
            <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Questions are split into technical foundations, behavioral scenarios matching corporate standards, and culture-fit assessments.
            </p>
          </div>
        </div>

        {/* Right panel: Questions rendering (2 cols) */}
        <div className="lg:col-span-2 space-y-6 print:w-full print:block">
          {questions.length === 0 ? (
            <div className="bg-background/40 border border-outline/80 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <FileQuestion size={48} className="text-slate-650 mb-3 animate-pulse" />
              <h4 className="font-bold text-on-surface text-base">No Questionnaire Open</h4>
              <p className="text-xs text-muted mt-1 max-w-sm leading-relaxed">
                Specify a job role and click generate to populate candidate question banks.
              </p>
            </div>
          ) : (
            <div className="space-y-6 print:space-y-4">
              {/* Question categories cards */}
              {Object.keys(categories).map((catName) => {
                const list = categories[catName];
                if (list.length === 0) return null;
                
                // Get Icon matching category
                let icon = <Compass size={16} />;
                if (catName === 'technical') icon = <Award size={16} />;
                if (catName === 'behavioral') icon = <Users size={16} />;
                if (catName === 'scenario') icon = <Compass size={16} />;

                return (
                  <div key={catName} className="bg-background/40 border border-outline/80 rounded-2xl p-6 print:border-none print:p-0">
                    <h3 className="font-bold text-sm text-indigo-400 flex items-center gap-2 mb-4 pb-2 border-b border-outline print:text-black print:border-black uppercase tracking-wider">
                      {icon} {catName} Questions
                    </h3>

                    <div className="space-y-6 divide-y divide-slate-850 print:divide-black">
                      {list.map((q, idx) => (
                        <div key={q.id} className={`pt-4 first:pt-0`}>
                          <p className="font-bold text-xs text-on-surface leading-relaxed flex gap-2 print:text-black">
                            <span className="text-indigo-400 shrink-0 print:text-black">Q{idx + 1}.</span>
                            {q.question}
                          </p>
                          <div className="mt-2 pl-6 space-y-1.5 text-[11px]">
                            <p className="text-muted print:text-on-surface-variant">
                              <span className="font-bold text-muted print:text-black">Purpose:</span> {q.purpose}
                            </p>
                            <p className="text-indigo-200/90 leading-relaxed print:text-on-surface bg-surface/30 p-2.5 rounded-lg border border-outline print:border-transparent print:p-0">
                              <span className="font-bold text-indigo-400 print:text-black">Expected Answer:</span> {q.expectedAnswer}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
