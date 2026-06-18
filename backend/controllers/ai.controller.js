const prisma = require('../config/db');
const aiService = require('../services/ai.service');
const { logAction } = require('../services/audit.service');

/**
 * 1. AI JOB DESCRIPTION GENERATOR
 */
exports.generateJobDescription = async (req, res) => {
  try {
    const { role, level, skills, additionalDetails } = req.body;
    const { companyId, id: userId } = req.user;

    if (!role || !level || !skills) {
      return res.status(400).json({ error: 'Role name, target level, and required skills are required.' });
    }

    const jd = await aiService.generateJobDescription(role, level, skills, additionalDetails);

    // Track Audit Trail
    await logAction({
      companyId,
      userId,
      action: 'AI_GENERATE_JD',
      entity: `Job: ${role} (${level})`,
      details: { role, level }
    });

    res.status(200).json(jd);
  } catch (error) {
    console.error('JD Generation Error:', error);
    res.status(500).json({ error: 'AI Job Description generation failed.' });
  }
};

/**
 * 2. AI INTERVIEW QUESTION GENERATOR
 */
exports.generateInterviewQuestions = async (req, res) => {
  try {
    const { role, level, skills, difficulty } = req.body;
    const { companyId, id: userId } = req.user;

    if (!role || !level) {
      return res.status(400).json({ error: 'Role and target seniority level are required.' });
    }

    const targetDifficulty = difficulty || level;
    const questions = await aiService.generateInterviewQuestions(role, level, skills || '', targetDifficulty);

    // Track Audit
    await logAction({
      companyId,
      userId,
      action: 'AI_GENERATE_INTERVIEW_QUESTIONS',
      entity: `Questions: ${role} (${level})`,
      details: { role, level, difficulty: targetDifficulty }
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error('Questions Generation Error:', error);
    res.status(500).json({ error: 'AI Interview questions generation failed.' });
  }
};

/**
 * 3. AI EMAIL AUTOMATION
 */
exports.generateEmailDraft = async (req, res) => {
  try {
    const { candidateId, type, details } = req.body;
    const { companyId, id: userId } = req.user;

    if (!candidateId || !type) {
      return res.status(400).json({ error: 'Candidate ID and template email type are required.' });
    }

    // Fetch Candidate
    const candidate = await prisma.application.findUnique({
      where: { id: candidateId },
      include: { job: { include: { company: true } } }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found.' });
    }

    // Security Check: Ensure candidate is part of same company tenant
    if (candidate.job.companyId !== companyId) {
      return res.status(403).json({ error: 'Access denied. Tenant mismatch.' });
    }

    const email = await aiService.generateEmail(
      candidate.candidateName,
      candidate.job.title,
      type,
      details || {},
      candidate.job.company.name
    );

    // Track Audit
    await logAction({
      companyId,
      userId,
      action: 'AI_GENERATE_EMAIL',
      entity: `Candidate: ${candidate.candidateName}`,
      details: { emailType: type }
    });

    res.status(200).json(email);
  } catch (error) {
    console.error('Email Generation Error:', error);
    res.status(500).json({ error: 'AI email generation failed.' });
  }
};

/**
 * 4. AI CANDIDATE RANKING ENGINE
 */
exports.rankCandidates = async (req, res) => {
  try {
    const { jobId } = req.body;
    const { companyId, id: userId } = req.user;

    if (!jobId) {
      return res.status(400).json({ error: 'Target Job ID is required to calculate applicant rankings.' });
    }

    // Fetch Job and Applications
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          include: {
            notes: true,
            ranking: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Target job posting not found.' });
    }

    // Security Check
    if (job.companyId !== companyId) {
      return res.status(403).json({ error: 'Forbidden. Access restricted to company owner.' });
    }

    const applications = job.applications;
    if (applications.length === 0) {
      return res.status(200).json({ message: 'No candidates have applied to this job yet.', rankings: [] });
    }

    const rankingsList = [];

    // Calculate ranking score for each applicant
    for (const candidate of applications) {
      const resumeScore = candidate.aiScore || 65;

      // Extract skills scores based on matching keywords
      let matchedCount = 0;
      let totalExpected = 1;
      try {
        const matched = candidate.matchedSkills ? JSON.parse(candidate.matchedSkills) : [];
        const missing = candidate.missingSkills ? JSON.parse(candidate.missingSkills) : [];
        matchedCount = Array.isArray(matched) ? matched.length : 0;
        const missingCount = Array.isArray(missing) ? missing.length : 0;
        totalExpected = Math.max(matchedCount + missingCount, 1);
      } catch (e) {
        // parsing issues fallback
      }

      const skillsScore = Math.round(50 + ((matchedCount / totalExpected) * 50));

      // Calculate culture fit from interview notes
      let cultureScore = 75; // Default score
      let feedback = '';

      if (candidate.notes && candidate.notes.length > 0) {
        const concatNotes = candidate.notes.map(n => n.note).join(' | ');
        // simple heuristic evaluation
        let positives = 0;
        let negatives = 0;
        const lowerNotes = concatNotes.toLowerCase();

        const posWords = ['great', 'excellent', 'strong', 'good', 'match', 'impressed', 'smart', 'perfect', 'aligned', 'team player'];
        const negWords = ['weak', 'poor', 'lacks', 'fail', 'concern', 'bad', 'difficult', 'reject', 'slow', 'red flag'];

        posWords.forEach(w => { if (lowerNotes.includes(w)) positives++; });
        negWords.forEach(w => { if (lowerNotes.includes(w)) negatives++; });

        cultureScore = Math.max(0, Math.min(100, 75 + (positives * 5) - (negatives * 8)));
        feedback = `Heuristic notes sentiment score: ${cultureScore}/100. Key terms matched: ${positives} positive, ${negatives} concerns.`;
      } else {
        feedback = 'No interview feedback notes left yet. Ranking defaults to standard baseline.';
      }

      // Final weighted calculation
      // 40% Resume Match, 35% Skills match, 25% Interview culture feedback notes
      const overallScore = Math.round((resumeScore * 0.4) + (skillsScore * 0.35) + (cultureScore * 0.25));

      // Save/Upsert ranking to DB
      const dbRanking = await prisma.candidateRanking.upsert({
        where: { candidateId: candidate.id },
        update: {
          overallScore,
          technicalScore: skillsScore,
          cultureScore,
          feedback
        },
        create: {
          candidateId: candidate.id,
          overallScore,
          technicalScore: skillsScore,
          cultureScore,
          feedback
        }
      });

      rankingsList.push({
        candidateId: candidate.id,
        candidateName: candidate.candidateName,
        status: candidate.status,
        overallScore,
        technicalScore: skillsScore,
        cultureScore,
        feedback,
        resumeScore
      });
    }

    // Sort by overall score descending
    rankingsList.sort((a, b) => b.overallScore - a.overallScore);

    // Track Audit Log
    await logAction({
      companyId,
      userId,
      action: 'AI_RANK_CANDIDATES',
      entity: `Job: ${job.title}`,
      details: { applicantsCount: applications.length }
    });

    res.status(200).json({
      message: 'Candidate rankings calculated successfully.',
      rankings: rankingsList
    });
  } catch (error) {
    console.error('Candidate Ranking Error:', error);
    res.status(500).json({ error: 'AI candidate ranking calculation failed.' });
  }
};

/**
 * 5. AI EMPLOYEE INSIGHTS
 */
exports.generateEmployeeInsights = async (req, res) => {
  try {
    const { department } = req.query;
    const { companyId, id: userId } = req.user;

    const queryFilters = { companyId };
    if (department && department !== 'All') {
      queryFilters.department = department;
    }

    // Fetch Employees
    const employees = await prisma.employee.findMany({
      where: queryFilters
    });

    if (employees.length === 0) {
      return res.status(200).json({
        message: 'No employees registered in this department yet.',
        insights: {
          performanceSummary: 'No employee records are present to evaluate organizational alignment.',
          departmentSummaries: [],
          attritionRisk: 'Low (Insufficient staff volume to assess attrition metrics)',
          skillGapAnalysis: [],
          recommendations: ['Create employee profiles to activate analytical reporting panels.']
        }
      });
    }

    const insights = await aiService.generateEmployeeInsights(employees, department || 'All');

    // Track Audit
    await logAction({
      companyId,
      userId,
      action: 'AI_GENERATE_EMPLOYEE_INSIGHTS',
      entity: `Employees: ${department || 'All'}`,
      details: { employeeCount: employees.length, department }
    });

    res.status(200).json(insights);
  } catch (error) {
    console.error('Employee Insights Error:', error);
    res.status(500).json({ error: 'Failed to generate employee analytics insights.' });
  }
};

/**
 * 6. EMAIL TEMPLATES CRUD
 */
exports.getEmailTemplates = async (req, res) => {
  try {
    const { companyId } = req.user;
    const templates = await prisma.emailTemplate.findMany({
      where: { companyId }
    });
    res.status(200).json(templates);
  } catch (error) {
    console.error('Get Email Templates Error:', error);
    res.status(500).json({ error: 'Failed to retrieve email templates.' });
  }
};

exports.saveEmailTemplate = async (req, res) => {
  try {
    const { id, name, subject, content } = req.body;
    const { companyId, id: userId } = req.user;

    if (!name || !subject || !content) {
      return res.status(400).json({ error: 'Name, subject, and content are required.' });
    }

    let template;
    if (id) {
      template = await prisma.emailTemplate.update({
        where: { id },
        data: { name, subject, content }
      });
      await logAction({ companyId, userId, action: 'UPDATE_EMAIL_TEMPLATE', entity: `Template: ${name}` });
    } else {
      template = await prisma.emailTemplate.create({
        data: { companyId, name, subject, content }
      });
      await logAction({ companyId, userId, action: 'CREATE_EMAIL_TEMPLATE', entity: `Template: ${name}` });
    }

    res.status(200).json(template);
  } catch (error) {
    console.error('Save Email Template Error:', error);
    res.status(500).json({ error: 'Failed to save email template.' });
  }
};

exports.deleteEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;

    const template = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    if (template.companyId !== companyId) {
      return res.status(403).json({ error: 'Tenant mismatch.' });
    }

    await prisma.emailTemplate.delete({ where: { id } });
    await logAction({ companyId, userId, action: 'DELETE_EMAIL_TEMPLATE', entity: `Template: ${template.name}` });

    res.status(200).json({ message: 'Email template deleted successfully.' });
  } catch (error) {
    console.error('Delete Email Template Error:', error);
    res.status(500).json({ error: 'Failed to delete email template.' });
  }
};

