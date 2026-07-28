const prisma = require('../config/db');
const { sendEmailDirect } = require('../services/email.service');
const { compileAndWrap } = require('../services/emailTemplates');

// Helper to validate email format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Helper to sanitize text
const sanitize = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/<script[^>]*?>.*?<\/script>/gi, '').replace(/<[\/\!]*?[^<>]*?>/gi, '');
};

// 1. Submit a Contact Form / Inquiry (Public)
exports.submitContactMessage = async (req, res) => {
  try {
    const { name, company, email, phone, category, subject, message, attachment } = req.body;

    // Validate required fields
    if (!name || !email || !category || !subject || !message) {
      return res.status(400).json({ error: 'Please fill in all required fields (Name, Email, Category, Subject, Message).' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Sanitize inputs
    const cleanName = sanitize(name);
    const cleanCompany = company ? sanitize(company) : null;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? sanitize(phone) : null;
    const cleanCategory = sanitize(category);
    const cleanSubject = sanitize(subject);
    const cleanMessage = sanitize(message);
    const cleanAttachment = attachment ? sanitize(attachment) : null;

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';
    const timestamp = new Date().toISOString();

    // Store in PostgreSQL via Prisma
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: cleanName,
        company: cleanCompany,
        email: cleanEmail,
        phone: cleanPhone,
        category: cleanCategory,
        subject: cleanSubject,
        message: cleanMessage,
        attachment: cleanAttachment,
        status: 'New',
        ipAddress: String(ipAddress),
        userAgent: String(userAgent)
      }
    });

    // 1. Immediately send notification email to talentosai.contact@gmail.com
    const adminPayload = compileAndWrap('admin-notification', null, null, {
      submission_type: `Contact Inquiry (${cleanCategory})`,
      subject: cleanSubject,
      name: cleanName,
      email: cleanEmail,
      company: cleanCompany || 'Not Provided',
      phone: cleanPhone || 'Not Provided',
      workspace_name: cleanCompany || 'Public Visitor',
      role: 'Visitor / Customer',
      priority: 'Normal',
      browser: userAgent,
      os: 'Standard OS',
      timestamp: timestamp,
      ip_address: String(ipAddress),
      attachment: cleanAttachment || 'None',
      message: cleanMessage
    }, { name: 'TalentOS AI Platform' });

    await sendEmailDirect({
      companyId: null,
      to: 'talentosai.contact@gmail.com',
      subject: adminPayload.subject,
      html: adminPayload.html,
      eventType: 'contact-notification'
    });

    // 2. Immediately send confirmation email to the sender
    let tmplName = 'contact-confirmation';
    if (cleanCategory.toLowerCase().includes('support')) tmplName = 'support-request';
    else if (cleanCategory.toLowerCase().includes('bug')) tmplName = 'bug-report-received';
    else if (cleanCategory.toLowerCase().includes('feature')) tmplName = 'feature-request-received';
    else if (cleanCategory.toLowerCase().includes('feedback')) tmplName = 'feedback-received';

    const userPayload = compileAndWrap(tmplName, null, null, {
      name: cleanName,
      subject: cleanSubject,
      category: cleanCategory,
      company: cleanCompany || 'Your Organization',
      timestamp: timestamp,
      message: cleanMessage,
      priority: 'Medium',
      browser: userAgent,
      os: 'Standard OS'
    }, { name: 'TalentOS AI Platform' });

    await sendEmailDirect({
      companyId: null,
      to: cleanEmail,
      subject: userPayload.subject,
      html: userPayload.html,
      eventType: 'contact-confirmation'
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been received! We have sent a confirmation to your email.',
      data: contactMessage
    });
  } catch (error) {
    console.error('Submit Contact Message Error:', error);
    res.status(500).json({ error: 'Failed to submit contact message. Please try again.' });
  }
};

// 2. Get All Contact Messages (Admin)
exports.getContactMessages = async (req, res) => {
  try {
    const { search, category, status } = req.query;

    const where = {};
    if (category && category !== 'All') {
      where.category = category;
    }
    if (status && status !== 'All') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    console.error('Get Contact Messages Error:', error);
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
};

// 3. Get Unread Count (Admin Sidebar Badge)
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.contactMessage.count({
      where: {
        status: { in: ['New', 'new'] }
      }
    });
    res.status(200).json({ success: true, unreadCount: count });
  } catch (error) {
    console.error('Get Unread Count Error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// 4. Update Message Status (Admin)
exports.updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['New', 'In Progress', 'Resolved', 'Closed', 'Archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, message: 'Status updated', data: updated });
  } catch (error) {
    console.error('Update Message Status Error:', error);
    res.status(500).json({ error: 'Failed to update message status' });
  }
};

// 5. Reply to Message (Admin)
exports.replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, subject } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ error: 'Reply message text is required' });
    }

    const messageRecord = await prisma.contactMessage.findUnique({ where: { id } });
    if (!messageRecord) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    const replySubject = subject || `Re: [TalentOS] ${messageRecord.subject}`;
    const replyHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Hello <strong>${messageRecord.name}</strong>,</p>
        <p>${replyMessage.replace(/\n/g, '<br/>')}</p>
        <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;"/>
        <p style="font-size: 12px; color: #666;">
          <strong>Your Original Message (${messageRecord.createdAt.toLocaleDateString()}):</strong><br/>
          ${messageRecord.message}
        </p>
        <p style="font-size: 12px; color: #888; margin-top: 20px;">
          Regards,<br/>
          <strong>TalentOS Customer Success Team</strong><br/>
          <a href="mailto:talentosai.contact@gmail.com">talentosai.contact@gmail.com</a>
        </p>
      </div>
    `;

    // Send reply via email service
    await sendEmailDirect({
      companyId: null,
      to: messageRecord.email,
      subject: replySubject,
      html: replyHtml,
      eventType: 'contact-reply'
    });

    // Update message status to Resolved or In Progress
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: 'Resolved' }
    });

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully to customer',
      data: updated
    });
  } catch (error) {
    console.error('Reply to Message Error:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
};

// 6. Delete Message (Admin)
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contactMessage.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete Message Error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// 7. Get Platform Statistics for About Us Page
exports.getPlatformStats = async (req, res) => {
  try {
    let stats = await prisma.platformStat.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    // If empty, seed default configurable stats
    if (!stats || stats.length === 0) {
      const defaultStats = [
        { key: 'organizations_using', label: 'Organizations Using TalentOS', value: 240, suffix: '+', displayOrder: 1 },
        { key: 'active_employees', label: 'Active Employees Managed', value: 18500, suffix: '+', displayOrder: 2 },
        { key: 'applications_processed', label: 'Applications Processed', value: 142000, suffix: '+', displayOrder: 3 },
        { key: 'emails_automated', label: 'Emails Automated', value: 850000, suffix: '+', displayOrder: 4 },
        { key: 'ai_resume_analyses', label: 'AI Resume Analyses', value: 98000, suffix: '+', displayOrder: 5 }
      ];

      for (const item of defaultStats) {
        await prisma.platformStat.create({ data: item });
      }

      stats = await prisma.platformStat.findMany({
        orderBy: { displayOrder: 'asc' }
      });
    }

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Get Platform Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch platform statistics' });
  }
};

// 8. Update Platform Statistics (Admin)
exports.updatePlatformStats = async (req, res) => {
  try {
    const { stats } = req.body;
    if (!Array.isArray(stats)) {
      return res.status(400).json({ error: 'Stats must be an array' });
    }

    const results = [];
    for (const item of stats) {
      const updated = await prisma.platformStat.upsert({
        where: { key: item.key },
        update: {
          label: item.label,
          value: Number(item.value) || 0,
          suffix: item.suffix || '',
          displayOrder: Number(item.displayOrder) || 0
        },
        create: {
          key: item.key,
          label: item.label,
          value: Number(item.value) || 0,
          suffix: item.suffix || '',
          displayOrder: Number(item.displayOrder) || 0
        }
      });
      results.push(updated);
    }

    res.status(200).json({ success: true, message: 'Platform stats updated successfully', data: results });
  } catch (error) {
    console.error('Update Platform Stats Error:', error);
    res.status(500).json({ error: 'Failed to update platform statistics' });
  }
};
