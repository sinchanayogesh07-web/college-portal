const content = document.querySelector('#portal-content');
const toast = document.querySelector('#toast');

const state = {
  loading: true,
  jobs: [],
  applications: [],
  slots: [],
  profile: null,
  stats: { branchStats: [] },
  activeTab: 'drives',
  userRole: 'student',
  driveSearch: '',
  driveType: 'All',
  onlyEligible: false,
  applicationFilter: 'All',
  statusStages: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Offer Extended'],
  tpoTab: 'applicants',
  applicantJobFilter: 'All',
  slotCompany: 'All',
  interviewJobFilter: null,
  notice: '',
  noticeType: 'success',
  actionBusy: false,
  modalError: '',
  formError: '',
  selectedDrive: null,
  candidateNotes: '',
  driveModalOpen: false,
  slotModalOpen: false,
  deployModalOpen: false,
  resumeUploading: false,
  resumeFeedback: '',
  editingProfile: false,
  profileForm: {},
  driveForm: {
    companyName: '',
    role: '',
    jobType: 'Full Time',
    ctc: '',
    location: 'Bengaluru / Hyderabad',
    workMode: 'Hybrid',
    minCgpa: 7.5,
    openPositions: 5,
    eligibleBranches: 'Computer Science & Engineering, Information Technology',
    deadline: '2026-11-20',
    driveDate: '2026-11-28',
    description: '',
    rounds: 'Online Assessment, Technical Interview 1, Technical Interview 2, HR Round',
    tags: 'Software, Cloud'
  },
  slotForm: {
    jobId: '',
    roundName: 'Technical Round 1',
    interviewerName: 'Staff Engineering Evaluator',
    interviewerRole: 'Senior Technical Lead',
    date: '2026-11-20',
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    durationMinutes: 45,
    meetingLink: '',
    roomNumber: ''
  }
};

const api = {
  async request(method, path, body) {
    const options = { method, headers: {} };
    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`/api${path}`, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return data;
  },
  getProfile: () => api.request('GET', '/profile'),
  updateProfile: updates => api.request('PUT', '/profile', updates),
  uploadResume: fileName => api.request('POST', '/resume/upload', { fileName }),
  getJobs: () => api.request('GET', '/jobs'),
  createJob: job => api.request('POST', '/jobs', job),
  deleteJob: id => api.request('DELETE', `/jobs/${encodeURIComponent(id)}`),
  getApplications: () => api.request('GET', '/applications'),
  applyToJob: payload => api.request('POST', '/applications', payload),
  updateApplicationStatus: (id, updates) => api.request('PATCH', `/applications/${encodeURIComponent(id)}/status`, updates),
  getInterviewSlots: () => api.request('GET', '/interviews/slots'),
  createInterviewSlot: slot => api.request('POST', '/interviews/slots', slot),
  bookInterviewSlot: payload => api.request('POST', '/interviews/book', payload),
  cancelInterviewSlot: slotId => api.request('POST', '/interviews/cancel', { slotId }),
  getPlacementStats: () => api.request('GET', '/stats')
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en', options).format(date);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.href) : '';
  } catch {
    return '';
  }
}

function externalLink(value, label) {
  const href = safeUrl(value);
  return href ? `<a href="${href}" target="_blank" rel="noopener">${label}</a>` : '';
}

function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
}

function statusClass(status) {
  if (status === 'Offer Accepted' || status === 'Open') return 'status-green';
  if (status === 'Offer Extended') return 'status-purple';
  if (status === 'Interview Scheduled' || status === 'Interviewing') return 'status-blue';
  if (status === 'Shortlisted') return 'status-amber';
  if (status === 'Rejected' || status === 'Closed') return 'status-red';
  return 'status-neutral';
}

function isEligible(job) {
  if (!job) return false;
  if (!state.profile) return true;
  const branches = job.eligibleBranches || [];
  const branchMatches = branches.includes(state.profile.branch) ||
    branches.includes('All Branches') || branches.includes('All Circuit Branches');
  return Number(state.profile.cgpa) >= Number(job.minCgpa) && branchMatches;
}

function applicationFor(jobId) {
  return state.applications.find(application => application.jobId === jobId);
}

function filteredJobs() {
  const query = state.driveSearch.trim().toLowerCase();
  return state.jobs.filter(job => {
    const searchable = [job.companyName, job.role, job.location].concat(job.tags || []).join(' ').toLowerCase();
    return searchable.includes(query) &&
      (state.driveType === 'All' || job.jobType === state.driveType) &&
      (!state.onlyEligible || isEligible(job));
  });
}

function filteredApplications() {
  return state.applications.filter(application => {
    if (state.applicationFilter === 'Active') {
      return ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled'].includes(application.status);
    }
    if (state.applicationFilter === 'Offers') {
      return ['Offer Extended', 'Offer Accepted'].includes(application.status);
    }
    return true;
  });
}

function myBookedSlots() {
  return state.slots.filter(slot => slot.isBooked && state.profile && slot.bookedByStudentId === state.profile.id);
}

function filteredSlots() {
  return state.slots.filter(slot =>
    (state.slotCompany === 'All' || slot.companyName === state.slotCompany) &&
    (!state.interviewJobFilter || slot.jobId === state.interviewJobFilter)
  );
}

function notify(message, type = 'success') {
  state.notice = message;
  state.noticeType = type;
  render();
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    state.notice = '';
    render();
  }, 4500);
}

function updateHeader() {
  document.querySelectorAll('.main-nav [data-tab]').forEach(button => {
    button.classList.toggle('active', button.dataset.tab === state.activeTab);
  });
  document.querySelector('#application-count').textContent = state.applications.length
    ? `(${state.applications.length})`
    : '';
  document.querySelector('#interview-dot').hidden = myBookedSlots().length === 0;
  document.querySelector('#tpo-navigation').hidden = state.userRole !== 'coordinator';
  document.querySelector('#student-avatar').hidden = state.userRole !== 'student' || !state.profile;
  document.querySelector('#coordinator-avatar').hidden = state.userRole !== 'coordinator';
  document.querySelectorAll('.role-switch [data-role]').forEach(button => {
    button.classList.toggle('selected', button.dataset.role === state.userRole);
  });
  if (state.profile) {
    const avatar = document.querySelector('#student-avatar');
    avatar.title = state.profile.name;
    avatar.querySelector('img').src = safeUrl(state.profile.avatarUrl) || '/images/student_avatar_1793863944480.jpg';
  }
}

function render() {
  const focusedBind = document.activeElement?.dataset.bind;
  const selectionStart = document.activeElement?.selectionStart;
  const selectionEnd = document.activeElement?.selectionEnd;

  updateHeader();
  toast.hidden = !state.notice;
  toast.textContent = state.notice;
  toast.classList.toggle('toast-error', state.noticeType === 'error');

  if (state.loading) {
    content.innerHTML = '<div class="loading-state"><span class="spinner"></span><span>Connecting to Placement Portal API...</span></div>';
  } else {
    const views = {
      drives: renderDrives,
      applications: renderApplications,
      interviews: renderInterviews,
      resume: renderResume,
      tpo: renderTpo
    };
    content.innerHTML = `${(views[state.activeTab] || renderDrives)()}${renderModals()}`;
    const meter = content.querySelector('.meter i');
    if (meter) meter.style.width = `${Number(state.profile?.resumeAtsScore || 92)}%`;
  }

  if (focusedBind) {
    const next = [...content.querySelectorAll('[data-bind]')].find(element => element.dataset.bind === focusedBind);
    if (next) {
      next.focus();
      if (typeof selectionStart === 'number' && next.setSelectionRange) {
        next.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }
}

function renderDrives() {
  const jobs = filteredJobs();
  const types = ['All', 'Full Time', 'Internship'];
  return `
    <section>
      <div class="hero">
        <img src="/images/campus_tech_hub_1793863944208.jpg" alt="" />
        <div class="hero-content">
          <p class="eyebrow">Campus Placement Season 2026 · Batch of 2026</p>
          <h1>Find your dream career opportunities</h1>
          <p class="hero-copy">Explore verified campus recruitment drives, check eligibility, apply with your resume, and manage interview schedules.</p>
          <div class="hero-stats">
            <div><span>Total active drives</span><strong>${state.jobs.length}</strong></div>
            <div><span>Your CGPA</span><strong>${escapeHtml(state.profile?.cgpa || '—')}</strong></div>
            <div><span>Registered branch</span><strong>${escapeHtml(state.profile?.branch || '—')}</strong></div>
          </div>
        </div>
      </div>
      <div class="filter-panel">
        <input class="search-input" type="search" data-bind="driveSearch" value="${escapeHtml(state.driveSearch)}" placeholder="Search company, role, location, or skill..." aria-label="Search campus drives" />
        <div class="segmented">${types.map(type => `<button class="${state.driveType === type ? 'selected' : ''}" data-action="drive-type" data-value="${escapeHtml(type)}">${escapeHtml(type)}</button>`).join('')}</div>
        <label class="check-filter"><input type="checkbox" data-bind="onlyEligible" ${state.onlyEligible ? 'checked' : ''} /> Eligible for me</label>
      </div>
      ${jobs.length ? `<div class="card-grid">${jobs.map(renderDriveCard).join('')}</div>` : `
        <div class="empty-state"><h2>No matching campus drives found</h2><p>Try changing your search or eligibility filters.</p>
          <button class="button button-primary" data-action="reset-drive-filters">Reset filters</button>
        </div>`}
    </section>`;
}

function renderDriveCard(job) {
  const application = applicationFor(job.id);
  return `
    <article class="drive-card" data-action="open-drive" data-id="${escapeHtml(job.id)}" tabindex="0" role="button">
      <div class="card-heading"><span class="company-mark">${escapeHtml(initials(job.companyName))}</span><span class="status-pill ${statusClass(job.status)}">${escapeHtml(job.status)}</span></div>
      <p class="company-name">${escapeHtml(job.companyName)}</p>
      <h2>${escapeHtml(job.role)}</h2>
      <p class="muted">${escapeHtml(job.jobType)} · ${escapeHtml(job.workMode)}</p>
      <div class="drive-facts">
        <span><b>Package</b>${escapeHtml(job.ctc)}</span><span><b>Location</b>${escapeHtml(job.location)}</span>
        <span><b>Min. CGPA</b>${escapeHtml(job.minCgpa)}</span><span><b>Deadline</b>${formatDate(job.deadline)}</span>
      </div>
      <div class="tag-list">${(job.tags || []).slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      <div class="card-footer">
        ${application
          ? `<span class="status-text">Applied · ${escapeHtml(application.status)}</span>`
          : `<span class="${isEligible(job) ? '' : 'eligibility-warning'}">${isEligible(job) ? 'Eligible to apply' : 'Check eligibility'}</span>`}
        <span class="text-link">View details →</span>
      </div>
    </article>`;
}

function renderApplications() {
  const filters = ['All', 'Active', 'Offers'];
  const applications = filteredApplications();
  return `
    <section>
      <div class="section-header">
        <div><p class="eyebrow">Placement Cell Application Tracking System</p><h1>My campus applications</h1><p class="muted">Monitor evaluation stages, schedule interviews, and review job offers.</p></div>
        <div class="segmented">${filters.map(filter => `<button class="${state.applicationFilter === filter ? 'selected' : ''}" data-action="application-filter" data-value="${filter}">${filter} <span>(${applicationCount(filter)})</span></button>`).join('')}</div>
      </div>
      ${applications.length ? applications.map(renderApplication).join('') : `
        <div class="empty-state"><h2>No applications in this category</h2><p>Browse active placement drives and apply to get started.</p>
          <button class="button button-primary" data-action="navigate" data-tab="drives">Explore active drives</button>
        </div>`}
    </section>`;
}

function applicationCount(filter) {
  if (filter === 'Active') return state.applications.filter(item => ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled'].includes(item.status)).length;
  if (filter === 'Offers') return state.applications.filter(item => ['Offer Extended', 'Offer Accepted'].includes(item.status)).length;
  return state.applications.length;
}

function renderApplication(application) {
  const stage = state.statusStages.indexOf(application.status);
  return `
    <article class="application-card">
      <div class="application-heading">
        <div><p class="company-name">${escapeHtml(application.companyName)} <span class="muted">· Applied ${formatDate(application.appliedAt)}</span></p><h2>${escapeHtml(application.jobRole)}</h2></div>
        <span class="status-pill ${statusClass(application.status)}">${escapeHtml(application.status)}</span>
      </div>
      <div class="progress-track">${state.statusStages.map((label, index) => `
        <div class="progress-stage"><span class="stage-dot ${stage >= index ? 'complete' : ''}">${index + 1}</span><span>${label}</span></div>`).join('')}
      </div>
      ${application.interviewDate || application.offerDetails ? `<div class="application-details">
        ${application.interviewDate ? `<span>Interview: ${formatDate(application.interviewDate)} ${escapeHtml(application.interviewTime)} ${externalLink(application.interviewMeetingLink, 'Join meeting')}</span>` : ''}
        ${application.offerDetails ? `<span>Offer: ${escapeHtml(application.offerDetails.ctc)} · joining ${formatDate(application.offerDetails.joiningDate)}</span>` : ''}
      </div>` : ''}
      <div class="card-actions">
        ${application.status === 'Shortlisted' ? `<button class="button button-muted" data-action="schedule-interview" data-id="${escapeHtml(application.jobId)}">Choose interview slot</button>` : ''}
        ${application.status === 'Offer Extended' ? `<button class="button button-primary" data-action="accept-offer" data-id="${escapeHtml(application.id)}">Accept offer</button>` : ''}
      </div>
    </article>`;
}

function renderInterviews() {
  const booked = myBookedSlots();
  const slots = filteredSlots();
  const companies = [...new Set(state.slots.map(slot => slot.companyName))];
  return `
    <section>
      <div class="section-header"><div><p class="eyebrow">Interview Slot Scheduling Console</p><h1>Campus interview slots</h1><p class="muted">Select interview times for shortlisted drives. Slots are synchronized with the placement office.</p></div></div>
      ${booked.length ? `<div class="notice-panel success-panel"><h2>Your confirmed interviews (${booked.length})</h2>${booked.map(slot => `
        <article class="slot-card"><div><strong>${escapeHtml(slot.companyName)} · ${escapeHtml(slot.roundName)}</strong><p>${formatDate(slot.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · ${escapeHtml(slot.startTime)}–${escapeHtml(slot.endTime)}</p><p>${escapeHtml(slot.interviewerName)} · ${escapeHtml(slot.roomNumber)}</p></div>
          <div class="card-actions">${externalLink(slot.meetingLink, 'Join meeting') ? `<a class="button button-primary" href="${safeUrl(slot.meetingLink)}" target="_blank" rel="noopener">Join meeting</a>` : ''}<button class="button button-muted" data-action="cancel-slot" data-id="${escapeHtml(slot.id)}">Release slot</button></div>
        </article>`).join('')}</div>` : ''}
      <div class="filter-panel">
        <label class="field-inline">Company<select data-bind="slotCompany"><option value="All">All companies</option>${companies.map(company => `<option value="${escapeHtml(company)}" ${state.slotCompany === company ? 'selected' : ''}>${escapeHtml(company)}</option>`).join('')}</select></label>
        ${state.userRole === 'coordinator' ? '<button class="button button-primary" data-action="navigate" data-tab="tpo">Create interview slots</button>' : ''}
      </div>
      ${slots.length ? slots.map(slot => `
        <article class="slot-card">
          <div><p class="company-name">${escapeHtml(slot.companyName)} · ${escapeHtml(slot.roundName)}</p><h2>${formatDate(slot.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · ${escapeHtml(slot.startTime)}–${escapeHtml(slot.endTime)}</h2>
            <p class="muted">${escapeHtml(slot.durationMinutes)} min · ${escapeHtml(slot.interviewerName)} (${escapeHtml(slot.interviewerRole)}) ${slot.roomNumber ? `· ${escapeHtml(slot.roomNumber)}` : ''}</p>
          </div>
          ${slot.isBooked
            ? `<span class="${slot.bookedByStudentId === state.profile?.id ? 'status-text' : 'muted'}">${slot.bookedByStudentId === state.profile?.id ? 'Booked by you' : 'Reserved'}</span>`
            : `<button class="button button-primary" data-action="book-slot" data-id="${escapeHtml(slot.id)}">Book this slot</button>`}
        </article>`).join('') : '<div class="empty-state"><h2>No interview slots available</h2><p>Placement coordinators publish slots once candidate screening concludes.</p></div>'}
    </section>`;
}

function renderResume() {
  const profile = state.profile;
  if (!profile) {
    return '<section class="empty-state"><h2>Student profile unavailable</h2><p>Check the API connection and retry.</p><button class="button button-primary" data-action="reload">Retry</button></section>';
  }
  return `
    <section>
      <div class="section-header"><div><p class="eyebrow">Student Profile &amp; Resume Intelligence</p><h1>Verified placement resume</h1><p class="muted">Keep your profile and resume details updated for campus applications.</p></div>
        <div class="card-actions"><button class="button button-muted" data-action="toggle-profile-edit">${state.editingProfile ? 'Cancel editing' : 'Edit credentials'}</button><button class="button button-primary" data-action="print-resume">Print / Save PDF</button></div>
      </div>
      <div class="resume-grid">
        <section class="panel">
          <h2>Upload new resume</h2><p class="muted">PDF or DOC/DOCX. The portal records the uploaded filename and updates ATS analysis.</p>
          <label class="upload-box"><input type="file" accept=".pdf,.doc,.docx" data-action="upload-resume" ${state.resumeUploading ? 'disabled' : ''} /><strong>${state.resumeUploading ? 'Uploading…' : 'Choose a resume file'}</strong><span>${escapeHtml(profile.resumeFileName || 'No resume uploaded')}</span></label>
          ${state.resumeFeedback ? `<p class="feedback">${escapeHtml(state.resumeFeedback)}</p>` : ''}
          <div class="score-card"><span>ATS readiness</span><strong>${escapeHtml(profile.resumeAtsScore || 92)}%</strong><div class="meter"><i></i></div></div>
          <h3>Detected skills</h3><div class="tag-list">${(profile.resumeParsedSkills || []).map(skill => `<span class="tag">${escapeHtml(skill)}</span>`).join('')}</div>
        </section>
        ${state.editingProfile ? renderProfileForm() : renderProfileDetails(profile)}
      </div>
    </section>`;
}

function renderProfileDetails(profile) {
  const experience = (profile.experience || []).map(item => `
    <div class="resume-item"><strong>${escapeHtml(item.role)} · ${escapeHtml(item.company)}</strong><span>${escapeHtml(item.duration)}</span><p>${escapeHtml(item.summary)}</p></div>`).join('');
  const education = (profile.education || []).map(item => `
    <div class="resume-item"><strong>${escapeHtml(item.degree)}</strong><span>${escapeHtml(item.institution)} · ${escapeHtml(item.year)} · ${escapeHtml(item.score)}</span></div>`).join('');
  return `
    <section class="panel">
      <h2>${escapeHtml(profile.name)}</h2><p>${escapeHtml(profile.degree)} · ${escapeHtml(profile.batch)}</p><p>${escapeHtml(profile.email)} · ${escapeHtml(profile.phone)}</p><p>${escapeHtml(profile.branch)} · CGPA ${escapeHtml(profile.cgpa)}</p>
      <p class="resume-summary">${escapeHtml(profile.resumeSummary)}</p>
      <h3>Skills</h3><div class="tag-list">${(profile.skills || []).map(skill => `<span class="tag">${escapeHtml(skill)}</span>`).join('')}</div>
      <div class="link-list">${externalLink(profile.linkedin, 'LinkedIn')}${externalLink(profile.github, 'GitHub')}${externalLink(profile.portfolio, 'Portfolio')}</div>
      <h3>Experience</h3>${experience}
      <h3>Education</h3>${education}
    </section>`;
}

function renderProfileForm() {
  const fields = state.profileForm;
  return `
    <form class="panel form-stack" data-form="profile">
      <h2>Edit profile and resume details</h2>
      <label>Full name<input data-bind="profileForm.name" value="${escapeHtml(fields.name)}" required /></label>
      <label>Phone<input data-bind="profileForm.phone" value="${escapeHtml(fields.phone)}" /></label>
      <label>LinkedIn URL<input data-bind="profileForm.linkedin" type="url" value="${escapeHtml(fields.linkedin)}" /></label>
      <label>GitHub URL<input data-bind="profileForm.github" type="url" value="${escapeHtml(fields.github)}" /></label>
      <label>Skills (comma-separated)<input data-bind="profileForm.skills" value="${escapeHtml(fields.skills)}" /></label>
      <label>Resume summary<textarea data-bind="profileForm.resumeSummary" rows="4">${escapeHtml(fields.resumeSummary)}</textarea></label>
      <button class="button button-primary" type="submit">Save profile</button>
    </form>`;
}

function renderTpo() {
  const stats = state.stats || {};
  const tabs = [
    { id: 'applicants', label: 'Manage applicants' },
    { id: 'drives', label: 'Placement drives' },
    { id: 'slots', label: 'Interview slots' },
    { id: 'analytics', label: 'Department analytics' }
  ];
  return `
    <section>
      <div class="section-header">
        <div class="director-heading"><img src="/images/director_avatar_1793863944316.jpg" alt="" /><div><p class="eyebrow">Training &amp; Placement Office Administration</p><h1>Campus recruitment control center</h1><p class="muted">Coordinate placement drives, review applicants, and oversee interview schedules.</p></div></div>
        <div class="card-actions"><button class="button button-muted" data-action="open-slot-form">Generate slots</button><button class="button button-primary" data-action="open-drive-form">Post new drive</button></div>
      </div>
      <div class="kpi-grid">
        <div class="kpi-card"><span>Placement rate</span><strong>${escapeHtml(stats.placementRate || 92)}%</strong><small>${escapeHtml(stats.placedStudents || 368)} students placed</small></div>
        <div class="kpi-card"><span>Average CTC</span><strong>${escapeHtml(stats.averageCtc || '16.4 LPA')}</strong><small>Across all programs</small></div>
        <div class="kpi-card"><span>Highest package</span><strong>${escapeHtml(stats.highestCtc || '54.0 LPA')}</strong><small>Campus recruitment</small></div>
        <div class="kpi-card"><span>Drives · interview slots</span><strong>${state.jobs.length} · ${state.slots.length}</strong><small>${state.slots.filter(slot => slot.isBooked).length} booked</small></div>
      </div>
      <div class="segmented tpo-tabs">${tabs.map(tab => `<button class="${state.tpoTab === tab.id ? 'selected' : ''}" data-action="tpo-tab" data-value="${tab.id}">${tab.label}</button>`).join('')}</div>
      ${renderTpoPanel()}
    </section>`;
}

function renderTpoPanel() {
  if (state.tpoTab === 'applicants') {
    const applicants = state.applications.filter(application => state.applicantJobFilter === 'All' || application.jobId === state.applicantJobFilter);
    return `
      <section class="panel table-panel">
        <div class="panel-toolbar"><h2>Manage applicants</h2><select data-bind="applicantJobFilter"><option value="All">All companies</option>${state.jobs.map(job => `<option value="${escapeHtml(job.id)}" ${state.applicantJobFilter === job.id ? 'selected' : ''}>${escapeHtml(job.companyName)} · ${escapeHtml(job.role)}</option>`).join('')}</select></div>
        <div class="table-wrap"><table><thead><tr><th>Student</th><th>Department · CGPA</th><th>Company · role</th><th>Status</th><th>Decision</th></tr></thead><tbody>
          ${applicants.map(application => `<tr><td><strong>${escapeHtml(application.studentName)}</strong><small>${escapeHtml(application.studentRoll)} · ${escapeHtml(application.studentEmail)}</small></td>
            <td>${escapeHtml(application.studentBranch)}<small>${escapeHtml(application.studentCgpa)} CGPA</small></td><td>${escapeHtml(application.companyName)}<small>${escapeHtml(application.jobRole)}</small></td>
            <td><span class="status-pill ${statusClass(application.status)}">${escapeHtml(application.status)}</span></td><td class="table-actions">
              ${!['Shortlisted', 'Interview Scheduled'].includes(application.status) ? `<button class="text-button" data-action="update-status" data-id="${escapeHtml(application.id)}" data-status="Shortlisted">Shortlist</button>` : ''}
              ${!['Offer Extended', 'Offer Accepted'].includes(application.status) ? `<button class="text-button purple-text" data-action="update-status" data-id="${escapeHtml(application.id)}" data-status="Offer Extended">Extend offer</button>` : ''}
              ${application.status !== 'Rejected' ? `<button class="text-button danger-text" data-action="update-status" data-id="${escapeHtml(application.id)}" data-status="Rejected">Reject</button>` : ''}
            </td></tr>`).join('')}
        </tbody></table></div>${applicants.length ? '' : '<p class="muted">No applicants for this drive yet.</p>'}
      </section>`;
  }
  if (state.tpoTab === 'drives') {
    return `
      <section class="panel table-panel"><div class="panel-toolbar"><h2>Campus drives</h2><button class="button button-primary" data-action="open-drive-form">Post drive</button></div>
        <div class="table-wrap"><table><thead><tr><th>Company</th><th>Role</th><th>Package</th><th>Deadline</th><th>Status</th><th></th></tr></thead><tbody>
          ${state.jobs.map(job => `<tr><td>${escapeHtml(job.companyName)}</td><td>${escapeHtml(job.role)}</td><td>${escapeHtml(job.ctc)}</td><td>${formatDate(job.deadline)}</td><td>${escapeHtml(job.status)}</td><td><button class="text-button danger-text" data-action="delete-drive" data-id="${escapeHtml(job.id)}">Remove</button></td></tr>`).join('')}
        </tbody></table></div></section>`;
  }
  if (state.tpoTab === 'slots') {
    return `
      <section class="panel table-panel"><div class="panel-toolbar"><h2>Interview slot directory</h2><button class="button button-primary" data-action="open-slot-form">Create slot</button></div>
        <div class="table-wrap"><table><thead><tr><th>Company · round</th><th>Date · time</th><th>Interviewer</th><th>Reservation</th></tr></thead><tbody>
          ${state.slots.map(slot => `<tr><td>${escapeHtml(slot.companyName)}<small>${escapeHtml(slot.roundName)}</small></td><td>${formatDate(slot.date)} · ${escapeHtml(slot.startTime)}–${escapeHtml(slot.endTime)}</td><td>${escapeHtml(slot.interviewerName)}</td><td>${escapeHtml(slot.isBooked ? slot.bookedByStudentName : 'Available')}</td></tr>`).join('')}
        </tbody></table></div></section>`;
  }
  const branches = state.stats.branchStats || [];
  return `
    <section class="panel table-panel"><h2>Department analytics</h2><div class="table-wrap"><table><thead><tr><th>Branch</th><th>Eligible</th><th>Placed</th><th>Placement rate</th><th>Average CTC</th></tr></thead><tbody>
      ${branches.map(branch => `<tr><td>${escapeHtml(branch.branch)}</td><td>${escapeHtml(branch.total)}</td><td>${escapeHtml(branch.placed)}</td><td>${escapeHtml(branch.rate)}%</td><td>${escapeHtml(branch.avgCtc)}</td></tr>`).join('')}
    </tbody></table></div>${branches.length ? '' : '<p class="muted">Branch analytics are not available yet.</p>'}</section>`;
}

function renderModals() {
  return `${state.selectedDrive ? renderDriveModal() : ''}${state.driveModalOpen ? renderDriveFormModal() : ''}${state.slotModalOpen ? renderSlotFormModal() : ''}${state.deployModalOpen ? renderDeployModal() : ''}`;
}

function renderDriveModal() {
  const job = state.selectedDrive;
  const application = applicationFor(job.id);
  const eligible = isEligible(job);
  return `
    <div class="modal-backdrop" data-backdrop="drive">
      <section class="modal drive-modal" role="dialog" aria-modal="true" aria-labelledby="drive-title">
        <div class="modal-heading"><div><p class="eyebrow">${escapeHtml(job.companyName)} · ${escapeHtml(job.jobType)} · ${escapeHtml(job.workMode)}</p><h2 id="drive-title">${escapeHtml(job.role)}</h2><strong class="package-text">${escapeHtml(job.ctc)}</strong></div><button class="close-button" data-action="close-modal" aria-label="Close">×</button></div>
        <div class="modal-content">
          <div class="notice-panel ${eligible ? 'success-panel' : 'warning-panel'}">${eligible ? 'You meet the eligibility criteria.' : 'You do not currently meet all eligibility criteria.'} Minimum CGPA: ${escapeHtml(job.minCgpa)} · Your CGPA: ${escapeHtml(state.profile?.cgpa)} · Eligible branches: ${escapeHtml((job.eligibleBranches || []).join(', '))}</div>
          <div class="detail-grid"><div><small>Location</small><strong>${escapeHtml(job.location)}</strong></div><div><small>Application deadline</small><strong>${formatDate(job.deadline)}</strong></div><div><small>Campus drive date</small><strong>${formatDate(job.driveDate)}</strong></div><div><small>Open positions</small><strong>${escapeHtml(job.openPositions)}</strong></div></div>
          <h3>Role overview</h3><p>${escapeHtml(job.description)}</p><h3>Selection rounds</h3><ol class="round-list">${(job.rounds || []).map(round => `<li>${escapeHtml(round)}</li>`).join('')}</ol>
          ${application ? `<div class="notice-panel">Application status: <strong>${escapeHtml(application.status)}</strong></div>` : `
            <form class="form-stack" data-form="apply"><label>Optional note to the placement coordinator<textarea data-bind="candidateNotes" rows="3" placeholder="Highlight relevant projects, skills, or certifications">${escapeHtml(state.candidateNotes)}</textarea></label>
              <p class="muted">Resume: ${escapeHtml(state.profile?.resumeFileName || 'Resume.pdf')} · ATS match: ${escapeHtml(state.profile?.resumeAtsScore || 90)}%</p>
              ${state.modalError ? `<p class="error-text">${escapeHtml(state.modalError)}</p>` : ''}
              <div class="card-actions"><button type="button" class="button button-muted" data-action="close-modal">Cancel</button><button type="submit" class="button button-primary" ${state.actionBusy || !state.profile || !eligible ? 'disabled' : ''}>${state.actionBusy ? 'Submitting…' : 'Apply for campus drive'}</button></div>
            </form>`}
        </div>
      </section>
    </div>`;
}

function renderDriveFormModal() {
  const form = state.driveForm;
  return `
    <div class="modal-backdrop" data-backdrop="drive-form"><form class="modal form-stack" data-form="drive">
      <div class="modal-heading"><h2>Publish campus placement drive</h2><button type="button" class="close-button" data-action="close-modal">×</button></div>
      <label>Company name<input data-bind="driveForm.companyName" value="${escapeHtml(form.companyName)}" required /></label>
      <label>Role title<input data-bind="driveForm.role" value="${escapeHtml(form.role)}" required /></label>
      <div class="form-row"><label>Job type<select data-bind="driveForm.jobType"><option ${form.jobType === 'Full Time' ? 'selected' : ''}>Full Time</option><option ${form.jobType === 'Internship' ? 'selected' : ''}>Internship</option><option ${form.jobType === 'Intern + PPO' ? 'selected' : ''}>Intern + PPO</option></select></label><label>CTC package<input data-bind="driveForm.ctc" value="${escapeHtml(form.ctc)}" required /></label></div>
      <div class="form-row"><label>Location<input data-bind="driveForm.location" value="${escapeHtml(form.location)}" required /></label><label>Work mode<select data-bind="driveForm.workMode"><option ${form.workMode === 'On-site' ? 'selected' : ''}>On-site</option><option ${form.workMode === 'Hybrid' ? 'selected' : ''}>Hybrid</option><option ${form.workMode === 'Remote' ? 'selected' : ''}>Remote</option></select></label></div>
      <div class="form-row"><label>Minimum CGPA<input type="number" step="0.1" min="0" max="10" data-bind="driveForm.minCgpa" value="${escapeHtml(form.minCgpa)}" required /></label><label>Open positions<input type="number" min="1" data-bind="driveForm.openPositions" value="${escapeHtml(form.openPositions)}" required /></label></div>
      <label>Eligible branches (comma-separated)<input data-bind="driveForm.eligibleBranches" value="${escapeHtml(form.eligibleBranches)}" required /></label>
      <div class="form-row"><label>Application deadline<input type="date" data-bind="driveForm.deadline" value="${escapeHtml(form.deadline)}" required /></label><label>Drive date<input type="date" data-bind="driveForm.driveDate" value="${escapeHtml(form.driveDate)}" required /></label></div>
      <label>Job description<textarea data-bind="driveForm.description" rows="3" required>${escapeHtml(form.description)}</textarea></label>
      <label>Selection rounds (comma-separated)<input data-bind="driveForm.rounds" value="${escapeHtml(form.rounds)}" required /></label>
      <label>Tags (comma-separated)<input data-bind="driveForm.tags" value="${escapeHtml(form.tags)}" /></label>
      ${state.formError ? `<p class="error-text">${escapeHtml(state.formError)}</p>` : ''}
      <div class="card-actions"><button type="button" class="button button-muted" data-action="close-modal">Cancel</button><button type="submit" class="button button-primary" ${state.actionBusy ? 'disabled' : ''}>Publish drive</button></div>
    </form></div>`;
}

function renderSlotFormModal() {
  const form = state.slotForm;
  return `
    <div class="modal-backdrop" data-backdrop="slot-form"><form class="modal form-stack" data-form="slot">
      <div class="modal-heading"><h2>Create interview slot</h2><button type="button" class="close-button" data-action="close-modal">×</button></div>
      <label>Campus drive<select data-bind="slotForm.jobId" required>${state.jobs.map(job => `<option value="${escapeHtml(job.id)}" ${form.jobId === job.id ? 'selected' : ''}>${escapeHtml(job.companyName)} · ${escapeHtml(job.role)}</option>`).join('')}</select></label>
      <label>Interview round<input data-bind="slotForm.roundName" value="${escapeHtml(form.roundName)}" required /></label>
      <label>Interviewer<input data-bind="slotForm.interviewerName" value="${escapeHtml(form.interviewerName)}" required /></label>
      <label>Interviewer role<input data-bind="slotForm.interviewerRole" value="${escapeHtml(form.interviewerRole)}" required /></label>
      <div class="form-row"><label>Date<input type="date" data-bind="slotForm.date" value="${escapeHtml(form.date)}" required /></label><label>Duration (minutes)<input type="number" min="1" data-bind="slotForm.durationMinutes" value="${escapeHtml(form.durationMinutes)}" required /></label></div>
      <div class="form-row"><label>Start time<input data-bind="slotForm.startTime" value="${escapeHtml(form.startTime)}" placeholder="10:00 AM" required /></label><label>End time<input data-bind="slotForm.endTime" value="${escapeHtml(form.endTime)}" placeholder="10:45 AM" required /></label></div>
      <label>Meeting link<input type="url" data-bind="slotForm.meetingLink" value="${escapeHtml(form.meetingLink)}" /></label><label>Room / location<input data-bind="slotForm.roomNumber" value="${escapeHtml(form.roomNumber)}" /></label>
      ${state.formError ? `<p class="error-text">${escapeHtml(state.formError)}</p>` : ''}
      <div class="card-actions"><button type="button" class="button button-muted" data-action="close-modal">Cancel</button><button type="submit" class="button button-primary" ${state.actionBusy || !state.jobs.length ? 'disabled' : ''}>Create slot</button></div>
    </form></div>`;
}

function renderDeployModal() {
  return `
    <div class="modal-backdrop" data-backdrop="deploy"><section class="modal" role="dialog" aria-modal="true">
      <div class="modal-heading"><h2>Deploy NexPlacement</h2><button class="close-button" data-action="close-modal">×</button></div>
      <div class="modal-content"><p>Deploy the Node.js service on Render and configure a MongoDB connection for persistent placement data.</p><ol><li>Add <code>MONGODB_URI</code> as a Render environment variable.</li><li>Set the service start command to <code>npm start</code>.</li><li>Confirm the health check at <code>/api/health</code>.</li></ol></div>
    </section></div>`;
}

async function loadResource(request, key, fallback) {
  try {
    const value = await request();
    state[key] = value == null ? fallback : value;
  } catch (error) {
    console.error(`Unable to load ${key}.`, error);
    state[key] = fallback;
    notify(`Unable to load ${key}. ${error.message || 'Check the API connection and retry.'}`, 'error');
  }
}

async function loadAllData() {
  state.loading = true;
  render();
  await Promise.all([
    loadResource(api.getProfile, 'profile', null),
    loadResource(api.getJobs, 'jobs', []),
    loadResource(api.getApplications, 'applications', []),
    loadResource(api.getInterviewSlots, 'slots', []),
    loadResource(api.getPlacementStats, 'stats', { branchStats: [] })
  ]);
  state.loading = false;
  render();
}

function setTab(tab) {
  state.activeTab = tab;
  if (tab !== 'interviews') state.interviewJobFilter = null;
  render();
}

function closeModal() {
  state.selectedDrive = null;
  state.driveModalOpen = false;
  state.slotModalOpen = false;
  state.deployModalOpen = false;
  render();
}

async function applyToDrive() {
  if (!state.profile || !state.selectedDrive || state.actionBusy) return;
  state.actionBusy = true;
  state.modalError = '';
  render();
  try {
    const application = await api.applyToJob({
      jobId: state.selectedDrive.id,
      studentId: state.profile.id,
      notes: state.candidateNotes
    });
    state.applications.unshift(application);
    state.selectedDrive = null;
    notify(`Application submitted for ${application.companyName}.`);
  } catch (error) {
    state.modalError = error.message || 'Failed to submit application.';
  } finally {
    state.actionBusy = false;
    render();
  }
}

async function updateStatus(application, status) {
  const notes = status === 'Shortlisted'
    ? 'Candidate resume approved. Shortlisted for technical evaluation.'
    : status === 'Offer Extended'
      ? 'Cleared all interview panels. Formal campus placement offer issued.'
      : 'Application status updated.';
  try {
    const updated = await api.updateApplicationStatus(application.id, { status, notes });
    state.applications = state.applications.map(item => item.id === updated.id ? updated : item);
    notify(`Application updated to: ${status}`);
  } catch (error) {
    notify(error.message || 'Failed to update application.', 'error');
  }
}

async function acceptOffer(application) {
  if (!window.confirm(`Are you sure you want to formally accept the offer from ${application.companyName}?`)) return;
  try {
    const updated = await api.updateApplicationStatus(application.id, {
      status: 'Offer Accepted',
      notes: 'Offer formally accepted by candidate. Placement recorded.'
    });
    state.applications = state.applications.map(item => item.id === updated.id ? updated : item);
    notify('Offer accepted and placement recorded.');
  } catch (error) {
    notify(error.message || 'Failed to accept offer.', 'error');
  }
}

async function bookSlot(slot) {
  if (!state.profile || !window.confirm(`Book the ${slot.startTime} interview slot with ${slot.companyName}?`)) return;
  try {
    const result = await api.bookInterviewSlot({
      slotId: slot.id,
      studentId: state.profile.id,
      studentName: state.profile.name,
      studentRoll: state.profile.rollNumber
    });
    state.slots = state.slots.map(item => item.id === slot.id ? result.slot : item);
    if (result.application) {
      state.applications = state.applications.map(item => item.id === result.application.id ? result.application : item);
    }
    notify(`Interview slot confirmed for ${result.slot.companyName}.`);
  } catch (error) {
    notify(error.message || 'Failed to book interview slot.', 'error');
  }
}

async function cancelSlot(slot) {
  if (!window.confirm('Are you sure you want to release this interview slot?')) return;
  try {
    const result = await api.cancelInterviewSlot(slot.id);
    state.slots = state.slots.map(item => item.id === slot.id ? result.slot : item);
    state.applications = await api.getApplications();
    notify('Interview slot released.');
  } catch (error) {
    notify(error.message || 'Failed to release interview slot.', 'error');
  }
}

function commaSeparated(value) {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

async function postDrive() {
  if (state.actionBusy) return;
  state.actionBusy = true;
  state.formError = '';
  const form = state.driveForm;
  const drive = {
    companyName: form.companyName.trim(),
    role: form.role.trim(),
    jobType: form.jobType,
    ctc: form.ctc.trim(),
    location: form.location.trim(),
    workMode: form.workMode,
    minCgpa: Number(form.minCgpa),
    openPositions: Number(form.openPositions),
    eligibleBranches: commaSeparated(form.eligibleBranches),
    deadline: new Date(form.deadline).toISOString(),
    driveDate: new Date(form.driveDate).toISOString(),
    description: form.description.trim(),
    rounds: commaSeparated(form.rounds),
    tags: commaSeparated(form.tags),
    selectionProcess: 'Online assessment followed by interviews.',
    status: 'Open'
  };
  render();
  try {
    const job = await api.createJob(drive);
    state.jobs.unshift(job);
    state.driveModalOpen = false;
    notify(`Campus drive for ${job.companyName} published.`);
  } catch (error) {
    state.formError = error.message || 'Failed to publish campus drive.';
  } finally {
    state.actionBusy = false;
    render();
  }
}

async function deleteDrive(job) {
  if (!window.confirm(`Remove the ${job.companyName} recruitment drive?`)) return;
  try {
    await api.deleteJob(job.id);
    state.jobs = state.jobs.filter(item => item.id !== job.id);
    notify('Recruitment drive removed.');
  } catch (error) {
    notify(error.message || 'Failed to remove drive.', 'error');
  }
}

async function createSlot() {
  if (state.actionBusy) return;
  const job = state.jobs.find(item => item.id === state.slotForm.jobId);
  if (!job) {
    state.formError = 'Select a campus drive before creating a slot.';
    render();
    return;
  }
  state.actionBusy = true;
  state.formError = '';
  const slot = {
    ...state.slotForm,
    companyName: job.companyName,
    date: new Date(state.slotForm.date).toISOString().slice(0, 10),
    durationMinutes: Number(state.slotForm.durationMinutes)
  };
  render();
  try {
    const created = await api.createInterviewSlot(slot);
    state.slots.push(created);
    state.slotModalOpen = false;
    notify(`Interview slot created for ${created.companyName}.`);
  } catch (error) {
    state.formError = error.message || 'Failed to create interview slot.';
  } finally {
    state.actionBusy = false;
    render();
  }
}

function toggleProfileEdit() {
  if (state.editingProfile) {
    state.editingProfile = false;
  } else if (state.profile) {
    state.profileForm = {
      name: state.profile.name || '',
      phone: state.profile.phone || '',
      linkedin: state.profile.linkedin || '',
      github: state.profile.github || '',
      skills: (state.profile.skills || []).join(', '),
      resumeSummary: state.profile.resumeSummary || ''
    };
    state.editingProfile = true;
  }
  render();
}

async function saveProfile() {
  const updates = {
    ...state.profileForm,
    skills: commaSeparated(state.profileForm.skills || '')
  };
  try {
    state.profile = await api.updateProfile(updates);
    state.editingProfile = false;
    notify('Profile updated.');
  } catch (error) {
    notify(error.message || 'Failed to update profile.', 'error');
  }
}

async function uploadResume(file) {
  if (!file) return;
  const extension = file.name.split('.').pop().toLowerCase();
  if (!['pdf', 'doc', 'docx'].includes(extension)) {
    state.resumeFeedback = 'Choose a PDF, DOC, or DOCX file.';
    render();
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    state.resumeFeedback = 'The selected file is larger than 5 MB.';
    render();
    return;
  }
  state.resumeUploading = true;
  state.resumeFeedback = '';
  render();
  try {
    const result = await api.uploadResume(file.name);
    state.profile = result.profile;
    state.resumeFeedback = `Uploaded ${file.name}; ATS score ${result.profile.resumeAtsScore}%.`;
  } catch (error) {
    state.resumeFeedback = error.message || 'Resume upload failed.';
    notify(state.resumeFeedback, 'error');
  } finally {
    state.resumeUploading = false;
    render();
  }
}

function setPath(target, path, value) {
  const keys = path.split('.');
  let object = target;
  for (const key of keys.slice(0, -1)) object = object[key];
  object[keys[keys.length - 1]] = value;
}

function readInputValue(input) {
  if (input.type === 'checkbox') return input.checked;
  if (input.type === 'number') return input.value === '' ? '' : Number(input.value);
  return input.value;
}

document.addEventListener('input', event => {
  const input = event.target.closest('[data-bind]');
  if (!input) return;
  setPath(state, input.dataset.bind, readInputValue(input));
  if (input.dataset.bind === 'driveSearch') render();
});

document.addEventListener('change', event => {
  const input = event.target.closest('[data-bind]');
  if (input) {
    setPath(state, input.dataset.bind, readInputValue(input));
    render();
  }
  if (event.target.matches('[data-action="upload-resume"]')) uploadResume(event.target.files?.[0]);
});

document.addEventListener('submit', event => {
  const form = event.target.closest('[data-form]');
  if (!form) return;
  event.preventDefault();
  if (form.dataset.form === 'apply') applyToDrive();
  if (form.dataset.form === 'drive') postDrive();
  if (form.dataset.form === 'slot') createSlot();
  if (form.dataset.form === 'profile') saveProfile();
});

document.addEventListener('click', event => {
  const backdrop = event.target.closest('[data-backdrop]');
  if (backdrop && event.target === backdrop) {
    closeModal();
    return;
  }
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, tab, id, value, role, status } = button.dataset;

  if (action === 'navigate') setTab(tab);
  else if (action === 'role') {
    state.userRole = role;
    if (role === 'coordinator') state.activeTab = 'tpo';
    render();
  } else if (action === 'open-deploy') {
    state.deployModalOpen = true;
    render();
  } else if (action === 'close-modal') closeModal();
  else if (action === 'drive-type') {
    state.driveType = value;
    render();
  } else if (action === 'reset-drive-filters') {
    state.driveSearch = '';
    state.driveType = 'All';
    state.onlyEligible = false;
    render();
  } else if (action === 'open-drive') {
    state.selectedDrive = state.jobs.find(job => job.id === id) || null;
    state.candidateNotes = '';
    state.modalError = '';
    render();
  } else if (action === 'application-filter') {
    state.applicationFilter = value;
    render();
  } else if (action === 'schedule-interview') {
    state.interviewJobFilter = id;
    state.slotCompany = 'All';
    setTab('interviews');
  } else if (action === 'accept-offer') {
    const application = state.applications.find(item => item.id === id);
    if (application) acceptOffer(application);
  } else if (action === 'book-slot') {
    const slot = state.slots.find(item => item.id === id);
    if (slot) bookSlot(slot);
  } else if (action === 'cancel-slot') {
    const slot = state.slots.find(item => item.id === id);
    if (slot) cancelSlot(slot);
  } else if (action === 'toggle-profile-edit') toggleProfileEdit();
  else if (action === 'print-resume') window.print();
  else if (action === 'tpo-tab') {
    state.tpoTab = value;
    render();
  } else if (action === 'open-drive-form') {
    state.formError = '';
    state.driveModalOpen = true;
    render();
  } else if (action === 'open-slot-form') {
    state.formError = '';
    if (state.jobs.length) state.slotForm.jobId = state.jobs[0].id;
    state.slotModalOpen = true;
    render();
  } else if (action === 'update-status') {
    const application = state.applications.find(item => item.id === id);
    if (application) updateStatus(application, status);
  } else if (action === 'delete-drive') {
    const job = state.jobs.find(item => item.id === id);
    if (job) deleteDrive(job);
  } else if (action === 'reload') loadAllData();
});

document.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.drive-card[data-action="open-drive"]')) {
    event.preventDefault();
    event.target.click();
  }
  if (event.key === 'Escape' && (state.selectedDrive || state.driveModalOpen || state.slotModalOpen || state.deployModalOpen)) {
    closeModal();
  }
});

loadAllData();
