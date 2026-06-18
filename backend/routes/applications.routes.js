const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const applicationsController = require('../controllers/applications.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Ensure the local uploads directory exists
const uploadDir = process.env.STORAGE_PATH || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.txt', '.docx'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, and DOCX are allowed.'));
    }
  },
});

// Public application endpoint (applicants apply here)
router.post('/', upload.single('resume'), (req, res, next) => {
  // Wrap upload with error handler for clean responses
  next();
}, applicationsController.createApplication);

// Protected recruiter endpoint (retrieves candidates for company workspace)
router.get('/', authMiddleware, applicationsController.getApplications);

// Phase 2 endpoints
router.get('/:id', authMiddleware, applicationsController.getCandidateDetails);
router.patch('/:id/status', authMiddleware, applicationsController.updateApplicationStatus);
router.post('/:id/notes', authMiddleware, applicationsController.addCandidateNote);

module.exports = router;
