const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobs.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public route: View job details by slug (e.g. on Careers page)
router.get('/:slug', jobsController.getJobBySlug);

// Tenant-protected routes
router.post('/', authMiddleware, jobsController.createJob);
router.get('/', authMiddleware, jobsController.getJobs);
router.put('/:id', authMiddleware, jobsController.updateJob);

module.exports = router;
