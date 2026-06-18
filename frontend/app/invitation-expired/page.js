'use client';

import { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Mail, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

export default function InvitationExpiredPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError('');

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/auth/request-new-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request new invitation.');
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'We could not find an onboarding profile with this email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background radial highlights */}
      <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 -translate-y-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/30">
            T
          </div>
          <span className="text-2xl font-bold tracking-tight text-on-surface font-display">
            TalentOS<span className="text-secondary">.Portal</span>
          </span>
        </Link>

        {success ? (
          <div className="bg-surface border border-outline p-8 rounded-3xl shadow-sm max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-extrabold text-on-surface font-display">New Invite Sent</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              If an account matches <strong>{email}</strong>, we have generated a new invitation token and dispatched a welcome email.
            </p>
            <div className="pt-4">
              <Link 
                href="/login" 
                className="text-xs font-bold text-primary hover:underline transition"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-display">Request New Invitation</h2>
            <p className="mt-2 text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              If your link has expired, entered incorrectly, or already been used, submit your email address below to receive a new one.
            </p>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="glass-card py-8 px-4 sm:px-10 shadow-sm rounded-3xl border border-outline bg-surface">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-50 border border-red-250 text-error p-3 rounded-xl text-xs font-medium flex items-center gap-2 text-left">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-left">
                      Email Address
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="employee@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-modern pl-10 text-xs"
                      />
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-muted" />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading || !email}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Generating Link...
                        </>
                      ) : (
                        <>
                          Request Invite Link <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
