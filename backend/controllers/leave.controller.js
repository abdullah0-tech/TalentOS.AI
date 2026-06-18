const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');
const { triggerEvent } = require('../services/automation.service');

// Helper to resolve Employee from authenticated User context
const getEmployeeContext = async (user) => {
  let employee = await prisma.employee.findUnique({
    where: { email: user.email }
  });
  if (!employee && user.email) {
    try {
      employee = await prisma.employee.create({
        data: {
          companyId: user.companyId,
          name: user.name || user.email.split('@')[0],
          email: user.email,
          department: 'Management',
          position: user.role || 'Administrator',
          status: 'active'
        }
      });
    } catch (e) {
      console.error('Failed to auto-create employee profile:', e);
    }
  }
  return employee;
};

exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const { companyId, id: userId } = req.user;
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'member';

    const emp = await getEmployeeContext(req.user);
    if (!emp) {
      return res.status(404).json({ error: 'Employee profile not configured. Access denied.' });
    }

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ error: 'Leave type, start date, and end date are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ error: 'Start date cannot be after end date.' });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId: emp.id,
        leaveType,
        startDate: start,
        endDate: end,
        reason,
        status: 'pending'
      }
    });

    // Fire Automation Hook
    await triggerEvent('leave_requested', {
      companyId,
      userId,
      employeeName: emp.name,
      leaveType,
      startDate,
      endDate
    });

    // Log Audit
    await logAction({
      companyId,
      userId,
      action: 'LEAVE_APPLY',
      entity: `Leave: ${emp.name}`,
      details: { leaveType, startDate, endDate }
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        companyId,
        userId,
        action: `Submitted leave request: ${leaveType} (${startDate} to ${endDate})`
      }
    });

    res.status(201).json({ message: 'Leave request submitted.', leave });
  } catch (error) {
    console.error('Apply Leave Error:', error);
    res.status(500).json({ error: 'Failed to submit leave application.' });
  }
};

exports.getLeaves = async (req, res) => {
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

    const leaves = await prisma.leaveRequest.findMany({
      where: filters,
      include: { employee: true },
      orderBy: { startDate: 'desc' }
    });

    res.status(200).json(leaves);
  } catch (error) {
    console.error('Get Leaves Error:', error);
    res.status(500).json({ error: 'Failed to retrieve leaves data.' });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'
    const { companyId, id: userId } = req.user;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid leave request approval status.' });
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: { employee: true }
    });

    if (!leave || leave.employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status }
    });

    // Trigger Leave Email Workflow
    try {
      const { triggerWorkflow } = require('../services/workflow.service');
      const eventType = status === 'approved' ? 'leave-approved' : 'leave-rejected';
      await triggerWorkflow(eventType, {
        companyId,
        userId,
        employeeId: leave.employeeId,
        details: {
          employee_name: leave.employee.name,
          leave_type: leave.leaveType,
          start_date: new Date(leave.startDate).toLocaleDateString(),
          end_date: new Date(leave.endDate).toLocaleDateString(),
          reason: leave.reason || 'Not specified'
        }
      });
    } catch (err) {
      console.error(`Failed to trigger ${status} leave email workflow:`, err.message);
    }

    // Log Audit
    await logAction({
      companyId,
      userId,
      action: `LEAVE_${status.toUpperCase()}`,
      entity: `LeaveRequest: ${requestId}`,
      details: { employeeName: leave.employee.name, status }
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        companyId,
        userId,
        action: `Leave request for ${leave.employee.name} (${leave.leaveType}) has been ${status}`
      }
    });

    res.status(200).json({ message: `Leave request ${status}.`, leave: updatedLeave });
  } catch (error) {
    console.error('Update Leave Status Error:', error);
    res.status(500).json({ error: 'Failed to update leave status.' });
  }
};
