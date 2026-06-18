const crypto = require('crypto');
const prisma = require('../config/db');

/**
 * Generates a secure random token (256-bit entropy).
 * @returns {string} - Plaintext hex token
 */
const generateInviteToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hashes a token using SHA-256 for secure DB storage.
 * @param {string} token - Plaintext token
 * @returns {string} - Hashed hex token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Validates a plaintext token against database records.
 * Checks if the token is valid, unused, and not expired.
 * 
 * @param {string} plaintextToken - Plaintext token from client URL
 * @returns {Promise<Object>} - The invite record with employee/company details, or throws error
 */
const validateToken = async (plaintextToken) => {
  if (!plaintextToken) {
    throw new Error('Token is required.');
  }

  const hashed = hashToken(plaintextToken);

  const invite = await prisma.employeeInvite.findUnique({
    where: { token: hashed },
    include: {
      employee: true,
      company: true
    }
  });

  if (!invite) {
    throw new Error('Invalid invitation link.');
  }

  if (invite.status === 'cancelled') {
    throw new Error('This invitation has been cancelled.');
  }

  if (invite.status === 'accepted' || invite.usedAt) {
    throw new Error('This invitation has already been used.');
  }

  if (invite.status === 'expired' || new Date() > new Date(invite.expiresAt)) {
    // Proactively update database status if expired but not marked
    if (invite.status === 'pending') {
      await prisma.employeeInvite.update({
        where: { id: invite.id },
        data: { status: 'expired' }
      });
    }
    throw new Error('This invitation has expired. Please request a new link.');
  }

  return invite;
};

module.exports = {
  generateInviteToken,
  hashToken,
  validateToken
};
