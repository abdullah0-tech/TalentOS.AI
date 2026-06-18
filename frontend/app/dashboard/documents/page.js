'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { authService } from '../../../services/auth.service';
import { 
  FolderLock, 
  Upload, 
  FileText, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Info,
  Calendar,
  Filter
} from 'lucide-react';

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('policy');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active filter tab
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await request('/documents');
      setDocuments(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve document registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, "")); // Strip extension for default title
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('type', type);

      await request('/documents', {
        method: 'POST',
        body: formData
      });

      setSuccess('Document archived in vault successfully.');
      setFile(null);
      setTitle('');
      // Reset file input
      const fileInput = document.getElementById('vault-file-input');
      if (fileInput) fileInput.value = '';

      fetchDocuments();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload document.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to permanently delete this document from the company vault?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await request(`/documents/${docId}`, {
        method: 'DELETE'
      });
      setSuccess('Document removed from vault.');
      fetchDocuments();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete document.');
    }
  };

  const userRole = currentUser?.role ? currentUser.role.toLowerCase() : 'member';
  const isAdmin = ['owner', 'admin', 'member'].includes(userRole);

  const filteredDocs = documents.filter(doc => {
    if (activeFilter === 'all') return true;
    return doc.type === activeFilter;
  });

  const docTypes = [
    { id: 'all', label: 'All Vaults' },
    { id: 'contract', label: 'Contracts' },
    { id: 'offer_letter', label: 'Offer Letters' },
    { id: 'policy', label: 'Policies' },
    { id: 'certificate', label: 'Certificates' },
    { id: 'review', label: 'Evaluations' }
  ];

  // Helper for API endpoint path resolution
  const backendUrl = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
    : 'http://localhost:5000';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
          <FolderLock className="text-primary" size={32} /> Document Vault
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">Archive policy handbooks, employment contracts, and regulatory certificates.</p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 text-success p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Upload Vault */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-outline rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <Upload size={16} className="text-primary" /> Archive Document
              </h3>
              <p className="text-[10px] text-on-surface-variant mt-1">Upload files to the secure multi-tenant vault.</p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Select Document File</label>
                <div className="border border-dashed border-outline rounded-xl p-4 text-center hover:border-muted/50 transition relative bg-surface-high">
                  <Upload className="mx-auto text-muted mb-2" size={20} />
                  <span className="text-[10px] text-on-surface-variant font-semibold block truncate">
                    {file ? file.name : 'Select PDF, DOCX, TXT or PNG'}
                  </span>
                  <input
                    id="vault-file-input"
                    type="file"
                    onChange={handleFileChange}
                    required
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Document Title</label>
                <input
                  type="text"
                  placeholder="Document display name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-modern w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Classification Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-modern w-full"
                >
                  <option value="contract">Contract</option>
                  <option value="offer_letter">Offer Letter</option>
                  <option value="policy">Policy Handbook</option>
                  <option value="certificate">Tax Certificate</option>
                  <option value="review">Performance Review Log</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-1.5 shadow-sm"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <span className="flex items-center gap-1.5"><Upload size={12} /> Archive Document</span>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Documents Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-surface-highest border border-outline rounded-xl p-1.5 flex flex-wrap gap-1">
            {docTypes.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeFilter === tab.id ? 'bg-surface text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Documents listing */}
          <div className="bg-surface border border-outline rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-on-surface text-base mb-6 flex items-center gap-2">
              <FolderLock size={18} className="text-primary" /> Vault Records
            </h3>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-surface-highest rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-outline rounded-2xl">
                <FileText className="mx-auto text-muted mb-3 animate-pulse" size={36} />
                <h4 className="font-bold text-on-surface-variant text-xs">No documents archived in this vault</h4>
                <p className="text-[10px] text-muted mt-1">Upload records to populate the system vault.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocs.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="p-4 bg-surface-high/50 border border-outline hover:border-outline rounded-xl flex items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-primary-light text-primary border border-blue-200 flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-xs text-on-surface truncate pr-4">{doc.title}</h4>
                        <div className="flex items-center gap-2 text-[9px] text-on-surface-variant mt-1 font-semibold">
                          <span className="bg-surface-highest border border-outline px-1.5 py-0.5 rounded text-on-surface-variant capitalize">{doc.type.replace('_', ' ')}</span>
                          <span>&bull;</span>
                          <span>Archived: {new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`${backendUrl}${doc.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-surface-highest text-on-surface-variant hover:text-on-surface rounded-lg transition"
                        title="Download / View"
                      >
                        <ExternalLink size={14} />
                      </a>
                      
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 hover:bg-red-50 text-white-variant hover:text-error rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="p-4 bg-primary-light border border-blue-100 rounded-xl text-[10px] text-white-variant flex items-start gap-2 max-w-2xl">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Document data is isolated per company tenant to ensure zero cross-tenant visibility. Files are stored securely on backend servers and validated via JWT auth tokens before access.
        </p>
      </div>
    </div>
  );
}
