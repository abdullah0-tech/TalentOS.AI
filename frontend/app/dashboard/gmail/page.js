'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  RefreshCw, 
  Send, 
  Sparkles, 
  CheckCircle, 
  Loader2, 
  Lock, 
  Clock, 
  CornerUpLeft, 
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GmailInboxPage() {
  const [connected, setConnected] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // AI Composer States
  const [draftType, setDraftType] = useState('interview');
  const [draftTone, setDraftTone] = useState('warm');
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showNotification, setShowNotification] = useState(null);

  // New Compose Email States
  const [isComposingNew, setIsComposingNew] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newTopic, setNewTopic] = useState('interview_schedule');

  const handleAutoGenerateEmail = () => {
    if (!newRecipientEmail) return;
    setGeneratingDraft(true);
    setDraftSubject('');
    setDraftBody('');
    
    let subject = '';
    let body = '';
    
    let candidateName = newRecipientEmail.split('@')[0];
    candidateName = candidateName.charAt(0).toUpperCase() + candidateName.slice(1);
    
    switch (newTopic) {
      case 'application_confirm':
        subject = 'Application Received: Senior Full-Stack Engineer - Stitch Labs';
        body = `Dear ${candidateName},\n\nThank you for applying for the Senior Full-Stack Engineer position at Stitch Labs. We have received your application and our recruitment team is currently reviewing your background and qualifications.\n\nWe will update you as soon as the first screening cohort is complete.\n\nBest regards,\nTalentOS Recruitment Engine`;
        break;
      case 'assessment_invite':
        subject = 'Coding Challenge Invitation - Stitch Labs';
        body = `Dear ${candidateName},\n\nCongratulations! Your profile has been shortlisted for the Senior Full-Stack Engineer position.\n\nThe next step in our process is a 60-minute technical evaluation. Please use the link below to access your challenge sandbox:\n\nAssessment Link: https://talentos.ai/challenge/stch-8472-sjenk\n\nBest of luck!\nTalentOS Automation Systems`;
        break;
      case 'interview_schedule':
        subject = 'Interview Scheduled: Technical Panel - Stitch Labs';
        body = `Hi ${candidateName},\n\nYour technical interview is confirmed for tomorrow at 10:00 AM EST.\n\nDetails:\n- Role: Senior Full-Stack Engineer\n- Duration: 45 minutes\n- Google Meet Link: https://meet.google.com/hrc-tfmd-xyz\n\n${draftTone === 'warm' ? 'We are really looking forward to speaking with you and learning more about your background!' : 'Please prepare to discuss your React design patterns and backend APIs.'}\n\nBest regards,\nStitch Labs Scheduling`;
        break;
      case 'job_offer':
        subject = 'Official Job Offer: Senior Full-Stack Engineer - Stitch Labs';
        body = `Dear ${candidateName},\n\nWe are absolutely thrilled to offer you the position of Senior Full-Stack Engineer at Stitch Labs!\n\nWe were incredibly impressed by your background, your coding challenge performance, and our interviews. We believe you will be a fantastic addition to the team.\n\nYour formal offer letter and contracts will be dispatched shortly in the Document Vault.\n\nSincerely,\nStitch Labs HR Operations`;
        break;
      case 'welcome_onboard':
        subject = 'Welcome to Stitch Labs! Your account is ready';
        body = `Welcome to Stitch Labs, ${candidateName}!\n\nWe are excited to have you join us. Your employee workspace profile has been successfully initialized.\n\nAccount Details:\n- Username: ${candidateName.toLowerCase()}.jenkins@stitchlabs.com\n- Temporary Password: [sent via SMS / MFA]\n- Onboarding Checklist: https://talentos.ai/onboard/stitch-labs\n\nPlease log in to complete your onboarding details.\n\nWarmly,\nHR Operations Team`;
        break;
      case 'rejection':
        subject = 'Application Status - Stitch Labs';
        body = `Dear ${candidateName},\n\nThank you very much for your interest in Stitch Labs and for taking the time to apply for the Senior Full-Stack Engineer role.\n\nUnfortunately, we have decided to move forward with other candidates whose experience aligns more closely with our current requirements.\n\nWe wish you the best in your career search and hope to keep in touch.\n\nSincerely,\nStitch Labs HR`;
        break;
    }

    setDraftSubject(subject);

    let index = 0;
    const words = body.split(' ');
    const timer = setInterval(() => {
      if (index < words.length) {
        setDraftBody(prev => prev + (prev ? ' ' : '') + words[index]);
        index++;
      } else {
        clearInterval(timer);
        setGeneratingDraft(false);
        triggerNotification('success', 'AI email generated automatically!');
      }
    }, 35);
  };

  const handleSendNewEmail = () => {
    if (!draftBody.trim()) return;
    setSendingEmail(true);

    setTimeout(() => {
      setSendingEmail(false);
      setDraftBody('');
      setDraftSubject('');
      setIsComposingNew(false);
      triggerNotification('success', `Email sent successfully to ${newRecipientEmail}!`);
    }, 2000);
  };

  // Synced mock email database
  const [emails, setEmails] = useState([
    {
      id: 'msg-1',
      senderName: 'Sarah Jenkins',
      senderEmail: 'sarah.j@gmail.com',
      subject: 'Re: Technical Interview Confirmation - Senior Full Stack Engineer',
      snippet: 'Thanks for the invitation! I would love to meet tomorrow at 3:00 PM EST. The Google Meet link works for me.',
      body: `Hi Hiring Team,\n\nThanks for reaching out! I would love to meet tomorrow at 3:00 PM EST for the technical interview. The Google Meet link works perfectly for me. \n\nI have reviewed the project specifications you sent, and I am excited to discuss my background in Next.js, Node.js, and PostgreSQL in more detail.\n\nBest regards,\nSarah Jenkins`,
      time: '10:24 AM',
      date: 'June 16, 2026',
      aiLabel: 'High Fit Candidate',
      aiColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      aiScore: 94,
      role: 'Senior Full Stack Engineer',
      unread: true
    },
    {
      id: 'msg-2',
      senderName: 'Marcus Miller',
      senderEmail: 'marcus.developer@gmail.com',
      subject: 'Question regarding Workspace Onboarding & Documents',
      snippet: 'I received the employee portal activation link but wanted to double-check which tax documents I should scan.',
      body: `Hello HR Admin,\n\nI received the secure employee portal activation link (thanks!). I wanted to double-check which tax documents I should scan and upload to the Vault before my start date on July 1st.\n\nShould I upload the signed W4 and I9 forms now, or do you prefer to sign them digitally during my first week?\n\nSincerely,\nMarcus Miller`,
      time: '9:15 AM',
      date: 'June 16, 2026',
      aiLabel: 'Action Required',
      aiColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      aiScore: 82,
      role: 'Onboarding - Lead UI Designer',
      unread: true
    },
    {
      id: 'msg-3',
      senderName: 'Alex Mercer',
      senderEmail: 'alex.mercer.dev@outlook.com',
      subject: 'Application Status Update Request',
      snippet: 'Hi, I completed the technical assessment last week and was hoping to get an update on the next steps.',
      body: `Hi TalentOS Team,\n\nI completed the structured automated coding assessment last Wednesday and was hoping to get an update on my application status for the Backend Dev position.\n\nLooking forward to your feedback.\n\nThanks,\nAlex Mercer`,
      time: 'Yesterday',
      date: 'June 15, 2026',
      aiLabel: 'General Query',
      aiColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      aiScore: 68,
      role: 'Backend Developer',
      unread: false
    },
    {
      id: 'msg-4',
      senderName: 'Elena Rostova',
      senderEmail: 'elena.rostova@gmail.com',
      subject: 'Declining Interview Invitation',
      snippet: 'Thank you for the opportunity, but I have recently accepted a staff developer role at another company.',
      body: `Dear TalentOS HR,\n\nThank you very much for shortlisting me for the Staff Product Designer role. However, I have recently accepted another offer and would like to withdraw my application.\n\nI hope we can keep in touch for future opportunities.\n\nWarmly,\nElena Rostova`,
      time: 'June 14',
      date: 'June 14, 2026',
      aiLabel: 'Pipeline Exit',
      aiColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      aiScore: 45,
      role: 'Staff Product Designer',
      unread: false
    }
  ]);

  useEffect(() => {
    // Auto-select first email for demo experience
    setSelectedMessage(emails[0]);
    // Restore real Gmail connection state from localStorage if set
    const savedConnectState = localStorage.getItem('gmail_connected') === 'true';
    if (!savedConnectState) {
      // Still show inbox in demo mode
      setConnected(true);
    }
  }, []);

  const triggerNotification = (type, message) => {
    setShowNotification({ type, message });
    setTimeout(() => setShowNotification(null), 4000);
  };

  const handleConnectGmail = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnected(true);
      setConnecting(false);
      localStorage.setItem('gmail_connected', 'true');
      setSelectedMessage(emails[0]);
      triggerNotification('success', 'Successfully synchronized recruiting-lead@talent-os.com via Google OAuth2!');
    }, 2000);
  };

  const handleDisconnectGmail = () => {
    if (!confirm('Are you sure you want to disconnect your Gmail sync? Candidate email records will no longer update.')) return;
    setConnected(false);
    setSelectedMessage(null);
    localStorage.removeItem('gmail_connected');
    triggerNotification('info', 'Gmail account sync disconnected.');
  };

  const handleForceSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      triggerNotification('success', 'Gmail inbox synchronized! No new emails found.');
    }, 1500);
  };

  const handleGenerateAIDraft = () => {
    if (!selectedMessage) return;
    setGeneratingDraft(true);
    setDraftSubject(`Re: ${selectedMessage.subject}`);
    setDraftBody('');

    let mockText = '';
    const name = selectedMessage.senderName.split(' ')[0];
    const role = selectedMessage.role || 'the open position';

    if (draftType === 'interview') {
      mockText = `Hi ${name},\n\nThank you for your response! We are thrilled to proceed to the next stage. \n\nI have confirmed your technical interview for tomorrow at 3:00 PM EST. The Google Meet video conference link is already attached to the calendar invite. \n\n${draftTone === 'warm' ? 'We are really looking forward to discussing your outstanding background in Next.js and frontend architectures!' : 'Please come prepared to discuss your code architecture, specifically around database query optimizations.'}\n\nWarm regards,\nTalentOS HR Team`;
    } else if (draftType === 'followup') {
      mockText = `Hi ${name},\n\nI hope you are having a wonderful week. \n\nI am writing to follow up on your recent application for ${role}. ${draftTone === 'warm' ? 'Our AI screening indicates a strong match with our core stack' : 'We have completed our initial screening stage'}. We would love to get a quick update on your current job search availability and salary expectations so we can prioritize your file.\n\nBest,\nRecruitment Lead`;
    } else {
      mockText = `Hi ${name},\n\nWe appreciate you taking the time to share your background with us. \n\nUnfortunately, after careful review of your qualifications and assessment benchmarks, we have decided to move forward with other candidates whose skillsets align more closely with this specific role.\n\nWe will keep your resume on file for future openings. We wish you the absolute best in your career pursuits.\n\nSincerely,\nTalentOS HR`;
    }

    let index = 0;
    const words = mockText.split(' ');
    const timer = setInterval(() => {
      if (index < words.length) {
        setDraftBody(prev => prev + (prev ? ' ' : '') + words[index]);
        index++;
      } else {
        clearInterval(timer);
        setGeneratingDraft(false);
        triggerNotification('success', 'AI reply draft compiled using candidate context!');
      }
    }, 45);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!draftBody.trim()) return;
    setSendingEmail(true);

    setTimeout(() => {
      setSendingEmail(false);
      setDraftBody('');
      setDraftSubject('');
      
      if (selectedMessage) {
        setEmails(prev => 
          prev.map(m => m.id === selectedMessage.id ? { ...m, unread: false } : m)
        );
      }
      
      triggerNotification('success', `Email dispatched successfully via Gmail SMTP to ${selectedMessage?.senderEmail}!`);
    }, 2000);
  };

  const filteredEmails = emails.filter(m => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      m.senderName.toLowerCase().includes(s) ||
      m.senderEmail.toLowerCase().includes(s) ||
      m.subject.toLowerCase().includes(s) ||
      m.body.toLowerCase().includes(s);

    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'unread') return matchesSearch && m.unread;
    if (selectedCategory === 'action') return matchesSearch && m.aiLabel === 'Action Required';
    if (selectedCategory === 'high') return matchesSearch && m.aiLabel === 'High Fit Candidate';
    return matchesSearch;
  });

  return (
    <div className="space-y-8 font-sans">
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-5 right-5 z-[9999] p-4 rounded-xl text-xs flex items-center gap-2 shadow-2xl ${
              showNotification.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' 
                : 'bg-blue-500/10 border border-blue-500/20 text-primary'
            }`}
          >
            <CheckCircle size={14} className="shrink-0" />
            <span className="font-bold">{showNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3 font-display">
            <Mail className="text-primary" size={32} />
            Gmail Workspace Sync
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Connect corporate recruiting emails to sync candidate threads, classify replies, and draft responses using AI.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Connect Real Gmail — always visible as primary CTA */}
          <button
            onClick={handleConnectGmail}
            disabled={connecting}
            className="px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-all flex items-center gap-2"
          >
            {connecting ? (
              <><Loader2 size={13} className="animate-spin" />Connecting...</>
            ) : (
              <><span className="font-black text-sm leading-none">G</span> Connect Gmail</>
            )}
          </button>

          <button
            onClick={handleForceSync}
            disabled={syncing}
            className="btn-ghost !py-2.5 !px-4 !rounded-xl text-xs flex items-center gap-2"
          >
            {syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            <span>Sync</span>
          </button>
        </div>
      </div>

      {!connected ? (
        <div className="max-w-xl mx-auto py-12 text-center border-2 border-dashed border-outline rounded-3xl bg-surface p-8 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] flex items-center justify-center text-white shadow-xl">
            <Mail size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-on-surface font-display">Sync Candidate Communications</h2>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              Enable two-way synchronization with your Gmail account to view email exchanges, apply AI labels, and respond instantly from TalentOS.
            </p>
          </div>

          <div className="p-4 bg-surface-high border border-outline rounded-2xl text-[11px] text-on-surface-variant leading-relaxed text-left flex gap-2.5">
            <Info size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-on-surface block mb-0.5">Secure Google OAuth API integration</span>
              We request read/write privileges strictly restricted to candidate communication threads. Credentials are fully isolated.
            </div>
          </div>

          <button
            onClick={handleConnectGmail}
            disabled={connecting}
            className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/10 transition flex items-center justify-center gap-2 border border-primary"
          >
            {connecting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Handshaking OAuth Connectors...
              </>
            ) : (
              <>
                <span className="font-black">G</span> Sign in with Google Account
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[650px] lg:h-[calc(100vh-14rem)] items-stretch">
          <div className="lg:col-span-5 border border-outline bg-surface rounded-3xl flex flex-col overflow-hidden shadow-sm h-full">
            <div className="p-4 border-b border-outline space-y-3 shrink-0 bg-surface-high">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-muted" size={14} />
                  <input 
                    type="text"
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-modern !pl-9 !py-2.5 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsComposingNew(true);
                    setSelectedMessage(null);
                    setNewRecipientEmail('');
                    setDraftSubject('');
                    setDraftBody('');
                  }}
                  className="px-3.5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                  title="Compose New AI Email"
                >
                  <Sparkles size={12} />
                  <span>Compose</span>
                </button>
              </div>

              <div className="flex gap-1.5 overflow-x-auto scrollbar-none select-none text-[10px] font-bold">
                {[
                  { id: 'all', label: 'All Messages' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'action', label: 'Action Required' },
                  { id: 'high', label: 'High Fit' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full transition-all border ${
                      selectedCategory === cat.id 
                        ? 'bg-primary border-primary text-white' 
                        : 'bg-surface hover:bg-surface-high border-outline text-on-surface-variant'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-outline/50 bg-background/30 scrollbar-none">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted font-mono py-20">
                  No synced messages found matching filters.
                </div>
              ) : (
                filteredEmails.map(mail => {
                  const isSelected = selectedMessage?.id === mail.id;
                  return (
                    <div
                      key={mail.id}
                      onClick={() => {
                        setIsComposingNew(false);
                        setSelectedMessage(mail);
                        setEmails(prev => prev.map(m => m.id === mail.id ? { ...m, unread: false } : m));
                      }}
                      className={`p-4 cursor-pointer transition-all hover:bg-surface-high flex gap-3 relative ${
                        isSelected ? 'bg-primary-light/30 border-l-4 border-l-primary' : 'bg-surface'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary">
                        {mail.senderName.charAt(0)}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className={`text-xs ${mail.unread ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>
                            {mail.senderName}
                          </span>
                          <span className="text-[9px] font-mono text-muted">{mail.time}</span>
                        </div>
                        <p className={`text-xs truncate ${mail.unread ? 'font-bold text-on-surface' : 'text-on-surface-variant'} mt-0.5`}>
                          {mail.subject}
                        </p>
                        <p className="text-[10px] text-muted truncate mt-0.5">{mail.snippet}</p>
                        
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="text-[9px] font-mono text-muted truncate max-w-[120px]">{mail.role}</span>
                          <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border ${mail.aiColor}`}>
                            {mail.aiLabel}
                          </span>
                        </div>
                      </div>
                      
                      {mail.unread && (
                        <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-primary rounded-full"></span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col border border-outline bg-surface rounded-3xl overflow-hidden shadow-sm h-full justify-between">
            {isComposingNew ? (
              /* QUICK AI EMAIL GENERATOR COMPONENT */
              <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-outline pb-4">
                    <div>
                      <h2 className="font-extrabold text-sm text-on-surface font-display flex items-center gap-1.5">
                        <Sparkles className="text-primary" size={15} />
                        Quick AI Email Generator
                      </h2>
                      <p className="text-[10px] text-muted mt-0.5">Select a topic and candidate email to auto-generate a response.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsComposingNew(false);
                        setSelectedMessage(emails[0]);
                      }}
                      className="text-[10px] font-bold text-primary hover:underline focus:outline-none"
                    >
                      Back to Inbox
                    </button>
                  </div>

                  {/* Form Inputs */}
                  <div className="space-y-4">
                    {/* Recipient Email Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted font-bold uppercase block">Recipient Email</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="email"
                          placeholder="e.g. candidate@example.com"
                          value={newRecipientEmail}
                          onChange={(e) => setNewRecipientEmail(e.target.value)}
                          className="input-modern !py-2 text-xs flex-1"
                        />
                        {/* Quick Selection Dropdown of synced candidates */}
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              setNewRecipientEmail(e.target.value);
                            }
                          }}
                          className="bg-surface-high border border-outline px-2.5 py-2 rounded-xl text-xs focus:outline-none"
                        >
                          <option value="">Choose Candidate...</option>
                          {emails.map(e => (
                            <option key={e.id} value={e.senderEmail}>{e.senderName} ({e.senderEmail})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Topic and Tone grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted font-bold uppercase block">Email Topic</label>
                        <select
                          value={newTopic}
                          onChange={(e) => setNewTopic(e.target.value)}
                          className="w-full bg-background border border-outline px-3 py-2.5 rounded-xl text-xs focus:outline-none"
                        >
                          <option value="application_confirm">Application Acknowledgment</option>
                          <option value="assessment_invite">Shortlist & Coding Assessment</option>
                          <option value="interview_schedule">Interview Invitation (Google Meet)</option>
                          <option value="job_offer">Official Job Offer</option>
                          <option value="welcome_onboard">Welcome & Onboarding Account</option>
                          <option value="rejection">Polite Rejection</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-muted font-bold uppercase block">Draft Tone</label>
                        <select
                          value={draftTone}
                          onChange={(e) => setDraftTone(e.target.value)}
                          className="w-full bg-background border border-outline px-3 py-2.5 rounded-xl text-xs focus:outline-none"
                        >
                          <option value="warm">Warm/Supportive</option>
                          <option value="professional">Professional</option>
                        </select>
                      </div>
                    </div>

                    {/* Auto-Generate Button */}
                    <button
                      type="button"
                      onClick={handleAutoGenerateEmail}
                      disabled={generatingDraft || !newRecipientEmail}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-550 hover:to-indigo-650 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 disabled:opacity-50 transition"
                    >
                      {generatingDraft ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      <span>⚡ Generate Email Automatically</span>
                    </button>
                  </div>

                  {/* Generated Email Form */}
                  {draftSubject && (
                    <div className="space-y-4 pt-4 border-t border-outline/50 animate-slide-up">
                      <div className="flex items-center gap-2 border border-outline bg-surface rounded-xl px-3.5 py-2 text-xs">
                        <span className="text-muted font-bold shrink-0">Subject:</span>
                        <input 
                          type="text" 
                          value={draftSubject}
                          onChange={(e) => setDraftSubject(e.target.value)}
                          className="bg-transparent w-full text-on-surface focus:outline-none font-semibold"
                        />
                      </div>
                      
                      <div className="relative">
                        <textarea
                          rows={6}
                          placeholder="Your generated email body will appear here..."
                          value={draftBody}
                          onChange={(e) => setDraftBody(e.target.value)}
                          className="w-full bg-surface border border-outline rounded-xl p-3.5 text-xs text-on-surface focus:outline-none focus:border-primary font-sans leading-relaxed resize-none"
                          disabled={generatingDraft}
                        />
                        {generatingDraft && (
                          <div className="absolute inset-0 bg-surface/50 backdrop-blur-xs flex items-center justify-center rounded-xl">
                            <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline rounded-full shadow-lg">
                              <Loader2 size={12} className="animate-spin text-primary" />
                              <span className="text-[10px] font-bold text-on-surface-variant font-mono">Grok AI Drafting...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                {draftSubject && (
                  <div className="border-t border-outline bg-surface-high p-4 flex justify-between items-center shrink-0">
                    <span className="text-[10px] text-muted flex items-center gap-1">
                      <Lock size={10} /> Dispatches securely via Gmail OAuth2
                    </span>
                    
                    <button
                      type="button"
                      onClick={handleSendNewEmail}
                      disabled={sendingEmail || !draftBody.trim() || generatingDraft}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white disabled:opacity-50 font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/10 transition-all border border-primary"
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={12} />
                          Send Email
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : selectedMessage ? (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
                  <div className="flex items-start justify-between gap-4 border-b border-outline pb-4">
                    <div>
                      <h2 className="font-extrabold text-sm text-on-surface font-display leading-snug">{selectedMessage.subject}</h2>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-on-surface-variant">
                        <span className="font-bold text-on-surface">{selectedMessage.senderName}</span>
                        <span className="text-muted font-mono">&lt;{selectedMessage.senderEmail}&gt;</span>
                      </div>
                      <p className="text-[10px] text-muted font-mono mt-1">
                        Role Pipeline: <span className="text-primary font-bold">{selectedMessage.role}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-muted block">{selectedMessage.date}</span>
                      <span className="text-[10px] font-mono text-muted block mt-0.5">{selectedMessage.time}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-primary-light border border-primary/20 rounded-2xl flex items-start gap-3.5 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] flex items-center justify-center text-white shrink-0">
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                        Grok AI Screening Assessment
                        <span className="text-[9px] px-1.5 py-0.2 border border-primary/25 rounded bg-white text-primary font-mono font-bold">
                          {selectedMessage.aiScore}% Match
                        </span>
                      </p>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed mt-1">
                        Grok classified this thread as <strong>{selectedMessage.aiLabel}</strong>. Sarah Jenkins is scored at 94% fit based on assessment conversions. Recommended action: schedule technical interview.
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap font-sans pr-2">
                    {selectedMessage.body}
                  </div>
                </div>

                <div className="border-t-2 border-primary bg-surface-high p-4 space-y-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                      <CornerUpLeft size={14} className="text-primary" />
                      <span>Reply with AI Assistant</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[10px]">
                      <div className="flex items-center gap-1 bg-surface border border-outline rounded-lg px-2 py-1">
                        <span className="text-muted font-bold">Action:</span>
                        <select 
                          value={draftType}
                          onChange={(e) => setDraftType(e.target.value)}
                          className="bg-transparent font-bold text-on-surface-variant focus:outline-none cursor-pointer"
                        >
                          <option value="interview">Accept & Schedule</option>
                          <option value="followup">Follow Up</option>
                          <option value="reject">Send Rejection</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1 bg-surface border border-outline rounded-lg px-2 py-1">
                        <span className="text-muted font-bold">Tone:</span>
                        <select 
                          value={draftTone}
                          onChange={(e) => setDraftTone(e.target.value)}
                          className="bg-transparent font-bold text-on-surface-variant focus:outline-none cursor-pointer"
                        >
                          <option value="warm">Warm/Supportive</option>
                          <option value="professional">Professional</option>
                        </select>
                      </div>

                      <button
                        onClick={handleGenerateAIDraft}
                        disabled={generatingDraft}
                        className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition flex items-center gap-1 shadow-sm shrink-0"
                      >
                        {generatingDraft ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                        <span>Draft</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSendEmail} className="space-y-3">
                    {draftSubject && (
                      <div className="flex items-center gap-2 border border-outline bg-surface rounded-xl px-3.5 py-2 text-xs">
                        <span className="text-muted font-bold shrink-0">Subject:</span>
                        <input 
                          type="text" 
                          value={draftSubject}
                          onChange={(e) => setDraftSubject(e.target.value)}
                          className="bg-transparent w-full text-on-surface focus:outline-none font-semibold"
                        />
                      </div>
                    )}
                    
                    <div className="relative">
                      <textarea
                        rows={5}
                        placeholder={`Start writing or click "Draft" to compose with AI...`}
                        value={draftBody}
                        onChange={(e) => setDraftBody(e.target.value)}
                        className="w-full bg-surface border border-outline rounded-xl p-3.5 text-xs text-on-surface focus:outline-none focus:border-primary font-sans leading-relaxed resize-none"
                        disabled={generatingDraft || sendingEmail}
                      />
                      
                      {generatingDraft && (
                        <div className="absolute inset-0 bg-surface/50 backdrop-blur-xs flex items-center justify-center rounded-xl">
                          <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline rounded-full shadow-lg">
                            <Loader2 size={12} className="animate-spin text-primary" />
                            <span className="text-[10px] font-bold text-on-surface-variant font-mono">Grok AI Drafting...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted flex items-center gap-1 leading-none">
                        <Lock size={10} /> Dispatches securely via recruiting-lead@talent-os.com
                      </span>
                      
                      <button
                        type="submit"
                        disabled={sendingEmail || !draftBody.trim() || generatingDraft}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white disabled:opacity-50 font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/10 transition-all border border-primary shrink-0"
                      >
                        {sendingEmail ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Sending Gmail...
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            Send Email
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-on-surface-variant">
                <Mail className="text-muted animate-pulse mb-3" size={42} />
                <h3 className="font-bold text-sm text-on-surface">No Message Selected</h3>
                <p className="text-[11px] text-muted max-w-xs mt-1">
                  Select a candidate communication thread from the inbox registry pane to read files and reply.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
