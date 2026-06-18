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
  TrendingUp,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function BillingPage() {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const plans = [
    {
      key: 'starter',
      name: 'Starter',
      priceMonthly: 9,
      priceYearly: 7,
      seatLimit: 10,
      description: 'Ideal for small startups scaling their initial hiring loops.',
      features: ['ATS Kanban Board', 'Up to 10 active job posts', 'Basic Onboarding Checklists', 'Grok AI Lite Resume Analysis']
    },
    {
      key: 'professional',
      name: 'Professional',
      priceMonthly: 29,
      priceYearly: 24,
      seatLimit: 50,
      description: 'Perfect for growing businesses requiring complete employee tracking.',
      features: ['Everything in Starter', 'Up to 50 active seats', 'Time & Attendance clocks', 'Leave Tracker & Approvals', 'Advanced Grok Screening']
    },
    {
      key: 'business',
      name: 'Business',
      priceMonthly: 79,
      priceYearly: 64,
      seatLimit: 250,
      description: 'For advanced enterprises organizing broad scale team training.',
      features: ['Everything in Professional', 'Up to 250 seats limit', 'LMS Training Academy', 'Goals & OKR trackers', 'No-code workflow automations', 'Dedicated recruiter copilot']
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      priceMonthly: 199,
      priceYearly: 159,
      seatLimit: 9999,
      description: 'Custom setups for high-volume enterprise compliance & analytics.',
      features: ['All platform features', 'Unlimited workspace seats', 'Custom Reporting Hierarchies', 'Enterprise Integrations Hub', 'SAML2 SSO & MFA controls', 'White-label custom domains', 'Grok Executive BI Analyser']
    }
  ];

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    setError('');
    try {
      const subData = await request('/billing');
      setSubscription(subData);

      const invData = await request('/billing/invoices');
      setInvoices(invData);
    } catch (err) {
      console.error('Failed to load billing data:', err);
      setError('Failed to fetch subscription status or invoice history.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planKey) => {
    setActionLoading(planKey);
    setError('');
    setSuccess('');
    try {
      const response = await request('/billing', {
        method: 'POST',
        body: { planKey, billingInterval }
      });
      setSuccess(`Successfully updated subscription to the ${plans.find(p => p.key === planKey).name} plan!`);
      setSubscription(response.subscription ? { ...response.subscription, plan: plans.find(p => p.key === planKey) } : null);
      
      // Refresh invoicing history
      const invData = await request('/billing/invoices');
      setInvoices(invData);
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to modify subscription.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <p className="text-muted text-sm">Loading billing console...</p>
      </div>
    );
  }

  const activePlanName = subscription?.plan?.name || 'Free Trial';
  const isActiveEnterprise = activePlanName.toLowerCase() === 'enterprise';

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <CreditCard className="text-indigo-400" size={32} />
          SaaS Billing & Subscriptions
        </h1>
        <p className="text-sm text-muted mt-1">
          Manage your organizational seat counts, upgrade service tiers, and audit corporate transaction invoices.
        </p>
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 uppercase tracking-wider">
              Active Tier
            </span>
            <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
              {activePlanName} Plan
              {activePlanName !== 'Free Trial' && <Sparkles size={18} className="text-amber-400 animate-pulse" />}
            </h2>
            <p className="text-sm text-muted max-w-xl">
              Your organization currently operates with a limit of <strong className="text-on-surface">{subscription?.plan?.seatLimit || 5}</strong> seats. 
              {activePlanName === 'Free Trial' && ' Upgrade to unlock compliance, payroll modules, and specialized AI models.'}
            </p>
          </div>
          <div className="bg-background/50 border border-outline rounded-2xl px-6 py-4 flex flex-col md:items-end text-sm shrink-0">
            <span className="text-xs text-muted">Subscription Status</span>
            <span className="font-bold text-emerald-400 uppercase tracking-wide mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {subscription?.status || 'trialing'}
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

      {/* Toggle Interval Selection */}
      <div className="flex justify-center">
        <div className="bg-background border border-outline p-1.5 rounded-2xl flex gap-1">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${billingInterval === 'monthly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-on-surface'}`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${billingInterval === 'yearly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-on-surface'}`}
          >
            Yearly Saving
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-md">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = activePlanName.toLowerCase() === p.key;
          const price = billingInterval === 'monthly' ? p.priceMonthly : p.priceYearly;
          return (
            <div 
              key={p.key} 
              className={`relative flex flex-col justify-between p-6 rounded-3xl border transition-all ${
                isCurrent 
                  ? 'bg-background border-indigo-500 shadow-xl shadow-indigo-500/5' 
                  : 'bg-surface/40 border-outline hover:border-outline'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  Active Plan
                </span>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-lg text-on-surface">{p.name}</h3>
                  <p className="text-xs text-muted mt-1.5 min-h-[32px] leading-relaxed">{p.description}</p>
                </div>

                <div className="py-2">
                  <span className="text-3xl font-black text-on-surface">${price}</span>
                  <span className="text-xs text-muted"> / seat / mo</span>
                  <p className="text-[10px] text-muted mt-1">Billed {billingInterval}</p>
                </div>

                <hr className="border-outline/80" />

                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-muted">Features included:</p>
                  <ul className="space-y-2 text-xs text-on-surface-variant">
                    {p.features.map((f, index) => (
                      <li key={index} className="flex items-start gap-2 leading-relaxed">
                        <Check size={14} className="text-indigo-400 shrink-0 mt-0.5" />
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
                  className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isCurrent 
                      ? 'bg-surface-high text-muted border border-outline cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                  }`}
                >
                  {actionLoading === p.key ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    `Select ${p.name}`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Ledger */}
      <div className="bg-surface/30 border border-outline rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg text-on-surface">Invoice History</h3>
            <p className="text-xs text-muted mt-0.5">Download previous statements and audit your subscription accounts.</p>
          </div>
          <span className="p-2 bg-background border border-outline rounded-xl text-muted hover:text-on-surface cursor-pointer transition">
            <FileText size={18} />
          </span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-12 text-center text-muted text-xs border border-dashed border-outline rounded-2xl">
            No invoice records found. Active subscription purchases will catalog here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline text-muted font-bold uppercase tracking-wider">
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
                    <td className="py-4 px-4 font-mono text-muted">{inv.id.slice(0, 12)}...</td>
                    <td className="py-4 px-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 font-semibold text-on-surface">${inv.amount.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <a 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Downloading Invoice ${inv.id}...`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline bg-background hover:bg-surface hover:text-on-surface transition font-medium"
                      >
                        <FileText size={12} /> PDF Download
                      </a>
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
