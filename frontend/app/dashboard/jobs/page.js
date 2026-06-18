'use client';

import { useEffect, useState } from 'react';
import { request } from '../../../services/api';
import { 
  Plus, 
  Briefcase, 
  MapPin, 
  Globe, 
  Copy, 
  Check, 
  Sliders, 
  Loader2,
  ExternalLink,
  ChevronRight,
  Eye,
  AlertCircle
} from 'lucide-react';
import WorkforceLoader from '../../../components/WorkforceLoader';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'full-time',
    skills: '',
    description: '',
    status: 'draft'
  });

  const [formError, setFormError] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await request('/jobs');
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve jobs. Server unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (slug, id) => {
    if (typeof window !== 'undefined') {
      const shareableLink = `${window.location.origin}/jobs/${slug}`;
      navigator.clipboard.writeText(shareableLink);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      const newStatus = job.status === 'published' ? 'draft' : 'published';
      const updated = await request(`/jobs/${job.id}`, {
        method: 'PUT',
        body: { status: newStatus }
      });
      setJobs(jobs.map(j => j.id === job.id ? updated : j));
    } catch (err) {
      console.error(err);
      alert('Failed to change status.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);

    try {
      const newJob = await request('/jobs', {
        method: 'POST',
        body: form
      });
      setJobs([newJob, ...jobs]);
      setShowDrawer(false);
      
      // Reset form
      setForm({
        title: '',
        department: '',
        location: '',
        employmentType: 'full-time',
        skills: '',
        description: '',
        status: 'draft'
      });
    } catch (err) {
      setFormError(err.message || 'Error occurred while creating job post.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 relative animate-fade-in">
        {/* Top Banner Header */}
        <div className="flex items-center justify-between border-b border-outline pb-6">
          <div className="space-y-2 w-1/3">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>

        {/* Requisition Horizontal Rows Skeletons */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-outline rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
              <div className="flex gap-4 items-start flex-1">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
                <div className="space-y-2.5 flex-1">
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Job Postings</h1>
          <p className="text-sm text-muted mt-1">Configure positions and publish careers page links.</p>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/15"
        >
          <Plus size={16} /> Create Role
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Jobs grid list */}
      {jobs.length === 0 ? (
        <div className="bg-surface-high/10 border border-dashed border-outline rounded-2xl py-16 text-center">
          <Briefcase className="mx-auto text-on-surface-variant mb-4" size={40} />
          <h3 className="text-lg font-semibold text-on-surface-variant">No Jobs Listed</h3>
          <p className="text-sm text-muted mt-1">Get started by creating your first job requisition card.</p>
          <button
            onClick={() => setShowDrawer(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-lg transition"
          >
            Create first job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-surface-high/40 border border-outline rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-outline/60 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-on-surface">{job.title}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    job.status === 'published' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-surface-high text-muted border border-outline'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                  <span className="flex items-center gap-1"><Sliders size={12} /> {job.department}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  <span className="flex items-center gap-1"><Globe size={12} /> {job.employmentType}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleToggleStatus(job)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-outline bg-surface-high text-on-surface-variant hover:bg-slate-700 transition"
                >
                  {job.status === 'published' ? 'Set Draft' : 'Publish'}
                </button>

                {job.status === 'published' && (
                  <>
                    <button
                      onClick={() => handleCopyLink(job.slug, job.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-high border border-outline text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition"
                    >
                      {copiedId === job.id ? (
                        <>
                          <Check size={12} className="text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy Link
                        </>
                      )}
                    </button>
                    <a
                      href={`/jobs/${job.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-outline bg-surface-high text-muted hover:text-on-surface transition"
                      title="View Careers Page"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Slide Drawer overlay */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-2xl bg-surface border-l border-outline h-screen overflow-y-auto p-8 shadow-2xl flex flex-col justify-between relative">
            {creating && (
              <div className="absolute inset-0 bg-surface/95 dark:bg-slate-900/95 flex items-center justify-center p-8 z-50 animate-fade-in">
                <WorkforceLoader mode="job-creation" />
              </div>
            )}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-outline">
                <h2 className="text-2xl font-bold text-on-surface">Create New Role</h2>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-1.5 text-muted hover:text-on-surface rounded-lg hover:bg-surface-high transition"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Job Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Senior React Developer"
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full bg-surface-high/60 border border-outline rounded-lg p-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Department</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Engineering"
                      value={form.department}
                      onChange={e => setForm({...form, department: e.target.value})}
                      className="w-full bg-surface-high/60 border border-outline rounded-lg p-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Location</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="San Francisco, CA / Remote"
                      value={form.location}
                      onChange={e => setForm({...form, location: e.target.value})}
                      className="w-full bg-surface-high/60 border border-outline rounded-lg p-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Employment Type</label>
                    <select
                      value={form.employmentType}
                      onChange={e => setForm({...form, employmentType: e.target.value})}
                      className="w-full bg-surface-high/60 border border-outline rounded-lg p-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Required Skills (Comma separated)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="React, Node.js, Tailwind CSS, PostgreSQL"
                    value={form.skills}
                    onChange={e => setForm({...form, skills: e.target.value})}
                    className="w-full bg-surface-high/60 border border-outline rounded-lg p-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Description & Requirements</label>
                  <textarea 
                    rows={6}
                    required 
                    placeholder="Outline the responsibilities, required skills, and expectations for this role..."
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    className="w-full bg-surface-high/60 border border-outline rounded-lg p-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Initial Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                      <input 
                        type="radio" 
                        name="status"
                        checked={form.status === 'draft'}
                        onChange={() => setForm({...form, status: 'draft'})}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Draft
                    </label>
                    <label className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                      <input 
                        type="radio" 
                        name="status"
                        checked={form.status === 'published'}
                        onChange={() => setForm({...form, status: 'published'})}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Published
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-outline flex gap-3">
              <button
                onClick={() => setShowDrawer(false)}
                className="w-1/2 py-2.5 bg-surface-high hover:bg-slate-700 rounded-xl text-on-surface-variant font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating}
                className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-sm transition disabled:opacity-55 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create Posting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
