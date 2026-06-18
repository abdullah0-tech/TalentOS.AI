const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');

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

exports.checkIn = async (req, res) => {
  try {
    const { location } = req.body; // 'office' | 'remote'
    const { companyId, id: userId } = req.user;

    const emp = await getEmployeeContext(req.user);
    if (!emp) {
      return res.status(404).json({ error: 'Employee profile not configured. Access denied.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: emp.id,
        checkIn: { gte: today },
        checkOut: null
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already clocked in. Please clock out first.' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: emp.id,
        checkIn: new Date(),
        location: location || 'office'
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'ATTENDANCE_CHECKIN',
      entity: `Attendance: ${emp.name}`,
      details: { location: location || 'office' }
    });

    res.status(201).json({ message: 'Checked in successfully.', attendance });
  } catch (error) {
    console.error('Checkin Error:', error);
    res.status(500).json({ error: 'Attendance checkin failed.' });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;

    const emp = await getEmployeeContext(req.user);
    if (!emp) {
      return res.status(404).json({ error: 'Employee profile not configured. Access denied.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find active checkin
    const active = await prisma.attendance.findFirst({
      where: {
        employeeId: emp.id,
        checkIn: { gte: today },
        checkOut: null
      }
    });

    if (!active) {
      return res.status(400).json({ error: 'No active clock-in session found for today.' });
    }

    const updated = await prisma.attendance.update({
      where: { id: active.id },
      data: {
        checkOut: new Date()
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'ATTENDANCE_CHECKOUT',
      entity: `Attendance: ${emp.name}`
    });

    res.status(200).json({ message: 'Checked out successfully.', attendance: updated });
  } catch (error) {
    console.error('Checkout Error:', error);
    res.status(500).json({ error: 'Attendance checkout failed.' });
  }
};

exports.getAttendanceLogs = async (req, res) => {
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

    const logs = await prisma.attendance.findMany({
      where: filters,
      include: { employee: true },
      orderBy: { checkIn: 'desc' }
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Get Attendance Logs Error:', error);
    res.status(500).json({ error: 'Failed to retrieve attendance timesheets.' });
  }
};
