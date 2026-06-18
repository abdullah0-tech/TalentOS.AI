const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');

// Starter, Professional, Business, Enterprise plan seeds
const PLANS = {
  starter: { name: 'Starter', price: 9.0, seatLimit: 10, features: ['ATS System', 'Job Posting', 'Onboarding checklists'] },
  professional: { name: 'Professional', price: 29.0, seatLimit: 50, features: ['ATS System', 'Onboarding', 'Time & Attendance', 'Leave management'] },
  business: { name: 'Business', price: 79.0, seatLimit: 250, features: ['ATS System', 'Onboarding', 'Time & Attendance', 'Leave management', 'LMS training', 'Goals & OKRs', 'No-code Automations'] },
  enterprise: { name: 'Enterprise', price: 199.0, seatLimit: 9999, features: ['All features', 'Custom org hierarchies', 'Payroll systems', 'SSO & MFA', 'White-labeling', 'AI Executive copilots'] }
};

exports.subscribe = async (req, res) => {
  try {
    const { planKey, billingInterval } = req.body; // planKey: 'starter' | 'professional' | 'business' | 'enterprise'
    const { companyId, id: userId } = req.user;

    const selectedPlan = PLANS[planKey?.toLowerCase()];
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan selected. Choose starter, professional, business, or enterprise.' });
    }

    // Find or create Plan seed in DB
    let plan = await prisma.plan.findFirst({
      where: { name: selectedPlan.name, billingInterval: billingInterval || 'monthly' }
    });

    if (!plan) {
      plan = await prisma.plan.create({
        data: {
          name: selectedPlan.name,
          price: selectedPlan.price,
          billingInterval: billingInterval || 'monthly',
          seatLimit: selectedPlan.seatLimit,
          features: JSON.stringify(selectedPlan.features)
        }
      });
    }

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30); // 30-day renewal cycle

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { companyId },
      update: {
        planId: plan.id,
        status: 'active',
        currentPeriodStart,
        currentPeriodEnd
      },
      create: {
        companyId,
        planId: plan.id,
        status: 'active',
        currentPeriodStart,
        currentPeriodEnd
      }
    });

    // Generate local invoice and payment entry for auditing
    const amount = selectedPlan.price;
    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        companyId,
        amount,
        status: 'paid',
        invoiceUrl: `/uploads/invoices/inv-${Date.now()}.pdf`
      }
    });

    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        companyId,
        amount,
        status: 'succeeded',
        stripePaymentIntentId: `pi_mock_${Date.now()}`
      }
    });

    // Update Company subscriptionPlan flag
    await prisma.company.update({
      where: { id: companyId },
      data: { subscriptionPlan: selectedPlan.name.toLowerCase() }
    });

    await logAction({
      companyId,
      userId,
      action: 'SUBSCRIPTION_UPGRADE',
      entity: `Plan: ${selectedPlan.name}`,
      details: { price: selectedPlan.price, interval: billingInterval || 'monthly' }
    });

    res.status(200).json({
      message: 'Subscription updated successfully.',
      subscription,
      invoice
    });
  } catch (error) {
    console.error('Subscription Error:', error);
    res.status(500).json({ error: 'Failed to process subscription modification.' });
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
      // Default Free Plan fallback representation
      return res.status(200).json({
        status: 'trialing',
        plan: {
          name: 'Free Trial',
          price: 0,
          seatLimit: 5,
          features: JSON.stringify(['ATS System', 'Basic Job posting'])
        },
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
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
