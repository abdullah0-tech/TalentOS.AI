const prisma = require('../config/db');
const { triggerWorkflow } = require('../services/workflow.service');
const { sendEmailDirect } = require('../services/email.service');
const { compileAndWrap } = require('../services/emailTemplates');

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

    let workspaceName = 'Public Workspace';
    if (companyId) {
      const comp = await prisma.company.findUnique({ where: { id: companyId } });
      if (comp && comp.name) workspaceName = comp.name;
    }

    const submissionType = type || 'General Feedback';
    const subject = req.body.subject || `${submissionType}: ${message.substring(0, 50)}...`;
    const timestamp = new Date().toISOString();
    const osInfo = req.body.os || 'Windows/OS';
    const attachmentVal = screenshotUrl || req.body.attachment || 'None';

    // 1. Automatically forward to talentosai.contact@gmail.com
    const adminEmailPayload = compileAndWrap('admin-notification', null, null, {
      submission_type: submissionType,
      subject: subject,
      name: req.user ? req.user.name : (req.body.name || 'Anonymous'),
      email: req.user ? req.user.email : (req.body.email || 'N/A'),
      company: workspaceName,
      phone: req.body.phone || 'N/A',
      workspace_name: workspaceName,
      role: req.user ? req.user.role : (role || 'Member'),
      priority: priority,
      browser: browser || 'Standard Browser',
      os: osInfo,
      timestamp: timestamp,
      ip_address: req.ip || '127.0.0.1',
      attachment: attachmentVal,
      message: message
    }, { name: 'TalentOS AI Platform' });

    await sendEmailDirect({
      companyId: companyId || null,
      to: 'talentosai.contact@gmail.com',
      subject: adminEmailPayload.subject,
      html: adminEmailPayload.html,
      eventType: 'feedback-notification'
    });

    // 2. Automatically send confirmation email to sender
    if (req.user && req.user.email) {
      let tmplName = 'feedback-received';
      if (submissionType.toLowerCase().includes('bug')) tmplName = 'bug-report-received';
      else if (submissionType.toLowerCase().includes('feature')) tmplName = 'feature-request-received';

      const userEmailPayload = compileAndWrap(tmplName, null, null, {
        name: req.user.name,
        subject: subject,
        message: message,
        priority: priority,
        browser: browser || 'Standard Browser',
        os: osInfo
      }, { name: 'TalentOS AI Platform' });

      await sendEmailDirect({
        companyId: companyId || null,
        to: req.user.email,
        subject: userEmailPayload.subject,
        html: userEmailPayload.html,
        eventType: 'feedback-confirmation'
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
