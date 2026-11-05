import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Video,
  FileCheck,
  ChevronRight,
  Award,
  AlertCircle,
  Building,
  Check,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types/index.ts';

interface ApplicationsViewProps {
  applications: JobApplication[];
  onScheduleSlot: (jobId: string) => void;
  onUpdateStatus: (applicationId: string, status: ApplicationStatus, notes?: string) => Promise<void>;
  onExploreDrives: () => void;
}

const STATUS_ORDER: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Offer Extended',
];

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  onScheduleSlot,
  onUpdateStatus,
  onExploreDrives,
}) => {
  const [filter, setFilter] = useState<'All' | 'Active' | 'Offers'>('All');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredApps = applications.filter((app) => {
    if (filter === 'Active') {
      return ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled'].includes(app.status);
    }
    if (filter === 'Offers') {
      return ['Offer Extended', 'Offer Accepted'].includes(app.status);
    }
    return true;
  });

  const handleAcceptOffer = async (app: JobApplication) => {
    if (!window.confirm(`Are you sure you want to formally accept the offer from ${app.companyName}? As per Placement Cell policy, you will be marked Placed.`)) {
      return;
    }
    setProcessingId(app.id);
    try {
      await onUpdateStatus(app.id, 'Offer Accepted', 'Offer formally accepted by candidate. Placement recorded.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Placement Cell Application Tracking System
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">My Campus Applications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time evaluation stages, book candidate interview slots, and review extended job offers.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          {(['All', 'Active', 'Offers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'All' && `All (${applications.length})`}
              {tab === 'Active' && `Active In-Progress (${applications.filter(a => ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled'].includes(a.status)).length})`}
              {tab === 'Offers' && `Offers (${applications.filter(a => ['Offer Extended', 'Offer Accepted'].includes(a.status)).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Application Cards List */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No applications in this category</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven&apos;t submitted any applications for this filter yet. Browse active placement drives and apply.
          </p>
          <button
            onClick={onExploreDrives}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Explore Active Drives
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const isOffer = app.status === 'Offer Extended' || app.status === 'Offer Accepted';
            const isInterview = app.status === 'Interview Scheduled';
            const isShortlisted = app.status === 'Shortlisted';

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row: Company, Role, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{app.companyName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-500">
                        Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">{app.jobRole}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                        app.status === 'Offer Accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'Offer Extended'
                          ? 'bg-purple-100 text-purple-800'
                          : app.status === 'Interview Scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'Shortlisted'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper Pipeline */}
                <div className="hidden md:flex items-center justify-between py-1">
                  {STATUS_ORDER.map((stage, idx) => {
                    const currentIndex = STATUS_ORDER.indexOf(app.status as any);
                    const isCompleted = currentIndex >= idx;
                    const isCurrent = app.status === stage;

                    return (
                      <React.Fragment key={stage}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCompleted
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span
                            className={`text-xs whitespace-nowrap ${
                              isCurrent
                                ? 'font-bold text-indigo-700'
                                : isCompleted
                                ? 'font-medium text-slate-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {stage}
                          </span>
                        </div>
                        {idx < STATUS_ORDER.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-3 ${
                              currentIndex > idx ? 'bg-indigo-600' : 'bg-slate-200'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Status-Specific Action Banners */}
                {/* 1. Shortlisted -> CTA to schedule slot */}
                {isShortlisted && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Congratulations! You have been shortlisted.</span>
                        <p className="text-amber-800 mt-0.5">
                          The company panel has opened interview slots. Reserve your preferred time slot before they fill up.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onScheduleSlot(app.jobId)}
                      className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Pick Interview Slot</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 2. Interview Scheduled -> Shows Meeting Link / Room & Time */}
                {isInterview && (
                  <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-700" />
                        <span>Round: {app.interviewRound || 'Technical Interview'}</span>
                      </div>
                      <div className="text-slate-700">
                        Date: <strong>{app.interviewDate || 'Upcoming'}</strong> · Time: <strong>{app.interviewTime}</strong>
                      </div>
                      <div className="text-slate-500">
                        Venue: {app.interviewLocation || 'Virtual Video Room'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.interviewMeetingLink && (
                        <a
                          href={app.interviewMeetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meeting</span>
                        </a>
                      )}
                      <button
                        onClick={() => onScheduleSlot(app.jobId)}
                        className="px-3.5 py-2 bg-white text-slate-700 border border-slate-300 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Reschedule Slot
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Offer Extended -> Package Details & Accept Button */}
                {isOffer && (
                  <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-lg space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                      <Award className="w-5 h-5 text-purple-700" />
                      <span>Formal Campus Offer Extended</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                      <div className="p-2.5 bg-white rounded-md border border-purple-100">
                        <span className="text-slate-400 block text-[11px]">CTC Package</span>
                        <span className="font-bold font-mono text-purple-900">{app.offerDetails?.ctc || '₹22.0 LPA'}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-md border border-purple-100">
                        <span className="text-slate-400 block text-[11px]">Joining Date</span>
                        <span className="font-semibold">{app.offerDetails?.joiningDate || 'July 2026'}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-md border border-purple-100">
                        <span className="text-slate-400 block text-[11px]">Location</span>
                        <span className="font-semibold">{app.offerDetails?.location || 'Bengaluru HQ'}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-md border border-purple-100">
                        <span className="text-slate-400 block text-[11px]">Acceptance Deadline</span>
                        <span className="font-mono text-amber-700 font-semibold">{app.offerDetails?.validTill || 'Nov 25, 2026'}</span>
                      </div>
                    </div>

                    {app.status === 'Offer Extended' ? (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500">
                          Placement Cell Policy: Accepting marks your placement status as Final.
                        </span>
                        <button
                          onClick={() => handleAcceptOffer(app)}
                          disabled={processingId === app.id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{processingId === app.id ? 'Accepting...' : 'Accept Campus Offer'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-800 font-semibold pt-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Offer Accepted &amp; Verified by Training &amp; Placement Office.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Evaluator Notes */}
                {app.notes && (
                  <div className="text-xs text-slate-500 pt-1">
                    <span className="font-medium text-slate-700">Coordinator Remarks: </span>
                    {app.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
