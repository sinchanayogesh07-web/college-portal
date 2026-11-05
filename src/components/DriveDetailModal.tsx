import React, { useState } from 'react';
import { X, Calendar, MapPin, Building, GraduationCap, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { CampusDrive, JobApplication, StudentProfile } from '../types/index.ts';

interface DriveDetailModalProps {
  drive: CampusDrive | null;
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile | null;
  existingApplication?: JobApplication;
  onApply: (jobId: string, notes?: string) => Promise<void>;
  onGoToInterviews?: () => void;
}

export const DriveDetailModal: React.FC<DriveDetailModalProps> = ({
  drive,
  isOpen,
  onClose,
  profile,
  existingApplication,
  onApply,
  onGoToInterviews,
}) => {
  const [candidateNotes, setCandidateNotes] = useState('');
  const [applying, setApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !drive) return null;

  const isEligibleCgpa = profile ? profile.cgpa >= drive.minCgpa : true;
  const isEligibleBranch = profile
    ? drive.eligibleBranches.some(
        (b) => b === profile.branch || b === 'All Branches' || b === 'All Circuit Branches'
      )
    : true;
  const isFullyEligible = isEligibleCgpa && isEligibleBranch;

  const handleApply = async () => {
    setApplying(true);
    setErrorMsg('');
    try {
      await onApply(drive.id, candidateNotes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const deadlineFormatted = new Date(drive.deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const driveDateFormatted = new Date(drive.driveDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mb-1">
              <span>{drive.companyName}</span>
              <span aria-hidden="true">·</span>
              <span>{drive.jobType}</span>
              <span aria-hidden="true">·</span>
              <span>{drive.workMode}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{drive.role}</h2>
            <div className="mt-2 text-sm font-semibold text-indigo-600 font-mono tabular-nums">
              {drive.ctc}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Eligibility Banner */}
          <div
            className={`p-4 rounded-lg border text-xs flex items-start gap-3 ${
              isFullyEligible
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            {isFullyEligible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-sm">
                {isFullyEligible ? 'You meet all eligibility criteria' : 'Eligibility Notice'}
              </div>
              <p className="mt-1 text-slate-600">
                Minimum CGPA required: <strong>{drive.minCgpa.toFixed(1)}</strong> (Your CGPA: <strong>{profile?.cgpa.toFixed(2)}</strong>).
                Eligible disciplines: {drive.eligibleBranches.join(', ')}.
              </p>
            </div>
          </div>

          {/* Quick Details Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Location</span>
              <div className="font-medium text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{drive.location}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Application Deadline</span>
              <div className="font-medium text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{deadlineFormatted}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Campus Drive Date</span>
              <div className="font-medium text-slate-800 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>{driveDateFormatted}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Role Overview & Responsibilities
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {drive.description}
            </p>
          </div>

          {/* Selection Rounds */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Interview & Selection Rounds
            </h3>
            <ol className="space-y-2 text-xs">
              {drive.rounds.map((round, idx) => (
                <li key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800">{round}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Application Action Section */}
          {existingApplication ? (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Application Status
                  </span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {existingApplication.status}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Submitted on {new Date(existingApplication.appliedAt).toLocaleDateString()}
                  </p>
                </div>

                {existingApplication.status === 'Shortlisted' && onGoToInterviews && (
                  <button
                    onClick={() => {
                      onClose();
                      onGoToInterviews();
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    Select Interview Slot
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">
                Optional Note to Placement Coordinator / Recruiter
              </label>
              <textarea
                value={candidateNotes}
                onChange={(e) => setCandidateNotes(e.target.value)}
                placeholder="Highlight specific relevant projects, competitive programming profiles, or certifications..."
                rows={3}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Will submit with verified profile: <strong>{profile?.resumeFileName || 'Resume.pdf'}</strong>
                </span>
                <span className="font-mono text-emerald-600 font-medium">ATS Match: {profile?.resumeAtsScore || 90}%</span>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying || !isFullyEligible}
                  className={`px-5 py-2.5 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                    !isFullyEligible
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {applying ? 'Submitting Application...' : 'Apply for Campus Drive'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
