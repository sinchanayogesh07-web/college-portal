import React, { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  Sparkles,
  Printer,
  Download,
  Edit3,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Code,
  Check,
  RefreshCw,
} from 'lucide-react';
import { StudentProfile } from '../types/index.ts';
import { api } from '../services/api.ts';

interface ResumeViewProps {
  profile: StudentProfile | null;
  onProfileUpdated: (updated: StudentProfile) => void;
}

export const ResumeView: React.FC<ResumeViewProps> = ({ profile, onProfileUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Edit form state
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    linkedin: profile?.linkedin || '',
    github: profile?.github || '',
    skills: profile?.skills.join(', ') || '',
    resumeSummary: profile?.resumeSummary || '',
  });

  if (!profile) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedbackMsg(null);
    try {
      const res = await api.uploadResume({
        fileName: file.name,
        summary: `Resume parsed from ${file.name}. Validated for campus placement drives with high ATS score.`,
      });
      onProfileUpdated(res.profile);
      setFeedbackMsg(`Successfully uploaded and parsed "${file.name}" with ATS score ${res.profile.resumeAtsScore}%.`);
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch {
      setFeedbackMsg('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleQuickUploadSample = async () => {
    setUploading(true);
    setFeedbackMsg(null);
    try {
      const res = await api.uploadResume({
        fileName: `Maya_Chen_Software_Engineer_2026_v2.pdf`,
        summary: 'Updated resume with completed Zepto backend internship, microservices architecture, and published college portal.',
      });
      onProfileUpdated(res.profile);
      setFeedbackMsg(`New resume version uploaded and evaluated.`);
      setTimeout(() => setFeedbackMsg(null), 5000);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile({
        name: formData.name,
        phone: formData.phone,
        linkedin: formData.linkedin,
        github: formData.github,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        resumeSummary: formData.resumeSummary,
      });
      onProfileUpdated(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Student Profile &amp; Resume Intelligence
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Verified Placement Resume</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            This resume is automatically submitted when you apply to campus drives. Keep your skills and project links updated.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Credentials'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Upload & ATS Analysis Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Box */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Upload New Resume File</span>
          </h2>
          <p className="text-xs text-slate-500">
            Supported formats: PDF, DOCX (Max 5MB). The system automatically parses your technical keywords for recruiters.
          </p>

          <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-indigo-50/30">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <FileText className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-indigo-600">
              {uploading ? 'Parsing Resume...' : 'Click to Browse File'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">or drag &amp; drop here</span>
          </label>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 truncate max-w-[170px]" title={profile.resumeFileName}>
              {profile.resumeFileName || 'Resume.pdf'}
            </span>
            <button
              onClick={handleQuickUploadSample}
              disabled={uploading}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className={`w-3 h-3 ${uploading ? 'animate-spin' : ''}`} />
              Upload Sample v2
            </button>
          </div>
        </div>

        {/* ATS Evaluation Box */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">ATS Keyword &amp; Drive Match Analysis</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">ATS Readiness:</span>
              <span className="text-base font-bold text-indigo-700 font-mono tabular-nums">
                {profile.resumeAtsScore || 92}%
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${profile.resumeAtsScore || 92}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-700 block">Matched Technical Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {(profile.resumeParsedSkills || profile.skills).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-slate-700 block">ATS Recruiter Strengths</span>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>College verified CGPA (8.84 / 10.0) format</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Action verbs &amp; quantitative metric impact in internships</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Passes Google, Atlassian &amp; Goldman Sachs standard parsers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal/Drawer */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-xl border border-indigo-200 shadow-md space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Edit Placement Profile Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile URL</label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GitHub Portfolio URL</label>
              <input
                type="text"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Skills (Comma-separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Professional Summary</label>
              <textarea
                value={formData.resumeSummary}
                onChange={(e) => setFormData({ ...formData, resumeSummary: e.target.value })}
                rows={3}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
            >
              Save Profile Updates
            </button>
          </div>
        </form>
      )}

      {/* Placement Standard Resume Preview Document */}
      <div className="bg-white rounded-xl border border-slate-300 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="text-center pb-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{profile.name}</h2>
          <div className="mt-1 text-xs text-slate-600 flex flex-wrap items-center justify-center gap-3">
            <span>Roll No: <strong className="font-mono">{profile.rollNumber}</strong></span>
            <span aria-hidden="true">·</span>
            <span>{profile.email}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.phone}</span>
          </div>
          <div className="mt-1.5 text-xs text-indigo-600 flex items-center justify-center gap-4">
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                LinkedIn
              </a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer" className="hover:underline">
                GitHub
              </a>
            )}
            {profile.portfolio && (
              <a href={profile.portfolio} target="_blank" rel="noreferrer" className="hover:underline">
                Portfolio
              </a>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-100">
            Professional Summary
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {profile.resumeSummary}
          </p>
        </div>

        {/* Education Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-100 flex items-center justify-between">
            <span>Education</span>
            <span className="text-[11px] font-normal text-slate-500 lowercase">college verified credentials</span>
          </h3>
          <div className="space-y-3">
            {profile.education?.map((edu, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{edu.institution}</div>
                  <div className="text-slate-600">{edu.degree}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold font-mono text-slate-900">{edu.score}</div>
                  <div className="text-slate-500 font-mono">{edu.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-100">
            Work Experience &amp; Technical Leadership
          </h3>
          <div className="space-y-3">
            {profile.experience?.map((exp, idx) => (
              <div key={idx} className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{exp.role} · {exp.company}</span>
                  <span className="font-mono text-slate-500">{exp.duration}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{exp.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Competencies */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-100">
            Technical Competencies &amp; Tools
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
