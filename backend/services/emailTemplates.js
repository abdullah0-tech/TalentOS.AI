/**
 * default templates and compiler for HireFlow AI automated workflows.
 */

const DEFAULT_TEMPLATES = {
  'candidate-applied': {
    name: 'Application Received',
    subject: 'Application Received – {{job_title}}',
    ctaText: 'View Career Portal',
    content: `Hello {{candidate_name}},

Thank you for your interest in joining **{{company_name}}**! We have successfully received your application for the position of **{{job_title}}**.

Our recruitment team is currently reviewing your resume and matching your experience against our requirements.

### What happens next?
1. **Review**: Our team reviews your background.
2. **Contact**: If there is a fit, we will contact you within 3-5 business days.
3. **Portal**: You can track the progress of your application dynamically in our career workspace.

We appreciate the time you took to apply.

Best regards,
**{{company_name}} Recruitment Team**`
  },

  'shortlisted': {
    name: 'Candidate Shortlisted',
    subject: 'Congratulations! You Have Been Shortlisted',
    ctaText: 'Go to Candidate Portal',
    content: `Hello {{candidate_name}},

We are pleased to inform you that you have been **shortlisted** for the position of **{{job_title}}** at **{{company_name}}**!

Our hiring panel was highly impressed by your application, and we would love to move you forward to the next round of our selection process.

### Next Steps:
Our recruitment team will contact you shortly to coordinate your initial interview discussion. Please keep an eye on your email inbox and phone.

We look forward to speaking with you soon!

Best regards,
**{{company_name}} Talent Acquisition**`
  },

  'interview-scheduled': {
    name: 'Interview Invitation',
    subject: 'Interview Invitation – {{job_title}}',
    ctaText: 'Join Video Interview',
    content: `Hello {{candidate_name}},

Great news! An interview has been scheduled for your application for the **{{job_title}}** role at **{{company_name}}**.

Here are your interview details:
* **Date**: {{date}}
* **Time**: {{time}}
* **Format**: {{interview_type}}
* **Meeting Link**: {{meeting_link}}
* **Interviewer**: {{recruiter_name}}
{{#if location}}* **Location**: {{location}}{{/if}}

Please ensure that you have a stable internet connection and are in a quiet workspace 5 minutes before the start time. A calendar invite (.ics) has been attached to this email.

If you have any questions or need to reschedule, please let us know.

Best regards,
**{{recruiter_name}}**
Recruiter at {{company_name}}`
  },

  'interview-reminder': {
    name: 'Interview Reminder',
    subject: 'Interview Reminder – {{job_title}}',
    ctaText: 'Access Interview Lobby',
    content: `Hello {{candidate_name}},

This is a friendly reminder that you have an upcoming interview scheduled for the **{{job_title}}** position at **{{company_name}}** in **24 hours**.

### Event Summary:
* **Date**: {{date}}
* **Time**: {{time}}
* **Meeting Link**: {{meeting_link}}

Please make sure your camera and microphone are tested. If you need to make changes, please contact us immediately.

We look forward to meeting you!

Best regards,
**{{company_name}} Recruiting Team**`
  },

  'rejected': {
    name: 'Application Update',
    subject: 'Application Update – {{job_title}}',
    ctaText: 'View Other Open Roles',
    content: `Dear {{candidate_name}},

Thank you for your interest in **{{company_name}}** and for taking the time to apply and interview for the **{{job_title}}** position.

We had the privilege of reviewing many talented applicants, and while your qualifications are impressive, we have decided to move forward with other candidates whose experience more closely matches our specific requirements at this time.

We are truly grateful for your interest in our mission and the effort you invested in our process. We will retain your resume in our talent database for future roles that align with your profile.

We wish you the very best in your search and future career endeavors.

Sincerely,
**{{company_name}} Human Resources**`
  },

  'offer-letter': {
    name: 'Job Offer Sent',
    subject: 'Job Offer – {{company_name}}',
    ctaText: 'Review & Accept Offer',
    content: `Congratulations {{candidate_name}}!

We are absolutely thrilled to offer you the position of **{{job_title}}** at **{{company_name}}**!

Our interviewers were incredibly impressed by your technical aptitude, communication skills, and alignment with our company values. We believe you will make a fantastic addition to our team.

### Offer Summary:
* **Position**: {{job_title}}
* **Annual Salary**: {{salary}}
* **Start Date**: {{start_date}}

Please click the button below to view your full offer package, review the employment terms, and sign the official offer letter.

Welcome to the team!

Warm regards,
**{{company_name}} Leadership Team**`
  },

  'hired': {
    name: 'Welcome to Company',
    subject: 'Welcome to {{company_name}}!',
    ctaText: 'Go to Onboarding Portal',
    content: `Welcome to the team, {{candidate_name}}!

We are excited to officially welcome you to **{{company_name}}**! Your offer has been signed, and we are preparing for your arrival.

### Joining Details:
* **Official Start Date**: {{start_date}}
* **Department**: {{department}}
* **Reporting Manager**: {{manager_name}}

### What to Expect Next:
Our onboarding coordinator will contact you shortly to arrange your IT equipment delivery, set up your logins, and send details about your first week.

We are excited to build the future together with you!

Best regards,
**{{company_name}} Operations**`
  },

  'employee-invitation': {
    name: 'Employee Invite',
    subject: 'Activate Your Employee Account – {{company_name}}',
    ctaText: 'Activate My Account',
    content: `Welcome to {{company_name}}!

Hello {{employee_name}},

Your administrator has created an employee profile for you on the **{{company_name}}** workplace portal. 

Your account is ready for activation. Please click the button below to set up your password, configure your profile, and activate your portal.

*Note: This secure invitation link is valid for **7 days**.*

If you did not expect this invitation, please contact your HR department.

Best regards,
**{{company_name}} HR Portal**`
  },

  'account-activated': {
    name: 'Account Activated',
    subject: 'Account Successfully Activated',
    ctaText: 'Access Employee Workspace',
    content: `Hello {{employee_name}},

Congratulations! Your workspace login account for **{{company_name}}** has been successfully activated.

You can now log in to the employee dashboard to complete your onboarding checklist, manage leave requests, record attendance, and access corporate training catalogs.

We are happy to have you on board!

Best regards,
**HireFlow AI Workspace Services**`
  },

  'password-reset': {
    name: 'Password Reset',
    subject: 'Password Reset Request',
    ctaText: 'Reset Password Now',
    content: `Hello {{employee_name}},

We received a request to reset the password associated with your account on **{{company_name}}**.

Please click the button below to set up a new, secure password. 

*For security purposes, this password reset link is only active for **2 hours**.*

If you did not request this reset, you can safely ignore this email; your login credentials will remain unchanged.

Best regards,
**HireFlow AI Security Team**`
  },

  'leave-approved': {
    name: 'Leave Approved',
    subject: 'Leave Request Approved – {{leave_type}}',
    ctaText: 'View Leave Ledger',
    content: `Hello {{employee_name}},

Your manager has reviewed and **approved** your leave request.

### Leave Details:
* **Leave Type**: {{leave_type}}
* **Start Date**: {{start_date}}
* **End Date**: {{end_date}}
* **Status**: Approved

Enjoy your time off! Please ensure your calendar is marked out-of-office and a delegate is listed for critical tasks.

Best regards,
**{{company_name}} HR Operations**`
  },

  'leave-rejected': {
    name: 'Leave Update',
    subject: 'Leave Request Update',
    ctaText: 'View Leave Details',
    content: `Hello {{employee_name}},

Your recent leave request has been reviewed and **could not be approved** at this time.

### Details:
* **Leave Type**: {{leave_type}}
* **Start Date**: {{start_date}}
* **End Date**: {{end_date}}
* **Reason for Rejection**: {{reason}}

Please consult with your manager or HR coordinator to review alternative options or clarify team scheduling constraints.

Best regards,
**{{company_name}} HR Department**`
  },
  'new-feedback': {
    name: 'New Feedback Notification',
    subject: 'New TalentOS Feedback Received: {{feedback_priority}} Priority',
    ctaText: 'View Feedback Dashboard',
    content: `A new feedback submission has been received.

**Type:** {{feedback_type}}
**User:** {{user_name}}
**Priority:** {{feedback_priority}}

### Message:
{{feedback_message}}

Please log in to your Admin Dashboard to review this feedback.`
  }
};

/**
 * Replaces double-curly-braces {{key}} with values from context.
 */
function compileText(template, context) {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    if (context[key] !== undefined && context[key] !== null) {
      return context[key];
    }
    return '';
  });
}

/**
 * Compiles markdown-like bold and bullet text into HTML.
 */
function markdownToHtml(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Bullet points starting with *
  html = html.replace(/^\*\s*(.*?)$/gm, '<li>$1</li>');
  // Wrap li in ul
  html = html.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul style="margin: 16px 0; padding-left: 20px; color: #94a3b8; line-height: 1.6;">${match}</ul>`);

  // Subheaders ### text
  html = html.replace(/^###\s*(.*?)$/gm, '<h3 style="color: #ffffff; font-size: 16px; margin: 24px 0 12px 0; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 6px;">$1</h3>');

  // Paragraphs
  const paragraphs = html.split('\n\n');
  const compiled = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h3') || p.startsWith('<ul') || p.startsWith('<li')) {
      return p;
    }
    return `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #94a3b8;">${p}</p>`;
  }).join('\n');

  return compiled;
}

/**
 * Wraps content in high-fidelity SaaS template wrapper.
 */
function wrapHtml({ title, contentHtml, ctaText, ctaLink, logoText = 'H', companyName = 'HireFlow AI' }) {
  const year = new Date().getFullYear();
  
  // Show button only if ctaText and ctaLink exist
  const buttonHtml = (ctaText && ctaLink) ? `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${ctaLink}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 600; font-size: 14px; padding: 14px 28px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.4); text-align: center;">${ctaText}</a>
    </div>` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f172a;
      color: #cbd5e1;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    a {
      color: #38bdf8;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 10px !important;
        border-radius: 8px !important;
      }
      .content {
        padding: 24px !important;
      }
    }
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #cbd5e1; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
  <div class="container" style="max-width: 600px; margin: 40px auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
    
    <!-- Premium Header Gradient -->
    <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background-color: rgba(255, 255, 255, 0.15); border-radius: 12px; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.2); line-height: 48px; text-align: center;">
        ${logoText.charAt(0).toUpperCase()}
      </div>
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.025em; text-transform: uppercase; font-family: 'Outfit', sans-serif;">${companyName}</h1>
    </div>
    
    <!-- Body Content -->
    <div class="content" style="padding: 32px 40px; background-color: #1e293b;">
      <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 20px;">${title}</h2>
      
      <div style="font-size: 15px; color: #94a3b8; line-height: 1.6;">
        ${contentHtml}
      </div>
      
      ${buttonHtml}
      
      <p style="margin: 24px 0 0 0; font-size: 13px; color: #64748b; border-t: 1px solid #334155; padding-top: 20px; line-height: 1.5;">
        This is an automated operational notification dispatched by HireFlow AI on behalf of ${companyName}. Please do not reply directly to this mail. If you require help, contact our support portal.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #0f172a; padding: 24px 32px; border-top: 1px solid #334155; text-align: center; font-size: 12px; color: #64748b;">
      <div style="margin-bottom: 12px;">
        <a href="#" style="color: #64748b; text-decoration: underline; margin: 0 8px;">Support Helpdesk</a>
        <span style="color: #334155;">&bull;</span>
        <a href="#" style="color: #64748b; text-decoration: underline; margin: 0 8px;">Privacy Policy</a>
      </div>
      <div>&copy; ${year} ${companyName}. Powered by HireFlow AI. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Compiles a specific template by substituting placeholders and wrapping it in standard layout.
 */
function compileAndWrap(templateName, customSubject, customBody, context, companyDetails = {}) {
  const defaultTmpl = DEFAULT_TEMPLATES[templateName] || DEFAULT_TEMPLATES['candidate-applied'];
  
  const subjectTemplate = customSubject || defaultTmpl.subject;
  const bodyTemplate = customBody || defaultTmpl.content;
  const ctaText = defaultTmpl.ctaText;

  // Compile subject and body text
  const subject = compileText(subjectTemplate, context);
  const textContent = compileText(bodyTemplate, context);
  
  // Convert body to HTML
  const contentHtml = markdownToHtml(textContent);

  // Wrap in HTML layout
  const html = wrapHtml({
    title: defaultTmpl.name,
    contentHtml,
    ctaText,
    ctaLink: context.cta_link || context.invite_link || context.reset_link || context.meeting_link || '#',
    logoText: companyDetails.logoText || companyDetails.name || 'H',
    companyName: companyDetails.name || 'HireFlow AI Partner'
  });

  return {
    subject,
    html,
    text: textContent
  };
}

module.exports = {
  DEFAULT_TEMPLATES,
  compileText,
  markdownToHtml,
  wrapHtml,
  compileAndWrap
};
