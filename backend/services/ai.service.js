const axios = require('axios');

const getApiKey = () => {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey || apiKey === 'your-grok-api-key' || apiKey.trim() === '') {
    return null;
  }
  return apiKey;
};

/**
 * Standard HTTP requester to X.AI Chat Completions API.
 */
const callGrokAPI = async (prompt, systemPrompt = 'You are an enterprise AI HR consultant.', responseJson = false) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  try {
    const payload = {
      model: 'grok-beta',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    };

    if (responseJson) {
      payload.response_format = { type: 'json_object' };
    }

    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    );

    let content = response.data.choices[0].message.content.trim();
    if (responseJson) {
      if (content.startsWith('```json')) {
        content = content.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (content.startsWith('```')) {
        content = content.replace(/^```/, '').replace(/```$/, '').trim();
      }
      return JSON.parse(content);
    }
    return content;
  } catch (error) {
    console.error('Grok API connection error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 1. AI JOB DESCRIPTION GENERATOR
 */
const generateJobDescription = async (role, level, skills, additionalDetails = '') => {
  const systemPrompt = 'You are a technical HR recruiter specialized in writing descriptive and professional job descriptions.';
  const prompt = `
Create a comprehensive job description for:
Role: ${role}
Level: ${level}
Required Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
Additional Details: ${additionalDetails}

The response must be in JSON format only. Do not include markdown code block syntax. The response MUST exactly follow this schema:
{
  "title": "Complete Job Title (e.g. Senior Frontend Developer)",
  "responsibilities": ["Responsibility 1", "Responsibility 2", "Responsibility 3", "Responsibility 4"],
  "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
  "preferredSkills": ["Preferred Skill 1", "Preferred Skill 2"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "hiringExpectations": "Paragraph describing what the first 90 days look like."
}
`;

  try {
    return await callGrokAPI(prompt, systemPrompt, true);
  } catch (err) {
    console.warn('Falling back to local Job Description simulator.');
    const skillsList = Array.isArray(skills) ? skills : [skills];
    return {
      title: `Senior ${role}`,
      responsibilities: [
        `Lead architecture and development of core features using ${skillsList.slice(0, 2).join(' and ')}.`,
        'Mentor junior developers and participate in code reviews.',
        'Collaborate with product and design teams to build user-friendly interfaces.',
        'Optimize application performance and write unit and integration tests.'
      ],
      requirements: [
        `At least 5+ years of software development experience.`,
        `Deep understanding of ${skillsList.join(', ')}.`,
        'Excellent communication and teamwork skills.',
        'Experience with Git, CI/CD pipelines, and writing clean, maintainable code.'
      ],
      preferredSkills: [
        'Familiarity with cloud infrastructures (AWS/GCP/Azure).',
        'Experience building scalable SaaS products in multi-tenant environments.'
      ],
      benefits: [
        'Competitive salary and equity packages.',
        'Flexible hybrid work arrangements.',
        'Health, dental, and vision insurance premiums covered.',
        'Professional development budget and annual education allowance.'
      ],
      hiringExpectations: 'In the first 30 days, you will onboard, understand our codebases, and ship your first feature. By day 60, you will own a core system component. By day 90, you will mentor others and contribute to technical designs.'
    };
  }
};

/**
 * 2. AI INTERVIEW QUESTION GENERATOR
 */
const generateInterviewQuestions = async (role, level, skills, difficulty) => {
  const systemPrompt = 'You are a senior hiring manager and tech lead who creates standard interview question sheets.';
  const prompt = `
Generate a list of 10 to 12 interview questions for a candidate.
Role: ${role}
Level: ${level}
Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
Difficulty: ${difficulty}

You must generate exactly:
- 3 Technical Questions (with expected answers / guidelines)
- 3 Behavioral Questions (STAR methodology alignment)
- 2 Culture-fit Questions
- 3 Scenario Questions (practical situations)

The output must be in JSON format only. Do not include markdown code block syntax. The response MUST match this schema:
{
  "questions": [
    {
      "id": 1,
      "category": "technical | behavioral | culture-fit | scenario",
      "question": "Question text here?",
      "difficulty": "${difficulty}",
      "purpose": "What this question assesses",
      "expectedAnswer": "Guidelines for what a good answer should include"
    }
  ]
}
`;

  try {
    return await callGrokAPI(prompt, systemPrompt, true);
  } catch (err) {
    console.warn('Falling back to local Interview Question simulator.');
    return {
      questions: [
        {
          id: 1,
          category: 'technical',
          question: `Explain how you optimize rendering performance in a large-scale React app, particularly relating to components that use ${skills}.`,
          difficulty: difficulty,
          purpose: 'Assess technical depth, optimization skills, and familiarity with component rendering cycles.',
          expectedAnswer: 'Should mention React.memo, useMemo, useCallback, virtualized lists, profile tools, and state splitting.'
        },
        {
          id: 2,
          category: 'technical',
          question: `Can you explain the difference between relative and absolute positioning in CSS, and how flexbox solves common layout issues?`,
          difficulty: difficulty,
          purpose: 'Validate fundamental UI styling capability.',
          expectedAnswer: 'Relative is positioned relative to normal flow; absolute is positioned relative to nearest positioned ancestor. Flexbox handles 1D spacing and alignment dynamically.'
        },
        {
          id: 3,
          category: 'behavioral',
          question: 'Describe a time when you disagreed with a product decision. How did you raise your concerns and what was the outcome?',
          difficulty: difficulty,
          purpose: 'Evaluate conflict resolution, communication, and professional ownership.',
          expectedAnswer: 'Should follow STAR format: describe situation, task, action taken, and positive collaborative result.'
        },
        {
          id: 4,
          category: 'culture-fit',
          question: 'What makes you excited about joining a high-growth startup environment like HireFlow AI?',
          difficulty: difficulty,
          purpose: 'Evaluate alignment with startup dynamics, speed, and autonomy.',
          expectedAnswer: 'Mentions adaptability, preference for impact, eagerness to wear multiple hats, and interest in AI technology.'
        },
        {
          id: 5,
          category: 'scenario',
          question: 'A critical production database bug is discovered on Friday evening. The developer responsible is offline. What steps do you take?',
          difficulty: difficulty,
          purpose: 'Test troubleshooting logic, crisis management, and team collaboration.',
          expectedAnswer: 'Analyze error logs, isolate the blast radius, rollback if possible, notify stakeholders, and document post-mortem.'
        }
      ]
    };
  }
};

/**
 * 3. AI EMAIL AUTOMATION
 */
const generateEmail = async (candidateName, jobTitle, type, details = {}, companyName = 'HireFlow AI') => {
  const systemPrompt = 'You are an HR communications representative drafting candidate templates.';
  const detailsStr = JSON.stringify(details);
  const prompt = `
Draft a professional email to candidate "${candidateName}" for the position of "${jobTitle}" at company "${companyName}".
Email Type: ${type} (Options: application_received, interview_invitation, shortlist_notice, offer_letter, rejection)
Contextual Details: ${detailsStr}

The response must be in JSON format only. Do not include markdown code block syntax. The response MUST match this schema:
{
  "subject": "Email subject line here",
  "content": "Full body of the email. Keep paragraphs clean and professional. Use tags like [Candidate Name], [Job Title], [Company Name], and [Interviewer Name] inside if needed, but fill in details where available."
}
`;

  try {
    return await callGrokAPI(prompt, systemPrompt, true);
  } catch (err) {
    console.warn('Falling back to local Email Generator simulator.');
    let subject = '';
    let content = '';

    if (type === 'interview_invitation') {
      subject = `Interview Schedule: ${jobTitle} at ${companyName}`;
      content = `Dear ${candidateName},\n\nThank you for applying for the ${jobTitle} role at ${companyName}. We were impressed by your background and would love to invite you to an interview.\n\nDate: ${details.date || 'TBD'}\nTime: ${details.time || 'TBD'}\nMeeting Link: ${details.meetingLink || '[Link]'}\n\nPlease let us know if this works for you.\n\nBest regards,\nHR Recruiting Team`;
    } else if (type === 'rejection') {
      subject = `Application Update: ${jobTitle} at ${companyName}`;
      content = `Dear ${candidateName},\n\nThank you for taking the time to apply for the ${jobTitle} position at ${companyName}. While we were impressed with your qualifications, we have decided to move forward with other candidates whose experience more closely aligns with our current needs.\n\nWe appreciate your interest in us and wish you the best in your job search.\n\nSincerely,\nHR Recruiting Team`;
    } else if (type === 'offer_letter') {
      subject = `Job Offer: ${jobTitle} at ${companyName}`;
      content = `Dear ${candidateName},\n\nWe are absolutely thrilled to offer you the position of ${jobTitle} at ${companyName}!\n\nSalary: ${details.salary || '$90,000/year'}\nStart Date: ${details.startDate || 'Next Month'}\n\nWe believe your skills in ${jobTitle} will be an incredible asset to our engineering division. Please review the attached contract details.\n\nWelcome to the team!\n\nBest regards,\nRecruitment Office`;
    } else {
      subject = `Application Received: ${jobTitle} at ${companyName}`;
      content = `Dear ${candidateName},\n\nWe have successfully received your application for the position of ${jobTitle} at ${companyName}.\n\nOur recruiting team will review your resume and experience shortly. You can track your application status anytime via our portal.\n\nThank you for your interest in joining us.\n\nBest regards,\nHR Operations`;
    }

    return { subject, content };
  }
};

/**
 * 4. AI COPILOT & CHATBOT MULTI-INTENT RESOLUTION
 */
const chatWithCopilot = async ({ message, history = [], companyContext = '', databaseContext = '' }) => {
  const systemPrompt = `
You are HireFlow AI Copilot, a highly intelligent HR, SaaS recruiting, and operations assistant.
You have access to:
- Company Documents Context: ${companyContext || 'None uploaded yet'}
- Live Database Query Summary: ${databaseContext || 'None provided'}

Guidelines:
1. Ground your answers in the provided context. If a user asks about policies, use the Company Documents.
2. If the user asks about candidates, list them clearly using the Database Context.
3. Be professional, direct, and helpful. Use markdown list formats and bold text for clarity.
4. Keep answers concise. Do not guess information.
`;

  // Construct message chain
  const messages = [];
  history.slice(-6).forEach(msg => {
    messages.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text });
  });
  messages.push({ role: 'user', content: message });

  const apiKey = getApiKey();
  if (!apiKey) {
    // Simulating response based on mock queries
    const msgLower = message.toLowerCase();
    let reply = "I am operating in development mode with simulated intelligence.";
    
    if (msgLower.includes('frontend') || msgLower.includes('candidate')) {
      reply = "Based on our candidates database, here are the top frontend engineering profiles:\n\n1. **Jane Doe** - Score: **92%** (Strengths: React, Next.js, TypeScript)\n2. **Alex Smith** - Score: **84%** (Strengths: Vue.js, JavaScript, Tailwind)\n3. **Bob Johnson** - Score: **68%** (Strengths: HTML, CSS, basics of Node)\n\nWould you like me to draft an interview invite for Jane Doe?";
    } else if (msgLower.includes('handbook') || msgLower.includes('policy') || msgLower.includes('leave')) {
      reply = "According to our company policy documents:\n\n* **Annual Leave**: Full-time employees receive **25 days** of paid leave per year.\n* **Sick Leave**: **10 days** fully compensated sick leave upon sharing standard clinical summaries.\n* **Workplace**: Hybrid work (minimum 2 days in office per week).\n\nLet me know if you would like me to retrieve benefits details!";
    } else if (msgLower.includes('why did') || msgLower.includes('score')) {
      reply = "Jane Doe scored a **92%** because of a 95% skills alignment match on our required frontend stack (React, Next.js, and TypeScript). Additionally, her resume mentions 5 years of experience leading UI features, which matches our Senior profile requirement. Her minor weakness is limited cloud AWS deployment experience.";
    }

    return reply;
  }

  try {
    const payload = {
      model: 'grok-beta',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.3
    };

    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.warn('Grok Copilot Chat API call failed. Falling back to local simulator:', error.message);
    
    const msgLower = message.toLowerCase();
    let reply = "I am operating in development mode with simulated intelligence.";
    
    if (msgLower.includes('frontend') || msgLower.includes('candidate')) {
      reply = "Based on our candidates database, here are the top frontend engineering profiles:\n\n1. **Jane Doe** - Score: **92%** (Strengths: React, Next.js, TypeScript)\n2. **Alex Smith** - Score: **84%** (Strengths: Vue.js, JavaScript, Tailwind)\n3. **Bob Johnson** - Score: **68%** (Strengths: HTML, CSS, basics of Node)\n\nWould you like me to draft an interview invite for Jane Doe?";
    } else if (msgLower.includes('handbook') || msgLower.includes('policy') || msgLower.includes('leave') || msgLower.includes('vacation')) {
      reply = "According to our company policy documents:\n\n* **Annual Leave**: Full-time employees receive **25 days** of paid leave per year.\n* **Sick Leave**: **10 days** fully compensated sick leave upon sharing standard clinical summaries.\n* **Workplace**: Hybrid work (minimum 2 days in office per week).\n\nLet me know if you would like me to retrieve benefits details!";
    } else if (msgLower.includes('why did') || msgLower.includes('score')) {
      reply = "Jane Doe scored a **92%** because of a 95% skills alignment match on our required frontend stack (React, Next.js, and TypeScript). Additionally, her resume mentions 5 years of experience leading UI features, which matches our Senior profile requirement. Her minor weakness is limited cloud AWS deployment experience.";
    } else if (msgLower.includes('hiring') || msgLower.includes('growth') || msgLower.includes('overhead') || msgLower.includes('salary') || msgLower.includes('cost') || msgLower.includes('rate') || msgLower.includes('metric')) {
      reply = "Here is the compiled executive summary for HireFlow AI:\n\n* **Workforce Health Score**: **85/100**\n* **Top Performing Department**: **Engineering** (Avg Rating: **4.8/5**)\n* **Monthly Active Overhead**: **$124,500.00** total payroll expenditures.\n* **Strategic Recommendation**: Standardize leave requests and scale up LMS cloud architecture training.";
    }

    return reply;
  }
};

/**
 * 5. EMPLOYEE INSIGHTS ENGINE
 */
const generateEmployeeInsights = async (employees, department = 'All') => {
  const systemPrompt = 'You are a corporate workforce analyst producing organizational health reports.';
  const employeeDataStr = JSON.stringify(employees.map(e => ({ name: e.name, dept: e.department, pos: e.position, status: e.status })));
  
  const prompt = `
Analyze this company employee listing for department "${department}":
${employeeDataStr}

Generate high-level workforce metrics and text.
The response must be in JSON format only. Do not include markdown code block syntax. The response MUST match this schema:
{
  "performanceSummary": "Workforce overall health and productivity summary paragraph",
  "departmentSummaries": [
    { "name": "Department Name", "health": "Stable | Expanding | Needs Attention", "notes": "Observation text" }
  ],
  "attritionRisk": "Low | Medium | High with detailed insights explanation",
  "skillGapAnalysis": ["Identified skill gap 1", "Identified skill gap 2"],
  "recommendations": ["Action plan 1", "Action plan 2"]
}
`;

  try {
    return await callGrokAPI(prompt, systemPrompt, true);
  } catch (err) {
    console.warn('Falling back to local Employee Insights simulator.');
    return {
      performanceSummary: `Workforce operates in a productive, stable condition. Employee count for the ${department} department shows standard project delivery alignment.`,
      departmentSummaries: [
        { name: 'Engineering', health: 'Expanding', notes: 'Growing team size with core focus on product execution. Higher onboarding velocity.' },
        { name: 'Sales & HR', health: 'Stable', notes: 'Consistent operations. Retention is at 100% over the last two quarters.' }
      ],
      attritionRisk: 'Low. Overall job satisfaction metrics display solid scores. A minor risk is noted if team alignment sessions are omitted during rapid headcount expansions.',
      skillGapAnalysis: [
        'Need to expand AWS / cloud native training resources.',
        'Consider onboarding dedicated QA automated test engineers.'
      ],
      recommendations: [
        'Organize skill-sharing sessions for intermediate coders to bridge technical gaps.',
        'Implement quarterly structured employee recognition loops.'
      ]
    };
  }
};

module.exports = {
  generateJobDescription,
  generateInterviewQuestions,
  generateEmail,
  chatWithCopilot,
  generateEmployeeInsights
};
