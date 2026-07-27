require('dotenv').config();
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey || stripeKey === 'sk_test_mock_key' || !stripeKey.startsWith('sk_')) {
  console.error('❌ ERROR: You must set a valid STRIPE_SECRET_KEY in your backend .env file to run this script.');
  process.exit(1);
}

const stripe = new Stripe(stripeKey);

const plansToCreate = [
  {
    key: 'professional',
    name: 'Professional Plan',
    priceMonthly: 29,
    seatLimit: 100,
    features: ['Unlimited Jobs', 'Unlimited Applications', 'Up to 100 Employees', 'Up to 1000 Candidates', 'Advanced AI Resume Analysis', 'AI HR Copilot', 'Automated Email Workflows', 'Analytics Dashboard', 'Employee Portal', 'SMTP Email Integration', 'Priority Support']
  }
  // We skip Free (no stripe price) and Enterprise (custom pricing via sales)
];

async function setupStripe() {
  console.log('🚀 Starting Stripe Setup...');

  for (const plan of plansToCreate) {
    try {
      console.log(`\n⏳ Setting up ${plan.name}...`);
      
      // 1. Create Product in Stripe
      const product = await stripe.products.create({
        name: plan.name,
        description: 'TalentOS ' + plan.name,
      });
      console.log(`✅ Created Product: ${product.id}`);

      // 2. Create Price in Stripe
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.priceMonthly * 100, // in cents
        currency: 'usd',
        recurring: { interval: 'month' },
      });
      console.log(`✅ Created Price: ${price.id}`);

      // 3. Upsert Plan in Database
      const dbPlan = await prisma.plan.upsert({
        where: { id: price.id }, // We will use the Stripe Price ID as our Plan ID to easily match webhooks
        update: {
          name: plan.name,
          price: plan.priceMonthly,
          billingInterval: 'monthly',
          seatLimit: plan.seatLimit,
          features: JSON.stringify(plan.features)
        },
        create: {
          id: price.id, // Using stripePriceId as the DB Plan ID
          name: plan.name,
          price: plan.priceMonthly,
          billingInterval: 'monthly',
          seatLimit: plan.seatLimit,
          features: JSON.stringify(plan.features)
        }
      });
      console.log(`✅ Synced ${plan.name} to Database with ID: ${dbPlan.id}`);

      console.log(`\n⚠️ IMPORTANT: Add this to your .env file:`);
      console.log(`STRIPE_PRICE_PROFESSIONAL=${price.id}`);

    } catch (err) {
      console.error(`❌ Error setting up ${plan.name}:`, err.message);
    }
  }

  console.log('\n🎉 Stripe Setup Complete!');
  process.exit(0);
}

setupStripe();
