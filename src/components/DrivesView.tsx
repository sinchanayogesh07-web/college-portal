import React, { useState } from 'react';
import { Search, MapPin, Calendar, CheckCircle2, ChevronRight, Briefcase, Filter } from 'lucide-react';
import { CampusDrive, JobApplication, StudentProfile } from '../types/index.ts';

interface DrivesViewProps {
  jobs: CampusDrive[];
  applications: JobApplication[];
  profile: StudentProfile | null;
  onSelectDrive: (drive: CampusDrive) => void;
  onGoToInterviews: () => void;
}

export const DrivesView: React.FC<DrivesViewProps> = ({
  jobs,
  applications,
  profile,
  onSelectDrive,
  onGoToInterviews,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | 'Full Time' | 'Internship'>('All');
  const [onlyEligible, setOnlyEligible] = useState(false);

  const appliedJobIds = new Set(applications.map((a) => a.jobId));
  const applicationMap = new Map(applications.map((a) => [a.jobId, a]));

  const filteredJobs = jobs.filter((job) => {
    // Search query filter
    const matchesSearch =
      job.companyName.toLowerCase().includes(search.toLowerCase()) ||
      job.role.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase()) ||
      job.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    // Job Type filter
    const matchesType = selectedType === 'All' || job.jobType === selectedType;

    // Eligibility filter
    let matchesEligibility = true;
    if (onlyEligible && profile) {
      const meetsCgpa = profile.cgpa >= job.minCgpa;
      const meetsBranch = job.eligibleBranches.some(
        (b) => b === profile.branch || b === 'All Branches' || b === 'All Circuit Branches'
      );
      matchesEligibility = meetsCgpa && meetsBranch;
    }

    return matchesSearch && matchesType && matchesEligibility;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner Strip */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-xs">
        <img
          src="/src/assets/images/campus_tech_hub_1793863944208.jpg"
          alt="University Innovation and Career Center"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative z-10 p-6 sm:p-8 max-w-3xl">
          <div className="text-xs font-semibold tracking-wider uppercase text-indigo-300 mb-2">
            Campus Placement Season 2026 · Batch of 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
            Find Your Dream Career Opportunities
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-2xl">
            Explore verified corporate campus recruitment drives, verify eligibility cutoffs, submit your ATS-formatted resume in one click, and manage interview schedules.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-xs font-medium text-slate-300">
            <div>
              <span className="block text-slate-400">Total Active Drives</span>
              <span className="text-lg font-bold text-white font-mono tabular-nums">{jobs.length}</span>
            </div>
            <div className="h-6 w-px bg-slate-700 hidden sm:block" />
            <div>
              <span className="block text-slate-400">Your CGPA</span>
              <span className="text-lg font-bold text-white font-mono tabular-nums">{profile?.cgpa || '8.84'}</span>
            </div>
            <div className="h-6 w-px bg-slate-700 hidden sm:block" />
            <div>
              <span className="block text-slate-400">Registered Branch</span>
              <span className="text-sm font-semibold text-white truncate max-w-[200px] block">
                {profile?.branch || 'Computer Science & Engineering'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name, role, technology (e.g. Google, Cloud, React)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filter Controls (Allowed as interactive segmented buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {(['All', 'Full Time', 'Internship'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={() => setOnlyEligible(!onlyEligible)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              onlyEligible
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Eligible for Me Only</span>
          </button>
        </div>
      </div>

      {/* Job Cards Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No matching campus drives found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or toggling off the &apos;Eligible for Me Only&apos; filter to see upcoming recruitment sessions.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedType('All');
              setOnlyEligible(false);
            }}
            className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const hasApplied = appliedJobIds.has(job.id);
            const application = applicationMap.get(job.id);
            const isEligibleCgpa = profile ? profile.cgpa >= job.minCgpa : true;
            const isEligibleBranch = profile
              ? job.eligibleBranches.some(
                  (b) => b === profile.branch || b === 'All Branches' || b === 'All Circuit Branches'
                )
              : true;
            const meetsAll = isEligibleCgpa && isEligibleBranch;

            return (
              <div
                key={job.id}
                onClick={() => onSelectDrive(job)}
                className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Clean unboxed metadata header */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">{job.companyName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{job.jobType}</span>
                    </div>
                    <span className="font-mono text-slate-500">
                      Min {job.minCgpa.toFixed(1)} CGPA
                    </span>
                  </div>

                  {/* Role Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {job.role}
                  </h3>

                  {/* CTC Package */}
                  <div className="mt-2 text-sm font-semibold text-indigo-700 font-mono tabular-nums">
                    {job.ctc}
                  </div>

                  {/* Description preview */}
                  <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Key metadata line */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 truncate max-w-[150px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-slate-500 shrink-0">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Drive: {new Date(job.driveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Strip */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {hasApplied ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{application?.status || 'Applied'}</span>
                    </div>
                  ) : meetsAll ? (
                    <span className="text-xs text-slate-500 font-medium">
                      Eligible to apply
                    </span>
                  ) : (
                    <span className="text-xs text-amber-700 font-medium">
                      Criteria cutoff not met
                    </span>
                  )}

                  <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
