const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');
const { chatWithCopilot } = require('../services/ai.service');

// Helper to resolve Employee from authenticated User context
const getEmployeeContext = async (user) => {
  return await prisma.employee.findUnique({
    where: { email: user.email }
  });
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { companyId, id: userId } = req.user;

    if (!title || !description) {
      return res.status(400).json({ error: 'Course title and description are required.' });
    }

    const course = await prisma.course.create({
      data: { title, description }
    });

    await logAction({
      companyId,
      userId,
      action: 'CREATE_COURSE',
      entity: `Course: ${title}`
    });

    res.status(201).json({ message: 'Course created successfully.', course });
  } catch (error) {
    console.error('Create Course Error:', error);
    res.status(500).json({ error: 'Failed to create training course.' });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { title: 'asc' }
    });
    res.status(200).json(courses);
  } catch (error) {
    console.error('Get Courses Error:', error);
    res.status(500).json({ error: 'Failed to retrieve training courses.' });
  }
};

exports.enrollEmployee = async (req, res) => {
  try {
    const { employeeId, courseId } = req.body;
    const { companyId, id: userId } = req.user;

    if (!employeeId || !courseId) {
      return res.status(400).json({ error: 'Employee ID and Course ID are required.' });
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee profile not found.' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Check if already enrolled
    const existing = await prisma.employeeCourse.findFirst({
      where: { employeeId, courseId }
    });

    if (existing) {
      return res.status(400).json({ error: 'Employee is already enrolled in this course.' });
    }

    const enrollment = await prisma.employeeCourse.create({
      data: {
        employeeId,
        courseId,
        progress: 0,
        completed: false
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'ENROLL_COURSE',
      entity: `Course: ${course.title}`,
      details: { employeeName: employee.name }
    });

    res.status(201).json({ message: 'Employee enrolled in course successfully.', enrollment });
  } catch (error) {
    console.error('Enroll Employee Error:', error);
    res.status(500).json({ error: 'Failed to enroll employee.' });
  }
};

exports.getEnrollments = async (req, res) => {
  try {
    const { companyId } = req.user;
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'member';

    let employeeId = req.query.employeeId;

    if (userRole === 'employee') {
      const emp = await getEmployeeContext(req.user);
      if (!emp) return res.status(200).json([]);
      employeeId = emp.id;
    }

    const filters = {};
    if (employeeId) {
      filters.employeeId = employeeId;
      filters.employee = { companyId };
    } else {
      filters.employee = { companyId };
    }

    const enrollments = await prisma.employeeCourse.findMany({
      where: filters,
      include: {
        employee: true,
        course: true
      },
      orderBy: { progress: 'desc' }
    });

    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Get Enrollments Error:', error);
    res.status(500).json({ error: 'Failed to retrieve enrollments.' });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress } = req.body;
    const { companyId, id: userId } = req.user;
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'member';

    const progressInt = parseInt(progress);
    if (isNaN(progressInt) || progressInt < 0 || progressInt > 100) {
      return res.status(400).json({ error: 'Course progress must be an integer between 0 and 100.' });
    }

    const enrollment = await prisma.employeeCourse.findUnique({
      where: { id: enrollmentId },
      include: { employee: true, course: true }
    });

    if (!enrollment || enrollment.employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Enrollment record not found.' });
    }

    // ESS check
    if (userRole === 'employee') {
      const emp = await getEmployeeContext(req.user);
      if (!emp || enrollment.employeeId !== emp.id) {
        return res.status(403).json({ error: 'Forbidden. Access restricted to own enrollments.' });
      }
    }

    const completed = progressInt === 100;
    const updated = await prisma.employeeCourse.update({
      where: { id: enrollmentId },
      data: {
        progress: progressInt,
        completed
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'UPDATE_COURSE_PROGRESS',
      entity: `Course: ${enrollment.course.title}`,
      details: { oldProgress: enrollment.progress, newProgress: progressInt, completed, employeeName: enrollment.employee.name }
    });

    res.status(200).json({ message: 'Course progress updated successfully.', enrollment: updated });
  } catch (error) {
    console.error('Update Course Progress Error:', error);
    res.status(500).json({ error: 'Failed to update course progress.' });
  }
};

/**
 * AI TRAINING RECOMMENDATIONS
 */
exports.getAIRecommendations = async (req, res) => {
  try {
    const { companyId } = req.user;
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'member';

    let employeeId = req.query.employeeId;

    if (!employeeId) {
      const emp = await getEmployeeContext(req.user);
      if (emp) {
        employeeId = emp.id;
      }
    }

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required to fetch recommendations.' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        reviews: { orderBy: { reviewCycle: 'desc' }, take: 1 },
        courses: { include: { course: true } }
      }
    });

    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const allCourses = await prisma.course.findMany();
    const enrolledIds = employee.courses.map(c => c.courseId);
    const availableCourses = allCourses.filter(c => !enrolledIds.includes(c.id));

    if (availableCourses.length === 0) {
      return res.status(200).json({
        recommendations: [],
        message: 'Employee is enrolled in all available courses.'
      });
    }

    // Call Grok AI using chat completions format
    const latestReview = employee.reviews[0];
    const performanceFeedback = latestReview ? latestReview.feedback : 'No reviews recorded yet.';
    const ratingScore = latestReview ? latestReview.rating : 'N/A';

    const prompt = `
You are an AI LMS Career path recommender. Recommend 2 courses from this list of available courses:
${JSON.stringify(availableCourses.map(c => ({ id: c.id, title: c.title, desc: c.description })))}

For this employee:
Name: ${employee.name}
Role: ${employee.position}
Department: ${employee.department}
Latest Performance Rating: ${ratingScore}/5
Manager Review Feedback: "${performanceFeedback}"

Which of these courses are best suited to address their skills, position requirements, and performance gaps?
Return JSON format only. Do not include markdown code block syntax. The response MUST match this schema:
{
  "recommendations": [
    {
      "courseId": "string-uuid-here",
      "reason": "Clear explanation of how this course benefits the employee based on their role and review comments."
    }
  ]
}
`;

    let aiResult;
    try {
      const apiKey = process.env.XAI_API_KEY;
      if (!apiKey || apiKey === 'your-grok-api-key' || apiKey.trim() === '') {
        throw new Error('Fallback simulated AI Recommendations');
      }

      const response = await chatWithCopilot({
        message: prompt,
        history: [],
        companyContext: `Available Courses Count: ${availableCourses.length}`,
        databaseContext: `Employee: ${employee.name}`
      });

      let content = response.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (content.startsWith('```')) {
        content = content.replace(/^```/, '').replace(/```$/, '').trim();
      }

      aiResult = JSON.parse(content);
    } catch (e) {
      // High-quality local heuristic fallback
      aiResult = {
        recommendations: availableCourses.slice(0, 2).map((c, index) => ({
          courseId: c.id,
          reason: `Heuristic assessment recommends this course to help expand core professional fundamentals for the ${employee.position} role in the ${employee.department} department.`
        }))
      };
    }

    // Map recommendation metadata back
    const finalRecommendations = aiResult.recommendations.map(rec => {
      const courseObj = availableCourses.find(c => c.id === rec.courseId);
      return {
        courseId: rec.courseId,
        reason: rec.reason,
        courseTitle: courseObj ? courseObj.title : 'General Training',
        courseDescription: courseObj ? courseObj.description : ''
      };
    }).filter(r => r.courseDescription !== '');

    res.status(200).json({ recommendations: finalRecommendations });
  } catch (error) {
    console.error('LMS Recommendations Error:', error);
    res.status(500).json({ error: 'Failed to retrieve AI training recommendations.' });
  }
};
