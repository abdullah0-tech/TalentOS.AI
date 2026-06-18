const prisma = require('../config/db');
const { compileText, DEFAULT_TEMPLATES } = require('./emailTemplates');
const { queueEmail } = require('./emailQueue.service');

/**
 * Dispatches an automated email workflow event by compiling settings and queuing.
 * 
 * @param {string} eventType - The email template type (e.g. 'shortlisted')
 * @param {Object} context - Context payload
 * @param {string} context.companyId - Tenant company ID (required)
 * @param {string} [context.userId] - User who initiated the action
 * @param {string} [context.candidateId] - Candidate application ID
 * @param {string} [context.employeeId] - Employee ID
 * @param {string} [context.email] - Override recipient email
 * @param {Object} [context.details] - Variables to inject in subject/body templates
 */
async function triggerWorkflow(eventType, context) {
  try {
    const { companyId, userId, candidateId, employeeId, details = {} } = context;
    if (!companyId) {
      console.warn(`⚠️ Workflow Engine: Skipping trigger '${eventType}' because companyId is missing.`);
      return;
    }

    const defaultTmpl = DEFAULT_TEMPLATES[eventType];
    if (!defaultTmpl) {
      console.error(`❌ Workflow Engine: Unknown event type '${eventType}'`);
      return;
    }

    let recipientEmail = context.email;
    let contextVars = { ...details };

    // Resolve company name
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    });
    const companyName = company ? company.name : 'HireFlow AI Partner';
    contextVars.company_name = companyName;

    // Load Candidate details if candidateId is provided
    if (candidateId) {
      const candidate = await prisma.application.findUnique({
        where: { id: candidateId },
        include: { job: true }
      });
      if (candidate) {
        recipientEmail = recipientEmail || candidate.email;
        contextVars.candidate_name = contextVars.candidate_name || candidate.candidateName;
        contextVars.job_title = contextVars.job_title || candidate.job.title;
        contextVars.email = contextVars.email || candidate.email;
      }
    }

    // Load Employee details if employeeId is provided
    if (employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId }
        // NOTE: Do NOT join invites here — the DB token is hashed and must NEVER be
        // placed directly in a URL. The plaintext token must come from the caller via details.
      });
      if (employee) {
        recipientEmail = recipientEmail || employee.email;
        contextVars.employee_name = contextVars.employee_name || employee.name;
        contextVars.email = contextVars.email || employee.email;
        contextVars.department = contextVars.department || employee.department;
        contextVars.position = contextVars.position || employee.position;
        // invite_link is intentionally NOT set here.
        // It must be supplied by the caller via details.invite_link (with the plaintext token).
        // The token stored in the DB is SHA-256 hashed and placing it in a URL would cause
        // double-hashing on validation, resulting in "Invalid invitation link" errors.
      }
    }

    if (!recipientEmail) {
      console.warn(`⚠️ Workflow Engine: Could not resolve recipient email for event '${eventType}'. Skipping.`);
      return;
    }

    // Load customized company template if it exists
    let customTemplate = null;
    try {
      customTemplate = await prisma.emailTemplate.findFirst({
        where: { companyId, name: eventType }
      });
    } catch (e) {
      // If table doesn't exist or other error, fallback to default
    }

    const subjectTemplate = customTemplate?.subject || defaultTmpl.subject;
    const subject = compileText(subjectTemplate, contextVars);

    // Queue email in the background runner
    // Pass relevant context vars as metadata so renderTemplateBody can safely access them
    // (e.g. invite_link with the plaintext token for employee-invitation emails)
    const metadata = {};
    if (contextVars.invite_link) metadata.plaintextToken = contextVars.invite_link.split('token=')[1] || null;
    if (contextVars.reset_link) metadata.resetLink = contextVars.reset_link;

    return await queueEmail({
      companyId,
      eventType,
      email: recipientEmail,
      subject,
      candidateId,
      employeeId,
      userId,
      metadata: Object.keys(metadata).length > 0 ? metadata : null
    });
  } catch (error) {
    console.error(`❌ Workflow Engine Error (Event: ${eventType}):`, error);
  }
}

/**
 * Periodically scans for upcoming interviews and queues 24-hour reminders.
 */
async function scheduleInterviewReminders() {
  try {
    const now = new Date();
    const targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Find interviews occurring in the 24h window that haven't sent reminders
    const interviews = await prisma.interview.findMany({
      where: {
        status: 'scheduled',
        reminderSent: false,
        date: {
          gt: now,
          lte: targetTime
        }
      },
      include: {
        candidate: {
          select: {
            id: true,
            candidateName: true,
            email: true,
            job: { select: { title: true, companyId: true } }
          }
        }
      }
    });

    if (interviews.length > 0) {
      console.log(`⏰ Reminder Scheduler: Found ${interviews.length} upcoming interviews needing reminders.`);
    }

    for (const interview of interviews) {
      const candidate = interview.candidate;
      if (!candidate || !candidate.job) continue;

      const job = candidate.job;

      // Trigger workflow queue
      await triggerWorkflow('interview-reminder', {
        companyId: job.companyId,
        candidateId: candidate.id,
        details: {
          candidate_name: candidate.candidateName,
          job_title: job.title,
          date: interview.date.toLocaleDateString(),
          time: interview.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          meeting_link: interview.meetingLink || 'Video Room'
        }
      });

      // Mark as reminder sent
      await prisma.interview.update({
        where: { id: interview.id },
        data: { reminderSent: true }
      });
    }
  } catch (error) {
    console.error('❌ Reminder Scheduler Error:', error.message);
  }
}

module.exports = {
  triggerWorkflow,
  scheduleInterviewReminders
};
