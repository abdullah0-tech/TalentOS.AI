const prisma = require('../config/db');

exports.getMetrics = async (req, res) => {
  try {
    const totalCompanies = await prisma.company.count();
    const totalRevenueResult = await prisma.payment.aggregate({
      where: { status: 'succeeded' },
      _sum: { amount: true }
    });
    
    // Simplistic MRR calc: all active subs > free * price. Since we don't store price directly on subscription,
    // we can sum recent month's payments
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const mrrResult = await prisma.payment.aggregate({
      where: { 
        status: 'succeeded',
        createdAt: { gte: oneMonthAgo }
      },
      _sum: { amount: true }
    });

    const mrr = mrrResult._sum.amount || 0;
    const arr = mrr * 12;

    const freeUsers = await prisma.company.count({ where: { subscriptionPlan: 'free' } });
    const proUsers = await prisma.company.count({ where: { subscriptionPlan: 'professional' } });
    const enterpriseUsers = await prisma.company.count({ where: { subscriptionPlan: 'enterprise' } });

    res.status(200).json({
      mrr,
      arr,
      totalRevenue: totalRevenueResult._sum.amount || 0,
      totalCompanies,
      planDistribution: {
        free: freeUsers,
        professional: proUsers,
        enterprise: enterpriseUsers
      }
    });
  } catch (error) {
    console.error('Superadmin Metrics Error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};
