import {
  CampusDrive,
  JobApplication,
  InterviewSlot,
  StudentProfile,
  PlacementStats,
} from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Database Status
  async getDbStatus(): Promise<{
    connected: boolean;
    mode: 'mongodb' | 'in-memory';
    uriProvided: boolean;
    driver: string;
    collections: string[];
  }> {
    const res = await fetch(`${API_BASE}/db-status`);
    if (!res.ok) throw new Error('Failed to fetch DB status');
    return res.json();
  },

  // Student Profile
  async getProfile(): Promise<StudentProfile> {
    const res = await fetch(`${API_BASE}/profile`);
    if (!res.ok) throw new Error('Failed to fetch student profile');
    return res.json();
  },

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update student profile');
    return res.json();
  },

  async uploadResume(payload: {
    fileName: string;
    summary?: string;
    skills?: string[];
  }): Promise<{ success: boolean; message: string; profile: StudentProfile }> {
    const res = await fetch(`${API_BASE}/resume/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to upload resume');
    return res.json();
  },

  // Jobs / Drives
  async getJobs(params?: { search?: string; branch?: string; type?: string }): Promise<CampusDrive[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.branch) query.append('branch', params.branch);
    if (params?.type) query.append('type', params.type);

    const res = await fetch(`${API_BASE}/jobs?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch campus drives');
    return res.json();
  },

  async createJob(job: Omit<CampusDrive, 'id' | 'createdAt'>): Promise<CampusDrive> {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    if (!res.ok) throw new Error('Failed to create campus drive');
    return res.json();
  },

  async deleteJob(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete campus drive');
    return res.json();
  },

  // Applications
  async getApplications(params?: { studentId?: string; jobId?: string }): Promise<JobApplication[]> {
    const query = new URLSearchParams();
    if (params?.studentId) query.append('studentId', params.studentId);
    if (params?.jobId) query.append('jobId', params.jobId);

    const res = await fetch(`${API_BASE}/applications?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async applyToJob(payload: { jobId: string; studentId: string; notes?: string }): Promise<JobApplication> {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Application submission failed' }));
      throw new Error(err.error || 'Failed to submit application');
    }
    return res.json();
  },

  async updateApplicationStatus(id: string, updates: Partial<JobApplication>): Promise<JobApplication> {
    const res = await fetch(`${API_BASE}/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update application status');
    return res.json();
  },

  // Interview Slots
  async getInterviewSlots(params?: { jobId?: string; studentId?: string }): Promise<InterviewSlot[]> {
    const query = new URLSearchParams();
    if (params?.jobId) query.append('jobId', params.jobId);
    if (params?.studentId) query.append('studentId', params.studentId);

    const res = await fetch(`${API_BASE}/interviews/slots?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch interview slots');
    return res.json();
  },

  async createInterviewSlot(slot: Omit<InterviewSlot, 'id' | 'isBooked'>): Promise<InterviewSlot> {
    const res = await fetch(`${API_BASE}/interviews/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slot),
    });
    if (!res.ok) throw new Error('Failed to create interview slot');
    return res.json();
  },

  async bookInterviewSlot(payload: {
    slotId: string;
    studentId: string;
    studentName: string;
    studentRoll: string;
  }): Promise<{ success: boolean; slot: InterviewSlot; application?: JobApplication }> {
    const res = await fetch(`${API_BASE}/interviews/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to book slot' }));
      throw new Error(err.error || 'Failed to book interview slot');
    }
    return res.json();
  },

  async cancelInterviewSlot(slotId: string): Promise<{ success: boolean; slot: InterviewSlot }> {
    const res = await fetch(`${API_BASE}/interviews/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId }),
    });
    if (!res.ok) throw new Error('Failed to cancel slot');
    return res.json();
  },

  // Placement Statistics
  async getPlacementStats(): Promise<PlacementStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch placement statistics');
    return res.json();
  },
};
