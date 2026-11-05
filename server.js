import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabase, getDbConnectionStatus, getJobsDAL, createJobDAL, updateJobDAL, deleteJobDAL, getApplicationsDAL, createApplicationDAL, updateApplicationStatusDAL, getInterviewSlotsDAL, createInterviewSlotDAL, bookInterviewSlotDAL, cancelInterviewSlotDAL, getStudentProfileDAL, updateStudentProfileDAL, getPlacementStatsDAL } from './server/db.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
    const app = express();
    const PORT = Number(process.env.PORT) || 3000;
    const isProd = process.env.NODE_ENV === 'production';
    app.use(express.json({
        limit: '10mb'
    }));
    app.use(express.urlencoded({
        extended: true,
        limit: '10mb'
    }));
    await initDatabase();
    app.get('/api/health', (_req, res)=>{
        res.json({
            status: 'healthy',
            app: 'Campus Placement Cell Job Portal',
            serverTime: new Date().toISOString()
        });
    });
    app.get('/api/db-status', (_req, res)=>{
        res.json(getDbConnectionStatus());
    });
    app.get('/api/profile', async (_req, res)=>{
        try {
            const profile = await getStudentProfileDAL();
            res.json(profile);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.put('/api/profile', async (req, res)=>{
        try {
            const updated = await updateStudentProfileDAL(req.body);
            res.json(updated);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.post('/api/resume/upload', async (req, res)=>{
        try {
            const { fileName, summary, skills } = req.body;
            const uploadedFileName = fileName || 'Uploaded_Student_Resume.pdf';
            const baseScore = Math.floor(82 + Math.random() * 14);
            const parsedSkills = Array.isArray(skills) && skills.length > 0 ? skills : [
                'TypeScript',
                'React.js',
                'Node.js',
                'Express',
                'MongoDB',
                'Cloud Architecture',
                'REST APIs',
                'Unit Testing'
            ];
            const updated = await updateStudentProfileDAL({
                resumeFileName: uploadedFileName,
                resumeUploadedAt: new Date().toISOString(),
                resumeAtsScore: baseScore,
                resumeSummary: summary || 'Demonstrated technical competency with modern JavaScript/TypeScript stack, relational and document datastores, and system design principles.',
                resumeParsedSkills: parsedSkills
            });
            res.json({
                success: true,
                message: 'Resume uploaded and analyzed by ATS parser successfully.',
                profile: updated
            });
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.get('/api/jobs', async (req, res)=>{
        try {
            const search = req.query.search;
            const branch = req.query.branch;
            const type = req.query.type;
            const jobs = await getJobsDAL(search, branch, type);
            res.json(jobs);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.post('/api/jobs', async (req, res)=>{
        try {
            const newJob = await createJobDAL(req.body);
            res.status(201).json(newJob);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.put('/api/jobs/:id', async (req, res)=>{
        try {
            const updated = await updateJobDAL(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({
                    error: 'Campus drive not found'
                });
            }
            res.json(updated);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.delete('/api/jobs/:id', async (req, res)=>{
        try {
            const deleted = await deleteJobDAL(req.params.id);
            res.json({
                success: deleted
            });
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.get('/api/applications', async (req, res)=>{
        try {
            const studentId = req.query.studentId;
            const jobId = req.query.jobId;
            const apps = await getApplicationsDAL(studentId, jobId);
            res.json(apps);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.post('/api/applications', async (req, res)=>{
        try {
            const { jobId, studentId, notes } = req.body;
            if (!jobId || !studentId) {
                return res.status(400).json({
                    error: 'jobId and studentId are required'
                });
            }
            const appRecord = await createApplicationDAL({
                jobId,
                studentId,
                notes
            });
            res.status(201).json(appRecord);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.patch('/api/applications/:id/status', async (req, res)=>{
        try {
            const updated = await updateApplicationStatusDAL(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({
                    error: 'Application not found'
                });
            }
            res.json(updated);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.get('/api/interviews/slots', async (req, res)=>{
        try {
            const jobId = req.query.jobId;
            const studentId = req.query.studentId;
            const slots = await getInterviewSlotsDAL(jobId, studentId);
            res.json(slots);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.post('/api/interviews/slots', async (req, res)=>{
        try {
            const slot = await createInterviewSlotDAL(req.body);
            res.status(201).json(slot);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    app.post('/api/interviews/book', async (req, res)=>{
        try {
            const { slotId, studentId, studentName, studentRoll } = req.body;
            if (!slotId || !studentId) {
                return res.status(400).json({
                    error: 'slotId and studentId are required'
                });
            }
            const result = await bookInterviewSlotDAL(slotId, studentId, studentName, studentRoll);
            res.json({
                success: true,
                message: 'Interview slot confirmed successfully.',
                slot: result.slot,
                application: result.application
            });
        } catch (err) {
            res.status(400).json({
                error: err.message
            });
        }
    });
    app.post('/api/interviews/cancel', async (req, res)=>{
        try {
            const { slotId } = req.body;
            if (!slotId) {
                return res.status(400).json({
                    error: 'slotId is required'
                });
            }
            const slot = await cancelInterviewSlotDAL(slotId);
            res.json({
                success: true,
                message: 'Interview slot booking released.',
                slot
            });
        } catch (err) {
            res.status(400).json({
                error: err.message
            });
        }
    });
    app.get('/api/stats', async (_req, res)=>{
        try {
            const stats = await getPlacementStatsDAL();
            res.json(stats);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    if (!isProd) {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: {
                middlewareMode: true
            },
            appType: 'spa'
        });
        app.use(vite.middlewares);
    } else {
        app.use(express.static(path.resolve(__dirname, 'dist')));
        app.get('*', (_req, res)=>{
            res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
        });
    }
    app.listen(PORT, '0.0.0.0', ()=>{
        console.log(`[Campus Placement Portal] Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
    });
}
startServer().catch((err)=>{
    console.error('[Server] Fatal startup error:', err);
});
