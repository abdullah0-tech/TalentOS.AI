const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/db');
const { triggerEvent } = require('../services/automation.service');
const inviteService = require('../services/invite.service');
const emailService = require('../services/email.service');
const { logAction } = require('../services/audit.service');

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, department, position, phone, candidateId, password, sendEmail = true } = req.body;
    const companyId = req.user.companyId;
    const userId = req.user.id;

    if (!name || !email || !department || !position) {
      return res.status(400).json({ error: 'name, email, department, and position are required.' });
    }

    // Check if email already belongs to an employee in the company
    const existingEmployee = await prisma.employee.findUnique({
      where: { email }
    });

    if (existingEmployee) {
      return res.status(400).json({ error: 'An employee with this email is already registered.' });
    }

    // Check if email already belongs to a user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'A user account with this email is already registered.' });
    }

    // Determine if we should set the password manually or use invitation link
    const isManualSetup = !!password;
    const finalPassword = isManualSetup ? password : crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // Get company details for email template
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    });
    const companyName = company ? company.name : 'HireFlow AI Partner';

    // Generate secure invitation details if not manual setup
    let plaintextToken = null;
    let hashedToken = null;
    let expiresAt = null;

    if (!isManualSetup) {
      plaintextToken = inviteService.generateInviteToken();
      hashedToken = inviteService.hashToken(plaintextToken);
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }

    // Create employee, user account, and optionally invite in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          companyId,
          name,
          email,
          department,
          position,
          phone: phone || null,
          status: 'active'
        }
      });

      const user = await tx.user.create({
        data: {
          companyId,
          employeeId: employee.id,
          name,
          email,
          password: hashedPassword,
          role: 'employee',
          isActive: isManualSetup, // Activated immediately if manual password setup
          mustChangePassword: false
        }
      });

      let invite = null;
      if (!isManualSetup) {
        invite = await tx.employeeInvite.create({
          data: {
            companyId,
            employeeId: employee.id,
            token: hashedToken,
            expiresAt
          }
        });
      }

      return { employee, user, invite };
    });

    const { employee } = result;

    // Trigger Email Workflow: employee-invitation (only if not manual setup and sendEmail is true)
    if (!isManualSetup && sendEmail) {
      try {
        const { triggerWorkflow } = require('../services/workflow.service');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteLink = `${frontendUrl}/activate-account?token=${plaintextToken}`;
        await triggerWorkflow('employee-invitation', {
          companyId,
          userId,
          employeeId: employee.id,
          details: {
            employee_name: employee.name,
            invite_link: inviteLink
          }
        });
      } catch (err) {
        console.error('Failed to trigger employee-invitation workflow:', err.message);
      }
    }

    // Fire automation rules engine for candidate_hired trigger event
    await triggerEvent('candidate_hired', {
      companyId,
      userId,
      candidateId,
      name,
      email,
      department,
      position
    });

    // If converted from a candidate, update application status to 'hired'
    if (candidateId) {
      await prisma.application.update({
        where: { id: candidateId },
        data: { status: 'hired' }
      });

      // Emit status updated event
      const { emitToCompany } = require('../services/socket.service');
      emitToCompany(companyId, 'candidate_status_updated', {
        candidateId,
        status: 'hired'
      });
    }

    // Log Activity
    await prisma.activity.create({
      data: {
        companyId,
        userId,
        action: `Onboarded new employee & sent invitation: ${name} (${position})`
      }
    });

    // Log Audit
    await logAction({
      companyId,
      userId,
      action: 'ONBOARD_EMPLOYEE',
      entity: `Employee: ${employee.email}`,
      details: {
        name: employee.name,
        email: employee.email,
        position: employee.position,
        department: employee.department
      }
    });

    // Create notification
    const { emitToCompany } = require('../services/socket.service');
    const notification = await prisma.notification.create({
      data: {
        companyId,
        title: 'New Employee Onboarded',
        message: `${name} has been invited as a ${position} in the ${department} department.`,
        type: 'success'
      }
    });

    emitToCompany(companyId, 'new_notification', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
      isRead: notification.isRead
    });

    if (isManualSetup) {
      res.status(201).json({
        message: 'Employee registered and account activated successfully.',
        employee,
        credentials: {
          email: employee.email,
          password
        }
      });
    } else {
      res.status(201).json({
        message: sendEmail ? 'Employee registered and invitation sent successfully.' : 'Employee registered and invite link generated.',
        employee,
        invite: {
          token: plaintextToken,
          expiresAt,
          url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate-account?token=${plaintextToken}`
        }
      });
    }
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({ error: 'An error occurred while creating the employee profile.' });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { search, department } = req.query;

    const where = { companyId };

    if (department) {
      where.department = department;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            isActive: true
          }
        },
        invites: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            status: true,
            expiresAt: true,
            usedAt: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    res.status(200).json(employees);
  } catch (error) {
    console.error('Get Employees Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching company employee list.' });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'member';

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId
      },
      include: {
        onboardingTasks: true,
        leaveRequests: true,
        attendance: {
          orderBy: { date: 'desc' }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { reviewCycle: 'desc' }
        },
        goals: true,
        courses: {
          include: {
            course: true
          }
        },
        invites: {
          orderBy: { createdAt: 'desc' }
        },
        emailLogs: {
          orderBy: { sentAt: 'desc' }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    // ESS Check: employees can only fetch their own details
    if (userRole === 'employee' && employee.email !== req.user.email) {
      return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error('Get Employee By ID Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching the employee details.' });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { employeeId, password, sendEmail = true } = req.body;
    const companyId = req.user.companyId;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required.' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee profile not found.' });
    }

    // Check if user account already linked
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { employeeId },
          { email: employee.email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'A login account already exists for this employee.' });
    }

    // Determine if we should set the password manually or use invitation link
    const isManualSetup = !!password;
    const finalPassword = isManualSetup ? password : crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // Get company details for email template
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    });
    const companyName = company ? company.name : 'HireFlow AI Partner';

    // Generate secure invitation details
    let plaintextToken = null;
    let hashedToken = null;
    let expiresAt = null;

    if (!isManualSetup) {
      plaintextToken = inviteService.generateInviteToken();
      hashedToken = inviteService.hashToken(plaintextToken);
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          companyId,
          employeeId: employee.id,
          name: employee.name,
          email: employee.email,
          password: hashedPassword,
          role: 'employee',
          isActive: isManualSetup, // Activated immediately if manual password setup
          mustChangePassword: false
        }
      });

      if (!isManualSetup) {
        await tx.employeeInvite.create({
          data: {
            companyId,
            employeeId: employee.id,
            token: hashedToken,
            expiresAt
          }
        });
      }
    });

    // Trigger Email Workflow: employee-invitation
    if (!isManualSetup && sendEmail) {
      try {
        const { triggerWorkflow } = require('../services/workflow.service');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteLink = `${frontendUrl}/activate-account?token=${plaintextToken}`;
        await triggerWorkflow('employee-invitation', {
          companyId,
          userId: req.user.id,
          employeeId: employee.id,
          details: {
            employee_name: employee.name,
            invite_link: inviteLink
          }
        });
      } catch (err) {
        console.error('Failed to trigger employee-invitation workflow:', err.message);
      }
    }

    if (isManualSetup) {
      res.status(201).json({
        message: 'Login account generated and activated successfully.',
        credentials: {
          email: employee.email,
          password
        }
      });
    } else {
      res.status(201).json({
        message: sendEmail ? 'Login account generated and invitation email sent successfully.' : 'Login account and invitation link generated.',
        invite: {
          token: plaintextToken,
          expiresAt,
          url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate-account?token=${plaintextToken}`
        }
      });
    }
  } catch (error) {
    console.error('Create Employee Account Error:', error);
    res.status(500).json({ error: 'An error occurred while generating employee login credentials.' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'suspended' | 'terminated'
    const companyId = req.user.companyId;

    if (!['active', 'suspended', 'terminated'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Choose active, suspended, or terminated.' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const updatedEmployee = await prisma.$transaction(async (tx) => {
      // Update Employee Status
      const emp = await tx.employee.update({
        where: { id },
        data: { status }
      });

      // Find and update/deactivate User login account
      const user = await tx.user.findUnique({
        where: { email: employee.email }
      });

      if (user) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            isActive: status === 'active'
          }
        });
      }

      return emp;
    });

    res.status(200).json({
      message: `Employee status updated to ${status} successfully.`,
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update Employee Status Error:', error);
    res.status(500).json({ error: 'An error occurred while updating the employee status.' });
  }
};

exports.resendInvite = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const companyId = req.user.companyId;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required.' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { company: true }
    });

    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const user = await prisma.user.findFirst({
      where: { employeeId }
    });

    if (user && user.isActive) {
      return res.status(400).json({ error: 'This employee account is already active.' });
    }

    const plaintextToken = inviteService.generateInviteToken();
    const hashedToken = inviteService.hashToken(plaintextToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.$transaction(async (tx) => {
      // Invalidate all previous invites for this employee
      await tx.employeeInvite.updateMany({
        where: {
          employeeId,
          status: 'pending'
        },
        data: { status: 'cancelled' }
      });

      // Create new invite
      await tx.employeeInvite.create({
        data: {
          companyId,
          employeeId,
          token: hashedToken,
          expiresAt
        }
      });
    });

    // Trigger Email Workflow: employee-invitation
    try {
      const { triggerWorkflow } = require('../services/workflow.service');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const inviteLink = `${frontendUrl}/activate-account?token=${plaintextToken}`;
      await triggerWorkflow('employee-invitation', {
        companyId,
        userId: req.user.id,
        employeeId: employee.id,
        details: {
          employee_name: employee.name,
          invite_link: inviteLink
        }
      });
    } catch (err) {
      console.error('Failed to trigger employee-invitation workflow:', err.message);
    }

    // Log Activity
    await prisma.activity.create({
      data: {
        companyId,
        userId: req.user.id,
        action: `Resent employee invitation: ${employee.name}`
      }
    });

    // Log Audit
    await logAction({
      companyId,
      userId: req.user.id,
      action: 'RESEND_INVITE',
      entity: `Employee: ${employee.email}`,
      details: {
        employeeId,
        name: employee.name
      }
    });

    res.status(200).json({
      message: 'Invitation resent successfully.',
      invite: {
        token: plaintextToken,
        expiresAt,
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate-account?token=${plaintextToken}`
      }
    });
  } catch (error) {
    console.error('Resend Invite Error:', error);
    res.status(500).json({ error: 'An error occurred while resending the invitation.' });
  }
};

exports.cancelInvite = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const companyId = req.user.companyId;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required.' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    await prisma.$transaction(async (tx) => {
      // Invalidate all pending invites
      await tx.employeeInvite.updateMany({
        where: {
          employeeId,
          status: 'pending'
        },
        data: { status: 'cancelled' }
      });
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        companyId,
        userId: req.user.id,
        action: `Cancelled employee invitation: ${employee.name}`
      }
    });

    // Log Audit
    await logAction({
      companyId,
      userId: req.user.id,
      action: 'CANCEL_INVITE',
      entity: `Employee: ${employee.email}`,
      details: {
        employeeId,
        name: employee.name
      }
    });

    res.status(200).json({ message: 'Invitation cancelled successfully.' });
  } catch (error) {
    console.error('Cancel Invite Error:', error);
    res.status(500).json({ error: 'An error occurred while cancelling the invitation.' });
  }
};
