const prisma = require('../config/db');

/**
 * Creates an audit log entry in the database.
 * @param {Object} params
 * @param {string} params.companyId - The company ID.
 * @param {string} params.userId - The user ID.
 * @param {string} params.action - The action name (e.g., 'LOGIN', 'CREATE_JOB', 'UPDATE_CANDIDATE_STATUS').
 * @param {string} params.entity - The target entity (e.g., 'Job: <uuid>', 'Candidate: <name>').
 * @param {Object|string} [params.details] - Optional extra metadata/changes.
 */
const logAction = async ({ companyId, userId, action, entity, details }) => {
  try {
    const detailsStr = details 
      ? (typeof details === 'object' ? JSON.stringify(details) : String(details)) 
      : null;

    await prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action,
        entity,
        details: detailsStr
      }
    });
  } catch (error) {
    console.error('Audit Log Service Failure:', error);
  }
};

module.exports = { logAction };
