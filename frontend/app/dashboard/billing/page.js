'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  Check, 
  Loader2, 
  CreditCard, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck,
  Calendar,
  Wallet,
  Users,
  UserCheck,
  Briefcase
} from 'lucide-react';

export default function BillingPage() {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const plans = [
    {
      key: 'free',
      name: 'Free Plan',
      priceMonthly: 0,
      description: 'Ideal for small startups testing their hiring workflows.',
      features: ['1 Workspace', '1 Admin', 'Up to 5 Employees', 'Up to 20 Candidates', 'Basic Resume Management', 'Basic AI Resume Analysis', 'Community Support']
    },
    {
      key: 'professional',
      name: 'Professional Plan',
      priceMonthly: 29,
      isPopular: true,
      description: 'Perfect for growing businesses requiring complete SaaS tracking.',
      features: ['Unlimited Jobs', 'Unlimited Applications', 'Up to 100 Employees', 'Up to 1000 Candidates', 'Advanced AI Resume Analysis', 'AI HR Copilot', 'Automated Email Workflows', 'Analytics Dashboard', 'Employee Portal', 'SMTP Email Integration', 'Priority Support']
    },
    {
      key: 'enterprise',
      name: 'Enterprise Plan',
      priceMonthly: 'Custom',
      description: 'Custom setups for high-volume enterprise compliance & analytics.',
      features: ['Unlimited Everything', 'Unlimited Workspaces', 'Unlimited Employees', 'Unlimited Candidates', 'AI Copilot', 'API Access', 'Custom Branding', 'Dedicated Support', 'SSO Login', 'Advanced Analytics', 'SLA Support']
    }
  ];

  useEffect(() => {
    // Check URL for success/cancel params from Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      setSuccess('Payment successful! Your subscription has been updated.');
      // Remove query param
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (params.get('canceled')) {
      setError('Checkout was canceled. No charges were made.');
      window.history.replaceState(null, '', window.location.pathname);
    }
    
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    setError('');
    try {
      const [subData, invData, usageRes] = await Promise.all([
        request('/billing').catch(() => null),
        request('/billing/invoices').catch(() => []),
        request('/billing/usage').catch(() => null)
      ]);
      setSubscription(subData);
      setInvoices(invData);
      setUsageData(usageRes);
    } catch (err) {
      console.error('Failed to load billing data:', err);
      setError('Failed to fetch subscription status.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planKey) => {
    if (planKey === 'enterprise') {
      window.location.href = 'mailto:sales@hireflow.ai';
      return;
    }

    setActionLoading(planKey);
    setError('');
    try {
      const response = await request('/billing/checkout', {
        method: 'POST',
        body: { planKey, billingInterval: 'monthly' } // Yearly toggle can be added later
      });
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to initialize checkout.');
      setActionLoading(null);
    }
  };

  const handleManagePortal = async () => {
    setActionLoading('portal');
    try {
      const response = await request('/billing/portal', { method: 'POST' });
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      setError(err.message || 'Failed to open billing portal.');
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <p className="text-muted text-sm">Loading billing console...</p>
      </div>
    );
  }

  const activePlanName = usageData?.plan || 'free';
  const isCanceled = subscription?.cancelAtPeriodEnd;
  const statusDisplay = isCanceled ? 'Cancels at Period End' : (subscription?.status || 'Active');

  const renderProgressBar = (label, current, max, icon) => {
    const percent = Math.min((current / max) * 100, 100);
    const isWarning = percent > 80;
    return (
      <div className="bg-surface/50 border border-outline rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-on-surface font-medium">
            {icon}
            {label}
          </div>
          <span className="text-muted"><strong className="text-on-surface">{current}</strong> / {max === 9999 ? '∞' : max}</span>
        </div>
        <div className="h-2 w-full bg-background rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${isWarning ? 'bg-rose-500' : 'bg-indigo-500'}`} 
            style={{ width: `${percent}%` }} 
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
            <CreditCard className="text-indigo-400" size={32} />
            SaaS Billing & Subscriptions
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage your organizational seat counts, upgrade service tiers, and audit corporate transaction invoices.
          </p>
        </div>
        <button 
          onClick={handleManagePortal}
          disabled={actionLoading === 'portal'}
          className="bg-surface-high border border-outline hover:border-indigo-500/50 hover:bg-surface text-on-surface px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-sm"
        >
          {actionLoading === 'portal' ? <Loader2 size={16} className="animate-spin"/> : <Wallet size={16} />}
          Manage Payment Methods
        </button>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <ShieldCheck className="shrink-0 mt-0.5" size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-8 shadow-2xl">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 uppercase tracking-wider">
              Active Tier
            </span>
            <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2 capitalize">
              {activePlanName} Plan
              {activePlanName !== 'free' && <Sparkles size={18} className="text-amber-400 animate-pulse" />}
            </h2>
            <p className="text-sm text-muted max-w-xl">
              {isCanceled 
                ? "Your subscription is set to cancel at the end of the billing period." 
                : "You are currently on a recurring subscription. Your limits are enforced across the entire workspace."}
            </p>
          </div>
          <div className="bg-background/50 border border-outline rounded-2xl px-6 py-4 flex flex-col md:items-end text-sm shrink-0 backdrop-blur-sm">
            <span className="text-xs text-muted">Subscription Status</span>
            <span className={`font-bold uppercase tracking-wide mt-1 flex items-center gap-1.5 ${isCanceled ? 'text-amber-400' : 'text-emerald-400'}`}>
              <span className={`w-2 h-2 rounded-full animate-ping ${isCanceled ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              {statusDisplay}
            </span>
            {subscription?.currentPeriodEnd && (
              <span className="text-xs text-muted mt-2 flex items-center gap-1.5">
                <Calendar size={12} />
                Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Usage Dashboard */}
      {usageData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderProgressBar('Workspaces', 1, usageData.limits.workspaces, <Briefcase size={16} className="text-blue-400"/>)}
          {renderProgressBar('Employees', usageData.usage.employeeCount, usageData.limits.employees, <Users size={16} className="text-emerald-400"/>)}
          {renderProgressBar('Candidates', usageData.usage.candidateCount, usageData.limits.candidates, <UserCheck size={16} className="text-amber-400"/>)}
        </div>
      )}

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {plans.map((p) => {
          const isCurrent = activePlanName === p.key;
          return (
            <div 
              key={p.key} 
              className={`relative flex flex-col justify-between p-8 rounded-3xl border transition-all ${
                isCurrent 
                  ? 'bg-background border-indigo-500 shadow-xl shadow-indigo-500/5' 
                  : p.isPopular ? 'bg-surface/60 border-indigo-500/50' : 'bg-surface/40 border-outline hover:border-outline'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  Active Plan
                </span>
              )}
              {p.isPopular && !isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Sparkles size={12}/> Most Popular
                </span>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-xl text-on-surface">{p.name}</h3>
                  <p className="text-sm text-muted mt-2 min-h-[40px] leading-relaxed">{p.description}</p>
                </div>

                <div className="py-2">
                  <span className="text-4xl font-black text-on-surface">{p.priceMonthly === 'Custom' ? 'Custom' : `$${p.priceMonthly}`}</span>
                  {p.priceMonthly !== 'Custom' && <span className="text-sm text-muted"> / mo</span>}
                </div>

                <hr className="border-outline/80 my-4" />

                <div className="space-y-3">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Features included:</p>
                  <ul className="space-y-3 text-sm text-on-surface-variant">
                    {p.features.map((f, index) => (
                      <li key={index} className="flex items-start gap-3 leading-relaxed">
                        <Check size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleUpgrade(p.key)}
                  disabled={isCurrent || actionLoading !== null}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
                    isCurrent 
                      ? 'bg-surface-high text-muted border border-outline cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                  }`}
                >
                  {actionLoading === p.key ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : p.priceMonthly === 'Custom' ? (
                    'Contact Sales'
                  ) : (
                    `Upgrade to ${p.name.split(' ')[0]}`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Ledger */}
      <div className="bg-surface/30 border border-outline rounded-3xl p-6 md:p-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg text-on-surface">Billing History</h3>
            <p className="text-sm text-muted mt-0.5">Download previous statements and audit your subscription accounts.</p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="py-12 text-center text-muted text-sm border border-dashed border-outline rounded-2xl bg-background/50">
            No invoice records found. Active subscription purchases will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-outline text-muted font-bold uppercase tracking-wider text-xs">
                  <th className="py-4 px-4">Invoice ID</th>
                  <th className="py-4 px-4">Billing Date</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-high/10 text-on-surface-variant transition">
                    <td className="py-4 px-4 font-mono text-muted text-xs">{inv.invoiceNumber || inv.id.slice(0, 12) + '...'}</td>
                    <td className="py-4 px-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 font-semibold text-on-surface">${inv.amount.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {inv.invoicePdf ? (
                        <a 
                          href={inv.invoicePdf}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline bg-background hover:bg-surface hover:text-on-surface transition font-medium text-xs"
                        >
                          <FileText size={14} /> View PDF
                        </a>
                      ) : (
                        <span className="text-muted text-xs italic">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
