const prisma = require('../config/db');
const { emitToCompany } = require('../services/socket.service');

exports.createInterview = async (req, res) => {
  try {
    const { candidateId, interviewerId, date, meetingLink } = req.body;
    const companyId = req.user.companyId;
    const userId = req.user.id;

    if (!candidateId || !interviewerId || !date) {
      return res.status(400).json({ error: 'candidateId, interviewerId, and date are required.' });
    }

    // 1. Verify candidate belongs to recruiter's company
    const candidate = await prisma.application.findFirst({
      where: {
        id: candidateId,
        job: { companyId }
      },
      include: {
        job: true
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate application not found in your workspace.' });
    }

    // 2. Verify interviewer belongs to same company
    const interviewer = await prisma.user.findFirst({
      where: {
        id: interviewerId,
        companyId
      }
    });

    if (!interviewer) {
      return res.status(404).json({ error: 'Interviewer not found in your workspace.' });
    }

    // 3. Create interview
    const interview = await prisma.interview.create({
      data: {
        candidateId,
        interviewerId,
        date: new Date(date),
        meetingLink: meetingLink || null,
        status: 'scheduled'
      },
      include: {
        candidate: {
          select: {
            candidateName: true,
            email: true
          }
        },
        interviewer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // 4. Update Candidate status to "interview"
    await prisma.application.update({
      where: { id: candidateId },
      data: { status: 'interview' }
    });

    // Trigger Email Workflow: interview-scheduled
    try {
      const { triggerWorkflow } = require('../services/workflow.service');
      await triggerWorkflow('interview-scheduled', {
        companyId,
        userId,
        candidateId,
        details: {
          candidate_name: candidate.candidateName,
          job_title: candidate.job.title,
          date: new Date(date).toLocaleDateString(),
          time: new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          interview_type: 'Video Conference',
          meeting_link: meetingLink || 'Video Room',
          recruiter_name: interviewer.name
        }
      });
    } catch (err) {
      console.error('Failed to trigger interview-scheduled workflow:', err.message);
    }

    // 5. Create notification
    const notificationMessage = `Interview scheduled for candidate ${candidate.candidateName} with interviewer ${interviewer.name} on ${new Date(date).toLocaleString()}.`;
    const notification = await prisma.notification.create({
      data: {
        companyId,
        title: 'Interview Scheduled',
        message: notificationMessage,
        type: 'info'
      }
    });

    // 6. Log Activity
    await prisma.activity.create({
      data: {
        companyId,
        userId,
        action: `Scheduled an interview for candidate ${candidate.candidateName}`
      }
    });

    // 7. Emit real-time Socket notification
    emitToCompany(companyId, 'new_notification', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
      isRead: notification.isRead
    });

    // Also emit a general application status change event to update the Kanban board in real time
    emitToCompany(companyId, 'candidate_status_updated', {
      candidateId,
      status: 'interview'
    });

    res.status(201).json({
      message: 'Interview scheduled successfully.',
      interview
    });
  } catch (error) {
    console.error('Create Interview Error:', error);
    res.status(500).json({ error: 'An error occurred while scheduling the interview.' });
  }
};

exports.getInterviews = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const interviews = await prisma.interview.findMany({
      where: {
        candidate: {
          job: { companyId }
        }
      },
      include: {
        candidate: {
          select: {
            id: true,
            candidateName: true,
            email: true,
            status: true,
            job: {
              select: {
                title: true
              }
            }
          }
        },
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.status(200).json(interviews);
  } catch (error) {
    console.error('Get Interviews Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching company interviews.' });
  }
};
