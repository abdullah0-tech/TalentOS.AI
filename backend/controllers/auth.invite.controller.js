const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const inviteService = require('../services/invite.service');
const emailService = require('../services/email.service');
const { logAction } = require('../services/audit.service');

// Password complexity regex validation helper
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
};

/**
 * Validates a token and returns basic details for the activation UI.
 * GET /api/auth/validate-invite
 */
exports.validateInvite = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Token parameter is required.' });
    }

    const invite = await inviteService.validateToken(token);

    res.status(200).json({
      valid: true,
      employee: {
        id: invite.employee.id,
        name: invite.employee.name,
        email: invite.employee.email,
        position: invite.employee.position,
        department: invite.employee.department
      },
      company: {
        id: invite.company.id,
        name: invite.company.name
      },
      expiresAt: invite.expiresAt
    });
  } catch (error) {
    console.error('Validate Invite Error:', error.message);
    res.status(400).json({ 
      error: error.message,
      expired: error.message.includes('expired') || error.message.includes('used') 
    });
  }
};

/**
 * Processes account activation by setting the password, marking invite as used,
 * activating the user record, and generating a JWT session.
 * POST /api/auth/activate-account
 */
exports.activateAccount = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Token, password, and confirmation are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' 
      });
    }

    // Step 1: Validate token (throws if invalid/expired/used)
    const invite = await inviteService.validateToken(token);
    const { employee, company } = invite;

    // Step 2: Check if user account actually exists for this employee
    const user = await prisma.user.findFirst({
      where: { employeeId: employee.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'No user login account found for this employee.' });
    }

    // Step 3: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 4: Update database in a transaction
    await prisma.$transaction([
      // Update User
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          isActive: true,
          emailVerified: true,
          mustChangePassword: false
        }
      }),
      // Update Employee Status (ensure active)
      prisma.employee.update({
        where: { id: employee.id },
        data: { status: 'active' }
      }),
      // Mark Invite as used
      prisma.employeeInvite.update({
        where: { id: invite.id },
        data: {
          status: 'accepted',
          usedAt: new Date()
        }
      })
    ]);

    // Step 5: Log Audit Event
    await logAction({
      companyId: company.id,
      userId: user.id,
      action: 'ACTIVATE_ACCOUNT',
      entity: `User: ${user.email}`,
      details: {
        employeeId: employee.id,
        name: employee.name,
        email: employee.email
      }
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        companyId: company.id,
        userId: user.id,
        action: `Account activated for employee: ${employee.name}`
      }
    });

    // Trigger Email Workflow: account-activated
    try {
      const { triggerWorkflow } = require('../services/workflow.service');
      await triggerWorkflow('account-activated', {
        companyId: company.id,
        userId: user.id,
        employeeId: employee.id,
        details: {
          employee_name: employee.name
        }
      });
    } catch (err) {
      console.error('Failed to trigger account-activated workflow:', err.message);
    }

    // Step 6: Generate JWT session
    const secret = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
    const jwtToken = jwt.sign(
      {
        id: user.id,
        companyId: company.id,
        employeeId: employee.id,
        name: employee.name,
        email: employee.email,
        role: user.role,
        mustChangePassword: false
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      message: 'Account activated successfully.',
      token: jwtToken,
      user: {
        id: user.id,
        employeeId: employee.id,
        name: employee.name,
        email: employee.email,
        role: user.role,
        mustChangePassword: false,
        company: {
          id: company.id,
          name: company.name
        }
      }
    });
  } catch (error) {
    console.error('Account Activation Error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Request a new invitation email for an expired token or via email lookup.
 * POST /api/auth/request-new-invite
 */
exports.requestNewInvite = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email && !token) {
      return res.status(400).json({ error: 'Email or previous token is required.' });
    }

    let employee = null;

    if (email) {
      employee = await prisma.employee.findUnique({
        where: { email },
        include: { company: true, invites: true }
      });
    } else if (token) {
      const hashed = inviteService.hashToken(token);
      const invite = await prisma.employeeInvite.findUnique({
        where: { token: hashed },
        include: { employee: { include: { company: true } } }
      });
      if (invite) {
        employee = invite.employee;
      }
    }

    if (!employee) {
      return res.status(404).json({ error: 'No employee account found.' });
    }

    const user = await prisma.user.findFirst({
      where: { employeeId: employee.id }
    });

    if (user && user.isActive) {
      return res.status(400).json({ error: 'This account is already active. Please log in directly.' });
    }

    // Generate new secure invitation
    const newPlaintextToken = inviteService.generateInviteToken();
    const newHashedToken = inviteService.hashToken(newPlaintextToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days

    await prisma.$transaction(async (tx) => {
      // Invalidate previous invites
      await tx.employeeInvite.updateMany({
        where: { 
          employeeId: employee.id,
          status: 'pending'
        },
        data: { status: 'cancelled' }
      });

      // Create new invite record
      await tx.employeeInvite.create({
        data: {
          companyId: employee.companyId,
          employeeId: employee.id,
          token: newHashedToken,
          expiresAt
        }
      });
    });

    // Send Welcome email
    await emailService.sendWelcomeEmail({
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email
      },
      companyName: employee.company.name,
      token: newPlaintextToken
    });

    // Log action
    await logAction({
      companyId: employee.companyId,
      userId: employee.id, // Fallback to employee id as initiator
      action: 'REQUEST_NEW_INVITE',
      entity: `Employee: ${employee.email}`,
      details: { email: employee.email }
    });

    res.status(200).json({ message: 'A new invitation link has been sent to your email.' });
  } catch (error) {
    console.error('Request New Invite Error:', error.message);
    res.status(500).json({ error: 'An error occurred while generating a new invitation.' });
  }
};
