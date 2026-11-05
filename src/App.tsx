import React, { useState, useEffect } from 'react';
import {
  CampusDrive,
  JobApplication,
  InterviewSlot,
  StudentProfile,
  PlacementStats,
  ApplicationStatus,
} from './types/index.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { DrivesView } from './components/DrivesView.tsx';
import { DriveDetailModal } from './components/DriveDetailModal.tsx';
import { ApplicationsView } from './components/ApplicationsView.tsx';
import { InterviewSchedulerView } from './components/InterviewSchedulerView.tsx';
import { ResumeView } from './components/ResumeView.tsx';
import { TpoDashboardView } from './components/TpoDashboardView.tsx';
import { RenderDeployModal } from './components/RenderDeployModal.tsx';
import { Building2, CloudUpload, GraduationCap, ShieldCheck } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [jobs, setJobs] = useState<CampusDrive[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [stats, setStats] = useState<PlacementStats | null>(null);

  const [activeTab, setActiveTab] = useState<'drives' | 'applications' | 'interviews' | 'resume' | 'tpo' | 'stats'>('drives');
  const [userRole, setUserRole] = useState<'student' | 'coordinator'>('student');
  const [selectedDriveModal, setSelectedDriveModal] = useState<CampusDrive | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [interviewJobFilter, setInterviewJobFilter] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load initial data from the Node.js backend
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [profData, jobsData, appsData, slotsData, statsData] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getJobs().catch(() => []),
        api.getApplications().catch(() => []),
        api.getInterviewSlots().catch(() => []),
        api.getPlacementStats().catch(() => null),
      ]);

      if (profData) setProfile(profData);
      setJobs(jobsData);
      setApplications(appsData);
      setSlots(slotsData);
      if (statsData) setStats(statsData);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // 1. Apply to Job
  const handleApplyToJob = async (jobId: string, notes?: string) => {
    if (!profile) return;
    const newApp = await api.applyToJob({
      jobId,
      studentId: profile.id,
      notes,
    });
    setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
    showNotification(`Application submitted for ${newApp.companyName}!`);
  };

  // 2. Book Interview Slot
  const handleBookSlot = async (slotId: string) => {
    if (!profile) return;
    const res = await api.bookInterviewSlot({
      slotId,
      studentId: profile.id,
      studentName: profile.name,
      studentRoll: profile.rollNumber,
    });

    // Update slots
    setSlots((prev) => prev.map((s) => (s.id === slotId ? res.slot : s)));

    // Update application if linked
    if (res.application) {
      setApplications((prev) =>
        prev.map((a) => (a.id === res.application!.id ? res.application! : a))
      );
    }
    showNotification(`Interview slot confirmed for ${res.slot.companyName}!`);
  };

  // 3. Cancel Interview Slot
  const handleCancelSlot = async (slotId: string) => {
    const res = await api.cancelInterviewSlot(slotId);
    setSlots((prev) => prev.map((s) => (s.id === slotId ? res.slot : s)));
    // Refresh applications to sync status
    const apps = await api.getApplications();
    setApplications(apps);
    showNotification(`Interview slot released.`);
  };

  // 4. Update Application Status (e.g. from TPO or Accept Offer)
  const handleUpdateApplicationStatus = async (
    applicationId: string,
    status: ApplicationStatus,
    notes?: string
  ) => {
    const updated = await api.updateApplicationStatus(applicationId, { status, notes });
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? updated : a)));
    showNotification(`Application updated to: ${status}`);
  };

  // 5. Post New Campus Drive (TPO)
  const handlePostDrive = async (driveData: Omit<CampusDrive, 'id' | 'createdAt'>) => {
    const newJob = await api.createJob(driveData);
    setJobs((prev) => [newJob, ...prev]);
    showNotification(`Campus recruitment drive for ${newJob.companyName} published.`);
  };

  // 6. Delete Drive (TPO)
  const handleDeleteDrive = async (id: string) => {
    await api.deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    showNotification(`Recruitment drive removed.`);
  };

  // 7. Create Interview Slot (TPO)
  const handleCreateSlot = async (slotData: Omit<InterviewSlot, 'id' | 'isBooked'>) => {
    const newSlot = await api.createInterviewSlot(slotData);
    setSlots((prev) => [...prev, newSlot]);
    showNotification(`Interview slot created for ${newSlot.companyName}.`);
  };

  // Jump from application to slot picker with filter
  const handleScheduleSlotFromApp = (jobId: string) => {
    setInterviewJobFilter(jobId);
    setActiveTab('interviews');
  };

  const upcomingInterviewsCount = slots.filter(
    (s) => s.isBooked && s.bookedByStudentId === profile?.id
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'interviews') setInterviewJobFilter(undefined);
        }}
        userRole={userRole}
        setUserRole={setUserRole}
        profile={profile}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        appliedCount={applications.length}
        upcomingInterviewCount={upcomingInterviewsCount}
      />

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Connecting to Placement Portal API...</span>
          </div>
        ) : (
          <>
            {activeTab === 'drives' && (
              <DrivesView
                jobs={jobs}
                applications={applications}
                profile={profile}
                onSelectDrive={(drive) => setSelectedDriveModal(drive)}
                onGoToInterviews={() => setActiveTab('interviews')}
              />
            )}

            {activeTab === 'applications' && (
              <ApplicationsView
                applications={applications}
                onScheduleSlot={handleScheduleSlotFromApp}
                onUpdateStatus={handleUpdateApplicationStatus}
                onExploreDrives={() => setActiveTab('drives')}
              />
            )}

            {activeTab === 'interviews' && (
              <InterviewSchedulerView
                slots={slots}
                profile={profile}
                selectedJobIdFilter={interviewJobFilter}
                onBookSlot={handleBookSlot}
                onCancelSlot={handleCancelSlot}
                userRole={userRole}
                onCreateSlotClick={() => {
                  setUserRole('coordinator');
                  setActiveTab('tpo');
                }}
              />
            )}

            {activeTab === 'resume' && (
              <ResumeView
                profile={profile}
                onProfileUpdated={(updated) => setProfile(updated)}
              />
            )}

            {activeTab === 'tpo' && (
              <TpoDashboardView
                jobs={jobs}
                applications={applications}
                slots={slots}
                stats={stats}
                onPostDrive={handlePostDrive}
                onDeleteDrive={handleDeleteDrive}
                onCreateSlot={handleCreateSlot}
                onUpdateAppStatus={handleUpdateApplicationStatus}
              />
            )}
          </>
        )}
      </main>

      {/* Campus Drive Detail Modal */}
      <DriveDetailModal
        drive={selectedDriveModal}
        isOpen={Boolean(selectedDriveModal)}
        onClose={() => setSelectedDriveModal(null)}
        profile={profile}
        existingApplication={applications.find((a) => a.jobId === selectedDriveModal?.id)}
        onApply={async (jobId, notes) => {
          await handleApplyToJob(jobId, notes);
          setSelectedDriveModal(null);
        }}
        onGoToInterviews={() => {
          if (selectedDriveModal) {
            handleScheduleSlotFromApp(selectedDriveModal.id);
          }
        }}
      />

      {/* Render & MongoDB Deployment Guide Modal */}
      <RenderDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Quiet Minimal Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">NexPlacement</span>
            <span>·</span>
            <span>University Training &amp; Placement Cell</span>
          </div>

          <div className="flex items-center gap-6 text-slate-500">
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Deploy on Render Guide</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>Node.js &amp; MongoDB Ready</span>
            <span aria-hidden="true">·</span>
            <span>Batch of 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
