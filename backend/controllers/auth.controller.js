const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { companyName, name, email, password } = req.body;

    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ error: 'All fields (companyName, name, email, password) are required.' });
    }

    // Check if email already in use
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Create Company and User in a transaction
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: email, // Use owner email as company contact
        },
      });

      const user = await tx.user.create({
        data: {
          companyId: company.id,
          name,
          email,
          password: hashedPassword,
          role: 'admin', // First registered user is company admin
        },
      });

      return { company, user };
    });

    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        id: result.user.id,
        companyId: result.company.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        company: {
          id: result.company.id,
          name: result.company.name,
        },
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'An error occurred during company registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if user account is active
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact your administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        id: user.id,
        companyId: user.companyId,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        company: {
          id: user.company.id,
          name: user.company.name,
        },
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false
      }
    });

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'An error occurred while changing password.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId } = req.body;
    const companyId = req.user.companyId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId
      }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Generate secure temporary password
    const tempPassword = 'Temp@' + Math.floor(10000 + Math.random() * 90000);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true
      }
    });

    res.status(200).json({
      message: 'Password reset successfully.',
      tempPassword
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'An error occurred while resetting password.' });
  }
};

exports.getCompanyUsers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const users = await prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Get Company Users Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching company recruiters.' });
  }
};

exports.forgotPassword = async (req, res) => {
  const crypto = require('crypto');
  const { triggerWorkflow } = require('../services/workflow.service');

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Security practice: Return success message even if email is not found to prevent enumeration
    if (!user) {
      return res.status(200).json({
        message: 'If the email exists in our system, a password reset link has been dispatched.'
      });
    }

    // Generate secure token
    const plaintextToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(plaintextToken).digest('hex');
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    // Store in User
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpires: expiresAt
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/change-password?token=${plaintextToken}`;

    // Trigger workflow
    await triggerWorkflow('password-reset', {
      companyId: user.companyId,
      email: user.email,
      details: {
        employee_name: user.name,
        reset_link: resetLink
      }
    });

    res.status(200).json({
      message: 'If the email exists in our system, a password reset link has been dispatched.',
      // Output in dev environment for easy access
      token: process.env.NODE_ENV === 'development' ? plaintextToken : undefined
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'An error occurred while processing reset request.' });
  }
};

exports.resetPasswordConfirm = async (req, res) => {
  const crypto = require('crypto');

  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Token, password, and confirmation are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Password strength check
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clean reset tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        mustChangePassword: false
      }
    });

    res.status(200).json({
      message: 'Password has been successfully updated. You can now log in.'
    });
  } catch (error) {
    console.error('Reset Password Confirm Error:', error);
    res.status(500).json({ error: 'An error occurred while resetting password.' });
  }
};


