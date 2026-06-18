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

exports.calculatePayroll = async (req, res) => {
  try {
    const { employeeId, baseSalary, allowances, bonuses, cycle } = req.body;
    const { companyId, id: userId } = req.user;

    if (!employeeId || !baseSalary || !cycle) {
      return res.status(400).json({ error: 'Employee ID, base salary amount, and payroll cycle month are required.' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { leaveRequests: true }
    });

    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee profile not found.' });
    }

    const base = parseFloat(baseSalary);
    const allow = parseFloat(allowances) || 0;
    const bonus = parseFloat(bonuses) || 0;

    // Deduct standard taxes (flat 15% rate mock-up)
    const taxDeductions = base * 0.15;

    // Deduct unpaid leaves (e.g., $150 per unpaid leave approved in the cycle)
    const unpaidLeaves = employee.leaveRequests.filter(l => 
      l.status === 'approved' && 
      l.leaveType === 'unpaid'
    ).length;
    const leaveDeductions = unpaidLeaves * 150.0;

    const totalDeductions = taxDeductions + leaveDeductions;
    const netPay = base + allow + bonus - totalDeductions;

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        baseSalary: base,
        allowances: allow,
        bonuses: bonus,
        deductions: totalDeductions,
        netPay: netPay > 0 ? netPay : 0,
        cycle,
        status: 'pending',
        payslipUrl: `/uploads/payslips/pay-${employeeId}-${cycle}.pdf`
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'PAYROLL_CALCULATED',
      entity: `Employee: ${employee.name}`,
      details: { cycle, netPay }
    });

    res.status(201).json({ message: 'Payroll calculated successfully.', payroll });
  } catch (error) {
    console.error('Calculate Payroll Error:', error);
    res.status(500).json({ error: 'Failed to execute payroll calculations.' });
  }
};

exports.getPayrollHistory = async (req, res) => {
  try {
    const { companyId } = req.user;
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'member';

    let employeeId = req.query.employeeId;
    const cycle = req.query.cycle;

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

    if (cycle) {
      filters.cycle = cycle;
    }

    const payrolls = await prisma.payroll.findMany({
      where: filters,
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(payrolls);
  } catch (error) {
    console.error('Get Payroll History Error:', error);
    res.status(500).json({ error: 'Failed to retrieve payroll history logs.' });
  }
};

exports.updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'processed' | 'pending'
    const { companyId, id: userId } = req.user;

    if (!['processed', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payroll process status.' });
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!payroll || payroll.employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Payroll statement not found.' });
    }

    const updated = await prisma.payroll.update({
      where: { id },
      data: { status }
    });

    await logAction({
      companyId,
      userId,
      action: `PAYROLL_${status.toUpperCase()}`,
      entity: `Payroll Statement ID: ${id}`,
      details: { employeeName: payroll.employee.name, cycle: payroll.cycle }
    });

    res.status(200).json({ message: `Payroll status updated to ${status}.`, payroll: updated });
  } catch (error) {
    console.error('Update Payroll Status Error:', error);
    res.status(500).json({ error: 'Failed to update payroll statement status.' });
  }
};
