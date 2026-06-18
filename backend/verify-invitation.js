require('dotenv').config();
const prisma = require('./config/db');
const inviteService = require('./services/invite.service');
const emailService = require('./services/email.service');
const authInviteController = require('./controllers/auth.invite.controller');
const employeesController = require('./controllers/employees.controller');

async function testInvitationWorkflow() {
  console.log('===================================================');
  console.log('🛡️  HIREFLOW AI INVITATION SYSTEM VERIFICATION');
  console.log('===================================================');

  // Clear existing databases for clean test run
  console.log('\n🧹 Cleaning up test database records...');
  await prisma.emailLog.deleteMany({});
  await prisma.employeeInvite.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { endsWith: '@test-invite.com' } } });
  await prisma.employee.deleteMany({ where: { email: { endsWith: '@test-invite.com' } } });
  
  // Ensure a test company exists
  let company = await prisma.company.findFirst({
    where: { email: 'admin@test-invite.com' }
  });
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Test Invite Co.',
        email: 'admin@test-invite.com'
      }
    });
  }
  console.log(`✅ Company context established: "${company.name}" (${company.id})`);

  // Ensure a test admin user exists in the company to satisfy foreign key constraints
  let adminUser = await prisma.user.findFirst({
    where: { email: 'admin@test-invite.com' }
  });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        companyId: company.id,
        name: 'Test Admin',
        email: 'admin@test-invite.com',
        password: 'dummyPasswordHash',
        role: 'admin',
        isActive: true
      }
    });
  }
  console.log(`✅ Admin user context established: "${adminUser.name}" (${adminUser.id})`);

  // Mock Request & Response
  const mockUserContext = {
    id: adminUser.id,
    companyId: company.id,
    role: 'admin'
  };

  // Test 1: Create Employee (Invite Workflow)
  console.log('\n[TEST 1] Creating employee and generating secure invitation...');
  const createReq = {
    body: {
      name: 'John Test',
      email: 'john@test-invite.com',
      department: 'Engineering',
      position: 'Software Engineer'
    },
    user: mockUserContext
  };

  let responseData = null;
  const createRes = {
    status: (code) => {
      if (code !== 201) throw new Error(`Failed to create employee, status: ${code}`);
      return createRes;
    },
    json: (data) => {
      responseData = data;
      return createRes;
    }
  };

  await employeesController.createEmployee(createReq, createRes);

  if (!responseData || !responseData.invite || !responseData.invite.token) {
    throw new Error('Failed to retrieve invite details in response.');
  }

  const plaintextToken = responseData.invite.token;
  const employeeId = responseData.employee.id;
  console.log(`✅ Employee created successfully (ID: ${employeeId})`);
  console.log(`✅ Plaintext Token generated: ${plaintextToken.substring(0, 10)}...`);
  console.log(`✅ Hashed Invite URL: ${responseData.invite.url}`);

  // Test 2: Verify database records
  console.log('\n[TEST 2] Verifying database records...');
  // Check invite record
  const hashedToken = inviteService.hashToken(plaintextToken);
  const inviteRecord = await prisma.employeeInvite.findUnique({
    where: { token: hashedToken }
  });
  if (!inviteRecord) throw new Error('Database invite record not found.');
  if (inviteRecord.status !== 'pending') throw new Error('Invite status is not pending.');
  console.log('✅ Invite token stored securely as SHA-256 hash');

  // Check user record
  const userRecord = await prisma.user.findFirst({
    where: { employeeId }
  });
  if (!userRecord) throw new Error('User login record not created.');
  if (userRecord.isActive) throw new Error('User is active before setting password.');
  if (userRecord.emailVerified) throw new Error('User email is verified before invitation accept.');
  console.log('✅ User login record created as inactive with email unverified');

  // Check email logs (with polling to wait for asynchronous processing)
  let emailLog = null;
  for (let i = 0; i < 20; i++) {
    emailLog = await prisma.emailLog.findFirst({
      where: { employeeId }
    });
    if (emailLog && emailLog.status === 'sent') {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!emailLog) throw new Error('Email log not written.');
  if (emailLog.status !== 'sent') throw new Error(`Email log status is not sent. Current status: ${emailLog.status}`);
  console.log('✅ Email transmission logged in audit trail');

  // Test 3: Invite link validation
  console.log('\n[TEST 3] Validating invitation token...');
  const valReq = { query: { token: plaintextToken } };
  let valResData = null;
  const valRes = {
    status: (code) => {
      if (code !== 200) throw new Error(`Token validation failed, status: ${code}`);
      return valRes;
    },
    json: (data) => {
      valResData = data;
      return valRes;
    }
  };
  await authInviteController.validateInvite(valReq, valRes);
  if (!valResData || !valResData.valid) throw new Error('Validation response is not valid.');
  console.log(`✅ Token validation succeeded for: ${valResData.employee.name} (${valResData.employee.email})`);

  // Test 4: Password complexity checks
  console.log('\n[TEST 4] Validating password complexity filters...');
  const activateReqFail = {
    body: {
      token: plaintextToken,
      password: 'weak',
      confirmPassword: 'weak'
    }
  };
  let failResData = null;
  const failRes = {
    status: (code) => {
      if (code !== 400) throw new Error(`Expected fail, but succeeded with status: ${code}`);
      return failRes;
    },
    json: (data) => {
      failResData = data;
      return failRes;
    }
  };
  await authInviteController.activateAccount(activateReqFail, failRes);
  console.log(`✅ Weak password correctly rejected: "${failResData.error}"`);

  // Test 5: Successful account activation
  console.log('\n[TEST 5] Activating account with strong password...');
  const activateReqSuccess = {
    body: {
      token: plaintextToken,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!'
    }
  };
  let successResData = null;
  const successRes = {
    status: (code) => {
      if (code !== 200) throw new Error(`Account activation failed, status: ${code}`);
      return successRes;
    },
    json: (data) => {
      successResData = data;
      return successRes;
    }
  };
  await authInviteController.activateAccount(activateReqSuccess, successRes);
  if (!successResData || !successResData.token) throw new Error('JWT token missing on activation.');
  console.log(`✅ Account activated successfully. JWT session token generated: ${successResData.token.substring(0, 15)}...`);

  // Verify DB updates
  const activatedUser = await prisma.user.findFirst({ where: { employeeId } });
  if (!activatedUser.isActive || !activatedUser.emailVerified) {
    throw new Error('User isActive/emailVerified not set to true after activation.');
  }
  const usedInvite = await prisma.employeeInvite.findUnique({ where: { token: hashedToken } });
  if (usedInvite.status !== 'accepted' || !usedInvite.usedAt) {
    throw new Error('Invite status/usedAt not updated after activation.');
  }
  console.log('✅ Database status updated correctly (isActive=true, status=accepted)');

  // Test 6: Replay attacks check (try to use the same token again)
  console.log('\n[TEST 6] Testing replay attack prevention...');
  let replayResData = null;
  const replayRes = {
    status: (code) => {
      if (code !== 400) throw new Error(`Expected fail, but status was: ${code}`);
      return replayRes;
    },
    json: (data) => {
      replayResData = data;
      return replayRes;
    }
  };
  await authInviteController.activateAccount(activateReqSuccess, replayRes);
  console.log(`✅ Replay attack blocked: "${replayResData.error}"`);

  // Test 7: Resend & Invalidate invitation flow
  console.log('\n[TEST 7] Testing Resend Invite flow...');
  
  // Create a second pending employee
  const createReq2 = {
    body: {
      name: 'Jane Pending',
      email: 'jane@test-invite.com',
      department: 'Product',
      position: 'Product Manager'
    },
    user: mockUserContext
  };

  let responseData2 = null;
  const createRes2 = {
    status: (code) => {
      if (code !== 201) throw new Error(`Failed to create employee, status: ${code}`);
      return createRes2;
    },
    json: (data) => {
      responseData2 = data;
      return createRes2;
    }
  };

  await employeesController.createEmployee(createReq2, createRes2);
  const janeEmployeeId = responseData2.employee.id;
  const janeFirstToken = responseData2.invite.token;
  const janeFirstHashed = inviteService.hashToken(janeFirstToken);

  // Resend invite for Jane
  const resendReq = {
    body: { employeeId: janeEmployeeId },
    user: mockUserContext
  };
  let resendResData = null;
  const resendRes = {
    status: (code) => {
      if (code !== 200) throw new Error(`Resend invite failed, status: ${code}`);
      return resendRes;
    },
    json: (data) => {
      resendResData = data;
      return resendRes;
    }
  };
  await employeesController.resendInvite(resendReq, resendRes);
  
  // Verify that Jane's first invite is now cancelled
  const janeFirstCancelled = await prisma.employeeInvite.findUnique({ where: { token: janeFirstHashed } });
  if (janeFirstCancelled.status !== 'cancelled') {
    throw new Error('Jane\'s original pending invite was not cancelled when new one was issued.');
  }
  console.log('✅ Previous pending invite cancelled successfully');
  console.log(`✅ New invitation sent: ${resendResData.invite.url}`);

  console.log('\n===================================================');
  console.log('🎉 ALL INVITATION SYSTEM VALIDATIONS PASSED SUCCESSFULLY');
  console.log('===================================================');
}

testInvitationWorkflow().catch(err => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
