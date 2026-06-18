'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { authService } from '../../../services/auth.service';
import { 
  Star, 
  User, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Award,
  Info,
  Calendar
} from 'lucide-react';

export default function PerformancePage() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Submit Form States
  const [employeeId, setEmployeeId] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [reviewCycle, setReviewCycle] = useState('Q1_2026');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active filter tab for admins
  const [selectedCycle, setSelectedCycle] = useState('all');

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchReviewsAndEmployees(user);
  }, []);

  const fetchReviewsAndEmployees = async (user) => {
    try {
      setLoading(true);
      const reviewsData = await request('/performance-review');
      setReviews(reviewsData);

      const userRole = user?.role ? user.role.toLowerCase() : 'member';
      if (userRole !== 'employee') {
        const empData = await request('/employees');
        setEmployees(empData);
        if (empData.length > 0) {
          setEmployeeId(empData[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve evaluation details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      setError('Please select an employee.');
      return;
    }
    if (!feedback.trim()) {
      setError('Feedback comments are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await request('/performance-review', {
        method: 'POST',
        body: { employeeId, rating, feedback, reviewCycle }
      });

      setSuccess('Evaluation review recorded successfully!');
      setFeedback('');
      
      // Reload reviews
      const reviewsData = await request('/performance-review');
      setReviews(reviewsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to record performance review.');
    } finally {
      setSubmitting(false);
    }
  };

  const userRole = currentUser?.role ? currentUser.role.toLowerCase() : 'member';
  const isEmployee = userRole === 'employee';

  const filteredReviews = reviews.filter(r => {
    if (selectedCycle === 'all') return true;
    return r.reviewCycle === selectedCycle;
  });

  const ratingCycles = ['all', 'Q1_2026', 'Q2_2026', 'Q3_2026', 'Q4_2026', 'Annual_2026'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
          <Star className="text-amber-400 fill-amber-400" size={32} /> Performance Reviews
        </h1>
        <p className="text-sm text-muted mt-1">Review team member feedback, log rating indices, and coordinate career progression.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-emerald-450 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Submit review (Admins only) */}
        {!isEmployee ? (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="font-bold text-on-surface text-sm">Submit Evaluation</h3>
                <p className="text-[10px] text-muted mt-1">Submit employee score & qualitative comments.</p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted font-bold uppercase">Select Employee</label>
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Choose employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted font-bold uppercase">Numerical Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className={`flex-1 py-1.5 font-bold rounded-lg border text-xs transition ${
                          rating === num
                            ? 'bg-amber-500 border-amber-400 text-slate-950'
                            : 'bg-background border-outline text-muted hover:border-outline'
                        }`}
                      >
                        {num} ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted font-bold uppercase">Review Cycle</label>
                  <select
                    value={reviewCycle}
                    onChange={(e) => setReviewCycle(e.target.value)}
                    className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Q1_2026">Q1 2026</option>
                    <option value="Q2_2026">Q2 2026</option>
                    <option value="Q3_2026">Q3 2026</option>
                    <option value="Q4_2026">Q4 2026</option>
                    <option value="Annual_2026">Annual 2026</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted font-bold uppercase">Feedback Comments</label>
                  <textarea
                    rows={4}
                    placeholder="Enter accomplishments and constructive feedback points..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                    className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/10 transition flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : <span className="flex items-center gap-1.5"><Send size={12} /> Submit Review</span>}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-1 space-y-6">
            {/* Quick overview stats for employee */}
            <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 text-center space-y-4">
              <Award className="mx-auto text-amber-400 fill-amber-400/10 animate-bounce" size={40} />
              <div>
                <h3 className="font-bold text-on-surface text-base">Your Reviews Portal</h3>
                <p className="text-[10px] text-muted mt-1">Read feedback collected from your supervisors.</p>
              </div>
              <div className="p-4 bg-surface/40 rounded-xl border border-outline text-center">
                <span className="text-[10px] font-bold text-muted uppercase">Average Rating</span>
                <span className="text-3xl font-black text-amber-400 mt-1 block">
                  {reviews.length > 0 
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : 'N/A'
                  } <span className="text-lg">★</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Historical Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cycle Filter Selection */}
          <div className="flex items-center justify-between bg-background/40 border border-outline/80 p-4 rounded-xl">
            <span className="text-xs font-semibold text-muted">Filter Review Cycle</span>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="bg-background border border-outline px-2.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant focus:outline-none"
            >
              {ratingCycles.map(cycle => (
                <option key={cycle} value={cycle}>{cycle === 'all' ? 'All Cycles' : cycle.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Historical Reviews List */}
          <div className="bg-background/40 border border-outline/80 rounded-2xl p-6">
            <h3 className="font-bold text-on-surface text-base mb-6">Performance Evaluations Feed</h3>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 bg-surface/40 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-outline rounded-2xl">
                <Star className="mx-auto text-on-surface-variant mb-3" size={36} />
                <h4 className="font-bold text-muted text-xs">No evaluations logged</h4>
                <p className="text-[10px] text-muted mt-1">Feedback reports display in this panel.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((rev) => (
                  <div 
                    key={rev.id} 
                    className="p-5 bg-surface/40 border border-outline hover:border-outline rounded-xl space-y-4 transition relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-on-surface">{rev.employee?.name}</span>
                          <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-400 font-bold">
                            {rev.reviewCycle?.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted mt-1.5 block">Reviewer: {rev.reviewer?.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg font-bold text-xs shrink-0">
                        <Star size={12} className="fill-amber-400" /> {rev.rating} / 5
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                      {rev.feedback}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="p-4 bg-surface/60 border border-outline rounded-xl text-[10px] text-muted flex items-start gap-2 max-w-2xl">
        <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Evaluation ratings are archived on database transaction tables and compile into aggregate workforce health scorecards. They form part of compliance audits.
        </p>
      </div>
    </div>
  );
}
