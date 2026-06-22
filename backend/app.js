const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined. Application cannot start securely.');
  process.exit(1);
}

const authRoutes = require('./routes/auth.routes');
const jobsRoutes = require('./routes/jobs.routes');
const applicationsRoutes = require('./routes/applications.routes');
const interviewsRoutes = require('./routes/interviews.routes');
const employeesRoutes = require('./routes/employees.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const chatRoutes = require('./routes/chat.routes');
const aiRoutes = require('./routes/ai.routes');
const knowledgeRoutes = require('./routes/knowledge.routes');
const auditRoutes = require('./routes/audit.routes');
const onboardingRoutes = require('./routes/onboarding.routes');
const leaveRoutes = require('./routes/leave.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const performanceRoutes = require('./routes/performance.routes');
const goalRoutes = require('./routes/goal.routes');
const trainingRoutes = require('./routes/training.routes');
const documentRoutes = require('./routes/document.routes');
const automationRoutes = require('./routes/automation.routes');
const insightsRoutes = require('./routes/insights.routes');
const billingRoutes = require('./routes/billing.routes');
const organizationRoutes = require('./routes/organization.routes');
const integrationsRoutes = require('./routes/integrations.routes');
const payrollRoutes = require('./routes/payroll.routes');
const securityRoutes = require('./routes/security.routes');
const whitelabelRoutes = require('./routes/whitelabel.routes');
const aiExecutiveRoutes = require('./routes/aiexecutive.routes');
const emailsRoutes = require('./routes/emails.routes');
const feedbackRoutes = require('./routes/feedback.routes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const socketService = require('./services/socket.service');
socketService.init(server);

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins (including dynamic Vercel URLs)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists static route
const uploadsPath = process.env.STORAGE_PATH || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Root route for deployment verification
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'HireFlow AI Backend',
    status: 'active',
    message: 'Backend is up and running successfully.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

// API Index route
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'HireFlow AI API Index',
    version: '1.0.0',
    documentation: 'Append specific endpoint paths to use the API (e.g., /api/auth)',
    endpoints: [
      '/api/auth', '/api/jobs', '/api/applications', '/api/interviews',
      '/api/employees', '/api/notifications', '/api/analytics', '/api/chat',
      '/api/ai', '/api/knowledge', '/api/audit-logs', '/api/onboarding',
      '/api/leave', '/api/attendance', '/api/performance-review', '/api/goals',
      '/api/training', '/api/documents', '/api/automation', '/api/workforce-insights',
      '/api/billing', '/api/organization', '/api/integrations', '/api/payroll',
      '/api/security', '/api/whitelabel', '/api/aiexecutive', '/api/emails',
      '/api/feedback'
    ]
  });
});

// Router mounting
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance-review', performanceRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/workforce-insights', insightsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/whitelabel', whitelabelRoutes);
app.use('/api/aiexecutive', aiExecutiveRoutes);
app.use('/api/emails', emailsRoutes);
app.use('/api/feedback', feedbackRoutes);

// Direct AI Resume Screening route (protected)
const authMiddleware = require('./middleware/auth.middleware');
const { parseResume } = require('./services/resumeParser.service');
const { analyzeResumeWithGrok } = require('./services/grok.service');
const multer = require('multer');

const tempUpload = multer({ dest: path.join(__dirname, 'uploads/temp') });

app.post('/api/ai/analyze-resume', authMiddleware, tempUpload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume file under the field "resume".' });
    }
    const { jd } = req.body;
    if (!jd) {
      return res.status(400).json({ error: 'Job description text "jd" is required.' });
    }

    const text = await parseResume(req.file.path, req.file.mimetype);
    const analysis = await analyzeResumeWithGrok(text, jd);

    // Delete temporary parsed file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to clear temp file:', err);
    });

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Direct AI API Screening Error:', error);
    res.status(500).json({ error: 'Resume analysis failed.' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler caught:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred.',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🚀 HireFlow AI Backend Server active on port ${PORT}`);
  console.log(`=================================================`);
  
  // Start the background email queue worker
  const { startQueueWorker } = require('./services/emailQueue.service');
  startQueueWorker();
});

module.exports = app;

