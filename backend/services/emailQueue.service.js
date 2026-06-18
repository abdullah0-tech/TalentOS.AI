const prisma = require('../config/db');
const { sendEmailFromLog } = require('./email.service');
const { emitToCompany } = require('./socket.service');

// Track if queue is currently processing to avoid concurrent overlapping runs
let isProcessing = false;
let workerIntervalId = null;

/**
 * Inserts a pending email into the queue logs and triggers immediate processing.
 * 
 * @param {Object} params
 * @param {string} params.companyId - Tenant company identifier
 * @param {string} params.eventType - Automation event (e.g. 'candidate-applied')
 * @param {string} params.email - Recipient email
 * @param {string} params.subject - Email subject line
 * @param {string} [params.candidateId] - Associated candidate application ID
 * @param {string} [params.employeeId] - Associated employee ID
 * @param {string} [params.userId] - User who triggered the action
 * @returns {Promise<Object>} - The created EmailLog record
 */
async function queueEmail({ companyId, eventType, email, subject, candidateId = null, employeeId = null, userId = null, metadata = null }) {
  if (!companyId || !email || !eventType || !subject) {
    throw new Error('companyId, email, eventType, and subject are required to queue an email.');
  }

  // Check if this event type is enabled for the company
  const settings = await prisma.emailSetting.findUnique({
    where: { companyId }
  });

  const enabledEvents = settings?.enabledEvents 
    ? settings.enabledEvents.split(',') 
    : ['candidate-applied', 'shortlisted', 'interview-scheduled', 'interview-reminder', 'rejected', 'offer-letter', 'hired', 'employee-invitation', 'account-activated', 'password-reset', 'leave-approved', 'leave-rejected'];

  if (!enabledEvents.includes(eventType)) {
    console.log(`🔇 Workflow Engine: Event '${eventType}' is disabled in settings for company ${companyId}. Skipping queue.`);
    return null;
  }

  const log = await prisma.emailLog.create({
    data: {
      companyId,
      userId,
      candidateId,
      employeeId,
      email,
      eventType,
      subject,
      status: 'pending',
      provider: settings?.provider || 'console',
      retryCount: 0,
      nextAttempt: new Date(), // Process immediately
      metadata: metadata || undefined
    }
  });

  console.log(`📥 Queue Manager: Queued '${eventType}' email for ${email} (Log ID: ${log.id})`);

  // Trigger immediate async queue sweep
  processQueueImmediately();

  return log;
}

/**
 * Scans the database for pending emails that are due and processes them.
 */
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    // Run upcoming interview reminder scanner
    try {
      const { scheduleInterviewReminders } = require('./workflow.service');
      await scheduleInterviewReminders();
    } catch (err) {
      console.error('❌ Queue Worker Reminder Error:', err.message);
    }

    const now = new Date();
    
    // Find all pending email logs that are scheduled to run
    const pendingLogs = await prisma.emailLog.findMany({
      where: {
        status: 'pending',
        OR: [
          { nextAttempt: null },
          { nextAttempt: { lte: now } }
        ]
      },
      take: 10 // Process in batches to prevent server blocks
    });

    if (pendingLogs.length > 0) {
      console.log(`⚙️ Queue Worker: Processing ${pendingLogs.length} pending emails...`);
    }

    for (const log of pendingLogs) {
      const previousStatus = log.status;
      
      // Execute the email sending
      const updatedLog = await sendEmailFromLog(log.id);

      // Emit log update event to refresh UI lists in real-time
      emitToCompany(log.companyId, 'email_log_updated', {
        id: updatedLog.id,
        status: updatedLog.status,
        errorMessage: updatedLog.errorMessage,
        retryCount: updatedLog.retryCount
      });

      // Handle Success / Permanent Failure Notifications
      if (updatedLog.status === 'sent') {
        const notif = await prisma.notification.create({
          data: {
            companyId: log.companyId,
            title: 'Email Sent Successfully',
            message: `Event '${log.eventType}' notification sent to ${log.email}.`,
            type: 'success'
          }
        });

        // Log Activity
        const firstAdmin = await prisma.user.findFirst({
          where: { companyId: log.companyId }
        });
        await prisma.activity.create({
          data: {
            companyId: log.companyId,
            userId: log.userId || firstAdmin?.id || '',
            action: `Email Sent: Event '${log.eventType}' notification sent to ${log.email}`
          }
        });

        emitToCompany(log.companyId, 'new_notification', {
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          createdAt: notif.createdAt,
          isRead: notif.isRead
        });
      } else if (updatedLog.status === 'failed') {
        const notif = await prisma.notification.create({
          data: {
            companyId: log.companyId,
            title: 'Email Delivery Failed',
            message: `Failed to deliver '${log.eventType}' email to ${log.email} after multiple attempts.`,
            type: 'error'
          }
        });

        emitToCompany(log.companyId, 'new_notification', {
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          createdAt: notif.createdAt,
          isRead: notif.isRead
        });
      }
    }
  } catch (error) {
    console.error('Queue Worker Execution Error:', error);
  } finally {
    isProcessing = false;
  }
}

/**
 * Triggers a queue process sweep immediately in the background.
 */
function processQueueImmediately() {
  setImmediate(() => {
    processQueue().catch(err => console.error('Immediate queue sweep failed:', err));
  });
}

/**
 * Starts the background polling interval worker.
 */
function startQueueWorker(intervalMs = 20000) {
  if (workerIntervalId) return;
  
  // Initial sweep
  processQueueImmediately();
  
  workerIntervalId = setInterval(() => {
    processQueue().catch(err => console.error('Interval queue sweep failed:', err));
  }, intervalMs);

  console.log(`🤖 Queue Worker: Active and polling database every ${intervalMs / 1000}s`);
}

/**
 * Stops the background polling worker.
 */
function stopQueueWorker() {
  if (workerIntervalId) {
    clearInterval(workerIntervalId);
    workerIntervalId = null;
    console.log('🤖 Queue Worker: Deactivated.');
  }
}

module.exports = {
  queueEmail,
  processQueue,
  processQueueImmediately,
  startQueueWorker,
  stopQueueWorker
};
