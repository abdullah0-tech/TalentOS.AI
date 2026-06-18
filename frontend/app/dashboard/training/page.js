'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { authService } from '../../../services/auth.service';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Send, 
  Plus, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  User, 
  Percent, 
  Info,
  Check
} from 'lucide-react';

export default function TrainingPage() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [enrollEmpId, setEnrollEmpId] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');
  
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [submittingEnroll, setSubmittingEnroll] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Progress update states
  const [updatingId, setUpdatingId] = useState(null);
  const [updateVal, setUpdateVal] = useState(0);

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'progress' | 'ai_recommendations'
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected employee for AI recommendations (for admins)
  const [recEmpId, setRecEmpId] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    loadAllData(user);
  }, []);

  const loadAllData = async (user) => {
    try {
      setLoading(true);
      const coursesData = await request('/training/courses');
      setCourses(coursesData);

      const enrollmentsData = await request('/training/enrollments');
      setEnrollments(enrollmentsData);

      const userRole = user?.role ? user.role.toLowerCase() : 'member';
      if (userRole !== 'employee') {
        const empData = await request('/employees');
        setEmployees(empData);
        if (empData.length > 0) {
          setEnrollEmpId(empData[0].id);
          setRecEmpId(empData[0].id);
        }
      }

      // Fetch AI recommendations initially if employee
      if (userRole === 'employee') {
        fetchRecommendations('');
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve LMS details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (employeeId) => {
    try {
      setLoadingRecs(true);
      const q = employeeId ? `?employeeId=${employeeId}` : '';
      const data = await request(`/training/recommendations${q}`);
      setAiRecs(data.recommendations || []);
    } catch (err) {
      console.error(err);
      // Fail silently or set a small warning
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    if (recEmpId && currentUser?.role?.toLowerCase() !== 'employee') {
      fetchRecommendations(recEmpId);
    }
  }, [recEmpId]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc) {
      setError('Title and description are required.');
      return;
    }

    try {
      setSubmittingCourse(true);
      setError('');
      setSuccess('');

      await request('/training/courses', {
        method: 'POST',
        body: { title: courseTitle, description: courseDesc }
      });

      setSuccess('Training course created successfully!');
      setCourseTitle('');
      setCourseDesc('');
      
      const coursesData = await request('/training/courses');
      setCourses(coursesData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create course.');
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleEnrollSelf = async (courseId) => {
    const myProfile = employees.find(e => e.email === currentUser?.email);
    const resolvedEmpId = myProfile ? myProfile.id : null;

    if (!resolvedEmpId && !isEmployee) {
      setError('No matching employee profile found for enrollment.');
      return;
    }

    try {
      setSubmittingEnroll(true);
      setError('');
      setSuccess('');

      // If they are employee role, we can get it from backend or pass the resolved id
      // Since backend's enrollEmployee expects employeeId in body, we pass it.
      // Wait, let's find the current user's employee record. Let's make sure it's resolved.
      let targetEmpId = resolvedEmpId;
      if (isEmployee) {
        // Find by querying or fallback to the one in list
        // Let's call GET /employees to see if they can find themselves
        const emps = await request('/employees');
        const selfEmp = emps.find(e => e.email === currentUser?.email);
        if (selfEmp) {
          targetEmpId = selfEmp.id;
        } else {
          setError('Could not map authenticated user to employee context.');
          return;
        }
      }

      await request('/training/enroll', {
        method: 'POST',
        body: { employeeId: targetEmpId, courseId }
      });

      setSuccess('Successfully enrolled in course!');
      // Reload enrollments
      const enrollmentsData = await request('/training/enrollments');
      setEnrollments(enrollmentsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to enroll.');
    } finally {
      setSubmittingEnroll(false);
    }
  };

  const handleEnrollAdmin = async (e) => {
    e.preventDefault();
    if (!enrollEmpId || !enrollCourseId) {
      setError('Employee and Course selections are required.');
      return;
    }

    try {
      setSubmittingEnroll(true);
      setError('');
      setSuccess('');

      await request('/training/enroll', {
        method: 'POST',
        body: { employeeId: enrollEmpId, courseId: enrollCourseId }
      });

      setSuccess('Employee enrolled successfully!');
      
      const enrollmentsData = await request('/training/enrollments');
      setEnrollments(enrollmentsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to enroll employee.');
    } finally {
      setSubmittingEnroll(false);
    }
  };

  const handleUpdateProgress = async (enrollmentId) => {
    try {
      setUpdatingId(enrollmentId);
      setError('');
      setSuccess('');

      await request(`/training/enrollments/${enrollmentId}`, {
        method: 'PUT',
        body: { progress: updateVal }
      });

      setSuccess('Course progress updated successfully.');
      setUpdatingId(null);

      const enrollmentsData = await request('/training/enrollments');
      setEnrollments(enrollmentsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update progress.');
      setUpdatingId(null);
    }
  };

  const userRole = currentUser?.role ? currentUser.role.toLowerCase() : 'member';
  const isEmployee = userRole === 'employee';

  const myEnrollments = enrollments.filter(e => isEmployee || e.employee?.email === currentUser?.email);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
          <GraduationCap className="text-indigo-400" size={32} /> LMS / Training
        </h1>
        <p className="text-sm text-muted mt-1">Enroll in training programs, monitor course progress, and view career pathway insights.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column options - Admin Course Creator or Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Admin Course Creator Form */}
          {!isEmployee ? (
            <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="font-bold text-on-surface text-sm">Create Course Module</h3>
                <p className="text-[10px] text-muted mt-1">Create training coursework catalog items.</p>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted font-bold uppercase">Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Advanced Security compliance, Customer Relations..."
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    required
                    className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted font-bold uppercase">Course Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide overview details..."
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    required
                    className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingCourse}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
                >
                  {submittingCourse ? <Loader2 className="animate-spin" size={14} /> : <span className="flex items-center gap-1.5"><Plus size={14} /> Add Course</span>}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 text-center space-y-4">
              <GraduationCap className="mx-auto text-indigo-400 animate-pulse" size={40} />
              <div>
                <h3 className="font-bold text-on-surface text-base">Your Academy Tracker</h3>
                <p className="text-[10px] text-muted mt-1">Review assigned training modules and courses in progress.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface/40 p-4 rounded-xl border border-outline text-center">
                  <span className="text-[10px] font-bold text-muted uppercase">Courses</span>
                  <span className="text-2xl font-black text-on-surface mt-1 block">{myEnrollments.length}</span>
                </div>
                <div className="bg-surface/40 p-4 rounded-xl border border-outline text-center">
                  <span className="text-[10px] font-bold text-muted uppercase">Passed</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">
                    {myEnrollments.filter(e => e.completed).length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Enrollment Form */}
          {!isEmployee && (
            <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="font-bold text-on-surface text-sm">Enroll Staff Member</h3>
                <p className="text-[10px] text-muted mt-1">Assign coursework to employees manually.</p>
              </div>

              <form onSubmit={handleEnrollAdmin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted font-bold uppercase">Select Employee</label>
                  <select
                    value={enrollEmpId}
                    onChange={(e) => setEnrollEmpId(e.target.value)}
                    required
                    className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted font-bold uppercase">Select Course</label>
                  <select
                    value={enrollCourseId}
                    onChange={(e) => setEnrollCourseId(e.target.value)}
                    required
                    className="w-full bg-background border border-outline px-3 py-2 rounded-xl text-xs text-on-surface focus:outline-none"
                  >
                    <option value="">Select Course...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submittingEnroll}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  {submittingEnroll ? <Loader2 className="animate-spin" size={14} /> : 'Enroll Employee'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right column tab panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs header */}
          <div className="bg-background/40 border border-outline/80 rounded-xl p-1.5 flex gap-1 self-start inline-flex">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'catalog' ? 'bg-indigo-600 text-white' : 'text-muted hover:text-white'
              }`}
            >
              <BookOpen size={14} /> Course Catalog
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'progress' ? 'bg-indigo-600 text-white' : 'text-muted hover:text-white'
              }`}
            >
              <Clock size={14} /> Learning Progress
            </button>
            <button
              onClick={() => setActiveTab('ai_recommendations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'ai_recommendations' ? 'bg-indigo-600 text-white' : 'text-muted hover:text-white'
              }`}
            >
              <Sparkles size={14} className="text-amber-400" /> AI Recommendations
            </button>
          </div>

          {/* Catalog Tab */}
          {activeTab === 'catalog' && (
            <div className="bg-background/40 border border-outline/80 rounded-2xl p-6">
              <h3 className="font-bold text-on-surface text-base mb-6">LMS Course Catalog</h3>

              {courses.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-outline rounded-2xl">
                  <BookOpen className="mx-auto text-on-surface-variant mb-3" size={36} />
                  <h4 className="font-bold text-muted text-xs">No courses configured</h4>
                  <p className="text-[10px] text-muted mt-1">Create course modules using the creator form.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => {
                    const isEnrolled = enrollments.some(e => e.courseId === course.id && (isEmployee || e.employee?.email === currentUser?.email));
                    return (
                      <div 
                        key={course.id} 
                        className="p-5 bg-surface/40 border border-outline rounded-xl flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <h4 className="font-bold text-xs text-on-surface">{course.title}</h4>
                          <p className="text-[10px] text-muted leading-relaxed font-medium">{course.description}</p>
                        </div>

                        <div className="pt-2.5 border-t border-outline/60 flex items-center justify-between">
                          <span className="text-[9px] text-muted uppercase font-bold">Training Module</span>
                          {isEnrolled ? (
                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">Enrolled</span>
                          ) : (
                            <button
                              onClick={() => handleEnrollSelf(course.id)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 font-bold text-[10px] text-white rounded-lg transition"
                            >
                              Enroll
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="bg-background/40 border border-outline/80 rounded-2xl p-6">
              <h3 className="font-bold text-on-surface text-base mb-6">Learning Program Status</h3>

              {filteredEnrollmentsCount(enrollments, isEmployee, currentUser) === 0 ? (
                <div className="py-20 text-center border border-dashed border-outline rounded-2xl">
                  <Clock className="mx-auto text-on-surface-variant mb-3" size={36} />
                  <h4 className="font-bold text-muted text-xs">No active course enrollments</h4>
                  <p className="text-[10px] text-muted mt-1">Enroll in courses from the catalog tab.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrollments
                    .filter(e => isEmployee || e.employee?.email === currentUser?.email)
                    .map((ec) => (
                      <div 
                        key={ec.id} 
                        className="p-4 bg-surface/40 border border-outline hover:border-outline rounded-xl space-y-3.5 transition"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-bold text-xs text-on-surface">{ec.course?.title}</h4>
                            <p className="text-[10px] text-muted max-w-lg line-clamp-1 mt-0.5">{ec.course?.description}</p>
                          </div>
                          
                          {ec.completed ? (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                              <Check size={10} /> Passed
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-muted shrink-0">In Progress</span>
                          )}
                        </div>

                        {/* Progress slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] text-muted font-semibold">
                            <span>Status completion</span>
                            <span className="text-on-surface font-bold">{ec.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-outline">
                            <div className="h-full bg-emerald-500 transition-all duration-350" style={{ width: `${ec.progress}%` }} />
                          </div>
                        </div>

                        {/* Controls */}
                        {!ec.completed && (
                          <div className="pt-2 border-t border-outline/60 flex items-center justify-between">
                            {updatingId === ec.id ? (
                              <div className="flex items-center gap-3 w-full">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={updateVal}
                                  onChange={(e) => setUpdateVal(parseInt(e.target.value))}
                                  className="w-full accent-emerald-500"
                                />
                                <span className="text-xs font-bold text-on-surface w-10 text-right">{updateVal}%</span>
                                <button
                                  onClick={() => handleUpdateProgress(ec.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg transition"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setUpdatingId(null)}
                                  className="px-2.5 py-1 bg-surface-high hover:bg-surface-high text-muted text-[10px] rounded-lg transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setUpdatingId(ec.id);
                                  setUpdateVal(ec.progress);
                                }}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
                              >
                                <Percent size={12} /> Log Progress &rarr;
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* AI Recommendations Tab */}
          {activeTab === 'ai_recommendations' && (
            <div className="bg-background/40 border border-outline/80 rounded-2xl p-6 space-y-6">
              
              {/* Selector for Admins */}
              {!isEmployee && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline pb-4">
                  <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
                    <User size={14} /> Select Employee to fetch recommendations
                  </span>
                  <select
                    value={recEmpId}
                    onChange={(e) => setRecEmpId(e.target.value)}
                    className="bg-background border border-outline px-2.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant focus:outline-none"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                  <Sparkles className="text-amber-400 animate-spin" size={18} /> Grok AI Career Pathway Advisor
                </h3>
                <p className="text-xs text-muted mt-1">Custom recommended modules based on position, resume gap audits, and performance feedback evaluations.</p>
              </div>

              {loadingRecs ? (
                <div className="space-y-4 py-8">
                  <div className="flex items-center justify-center gap-2 text-muted text-xs">
                    <Loader2 className="animate-spin text-amber-400" size={16} />
                    <span>Grok AI compiling review data...</span>
                  </div>
                </div>
              ) : aiRecs.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-outline rounded-2xl">
                  <Sparkles className="mx-auto text-on-surface-variant mb-3" size={32} />
                  <h4 className="font-bold text-muted text-xs">No AI recommendations currently</h4>
                  <p className="text-[10px] text-muted mt-1 leading-relaxed">
                    Once performance evaluations are logged, the AI Copilot maps target learning modules.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiRecs.map((rec) => {
                    const isEnrolled = enrollments.some(e => e.courseId === rec.courseId && (isEmployee || e.employee?.email === currentUser?.email));
                    return (
                      <div 
                        key={rec.courseId} 
                        className="p-5 bg-gradient-to-br from-indigo-950/20 via-purple-950/10 to-slate-900/40 border border-indigo-500/20 rounded-2xl space-y-4 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-3">
                          <Sparkles className="text-amber-400/30" size={24} />
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-on-surface">{rec.courseTitle}</h4>
                          <p className="text-[10px] text-muted font-medium leading-normal">{rec.courseDescription}</p>
                        </div>

                        {/* Rationale explanation */}
                        <div className="p-3 bg-background/50 border border-outline/60 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">Grok Rationale</span>
                          <p className="text-[10px] text-on-surface-variant leading-relaxed font-semibold italic">"{rec.reason}"</p>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[10px] text-muted">Source: Grok Recommendation</span>
                          {isEnrolled ? (
                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">Enrolled</span>
                          ) : (
                            <button
                              onClick={() => handleEnrollSelf(rec.courseId)}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition shadow-md shadow-indigo-600/10 flex items-center gap-1"
                            >
                              <Plus size={12} /> Enroll in Recommendation
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      <div className="p-4 bg-surface/60 border border-outline rounded-xl text-[10px] text-muted flex items-start gap-2 max-w-2xl">
        <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Course completions are tracked directly on employee profiles. Completing recommended courses addresses skills alignment and promotes rapid progression tracks.
        </p>
      </div>
    </div>
  );
}

function filteredEnrollmentsCount(enrollments, isEmployee, currentUser) {
  return enrollments.filter(e => isEmployee || e.employee?.email === currentUser?.email).length;
}
