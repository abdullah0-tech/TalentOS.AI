'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Send,
  Camera,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { request } from '../services/api';

export default function FeedbackModal({ isOpen, onClose, initialType = 'General Feedback' }) {
  const [type, setType] = useState(initialType);
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Reset state when opened with a new type
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setMessage('');
      setPriority('Medium');
      setScreenshot(null);
      setScreenshotPreview('');
      setIsSuccess(false);
      setError('');
    }
  }, [isOpen, initialType]);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot must be less than 5MB');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!message.trim()) {
      setError('Please describe your feedback');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload screenshot if exists
      let screenshotUrl = null;
      if (screenshot) {
        const formData = new FormData();
        formData.append('file', screenshot);
        formData.append('type', 'feedback_screenshot');
        
        // Use generic document upload endpoint or create a specific one
        // For now we assume a document upload endpoint exists that handles this
        const uploadRes = await request('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });
        screenshotUrl = uploadRes.fileUrl || uploadRes.url;
      }

      // 2. Submit feedback
      await request('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message,
          priority,
          screenshotUrl,
          pageUrl: window.location.href,
          browser: navigator.userAgent,
          appVersion: '1.0.0-beta'
        })
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setTimeout(() => setIsSuccess(false), 500);
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Public Demo Feedback</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Help us improve TalentOS before launch.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                  Your feedback has been submitted successfully. You're helping shape the future of TalentOS!
                </p>
                <div className="mt-6 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-500/20">
                  Early Beta Contributor 🎖️
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Type Selection */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'General Feedback', icon: MessageSquare, label: 'Feedback' },
                    { id: 'Bug Report', icon: Bug, label: 'Bug Report' },
                    { id: 'Feature Request', icon: Lightbulb, label: 'Feature' }
                  ].map(t => {
                    const Icon = t.icon;
                    const isActive = type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          isActive 
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${isActive ? 'text-indigo-500' : ''}`} />
                        <span className="text-xs font-medium">{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Priority */}
                {type === 'Bug Report' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority Level</label>
                    <div className="flex gap-4">
                      {['Low', 'Medium', 'High'].map(p => (
                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="priority"
                            value={p}
                            checked={priority === p}
                            onChange={(e) => setPriority(e.target.value)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {type === 'Bug Report' ? 'Describe the issue...' : type === 'Feature Request' ? 'What should we add?' : 'What\'s on your mind?'}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
                    placeholder="Provide as much detail as possible..."
                    required
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Attach Screenshot (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {screenshotPreview ? (
                        <div className="relative inline-block">
                          <img src={screenshotPreview} alt="Preview" className="max-h-32 rounded-lg" />
                          <button
                            type="button"
                            onClick={() => { setScreenshot(null); setScreenshotPreview(''); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Camera className="mx-auto h-12 w-12 text-slate-400" />
                          <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                            <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none">
                              <span>Upload a file</span>
                              <input type="file" className="sr-only" accept="image/*" onChange={handleScreenshotChange} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </form>
            )}
          </div>

          {/* Footer */}
          {!isSuccess && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !message.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
