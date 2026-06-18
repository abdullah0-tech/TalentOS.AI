const prisma = require('../config/db');

exports.getAuditLogs = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { action, userId, page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filters
    const filters = { companyId };
    if (action) {
      filters.action = action;
    }
    if (userId) {
      filters.userId = userId;
    }

    // Query AuditLogs
    const logs = await prisma.auditLog.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take: limitNum
    });

    const totalLogs = await prisma.auditLog.count({ where: filters });

    res.status(200).json({
      logs,
      pagination: {
        total: totalLogs,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalLogs / limitNum)
      }
    });
  } catch (error) {
    console.error('Get Audit Logs Error:', error);
    res.status(500).json({ error: 'Failed to retrieve compliance audit logs.' });
  }
};
