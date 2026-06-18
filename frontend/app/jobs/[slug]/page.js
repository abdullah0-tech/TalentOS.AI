'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { request } from '../../../services/api';
import { 
  MapPin, 
  Briefcase, 
  Globe, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import WorkforceLoader from '../../../components/WorkforceLoader';

export default function JobPublicDetails() {
  const params = useParams();
  const slug = params.slug;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  // Form State
  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchJobDetails();
    }
  }, [slug]);

  const fetchJobDetails = async () => {
    try {
      const data = await request(`/jobs/${slug}`);
      setJob(data);
    } catch (err) {
      console.error(err);
      setError('The job posting could not be found or has been archived.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('File is too large. Max size is 5MB.');
        return;
      }
      setResumeFile(file);
      setFormError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!resumeFile) {
      setFormError('Please upload your resume (PDF/TXT/DOCX).');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('jobId', job.id);
    formData.append('candidateName', candidateName);
    formData.append('email', email);
    formData.append('resume', resumeFile);
    
    if (linkedinUrl) formData.append('linkedinUrl', linkedinUrl);
    if (portfolioUrl) formData.append('portfolioUrl', portfolioUrl);

    try {
      await request('/applications', {
        method: 'POST',
        body: formData
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'An error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <WorkforceLoader mode="global" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-4 bg-surface border border-outline rounded-2xl p-8 shadow-sm">
          <AlertCircle className="text-error mx-auto animate-pulse" size={48} />
          <h2 className="text-xl font-bold text-on-surface">Requisition Inactive</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">{error || 'This job opening is no longer accepting responses.'}</p>
          <a href="/" className="inline-block text-xs font-semibold text-primary underline">Return Home</a>
        </div>
      </div>
    );
  }

  const skillsList = job.skills 
    ? (job.skills.startsWith('[') ? JSON.parse(job.skills) : job.skills.split(',').map(s => s.trim())) 
    : [];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Careers Page Header */}
      <header className="navbar-premium sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-extrabold text-white text-sm shadow-sm">
              {job.company?.name ? job.company.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <span className="text-base font-bold tracking-tight text-on-surface font-display">{job.company?.name || 'Company Portal'}</span>
          </div>
          <span className="text-[10px] text-primary font-bold tracking-wider uppercase bg-primary-light border border-primary/20 px-3 py-1 rounded-full">
            Careers Portal
          </span>
        </div>
      </header>

      {/* Main Layout grid */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: Job Description details */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-display">{job.title}</h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-surface-variant font-medium">
              <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-primary" /> {job.department}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {job.location}</span>
              <span className="flex items-center gap-1.5"><Globe size={14} className="text-primary" /> {job.employmentType}</span>
            </div>
          </div>

          <hr className="border-outline" />

          {/* Description Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-on-surface font-display">About the position</h2>
            <div className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-line font-sans">
              {job.description}
            </div>
          </div>

          {/* Required Skills Section */}
          {skillsList.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface font-display">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => (
                  <span 
                    key={index}
                    className="text-xs font-semibold px-3 py-1 bg-primary-light text-primary border border-primary/15 rounded-lg font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Form upload interface */}
        <div className="md:col-span-1">
          <div className="glass-card p-6 rounded-2xl sticky top-24 shadow-sm bg-surface relative">
            {submitting && (
              <div className="absolute inset-0 bg-surface/95 dark:bg-slate-900/95 rounded-2xl flex items-center justify-center p-6 z-50 animate-fade-in">
                <WorkforceLoader mode="resume" />
              </div>
            )}
            {submitSuccess ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="text-success mx-auto animate-bounce" size={48} />
                <h3 className="text-lg font-bold text-on-surface font-display">Application Sent!</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Thank you for applying. Our recruiting team has received your information and AI screening report.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface font-display">Apply for this role</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Please supply your details and resume below.</p>
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-error p-3 rounded-lg text-xs font-medium">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Jane Doe"
                      value={candidateName}
                      onChange={e => setCandidateName(e.target.value)}
                      className="input-modern text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="jane@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-modern text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">LinkedIn Profile URL</label>
                    <input 
                      type="url" 
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={e => setLinkedinUrl(e.target.value)}
                      className="input-modern text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Portfolio / Github URL</label>
                    <input 
                      type="url" 
                      placeholder="https://myportfolio.com"
                      value={portfolioUrl}
                      onChange={e => setPortfolioUrl(e.target.value)}
                      className="input-modern text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Resume (PDF, TXT, DOCX)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-outline border-dashed rounded-lg bg-surface-high hover:bg-surface-highest transition-all cursor-pointer relative group">
                      <input 
                        type="file" 
                        accept=".pdf,.txt,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-1 text-center pointer-events-none">
                        {resumeFile ? (
                          <>
                            <FileText className="mx-auto text-primary" size={32} />
                            <p className="text-xs font-semibold text-on-surface mt-2 truncate max-w-[150px] mx-auto">{resumeFile.name}</p>
                            <p className="text-[10px] text-muted mt-1">{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </>
                        ) : (
                          <>
                            <Upload className="mx-auto text-muted group-hover:text-on-surface-variant transition" size={24} />
                            <div className="flex text-xs text-on-surface-variant mt-2 justify-center">
                              <span className="font-bold text-primary hover:text-primary-light">Click to upload</span>
                            </div>
                            <p className="text-[10px] text-muted mt-1">PDF, TXT or DOCX up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
                  >
                    {submitting ? (
                      <>
                        <div className="spinner !w-3.5 !h-3.5 !border-[1.5px]"></div> Submitting application...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
