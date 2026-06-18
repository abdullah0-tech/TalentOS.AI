const prisma = require('../config/db');
const { triggerWorkflow } = require('../services/workflow.service');

// Submit new feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { type, message, priority, pageUrl, browser, role, appVersion, screenshotUrl } = req.body;
    
    if (!type || !message || !priority) {
      return res.status(400).json({ error: 'Type, message, and priority are required' });
    }

    const companyId = req.user ? req.user.companyId : null;
    const userId = req.user ? req.user.id : null;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized to submit feedback. Must be logged in.' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        companyId,
        userId,
        type,
        message,
        priority,
        pageUrl,
        browser,
        role,
        appVersion,
        screenshotUrl,
        status: 'New'
      }
    });

    // Notify Admins
    const admins = await prisma.user.findMany({
      where: { companyId, role: { in: ['admin', 'owner'] }, isDemo: false }
    });

    for (const admin of admins) {
      await triggerWorkflow('new-feedback', {
        companyId,
        email: admin.email,
        details: {
          feedback_type: type,
          feedback_message: message,
          feedback_priority: priority,
          user_name: req.user ? req.user.name : 'Guest'
        }
      });
    }

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Get feedback for Admin Dashboard
exports.getFeedback = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    const feedbackList = await prisma.feedback.findMany({
      where: { companyId },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = feedbackList.length;
    const openIssues = feedbackList.filter(f => f.status === 'New' || f.status === 'In Review').length;
    const resolvedIssues = feedbackList.filter(f => f.status === 'Completed').length;
    const featureRequests = feedbackList.filter(f => f.type === 'Feature Request').length;
    const bugReports = feedbackList.filter(f => f.type === 'Bug Report').length;

    res.status(200).json({
      feedback: feedbackList,
      metrics: { total, openIssues, resolvedIssues, featureRequests, bugReports }
    });
  } catch (error) {
    console.error('Get Feedback Error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (req.user.email === 'demo@talentos.ai') {
        return res.status(403).json({ error: 'Demo users cannot update feedback status' });
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ message: 'Status updated', feedback });
  } catch (error) {
    console.error('Update Feedback Status Error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};
