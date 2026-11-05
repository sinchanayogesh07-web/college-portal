import React, { useState } from 'react';
import {
  Plus,
  Building2,
  Users,
  Award,
  TrendingUp,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Video,
  ChevronDown,
  Trash2,
  Filter,
} from 'lucide-react';
import {
  CampusDrive,
  JobApplication,
  InterviewSlot,
  PlacementStats,
  ApplicationStatus,
} from '../types/index.ts';

interface TpoDashboardViewProps {
  jobs: CampusDrive[];
  applications: JobApplication[];
  slots: InterviewSlot[];
  stats: PlacementStats | null;
  onPostDrive: (drive: Omit<CampusDrive, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteDrive: (id: string) => Promise<void>;
  onCreateSlot: (slot: Omit<InterviewSlot, 'id' | 'isBooked'>) => Promise<void>;
  onUpdateAppStatus: (appId: string, status: ApplicationStatus, notes?: string) => Promise<void>;
}

export const TpoDashboardView: React.FC<TpoDashboardViewProps> = ({
  jobs,
  applications,
  slots,
  stats,
  onPostDrive,
  onDeleteDrive,
  onCreateSlot,
  onUpdateAppStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'applicants' | 'drives' | 'slots' | 'analytics'>('applicants');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('All');

  // Modals state
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  // New Drive Form
  const [driveForm, setDriveForm] = useState({
    companyName: '',
    role: '',
    jobType: 'Full Time' as any,
    ctc: '',
    location: 'Bengaluru / Hyderabad',
    minCgpa: 7.5,
    eligibleBranches: 'Computer Science & Engineering, Information Technology',
    driveDate: '2026-11-28T09:00',
    deadline: '2026-11-20T23:59',
    description: '',
    rounds: 'Online Assessment, Technical Interview 1, Technical Interview 2, HR Round',
    workMode: 'Hybrid' as any,
    openPositions: 5,
    tags: 'Tier 1 Dream, Software, Cloud',
  });

  // New Slot Form
  const [slotForm, setSlotForm] = useState({
    jobId: jobs[0]?.id || '',
    companyName: jobs[0]?.companyName || '',
    roundName: 'Technical Round 1 (DSA & Problem Solving)',
    interviewerName: 'Staff Engineering Evaluator',
    interviewerRole: 'Senior Technical Lead',
    date: '2026-11-20',
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    durationMinutes: 45,
    meetingLink: 'https://meet.google.com/xyz-campus-round',
    roomNumber: 'Interview Pod 2, Placement Center',
    notes: 'Please bring your university ID and resume.',
  });

  const filteredApplications = applications.filter((app) => {
    if (selectedJobFilter === 'All') return true;
    return app.jobId === selectedJobFilter;
  });

  const handlePostDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onPostDrive({
      companyName: driveForm.companyName,
      role: driveForm.role,
      jobType: driveForm.jobType,
      ctc: driveForm.ctc,
      location: driveForm.location,
      minCgpa: Number(driveForm.minCgpa),
      eligibleBranches: driveForm.eligibleBranches.split(',').map((b) => b.trim()),
      driveDate: new Date(driveForm.driveDate).toISOString(),
      deadline: new Date(driveForm.deadline).toISOString(),
      description: driveForm.description,
      rounds: driveForm.rounds.split(',').map((r) => r.trim()),
      selectionProcess: 'Online coding round followed by technical interviews and HR discussion.',
      workMode: driveForm.workMode,
      openPositions: Number(driveForm.openPositions),
      tags: driveForm.tags.split(',').map((t) => t.trim()),
      status: 'Open',
    });
    setIsDriveModalOpen(false);
  };

  const handleCreateSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetJob = jobs.find((j) => j.id === slotForm.jobId) || jobs[0];
    await onCreateSlot({
      ...slotForm,
      companyName: targetJob ? targetJob.companyName : slotForm.companyName,
    });
    setIsSlotModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Placement Officer Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/src/assets/images/director_avatar_1793863944316.jpg"
            alt="Director of Training & Placement"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
          />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Training &amp; Placement Office (TPO) Administration
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">Campus Recruitment Control Center</h1>
            <p className="text-xs text-slate-500">
              Coordinating placement drives, shortlisting applicants, and overseeing interview schedules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSlotModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Generate Slots</span>
          </button>
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post New Drive</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Overall Placement Rate</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {stats?.placementRate || 92}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">368 / 420 Students Placed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Average CTC Package</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {stats?.averageCtc || '16.4 LPA'}
          </div>
          <span className="text-[11px] text-slate-500">Across B.Tech / M.Tech</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Highest Campus Package</span>
          <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums mt-1">
            {stats?.highestCtc || '54.0 LPA'}
          </div>
          <span className="text-[11px] text-slate-500">International Tech Role</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Active Drives &amp; Slots</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {jobs.length} Drives · {slots.length} Slots
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">
            {slots.filter((s) => s.isBooked).length} Booked by Candidates
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'applicants' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manage Applicants ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('drives')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'drives' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Placement Drives ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'slots' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Interview Slot Directory ({slots.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Department Analytics
        </button>
      </div>

      {/* TAB 1: APPLICANTS MANAGEMENT */}
      {activeTab === 'applicants' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Filter by Company Drive:</span>
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="p-1.5 rounded-md border border-slate-300 font-medium"
              >
                <option value="All">All Companies ({applications.length})</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.companyName} ({j.role})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-slate-500">
              Showing {filteredApplications.length} student submissions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student &amp; Roll #</th>
                  <th className="py-3 px-4">Department &amp; CGPA</th>
                  <th className="py-3 px-4">Target Role &amp; Company</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Actions / Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{app.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{app.studentRoll} · {app.studentEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700">{app.studentBranch}</div>
                      <div className="font-mono text-indigo-700 font-semibold">{app.studentCgpa.toFixed(2)} CGPA</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.companyName}</div>
                      <div className="text-slate-500 text-[11px]">{app.jobRole}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          app.status === 'Offer Extended' || app.status === 'Offer Accepted'
                            ? 'bg-purple-100 text-purple-800'
                            : app.status === 'Interview Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : app.status === 'Shortlisted'
                            ? 'bg-amber-100 text-amber-800'
                            : app.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {app.status !== 'Shortlisted' && app.status !== 'Interview Scheduled' && (
                          <button
                            onClick={() =>
                              onUpdateAppStatus(
                                app.id,
                                'Shortlisted',
                                'Candidate resume approved. Shortlisted for technical evaluation.'
                              )
                            }
                            className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded font-medium border border-amber-200 transition-colors"
                          >
                            Shortlist
                          </button>
                        )}

                        {app.status !== 'Offer Extended' && app.status !== 'Offer Accepted' && (
                          <button
                            onClick={() =>
                              onUpdateAppStatus(
                                app.id,
                                'Offer Extended',
                                'Cleared all interview panels. Formal campus placement offer issued.'
                              )
                            }
                            className="px-2.5 py-1 bg-purple-50 text-purple-800 hover:bg-purple-100 rounded font-medium border border-purple-200 transition-colors"
                          >
                            Extend Offer
                          </button>
                        )}

                        {app.status !== 'Rejected' && (
                          <button
                            onClick={() =>
                              onUpdateAppStatus(app.id, 'Rejected', 'Application status updated.')
                            }
                            className="px-2 py-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
                            title="Reject candidate"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE DRIVES LIST */}
      {activeTab === 'drives' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Current Corporate Recruitment Drives</h2>
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Drive</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{job.companyName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-indigo-700 font-semibold">{job.ctc}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500">{job.jobType}</span>
                  </div>
                  <div className="text-slate-700 font-medium mt-0.5">{job.role}</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Cutoff: Min {job.minCgpa} CGPA · Branches: {job.eligibleBranches.join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete recruitment drive for ${job.companyName}?`)) {
                        onDeleteDrive(job.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTERVIEW SLOTS DIRECTORY */}
      {activeTab === 'slots' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">All Scheduled Interview Slots</h2>
            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Slot</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {slots.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{s.companyName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-700 font-medium">{s.roundName}</span>
                  </div>
                  <div className="text-slate-600 font-mono">
                    {s.date} · {s.startTime} - {s.endTime}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Evaluator: {s.interviewerName} · Venue: {s.roomNumber || 'Virtual'}
                  </div>
                </div>

                <div>
                  {s.isBooked ? (
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        Booked: {s.bookedByStudentName || 'Student'}
                      </span>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Roll: {s.bookedByStudentRoll}
                      </div>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                      Available Open Slot
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DEPARTMENT ANALYTICS */}
      {activeTab === 'analytics' && stats && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Branch-Wise Placement Breakdown</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified campus placement records for academic year 2025-2026.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Academic Discipline</th>
                  <th className="py-3 px-4">Total Eligible</th>
                  <th className="py-3 px-4">Students Placed</th>
                  <th className="py-3 px-4">Placement Rate</th>
                  <th className="py-3 px-4">Average Package</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {stats.branchStats.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-800">
                      {item.branch}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 tabular-nums">{item.total}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 tabular-nums">{item.placed}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 tabular-nums">{item.rate}%</span>
                        <div className="w-20 bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${item.rate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">{item.avgCtc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Post New Campus Drive */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Publish Campus Placement Drive</h2>
            <form onSubmit={handlePostDriveSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={driveForm.companyName}
                    onChange={(e) => setDriveForm({ ...driveForm, companyName: e.target.value })}
                    placeholder="e.g. Amazon, Oracle, Adobe"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={driveForm.role}
                    onChange={(e) => setDriveForm({ ...driveForm, role: e.target.value })}
                    placeholder="e.g. SDE 1, Data Analyst"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CTC Package</label>
                  <input
                    type="text"
                    required
                    value={driveForm.ctc}
                    onChange={(e) => setDriveForm({ ...driveForm, ctc: e.target.value })}
                    placeholder="e.g. 24.0 LPA"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    min="5.0"
                    max="10.0"
                    required
                    value={driveForm.minCgpa}
                    onChange={(e) => setDriveForm({ ...driveForm, minCgpa: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Eligible Branches (Comma-separated)</label>
                <input
                  type="text"
                  value={driveForm.eligibleBranches}
                  onChange={(e) => setDriveForm({ ...driveForm, eligibleBranches: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Description &amp; Scope</label>
                <textarea
                  required
                  rows={3}
                  value={driveForm.description}
                  onChange={(e) => setDriveForm({ ...driveForm, description: e.target.value })}
                  placeholder="Outline core expectations, technology stack, and engineering responsibilities..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Selection Rounds (Comma-separated)</label>
                <input
                  type="text"
                  value={driveForm.rounds}
                  onChange={(e) => setDriveForm({ ...driveForm, rounds: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Interview Slots */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Add Company Interview Slot</h2>
            <form onSubmit={handleCreateSlotSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Campus Drive</label>
                <select
                  value={slotForm.jobId}
                  onChange={(e) => {
                    const sel = jobs.find((j) => j.id === e.target.value);
                    setSlotForm({
                      ...slotForm,
                      jobId: e.target.value,
                      companyName: sel?.companyName || '',
                    });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.companyName} - {j.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interview Round Name</label>
                <input
                  type="text"
                  required
                  value={slotForm.roundName}
                  onChange={(e) => setSlotForm({ ...slotForm, roundName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interviewer Name</label>
                  <input
                    type="text"
                    required
                    value={slotForm.interviewerName}
                    onChange={(e) => setSlotForm({ ...slotForm, interviewerName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={slotForm.date}
                    onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                    placeholder="e.g. 10:45 AM"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Link or Room</label>
                <input
                  type="text"
                  value={slotForm.meetingLink}
                  onChange={(e) => setSlotForm({ ...slotForm, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
