'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FloatingContactButton from '../../components/FloatingContactButton';
import { 
  Mail, Clock, Globe, Send, CheckCircle, AlertCircle, 
  Sparkles, MessageSquare, Shield, HelpCircle, ArrowRight
} from 'lucide-react';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    category: 'General Inquiry',
    subject: '',
    message: '',
    attachment: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!formData.name || !formData.company || !formData.email || !formData.subject || !formData.message) {
      const errMsg = 'Please complete all required fields (*).';
      setError(errMsg);
      showToast('error', errMsg);
      return;
    }

    if (!validateEmail(formData.email)) {
      const errMsg = 'Please enter a valid email address.';
      setError(errMsg);
      showToast('error', errMsg);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit contact inquiry.');
      }

      setSuccess(true);
      showToast('success', 'Your inquiry has been sent successfully! We have emailed you a confirmation.');
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        category: 'General Inquiry',
        subject: '',
        message: '',
        attachment: ''
      });
    } catch (err) {
      const errText = err.message || 'An error occurred while sending your message.';
      setError(errText);
      showToast('error', errText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-high dark:bg-background text-on-surface dark:text-on-surface flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-slide-up max-w-sm">
          <div className={`p-4 rounded-xl border shadow-xl flex items-center gap-3 ${
            toast.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-semibold">{toast.text}</span>
          </div>
        </div>
      )}

      <main className="flex-1 pt-20">
        
        {/* 1. HERO SECTION */}
        <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/40 text-xs font-semibold text-[#0047FF] dark:text-blue-400">
              <Sparkles size={13} />
              <span>Dedicated Customer Support</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface dark:text-on-surface font-display">
              We&rsquo;d Love to Hear From You
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant dark:text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
              Have a question, feature request, partnership inquiry, or need technical support? Our engineering and support teams are here to help.
            </p>
          </div>
        </section>

        {/* 2. CONTACT INFO CARDS & FORM SECTION */}
        <section className="py-16 bg-surface dark:bg-surface border-y border-outline dark:border-outline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              
              {/* LEFT: CONTACT INFORMATION CARDS */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* General Contact Card */}
                <div className="p-6 rounded-2xl bg-surface-high dark:bg-background border border-outline dark:border-outline space-y-3 hover:border-[#0047FF]/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#0047FF] flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <h3 className="text-base font-bold text-on-surface dark:text-on-surface">
                    General Contact & Inquiries
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                    For all general product inquiries, sales questions, or partnership opportunities.
                  </p>
                  <a
                    href="mailto:talentosai.contact@gmail.com"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0047FF] hover:underline pt-1"
                  >
                    <span>talentosai.contact@gmail.com</span>
                    <ArrowRight size={14} />
                  </a>
                </div>

                {/* Support & Bug Reports Card */}
                <div className="p-6 rounded-2xl bg-surface-high dark:bg-background border border-outline dark:border-outline space-y-3 hover:border-[#0047FF]/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <h3 className="text-base font-bold text-on-surface dark:text-on-surface">
                    Support, Bugs & Feedback
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                    Experiencing a technical issue or have a feature idea? Our engineers monitor our inbox continuously.
                  </p>
                  <a
                    href="mailto:talentosai.contact@gmail.com"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-500 hover:underline pt-1"
                  >
                    <span>talentosai.contact@gmail.com</span>
                    <ArrowRight size={14} />
                  </a>
                </div>

                {/* Business Hours Card */}
                <div className="p-6 rounded-2xl bg-surface-high dark:bg-background border border-outline dark:border-outline space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface dark:text-on-surface">Business Hours</h4>
                      <p className="text-xs text-muted">Monday &ndash; Friday</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-outline/50 flex items-center justify-between text-xs font-semibold">
                    <span className="text-on-surface-variant">Operating Hours:</span>
                    <span className="text-on-surface dark:text-on-surface">9:00 AM &ndash; 6:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-on-surface-variant">Timezone:</span>
                    <span className="text-on-surface dark:text-on-surface flex items-center gap-1">
                      <Globe size={13} className="text-[#0047FF]" />
                      <span>UTC (Coordinated Universal Time)</span>
                    </span>
                  </div>
                </div>

                {/* Note on No Fake Addresses */}
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-[11px] text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface">100% Cloud Native Platform:</strong> TalentOS is an active-stage SaaS platform operated remotely by dedicated software engineers. All communications are streamlined via our official support portal and email desk.
                </div>

              </div>

              {/* RIGHT: CONTACT FORM */}
              <div className="lg:col-span-8">
                <div className="p-8 sm:p-10 rounded-3xl bg-surface-high dark:bg-background border border-outline dark:border-outline shadow-xl relative">
                  
                  {success ? (
                    <div className="py-16 text-center space-y-6 animate-fade-in max-w-lg mx-auto">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                        <CheckCircle size={36} />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-on-surface font-display">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-sm text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                        Thank you for reaching out, <strong>{formData.name || 'there'}</strong>! We have dispatched an alert to our engineering desk at <strong>talentosai.contact@gmail.com</strong> and emailed a confirmation copy to your inbox.
                      </p>
                      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                          onClick={() => setSuccess(false)}
                          className="px-6 py-3 bg-[#0047FF] hover:bg-[#0036C7] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20"
                        >
                          Send Another Message
                        </button>
                        <Link
                          href="/about"
                          className="px-6 py-3 bg-surface dark:bg-surface border border-outline text-on-surface dark:text-on-surface hover:bg-surface-high font-semibold rounded-xl text-sm transition-all"
                        >
                          Explore About Us
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      <div className="border-b border-outline dark:border-outline/80 pb-4">
                        <h2 className="text-xl font-bold text-on-surface dark:text-on-surface font-display">
                          Send Our Team a Message
                        </h2>
                        <p className="text-xs text-muted">
                          All fields marked with an asterisk (*) are required.
                        </p>
                      </div>

                      {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                          <AlertCircle size={16} />
                          <span>{error}</span>
                        </div>
                      )}

                      {/* Row 1: Name and Company */}
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Alex Morgan"
                            className="w-full px-4 py-3 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                            Company Name *
                          </label>
                          <input
                            type="text"
                            name="company"
                            required
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Acme Corporation"
                            className="w-full px-4 py-3 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 2: Email and Phone */}
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="alex@acme.com"
                            className="w-full px-4 py-3 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                            Phone Number <span className="text-muted font-normal">(Optional)</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-4 py-3 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 3: Category and Subject */}
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                            Category *
                          </label>
                          <select
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40 transition-all"
                          >
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Sales">Sales</option>
                            <option value="Technical Support">Technical Support</option>
                            <option value="Bug Report">Bug Report</option>
                            <option value="Feature Request">Feature Request</option>
                            <option value="Feedback">Feedback</option>
                            <option value="Partnership">Partnership</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                            Subject *
                          </label>
                          <input
                            type="text"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="e.g. Question about Enterprise pricing"
                            className="w-full px-4 py-3 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 4: Message */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                          Message *
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your organization's hiring goals or technical questions..."
                          className="w-full px-4 py-3 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40 transition-all resize-none"
                        />
                      </div>

                      {/* Row 5: Attachment URL (Optional) */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                          Attachment URL <span className="text-muted font-normal">(Optional screenshot or document link)</span>
                        </label>
                        <input
                          type="url"
                          name="attachment"
                          value={formData.attachment}
                          onChange={handleChange}
                          placeholder="https://drive.google.com/..."
                          className="w-full px-4 py-3 bg-surface dark:bg-surface border border-outline dark:border-outline rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40 transition-all"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2 flex items-center justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full sm:w-auto px-8 py-4 bg-[#0047FF] hover:bg-[#0036C7] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Sending Inquiry...</span>
                            </span>
                          ) : (
                            <>
                              <Send size={16} />
                              <span>Send Message</span>
                            </>
                          )}
                        </button>
                      </div>

                    </form>
                  )}

                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
      <FloatingContactButton />
    </div>
  );
}
