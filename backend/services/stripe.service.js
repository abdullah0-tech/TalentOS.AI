const Stripe = require('stripe');
const prisma = require('../config/db');

// Initialize Stripe. If no key is provided, log a warning (for local testing without keys)
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
const stripe = new Stripe(stripeKey);

if (stripeKey === 'sk_test_mock_key') {
  console.warn('⚠️ STRIPE_SECRET_KEY is not set. Using mock key. Real stripe calls will fail.');
}

const STRIPE_PRICING = {
  starter: process.env.STRIPE_PRICE_STARTER, // e.g., price_1N...
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  business: process.env.STRIPE_PRICE_BUSINESS,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE
};

const getStripePriceId = (planKey, interval) => {
  // In a real app, you might have different price IDs for monthly/yearly
  return STRIPE_PRICING[planKey];
};

/**
 * Ensures a company has a Stripe Customer ID.
 */
const getOrCreateCustomer = async (companyId, companyName, companyEmail) => {
  let company = await prisma.company.findUnique({ where: { id: companyId } });
  
  if (!company.stripeCustomerId) {
    if (stripeKey !== 'sk_test_mock_key') {
      const customer = await stripe.customers.create({
        name: companyName,
        email: companyEmail,
        metadata: {
          companyId
        }
      });
      company = await prisma.company.update({
        where: { id: companyId },
        data: { stripeCustomerId: customer.id }
      });
    } else {
      // Mock for development
      company = await prisma.company.update({
        where: { id: companyId },
        data: { stripeCustomerId: `cus_mock_${Date.now()}` }
      });
    }
  }
  return company.stripeCustomerId;
};

/**
 * Creates a Stripe Checkout Session for upgrading/subscribing.
 */
const createCheckoutSession = async (companyId, companyName, companyEmail, planKey, interval, successUrl, cancelUrl) => {
  const customerId = await getOrCreateCustomer(companyId, companyName, companyEmail);
  const priceId = getStripePriceId(planKey, interval);

  if (stripeKey === 'sk_test_mock_key') {
    // Mock response
    return { url: `${successUrl}?session_id=mock_session_123` };
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId, // The Stripe price ID
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      companyId,
      planKey,
      interval
    }
  });

  return session;
};

/**
 * Creates a Stripe Customer Portal session.
 */
const createPortalSession = async (companyId, returnUrl) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company || !company.stripeCustomerId) {
    throw new Error('Customer not found in Stripe');
  }

  if (stripeKey === 'sk_test_mock_key') {
    return { url: returnUrl }; // Mock fallback
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: company.stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
};

module.exports = {
  stripe,
  getOrCreateCustomer,
  createCheckoutSession,
  createPortalSession
};
