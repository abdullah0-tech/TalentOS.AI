const prisma = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const demoMode = process.env.DEMO_MODE === 'true';

    // 1. Fetch total counts
    const totalJobs = await prisma.job.count({
      where: { companyId }
    });

    const activeJobs = await prisma.job.count({
      where: { companyId, status: 'published' }
    });

    const totalApplications = await prisma.application.count({
      where: {
        job: { companyId }
      }
    });

    const totalEmployees = await prisma.employee.count({
      where: { companyId }
    });

    const totalInterviews = await prisma.interview.count({
      where: {
        candidate: {
          job: { companyId }
        },
        status: 'scheduled'
      }
    });

    const pendingLeaves = await prisma.leaveRequest.count({
      where: {
        employee: { companyId },
        status: 'pending'
      }
    });

    // Calculate Attendance Rate: today checked in / total active
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeEmployeesCount = await prisma.employee.count({
      where: { companyId, status: 'active' }
    });

    const checkedInToday = await prisma.attendance.count({
      where: {
        employee: { companyId },
        checkIn: { gte: today }
      }
    });

    const attendanceRate = activeEmployeesCount > 0
      ? Math.round((checkedInToday / activeEmployeesCount) * 100)
      : 100;

    // Calculate Email Automation metrics
    const emailsSent = await prisma.emailLog.count({
      where: { companyId, status: 'sent' }
    });
    const interviewsScheduledMail = await prisma.emailLog.count({
      where: { companyId, eventType: 'interview-scheduled', status: 'sent' }
    });
    const offersSent = await prisma.emailLog.count({
      where: { companyId, eventType: 'offer-letter', status: 'sent' }
    });
    const welcomeEmailsSent = await prisma.emailLog.count({
      where: { companyId, eventType: 'employee-invitation', status: 'sent' }
    });
    const leaveNotificationsSent = await prisma.emailLog.count({
      where: { 
        companyId, 
        eventType: { in: ['leave-approved', 'leave-rejected'] }, 
        status: 'sent' 
      }
    });

    // DEMO_MODE Fallback
    if (demoMode && totalEmployees === 0) {
      return res.status(200).json({
        summary: {
          totalJobs: 18,
          activeJobs: 12,
          totalApplications: 112,
          averageAIScore: 78,
          interviewConversionRate: 25,
          hiringRate: 5,
          totalEmployees: 42,
          totalInterviews: 4,
          pendingLeaves: 3,
          attendanceRate: 96,
          emailsSent: 1248,
          interviewsScheduledMail: 42,
          offersSent: 12,
          welcomeEmailsSent: 42,
          leaveNotificationsSent: 15
        },
        stageCounts: {
          applied: 120,
          shortlisted: 48,
          interview: 12,
          offered: 4,
          hired: 6,
          rejected: 15
        },
        recruitmentTrends: [
          { name: 'Jan 2026', applications: 20, hires: 1 },
          { name: 'Feb 2026', applications: 35, hires: 2 },
          { name: 'Mar 2026', applications: 45, hires: 3 },
          { name: 'Apr 2026', applications: 60, hires: 4 },
          { name: 'May 2026', applications: 85, hires: 5 },
          { name: 'Jun 2026', applications: 112, hires: 6 }
        ],
        departmentBreakdown: [
          { name: 'Engineering', value: 18 },
          { name: 'Marketing', value: 8 },
          { name: 'Design', value: 6 },
          { name: 'Operations', value: 5 },
          { name: 'HR', value: 3 },
          { name: 'Finance', value: 2 }
        ],
        activityFeed: [
          { id: 'act-1', action: 'AI Graded "Sarah Jenkins" for Engineer role', user: 'SYSTEM', createdAt: new Date() },
          { id: 'act-2', action: 'Employee leave request submitted (David Jones)', user: 'David Jones', createdAt: new Date() },
          { id: 'act-3', action: 'Created Job Posting: Staff Product Designer', user: 'Abdullah (HR)', createdAt: new Date() }
        ],
        upcomingInterviews: [
          { id: 'int-1', candidate: 'Sarah Jenkins', interviewer: 'Abdullah Admin', date: new Date(), meetingLink: 'meet.google.com/hrc-tfmd-xyz', status: 'scheduled' }
        ],
        demoMode: true
      });
    }

    // 2. Average AI Match score
    const avgScoreResult = await prisma.application.aggregate({
      where: {
        job: { companyId },
        aiScore: { not: null }
      },
      _avg: {
        aiScore: true
      }
    });
    const averageAIScore = avgScoreResult._avg.aiScore ? Math.round(avgScoreResult._avg.aiScore) : 0;

    // 3. Status breakdown (Kanban stages distribution)
    const applications = await prisma.application.findMany({
      where: {
        job: { companyId }
      },
      select: {
        status: true,
        createdAt: true,
        aiScore: true,
        job: {
          select: {
            department: true
          }
        }
      }
    });

    const stageCounts = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      hired: 0,
      rejected: 0
    };

    applications.forEach(app => {
      const status = app.status ? app.status.toLowerCase() : 'applied';
      let mappedStatus = 'applied';
      if (status === 'applied') mappedStatus = 'applied';
      else if (status === 'screening' || status === 'shortlisted' || status === 'ai reviewed') mappedStatus = 'shortlisted';
      else if (status === 'interview' || status === 'interviewing') mappedStatus = 'interview';
      else if (status === 'offered' || status === 'offer') mappedStatus = 'offered';
      else if (status === 'hired') mappedStatus = 'hired';
      else if (status === 'rejected') mappedStatus = 'rejected';
      
      if (stageCounts[mappedStatus] !== undefined) {
        stageCounts[mappedStatus]++;
      }
    });

    // Calculate Interview Conversion Rate: (interview + hired) / total applications
    const interviewCount = stageCounts.interview || 0;
    const hiredCount = stageCounts.hired || 0;
    const interviewConversionRate = totalApplications > 0 
      ? Math.round(((interviewCount + hiredCount) / totalApplications) * 100)
      : 0;

    const hiringRate = totalApplications > 0
      ? Math.round((hiredCount / totalApplications) * 100)
      : 0;

    // 4. Recruitment Trend (last 6 months applications count)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrendMap = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyTrendMap[key] = { name: key, applications: 0, hires: 0 };
    }

    applications.forEach(app => {
      const appDate = new Date(app.createdAt);
      const key = `${months[appDate.getMonth()]} ${appDate.getFullYear()}`;
      if (monthlyTrendMap[key]) {
        monthlyTrendMap[key].applications++;
        if (app.status === 'hired') {
          monthlyTrendMap[key].hires++;
        }
      }
    });

    const recruitmentTrends = Object.values(monthlyTrendMap);

    // 5. Department distribution
    const departmentMap = {};
    applications.forEach(app => {
      const dept = app.job?.department || 'General';
      if (!departmentMap[dept]) {
        departmentMap[dept] = { name: dept, value: 0 };
      }
      departmentMap[dept].value++;
    });
    const departmentBreakdown = Object.values(departmentMap);

    // 6. Recent activities feed
    const activities = await prisma.activity.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 6
    });

    const activityFeed = activities.map(act => ({
      id: act.id,
      action: act.action,
      user: act.user?.name || 'System',
      createdAt: act.createdAt
    }));

    // 7. Upcoming Interviews
    const interviews = await prisma.interview.findMany({
      where: {
        candidate: {
          job: { companyId }
        },
        date: {
          gte: new Date()
        }
      },
      include: {
        candidate: {
          select: {
            candidateName: true
          }
        },
        interviewer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      },
      take: 5
    });

    const upcomingInterviews = interviews.map(int => ({
      id: int.id,
      candidate: int.candidate.candidateName,
      interviewer: int.interviewer.name,
      date: int.date,
      meetingLink: int.meetingLink,
      status: int.status
    }));

    res.status(200).json({
      summary: {
        totalJobs,
        activeJobs,
        totalApplications,
        averageAIScore,
        interviewConversionRate,
        hiringRate,
        totalEmployees,
        totalInterviews,
        pendingLeaves,
        attendanceRate,
        emailsSent,
        interviewsScheduledMail,
        offersSent,
        welcomeEmailsSent,
        leaveNotificationsSent
      },
      stageCounts,
      recruitmentTrends,
      departmentBreakdown,
      activityFeed,
      upcomingInterviews,
      demoMode: false
    });
  } catch (error) {
    console.error('Get Analytics Error:', error);
    res.status(500).json({ error: 'An error occurred while compiling analytics.' });
  }
};
