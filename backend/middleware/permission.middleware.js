const ROLES = {
  super_admin: {
    jobs: ['view', 'create', 'edit', 'delete', 'export'],
    candidates: ['view', 'create', 'edit', 'delete', 'export'],
    interviews: ['view', 'create', 'edit', 'delete', 'export'],
    employees: ['view', 'create', 'edit', 'delete', 'export'],
    knowledge: ['view', 'create', 'edit', 'delete', 'export'],
    audit_logs: ['view', 'export'],
  },
  hr_director: {
    jobs: ['view', 'create', 'edit', 'delete', 'export'],
    candidates: ['view', 'create', 'edit', 'delete', 'export'],
    interviews: ['view', 'create', 'edit', 'delete', 'export'],
    employees: ['view', 'create', 'edit', 'delete', 'export'],
    knowledge: ['view', 'create', 'edit', 'delete', 'export'],
    audit_logs: ['view', 'export'],
  },
  admin: { // For backward compatibility with existing data
    jobs: ['view', 'create', 'edit', 'delete', 'export'],
    candidates: ['view', 'create', 'edit', 'delete', 'export'],
    interviews: ['view', 'create', 'edit', 'delete', 'export'],
    employees: ['view', 'create', 'edit', 'delete', 'export'],
    knowledge: ['view', 'create', 'edit', 'delete', 'export'],
    audit_logs: ['view', 'export'],
  },
  hr_manager: {
    jobs: ['view', 'create', 'edit', 'export'],
    candidates: ['view', 'create', 'edit', 'export'],
    interviews: ['view', 'create', 'edit', 'export'],
    employees: ['view', 'create', 'edit', 'export'],
    knowledge: ['view', 'create', 'edit', 'export'],
    audit_logs: [],
  },
  recruiter: {
    jobs: ['view', 'create', 'edit'],
    candidates: ['view', 'create', 'edit'],
    interviews: ['view', 'create', 'edit'],
    employees: [],
    knowledge: ['view'],
    audit_logs: [],
  },
  hiring_manager: {
    jobs: ['view'],
    candidates: ['view'],
    interviews: ['view', 'create', 'edit'],
    employees: [],
    knowledge: ['view'],
    audit_logs: [],
  },
  employee: {
    jobs: [],
    candidates: [],
    interviews: [],
    employees: ['view'],
    knowledge: ['view'],
    audit_logs: [],
  },
  member: {
    jobs: ['view'],
    candidates: ['view'],
    interviews: ['view'],
    employees: [],
    knowledge: ['view'],
    audit_logs: [],
  }
};

/**
 * Express middleware to enforce permissions based on the user's role.
 * @param {string} resource - The target resource (e.g., 'jobs', 'candidates', 'employees')
 * @param {string} action - The action to perform (e.g., 'view', 'create', 'edit', 'delete', 'export')
 */
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. User context missing.' });
    }

    const role = user.role ? user.role.toLowerCase() : 'member';
    const rolePermissions = ROLES[role] || ROLES['member'];

    const allowedActions = rolePermissions[resource] || [];

    if (allowedActions.includes(action)) {
      return next();
    }

    return res.status(403).json({ 
      error: `Forbidden. Role '${user.role}' does not have permission to ${action} ${resource}.` 
    });
  };
};

module.exports = {
  checkPermission,
  ROLES
};
