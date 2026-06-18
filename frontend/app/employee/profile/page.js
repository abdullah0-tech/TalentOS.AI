'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { authService } from '../../../services/auth.service';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  UserCheck2,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;

        // Strategy 1: Fetch by employeeId if present in user context
        if (currentUser.employeeId) {
          try {
            const data = await request(`/employees/${currentUser.employeeId}`);
            setEmployee(data);
            return;
          } catch (e) {
            console.log('Fetch by ID failed, falling back to list query...');
          }
        }

        // Strategy 2: Fetch list of employees and find by email
        const list = await request('/employees');
        const profile = list.find(emp => emp.email.toLowerCase() === currentUser.email.toLowerCase());
        
        if (profile) {
          // Fetch the full details of this employee (includes onboarding, logs, etc.)
          const fullProfile = await request(`/employees/${profile.id}`);
          setEmployee(fullProfile);
        } else {
          setError('We could not locate your employee profile. Please contact HR to link your account.');
        }

      } catch (err) {
        console.error('Failed to load profile:', err);
        setError(err.message || 'Failed to retrieve profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-muted text-sm">Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-surface border border-outline rounded-2xl text-center">
        <AlertTriangle className="text-amber-500 mx-auto mb-4" size={48} />
        <h3 className="text-lg font-bold text-on-surface mb-2">Profile Not Available</h3>
        <p className="text-muted text-sm mb-4">{error || 'Unable to retrieve employee profile.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden glass-panel bg-grid-pattern border border-outline/80 rounded-3xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-white text-3xl shadow-xl shadow-indigo-500/20 shrink-0 border border-indigo-400/35">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left space-y-2">
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">{employee.name}</h1>
            <p className="text-indigo-400 font-bold text-sm tracking-wide">{employee.position}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
              <span className="neon-badge-primary">
                {employee.department}
              </span>
              <span className="neon-badge-tertiary">
                {employee.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="card-ai p-6 space-y-6">
          <h3 className="font-bold text-lg text-on-surface border-b border-outline/60 pb-3 flex items-center gap-2">
            <User size={18} className="text-indigo-400" /> Personal & Contact Info
          </h3>
          <div className="space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-bold text-on-surface mt-1">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Phone size={16} />
              </div>
              <div>
                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Phone Number</p>
                <p className="text-sm font-bold text-on-surface mt-1">{employee.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Account Security</p>
                <p className="text-sm font-bold text-on-surface mt-1">Password Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Information */}
        <div className="card-ai p-6 space-y-6">
          <h3 className="font-bold text-lg text-on-surface border-b border-outline/60 pb-3 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-400" /> Work Alignment
          </h3>
          <div className="space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
                <Briefcase size={16} />
              </div>
              <div>
                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Job Position</p>
                <p className="text-sm font-bold text-on-surface mt-1">{employee.position}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
                <Building2 size={16} />
              </div>
              <div>
                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Department</p>
                <p className="text-sm font-bold text-on-surface mt-1">{employee.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Date of Joining</p>
                <p className="text-sm font-bold text-on-surface mt-1">
                  {new Date(employee.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
