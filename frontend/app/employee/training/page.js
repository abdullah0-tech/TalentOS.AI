'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Play, 
  CheckCircle,
  Loader2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function EmployeeTraining() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(null);
  const [error, setError] = useState('');

  const loadLMSData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch enrollments
      const enrolledList = await request('/training/enrollments');
      setEnrollments(enrolledList);

      // Fetch all courses
      const allCourses = await request('/training/courses');
      
      // Filter available courses (not enrolled)
      const enrolledIds = enrolledList.map(e => e.courseId);
      const available = allCourses.filter(c => !enrolledIds.includes(c.id));
      setAvailableCourses(available);

      // Fetch AI recommendations
      try {
        const aiRecs = await request('/training/recommendations');
        setRecommendations(aiRecs.recommendations || []);
      } catch (ae) {
        console.log('AI recommendations read skipped or failed:', ae.message);
      }

    } catch (err) {
      console.error('Failed to load LMS data:', err);
      setError('Could not retrieve training course catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLMSData();
  }, []);

  const handleProgressUpdate = async (enrollmentId, currentProgress) => {
    // Increment progress by 25% or reset to 100%
    const nextProgress = Math.min(100, currentProgress + 25);
    setUpdateLoading(enrollmentId);
    try {
      await request(`/training/enrollments/${enrollmentId}`, {
        method: 'PUT',
        body: { progress: nextProgress }
      });
      await loadLMSData();
    } catch (err) {
      console.error('Failed to update progress:', err);
      setError(err.message || 'Failed to update course progress.');
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleEnroll = async (courseId) => {
    setError('');
    // Find current employee id
    const enrolledList = enrollments;
    let employeeId = null;
    
    // We can fetch from logged-in employee context by registering check
    try {
      // In the backend, enrollEmployee needs an employeeId in the request body.
      // Wait, how do we get the employeeId? If we look at enrollments list, we can extract the employeeId from one of the enrollment records!
      if (enrolledList.length > 0) {
        employeeId = enrolledList[0].employeeId;
      } else {
        // Fallback: fetch general employee profile details
        const list = await request('/employees');
        const user = JSON.parse(localStorage.getItem('hireflow_user'));
        const profile = list.find(emp => emp.email.toLowerCase() === user.email.toLowerCase());
        if (profile) employeeId = profile.id;
      }

      if (!employeeId) {
        throw new Error('Employee profile ID could not be identified.');
      }

      await request('/training/enroll', {
        method: 'POST',
        body: { employeeId, courseId }
      });

      await loadLMSData();
    } catch (err) {
      console.error('Enrollment failure:', err);
      setError(err.message || 'Failed to enroll in the course.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-muted text-sm">Opening training catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-2">
          <GraduationCap className="text-indigo-400" /> LMS & Training
        </h1>
        <p className="text-muted text-sm mt-1">
          Develop your skills, complete assigned curricula, and advance your career.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2 max-w-3xl">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: My Courses and Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: My Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-outline/80 rounded-2xl p-6">
            <h3 className="font-bold text-lg text-on-surface border-b border-outline/60 pb-3 mb-6 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-400" /> My Current Courses ({enrollments.length})
            </h3>

            {enrollments.length > 0 ? (
              <div className="space-y-5">
                {enrollments.map((item) => (
                  <div key={item.id} className="card-ai p-5 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">{item.course.title}</h4>
                        <p className="text-[11px] text-muted mt-1 leading-relaxed">{item.course.description}</p>
                      </div>
                      {item.completed ? (
                        <span className="neon-badge-tertiary flex items-center gap-1 shrink-0">
                          <CheckCircle size={10} /> Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleProgressUpdate(item.id, item.progress)}
                          disabled={updateLoading === item.id}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/20 disabled:opacity-50 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1 shrink-0"
                        >
                          {updateLoading === item.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <>
                              <Play size={10} /> Study
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Progress Slider Display */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] text-muted font-bold uppercase tracking-wider">
                        <span>Course Progress</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-outline">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-500 progress-glow-primary" 
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-outline/80 rounded-2xl">
                <BookOpen size={40} className="text-on-surface-variant mx-auto mb-3" />
                <p className="text-muted text-sm font-semibold">You are not enrolled in any courses</p>
                <p className="text-muted text-xs mt-1">Enroll in courses from the catalog on the right.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: AI Recommendations & Available Courses */}
        <div className="space-y-8">
          
          {/* AI recommendations */}
          {recommendations.length > 0 && (
            <div className="card-ai p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -z-10" />
              
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-indigo-400 animate-pulse" /> AI Skill Recommendations
              </h3>

              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 hover:border-indigo-500/40 transition-colors">
                    <h5 className="font-bold text-xs text-indigo-300">{rec.courseTitle}</h5>
                    <p className="text-[10px] text-muted leading-relaxed italic">
                      "{rec.reason}"
                    </p>
                    <button
                      onClick={() => handleEnroll(rec.courseId)}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5"
                    >
                      Enroll Now &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Available Catalog */}
          <div className="glass-panel border border-outline/80 rounded-2xl p-6">
            <h3 className="font-bold text-sm text-on-surface mb-4 border-b border-outline/60 pb-3">Course Catalog</h3>

            {availableCourses.length > 0 ? (
              <div className="space-y-4">
                {availableCourses.map((course) => (
                  <div key={course.id} className="card-ai p-4 space-y-3">
                    <h4 className="font-bold text-xs text-on-surface">{course.title}</h4>
                    <p className="text-[10px] text-muted leading-relaxed line-clamp-2">{course.description}</p>
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="w-full bg-background hover:bg-indigo-600/10 border border-outline hover:border-indigo-500/20 rounded-lg py-2 text-[10px] font-bold text-white-variant hover:text-white transition-all"
                    >
                      Quick Enroll
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen size={24} className="text-on-surface mx-auto mb-2" />
                <p className="text-muted text-xs font-semibold">No new courses available</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
