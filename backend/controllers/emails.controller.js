const prisma = require('../config/db');
const nodemailer = require('nodemailer');
const { sendEmailDirect } = require('../services/email.service');
const { queueEmail, processQueueImmediately } = require('../services/emailQueue.service');
const { triggerWorkflow } = require('../services/workflow.service');
const { compileAndWrap, DEFAULT_TEMPLATES } = require('../services/emailTemplates');
const { encrypt, decrypt } = require('../utils/encryption');
const { clearTransporterCache } = require('../services/email.service');

/**
 * GET /api/emails/settings
 * Retrieves or initializes company email config settings.
 * Returns password masked for display (only checks if it's set, but never sends raw value).
 */
exports.getEmailSettings = async (req, res) => {
  try {
    const { companyId } = req.user;

    let settings = await prisma.emailSetting.findUnique({
      where: { companyId }
    });

    // Initialize with default settings if not configured
    if (!settings) {
      settings = await prisma.emailSetting.create({
        data: {
          companyId,
          provider: 'console',
          senderName: 'HireFlow AI',
          senderEmail: 'noreply@hireflow.ai',
          smtpEncryption: 'TLS'
        }
      });
    }

    // Return settings with password masked (show only if set indicator)
    const sanitized = {
      ...settings,
      smtpPass: settings.smtpPass ? '••••••••••••' : '',
      smtpPassIsSet: !!settings.smtpPass,
      resendApiKey: settings.resendApiKey ? '••••••••••••' : '',
      sendgridApiKey: settings.sendgridApiKey ? '••••••••••••' : ''
    };

    res.status(200).json(sanitized);
  } catch (error) {
    console.error('Get Email Settings Error:', error);
    res.status(500).json({ error: 'Failed to retrieve email settings.' });
  }
};

/**
 * POST /api/emails/settings
 * Saves/updates company email configuration settings.
 * SMTP password is encrypted before storage.
 */
exports.updateEmailSettings = async (req, res) => {
  try {
    const { companyId } = req.user;
    const {
      provider,
      resendApiKey,
      sendgridApiKey,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpSecure,
      smtpEncryption,
      replyToEmail,
      senderName,
      senderEmail,
      enabledEvents
    } = req.body;

    const allowedProviders = ['resend', 'sendgrid', 'smtp', 'console'];
    if (provider && !allowedProviders.includes(provider)) {
      return res.status(400).json({ error: `Invalid provider. Must be one of: ${allowedProviders.join(', ')}` });
    }

    const allowedEncryptions = ['TLS', 'SSL', 'None'];
    if (smtpEncryption && !allowedEncryptions.includes(smtpEncryption)) {
      return res.status(400).json({ error: `Invalid encryption type. Must be one of: ${allowedEncryptions.join(', ')}` });
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (senderEmail && !emailRegex.test(senderEmail)) {
      return res.status(400).json({ error: 'Sender email must be a valid email address.' });
    }
    if (replyToEmail && !emailRegex.test(replyToEmail)) {
      return res.status(400).json({ error: 'Reply-To email must be a valid email address.' });
    }

    const data = {};
    if (provider !== undefined) data.provider = provider;
    if (resendApiKey !== undefined && resendApiKey !== '••••••••••••') data.resendApiKey = resendApiKey;
    if (sendgridApiKey !== undefined && sendgridApiKey !== '••••••••••••') data.sendgridApiKey = sendgridApiKey;
    if (smtpHost !== undefined) data.smtpHost = smtpHost;
    if (smtpPort !== undefined) data.smtpPort = smtpPort ? parseInt(smtpPort, 10) : null;
    if (smtpUser !== undefined) data.smtpUser = smtpUser;
    if (smtpEncryption !== undefined) data.smtpEncryption = smtpEncryption;
    if (replyToEmail !== undefined) data.replyToEmail = replyToEmail || null;
    if (senderName !== undefined) data.senderName = senderName;
    if (senderEmail !== undefined) data.senderEmail = senderEmail;
    if (enabledEvents !== undefined) data.enabledEvents = enabledEvents;

    // Derive smtpSecure automatically from encryption type if not explicitly passed
    if (smtpEncryption !== undefined) {
      data.smtpSecure = smtpEncryption === 'SSL';
    } else if (smtpSecure !== undefined) {
      data.smtpSecure = !!smtpSecure;
    }

    // Encrypt SMTP password before storing — skip placeholder "••••" values
    if (smtpPass !== undefined && smtpPass !== '' && smtpPass !== '••••••••••••') {
      data.smtpPass = encrypt(smtpPass);
    }

    const settings = await prisma.emailSetting.upsert({
      where: { companyId },
      update: data,
      create: {
        companyId,
        provider: provider || 'console',
        smtpEncryption: smtpEncryption || 'TLS',
        ...data
      }
    });

    // Clear cached SMTP transporter so next email uses new settings
    clearTransporterCache(companyId);

    // Return sanitized response (no raw passwords)
    const sanitized = {
      ...settings,
      smtpPass: settings.smtpPass ? '••••••••••••' : '',
      smtpPassIsSet: !!settings.smtpPass,
      resendApiKey: settings.resendApiKey ? '••••••••••••' : '',
      sendgridApiKey: settings.sendgridApiKey ? '••••••••••••' : ''
    };

    res.status(200).json({
      message: 'Email settings saved successfully.',
      settings: sanitized
    });
  } catch (error) {
    console.error('Update Email Settings Error:', error);
    res.status(500).json({ error: 'Failed to update email settings.' });
  }
};

/**
 * POST /api/emails/test-connection
 * Attempts a live SMTP connection verify without sending a real email.
 */
exports.testSmtpConnection = async (req, res) => {
  try {
    const { companyId } = req.user;

    // Load settings from DB (use stored encrypted password)
    const settings = await prisma.emailSetting.findUnique({
      where: { companyId }
    });

    if (!settings || settings.provider !== 'smtp') {
      return res.status(400).json({ error: 'SMTP provider must be selected before testing connection.' });
    }

    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      return res.status(400).json({ error: 'SMTP Host, Username, and Password must be configured before testing.' });
    }

    const decryptedPass = decrypt(settings.smtpPass);
    const isSSL = settings.smtpEncryption === 'SSL';
    const isTLS = settings.smtpEncryption === 'TLS';

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: isSSL,
      requireTLS: isTLS,
      auth: {
        user: settings.smtpUser,
        pass: decryptedPass
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    await transporter.verify();
    transporter.close();

    // Log successful connection test
    console.log(`✅ SMTP Connection Test: Successful for company ${companyId} (Host: ${settings.smtpHost})`);

    res.status(200).json({
      success: true,
      message: `SMTP connection verified successfully. Host: ${settings.smtpHost}:${settings.smtpPort || 587} is reachable and authenticated.`
    });
  } catch (error) {
    console.error('SMTP Connection Test Error:', error.message);
    res.status(400).json({
      success: false,
      error: `SMTP connection failed: ${error.message}`,
      hint: getSmtpErrorHint(error.message)
    });
  }
};

/**
 * Returns helpful hints based on common SMTP error messages.
 */
function getSmtpErrorHint(errorMessage) {
  const msg = errorMessage.toLowerCase();
  if (msg.includes('authentication') || msg.includes('auth')) {
    return 'Check your SMTP username and password. For Gmail, use an App Password (not your account password).';
  }
  if (msg.includes('connect') || msg.includes('timeout') || msg.includes('enotfound')) {
    return 'Could not reach the SMTP server. Verify the SMTP host and port are correct.';
  }
  if (msg.includes('ssl') || msg.includes('tls') || msg.includes('certificate')) {
    return 'SSL/TLS handshake failed. Try switching between TLS and SSL encryption types.';
  }
  if (msg.includes('port')) {
    return 'Port may be blocked. Common SMTP ports: 587 (TLS), 465 (SSL), 25 (plain).';
  }
  return 'Verify that your SMTP credentials and host settings are correct.';
}

/**
 * GET /api/emails/smtp-status
 * Returns real-time SMTP status, stats, and recent error information.
 */
exports.getEmailStatus = async (req, res) => {
  try {
    const { companyId } = req.user;

    const settings = await prisma.emailSetting.findUnique({
      where: { companyId }
    });

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch stats in parallel
    const [emailsSentToday, lastSentLog, lastErrorLog] = await Promise.all([
      // Count emails sent today
      prisma.emailLog.count({
        where: {
          companyId,
          status: 'sent',
          sentAt: { gte: today, lt: tomorrow }
        }
      }),
      // Last successfully sent email
      prisma.emailLog.findFirst({
        where: { companyId, status: 'sent' },
        orderBy: { sentAt: 'desc' }
      }),
      // Last failed email with error
      prisma.emailLog.findFirst({
        where: { companyId, status: 'failed' },
        orderBy: { sentAt: 'desc' }
      })
    ]);

    const isSmtpConfigured = settings?.provider === 'smtp' && 
      settings?.smtpHost && settings?.smtpUser && settings?.smtpPass;

    res.status(200).json({
      provider: settings?.provider || 'console',
      smtpConfigured: !!isSmtpConfigured,
      smtpHost: settings?.smtpHost || null,
      smtpPort: settings?.smtpPort || null,
      smtpEncryption: settings?.smtpEncryption || 'TLS',
      emailsSentToday,
      lastEmailSent: lastSentLog ? {
        email: lastSentLog.email,
        subject: lastSentLog.subject,
        sentAt: lastSentLog.sentAt,
        eventType: lastSentLog.eventType
      } : null,
      lastError: lastErrorLog ? {
        email: lastErrorLog.email,
        errorMessage: lastErrorLog.errorMessage,
        failedAt: lastErrorLog.sentAt,
        eventType: lastErrorLog.eventType
      } : null
    });
  } catch (error) {
    console.error('Get Email Status Error:', error);
    res.status(500).json({ error: 'Failed to retrieve email status.' });
  }
};

/**
 * POST /api/emails/test
 * Dispatches an immediate test email to verify credentials.
 */
exports.sendTestEmail = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Recipient email address "to" is required.' });
    }

    const testSubject = 'Test Email Connection – TalentOS.AI';
    const testHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800;">✅ Connection Successful!</h1>
        </div>
        <p style="color: #475569;">This is a test email confirming that your <strong>TalentOS.AI</strong> SMTP email provider credentials are configured correctly and working.</p>
        <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Verification Details:</strong></p>
          <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8; font-family: monospace;">Company ID: ${companyId}<br/>Timestamp: ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px;">
          This is an automated verification email sent from TalentOS.AI. No action is required.
        </p>
      </div>
    `;

    const result = await sendEmailDirect({
      companyId,
      to,
      subject: testSubject,
      html: testHtml,
      eventType: 'custom',
      userId
    });

    if (result.success) {
      res.status(200).json({
        message: `Test email successfully dispatched to ${to}.`,
        log: result.log
      });
    } else {
      res.status(500).json({
        error: `Failed to dispatch test email: ${result.error?.message || 'Unknown provider error.'}`,
        errorMessage: result.error?.message || 'Unknown provider error.',
        hint: getSmtpErrorHint(result.error?.message || ''),
        log: result.log
      });
    }
  } catch (error) {
    console.error('Send Test Email Error:', error);
    res.status(500).json({ error: 'Test email dispatch failed.' });
  }
};

/**
 * GET /api/emails/logs
 * Retrieves paginated logs for auditing.
 */
exports.getEmailLogs = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { status, eventType, search, page = 1, limit = 15 } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = { companyId };

    if (status) {
      where.status = status;
    }
    if (eventType) {
      where.eventType = eventType;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { errorMessage: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [logs, total] = await prisma.$transaction([
      prisma.emailLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip: offset,
        take: parseInt(limit, 10),
        include: {
          candidate: { select: { candidateName: true } },
          employee: { select: { name: true } },
          user: { select: { name: true } }
        }
      }),
      prisma.emailLog.count({ where })
    ]);

    res.status(200).json({
      logs,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Get Email Logs Error:', error);
    res.status(500).json({ error: 'Failed to retrieve email logs.' });
  }
};

/**
 * POST /api/emails/logs/:logId/retry
 * Resets a log entry to pending and runs immediate processing.
 */
exports.retryEmail = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { logId } = req.params;

    const log = await prisma.emailLog.findUnique({
      where: { id: logId }
    });

    if (!log || log.companyId !== companyId) {
      return res.status(404).json({ error: 'Email log not found.' });
    }

    const updatedLog = await prisma.emailLog.update({
      where: { id: logId },
      data: {
        status: 'pending',
        retryCount: 0,
        nextAttempt: new Date(),
        errorMessage: null
      }
    });

    processQueueImmediately();

    res.status(200).json({
      message: 'Email queued for retry.',
      log: updatedLog
    });
  } catch (error) {
    console.error('Retry Email Error:', error);
    res.status(500).json({ error: 'Failed to retry email dispatch.' });
  }
};

/**
 * POST /api/workflows/trigger
 * Manually fires a workflow trigger for testing.
 */
exports.triggerTestWorkflow = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const { eventType, candidateId, employeeId, details = {} } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: 'eventType is required to trigger workflow.' });
    }

    const defaultTmpl = DEFAULT_TEMPLATES[eventType];
    if (!defaultTmpl) {
      return res.status(400).json({ error: `Unknown event type: ${eventType}` });
    }

    const testDetails = {
      candidate_name: 'John Test',
      employee_name: 'Jane Staff',
      job_title: 'Software Engineer',
      salary: '$120,000/year',
      start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      time: '11:00 AM',
      interview_type: 'Video Chat',
      meeting_link: 'https://meet.google.com/test-hfa',
      department: 'Engineering',
      manager_name: 'Sarah Director',
      leave_type: 'Annual Leave',
      end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      reason: 'Standard personal vacation.',
      ...details
    };

    await triggerWorkflow(eventType, {
      companyId,
      userId,
      candidateId,
      employeeId,
      email: req.body.email || undefined,
      details: testDetails
    });

    res.status(200).json({
      message: `Workflow trigger '${eventType}' registered and added to send queue.`
    });
  } catch (error) {
    console.error('Trigger Workflow Error:', error);
    res.status(500).json({ error: 'Failed to trigger test workflow.' });
  }
};

/**
 * GET /api/emails/preview/:templateName
 * Renders HTML template preview with mock data.
 */
exports.getTemplatePreview = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { templateName } = req.params;

    const defaultTmpl = DEFAULT_TEMPLATES[templateName];
    if (!defaultTmpl) {
      return res.status(404).json({ error: `Template '${templateName}' not found.` });
    }

    let customTemplate = null;
    try {
      customTemplate = await prisma.emailTemplate.findFirst({
        where: { companyId, name: templateName }
      });
    } catch (e) {
      // Table not found / empty
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    });

    const mockContext = {
      candidate_name: 'John Doe',
      employee_name: 'Jane Smith',
      job_title: 'Senior Product Manager',
      company_name: company?.name || 'Acme SaaS Corp',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      time: '2:30 PM EST',
      interview_type: 'Video Call',
      meeting_link: 'https://meet.google.com/xyz-abc-123',
      recruiter_name: req.user.name || 'HR Recruitment Office',
      location: '123 Main St, New York',
      salary: '$145,000 / year',
      start_date: 'July 1st, 2026',
      department: 'Product Strategy',
      manager_name: 'Sarah Jenkins',
      invite_link: 'https://hireflow.ai/activate-account?token=mock-token',
      reset_link: 'https://hireflow.ai/change-password?token=mock-reset-token',
      leave_type: 'Annual Vacation',
      reason: 'Family summer holiday trip'
    };

    const compiled = compileAndWrap(
      templateName,
      customTemplate?.subject,
      customTemplate?.content,
      mockContext,
      { name: company?.name || 'HireFlow AI Partner' }
    );

    res.status(200).json({
      subject: compiled.subject,
      html: compiled.html,
      rawBody: customTemplate?.content || defaultTmpl.content
    });
  } catch (error) {
    console.error('Get Template Preview Error:', error);
    res.status(500).json({ error: 'Failed to render email preview.' });
  }
};

/**
 * POST /api/emails/send
 * Dispatches a custom drafted email immediately.
 */
exports.sendCustomEmail = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const { to, subject, body, candidateId, employeeId, eventType } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'to, subject, and body are required fields.' });
    }

    const { markdownToHtml, wrapHtml } = require('../services/emailTemplates');
    const contentHtml = markdownToHtml(body);

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    });

    const html = wrapHtml({
      title: subject,
      contentHtml,
      companyName: company?.name || 'HireFlow AI Partner'
    });

    let attachments = [];
    if (eventType === 'interview_invitation' && candidateId) {
      const interview = await prisma.interview.findFirst({
        where: { candidateId, status: 'scheduled' },
        orderBy: { createdAt: 'desc' },
        include: { interviewer: true }
      });

      if (interview) {
        const { generateICS } = require('../services/icsGenerator');
        const icsString = generateICS({
          title: `Interview: ${subject}`,
          description: `Meeting link: ${interview.meetingLink || 'Video Conference'}`,
          startDate: interview.date,
          location: interview.meetingLink || 'Video Conference',
          organizerName: interview.interviewer.name,
          organizerEmail: interview.interviewer.email
        });

        attachments.push({
          filename: 'invite.ics',
          content: icsString,
          type: 'text/calendar'
        });
      }
    }

    const result = await sendEmailDirect({
      companyId,
      to,
      subject,
      html,
      attachments,
      eventType: eventType || 'custom',
      candidateId,
      employeeId,
      userId
    });

    if (result.success) {
      res.status(200).json({
        message: 'Email dispatched successfully.',
        log: result.log
      });
    } else {
      res.status(500).json({
        error: `Failed to send email: ${result.error?.message || 'Unknown provider error.'}`,
        errorMessage: result.error?.message,
        log: result.log
      });
    }
  } catch (error) {
    console.error('Send Custom Email Error:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
};
