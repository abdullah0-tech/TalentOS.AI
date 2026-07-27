import { X, Printer, Building2, Download } from 'lucide-react';
import { useRef } from 'react';

export default function PayslipModal({ payroll, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore React bindings after print
  };

  if (!payroll || !payroll.employee) return null;

  const { employee, cycle, baseSalary, allowances, bonuses, deductions, netPay, createdAt } = payroll;
  const issueDate = new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-outline rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative">
        {/* Header Actions */}
        <div className="bg-surface-high/50 border-b border-outline px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-bold text-on-surface">Payslip Details</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <Printer size={16} /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-background border border-outline rounded-xl text-muted hover:text-on-surface transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 md:p-12 bg-white text-slate-900" ref={printRef} style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
          
          {/* Company & Payslip Header */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-200 pb-8 mb-8 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Building2 size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">TalentOS Inc.</h1>
                <p className="text-slate-500 font-medium">123 Innovation Drive, Tech City, CA 94016</p>
                <p className="text-slate-500 font-medium">contact@talentos.ai • +1 (555) 123-4567</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-4xl font-black text-slate-200 uppercase tracking-widest mb-2">Payslip</h2>
              <p className="text-slate-800 font-bold bg-slate-100 px-3 py-1 rounded-lg inline-block">Pay Period: {cycle.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Employee Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Employee Name</p>
                <p className="text-lg font-bold text-slate-900">{employee.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-base font-medium text-slate-700">{employee.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                <p className="text-base font-medium text-slate-700">{employee.department}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Job Position</p>
                <p className="text-base font-medium text-slate-700">{employee.position}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Date</p>
                <p className="text-base font-medium text-slate-700">{issueDate}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payslip ID</p>
                <p className="text-base font-mono text-slate-700">{payroll.id.split('-')[0].toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Earnings */}
            <div className="border rounded-2xl overflow-hidden border-slate-200">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Earnings</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">Base Salary</span>
                  <span className="font-semibold text-slate-900">${baseSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">Allowances</span>
                  <span className="font-semibold text-slate-900">${allowances.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">Bonuses</span>
                  <span className="font-semibold text-slate-900">${bonuses.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Gross Earnings</span>
                <span className="font-black text-slate-900 text-lg">${(baseSalary + allowances + bonuses).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="border rounded-2xl overflow-hidden border-slate-200">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Deductions</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">Income Tax (15%)</span>
                  <span className="font-semibold text-red-600">-${(baseSalary * 0.15).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">Unpaid Leave Offsets</span>
                  <span className="font-semibold text-red-600">-${(deductions - (baseSalary * 0.15)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex justify-between items-center h-[73px]">
                <span className="font-bold text-slate-800">Total Deductions</span>
                <span className="font-black text-red-600 text-lg">-${deductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Total */}
          <div className="bg-indigo-600 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center text-white shadow-xl shadow-indigo-600/20">
            <div>
              <p className="text-indigo-200 font-semibold uppercase tracking-wider text-sm mb-1">Net Pay Total</p>
              <p className="text-indigo-100 text-sm">Amount to be transferred to employee's bank account.</p>
            </div>
            <div className="text-4xl font-black mt-4 md:mt-0 tracking-tight">
              ${netPay.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-8 text-center border-t-2 border-dashed border-slate-200 pt-8">
            <p className="text-sm font-medium text-slate-500">This is a computer-generated document. No signature is required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
