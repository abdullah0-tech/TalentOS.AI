'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { Bot, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      const user = data.user;

      if (user.mustChangePassword) {
        router.push('/change-password');
      } else if (user.role === 'employee') {
        router.push('/employee/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/30">
            H
          </div>
          <span className="text-2xl font-bold tracking-tight text-on-surface font-display">
            HireFlow<span className="text-primary">.AI</span>
          </span>
        </Link>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-display">Sign in to workspace</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Or{' '}
          <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition font-mono text-xs uppercase tracking-wider">
            create a new company workspace
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-outline/30">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface font-mono uppercase tracking-wider text-xs">
                Email Address
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface font-mono uppercase tracking-wider text-xs">
                Password
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary !py-2.5 !px-4 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
