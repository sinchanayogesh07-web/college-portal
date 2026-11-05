const angular = window.angular;

const app = angular.module('placementPortal', []);

app.factory('placementApi', ['$http', function ($http) {
  function request(method, url, data) {
    return $http({ method, url: `/api${url}`, data }).then(response => response.data);
  }

  return {
    getProfile: () => request('GET', '/profile'),
    updateProfile: updates => request('PUT', '/profile', updates),
    uploadResume: fileName => request('POST', '/resume/upload', { fileName }),
    getJobs: () => request('GET', '/jobs'),
    createJob: job => request('POST', '/jobs', job),
    deleteJob: id => request('DELETE', `/jobs/${encodeURIComponent(id)}`),
    getApplications: () => request('GET', '/applications'),
    applyToJob: payload => request('POST', '/applications', payload),
    updateApplicationStatus: (id, updates) => request('PATCH', `/applications/${encodeURIComponent(id)}/status`, updates),
    getInterviewSlots: () => request('GET', '/interviews/slots'),
    createInterviewSlot: slot => request('POST', '/interviews/slots', slot),
    bookInterviewSlot: payload => request('POST', '/interviews/book', payload),
    cancelInterviewSlot: slotId => request('POST', '/interviews/cancel', { slotId }),
    getPlacementStats: () => request('GET', '/stats')
  };
}]);

app.directive('fileChange', [function () {
  return {
    scope: { fileChange: '&' },
    link(scope, element) {
      element.on('change', event => {
        scope.$apply(() => scope.fileChange({ $file: event.target.files[0] }));
      });
    }
  };
}]);

app.controller('PortalController', ['$scope', '$timeout', '$q', 'placementApi', function ($scope, $timeout, $q, api) {
  const portal = this;
  let noticeTimer;

  portal.loading = true;
  portal.jobs = [];
  portal.applications = [];
  portal.slots = [];
  portal.profile = null;
  portal.stats = { branchStats: [] };
  portal.activeTab = 'drives';
  portal.userRole = 'student';
  portal.driveSearch = '';
  portal.driveType = 'All';
  portal.onlyEligible = false;
  portal.jobTypes = ['All', 'Full Time', 'Internship'];
  portal.applicationFilters = ['All', 'Active', 'Offers'];
  portal.applicationFilter = 'All';
  portal.statusStages = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Offer Extended'];
  portal.tpoTabs = [
    { id: 'applicants', label: 'Manage applicants' },
    { id: 'drives', label: 'Placement drives' },
    { id: 'slots', label: 'Interview slots' },
    { id: 'analytics', label: 'Department analytics' }
  ];
  portal.tpoTab = 'applicants';
  portal.applicantJobFilter = 'All';
  portal.slotCompany = 'All';
  portal.interviewJobFilter = null;
  portal.notice = '';
  portal.noticeType = 'success';
  portal.actionBusy = false;
  portal.modalError = '';
  portal.formError = '';
  portal.driveModalOpen = false;
  portal.slotModalOpen = false;
  portal.deployModalOpen = false;
  portal.resumeUploading = false;
  portal.resumeFeedback = '';

  portal.driveForm = {
    companyName: '',
    role: '',
    jobType: 'Full Time',
    ctc: '',
    location: 'Bengaluru / Hyderabad',
    workMode: 'Hybrid',
    minCgpa: 7.5,
    openPositions: 5,
    eligibleBranches: 'Computer Science & Engineering, Information Technology',
    deadline: new Date('2026-11-20T12:00:00'),
    driveDate: new Date('2026-11-28T12:00:00'),
    description: '',
    rounds: 'Online Assessment, Technical Interview 1, Technical Interview 2, HR Round',
    tags: 'Software, Cloud'
  };

  portal.slotForm = {
    jobId: '',
    roundName: 'Technical Round 1',
    interviewerName: 'Staff Engineering Evaluator',
    interviewerRole: 'Senior Technical Lead',
    date: new Date('2026-11-20T12:00:00'),
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    durationMinutes: 45,
    meetingLink: '',
    roomNumber: ''
  };

  function errorMessage(error, fallback) {
    return error && error.data && error.data.error || error && error.message || fallback;
  }

  function notify(message, type) {
    portal.notice = message;
    portal.noticeType = type || 'success';
    if (noticeTimer) $timeout.cancel(noticeTimer);
    noticeTimer = $timeout(() => {
      portal.notice = '';
    }, 4500);
  }

  function loadResource(promise, key, fallback) {
    return promise.then(value => {
      portal[key] = value == null ? fallback : value;
    }).catch(error => {
      console.error(`Unable to load ${key}.`, error);
      portal[key] = fallback;
      notify(`Unable to load ${key}. ${errorMessage(error, 'Check the API connection and retry.')}`, 'error');
    });
  }

  $scope.$on('$destroy', () => {
    if (noticeTimer) $timeout.cancel(noticeTimer);
  });

  portal.loadAllData = function () {
    portal.loading = true;
    return $q.all([
      loadResource(api.getProfile(), 'profile', null),
      loadResource(api.getJobs(), 'jobs', []),
      loadResource(api.getApplications(), 'applications', []),
      loadResource(api.getInterviewSlots(), 'slots', []),
      loadResource(api.getPlacementStats(), 'stats', { branchStats: [] })
    ]).finally(() => {
      portal.loading = false;
    });
  };

  portal.goTo = function (tab) {
    portal.activeTab = tab;
    if (tab !== 'interviews') portal.interviewJobFilter = null;
  };

  portal.setRole = function (role) {
    portal.userRole = role;
    if (role === 'coordinator') portal.goTo('tpo');
  };

  portal.initials = name => (name || '?').split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();

  portal.statusClass = function (status) {
    if (status === 'Offer Accepted' || status === 'Open') return 'status-green';
    if (status === 'Offer Extended') return 'status-purple';
    if (status === 'Interview Scheduled' || status === 'Interviewing') return 'status-blue';
    if (status === 'Shortlisted') return 'status-amber';
    if (status === 'Rejected' || status === 'Closed') return 'status-red';
    return 'status-neutral';
  };

  portal.isEligible = function (job) {
    if (!job) return false;
    if (!portal.profile) return true;
    const branches = job.eligibleBranches || [];
    const branchMatches = branches.includes(portal.profile.branch) ||
      branches.includes('All Branches') || branches.includes('All Circuit Branches');
    return Number(portal.profile.cgpa) >= Number(job.minCgpa) && branchMatches;
  };

  portal.applicationFor = jobId => portal.applications.find(application => application.jobId === jobId);

  portal.filteredJobs = function () {
    const query = (portal.driveSearch || '').trim().toLowerCase();
    return portal.jobs.filter(job => {
      const searchable = [job.companyName, job.role, job.location].concat(job.tags || []).join(' ').toLowerCase();
      const typeMatch = portal.driveType === 'All' || job.jobType === portal.driveType;
      return searchable.includes(query) && typeMatch && (!portal.onlyEligible || portal.isEligible(job));
    });
  };

  portal.resetDriveFilters = function () {
    portal.driveSearch = '';
    portal.driveType = 'All';
    portal.onlyEligible = false;
  };

  portal.openDrive = function (job) {
    portal.selectedDrive = job;
    portal.candidateNotes = '';
    portal.modalError = '';
  };

  portal.applyToDrive = function () {
    if (!portal.profile || !portal.selectedDrive || portal.actionBusy) return;
    portal.actionBusy = true;
    portal.modalError = '';
    return api.applyToJob({
      jobId: portal.selectedDrive.id,
      studentId: portal.profile.id,
      notes: portal.candidateNotes
    }).then(application => {
      portal.applications.unshift(application);
      portal.selectedDrive = null;
      notify(`Application submitted for ${application.companyName}.`);
    }).catch(error => {
      portal.modalError = errorMessage(error, 'Failed to submit application.');
    }).finally(() => {
      portal.actionBusy = false;
    });
  };

  portal.applicationCount = function (filter) {
    if (filter === 'Active') {
      return portal.applications.filter(application => ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled'].includes(application.status)).length;
    }
    if (filter === 'Offers') {
      return portal.applications.filter(application => ['Offer Extended', 'Offer Accepted'].includes(application.status)).length;
    }
    return portal.applications.length;
  };

  portal.filteredApplications = function () {
    return portal.applications.filter(application => {
      if (portal.applicationFilter === 'Active') return ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled'].includes(application.status);
      if (portal.applicationFilter === 'Offers') return ['Offer Extended', 'Offer Accepted'].includes(application.status);
      return true;
    });
  };

  portal.stageIndex = status => portal.statusStages.indexOf(status);

  portal.scheduleFor = function (jobId) {
    portal.interviewJobFilter = jobId;
    portal.slotCompany = 'All';
    portal.goTo('interviews');
  };

  portal.updateStatus = function (application, status) {
    const notes = status === 'Shortlisted'
      ? 'Candidate resume approved. Shortlisted for technical evaluation.'
      : status === 'Offer Extended'
        ? 'Cleared all interview panels. Formal campus placement offer issued.'
        : 'Application status updated.';
    return api.updateApplicationStatus(application.id, { status, notes }).then(updated => {
      portal.applications = portal.applications.map(item => item.id === updated.id ? updated : item);
      notify(`Application updated to: ${status}`);
    }).catch(error => notify(errorMessage(error, 'Failed to update application.'), 'error'));
  };

  portal.acceptOffer = function (application) {
    const accepted = window.confirm(`Are you sure you want to formally accept the offer from ${application.companyName}?`);
    if (!accepted) return;
    return api.updateApplicationStatus(application.id, {
      status: 'Offer Accepted',
      notes: 'Offer formally accepted by candidate. Placement recorded.'
    }).then(updated => {
      portal.applications = portal.applications.map(item => item.id === updated.id ? updated : item);
      notify('Offer accepted and placement recorded.');
    }).catch(error => notify(errorMessage(error, 'Failed to accept offer.'), 'error'));
  };

  portal.slotCompanies = () => [...new Set(portal.slots.map(slot => slot.companyName))];
  portal.filteredSlots = function () {
    return portal.slots.filter(slot => {
      const matchesCompany = portal.slotCompany === 'All' || slot.companyName === portal.slotCompany;
      const matchesJob = !portal.interviewJobFilter || slot.jobId === portal.interviewJobFilter;
      return matchesCompany && matchesJob;
    });
  };

  portal.myBookedSlots = () => portal.slots.filter(slot => slot.isBooked && portal.profile && slot.bookedByStudentId === portal.profile.id);
  portal.upcomingInterviewCount = () => portal.myBookedSlots().length;
  portal.bookedSlotCount = () => portal.slots.filter(slot => slot.isBooked).length;

  portal.bookSlot = function (slot) {
    if (!portal.profile || !window.confirm(`Book the ${slot.startTime} interview slot with ${slot.companyName}?`)) return;
    return api.bookInterviewSlot({
      slotId: slot.id,
      studentId: portal.profile.id,
      studentName: portal.profile.name,
      studentRoll: portal.profile.rollNumber
    }).then(result => {
      portal.slots = portal.slots.map(item => item.id === slot.id ? result.slot : item);
      if (result.application) {
        portal.applications = portal.applications.map(item => item.id === result.application.id ? result.application : item);
      }
      notify(`Interview slot confirmed for ${result.slot.companyName}.`);
    }).catch(error => notify(errorMessage(error, 'Failed to book interview slot.'), 'error'));
  };

  portal.cancelSlot = function (slot) {
    if (!window.confirm('Are you sure you want to release this interview slot?')) return;
    return api.cancelInterviewSlot(slot.id).then(result => {
      portal.slots = portal.slots.map(item => item.id === slot.id ? result.slot : item);
      return api.getApplications();
    }).then(applications => {
      portal.applications = applications;
      notify('Interview slot released.');
    }).catch(error => notify(errorMessage(error, 'Failed to release interview slot.'), 'error'));
  };

  portal.filteredApplicantRows = () => portal.applications.filter(application => portal.applicantJobFilter === 'All' || application.jobId === portal.applicantJobFilter);

  portal.postDrive = function () {
    if (portal.actionBusy) return;
    portal.actionBusy = true;
    portal.formError = '';
    const form = portal.driveForm;
    const drive = {
      companyName: form.companyName.trim(),
      role: form.role.trim(),
      jobType: form.jobType,
      ctc: form.ctc.trim(),
      location: form.location.trim(),
      workMode: form.workMode,
      minCgpa: Number(form.minCgpa),
      openPositions: Number(form.openPositions),
      eligibleBranches: form.eligibleBranches.split(',').map(value => value.trim()).filter(Boolean),
      deadline: new Date(form.deadline).toISOString(),
      driveDate: new Date(form.driveDate).toISOString(),
      description: form.description.trim(),
      rounds: form.rounds.split(',').map(value => value.trim()).filter(Boolean),
      tags: form.tags.split(',').map(value => value.trim()).filter(Boolean),
      selectionProcess: 'Online assessment followed by interviews.',
      status: 'Open'
    };
    return api.createJob(drive).then(job => {
      portal.jobs.unshift(job);
      portal.driveModalOpen = false;
      notify(`Campus drive for ${job.companyName} published.`);
    }).catch(error => {
      portal.formError = errorMessage(error, 'Failed to publish campus drive.');
    }).finally(() => {
      portal.actionBusy = false;
    });
  };

  portal.deleteDrive = function (job) {
    if (!window.confirm(`Remove the ${job.companyName} recruitment drive?`)) return;
    return api.deleteJob(job.id).then(() => {
      portal.jobs = portal.jobs.filter(item => item.id !== job.id);
      notify('Recruitment drive removed.');
    }).catch(error => notify(errorMessage(error, 'Failed to remove drive.'), 'error'));
  };

  portal.openSlotForm = function () {
    portal.formError = '';
    if (portal.jobs.length) {
      portal.slotForm.jobId = portal.jobs[0].id;
    }
    portal.slotModalOpen = true;
  };

  portal.createSlot = function () {
    if (portal.actionBusy) return;
    const job = portal.jobs.find(item => item.id === portal.slotForm.jobId);
    if (!job) {
      portal.formError = 'Select a campus drive before creating a slot.';
      return;
    }
    portal.actionBusy = true;
    portal.formError = '';
    const slot = Object.assign({}, portal.slotForm, {
      companyName: job.companyName,
      date: new Date(portal.slotForm.date).toISOString().slice(0, 10)
    });
    return api.createInterviewSlot(slot).then(created => {
      portal.slots.push(created);
      portal.slotModalOpen = false;
      notify(`Interview slot created for ${created.companyName}.`);
    }).catch(error => {
      portal.formError = errorMessage(error, 'Failed to create interview slot.');
    }).finally(() => {
      portal.actionBusy = false;
    });
  };

  portal.editingProfile = false;
  portal.profileForm = {};
  portal.toggleProfileEdit = function () {
    if (portal.editingProfile) {
      portal.editingProfile = false;
      return;
    }
    if (!portal.profile) return;
    portal.profileForm = {
      name: portal.profile.name,
      phone: portal.profile.phone,
      linkedin: portal.profile.linkedin,
      github: portal.profile.github,
      skills: (portal.profile.skills || []).join(', '),
      resumeSummary: portal.profile.resumeSummary
    };
    portal.editingProfile = true;
  };

  portal.saveProfile = function () {
    const updates = Object.assign({}, portal.profileForm, {
      skills: portal.profileForm.skills.split(',').map(skill => skill.trim()).filter(Boolean)
    });
    return api.updateProfile(updates).then(profile => {
      portal.profile = profile;
      portal.editingProfile = false;
      notify('Profile updated.');
    }).catch(error => notify(errorMessage(error, 'Failed to update profile.'), 'error'));
  };

  portal.uploadResume = function (file) {
    if (!file) return;
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(extension)) {
      portal.resumeFeedback = 'Choose a PDF, DOC, or DOCX file.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      portal.resumeFeedback = 'The selected file is larger than 5 MB.';
      return;
    }
    portal.resumeUploading = true;
    portal.resumeFeedback = '';
    return api.uploadResume(file.name).then(result => {
      portal.profile = result.profile;
      portal.resumeFeedback = `Uploaded ${file.name}; ATS score ${result.profile.resumeAtsScore}%.`;
    }).catch(error => {
      portal.resumeFeedback = errorMessage(error, 'Resume upload failed.');
      notify(portal.resumeFeedback, 'error');
    }).finally(() => {
      portal.resumeUploading = false;
    });
  };

  portal.printResume = () => window.print();

  portal.loadAllData();
}]);
