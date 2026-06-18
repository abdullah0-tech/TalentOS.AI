'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  FolderLock, 
  FileText, 
  Coins, 
  Download, 
  ExternalLink,
  Loader2,
  BookOpen
} from 'lucide-react';

export default function EmployeeDocuments() {
  const [activeTab, setActiveTab] = useState('company'); // 'company' | 'contracts' | 'payslips'
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load general documents
      const docs = await request('/documents');
      setDocuments(docs);

      // Load payroll statements
      try {
        const payHistory = await request('/payroll/history');
        setPayrolls(payHistory);
      } catch (pe) {
        console.log('Payroll history read skipped or failed:', pe.message);
      }
    } catch (err) {
      console.error('Failed to load vault files:', err);
      setError('Could not retrieve documents list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const companyDocs = documents.filter(d => ['policy', 'certificate', 'handbook'].includes(d.type.toLowerCase()) || d.type === 'policy');
  const contractDocs = documents.filter(d => ['contract', 'offer_letter', 'review'].includes(d.type.toLowerCase()) || d.type === 'contract');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-muted text-sm">Opening document vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-2">
          <FolderLock className="text-indigo-400" /> Employee Documents Vault
        </h1>
        <p className="text-muted text-sm mt-1">
          Access signed agreements, corporate guides, and payslips.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-outline/60 gap-8">
        <button
          onClick={() => setActiveTab('company')}
          className={`pb-4 text-sm font-bold transition relative ${activeTab === 'company' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-muted hover:text-on-surface'}`}
        >
          Company Policies ({companyDocs.length})
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`pb-4 text-sm font-bold transition relative ${activeTab === 'contracts' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-muted hover:text-on-surface'}`}
        >
          My Agreements ({contractDocs.length})
        </button>
        <button
          onClick={() => setActiveTab('payslips')}
          className={`pb-4 text-sm font-bold transition relative ${activeTab === 'payslips' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-muted hover:text-on-surface'}`}
        >
          My Payslips ({payrolls.length})
        </button>
      </div>

      {/* Content Rendering */}
      <div className="glass-panel border border-outline/80 rounded-2xl p-6">
        {activeTab === 'company' && (
          <div className="space-y-4">
            {companyDocs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {companyDocs.map((doc) => (
                  <div key={doc.id} className="card-ai p-4 flex justify-between items-center hover:border-outline transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-background border border-outline rounded-xl text-muted">
                        <BookOpen size={18} className="text-indigo-400/85" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">{doc.title}</h4>
                        <p className="text-[10px] text-muted mt-1.5 uppercase tracking-wider font-bold">{doc.type}</p>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-background border border-outline hover:bg-indigo-650 hover:bg-indigo-600 text-muted hover:text-white transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-outline/80 rounded-2xl">
                <BookOpen size={40} className="text-on-surface-variant mx-auto mb-3" />
                <p className="text-muted text-sm font-semibold">No company policies configured</p>
                <p className="text-muted text-xs mt-1">Contact your HR manager for copy requests.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="space-y-4">
            {contractDocs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contractDocs.map((doc) => (
                  <div key={doc.id} className="card-ai p-4 flex justify-between items-center hover:border-outline transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-background border border-outline rounded-xl text-muted">
                        <FileText size={18} className="text-indigo-400/85" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">{doc.title}</h4>
                        <p className="text-[10px] text-muted mt-1.5 uppercase tracking-wider font-bold">{doc.type}</p>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-background border border-outline hover:bg-indigo-650 hover:bg-indigo-600 text-muted hover:text-white transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-outline/80 rounded-2xl">
                <FileText size={40} className="text-on-surface-variant mx-auto mb-3" />
                <p className="text-muted text-sm font-semibold">No custom contracts uploaded yet</p>
                <p className="text-muted text-xs mt-1">Agreements are saved here once signed.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payslips' && (
          <div className="space-y-4">
            {payrolls.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline/80 text-muted text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Cycle Period</th>
                      <th className="py-3.5 px-4">Base Salary</th>
                      <th className="py-3.5 px-4">Allowances/Bonus</th>
                      <th className="py-3.5 px-4">Deductions</th>
                      <th className="py-3.5 px-4">Net Payout</th>
                      <th className="py-3.5 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((payroll) => (
                      <tr key={payroll.id} className="border-b border-outline/60 hover:bg-surface/10 text-sm text-on-surface-variant transition-colors">
                        <td className="py-4.5 px-4 font-black text-on-surface uppercase">{payroll.cycle}</td>
                        <td className="py-4.5 px-4">${payroll.baseSalary.toFixed(2)}</td>
                        <td className="py-4.5 px-4 text-emerald-400 font-medium">+${(payroll.allowances + payroll.bonuses).toFixed(2)}</td>
                        <td className="py-4.5 px-4 text-rose-400 font-medium">-${payroll.deductions.toFixed(2)}</td>
                        <td className="py-4.5 px-4 font-black text-on-surface">${payroll.netPay.toFixed(2)}</td>
                        <td className="py-4.5 px-4">
                          {payroll.payslipUrl ? (
                            <a
                              href={payroll.payslipUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-bold bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
                            >
                              <Download size={14} /> View PDF
                            </a>
                          ) : (
                            <span className="text-xs text-muted font-bold">Generating...</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-outline/80 rounded-2xl">
                <Coins size={40} className="text-on-surface-variant mx-auto mb-3" />
                <p className="text-muted text-sm font-semibold">No payroll statements available</p>
                <p className="text-muted text-xs mt-1">Payslips are published at the end of each cycle.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
