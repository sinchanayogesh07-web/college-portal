export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Offer Extended'
  | 'Offer Accepted'
  | 'Rejected';

export type JobType = 'Full Time' | 'Internship' | 'Intern + PPO';

export interface CampusDrive {
  id: string;
  companyName: string;
  companyLogo?: string;
  role: string;
  jobType: JobType;
  ctc: string; // e.g. "18.5 LPA" or "₹1,20,000 / month"
  location: string;
  eligibleBranches: string[];
  minCgpa: number;
  driveDate: string; // ISO date string
  deadline: string; // ISO date string
  description: string;
  rounds: string[];
  selectionProcess: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  openPositions: number;
  tags: string[];
  status: 'Open' | 'Closed' | 'Interviewing' | 'Completed';
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  degree: string; // e.g. "B.Tech Computer Science & Engineering"
  batch: string; // e.g. "Class of 2026"
  cgpa: number;
  backlogs: number;
  branch: string;
  avatarUrl?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  skills: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  resumeUploadedAt?: string;
  resumeAtsScore?: number;
  resumeSummary?: string;
  resumeParsedSkills?: string[];
  experience?: {
    company: string;
    role: string;
    duration: string;
    summary: string;
  }[];
  education?: {
    institution: string;
    degree: string;
    score: string;
    year: string;
  }[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  studentEmail: string;
  studentBranch: string;
  studentCgpa: number;
  jobRole: string;
  companyName: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  resumeUrl?: string;
  interviewSlotId?: string;
  interviewRound?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewMeetingLink?: string;
  interviewLocation?: string;
  offerDetails?: {
    ctc: string;
    joiningDate: string;
    location: string;
    validTill: string;
  };
}

export interface InterviewSlot {
  id: string;
  jobId: string;
  companyName: string;
  roundName: string; // e.g. "Technical Round 1", "System Design", "HR Final"
  interviewerName: string;
  interviewerRole: string;
  date: string; // e.g. "2026-11-12"
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "10:45 AM"
  durationMinutes: number;
  meetingLink: string;
  roomNumber?: string;
  isBooked: boolean;
  bookedByStudentId?: string;
  bookedByStudentName?: string;
  bookedByStudentRoll?: string;
  notes?: string;
}

export interface PlacementStats {
  totalStudents: number;
  placedStudents: number;
  placementRate: number;
  averageCtc: string;
  highestCtc: string;
  totalCompanies: number;
  activeDrives: number;
  branchStats: {
    branch: string;
    total: number;
    placed: number;
    rate: number;
    avgCtc: string;
  }[];
  upcomingInterviewsCount: number;
  offersExtendedCount: number;
}
