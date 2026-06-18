'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  KeyRound, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ActivateAccountPage({ searchParams }) {
  const router = useRouter();
  
  // Unwrap searchParams using React.use()
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const token = resolvedSearchParams?.token;

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [inviteData, setInviteData] = useState(null);

  // Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password requirement check states
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(requirements).every(Boolean);
  const passwordsMatch = password && password === confirmPassword;

  // Validate the invitation token on mount
  useEffect(() => {
    if (!token) {
      setError('Invitation token is missing from the link.');
      setValidating(false);
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/auth/validate-invite?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to validate invitation.');
        }

        setInviteData(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'This invitation is invalid, expired, or has already been used.');
      } finally {
        setValidating(false);
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Password does not meet all safety requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/auth/activate-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to activate account.');
      }

      // Save token in localStorage
      localStorage.setItem('hireflow_token', data.token);
      localStorage.setItem('hireflow_user', JSON.stringify(data.user));

      setSuccess(true);
      
      // Redirect to employee portal after 2 seconds
      setTimeout(() => {
        router.push('/employee/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during account activation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || validating) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
          <p className="text-muted text-sm font-medium">Validating invitation link...</p>
        </div>
      </div>
    );
  }

  // Error/Expired invitation screen
  if (error && !inviteData) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-455 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <XCircle size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Invitation Expired</h2>
          <p className="mt-3 text-sm text-muted leading-relaxed max-w-sm mx-auto">
            {error}
          </p>
          
          <div className="mt-8 flex flex-col gap-3 max-w-xs mx-auto">
            <Link 
              href="/invitation-expired"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/10"
            >
              Request New Invitation <ArrowRight size={16} />
            </Link>
            <Link 
              href="/login" 
              className="text-xs font-semibold text-muted text-muted hover:text-on-surface transition"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Premium backdrop glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
            H
          </div>
          <span className="text-2xl font-bold tracking-tight text-on-surface">
            HireFlow<span className="text-indigo-400">.AI</span>
          </span>
        </div>
        
        {success ? (
          <div className="bg-surface border border-emerald-500/20 p-8 rounded-3xl shadow-2xl space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-extrabold text-on-surface">Account Activated!</h2>
            <p className="text-sm text-muted">
              Welcome aboard, <strong>{inviteData?.employee?.name}</strong>. Your account has been successfully set up. Redirecting you to your employee portal...
            </p>
            <Loader2 className="animate-spin text-emerald-450 text-emerald-400 mx-auto mt-4" size={20} />
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Activate Your Account</h2>
            <p className="mt-2 text-sm text-muted">
              Hello <span className="text-on-surface font-bold">{inviteData?.employee?.name}</span>. Set your password to activate your portal profile.
            </p>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-surface/40 border border-outline/80 shadow-2xl rounded-3xl py-8 px-4 sm:px-10 backdrop-blur-md">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 text-left">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Password input */}
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider text-left">
                      Create Password
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-background border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-muted hover:text-on-surface-variant"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password input */}
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider text-left">
                      Confirm Password
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-background border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-muted hover:text-on-surface-variant"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Password requirements checker */}
                  <div className="bg-background/40 border border-outline rounded-2xl p-4 text-left space-y-2">
                    <span className="text-[10px] font-bold text-muted uppercase block mb-1">Password Security Checklist</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        {requirements.length ? (
                          <CheckCircle2 size={14} className="text-emerald-450 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-outline shrink-0" />
                        )}
                        <span className={requirements.length ? 'text-muted' : 'text-muted'}>Min 8 characters</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        {requirements.uppercase ? (
                          <CheckCircle2 size={14} className="text-emerald-450 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-outline shrink-0" />
                        )}
                        <span className={requirements.uppercase ? 'text-muted' : 'text-muted'}>Uppercase letter</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        {requirements.lowercase ? (
                          <CheckCircle2 size={14} className="text-emerald-450 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-outline shrink-0" />
                        )}
                        <span className={requirements.lowercase ? 'text-muted' : 'text-muted'}>Lowercase letter</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        {requirements.number ? (
                          <CheckCircle2 size={14} className="text-emerald-450 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-outline shrink-0" />
                        )}
                        <span className={requirements.number ? 'text-muted' : 'text-muted'}>One number</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs sm:col-span-2">
                        {requirements.special ? (
                          <CheckCircle2 size={14} className="text-emerald-450 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-outline shrink-0" />
                        )}
                        <span className={requirements.special ? 'text-muted' : 'text-muted'}>Special character (!@#$...)</span>
                      </div>
                    </div>

                    {password && confirmPassword && (
                      <div className="border-t border-outline pt-2 flex items-center gap-1.5 text-xs">
                        {passwordsMatch ? (
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle size={14} className="text-rose-400 shrink-0" />
                        )}
                        <span className={passwordsMatch ? 'text-muted font-semibold' : 'text-rose-455 text-rose-400'}>
                          {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={submitting || !isPasswordValid || !passwordsMatch}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 disabled:bg-surface-high disabled:text-muted disabled:shadow-none"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Activating Profile...
                        </>
                      ) : (
                        <>
                          Activate Account <ShieldCheck size={16} />
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
