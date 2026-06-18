const nodemailer = require('nodemailer');
const axios = require('axios');
const prisma = require('../config/db');
const { decrypt } = require('../utils/encryption');

// Cache transporter instances by companyId to optimize connections
const transporterCache = new Map();

/**
 * Resolves the active email configuration for a company.
 * Falls back to system environment variables, then to console mocking.
 */
async function resolveEmailConfig(companyId) {
  let settings = null;
  if (companyId) {
    settings = await prisma.emailSetting.findUnique({
      where: { companyId }
    });
  }

  // If company settings exist, return them
  if (settings) {
    return {
      provider: settings.provider || 'console',
      resendApiKey: settings.resendApiKey || process.env.SYSTEM_RESEND_API_KEY,
      sendgridApiKey: settings.sendgridApiKey || process.env.SYSTEM_SENDGRID_API_KEY,
      smtpHost: settings.smtpHost || process.env.SYSTEM_SMTP_HOST,
      smtpPort: settings.smtpPort ? parseInt(settings.smtpPort, 10) : (process.env.SYSTEM_SMTP_PORT ? parseInt(process.env.SYSTEM_SMTP_PORT, 10) : 587),
      smtpUser: settings.smtpUser || process.env.SYSTEM_SMTP_USER,
      smtpPass: decrypt(settings.smtpPass || process.env.SYSTEM_SMTP_PASS || ''),
      smtpSecure: settings.smtpSecure !== undefined ? settings.smtpSecure : (process.env.SYSTEM_SMTP_SECURE === 'true'),
      smtpEncryption: settings.smtpEncryption || 'TLS',
      senderName: settings.senderName || 'HireFlow AI',
      senderEmail: settings.senderEmail || 'noreply@hireflow.ai',
      replyToEmail: settings.replyToEmail || null
    };
  }

  // Fallback to system environment defaults
  return {
    provider: process.env.EMAIL_PROVIDER || 'console',
    resendApiKey: process.env.SYSTEM_RESEND_API_KEY,
    sendgridApiKey: process.env.SYSTEM_SENDGRID_API_KEY,
    smtpHost: process.env.SYSTEM_SMTP_HOST,
    smtpPort: process.env.SYSTEM_SMTP_PORT ? parseInt(process.env.SYSTEM_SMTP_PORT, 10) : 587,
    smtpUser: process.env.SYSTEM_SMTP_USER,
    smtpPass: decrypt(process.env.SYSTEM_SMTP_PASS || ''),
    smtpSecure: process.env.SYSTEM_SMTP_SECURE === 'true',
    smtpEncryption: process.env.SYSTEM_SMTP_ENCRYPTION || 'TLS',
    senderName: process.env.SENDER_NAME || 'HireFlow AI',
    senderEmail: process.env.SENDER_EMAIL || 'noreply@hireflow.ai',
    replyToEmail: process.env.SENDER_REPLY_TO || null
  };
}

/**
 * Creates or retrieves a cached Nodemailer SMTP transporter.
 */
function getSmtpTransporter(config, companyId) {
  const cacheKey = companyId || 'system';
  if (transporterCache.has(cacheKey)) {
    return transporterCache.get(cacheKey);
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporterCache.set(cacheKey, transporter);
  return transporter;
}

/**
 * Dispatches an email immediately using the resolved configuration.
 */
async function sendRawEmail({ companyId, to, subject, html, attachments = [], config = null }) {
  const mailConfig = config || await resolveEmailConfig(companyId);
  const provider = mailConfig.provider.toLowerCase();

  console.log(`✉️ Email Service: Sending via '${provider}' to: ${to} (Subject: ${subject})`);

  if (provider === 'resend') {
    if (!mailConfig.resendApiKey) {
      throw new Error('Resend API Key is missing in settings.');
    }

    const payload = {
      from: `"${mailConfig.senderName}" <${mailConfig.senderEmail}>`,
      to: [to],
      subject: subject,
      html: html
    };

    if (attachments.length > 0) {
      payload.attachments = attachments.map(att => ({
        filename: att.filename,
        content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : Buffer.from(att.content).toString('base64')
      }));
    }

    const res = await axios.post('https://api.resend.com/emails', payload, {
      headers: {
        'Authorization': `Bearer ${mailConfig.resendApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return { provider: 'resend', messageId: res.data.id };
  } 
  
  if (provider === 'sendgrid') {
    if (!mailConfig.sendgridApiKey) {
      throw new Error('SendGrid API Key is missing in settings.');
    }

    const payload = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: mailConfig.senderEmail, name: mailConfig.senderName },
      subject: subject,
      content: [{ type: 'text/html', value: html }]
    };

    if (attachments.length > 0) {
      payload.attachments = attachments.map(att => ({
        content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : Buffer.from(att.content).toString('base64'),
        filename: att.filename,
        type: att.type || 'text/plain',
        disposition: 'attachment'
      }));
    }

    const res = await axios.post('https://api.sendgrid.com/v3/mail/send', payload, {
      headers: {
        'Authorization': `Bearer ${mailConfig.sendgridApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return { provider: 'sendgrid', messageId: res.headers['x-message-id'] || 'sg-success' };
  } 
  
  if (provider === 'smtp') {
    if (!mailConfig.smtpHost || !mailConfig.smtpUser || !mailConfig.smtpPass) {
      throw new Error('SMTP host, username, or password is missing in settings.');
    }

    const transporter = getSmtpTransporter(mailConfig, companyId);
    
    const mailOptions = {
      from: `"${mailConfig.senderName}" <${mailConfig.senderEmail}>`,
      to: to,
      subject: subject,
      html: html
    };

    // Add Reply-To header if configured
    if (mailConfig.replyToEmail) {
      mailOptions.replyTo = mailConfig.replyToEmail;
    }

    if (attachments.length > 0) {
      mailOptions.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content
      }));
    }

    const info = await transporter.sendMail(mailOptions);
    return { provider: 'smtp', messageId: info.messageId };
  }

  // Default Console Mock Provider
  console.log(`\n=================== [SIMULATED EMAIL] ===================`);
  console.log(`FROM: "${mailConfig.senderName}" <${mailConfig.senderEmail}>`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  if (attachments.length > 0) {
    console.log(`ATTACHMENTS: ${attachments.map(a => a.filename).join(', ')}`);
  }
  console.log(`--------------------- BODY HTML ---------------------`);
  console.log(html);
  console.log(`=========================================================\n`);

  return { provider: 'console', messageId: `mock-${Date.now()}` };
}

/**
 * Sends an email immediately and logs it to the database with either 'sent' or 'failed' status.
 */
async function sendEmailDirect({ companyId, to, subject, html, attachments = [], eventType = 'custom', candidateId = null, employeeId = null, userId = null }) {
  let config;
  try {
    config = await resolveEmailConfig(companyId);
  } catch (err) {
    console.error('Failed to resolve email settings:', err);
    config = { provider: 'console', senderName: 'HireFlow AI', senderEmail: 'noreply@hireflow.ai' };
  }

  try {
    const result = await sendRawEmail({ companyId, to, subject, html, attachments, config });
    
    // Create successful log in database
    const log = await prisma.emailLog.create({
      data: {
        companyId,
        userId,
        candidateId,
        employeeId,
        email: to,
        eventType,
        subject,
        status: 'sent',
        provider: result.provider
      }
    });

    return { success: true, log };
  } catch (error) {
    console.error(`Direct email send failure to ${to}:`, error.message);
    
    // Create failed log in database
    const log = await prisma.emailLog.create({
      data: {
        companyId,
        userId,
        candidateId,
        employeeId,
        email: to,
        eventType,
        subject,
        status: 'failed',
        provider: config.provider,
        errorMessage: error.message
      }
    });

    return { success: false, log, error };
  }
}

/**
 * Triggers sending for a pre-saved EmailLog row in the queue.
 * Handles update status to 'sent' or increments retries on failure.
 */
async function sendEmailFromLog(logId) {
  const log = await prisma.emailLog.findUnique({
    where: { id: logId }
  });

  if (!log) {
    throw new Error(`EmailLog row not found: ${logId}`);
  }

  // Prevent double processing
  if (log.status === 'sent') return log;

  // Resolve config
  const config = await resolveEmailConfig(log.companyId);

  try {
    // Note: If this is an interview-scheduled event and needs an attachment,
    // we would rebuild it or fetch attachment parameters. To keep the queue simple,
    // we look up the interview info if the template needs an .ics file.
    let attachments = [];
    if (log.eventType === 'interview-scheduled' && log.candidateId) {
      const interview = await prisma.interview.findFirst({
        where: { candidateId: log.candidateId, status: 'scheduled' },
        orderBy: { createdAt: 'desc' },
        include: { interviewer: true }
      });

      if (interview) {
        const { generateICS } = require('./icsGenerator');
        const icsString = generateICS({
          title: `Interview: ${log.subject}`,
          description: `You have an interview scheduled. Meeting Link: ${interview.meetingLink || 'Video Room'}`,
          startDate: interview.date,
          location: interview.meetingLink || 'Video Room',
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

    const result = await sendRawEmail({
      companyId: log.companyId,
      to: log.email,
      subject: log.subject,
      html: log.eventType === 'custom' ? log.subject : await renderTemplateBody(log),
      attachments,
      config
    });

    // Update log status to successful
    return await prisma.emailLog.update({
      where: { id: logId },
      data: {
        status: 'sent',
        provider: result.provider,
        sentAt: new Date(),
        errorMessage: null
      }
    });
  } catch (error) {
    console.error(`Queue send failure on log ${logId}:`, error.message);
    
    const maxRetries = 3;
    const retryCount = log.retryCount + 1;
    const isFailedPermanently = retryCount >= maxRetries;
    
    const updateData = {
      retryCount,
      errorMessage: error.message
    };

    if (isFailedPermanently) {
      updateData.status = 'failed';
      updateData.nextAttempt = null;
    } else {
      updateData.status = 'pending';
      // Exponential backoff: 2 min, 4 min, 8 min
      const delayMs = Math.pow(2, retryCount) * 60 * 1000;
      updateData.nextAttempt = new Date(Date.now() + delayMs);
    }

    return await prisma.emailLog.update({
      where: { id: logId },
      data: updateData
    });
  }
}

/**
 * Internal helper to re-compile the email html body for queue items.
 */
async function renderTemplateBody(log) {
  // If event type is leave or employee activation, compile the template using compileAndWrap
  const { compileAndWrap } = require('./emailTemplates');
  
  // Fetch candidate/employee details to inject in context
  let context = {
    company_name: log.companyId ? (await prisma.company.findUnique({ where: { id: log.companyId } }))?.name : 'HireFlow AI'
  };

  if (log.candidateId) {
    const candidate = await prisma.application.findUnique({
      where: { id: log.candidateId },
      include: { job: true }
    });
    if (candidate) {
      context.candidate_name = candidate.candidateName;
      context.job_title = candidate.job.title;
      context.email = candidate.email;
    }
  }

  if (log.employeeId) {
    const employee = await prisma.employee.findUnique({
      where: { id: log.employeeId }
      // NOTE: We intentionally do NOT join invites here.
      // The token in DB is SHA-256 hashed — putting it in a URL causes double-hashing
      // and results in 'Invalid invitation link' errors.
    });
    if (employee) {
      context.employee_name = employee.name;
      context.email = employee.email;
      context.department = employee.department;
      context.position = employee.position;

      // invite_link must come from the stored plaintext token in emailLog metadata.
      // If not available (legacy logs), point to the resend-invite page as a safe fallback.
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      if (log.metadata?.plaintextToken) {
        context.invite_link = `${frontendUrl}/activate-account?token=${log.metadata.plaintextToken}`;
      } else if (log.eventType === 'employee-invitation') {
        // Safe fallback: link to request a new invite rather than sending a broken hashed token
        context.invite_link = `${frontendUrl}/activate-account?email=${encodeURIComponent(employee.email)}`;
      }
    }
  }

  // Load customized email template from DB if company customized it
  let customTemplate = null;
  if (log.companyId) {
    customTemplate = await prisma.emailTemplate.findFirst({
      where: { companyId: log.companyId, name: log.eventType }
    });
  }

  const company = log.companyId ? await prisma.company.findUnique({ where: { id: log.companyId } }) : null;
  const compiled = compileAndWrap(
    log.eventType, 
    customTemplate?.subject, 
    customTemplate?.content, 
    context, 
    { name: company?.name || 'HireFlow AI Partner' }
  );

  return compiled.html;
}

/**
 * Clears the cached SMTP transporter for a given company (or all if no companyId).
 * Call this after updating SMTP settings to force reconnection with new credentials.
 */
function clearTransporterCache(companyId) {
  if (companyId) {
    transporterCache.delete(companyId);
    transporterCache.delete('system');
  } else {
    transporterCache.clear();
  }
}

module.exports = {
  resolveEmailConfig,
  sendRawEmail,
  sendEmailDirect,
  sendEmailFromLog,
  clearTransporterCache
};
