import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  User,
  Plus,
  AlertCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { InterviewSlot, StudentProfile } from '../types/index.ts';

interface InterviewSchedulerViewProps {
  slots: InterviewSlot[];
  profile: StudentProfile | null;
  selectedJobIdFilter?: string;
  onBookSlot: (slotId: string) => Promise<void>;
  onCancelSlot: (slotId: string) => Promise<void>;
  userRole: 'student' | 'coordinator';
  onCreateSlotClick: () => void;
}

export const InterviewSchedulerView: React.FC<InterviewSchedulerViewProps> = ({
  slots,
  profile,
  selectedJobIdFilter,
  onBookSlot,
  onCancelSlot,
  userRole,
  onCreateSlotClick,
}) => {
  const [selectedCompany, setSelectedCompany] = useState<string>(
    selectedJobIdFilter ? 'Selected' : 'All'
  );
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
  const [cancellingSlotId, setCancellingSlotId] = useState<string | null>(null);
  const [confirmModalSlot, setConfirmModalSlot] = useState<InterviewSlot | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract unique companies
  const companies = Array.from(new Set(slots.map((s) => s.companyName)));

  const filteredSlots = slots.filter((s) => {
    if (selectedJobIdFilter && s.jobId === selectedJobIdFilter) return true;
    if (selectedCompany === 'All') return true;
    return s.companyName === selectedCompany;
  });

  const myBookedSlots = slots.filter(
    (s) => s.isBooked && s.bookedByStudentId === profile?.id
  );

  const handleConfirmBooking = async () => {
    if (!confirmModalSlot) return;
    setBookingSlotId(confirmModalSlot.id);
    setErrorMsg('');
    try {
      await onBookSlot(confirmModalSlot.id);
      setConfirmModalSlot(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Slot booking failed');
    } finally {
      setBookingSlotId(null);
    }
  };

  const handleCancelBooking = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to release this interview slot?')) return;
    setCancellingSlotId(slotId);
    try {
      await onCancelSlot(slotId);
    } finally {
      setCancellingSlotId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Interview Slot Scheduling Console
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Campus Interview Slots</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select your interview time slots for shortlisted drives. Slots are synchronized in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {userRole === 'coordinator' && (
            <button
              onClick={onCreateSlotClick}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Interview Slots</span>
            </button>
          )}

          {/* Company filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setSelectedCompany('All')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedCompany === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Companies
            </button>
            {companies.map((comp) => (
              <button
                key={comp}
                onClick={() => setSelectedCompany(comp)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedCompany === comp ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmed Interviews Reminder Strip (if any) */}
      {myBookedSlots.length > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your Confirmed Upcoming Interviews ({myBookedSlots.length})</span>
            </div>
            <span className="text-[11px] text-emerald-700">Please be ready 10 minutes prior</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myBookedSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white p-3.5 rounded-lg border border-emerald-200 shadow-xs flex flex-col justify-between text-xs space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{slot.companyName}</span>
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Reserved by You
                    </span>
                  </div>
                  <div className="text-slate-600 font-medium mt-0.5">{slot.roundName}</div>
                  <div className="text-slate-500 text-[11px] mt-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{slot.interviewerName} ({slot.interviewerRole})</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="space-y-0.5 text-slate-600">
                    <div className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{slot.date} · {slot.startTime} - {slot.endTime}</span>
                    </div>
                    {slot.roomNumber && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{slot.roomNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {slot.meetingLink && (
                      <a
                        href={slot.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <Video className="w-3 h-3" />
                        <span>Join</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleCancelBooking(slot.id)}
                      disabled={cancellingSlotId === slot.id}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium transition-colors"
                    >
                      Release
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Slots Table / Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Available Interview Timeslots ({filteredSlots.length})
          </h2>
          <span className="text-xs text-slate-500">
            Showing slots for {selectedCompany === 'All' ? 'all campus recruitment drives' : selectedCompany}
          </span>
        </div>

        {filteredSlots.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No interview slots created for this selection yet. Placement coordinators publish slots once candidate screening concludes.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSlots.map((slot) => {
              const isMine = slot.isBooked && slot.bookedByStudentId === profile?.id;
              const isUnavailable = slot.isBooked && !isMine;

              return (
                <div
                  key={slot.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isMine
                      ? 'bg-emerald-50/50'
                      : isUnavailable
                      ? 'bg-slate-50/70 opacity-60'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Left Column: Company & Round */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-slate-900 text-sm">{slot.companyName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-indigo-700">{slot.roundName}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-mono font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {slot.date}
                      </span>
                      <span className="flex items-center gap-1 font-mono font-medium text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {slot.startTime} - {slot.endTime} ({slot.durationMinutes} min)
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Interviewer: {slot.interviewerName} ({slot.interviewerRole})</span>
                      {slot.roomNumber && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {slot.roomNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Action */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {isMine ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Booked by You
                        </span>
                        <button
                          onClick={() => handleCancelBooking(slot.id)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 font-medium rounded-lg border border-slate-200 hover:bg-white transition-colors"
                        >
                          Change / Cancel
                        </button>
                      </div>
                    ) : isUnavailable ? (
                      <span className="text-xs text-slate-400 font-medium">
                        Slot Reserved
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmModalSlot(slot)}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                      >
                        Book This Slot
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModalSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Confirm Interview Slot</h3>
              <button
                onClick={() => setConfirmModalSlot(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
                <div className="font-bold text-sm text-slate-900">{confirmModalSlot.companyName}</div>
                <div className="text-slate-600">{confirmModalSlot.roundName}</div>
                <div className="font-mono text-slate-800 font-semibold pt-1">
                  {confirmModalSlot.date} · {confirmModalSlot.startTime} - {confirmModalSlot.endTime}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Evaluator: {confirmModalSlot.interviewerName}
                </div>
              </div>

              <div className="text-slate-600">
                Candidate Name: <strong>{profile?.name}</strong> ({profile?.rollNumber})<br />
                Department: {profile?.branch}
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmModalSlot(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Back
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={Boolean(bookingSlotId)}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
              >
                {bookingSlotId ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
