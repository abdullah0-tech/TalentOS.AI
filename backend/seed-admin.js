const bcrypt = require('bcryptjs');
const prisma = require('./config/db');

async function seedAdmin() {
  console.log('Seeding administrator account for abdullah@gmail.com...');

  const email = 'abdullah@gmail.com';
  const password = 'Admin123!';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log(`✅ Account already exists for ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    // 1. Create Company
    const company = await tx.company.create({
      data: {
        name: 'Abdullah Workspace',
        email: email
      }
    });

    // 2. Create Admin User
    const user = await tx.user.create({
      data: {
        companyId: company.id,
        name: 'Abdullah Admin',
        email: email,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true
      }
    });

    console.log(`\n==================================================`);
    console.log(`🎉 USER ACCOUNT SEEDED SUCCESSFULLY`);
    console.log(`👉 Email:    ${email}`);
    console.log(`👉 Password: ${password}`);
    console.log(`==================================================\n`);
  });
}

seedAdmin()
  .catch((err) => {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
