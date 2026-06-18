'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertCircle, 
  Sparkles
} from 'lucide-react';

// Micro messages list to rotate
const MICRO_MESSAGES = [
  "Great teams start with great hiring.",
  "Building workforce insights.",
  "Connecting people and performance.",
  "Preparing employee intelligence.",
  "Organizing your workplace data.",
  "Finding meaningful patterns."
];

// Workflow definitions for steps
const WORKFLOWS = {
  'ai-thinking': [
    { label: 'Reading candidate profile', duration: 800 },
    { label: 'Extracting skills', duration: 1000 },
    { label: 'Matching requirements', duration: 900 },
    { label: 'Calculating score', duration: 700 },
    { label: 'Generating insights', duration: 1200 },
    { label: 'Finalizing recommendation', duration: 800 }
  ],
  'resume': [
    { label: 'Uploading Resume', duration: 600 },
    { label: 'Parsing Document', duration: 1000 },
    { label: 'Extracting Text', duration: 800 },
    { label: 'Identifying Skills', duration: 1100 },
    { label: 'Calculating Match Score', duration: 900 },
    { label: 'Generating AI Summary', duration: 1200 }
  ],
  'job-creation': [
    { label: 'Creating Position', duration: 700 },
    { label: 'Generating Public Career Page', duration: 900 },
    { label: 'Configuring Application Pipeline', duration: 1000 },
    { label: 'Publishing Job', duration: 800 },
    { label: 'Ready', duration: 500 }
  ],
  'employee-creation': [
    { label: 'Creating Employee Profile', duration: 800 },
    { label: 'Generating Account', duration: 900 },
    { label: 'Assigning Permissions', duration: 800 },
    { label: 'Sending Welcome Email', duration: 1100 },
    { label: 'Activating Workspace Access', duration: 700 },
    { label: 'Complete', duration: 500 }
  ]
};

export default function WorkforceLoader({ 
  mode = 'global', // 'global' | 'ai-thinking' | 'resume' | 'job-creation' | 'employee-creation'
  onComplete,
  isFinished = false, // Force completion if API finishes early
  customTitle = ''
}) {
  const [microMessage, setMicroMessage] = useState(MICRO_MESSAGES[0]);
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  const steps = WORKFLOWS[mode] || [];

  // Message rotator
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMicroMessage(prev => {
        const idx = MICRO_MESSAGES.indexOf(prev);
        return MICRO_MESSAGES[(idx + 1) % MICRO_MESSAGES.length];
      });
    }, 2500);
    return () => clearInterval(messageInterval);
  }, []);

  // Time elapsed counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Process checklist steps
  useEffect(() => {
    if (steps.length === 0) return;

    let timer;
    const runStep = (index) => {
      if (index >= steps.length) {
        if (isFinished && onComplete) {
          onComplete();
        }
        return;
      }

      setCurrentStep(index);
      timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, index]);
        runStep(index + 1);
      }, steps[index].duration);
    };

    // If finished is forced, complete everything
    if (isFinished) {
      setCompletedSteps(steps.map((_, i) => i));
      setCurrentStep(steps.length);
      if (onComplete) {
        const t = setTimeout(onComplete, 500);
        return () => clearTimeout(t);
      }
      return;
    }

    runStep(0);
    return () => clearTimeout(timer);
  }, [mode, isFinished]);

  // Fast-forward when isFinished turns true
  useEffect(() => {
    if (isFinished && steps.length > 0) {
      setCompletedSteps(steps.map((_, i) => i));
      setCurrentStep(steps.length);
    }
  }, [isFinished, steps]);

  // Determine progress percentage
  const getProgressPercentage = () => {
    if (steps.length === 0) {
      // For global, mock it based on elapsed time up to 95%
      return Math.min(95, Math.round((1 - Math.exp(-elapsed / 4)) * 100));
    }
    return Math.round((completedSteps.length / steps.length) * 100);
  };

  // SVG network graph layout nodes
  const nodes = [
    { id: 1, label: 'HR', x: 80, y: 120, size: 12, delay: 0 },
    { id: 2, label: 'ENG', x: 220, y: 70, size: 14, delay: 0.3 },
    { id: 3, label: 'DSN', x: 170, y: 190, size: 12, delay: 0.6 },
    { id: 4, label: 'PM', x: 300, y: 160, size: 15, delay: 0.9 },
    { id: 5, label: 'SLS', x: 340, y: 80, size: 12, delay: 1.2 },
    { id: 6, label: 'OPS', x: 70, y: 220, size: 13, delay: 1.5 },
    { id: 7, label: 'FIN', x: 260, y: 240, size: 12, delay: 1.8 },
    { id: 8, label: 'HQ', x: 200, y: 25, size: 18, delay: 2.1 }
  ];

  const connections = [
    { from: 8, to: 1 }, { from: 8, to: 2 },
    { from: 1, to: 6 }, { from: 1, to: 3 },
    { from: 2, to: 3 }, { from: 2, to: 4 }, { from: 2, to: 5 },
    { from: 3, to: 4 }, { from: 3, to: 7 },
    { from: 4, to: 5 }, { from: 4, to: 7 },
    { from: 6, to: 7 }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl theme-transition select-none">
      
      {/* 1. Brand Logo & Title */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <div className="text-left">
          <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100 font-display">TalentOS</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Workforce Intelligence</span>
        </div>
      </div>

      {/* 2. Custom Workforce Intelligence Network Animation */}
      <div className="relative w-full aspect-[4/3] max-h-56 mb-6 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/65 dark:border-slate-800/65 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 400 280" className="w-full h-full text-indigo-500 dark:text-indigo-400">
          {/* Moving Connection Lines (Data Streams) */}
          {connections.map((conn, idx) => {
            const n1 = nodes.find(n => n.id === conn.from);
            const n2 = nodes.find(n => n.id === conn.to);
            if (!n1 || !n2) return null;
            return (
              <g key={`link-${idx}`}>
                {/* Background Connection Line */}
                <line 
                  x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} 
                  className="stroke-slate-200 dark:stroke-slate-800/80" 
                  strokeWidth="1.5" 
                />
                {/* Moving Signal Dots Line */}
                <line 
                  x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} 
                  className="stroke-indigo-500/40 dark:stroke-indigo-400/40 stroke-dash-flow" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 8"
                  style={{
                    animation: 'strokeFlow 1.5s linear infinite'
                  }}
                />
              </g>
            );
          })}

          {/* Node Rings & Glow Circles */}
          {nodes.map((node) => (
            <g key={`node-group-${node.id}`}>
              {/* Outer pulsing ring */}
              <circle 
                cx={node.x} cy={node.y} r={node.size + 6}
                className="fill-transparent stroke-indigo-500/10 dark:stroke-indigo-400/10"
                strokeWidth="1"
              >
                <animate 
                  attributeName="r" 
                  values={`${node.size + 2};${node.size + 10};${node.size + 2}`} 
                  dur="3s" 
                  begin={`${node.delay}s`} 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="opacity" 
                  values="0.8;0.1;0.8" 
                  dur="3s" 
                  begin={`${node.delay}s`} 
                  repeatCount="indefinite" 
                />
              </circle>

              {/* Solid Node Core */}
              <circle 
                cx={node.x} cy={node.y} r={node.size}
                className="fill-white dark:fill-slate-900 stroke-indigo-500 dark:stroke-indigo-400"
                strokeWidth="2.5"
              />

              {/* Inner details / labels */}
              <text 
                x={node.x} y={node.y + 3} 
                className="text-[8px] font-bold text-center font-mono fill-indigo-600 dark:fill-indigo-300"
                textAnchor="middle"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* CSS Keyframes for animated dashed lines */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes strokeFlow {
            from {
              stroke-dashoffset: 24;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
          .stroke-dash-flow {
            animation: strokeFlow 1.2s linear infinite !important;
          }
        `}} />
      </div>

      {/* 3. Main Message and Progress Bar */}
      <div className="w-full text-center space-y-3 px-4">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight font-display">
          {customTitle ? customTitle : 
           mode === 'global' ? 'Preparing Workspace...' : 
           mode === 'ai-thinking' ? 'AI Workforce Intelligence Thinking...' :
           mode === 'resume' ? 'Analyzing Candidate Resume...' :
           mode === 'job-creation' ? 'Publishing Requisition...' : 'Onboarding Staff member...'}
        </h3>
        
        {/* Progress bar container */}
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-teal-400 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ ease: 'easeOut', duration: 0.3 }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
          <span>{mode.replace('-', ' ')} status</span>
          <span>{getProgressPercentage()}%</span>
        </div>
      </div>

      {/* 4. Checklist steps for specialized workflows */}
      {steps.length > 0 && (
        <div className="w-full mt-6 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 space-y-3 font-sans">
          {steps.map((step, idx) => {
            const isCompleted = completedSteps.includes(idx);
            const isActive = currentStep === idx;
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0.6, y: 4 }}
                animate={{ 
                  opacity: isActive || isCompleted ? 1 : 0.4,
                  y: 0,
                  scale: isActive ? 1.01 : 1
                }}
                className={`flex items-center gap-3 text-xs transition-colors duration-200 text-left ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 
                  isCompleted ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
                )}
                <span>{step.label}</span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 5. Rotate Intelligent Micro Messages */}
      <div className="w-full mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
        <AnimatePresence mode="wait">
          <motion.p 
            key={microMessage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-xs text-slate-600 dark:text-slate-400 font-medium italic"
          >
            "{microMessage}"
          </motion.p>
        </AnimatePresence>
      </div>

      {/* 6. Estimated Wait Feedback (alerts at 3s and 8s) */}
      <div className="h-8 mt-2 flex items-center justify-center">
        <AnimatePresence>
          {elapsed > 8 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-550/10 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20"
            >
              <AlertCircle size={10} className="animate-pulse" />
              <span>Optimizing workspace data... Almost ready.</span>
            </motion.div>
          ) : elapsed > 3 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold border border-indigo-500/20"
            >
              <Loader2 size={10} className="animate-spin" />
              <span>Still working... Large datasets may take a few moments.</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

    </div>
  );
}
