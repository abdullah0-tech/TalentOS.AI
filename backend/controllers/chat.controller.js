const prisma = require('../config/db');
const { chatWithCopilot } = require('../services/ai.service');
const { retrieveRelevantChunks } = require('../services/rag.service');
const { logAction } = require('../services/audit.service');

exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const { companyId, id: userId } = req.user;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const msgLower = message.toLowerCase();
    let databaseContext = '';
    let companyContext = '';

    // 1. Intent Detection & Context Ingestion
    
    // Check if query is related to candidates or applications
    if (msgLower.includes('candidate') || msgLower.includes('applicant') || msgLower.includes('resume') || msgLower.includes('frontend') || msgLower.includes('developer') || msgLower.includes('engineer') || msgLower.includes('hire')) {
      const candidates = await prisma.application.findMany({
        where: { job: { companyId } },
        include: { job: true, ranking: true },
        take: 10
      });

      if (candidates.length > 0) {
        databaseContext += `Candidate Database (Top 10):\n` + candidates.map(c => {
          const score = c.ranking?.overallScore || c.aiScore || 'N/A';
          return `- Name: ${c.candidateName}, Applied for: ${c.job.title}, Status: ${c.status}, Match Rating: ${score}%, Recommendation: ${c.recommendation || 'Review pending'}`;
        }).join('\n');
      } else {
        databaseContext += `Candidate Database: No candidates applied yet.\n`;
      }
    }

    // Check if query is related to employees or departments
    if (msgLower.includes('employee') || msgLower.includes('staff') || msgLower.includes('department') || msgLower.includes('team') || msgLower.includes('manager')) {
      const employees = await prisma.employee.findMany({
        where: { companyId },
        take: 15
      });

      const depts = employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {});

      if (employees.length > 0) {
        databaseContext += `\nEmployee Statistics:\n` + 
          `- Total Employees: ${employees.length}\n` +
          `- Department Breakdown: ${JSON.stringify(depts)}\n` +
          `- Active Employee Profiles:\n` + employees.slice(0, 5).map(e => `  * ${e.name} (${e.position} in ${e.department}) - Status: ${e.status}`).join('\n');
      } else {
        databaseContext += `\nEmployee Database: No employee profiles configured yet.\n`;
      }
    }

    // Check if query is related to general analytics, hiring rates
    if (msgLower.includes('trend') || msgLower.includes('analytics') || msgLower.includes('rate') || msgLower.includes('stat')) {
      const totalJobs = await prisma.job.count({ where: { companyId } });
      const activeJobs = await prisma.job.count({ where: { companyId, status: 'published' } });
      const totalApplicants = await prisma.application.count({ where: { job: { companyId } } });
      const interviewsCount = await prisma.interview.count({ where: { candidate: { job: { companyId } } } });

      databaseContext += `\nSystem Analytics:\n` +
        `- Total Jobs Posted: ${totalJobs}\n` +
        `- Active Open Positions: ${activeJobs}\n` +
        `- Total Candidates Screened: ${totalApplicants}\n` +
        `- Interviews Arranged: ${interviewsCount}\n`;
    }

    // RAG Pipeline Search (Policy Handbooks / guidelines documents)
    const matchedChunks = await retrieveRelevantChunks(companyId, message, 4);
    if (matchedChunks.length > 0) {
      companyContext = matchedChunks.map(chunk => `[Document Chunk from: ${chunk.document.title}]\n${chunk.content}`).join('\n\n');
    }

    // 2. Fetch Conversation History (Last 5 exchanges to maintain continuity)
    const historyDb = await prisma.aIConversation.findMany({
      where: { companyId, userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const conversationHistory = historyDb.reverse().map(h => ([
      { sender: 'user', text: h.message },
      { sender: 'assistant', text: h.response }
    ])).flat();

    // 3. Invoke Grok AI
    const responseText = await chatWithCopilot({
      message,
      history: conversationHistory,
      companyContext,
      databaseContext
    });

    // 4. Save Chat Log to DB
    await prisma.aIConversation.create({
      data: {
        companyId,
        userId,
        message,
        response: responseText
      }
    });

    // 5. Track Audit Action
    await logAction({
      companyId,
      userId,
      action: 'AI_CHAT',
      entity: `Conversation: ${userId}`,
      details: { queryLength: message.length }
    });

    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ error: 'AI Assistant could not process your message.' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const history = await prisma.aIConversation.findMany({
      where: { companyId, userId },
      orderBy: { createdAt: 'asc' },
      take: 50
    });
    res.status(200).json(history);
  } catch (error) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation logs.' });
  }
};
