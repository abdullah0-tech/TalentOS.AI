'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  BookOpen, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Database,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  RefreshCw
} from 'lucide-react';

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await request('/knowledge');
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError('Could not retrieve document list. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        // Default title to name without extension
        const baseName = selected.name.substring(0, selected.name.lastIndexOf('.')) || selected.name;
        setTitle(baseName);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      await request('/knowledge/upload', {
        method: 'POST',
        body: formData
      });

      setSuccessMsg('Document uploaded! Processing chunks in background.');
      setFile(null);
      setTitle('');
      
      // Reload document list
      fetchDocuments();
      
      // Auto-clear message
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'File upload failed. Only PDF and TXT are supported.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this document and delete all search chunks?')) return;
    try {
      await request(`/knowledge/${id}`, { method: 'DELETE' });
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Could not delete document.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <BookOpen className="text-indigo-400" size={32} /> Company Knowledge Base
        </h1>
        <p className="text-sm text-muted mt-1">
          Store employee handbooks, HR policies, and benefits documents for the AI Chatbot context.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Upload Form */}
        <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 h-fit">
          <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
            <UploadCloud size={20} className="text-indigo-400" /> Ingest Document
          </h3>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs mb-4 flex items-start gap-2">
              <AlertTriangle className="shrink-0 mt-0.5" size={14} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs mb-4 flex items-start gap-2">
              <CheckCircle className="shrink-0 mt-0.5" size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Document Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Employee Leave Policy 2026"
                className="w-full bg-surface border border-outline focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Document File (.pdf, .txt)</label>
              <div className="border-2 border-dashed border-outline hover:border-indigo-500/40 rounded-2xl p-6 text-center transition cursor-pointer relative bg-surface/40">
                <input 
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!file}
                />
                <UploadCloud className="mx-auto text-on-surface-variant mb-2" size={32} />
                {file ? (
                  <div>
                    <p className="text-xs font-bold text-on-surface truncate max-w-full">{file.name}</p>
                    <p className="text-[10px] text-muted mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant">Click to choose a file</p>
                    <p className="text-[10px] text-muted mt-1">PDF or Plain Text up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs shadow-lg shadow-indigo-600/10"
            >
              {uploading ? (
                <>
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></span>
                  Processing...
                </>
              ) : (
                'Upload and Index'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-surface/60 border border-outline rounded-xl text-[10px] text-muted flex items-start gap-2.5">
            <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Once uploaded, files are automatically split into 800-character segments. AI embeddings are generated and stored in a vector structure to enable semantic searches in chat contexts.
            </p>
          </div>
        </div>

        {/* Right 2 Cols: Document Listings */}
        <div className="lg:col-span-2 bg-background/40 border border-outline/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <Database size={20} className="text-indigo-400" /> Document Repository
            </h3>
            <button 
              onClick={fetchDocuments}
              className="p-2 hover:bg-surface-high text-muted hover:text-on-surface rounded-lg transition"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-surface/60 border border-outline rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-outline rounded-2xl">
              <FileText className="mx-auto text-slate-650 mb-3" size={48} />
              <h4 className="font-bold text-on-surface text-base">Knowledge Base is Empty</h4>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto leading-relaxed">
                Add guidelines and handbooks here so the AI Recruiting Assistant can reference them during chat sessions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="p-4 bg-surface/40 border border-outline hover:border-outline rounded-xl flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 flex items-center justify-center rounded-xl shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-on-surface truncate">{doc.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted">
                          {new Date(doc.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">&bull;</span>
                        
                        {/* Status chip */}
                        {doc.status === 'ready' && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20">
                            <CheckCircle size={10} /> Ready
                          </span>
                        )}
                        {doc.status === 'processing' && (
                          <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 border border-indigo-500/20 animate-pulse">
                            <Clock size={10} /> Chunking
                          </span>
                        )}
                        {doc.status === 'failed' && (
                          <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 border border-red-500/20">
                            <AlertTriangle size={10} /> Failed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete Document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
