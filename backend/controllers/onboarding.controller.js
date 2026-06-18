const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');

// Helper to resolve Employee from authenticated User context
const getEmployeeContext = async (user) => {
  return await prisma.employee.findUnique({
    where: { email: user.email }
  });
};

exports.createOnboardingChecklist = async (req, res) => {
  try {
    const { employeeId, tasks } = req.body;
    const { companyId, id: userId } = req.user;

    if (!employeeId || !tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Employee ID and tasks array are required.' });
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const createdTasks = [];
    for (const taskName of tasks) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Default due in 7 days

      const task = await prisma.onboardingTask.create({
        data: {
          employeeId,
          title: taskName,
          status: 'pending',
          dueDate
        }
      });
      createdTasks.push(task);
    }

    await logAction({
      companyId,
      userId,
      action: 'ONBOARDING_INIT',
      entity: `Employee: ${employee.name}`,
      details: { tasksCount: tasks.length }
    });

    res.status(201).json({ message: 'Onboarding tasks created.', tasks: createdTasks });
  } catch (error) {
    console.error('Create Onboarding Checklist Error:', error);
    res.status(500).json({ error: 'Failed to initialize onboarding.' });
  }
};

exports.getOnboardingTasks = async (req, res) => {
  try {
    const { companyId } = req.user;
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'member';

    let employeeId = req.query.employeeId;

    // ESS flow: If the user is an employee, override query parameters and target their own record
    if (userRole === 'employee') {
      const emp = await getEmployeeContext(req.user);
      if (!emp) {
        return res.status(200).json([]); // No employee record yet
      }
      employeeId = emp.id;
    }

    const filters = {};
    if (employeeId) {
      filters.employeeId = employeeId;
      filters.employee = { companyId };
    } else {
      // Admins get everything under company
      filters.employee = { companyId };
    }

    const tasks = await prisma.onboardingTask.findMany({
      where: filters,
      include: { employee: true },
      orderBy: { dueDate: 'asc' }
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Get Onboarding Tasks Error:', error);
    res.status(500).json({ error: 'Failed to retrieve onboarding tasks.' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body; // 'pending' | 'in_progress' | 'completed'
    const { companyId, id: userId } = req.user;
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'member';

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid onboarding task status.' });
    }

    const task = await prisma.onboardingTask.findUnique({
      where: { id: taskId },
      include: { employee: true }
    });

    if (!task || task.employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Onboarding task not found.' });
    }

    // ESS check: If employee role, ensure they only modify their own tasks
    if (userRole === 'employee') {
      const emp = await getEmployeeContext(req.user);
      if (!emp || task.employeeId !== emp.id) {
        return res.status(403).json({ error: 'Forbidden. Access restricted to own onboarding tasks.' });
      }
    }

    const updatedTask = await prisma.onboardingTask.update({
      where: { id: taskId },
      data: { status }
    });

    // Log Audit Trail
    await logAction({
      companyId,
      userId,
      action: 'UPDATE_ONBOARDING_TASK',
      entity: `Task: ${task.title}`,
      details: { oldStatus: task.status, newStatus: status, employeeName: task.employee.name }
    });

    res.status(200).json({ message: 'Task updated successfully.', task: updatedTask });
  } catch (error) {
    console.error('Update Onboarding Task Error:', error);
    res.status(500).json({ error: 'Failed to update onboarding task.' });
  }
};
