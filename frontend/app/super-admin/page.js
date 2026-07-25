'use client';

import { useState, useEffect } from 'react';
import { request } from '../../services/api';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await request('/superadmin/metrics');
      setMetrics(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch super admin metrics. Ensure you are logged in as an owner.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <p className="text-muted">Loading Platform Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-on-surface mb-2">Access Denied</h1>
        <p className="text-muted max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-on-surface flex items-center gap-3">
            <Activity className="text-indigo-500" size={32} />
            Platform Owner Dashboard
          </h1>
          <p className="text-muted mt-2">Aggregate SaaS metrics, MRR tracking, and tenant usage statistics.</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-surface/50 border border-outline rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <DollarSign size={64} />
            </div>
            <p className="text-sm font-bold text-muted uppercase tracking-wider">Monthly Recurring Revenue</p>
            <h2 className="text-4xl font-black text-on-surface mt-2">${(metrics.mrr || 0).toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-400">
              <TrendingUp size={16} />
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="bg-surface/50 border border-outline rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <DollarSign size={64} />
            </div>
            <p className="text-sm font-bold text-muted uppercase tracking-wider">Annual Run Rate</p>
            <h2 className="text-4xl font-black text-on-surface mt-2">${(metrics.arr || 0).toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-400">
              <TrendingUp size={16} />
              <span>Projected</span>
            </div>
          </div>

          <div className="bg-surface/50 border border-outline rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Users size={64} />
            </div>
            <p className="text-sm font-bold text-muted uppercase tracking-wider">Total Workspaces</p>
            <h2 className="text-4xl font-black text-on-surface mt-2">{(metrics.totalCompanies || 0).toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-400">
              Active Tenants
            </div>
          </div>

          <div className="bg-surface/50 border border-outline rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Activity size={64} />
            </div>
            <p className="text-sm font-bold text-muted uppercase tracking-wider">Total Revenue</p>
            <h2 className="text-4xl font-black text-on-surface mt-2">${(metrics.totalRevenue || 0).toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-slate-400">
              All time gross volume
            </div>
          </div>

        </div>

        {/* Plans Breakdown */}
        <div className="bg-surface/30 border border-outline rounded-3xl p-8">
          <h3 className="text-xl font-bold text-on-surface mb-6">Plan Distribution</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background border border-outline rounded-2xl p-6 text-center">
              <p className="text-sm text-muted font-bold uppercase mb-2">Free Tier</p>
              <h4 className="text-3xl font-black text-on-surface">{metrics.planDistribution?.free || 0}</h4>
              <p className="text-xs text-muted mt-2">Workspaces</p>
            </div>
            
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
              <p className="text-sm text-indigo-400 font-bold uppercase mb-2">Professional</p>
              <h4 className="text-3xl font-black text-indigo-300">{metrics.planDistribution?.professional || 0}</h4>
              <p className="text-xs text-indigo-400/70 mt-2">Workspaces</p>
            </div>

            <div className="bg-background border border-outline rounded-2xl p-6 text-center">
              <p className="text-sm text-muted font-bold uppercase mb-2">Enterprise</p>
              <h4 className="text-3xl font-black text-on-surface">{metrics.planDistribution?.enterprise || 0}</h4>
              <p className="text-xs text-muted mt-2">Workspaces</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
