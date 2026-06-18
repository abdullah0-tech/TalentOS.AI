'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { Loader2, Lock, CheckCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ChangePassword() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/login');
    } else {
      setCurrentUser(user);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(currentPassword, newPassword);
      setSuccess(true);
      
      // Update local storage so routing redirects correctly
      const user = authService.getCurrentUser();
      
      setTimeout(() => {
        if (user && user.role === 'employee') {
          router.push('/employee/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner"></div>
          <p className="text-muted text-xs font-mono uppercase tracking-wider">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/30">
            T
          </div>
          <span className="text-2xl font-bold tracking-tight text-on-surface font-display">
            TalentOS<span className="text-secondary">.Portal</span>
          </span>
        </div>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-display">Security Verification</h2>
        <p className="mt-2 text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
          You are required to change your password to continue.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-4 sm:px-10 border border-outline bg-surface shadow-sm rounded-3xl">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto border border-success/15">
                <CheckCircle size={36} />
              </div>
              <h3 className="text-lg font-bold text-on-surface font-display">Password Updated!</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your password has been changed successfully. Redirecting you to the dashboard...
              </p>
              <div className="flex justify-center pt-2">
                <div className="spinner !w-5 !h-5"></div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-left">
                  Current Password (Temporary)
                </label>
                <div className="mt-1.5 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-modern pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-left">
                  New Password
                </label>
                <div className="mt-1.5 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-modern pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-left">
                  Confirm New Password
                </label>
                <div className="mt-1.5 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-modern pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex justify-center items-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Updating Password...
                    </>
                  ) : (
                    'Save New Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
