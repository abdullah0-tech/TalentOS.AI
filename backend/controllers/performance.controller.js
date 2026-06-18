const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');

// Helper to resolve Employee from authenticated User context
const getEmployeeContext = async (user) => {
  return await prisma.employee.findUnique({
    where: { email: user.email }
  });
};

exports.submitReview = async (req, res) => {
  try {
    const { employeeId, rating, feedback, reviewCycle } = req.body;
    const { companyId, id: reviewerId } = req.user;

    if (!employeeId || !rating || !feedback) {
      return res.status(400).json({ error: 'Employee ID, numerical rating (1-5), and review text feedback are required.' });
    }

    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Review rating score must be an integer between 1 and 5.' });
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const review = await prisma.performanceReview.create({
      data: {
        employeeId,
        reviewerId,
        rating: ratingNum,
        feedback,
        reviewCycle: reviewCycle || 'Q1_2026'
      }
    });

    await logAction({
      companyId,
      userId: reviewerId,
      action: 'PERFORMANCE_REVIEW_SUBMIT',
      entity: `Employee: ${employee.name}`,
      details: { rating: ratingNum, cycle: reviewCycle || 'Q1_2026' }
    });

    res.status(201).json({ message: 'Performance evaluation review recorded.', review });
  } catch (error) {
    console.error('Submit Review Error:', error);
    res.status(500).json({ error: 'Failed to record performance review.' });
  }
};

exports.getReviews = async (req, res) => {
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

    const reviews = await prisma.performanceReview.findMany({
      where: filters,
      include: {
        employee: true,
        reviewer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { reviewCycle: 'desc' }
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ error: 'Failed to retrieve performance reviews.' });
  }
};
