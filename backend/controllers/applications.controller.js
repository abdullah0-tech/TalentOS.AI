const prisma = require('../config/db');
const { parseResume } = require('../services/resumeParser.service');
const { analyzeResumeWithGrok } = require('../services/grok.service');
const { emitToCompany } = require('../services/socket.service');

exports.createApplication = async (req, res) => {
  try {
    const { jobId, candidateName, email, linkedinUrl, portfolioUrl } = req.body;

    if (!jobId || !candidateName || !email) {
      return res.status(400).json({ error: 'jobId, candidateName, and email are required fields.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Resume upload is required.' });
    }

    // Find the associated job post
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ error: 'The specified job posting was not found.' });
    }

    // Relative web URL to access the uploaded file
    const resumeUrl = `/uploads/${req.file.filename}`;

    // 1. Extract text from resume
    const resumeText = await parseResume(req.file.path, req.file.mimetype);

    // 2. Perform Grok AI analysis against job description
    const aiAnalysis = await analyzeResumeWithGrok(resumeText, job.description);

    // 3. Save application in DB
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateName,
        email,
        resumeUrl,
        linkedinUrl: linkedinUrl || null,
        portfolioUrl: portfolioUrl || null,
        aiScore: aiAnalysis.match_score,
        matchedSkills: JSON.stringify(aiAnalysis.matched_skills),
        missingSkills: JSON.stringify(aiAnalysis.missing_skills),
        aiSummary: aiAnalysis.summary,
        experienceLevel: aiAnalysis.experience_level,
        recommendation: aiAnalysis.recommendation,
        strengths: JSON.stringify(aiAnalysis.strengths || []),
        weaknesses: JSON.stringify(aiAnalysis.weaknesses || []),
        personalitySummary: aiAnalysis.personality_summary || null,
        communicationAssessment: aiAnalysis.communication_assessment || null,
        technicalStrength: aiAnalysis.technical_strength || null,
        leadershipPotential: aiAnalysis.leadership_potential || null,
        status: 'applied',
      },
    });

    // Fire Email Workflow Trigger: candidate-applied
    try {
      const { triggerWorkflow } = require('../services/workflow.service');
      await triggerWorkflow('candidate-applied', {
        companyId: job.companyId,
        candidateId: application.id,
        details: {
          candidate_name: candidateName,
          job_title: job.title
        }
      });
    } catch (err) {
      console.error('Failed to trigger candidate-applied workflow:', err.message);
    }

    // 4. Record Activity & Emit Realtime Event for Recruiter Alert
    const firstAdmin = await prisma.user.findFirst({
      where: { companyId: job.companyId }
    });

    if (firstAdmin) {
      await prisma.activity.create({
        data: {
          companyId: job.companyId,
          userId: firstAdmin.id,
          action: `New application submitted by candidate: ${candidateName} for "${job.title}"`
        }
      });
    }

    const notification = await prisma.notification.create({
      data: {
        companyId: job.companyId,
        title: 'New Application',
        message: `Candidate ${candidateName} applied for the position of ${job.title}. AI Match Score: ${aiAnalysis.match_score}%.`,
        type: 'info'
      }
    });

    emitToCompany(job.companyId, 'new_notification', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
      isRead: notification.isRead
    });

    // Notify of new candidate application on Kanban board
    emitToCompany(job.companyId, 'candidate_applied', {
      applicationId: application.id,
      jobTitle: job.title,
      candidateName,
      aiScore: aiAnalysis.match_score
    });

    res.status(201).json({
      message: 'Application submitted successfully.',
      application,
    });
  } catch (error) {
    console.error('Submit Application Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your application.' });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { jobId } = req.query;

    const where = {
      job: {
        companyId,
      },
    };

    // Filter by specific job if provided
    if (jobId) {
      where.jobId = jobId;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            title: true,
            department: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching candidate applications.' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const companyId = req.user.companyId;
    const userId = req.user.id;

    const allowedStatuses = ['applied', 'screening', 'shortlisted', 'interview', 'hired', 'rejected', 'offered', 'offer'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    // Verify application belongs to user's company
    const application = await prisma.application.findFirst({
      where: {
        id,
        job: { companyId }
      },
      include: {
        job: true
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Candidate application not found.' });
    }

    const previousStatus = application.status;

    // Update status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        job: {
          select: {
            title: true
          }
        }
      }
    });

    // Trigger Email Workflows
    try {
      const { triggerWorkflow } = require('../services/workflow.service');
      if (status === 'shortlisted') {
        await triggerWorkflow('shortlisted', {
          companyId,
          userId,
          candidateId: id,
          details: {
            candidate_name: application.candidateName,
            job_title: application.job.title
          }
        });
      } else if (status === 'rejected') {
        await triggerWorkflow('rejected', {
          companyId,
          userId,
          candidateId: id,
          details: {
            candidate_name: application.candidateName,
            job_title: application.job.title
          }
        });
      } else if (status === 'offered' || status === 'offer') {
        await triggerWorkflow('offer-letter', {
          companyId,
          userId,
          candidateId: id,
          details: {
            candidate_name: application.candidateName,
            job_title: application.job.title,
            salary: '$115,000 / year',
            start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
          }
        });
      } else if (status === 'hired') {
        await triggerWorkflow('hired', {
          companyId,
          userId,
          candidateId: id,
          details: {
            candidate_name: application.candidateName,
            job_title: application.job.title,
            start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            department: application.job.department || 'Engineering',
            manager_name: 'Hiring Manager'
          }
        });
      }
    } catch (err) {
      console.error('Failed to trigger status change email workflow:', err.message);
    }

    // Create activity log
    await prisma.activity.create({
      data: {
        companyId,
        userId,
        action: `Moved candidate ${application.candidateName} from status "${previousStatus}" to "${status}"`
      }
    });

    // Create Notification on major status shifts (Shortlisted, Hired, Rejected)
    if (['shortlisted', 'hired', 'rejected'].includes(status)) {
      const title = status.charAt(0).toUpperCase() + status.slice(1);
      const notification = await prisma.notification.create({
        data: {
          companyId,
          title: `Candidate ${title}`,
          message: `Candidate ${application.candidateName} has been marked as ${status} for "${application.job.title}".`,
          type: status === 'rejected' ? 'warning' : 'success'
        }
      });

      emitToCompany(companyId, 'new_notification', {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        createdAt: notification.createdAt,
        isRead: notification.isRead
      });
    }

    // Emit Socket event to keep Kanban UI state perfectly synchronized for other active recruiters
    emitToCompany(companyId, 'candidate_status_updated', {
      candidateId: id,
      status
    });

    res.status(200).json({
      message: 'Candidate pipeline status updated successfully.',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Update Application Status Error:', error);
    res.status(500).json({ error: 'An error occurred while updating pipeline stage.' });
  }
};

exports.addCandidateNote = async (req, res) => {
  try {
    const { id } = req.params; // candidateId
    const { note } = req.body;
    const companyId = req.user.companyId;
    const userId = req.user.id;

    if (!note || note.trim() === '') {
      return res.status(400).json({ error: 'Note content cannot be empty.' });
    }

    // Verify candidate application exists in company workspace
    const candidate = await prisma.application.findFirst({
      where: {
        id,
        job: { companyId }
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate application not found.' });
    }

    // Create Note
    const candidateNote = await prisma.candidateNote.create({
      data: {
        candidateId: id,
        userId,
        note
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    // Record Activity log
    await prisma.activity.create({
      data: {
        companyId,
        userId,
        action: `Added feedback comment to candidate ${candidate.candidateName}`
      }
    });

    res.status(201).json({
      message: 'Comment added successfully.',
      note: candidateNote
    });
  } catch (error) {
    console.error('Add Candidate Note Error:', error);
    res.status(500).json({ error: 'An error occurred while logging candidate note.' });
  }
};

exports.getCandidateDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const candidate = await prisma.application.findFirst({
      where: {
        id,
        job: { companyId }
      },
      include: {
        job: {
          select: {
            title: true,
            department: true,
            location: true,
            description: true,
            skills: true
          }
        },
        notes: {
          include: {
            user: {
              select: {
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        interviews: {
          include: {
            interviewer: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate application not found.' });
    }

    res.status(200).json(candidate);
  } catch (error) {
    console.error('Get Candidate Details Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching candidate file details.' });
  }
};
