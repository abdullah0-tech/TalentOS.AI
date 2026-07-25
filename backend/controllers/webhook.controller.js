const { stripe } = require('../services/stripe.service');
const prisma = require('../config/db');
// Assuming emailService exists, if not, we will need to create/import a generic mailer
// const emailService = require('../services/email.service'); 

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handleStripeWebhook = async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    if (endpointSecret && endpointSecret !== 'whsec_mock') {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } else {
      // Mock parsing for development if no secret is set
      event = JSON.parse(request.body.toString());
    }
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle idempotency
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: event.id }
  });
  if (existingEvent && existingEvent.processed) {
    return response.json({ received: true });
  }

  try {
    await prisma.webhookEvent.upsert({
      where: { stripeEventId: event.id },
      update: {},
      create: { stripeEventId: event.id, type: event.type }
    });

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      case 'invoice.payment_succeeded':
        const invoiceSucceeded = event.data.object;
        await handleInvoicePaymentSucceeded(invoiceSucceeded);
        break;
      case 'invoice.payment_failed':
        const invoiceFailed = event.data.object;
        await handleInvoicePaymentFailed(invoiceFailed);
        break;
      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object;
        await handleSubscriptionUpdated(subscriptionUpdated);
        break;
      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object;
        await handleSubscriptionDeleted(subscriptionDeleted);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { processed: true }
    });

    response.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { error: error.message }
    });
    response.status(500).json({ error: 'Failed to process webhook' });
  }
};

async function handleCheckoutCompleted(session) {
  const customerId = session.customer;
  const companyId = session.metadata?.companyId;
  const planKey = session.metadata?.planKey;
  const subscriptionId = session.subscription;

  if (companyId && planKey) {
    // Update the company's subscription plan string
    await prisma.company.update({
      where: { id: companyId },
      data: { subscriptionPlan: planKey }
    });
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;
  
  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!company) return;

  const dbInvoice = await prisma.invoice.create({
    data: {
      companyId: company.id,
      stripeInvoiceId: invoice.id,
      invoiceNumber: invoice.number,
      amount: invoice.amount_paid / 100, // Convert from cents
      status: 'paid',
      invoicePdf: invoice.hosted_invoice_url,
      createdAt: new Date(invoice.created * 1000)
    }
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      invoiceId: dbInvoice.id,
      companyId: company.id,
      amount: invoice.amount_paid / 100,
      status: 'succeeded',
      stripePaymentIntentId: invoice.payment_intent
    }
  });
}

async function handleInvoicePaymentFailed(invoice) {
  const customerId = invoice.customer;
  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!company) return;

  const dbInvoice = await prisma.invoice.create({
    data: {
      companyId: company.id,
      stripeInvoiceId: invoice.id,
      invoiceNumber: invoice.number,
      amount: invoice.amount_due / 100,
      status: 'unpaid',
      invoicePdf: invoice.hosted_invoice_url,
      createdAt: new Date(invoice.created * 1000)
    }
  });

  await prisma.payment.create({
    data: {
      invoiceId: dbInvoice.id,
      companyId: company.id,
      amount: invoice.amount_due / 100,
      status: 'failed',
      stripePaymentIntentId: invoice.payment_intent
    }
  });
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!company) return;

  await prisma.subscription.upsert({
    where: { companyId: company.id },
    update: {
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    },
    create: {
      companyId: company.id,
      planId: 'dummy-plan-id', // In a real system, you'd match stripePriceId to the Plan ID
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  });
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;
  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!company) return;

  await prisma.subscription.updateMany({
    where: { companyId: company.id },
    data: { status: 'canceled' }
  });
  
  await prisma.company.update({
    where: { id: company.id },
    data: { subscriptionPlan: 'free' } // Revert to free
  });
}
