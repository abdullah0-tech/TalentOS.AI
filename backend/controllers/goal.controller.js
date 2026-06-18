const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');

// Helper to resolve Employee from authenticated User context
const getEmployeeContext = async (user) => {
  return await prisma.employee.findUnique({
    where: { email: user.email }
  });
};

exports.createGoal = async (req, res) => {
  try {
    const { title, targetDate, level, employeeId } = req.body;
    const { companyId, id: userId } = req.user;
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'member';

    let targetEmpId = employeeId;
    
    if (userRole === 'employee') {
      const emp = await getEmployeeContext(req.user);
      if (!emp) {
        return res.status(404).json({ error: 'Employee profile not configured. Access denied.' });
      }
      targetEmpId = emp.id;
    }

    if (!title || !targetDate) {
      return res.status(400).json({ error: 'Goal title and target deadline date are required.' });
    }

    const employee = await prisma.employee.findUnique({ where: { id: targetEmpId } });
    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const goal = await prisma.goal.create({
      data: {
        employeeId: targetEmpId,
        title,
        progress: 0,
        targetDate: new Date(targetDate),
        level: level || 'individual'
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'CREATE_GOAL',
      entity: `Goal: ${title}`,
      details: { employeeName: employee.name, level: level || 'individual' }
    });

    res.status(201).json({ message: 'Goal objective added successfully.', goal });
  } catch (error) {
    console.error('Create Goal Error:', error);
    res.status(500).json({ error: 'Failed to create objective goal.' });
  }
};

exports.updateGoalProgress = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { progress } = req.body;
    const { companyId, id: userId } = req.user;
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'member';

    const progressInt = parseInt(progress);
    if (isNaN(progressInt) || progressInt < 0 || progressInt > 100) {
      return res.status(400).json({ error: 'Goal progress must be an integer between 0 and 100.' });
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { employee: true }
    });

    if (!goal || goal.employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Goal objective not found.' });
    }

    // ESS Check
    if (userRole === 'employee') {
      const emp = await getEmployeeContext(req.user);
      if (!emp || goal.employeeId !== emp.id) {
        return res.status(403).json({ error: 'Forbidden. Access restricted to own goals.' });
      }
    }

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: { progress: progressInt }
    });

    await logAction({
      companyId,
      userId,
      action: 'UPDATE_GOAL_PROGRESS',
      entity: `Goal: ${goal.title}`,
      details: { oldProgress: goal.progress, newProgress: progressInt, employeeName: goal.employee.name }
    });

    res.status(200).json({ message: 'Goal progress updated successfully.', goal: updated });
  } catch (error) {
    console.error('Update Goal Progress Error:', error);
    res.status(500).json({ error: 'Failed to update goal progress.' });
  }
};

exports.getGoals = async (req, res) => {
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

    const goals = await prisma.goal.findMany({
      where: filters,
      include: { employee: true },
      orderBy: { targetDate: 'asc' }
    });

    res.status(200).json(goals);
  } catch (error) {
    console.error('Get Goals Error:', error);
    res.status(500).json({ error: 'Failed to retrieve goals.' });
  }
};
