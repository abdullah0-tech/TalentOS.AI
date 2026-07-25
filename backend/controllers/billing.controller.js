const prisma = require('../config/db');
const { createCheckoutSession, createPortalSession } = require('../services/stripe.service');
const { logAction } = require('../services/audit.service');

exports.subscribe = async (req, res) => {
  try {
    const { planKey, billingInterval } = req.body;
    const { companyId } = req.user;

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/dashboard/billing?success=true`;
    const cancelUrl = `${appUrl}/dashboard/billing?canceled=true`;

    const session = await createCheckoutSession(
      companyId, 
      company.name, 
      company.email, 
      planKey, 
      billingInterval || 'monthly', 
      successUrl, 
      cancelUrl
    );

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Subscription Error:', error);
    res.status(500).json({ error: 'Failed to initiate checkout.' });
  }
};

exports.manageSubscription = async (req, res) => {
  try {
    const { companyId } = req.user;
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const returnUrl = `${appUrl}/dashboard/billing`;

    const session = await createPortalSession(companyId, returnUrl);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Portal Error:', error);
    res.status(500).json({ error: 'Failed to open customer portal.' });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const { companyId } = req.user;

    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: {
        plan: true
      }
    });

    if (!subscription) {
      return res.status(200).json({
        status: 'trialing',
        plan: {
          name: 'Free Trial',
          price: 0,
          seatLimit: 5,
          features: JSON.stringify(['ATS System', 'Basic Job posting'])
        },
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      });
    }

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Get Subscription Error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status.' });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { companyId } = req.user;
    const invoices = await prisma.invoice.findMany({
      where: { companyId },
      include: {
        subscription: {
          include: { plan: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error('Get Invoices Error:', error);
    res.status(500).json({ error: 'Failed to retrieve invoices.' });
  }
};

exports.getUsage = async (req, res) => {
  try {
    const { companyId } = req.user;
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: { include: { plan: true } },
        workspaceUsage: true
      }
    });

    const planName = company?.subscription?.plan?.name?.toLowerCase() || company?.subscriptionPlan || 'free';
    
    let limits = { employees: 5, candidates: 20, workspaces: 1 };
    if (planName === 'professional') limits = { employees: 100, candidates: 1000, workspaces: 1 };
    if (planName === 'business') limits = { employees: 250, candidates: 5000, workspaces: 1 };
    if (planName === 'enterprise') limits = { employees: 9999, candidates: 9999, workspaces: 99 };

    res.status(200).json({
      usage: company.workspaceUsage || { employeeCount: 0, candidateCount: 0, jobCount: 0 },
      limits,
      plan: planName
    });
  } catch (error) {
    console.error('Usage Error:', error);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
};
