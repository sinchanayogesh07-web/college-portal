import mongoose, { Schema } from 'mongoose';
import { supabase } from './supabase.js';
const JobSchema = new Schema({
    customId: {
        type: String,
        required: true,
        unique: true
    },
    companyName: {
        type: String,
        required: true
    },
    companyLogo: String,
    role: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true,
        enum: [
            'Full Time',
            'Internship',
            'Intern + PPO'
        ]
    },
    ctc: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    eligibleBranches: [
        {
            type: String
        }
    ],
    minCgpa: {
        type: Number,
        required: true
    },
    driveDate: {
        type: String,
        required: true
    },
    deadline: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rounds: [
        {
            type: String
        }
    ],
    selectionProcess: String,
    workMode: {
        type: String,
        enum: [
            'On-site',
            'Hybrid',
            'Remote'
        ],
        default: 'On-site'
    },
    openPositions: {
        type: Number,
        default: 5
    },
    tags: [
        {
            type: String
        }
    ],
    status: {
        type: String,
        enum: [
            'Open',
            'Closed',
            'Interviewing',
            'Completed'
        ],
        default: 'Open'
    },
    createdAt: {
        type: String,
        default: ()=>new Date().toISOString()
    }
});
const ApplicationSchema = new Schema({
    customId: {
        type: String,
        required: true,
        unique: true
    },
    jobId: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    studentRoll: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    studentBranch: {
        type: String,
        required: true
    },
    studentCgpa: {
        type: Number,
        required: true
    },
    jobRole: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            'Applied',
            'Under Review',
            'Shortlisted',
            'Interview Scheduled',
            'Offer Extended',
            'Offer Accepted',
            'Rejected'
        ],
        default: 'Applied'
    },
    appliedAt: {
        type: String,
        default: ()=>new Date().toISOString()
    },
    updatedAt: {
        type: String,
        default: ()=>new Date().toISOString()
    },
    notes: String,
    resumeUrl: String,
    interviewSlotId: String,
    interviewRound: String,
    interviewDate: String,
    interviewTime: String,
    interviewMeetingLink: String,
    interviewLocation: String,
    offerDetails: {
        ctc: String,
        joiningDate: String,
        location: String,
        validTill: String
    }
});
const SlotSchema = new Schema({
    customId: {
        type: String,
        required: true,
        unique: true
    },
    jobId: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    roundName: {
        type: String,
        required: true
    },
    interviewerName: {
        type: String,
        required: true
    },
    interviewerRole: {
        type: String,
        default: 'Senior Technical Lead'
    },
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    durationMinutes: {
        type: Number,
        default: 45
    },
    meetingLink: {
        type: String,
        required: true
    },
    roomNumber: String,
    isBooked: {
        type: Boolean,
        default: false
    },
    bookedByStudentId: String,
    bookedByStudentName: String,
    bookedByStudentRoll: String,
    notes: String
});
const ProfileSchema = new Schema({
    customId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: String,
    degree: String,
    batch: String,
    cgpa: {
        type: Number,
        default: 8.7
    },
    backlogs: {
        type: Number,
        default: 0
    },
    branch: {
        type: String,
        default: 'Computer Science & Engineering'
    },
    avatarUrl: String,
    linkedin: String,
    github: String,
    portfolio: String,
    skills: [
        {
            type: String
        }
    ],
    resumeUrl: String,
    resumeFileName: String,
    resumeUploadedAt: String,
    resumeAtsScore: {
        type: Number,
        default: 85
    },
    resumeSummary: String,
    resumeParsedSkills: [
        {
            type: String
        }
    ],
    experience: [
        {
            company: String,
            role: String,
            duration: String,
            summary: String
        }
    ],
    education: [
        {
            institution: String,
            degree: String,
            score: String,
            year: String
        }
    ]
});
export const JobModel = mongoose.models.Job || mongoose.model('Job', JobSchema);
export const ApplicationModel = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
export const SlotModel = mongoose.models.Slot || mongoose.model('Slot', SlotSchema);
export const ProfileModel = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
const initialProfile = {
    id: 'stu-2026-104',
    name: 'Maya Chen',
    rollNumber: '21BCS104',
    email: 'maya.chen@univ.edu.in',
    phone: '+91 98450 12345',
    degree: 'Bachelor of Technology (B.Tech)',
    batch: 'Class of 2026 (Final Year)',
    cgpa: 8.84,
    backlogs: 0,
    branch: 'Computer Science & Engineering',
    avatarUrl: '/src/assets/images/student_avatar_1793863944480.jpg',
    linkedin: 'https://linkedin.com/in/mayachen-cs',
    github: 'https://github.com/mayachen-dev',
    portfolio: 'https://mayachen.dev',
    skills: [
        'React',
        'TypeScript',
        'Node.js',
        'MongoDB',
        'Python',
        'Distributed Systems',
        'Docker',
        'Tailwind CSS',
        'System Design',
        'REST APIs'
    ],
    resumeUrl: '/documents/resumes/maya_chen_resume.pdf',
    resumeFileName: 'Maya_Chen_CS_2026_ATS.pdf',
    resumeUploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    resumeAtsScore: 92,
    resumeSummary: 'High-achieving computer science undergraduate with strong foundations in distributed web systems, full-stack React/Node.js, and cloud engineering. Experienced with open-source microservices, database optimization, and high-concurrency event pipelines.',
    resumeParsedSkills: [
        'React.js',
        'Node.js',
        'Express',
        'MongoDB',
        'PostgreSQL',
        'TypeScript',
        'Docker',
        'AWS',
        'Redis',
        'Algorithms'
    ],
    experience: [
        {
            company: 'Zepto Labs',
            role: 'Software Engineering Intern',
            duration: 'May 2025 - July 2025',
            summary: 'Architected real-time order tracking WebSocket notification microservice handling 15k events/sec. Decreased query latency by 38% via Redis caching.'
        },
        {
            company: 'Campus Open Source Club',
            role: 'Technical Lead & Core Maintainer',
            duration: 'Aug 2024 - Present',
            summary: 'Guided 40+ student developers in shipping university event portal. Automated CI/CD test pipelines and containerized deployment.'
        }
    ],
    education: [
        {
            institution: 'National Institute of Technology',
            degree: 'B.Tech in Computer Science & Engineering',
            score: '8.84 CGPA',
            year: '2022 - 2026'
        },
        {
            institution: 'Delhi Public School R.K. Puram',
            degree: 'Senior Secondary Education (Class XII CBSE)',
            score: '96.4%',
            year: '2022'
        }
    ]
};
const initialJobs = [
    {
        id: 'drive-google-01',
        companyName: 'Google',
        companyLogo: 'https://www.google.com/favicon.ico',
        role: 'Software Engineer - University Graduate',
        jobType: 'Full Time',
        ctc: '34.5 LPA (₹22L Base + Stocks + Joining Bonus)',
        location: 'Bengaluru / Hyderabad',
        eligibleBranches: [
            'Computer Science & Engineering',
            'Information Technology',
            'Electronics & Communication'
        ],
        minCgpa: 8.0,
        driveDate: '2026-11-18T09:30:00Z',
        deadline: '2026-11-14T23:59:59Z',
        description: 'We are looking for enthusiastic software engineering graduates to build hyper-scale distributed services and cloud products powering billions of daily queries.',
        rounds: [
            'Online Coding Assessment',
            'Technical Interview 1 (DSA)',
            'Technical Interview 2 (System Design)',
            'Googliness & Leadership'
        ],
        selectionProcess: 'Aptitude & DSA Test on HackerRank followed by 3 rounds of video interviews.',
        workMode: 'Hybrid',
        openPositions: 8,
        tags: [
            'Tier 1 Dream',
            'Cloud',
            'Distributed Systems',
            'C++/Go/Java'
        ],
        status: 'Open',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
        id: 'drive-atlassian-02',
        companyName: 'Atlassian',
        companyLogo: 'https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png',
        role: 'Associate Software Engineer (Platform)',
        jobType: 'Full Time',
        ctc: '28.0 LPA (₹18L Base + Relocation)',
        location: 'Bengaluru (Remote Friendly)',
        eligibleBranches: [
            'Computer Science & Engineering',
            'Information Technology',
            'Data Science',
            'AI & ML'
        ],
        minCgpa: 7.5,
        driveDate: '2026-11-20T10:00:00Z',
        deadline: '2026-11-16T18:00:00Z',
        description: 'Join Atlassian to work on Jira, Confluence, and next-generation collaboration software built with React, Node.js, and AWS serverless primitives.',
        rounds: [
            'Karat Technical Coding',
            'System Architecture & Concurrency',
            'Values Interview'
        ],
        selectionProcess: 'Round 1 screening followed by Karat online platform interview and 2 onsite virtual rounds.',
        workMode: 'Remote',
        openPositions: 6,
        tags: [
            'Dream Offer',
            'SaaS',
            'Full Stack',
            'React/Node'
        ],
        status: 'Open',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
        id: 'drive-goldman-03',
        companyName: 'Goldman Sachs',
        companyLogo: 'https://www.goldmansachs.com/favicon.ico',
        role: 'Analyst - Engineering & Quantitative Strategy',
        jobType: 'Full Time',
        ctc: '26.0 LPA',
        location: 'Bengaluru / Mumbai',
        eligibleBranches: [
            'Computer Science & Engineering',
            'Information Technology',
            'Mathematics & Computing',
            'Electrical Engineering'
        ],
        minCgpa: 8.2,
        driveDate: '2026-11-22T08:30:00Z',
        deadline: '2026-11-17T20:00:00Z',
        description: 'Build mission-critical high-frequency quantitative models, ultra-low latency trading pipelines, and resilient financial services infrastructure.',
        rounds: [
            'Aptitude & Math Hackathon',
            'Technical Round (DSA & Operating Systems)',
            'Senior Executive Fitment'
        ],
        selectionProcess: 'Math/coding assessment on CoderByte, 2 technical video rounds, and final VP discussion.',
        workMode: 'On-site',
        openPositions: 5,
        tags: [
            'FinTech',
            'High Frequency Trading',
            'Quantitative',
            'Tier 1'
        ],
        status: 'Open',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
        id: 'drive-microsoft-04',
        companyName: 'Microsoft',
        companyLogo: 'https://www.microsoft.com/favicon.ico',
        role: 'Software Development Engineer I (Azure)',
        jobType: 'Full Time',
        ctc: '29.5 LPA (₹19L Base + Stock RSUs)',
        location: 'Hyderabad / Noida',
        eligibleBranches: [
            'Computer Science & Engineering',
            'Information Technology',
            'Electronics & Communication',
            'Data Science'
        ],
        minCgpa: 7.8,
        driveDate: '2026-11-25T09:00:00Z',
        deadline: '2026-11-19T23:59:59Z',
        description: 'Work on Azure cloud core infrastructure, AI orchestration runtimes, and developer developer tooling used by millions of engineers globally.',
        rounds: [
            'Codility Online Test',
            'Technical Round 1 (Algorithms)',
            'Technical Round 2 (Low Level Design)',
            'AA (As Appropriate) Director Round'
        ],
        selectionProcess: 'Online coding round followed by 3 rounds of Microsoft Teams interviews.',
        workMode: 'Hybrid',
        openPositions: 10,
        tags: [
            'Tier 1 Dream',
            'Cloud Infrastructure',
            'Azure',
            'Systems'
        ],
        status: 'Open',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
        id: 'drive-swiggy-05',
        companyName: 'Swiggy',
        companyLogo: 'https://www.swiggy.com/favicon.ico',
        role: 'Software Engineer - Backend Platform',
        jobType: 'Full Time',
        ctc: '22.0 LPA + ESOPs',
        location: 'Bengaluru',
        eligibleBranches: [
            'Computer Science & Engineering',
            'Information Technology',
            'All Circuit Branches'
        ],
        minCgpa: 7.0,
        driveDate: '2026-11-28T10:00:00Z',
        deadline: '2026-11-21T18:00:00Z',
        description: 'Scale order matching algorithms, spatial geo-routing, and instant delivery dispatch pipelines across 500+ Indian cities.',
        rounds: [
            'Online Assessment',
            'Machine Coding Round (Clean Architecture)',
            'System Design & Bar Raiser'
        ],
        selectionProcess: '2-hour machine coding test and 2 technical rounds.',
        workMode: 'On-site',
        openPositions: 8,
        tags: [
            'Product Scale',
            'Microservices',
            'Golang/Java',
            'High Growth'
        ],
        status: 'Open',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
        id: 'drive-uber-06',
        companyName: 'Uber Technologies',
        companyLogo: 'https://www.uber.com/favicon.ico',
        role: 'Software Engineer II (Campus Hire)',
        jobType: 'Full Time',
        ctc: '32.0 LPA',
        location: 'Hyderabad / Bengaluru',
        eligibleBranches: [
            'Computer Science & Engineering',
            'Information Technology'
        ],
        minCgpa: 8.5,
        driveDate: '2026-12-02T10:00:00Z',
        deadline: '2026-11-24T23:59:59Z',
        description: 'Architect rider-driver dynamic matching systems, real-time safety fraud detection, and distributed payment microservices.',
        rounds: [
            'HackerRank Coding Challenge',
            'Data Structures & Complex Algorithms',
            'System Architecture & Scale',
            'Hiring Manager Discussion'
        ],
        selectionProcess: '3 virtual technical rounds with Uber senior staff engineers.',
        workMode: 'Hybrid',
        openPositions: 4,
        tags: [
            'Mobility Tech',
            'Distributed Systems',
            'Tier 1 Dream'
        ],
        status: 'Open',
        createdAt: new Date().toISOString()
    }
];
const initialApplications = [
    {
        id: 'app-001',
        jobId: 'drive-google-01',
        studentId: 'stu-2026-104',
        studentName: 'Maya Chen',
        studentRoll: '21BCS104',
        studentEmail: 'maya.chen@univ.edu.in',
        studentBranch: 'Computer Science & Engineering',
        studentCgpa: 8.84,
        jobRole: 'Software Engineer - University Graduate',
        companyName: 'Google',
        status: 'Shortlisted',
        appliedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        notes: 'Cleared online assessment with 100% test cases. Shortlisted for Technical Round 1 on Algorithms & Data Structures.',
        interviewSlotId: 'slot-goog-01',
        interviewRound: 'Technical Round 1 (DSA & Problem Solving)',
        interviewDate: '2026-11-15',
        interviewTime: '10:00 AM - 10:45 AM',
        interviewMeetingLink: 'https://meet.google.com/xyz-placement-goog',
        interviewLocation: 'Virtual (Google Meet)'
    },
    {
        id: 'app-002',
        jobId: 'drive-atlassian-02',
        studentId: 'stu-2026-104',
        studentName: 'Maya Chen',
        studentRoll: '21BCS104',
        studentEmail: 'maya.chen@univ.edu.in',
        studentBranch: 'Computer Science & Engineering',
        studentCgpa: 8.84,
        jobRole: 'Associate Software Engineer (Platform)',
        companyName: 'Atlassian',
        status: 'Interview Scheduled',
        appliedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        notes: 'Technical Karat round cleared. Scheduled for System Architecture virtual panel.',
        interviewSlotId: 'slot-atl-02',
        interviewRound: 'System Architecture & Concurrency',
        interviewDate: '2026-11-16',
        interviewTime: '02:00 PM - 02:45 PM',
        interviewMeetingLink: 'https://zoom.us/j/9823471923',
        interviewLocation: 'Online Zoom Panel'
    },
    {
        id: 'app-003',
        jobId: 'drive-goldman-03',
        studentId: 'stu-2026-104',
        studentName: 'Maya Chen',
        studentRoll: '21BCS104',
        studentEmail: 'maya.chen@univ.edu.in',
        studentBranch: 'Computer Science & Engineering',
        studentCgpa: 8.84,
        jobRole: 'Analyst - Engineering & Quantitative Strategy',
        companyName: 'Goldman Sachs',
        status: 'Under Review',
        appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        notes: 'Application and resume submitted to Goldman Sachs Campus Talent Acquisition.'
    },
    {
        id: 'app-004',
        jobId: 'drive-swiggy-05',
        studentId: 'stu-2026-104',
        studentName: 'Maya Chen',
        studentRoll: '21BCS104',
        studentEmail: 'maya.chen@univ.edu.in',
        studentBranch: 'Computer Science & Engineering',
        studentCgpa: 8.84,
        jobRole: 'Software Engineer - Backend Platform',
        companyName: 'Swiggy',
        status: 'Offer Extended',
        appliedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        notes: 'Outstanding performance in Machine Coding and Bar Raiser rounds! Formal letter of intent issued.',
        offerDetails: {
            ctc: '₹22,00,000 / annum + ₹4,00,000 ESOPs',
            joiningDate: '15 July 2026',
            location: 'Bengaluru HQ (Marathahalli Campus)',
            validTill: '2026-11-25'
        }
    }
];
const initialInterviewSlots = [
    {
        id: 'slot-goog-01',
        jobId: 'drive-google-01',
        companyName: 'Google',
        roundName: 'Technical Round 1 (DSA & Problem Solving)',
        interviewerName: 'Dr. Vikram Sethi',
        interviewerRole: 'Staff Software Engineer @ Google Search',
        date: '2026-11-15',
        startTime: '10:00 AM',
        endTime: '10:45 AM',
        durationMinutes: 45,
        meetingLink: 'https://meet.google.com/xyz-placement-goog',
        roomNumber: 'Interview Pod 3, Placement Block 2nd Floor',
        isBooked: true,
        bookedByStudentId: 'stu-2026-104',
        bookedByStudentName: 'Maya Chen',
        bookedByStudentRoll: '21BCS104',
        notes: 'Please keep camera on and have an IDE/browser ready for collaborative coding.'
    },
    {
        id: 'slot-goog-02',
        jobId: 'drive-google-01',
        companyName: 'Google',
        roundName: 'Technical Round 1 (DSA & Problem Solving)',
        interviewerName: 'Dr. Vikram Sethi',
        interviewerRole: 'Staff Software Engineer @ Google Search',
        date: '2026-11-15',
        startTime: '11:15 AM',
        endTime: '12:00 PM',
        durationMinutes: 45,
        meetingLink: 'https://meet.google.com/xyz-placement-goog-2',
        roomNumber: 'Interview Pod 3, Placement Block 2nd Floor',
        isBooked: false,
        notes: 'Open for shortlisted Google applicants.'
    },
    {
        id: 'slot-goog-03',
        jobId: 'drive-google-01',
        companyName: 'Google',
        roundName: 'Technical Round 1 (DSA & Problem Solving)',
        interviewerName: 'Ananya Raghavan',
        interviewerRole: 'Senior SWE @ Google Cloud Infrastructure',
        date: '2026-11-15',
        startTime: '02:00 PM',
        endTime: '02:45 PM',
        durationMinutes: 45,
        meetingLink: 'https://meet.google.com/xyz-placement-goog-3',
        roomNumber: 'Interview Pod 4, Placement Block 2nd Floor',
        isBooked: false,
        notes: 'Available for scheduling.'
    },
    {
        id: 'slot-atl-02',
        jobId: 'drive-atlassian-02',
        companyName: 'Atlassian',
        roundName: 'System Architecture & Concurrency',
        interviewerName: 'Marcus Bell',
        interviewerRole: 'Principal Architect @ Atlassian Platform',
        date: '2026-11-16',
        startTime: '02:00 PM',
        endTime: '02:45 PM',
        durationMinutes: 45,
        meetingLink: 'https://zoom.us/j/9823471923',
        roomNumber: 'Virtual Zoom Room 12',
        isBooked: true,
        bookedByStudentId: 'stu-2026-104',
        bookedByStudentName: 'Maya Chen',
        bookedByStudentRoll: '21BCS104',
        notes: 'Focus on distributed cache consistency and microservice event design.'
    },
    {
        id: 'slot-atl-03',
        jobId: 'drive-atlassian-02',
        companyName: 'Atlassian',
        roundName: 'System Architecture & Concurrency',
        interviewerName: 'Marcus Bell',
        interviewerRole: 'Principal Architect @ Atlassian Platform',
        date: '2026-11-16',
        startTime: '03:15 PM',
        endTime: '04:00 PM',
        durationMinutes: 45,
        meetingLink: 'https://zoom.us/j/9823471924',
        roomNumber: 'Virtual Zoom Room 12',
        isBooked: false,
        notes: 'Open slot for Atlassian shortlist.'
    },
    {
        id: 'slot-msft-01',
        jobId: 'drive-microsoft-04',
        companyName: 'Microsoft',
        roundName: 'Technical Round 1 (Algorithms & Systems)',
        interviewerName: 'Karthik Raman',
        interviewerRole: 'Principal Engineering Lead @ Azure Core',
        date: '2026-11-26',
        startTime: '10:30 AM',
        endTime: '11:15 AM',
        durationMinutes: 45,
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/msft-placement',
        roomNumber: 'Corporate Interview Hall A',
        isBooked: false,
        notes: 'Requires student to have Microsoft Teams installed or open via Edge/Chrome.'
    },
    {
        id: 'slot-msft-02',
        jobId: 'drive-microsoft-04',
        companyName: 'Microsoft',
        roundName: 'Technical Round 1 (Algorithms & Systems)',
        interviewerName: 'Karthik Raman',
        interviewerRole: 'Principal Engineering Lead @ Azure Core',
        date: '2026-11-26',
        startTime: '11:30 AM',
        endTime: '12:15 PM',
        durationMinutes: 45,
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/msft-placement-2',
        roomNumber: 'Corporate Interview Hall A',
        isBooked: false,
        notes: 'Open slot for Microsoft Azure drive.'
    }
];
let memoryJobs = [
    ...initialJobs
];
let memoryApplications = [
    ...initialApplications
];
let memorySlots = [
    ...initialInterviewSlots
];
let memoryProfile = {
    ...initialProfile
};
let isMongoConnected = false;
export async function initDatabase() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.log('[Database] MONGODB_URI not specified. Operating in high-performance in-memory mode with full seed data.');
        return {
            mode: 'in-memory',
            connected: false,
            message: 'Running in in-memory mode. To persist to MongoDB, supply MONGODB_URI in your environment or Render dashboard.'
        };
    }
    try {
        console.log(`[Database] Connecting to MongoDB at ${mongoUri.replace(/:[^:@]+@/, ':****@')}...`);
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
        });
        isMongoConnected = true;
        console.log('[Database] Successfully connected to MongoDB cluster.');
        await seedMongoIfEmpty();
        return {
            mode: 'mongodb',
            connected: true,
            message: 'Connected to live MongoDB cluster.'
        };
    } catch (err) {
        console.warn(`[Database] Could not connect to MongoDB (${err.message}). Falling back to local in-memory storage seamlessly.`);
        isMongoConnected = false;
        return {
            mode: 'in-memory',
            connected: false,
            message: `Failed to connect to MongoDB: ${err.message}. Operating in in-memory fallback mode so the app remains 100% functional.`
        };
    }
}
async function seedMongoIfEmpty() {
    try {
        const jobCount = await JobModel.countDocuments();
        if (jobCount === 0) {
            console.log('[Database] Seeding initial Campus Drives into MongoDB...');
            for (const j of initialJobs){
                await JobModel.create({
                    ...j,
                    customId: j.id
                });
            }
        }
        const appCount = await ApplicationModel.countDocuments();
        if (appCount === 0) {
            console.log('[Database] Seeding initial Student Applications into MongoDB...');
            for (const a of initialApplications){
                await ApplicationModel.create({
                    ...a,
                    customId: a.id
                });
            }
        }
        const slotCount = await SlotModel.countDocuments();
        if (slotCount === 0) {
            console.log('[Database] Seeding initial Interview Slots into MongoDB...');
            for (const s of initialInterviewSlots){
                await SlotModel.create({
                    ...s,
                    customId: s.id
                });
            }
        }
        const profileCount = await ProfileModel.countDocuments();
        if (profileCount === 0) {
            console.log('[Database] Seeding Student Profile into MongoDB...');
            await ProfileModel.create({
                ...initialProfile,
                customId: initialProfile.id
            });
        }
    } catch (err) {
        console.error('[Database] Error while auto-seeding MongoDB:', err);
    }
}
export async function getJobsDAL(search, branch, type) {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        let results = (data || []).map((job) => ({
            id: job.id,
            companyName: job.company_name,
            companyLogo: job.company_logo,
            role: job.job_title,
            jobType: job.job_type,
            ctc: job.ctc,
            location: job.location,
            eligibleBranches: job.eligible_branches || [],
            minCgpa: job.min_cgpa,
            driveDate: job.drive_date,
            deadline: job.application_deadline,
            description: job.description,
            rounds: job.rounds || [],
            selectionProcess: job.selection_process || '',
            workMode: job.work_mode,
            openPositions: job.open_positions,
            tags: job.tags || [],
            status: job.status,
            createdAt: job.created_at
        }));

        if (branch && branch !== 'All') {
            results = results.filter((job) =>
                job.eligibleBranches.includes(branch) ||
                job.eligibleBranches.includes('All Branches')
            );
        }

        if (type && type !== 'All') {
            results = results.filter((job) => job.jobType === type);
        }

        if (search) {
            const s = search.toLowerCase();
            results = results.filter((job) =>
                (job.companyName || '').toLowerCase().includes(s) ||
                (job.role || '').toLowerCase().includes(s)
            );
        }

        return results;
    } catch (error) {
    return [{ debugError: error.message }];
}
}

export async function updateJobDAL(id, updates) {
    if (isMongoConnected) {
        try {
            await JobModel.updateOne({
                customId: id
            }, {
                $set: updates
            });
        } catch (e) {
            console.warn('Mongo update error:', e);
        }
    }
    const idx = memoryJobs.findIndex((j)=>j.id === id);
    if (idx !== -1) {
        memoryJobs[idx] = {
            ...memoryJobs[idx],
            ...updates
        };
        return memoryJobs[idx];
    }
    return null;
}

export async function deleteJobDAL(id) {
    if (isMongoConnected) {
        try {
            await JobModel.deleteOne({
                customId: id
            });
        } catch (e) {
            console.warn('Mongo delete error:', e);
        }
    }
    const initialLen = memoryJobs.length;
    memoryJobs = memoryJobs.filter((j)=>j.id !== id);
    return memoryJobs.length < initialLen;
}
export async function getApplicationsDAL(studentId, jobId) {
    if (isMongoConnected) {
        try {
            const q = {};
            if (studentId) q.studentId = studentId;
            if (jobId) q.jobId = jobId;
            const docs = await ApplicationModel.find(q).sort({
                appliedAt: -1
            });
            return docs.map((d)=>({
                    id: d.customId,
                    jobId: d.jobId,
                    studentId: d.studentId,
                    studentName: d.studentName,
                    studentRoll: d.studentRoll,
                    studentEmail: d.studentEmail,
                    studentBranch: d.studentBranch,
                    studentCgpa: d.studentCgpa,
                    jobRole: d.jobRole,
                    companyName: d.companyName,
                    status: d.status,
                    appliedAt: d.appliedAt,
                    updatedAt: d.updatedAt,
                    notes: d.notes,
                    resumeUrl: d.resumeUrl,
                    interviewSlotId: d.interviewSlotId,
                    interviewRound: d.interviewRound,
                    interviewDate: d.interviewDate,
                    interviewTime: d.interviewTime,
                    interviewMeetingLink: d.interviewMeetingLink,
                    interviewLocation: d.interviewLocation,
                    offerDetails: d.offerDetails
                }));
        } catch (e) {
            console.warn('Mongo app fetch failed:', e);
        }
    }
    let list = [
        ...memoryApplications
    ];
    if (studentId) list = list.filter((a)=>a.studentId === studentId);
    if (jobId) list = list.filter((a)=>a.jobId === jobId);
    return list;
}
export async function createApplicationDAL(data) {
    const existing = memoryApplications.find((a)=>a.jobId === data.jobId && a.studentId === data.studentId);
    if (existing) {
        return existing;
    }
    const job = memoryJobs.find((j)=>j.id === data.jobId);
    if (!job) throw new Error('Placement drive not found');
    const appId = `app-${Date.now()}`;
    const newApp = {
        id: appId,
        jobId: job.id,
        studentId: memoryProfile.id,
        studentName: memoryProfile.name,
        studentRoll: memoryProfile.rollNumber,
        studentEmail: memoryProfile.email,
        studentBranch: memoryProfile.branch,
        studentCgpa: memoryProfile.cgpa,
        jobRole: job.role,
        companyName: job.companyName,
        status: 'Applied',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: data.notes || 'Applied via Student Campus Portal with latest verified ATS resume.',
        resumeUrl: memoryProfile.resumeUrl
    };
    if (isMongoConnected) {
        try {
            await ApplicationModel.create({
                ...newApp,
                customId: appId
            });
        } catch (e) {
            console.warn('Mongo create app error:', e);
        }
    }
    memoryApplications.unshift(newApp);
    return newApp;
}
export async function updateApplicationStatusDAL(id, updates) {
    updates.updatedAt = new Date().toISOString();
    if (isMongoConnected) {
        try {
            await ApplicationModel.updateOne({
                customId: id
            }, {
                $set: updates
            });
        } catch (e) {
            console.warn('Mongo update app status error:', e);
        }
    }
    const idx = memoryApplications.findIndex((a)=>a.id === id);
    if (idx !== -1) {
        memoryApplications[idx] = {
            ...memoryApplications[idx],
            ...updates
        };
        return memoryApplications[idx];
    }
    return null;
}
export async function getInterviewSlotsDAL(jobId, studentId) {
    if (isMongoConnected) {
        try {
            const q = {};
            if (jobId) q.jobId = jobId;
            if (studentId) q.bookedByStudentId = studentId;
            const docs = await SlotModel.find(q).sort({
                date: 1,
                startTime: 1
            });
            return docs.map((d)=>({
                    id: d.customId,
                    jobId: d.jobId,
                    companyName: d.companyName,
                    roundName: d.roundName,
                    interviewerName: d.interviewerName,
                    interviewerRole: d.interviewerRole,
                    date: d.date,
                    startTime: d.startTime,
                    endTime: d.endTime,
                    durationMinutes: d.durationMinutes,
                    meetingLink: d.meetingLink,
                    roomNumber: d.roomNumber,
                    isBooked: d.isBooked,
                    bookedByStudentId: d.bookedByStudentId,
                    bookedByStudentName: d.bookedByStudentName,
                    bookedByStudentRoll: d.bookedByStudentRoll,
                    notes: d.notes
                }));
        } catch (e) {
            console.warn('Mongo slots error:', e);
        }
    }
    let list = [
        ...memorySlots
    ];
    if (jobId) list = list.filter((s)=>s.jobId === jobId);
    if (studentId) list = list.filter((s)=>s.bookedByStudentId === studentId);
    return list;
}
export async function createInterviewSlotDAL(slotData) {
    const slotId = `slot-${Date.now()}`;
    const newSlot = {
        ...slotData,
        id: slotId,
        isBooked: false
    };
    if (isMongoConnected) {
        try {
            await SlotModel.create({
                ...newSlot,
                customId: slotId
            });
        } catch (e) {
            console.warn('Mongo slot create error:', e);
        }
    }
    memorySlots.push(newSlot);
    return newSlot;
}
export async function bookInterviewSlotDAL(slotId, studentId, studentName, studentRoll) {
    const slotIdx = memorySlots.findIndex((s)=>s.id === slotId);
    if (slotIdx === -1) throw new Error('Interview slot not found');
    if (memorySlots[slotIdx].isBooked && memorySlots[slotIdx].bookedByStudentId !== studentId) {
        throw new Error('This interview slot has already been reserved by another candidate.');
    }
    memorySlots[slotIdx].isBooked = true;
    memorySlots[slotIdx].bookedByStudentId = studentId;
    memorySlots[slotIdx].bookedByStudentName = studentName;
    memorySlots[slotIdx].bookedByStudentRoll = studentRoll;
    const appIdx = memoryApplications.findIndex((a)=>a.jobId === memorySlots[slotIdx].jobId && a.studentId === studentId);
    let updatedApp;
    if (appIdx !== -1) {
        memoryApplications[appIdx].status = 'Interview Scheduled';
        memoryApplications[appIdx].interviewSlotId = slotId;
        memoryApplications[appIdx].interviewRound = memorySlots[slotIdx].roundName;
        memoryApplications[appIdx].interviewDate = memorySlots[slotIdx].date;
        memoryApplications[appIdx].interviewTime = `${memorySlots[slotIdx].startTime} - ${memorySlots[slotIdx].endTime}`;
        memoryApplications[appIdx].interviewMeetingLink = memorySlots[slotIdx].meetingLink;
        memoryApplications[appIdx].interviewLocation = memorySlots[slotIdx].roomNumber || 'Virtual';
        memoryApplications[appIdx].updatedAt = new Date().toISOString();
        updatedApp = memoryApplications[appIdx];
    }
    if (isMongoConnected) {
        try {
            await SlotModel.updateOne({
                customId: slotId
            }, {
                $set: {
                    isBooked: true,
                    bookedByStudentId: studentId,
                    bookedByStudentName: studentName,
                    bookedByStudentRoll: studentRoll
                }
            });
            if (updatedApp) {
                await ApplicationModel.updateOne({
                    customId: updatedApp.id
                }, {
                    $set: updatedApp
                });
            }
        } catch (e) {
            console.warn('Mongo book slot sync error:', e);
        }
    }
    return {
        slot: memorySlots[slotIdx],
        application: updatedApp
    };
}
export async function cancelInterviewSlotDAL(slotId) {
    const slotIdx = memorySlots.findIndex((s)=>s.id === slotId);
    if (slotIdx === -1) throw new Error('Interview slot not found');
    const studentId = memorySlots[slotIdx].bookedByStudentId;
    const jobId = memorySlots[slotIdx].jobId;
    memorySlots[slotIdx].isBooked = false;
    memorySlots[slotIdx].bookedByStudentId = undefined;
    memorySlots[slotIdx].bookedByStudentName = undefined;
    memorySlots[slotIdx].bookedByStudentRoll = undefined;
    if (studentId && jobId) {
        const appIdx = memoryApplications.findIndex((a)=>a.jobId === jobId && a.studentId === studentId);
        if (appIdx !== -1) {
            memoryApplications[appIdx].status = 'Shortlisted';
            memoryApplications[appIdx].interviewSlotId = undefined;
            memoryApplications[appIdx].interviewDate = undefined;
            memoryApplications[appIdx].interviewTime = undefined;
            memoryApplications[appIdx].updatedAt = new Date().toISOString();
        }
    }
    if (isMongoConnected) {
        try {
            await SlotModel.updateOne({
                customId: slotId
            }, {
                $set: {
                    isBooked: false,
                    bookedByStudentId: null,
                    bookedByStudentName: null,
                    bookedByStudentRoll: null
                }
            });
        } catch (e) {
            console.warn('Mongo cancel slot error:', e);
        }
    }
    return memorySlots[slotIdx];
}
export async function getStudentProfileDAL() {
    if (isMongoConnected) {
        try {
            const doc = await ProfileModel.findOne();
            if (doc) {
                return {
                    id: doc.customId,
                    name: doc.name,
                    rollNumber: doc.rollNumber,
                    email: doc.email,
                    phone: doc.phone || '',
                    degree: doc.degree || '',
                    batch: doc.batch || '',
                    cgpa: doc.cgpa,
                    backlogs: doc.backlogs,
                    branch: doc.branch,
                    avatarUrl: doc.avatarUrl,
                    linkedin: doc.linkedin,
                    github: doc.github,
                    portfolio: doc.portfolio,
                    skills: doc.skills,
                    resumeUrl: doc.resumeUrl,
                    resumeFileName: doc.resumeFileName,
                    resumeUploadedAt: doc.resumeUploadedAt,
                    resumeAtsScore: doc.resumeAtsScore,
                    resumeSummary: doc.resumeSummary,
                    resumeParsedSkills: doc.resumeParsedSkills,
                    experience: doc.experience,
                    education: doc.education
                };
            }
        } catch (e) {
            console.warn('Mongo profile load failed:', e);
        }
    }
    return memoryProfile;
}
export async function updateStudentProfileDAL(updates) {
    memoryProfile = {
        ...memoryProfile,
        ...updates
    };
    if (isMongoConnected) {
        try {
            await ProfileModel.updateOne({
                customId: memoryProfile.id
            }, {
                $set: memoryProfile
            }, {
                upsert: true
            });
        } catch (e) {
            console.warn('Mongo profile update error:', e);
        }
    }
    return memoryProfile;
}
export async function createJobDAL(job) {
    const { data, error } = await supabase
        .from('jobs')
        .insert({
            company_name: job.companyName,
            job_title: job.role,
            description: job.description || '',
            eligibility: job.eligibility || '',
            application_deadline: job.deadline || null,
            company_logo: job.companyLogo || '',
            job_type: job.jobType || '',
            ctc: job.ctc || '',
            location: job.location || '',
            eligible_branches: job.eligibleBranches || [],
            min_cgpa: job.minCgpa ?? null,
            drive_date: job.driveDate || null,
            rounds: job.rounds || [],
            selection_process: job.selectionProcess || '',
            work_mode: job.workMode || 'On-site',
            open_positions: job.openPositions ?? 5,
            tags: job.tags || [],
            status: 'active'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
export async function getPlacementStatsDAL() {
    const total = 420;
    const placed = 368;
    const rate = Math.round(placed / total * 100);
    const upcomingInterviews = memorySlots.filter((s)=>s.isBooked).length;
    const offersCount = memoryApplications.filter((a)=>a.status === 'Offer Extended' || a.status === 'Offer Accepted').length;
    return {
        totalStudents: total,
        placedStudents: placed,
        placementRate: rate,
        averageCtc: '16.4 LPA',
        highestCtc: '54.0 LPA',
        totalCompanies: 84,
        activeDrives: memoryJobs.filter((j)=>j.status === 'Open').length,
        upcomingInterviewsCount: upcomingInterviews,
        offersExtendedCount: offersCount,
        branchStats: [
            {
                branch: 'Computer Science & Engineering',
                total: 160,
                placed: 154,
                rate: 96.2,
                avgCtc: '21.5 LPA'
            },
            {
                branch: 'Information Technology',
                total: 110,
                placed: 101,
                rate: 91.8,
                avgCtc: '18.2 LPA'
            },
            {
                branch: 'Electronics & Communication',
                total: 95,
                placed: 78,
                rate: 82.1,
                avgCtc: '14.0 LPA'
            },
            {
                branch: 'Data Science & AI',
                total: 55,
                placed: 51,
                rate: 92.7,
                avgCtc: '19.8 LPA'
            }
        ]
    };
}
export function getDbConnectionStatus() {
    return {
        connected: isMongoConnected,
        mode: isMongoConnected ? 'mongodb' : 'in-memory',
        uriProvided: Boolean(process.env.MONGODB_URI),
        driver: 'Mongoose / MongoDB Node.js Driver',
        collections: [
            'jobs',
            'applications',
            'slots',
            'profiles'
        ]
    };
}
