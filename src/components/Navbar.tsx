import React from 'react';
import { User, ShieldCheck, CloudUpload, Sparkles, Building2 } from 'lucide-react';
import { StudentProfile } from '../types/index.ts';

interface NavbarProps {
  activeTab: 'drives' | 'applications' | 'interviews' | 'resume' | 'tpo' | 'stats';
  setActiveTab: (tab: 'drives' | 'applications' | 'interviews' | 'resume' | 'tpo' | 'stats') => void;
  userRole: 'student' | 'coordinator';
  setUserRole: (role: 'student' | 'coordinator') => void;
  profile: StudentProfile | null;
  onOpenDeployModal: () => void;
  appliedCount: number;
  upcomingInterviewCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  profile,
  onOpenDeployModal,
  appliedCount,
  upcomingInterviewCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setActiveTab('drives')}
            className="flex items-center gap-2.5 text-left group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              NexPlacement
            </span>
          </button>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('drives')}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'drives'
                  ? 'text-indigo-600 font-semibold'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              Campus Drives
              {activeTab === 'drives' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`transition-colors whitespace-nowrap py-1 relative flex items-center gap-1.5 ${
                activeTab === 'applications'
                  ? 'text-indigo-600 font-semibold'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              My Applications
              {appliedCount > 0 && (
                <span className="font-mono text-xs tabular-nums text-slate-500">
                  ({appliedCount})
                </span>
              )}
              {activeTab === 'applications' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('interviews')}
              className={`transition-colors whitespace-nowrap py-1 relative flex items-center gap-1.5 ${
                activeTab === 'interviews'
                  ? 'text-indigo-600 font-semibold'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              Interview Slots
              {upcomingInterviewCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              )}
              {activeTab === 'interviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('resume')}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'resume'
                  ? 'text-indigo-600 font-semibold'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              Resume & ATS
              {activeTab === 'resume' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('tpo')}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'tpo'
                  ? 'text-indigo-600 font-semibold'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              TPO Officer Console
              {activeTab === 'tpo' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          </nav>

          {/* Zone 3: 1 primary action area */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Deploy Guide Button */}
            <button
              onClick={onOpenDeployModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
              title="Render & MongoDB Deployment Checklist"
            >
              <CloudUpload className="w-3.5 h-3.5 text-slate-600" />
              Deploy on Render
            </button>

            {/* Persona Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setUserRole('student')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  userRole === 'student'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Student</span>
              </button>
              <button
                onClick={() => {
                  setUserRole('coordinator');
                  setActiveTab('tpo');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  userRole === 'coordinator'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">TPO Officer</span>
              </button>
            </div>

            {/* Profile Avatar */}
            {profile && userRole === 'student' && (
              <div
                onClick={() => setActiveTab('resume')}
                className="cursor-pointer flex items-center gap-2 pl-1 group"
                title={`${profile.name} (${profile.rollNumber})`}
              >
                <img
                  src={profile.avatarUrl || '/src/assets/images/student_avatar_1793863944480.jpg'}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 group-hover:border-indigo-500 transition-colors"
                />
              </div>
            )}
            {userRole === 'coordinator' && (
              <div
                onClick={() => setActiveTab('tpo')}
                className="cursor-pointer flex items-center gap-2 pl-1 group"
                title="Dr. Rajesh Sharma, Placement Director"
              >
                <img
                  src="/src/assets/images/director_avatar_1793863944316.jpg"
                  alt="Placement Director"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 group-hover:border-emerald-500 transition-colors"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
