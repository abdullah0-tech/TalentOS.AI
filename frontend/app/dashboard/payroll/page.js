'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  Coins, 
  Plus, 
  Loader2, 
  FileText, 
  DollarSign, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Check, 
  Clock, 
  Calculator,
  TrendingUp
} from 'lucide-react';

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calculate payroll form states
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [allowances, setAllowances] = useState('');
  const [bonuses, setBonuses] = useState('');
  const [cycle, setCycle] = useState('June_2026');
  const [calculating, setCalculating] = useState(false);

  // Status updating state
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    setLoading(true);
    setError('');
    try {
      const payData = await request('/payroll/history');
      setPayrolls(payData);

      const empData = await request('/organization/chart');
      setEmployees(empData);
    } catch (err) {
      console.error('Failed to load payroll data:', err);
      setError('Failed to retrieve payroll histories or employee databases.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePayroll = async (e) => {
    e.preventDefault();
    if (!selectedEmpId || !baseSalary || !cycle) return;
    setCalculating(true);
    setError('');
    setSuccess('');

    try {
      await request('/payroll/calculate', {
        method: 'POST',
        body: {
          employeeId: selectedEmpId,
          baseSalary: parseFloat(baseSalary),
          allowances: parseFloat(allowances) || 0,
          bonuses: parseFloat(bonuses) || 0,
          cycle
        }
      });

      setSuccess(`Payroll for selected staff compiled successfully!`);
      setSelectedEmpId('');
      setBaseSalary('');
      setAllowances('');
      setBonuses('');
      
      // Refresh list
      const updated = await request('/payroll/history');
      setPayrolls(updated);
    } catch (err) {
      console.error('Calculation error:', err);
      setError(err.message || 'Failed to calculate payroll.');
    } finally {
      setCalculating(false);
    }
  };

  const handleUpdateStatus = async (payrollId, currentStatus) => {
    setUpdatingId(payrollId);
    setError('');
    setSuccess('');

    const targetStatus = currentStatus === 'processed' ? 'pending' : 'processed';
    try {
      await request(`/payroll/${payrollId}`, {
        method: 'PUT',
        body: { status: targetStatus }
      });
      setSuccess(`Payroll statement marked as ${targetStatus}!`);

      // Refresh list
      const updated = await request('/payroll/history');
      setPayrolls(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.message || 'Failed to update statement status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Compute accumulated metrics
  const totalExpenditure = payrolls.reduce((sum, p) => sum + p.netPay, 0);
  const processedCount = payrolls.filter(p => p.status === 'processed').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <p className="text-muted text-sm">Compiling financial balance tables...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <Coins className="text-indigo-400" size={32} />
          Payroll Ledger
        </h1>
        <p className="text-sm text-muted mt-1">
          Calculate salaries, deduct flat-rate income taxes, offset unpaid leaves, and distribute pay statements.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-high/40 border border-outline p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-muted font-semibold uppercase tracking-wider">Total Net Payroll Cost</p>
            <p className="text-3xl font-extrabold text-on-surface mt-2">${totalExpenditure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 flex items-center justify-center rounded-xl">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-surface-high/40 border border-outline p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-muted font-semibold uppercase tracking-wider">Disbursed Statements</p>
            <p className="text-3xl font-extrabold text-on-surface mt-2">{processedCount} <span className="text-xs text-muted font-medium">/ {payrolls.length} total</span></p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-xl">
            <Check size={20} />
          </div>
        </div>

        <div className="bg-surface-high/40 border border-outline p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-muted font-semibold uppercase tracking-wider">Pending Approvals</p>
            <p className="text-3xl font-extrabold text-on-surface mt-2">{payrolls.length - processedCount}</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 flex items-center justify-center rounded-xl">
            <Clock size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Payroll calculation processor form */}
        <div className="bg-surface/30 border border-outline p-6 rounded-3xl h-fit space-y-4">
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <Calculator className="text-indigo-400" size={16} />
            Payroll Calculator
          </h3>
          <p className="text-xs text-muted">Compile salary, taxes, and leave deductions for the month.</p>

          <form onSubmit={handleCalculatePayroll} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Employee Profile</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                required
                className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
              >
                <option value="">-- Select Profile --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.position})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Base Monthly Salary ($)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                required
                min="0"
                className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Allowances ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={allowances}
                  onChange={(e) => setAllowances(e.target.value)}
                  min="0"
                  className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Bonuses ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={bonuses}
                  onChange={(e) => setBonuses(e.target.value)}
                  min="0"
                  className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Payroll Cycle</label>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
                required
                className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
              >
                <option value="June_2026">June 2026</option>
                <option value="July_2026">July 2026</option>
                <option value="August_2026">August 2026</option>
                <option value="September_2026">September 2026</option>
              </select>
            </div>

            {/* Simulated Calculations Note */}
            <div className="bg-background border border-outline rounded-xl p-3 text-[10px] text-muted leading-relaxed">
              * Note: Calculations deduct flat 15% base tax, plus $150 per unpaid leave approved within the workspace database.
            </div>

            <button
              type="submit"
              disabled={calculating || !selectedEmpId || !baseSalary}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 mt-2"
            >
              {calculating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>Compile Statement <TrendingUp size={14} /></>
              )}
            </button>
          </form>
        </div>

        {/* Right 2 Columns: History ledger list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface/30 border border-outline p-6 rounded-3xl">
            <h3 className="font-bold text-lg text-on-surface mb-6">Payroll Ledger Records</h3>

            {payrolls.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-outline rounded-2xl text-muted text-xs">
                No payroll statements compiled yet for this workspace. Use the calculator to run initial payrolls.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-outline text-muted font-bold uppercase tracking-wider">
                      <th className="py-4 px-3">Employee</th>
                      <th className="py-4 px-3">Cycle</th>
                      <th className="py-4 px-3">Base</th>
                      <th className="py-4 px-3">Deductions</th>
                      <th className="py-4 px-3">Net Pay</th>
                      <th className="py-4 px-3">Status</th>
                      <th className="py-4 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {payrolls.map((pay) => (
                      <tr key={pay.id} className="hover:bg-surface-high/10 text-on-surface-variant transition">
                        <td className="py-4 px-3 font-semibold text-on-surface">{pay.employee?.name || 'Unknown'}</td>
                        <td className="py-4 px-3 font-mono text-[10px] text-muted">{pay.cycle}</td>
                        <td className="py-4 px-3">${pay.baseSalary.toLocaleString()}</td>
                        <td className="py-4 px-3 text-red-400">${pay.deductions.toLocaleString()}</td>
                        <td className="py-4 px-3 font-bold text-emerald-400">${pay.netPay.toLocaleString()}</td>
                        <td className="py-4 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            pay.status === 'processed' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {pay.status === 'processed' ? 'Disbursed' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(pay.id, pay.status)}
                            disabled={updatingId === pay.id}
                            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition ${
                              pay.status === 'processed'
                                ? 'bg-background border-outline text-muted hover:text-white'
                                : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/5'
                            }`}
                          >
                            {updatingId === pay.id ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : pay.status === 'processed' ? (
                              'Revoke'
                            ) : (
                              'Disburse'
                            )}
                          </button>
                          
                          <a 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`Downloading Payslip for ${pay.employee?.name} (${pay.cycle})...`);
                            }}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-outline bg-background text-muted hover:text-on-surface transition"
                            title="Download PDF Payslip"
                          >
                            <FileText size={12} />
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

      </div>
    </div>
  );
}
