'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, X, Send, Sparkles, CheckCircle, ExternalLink } from 'lucide-react';
import { request } from '../services/api';

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError('Please fill in Name, Email, and Message');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await request('/contact', {
        method: 'POST',
        body: {
          name,
          email,
          category,
          subject: `[Quick Widget] ${category}`,
          message
        }
      });

      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err.message || 'Error submitting message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSuccess(false);
      setError('');
    }, 300);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      
      {/* Quick Contact Modal */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-surface dark:bg-background border border-outline dark:border-outline rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          
          {/* Modal Header */}
          <div className="bg-[#0047FF] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <div>
                <h4 className="text-sm font-bold">TalentOS Support</h4>
                <p className="text-[11px] text-blue-100">Quick Contact & Inquiries</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
              aria-label="Close contact widget"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4">
            {success ? (
              <div className="py-8 text-center space-y-3 animate-fade-in">
                <CheckCircle size={44} className="text-emerald-500 mx-auto" />
                <h5 className="text-base font-bold text-on-surface dark:text-on-surface">Message Received!</h5>
                <p className="text-xs text-muted max-w-[240px] mx-auto">
                  Thank you! We have notified our team at <strong className="text-on-surface">talentosai.contact@gmail.com</strong> and sent a confirmation to your email.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-3 px-4 py-2 bg-surface-high dark:bg-surface-high border border-outline rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-highest transition-colors"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                {error && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-on-surface mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 bg-surface-high dark:bg-background border border-outline dark:border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full px-3 py-2 bg-surface-high dark:bg-background border border-outline dark:border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">Inquiry Type</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-high dark:bg-background border border-outline dark:border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Sales">Sales</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">Message *</label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help your recruitment or HR team?"
                    className="w-full px-3 py-2 bg-surface-high dark:bg-background border border-outline dark:border-outline rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0047FF]/40 resize-none"
                  />
                </div>

                <div className="pt-1 flex items-center justify-between gap-2">
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-[#0047FF] transition-colors font-medium"
                  >
                    <span>Full Contact Form</span>
                    <ExternalLink size={11} />
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0047FF] hover:bg-[#0036C7] disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20"
                  >
                    {loading ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#0047FF] hover:bg-[#0036C7] text-white rounded-full shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
        aria-label="Open quick contact widget"
      >
        <div className="relative">
          {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0047FF] rounded-full animate-pulse" />
          )}
        </div>
        <span className="text-sm font-semibold tracking-tight hidden sm:inline">
          {isOpen ? 'Close' : 'Contact Us'}
        </span>
      </button>

    </div>
  );
}
