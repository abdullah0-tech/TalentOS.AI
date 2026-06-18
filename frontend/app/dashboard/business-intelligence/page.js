'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  ArrowRight, 
  Download, 
  Calendar, 
  Mail, 
  Plus, 
  X, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ListPlus,
  Play
} from 'lucide-react';

export default function BusinessIntelligencePage() {
  const [selectedFields, setSelectedFields] = useState(['Employee Name', 'Department', 'Net Pay']);
  const [reportCategory, setReportCategory] = useState('payroll');
  const [exportFormat, setExportFormat] = useState('csv');
  const [scheduleActive, setScheduleActive] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('monthly');
  const [scheduleEmail, setScheduleEmail] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');

  const availableFields = {
    recruitment: ['Candidate Name', 'Job Title', 'AI Screen Score', 'Interview Stage', 'Offer Status'],
    attendance: ['Employee Name', 'Punch-In Time', 'Punch-Out Time', 'Overtime Hours', 'Work Date'],
    payroll: ['Employee Name', 'Department', 'Base Salary', 'Allowances', 'Deductions', 'Net Pay'],
    lms: ['Employee Name', 'Enrolled Course', 'Module Completion %', 'Quiz Score Avg', 'License Awarded'],
    retention: ['Department', 'Hiring Velocity', 'Turnover Rate %', 'Average Seat Age']
  };

  const handleAddField = (field) => {
    if (selectedFields.includes(field)) return;
    setSelectedFields(prev => [...prev, field]);
  };

  const handleRemoveField = (field) => {
    setSelectedFields(prev => prev.filter(f => f !== field));
  };

  const handleCategoryChange = (cat) => {
    setReportCategory(cat);
    // Reset selected fields to defaults for that category
    setSelectedFields(availableFields[cat].slice(0, 3));
  };

  const handleGenerateReport = () => {
    setGenerating(true);
    setSuccess('');
    setTimeout(() => {
      setGenerating(false);
      setSuccess(`Report compiles successfully! Downloaded simulated ${selectedFields.length}-column data sheet in .${exportFormat} format.`);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <BarChart3 className="text-indigo-400" size={32} />
          Business Intelligence & Reports
        </h1>
        <p className="text-sm text-muted mt-1">
          Drag and drop custom datasets, export spreadsheet templates (CSV, PDF, JSON), and automate scheduled email dispatches.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Report categories & Fields list */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Data Category Select */}
          <div className="bg-surface/30 border border-outline p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <ListPlus size={16} className="text-indigo-400" />
              1. Select Data Stream
            </h3>
            <div className="space-y-2">
              {[
                { key: 'recruitment', label: 'Recruitment & ATS' },
                { key: 'attendance', label: 'Attendance & Punch-logs' },
                { key: 'payroll', label: 'Payroll & Allowances Ledger' },
                { key: 'lms', label: 'LMS Progress & Licenses' },
                { key: 'retention', label: 'Retention & Attrition' }
              ].map(c => (
                <button
                  key={c.key}
                  onClick={() => handleCategoryChange(c.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                    reportCategory === c.key 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10' 
                      : 'bg-background border-outline text-muted hover:text-on-surface'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Available Fields */}
          <div className="bg-surface/30 border border-outline p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-on-surface">2. Add Data Fields</h3>
            <p className="text-[10px] text-muted leading-normal">Click a field chip to insert it into the active report schema.</p>
            <div className="flex flex-wrap gap-2">
              {availableFields[reportCategory].map(field => {
                const isSelected = selectedFields.includes(field);
                return (
                  <button
                    key={field}
                    onClick={() => handleAddField(field)}
                    disabled={isSelected}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                      isSelected 
                        ? 'bg-background border-outline text-on-surface-variant cursor-not-allowed' 
                        : 'bg-surface-high hover:bg-slate-750 border-slate-750 text-on-surface hover:text-white'
                    }`}
                  >
                    + {field}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Center/Right Column: Interactive Drop builder & Export Settings */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Builder Drop Zone */}
          <div className="bg-surface/30 border border-outline p-6 rounded-3xl space-y-6">
            <div>
              <h3 className="font-bold text-lg text-on-surface">Interactive Report Columns</h3>
              <p className="text-xs text-muted mt-0.5">Define and organize columns in your export spreadsheet.</p>
            </div>

            <div className="border border-dashed border-outline bg-background/40 rounded-2xl p-6 min-h-[140px] flex flex-wrap gap-3 items-center justify-center">
              {selectedFields.length === 0 ? (
                <span className="text-on-surface-variant text-xs font-semibold">Click available fields on the left to start compiling reports...</span>
              ) : (
                selectedFields.map(field => (
                  <div 
                    key={field}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-outline text-xs font-bold text-on-surface flex items-center gap-2 group animate-slide-up"
                  >
                    <span>{field}</span>
                    <button
                      onClick={() => handleRemoveField(field)}
                      className="p-0.5 rounded hover:bg-surface-high text-muted hover:text-on-surface transition"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Export Configurations & Scheduled automations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Direct Export settings */}
            <div className="bg-surface/30 border border-outline p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <Download size={16} className="text-indigo-400" />
                Export Format
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {['csv', 'pdf', 'json'].map(format => (
                  <button
                    key={format}
                    onClick={() => setExportFormat(format)}
                    className={`py-2 rounded-xl text-xs font-black uppercase transition border ${
                      exportFormat === format 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-background border-outline text-muted hover:text-on-surface'
                    }`}
                  >
                    .{format}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={generating || selectedFields.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 mt-6"
              >
                {generating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <><Play size={12} /> Compile & Export</>
                )}
              </button>
            </div>

            {/* Scheduled dispatches */}
            <div className="bg-surface/30 border border-outline p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                  <Calendar size={16} className="text-violet-400" />
                  Scheduled Dispatches
                </h3>
                <input
                  type="checkbox"
                  checked={scheduleActive}
                  onChange={(e) => setScheduleActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                />
              </div>

              {scheduleActive ? (
                <div className="space-y-4 animate-slide-up">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted">Frequency</label>
                    <select
                      value={scheduleFrequency}
                      onChange={(e) => setScheduleFrequency(e.target.value)}
                      className="w-full bg-background border border-outline px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1"
                    >
                      <option value="daily">Daily dispatches</option>
                      <option value="weekly">Weekly summary</option>
                      <option value="monthly">Monthly audit sheet</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted">Recipient Email</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="email"
                        placeholder="board@mycompany.com"
                        value={scheduleEmail}
                        onChange={(e) => setScheduleEmail(e.target.value)}
                        className="flex-1 bg-background border border-outline px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted leading-relaxed py-4">
                  Turn on automatic reports to dispatch compiled spreadsheets straight to administrative boards or stakeholder email lists.
                </p>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
