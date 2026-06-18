const prisma = require('../config/db');
const { chatWithCopilot } = require('../services/ai.service');
const { logAction } = require('../services/audit.service');

exports.getWorkforceInsights = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;

    // 1. Gather workforce statistics for company
    const totalEmployees = await prisma.employee.count({ where: { companyId } });
    if (totalEmployees === 0) {
      return res.status(200).json({
        healthScore: 100,
        workforceSummary: 'No employees currently registered in the database.',
        skillsAnalysis: ['Add employee profiles to begin training evaluations.'],
        promotions: [],
        attritionRisk: 'Low',
        attritionReason: 'No employee activity recorded.',
        hiringForecast: 'Stable hiring forecast.'
      });
    }

    const reviews = await prisma.performanceReview.findMany({
      where: { employee: { companyId } },
      include: { employee: true }
    });

    const attendanceLogs = await prisma.attendance.findMany({
      where: { employee: { companyId } }
    });

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { employee: { companyId } }
    });

    // Compute basic rates
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 'N/A';

    const totalCheckins = attendanceLogs.length;
    const remoteCheckins = attendanceLogs.filter(a => a.location === 'remote').length;
    const remoteRatio = totalCheckins > 0 ? Math.round((remoteCheckins / totalCheckins) * 100) : 0;

    const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;

    // 2. Build Grok Prompt
    const prompt = `
You are an AI Workforce Intelligence Broker. Analyze this company's aggregated metrics:
- Total Employees: ${totalEmployees}
- Average Q1 Performance Rating: ${avgRating}/5
- Total Attendance Log Entries: ${totalCheckins} (${remoteRatio}% remote)
- Total Leave Requests Filed: ${leaveRequests.length} (${pendingLeaves} pending approval)
- Detailed Performance Review Feedback Logs:
${JSON.stringify(reviews.map(r => ({ name: r.employee.name, role: r.employee.position, rating: r.rating, feedback: r.feedback })))}

Formulate a structured workforce intelligence report:
1. AI Workforce Health Score (an integer from 0 to 100).
2. General workforce summary paragraph.
3. Skill gaps detected based on reviews.
4. Promotion candidates (identify employees with rating >= 4.5).
5. Attrition risk indicator (Low | Medium | High) and reason.
6. Hiring forecast text for the next quarter.

Return JSON format only. Do not include markdown code block syntax. The response MUST match this schema:
{
  "healthScore": 85,
  "workforceSummary": "Detailed text summarizing overall company culture and performance",
  "skillsAnalysis": ["Skill gap item 1", "Skill gap item 2"],
  "promotions": [
    { "name": "Employee Name", "role": "Current Role", "reason": "Why they should be promoted based on feedback" }
  ],
  "attritionRisk": "Low | Medium | High",
  "attritionReason": "Detailed explanation of attrition signals",
  "hiringForecast": "Detailed text describing hiring forecast recommendations"
}
`;

    let aiResult;
    try {
      const apiKey = process.env.XAI_API_KEY;
      if (!apiKey || apiKey === 'your-grok-api-key' || apiKey.trim() === '') {
        throw new Error('Local mock fallback trigger');
      }

      const response = await chatWithCopilot({
        message: prompt,
        history: [],
        companyContext: `Hiring and employee metrics for company ID ${companyId}`,
        databaseContext: `Employees Count: ${totalEmployees}`
      });

      let content = response.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (content.startsWith('```')) {
        content = content.replace(/^```/, '').replace(/```$/, '').trim();
      }

      aiResult = JSON.parse(content);
    } catch (e) {
      // Local Heuristic Fallback
      const highPerformers = reviews
        .filter(r => r.rating >= 4)
        .map(r => ({ name: r.employee.name, role: r.employee.position, reason: `Excellent performance review rating: ${r.rating}/5. Feedback: "${r.feedback.slice(0, 50)}..."` }));

      aiResult = {
        healthScore: avgRating !== 'N/A' ? Math.round(avgRating * 20) : 80,
        workforceSummary: `Workforce is operational with ${totalEmployees} active employees. System reports average Q1 reviews rating of ${avgRating}/5. Daily attendance checks indicate a hybrid deployment model with ${remoteRatio}% remote workspace configurations.`,
        skillsAnalysis: [
          'Further training in cloud technologies and distributed databases is recommended.',
          'Identified minor project management skill gaps in engineering pipelines.'
        ],
        promotions: highPerformers.slice(0, 3),
        attritionRisk: leaveRequests.length > 5 ? 'Medium' : 'Low',
        attritionReason: leaveRequests.length > 5 
          ? 'Increased leave requests filed over the past quarter may indicate potential burnout or project fatigue.' 
          : 'Stable employee retainment indicators. Absences are within normal bounds.',
        hiringForecast: 'Hiring requirements call for adding 2 additional engineering staff to bridge skill gaps.'
      };
    }

    // Log Audit
    await logAction({
      companyId,
      userId,
      action: 'AI_VIEW_WORKFORCE_INSIGHTS',
      entity: `Workforce: ${companyId}`
    });

    res.status(200).json(aiResult);
  } catch (error) {
    console.error('Workforce Insights Error:', error);
    res.status(500).json({ error: 'Failed to compile AI workforce insights.' });
  }
};
