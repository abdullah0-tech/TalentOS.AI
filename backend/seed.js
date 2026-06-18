const bcrypt = require('bcryptjs');
const prisma = require('./config/db');

async function seed() {
  console.log('🌱 Starting database seeding for TalentOS development...');

  // 1. Clean up existing data
  console.log('🧹 Cleaning up database tables...');
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.plan.deleteMany({});
  
  await prisma.emailLog.deleteMany({});
  await prisma.employeeInvite.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.onboardingTask.deleteMany({});
  await prisma.employeeCourse.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.payroll.deleteMany({});
  
  await prisma.performanceReview.deleteMany({});
  await prisma.candidateNote.deleteMany({});
  await prisma.candidateRanking.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});
  
  await prisma.notification.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.knowledgeDocument.deleteMany({});
  await prisma.aIConversation.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.emailTemplate.deleteMany({});
  await prisma.automation.deleteMany({});
  await prisma.integration.deleteMany({});
  await prisma.auditSecurityLog.deleteMany({});
  await prisma.emailSetting.deleteMany({});
  
  await prisma.user.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.company.deleteMany({});

  console.log('✅ Databases cleared.');

  // 2. Seed Company
  const company = await prisma.company.create({
    data: {
      name: 'Abdullah Workspace',
      email: 'abdullah@gmail.com',
      subscriptionPlan: 'business'
    }
  });
  console.log(`🏢 Created Company: ${company.name}`);

  // 3. Seed Plan & Subscription
  const plan = await prisma.plan.create({
    data: {
      name: 'Business',
      price: 79.0,
      billingInterval: 'monthly',
      seatLimit: 250,
      features: JSON.stringify(['ATS System', 'Onboarding', 'Time & Attendance', 'Leave management', 'LMS training', 'Goals & OKRs', 'No-code Automations'])
    }
  });

  const subscription = await prisma.subscription.create({
    data: {
      companyId: company.id,
      planId: plan.id,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });
  console.log(`💳 Created Subscription for Plan: ${plan.name}`);

  // 4. Seed Admin User
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Abdullah Admin',
      email: 'abdullah@gmail.com',
      password: adminPasswordHash,
      role: 'admin',
      isActive: true,
      emailVerified: true
    }
  });
  console.log(`👤 Created Admin User: ${adminUser.email}`);

  // 4b. Seed Demo Account
  const demoCompany = await prisma.company.create({
    data: {
      name: 'TalentOS Public Demo',
      email: 'demo-company@talentos.ai',
      subscriptionPlan: 'enterprise'
    }
  });

  const demoPasswordHash = await bcrypt.hash('Demo123@', 10);
  const demoUser = await prisma.user.create({
    data: {
      companyId: demoCompany.id,
      name: 'Demo Visitor',
      email: 'demo@talentos.ai',
      password: demoPasswordHash,
      role: 'admin',
      isDemo: true,
      isActive: true,
      emailVerified: true
    }
  });
  console.log(`👤 Created Demo User: ${demoUser.email}`);


  // 5. Seed Employees
  const employeesData = [
    { name: 'Sarah Jenkins', email: 'sarah.jenkins@stitchlabs.com', department: 'Engineering', position: 'Senior Full-Stack Engineer', status: 'active' },
    { name: 'David Jones', email: 'david.jones@stitchlabs.com', department: 'Engineering', position: 'Frontend Developer', status: 'active' },
    { name: 'Sophia Smith', email: 'sophia.smith@stitchlabs.com', department: 'Marketing', position: 'Growth Manager', status: 'active' },
    { name: 'Lucas Vance', email: 'lucas.vance@stitchlabs.com', department: 'Design', position: 'Lead Designer', status: 'active' },
    { name: 'Jane Pending', email: 'jane.pending@stitchlabs.com', department: 'Product', position: 'Product Manager', status: 'active' }
  ];

  const employees = [];
  const empPasswordHash = await bcrypt.hash('Employee123!', 10);

  for (const empInfo of employeesData) {
    const emp = await prisma.employee.create({
      data: {
        companyId: company.id,
        name: empInfo.name,
        email: empInfo.email,
        department: empInfo.department,
        position: empInfo.position,
        status: empInfo.status
      }
    });

    await prisma.user.create({
      data: {
        companyId: company.id,
        employeeId: emp.id,
        name: empInfo.name,
        email: empInfo.email,
        password: empPasswordHash,
        role: 'employee',
        isActive: true,
        emailVerified: true
      }
    });

    employees.push(emp);
  }
  console.log(`👥 Seeded ${employees.length} employees with workspace user accounts.`);

  // 6. Seed Jobs
  const jobsData = [
    { title: 'Senior Full-Stack Engineer', department: 'Engineering', location: 'San Francisco, CA / Remote', employmentType: 'full-time', skills: 'React, Node.js, Tailwind CSS, PostgreSQL', description: 'We are hiring a Senior Full-Stack Engineer. You will lead development on our core web applications using React, Node.js, and PostgreSQL. Experience with cloud services (AWS/GCP) is a plus.', status: 'published' },
    { title: 'Staff Product Designer', department: 'Design', location: 'New York, NY / Hybrid', employmentType: 'full-time', skills: 'Figma, UI/UX design, User Research, Prototyping', description: 'Seeking a Staff Product Designer to direct user interface aesthetics and manage our comprehensive design systems. Figma fluency and user-centric design methodologies are required.', status: 'published' },
    { title: 'Growth Marketing Lead', department: 'Marketing', location: 'Remote', employmentType: 'full-time', skills: 'SEO, Google Analytics, Content Marketing, Paid Ads', description: 'Lead our growth efforts. Standardize acquisition funnels, monitor SEO strategies, and execute digital advertising campaigns.', status: 'published' }
  ];

  const jobs = [];
  for (const jobInfo of jobsData) {
    const slug = `${jobInfo.title.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;
    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title: jobInfo.title,
        slug,
        department: jobInfo.department,
        location: jobInfo.location,
        employmentType: jobInfo.employmentType,
        skills: jobInfo.skills,
        description: jobInfo.description,
        status: jobInfo.status
      }
    });
    jobs.push(job);
  }
  console.log(`💼 Seeded ${jobs.length} published job postings.`);

  // 7. Seed Applications (Candidates)
  const applicationsData = [
    {
      jobId: jobs[0].id,
      candidateName: 'Michael Chang',
      email: 'michael.chang@test-email.com',
      resumeUrl: '/uploads/resumes/michael-chang.pdf',
      aiScore: 92,
      matchedSkills: JSON.stringify(['react', 'node.js', 'postgresql', 'tailwind css']),
      missingSkills: JSON.stringify(['aws']),
      aiSummary: 'Strong technical alignment with open full-stack requirements. Demonstrates solid javascript architecture knowledge.',
      experienceLevel: 'Senior',
      recommendation: 'Strongly Recommended',
      status: 'shortlisted'
    },
    {
      jobId: jobs[0].id,
      candidateName: 'Amanda Ross',
      email: 'amanda.ross@test-email.com',
      resumeUrl: '/uploads/resumes/amanda-ross.pdf',
      aiScore: 78,
      matchedSkills: JSON.stringify(['react', 'tailwind css']),
      missingSkills: JSON.stringify(['node.js', 'postgresql']),
      aiSummary: 'Capable frontend developer with substantial UI layout experience. Lacks backend framework exposure.',
      experienceLevel: 'Mid',
      recommendation: 'Recommended',
      status: 'interview'
    },
    {
      jobId: jobs[1].id,
      candidateName: 'Derrick Rose',
      email: 'derrick.rose@test-email.com',
      resumeUrl: '/uploads/resumes/derrick-rose.pdf',
      aiScore: 88,
      matchedSkills: JSON.stringify(['figma', 'ui/ux design', 'prototyping']),
      missingSkills: JSON.stringify(['user research']),
      aiSummary: 'Exceptional designer with a striking portfolio. Displays deep system architecture layout aesthetics.',
      experienceLevel: 'Lead',
      recommendation: 'Strongly Recommended',
      status: 'offer'
    },
    {
      jobId: jobs[0].id,
      candidateName: 'Sarah Jenkins',
      email: 'sarah.jenkins@stitchlabs.com',
      resumeUrl: '/uploads/resumes/sarah-jenkins.pdf',
      aiScore: 95,
      matchedSkills: JSON.stringify(['react', 'node.js', 'postgresql', 'tailwind css', 'aws']),
      missingSkills: JSON.stringify([]),
      aiSummary: 'Perfect technical and cultural match. Converted to employee.',
      experienceLevel: 'Senior',
      recommendation: 'Strongly Recommended',
      status: 'hired'
    },
    {
      jobId: jobs[2].id,
      candidateName: 'John Davis',
      email: 'john.davis@test-email.com',
      resumeUrl: '/uploads/resumes/john-davis.pdf',
      aiScore: 45,
      matchedSkills: JSON.stringify(['seo']),
      missingSkills: JSON.stringify(['google analytics', 'paid ads']),
      aiSummary: 'Insufficient experience in growth acquisition strategies. Match parameters fall short.',
      experienceLevel: 'Junior',
      recommendation: 'Not Recommended',
      status: 'rejected'
    }
  ];

  const applications = [];
  for (const appInfo of applicationsData) {
    const app = await prisma.application.create({
      data: {
        jobId: appInfo.jobId,
        candidateName: appInfo.candidateName,
        email: appInfo.email,
        resumeUrl: appInfo.resumeUrl,
        aiScore: appInfo.aiScore,
        matchedSkills: appInfo.matchedSkills,
        missingSkills: appInfo.missingSkills,
        aiSummary: appInfo.aiSummary,
        experienceLevel: appInfo.experienceLevel,
        recommendation: appInfo.recommendation,
        status: appInfo.status
      }
    });
    applications.push(app);
  }
  console.log(`📄 Seeded ${applications.length} candidate applications.`);

  // 8. Seed Interviews
  const interviewDate = new Date();
  interviewDate.setDate(interviewDate.getDate() + 2); // Scheduled for 2 days from now
  const interview = await prisma.interview.create({
    data: {
      candidateId: applications[1].id,
      interviewerId: adminUser.id,
      date: interviewDate,
      meetingLink: 'meet.google.com/hrc-tfmd-xyz',
      status: 'scheduled'
    }
  });
  console.log(`🗓 Seeded 1 upcoming interview session.`);

  // 9. Seed Leave Requests
  const leavesData = [
    { employeeId: employees[1].id, leaveType: 'annual', startDate: new Date('2026-06-18'), endDate: new Date('2026-06-20'), status: 'pending', reason: 'Summer holiday trip' },
    { employeeId: employees[2].id, leaveType: 'sick', startDate: new Date('2026-06-19'), endDate: new Date('2026-06-19'), status: 'pending', reason: 'Medical appointment' },
    { employeeId: employees[0].id, leaveType: 'annual', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-05'), status: 'approved', reason: 'Moving house' }
  ];

  for (const leaveInfo of leavesData) {
    await prisma.leaveRequest.create({
      data: {
        employeeId: leaveInfo.employeeId,
        leaveType: leaveInfo.leaveType,
        startDate: leaveInfo.startDate,
        endDate: leaveInfo.endDate,
        status: leaveInfo.status,
        reason: leaveInfo.reason
      }
    });
  }
  console.log(`✈ Seeded ${leavesData.length} leave requests.`);

  // 10. Seed Attendance
  const punchDate = new Date();
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Seed check-in for Sarah
    await prisma.attendance.create({
      data: {
        employeeId: employees[0].id,
        checkIn: new Date(date.setHours(9, 0, 0, 0)),
        checkOut: new Date(date.setHours(17, 30, 0, 0)),
        location: 'office',
        date: date
      }
    });

    // Seed check-in for David (Remote)
    await prisma.attendance.create({
      data: {
        employeeId: employees[1].id,
        checkIn: new Date(date.setHours(9, 15, 0, 0)),
        checkOut: new Date(date.setHours(18, 0, 0, 0)),
        location: 'remote',
        date: date
      }
    });

    // Seed check-in for Sophia (Late)
    await prisma.attendance.create({
      data: {
        employeeId: employees[2].id,
        checkIn: new Date(date.setHours(10, 5, 0, 0)),
        checkOut: new Date(date.setHours(19, 0, 0, 0)),
        location: 'office',
        date: date
      }
    });
  }
  console.log(`⏰ Seeded 15 attendance checkin punch logs.`);

  // 11. Seed Email Logs
  const emailLogsData = [
    { eventType: 'candidate-applied', subject: 'Application Received: Senior Full-Stack Engineer', email: 'michael.chang@test-email.com' },
    { eventType: 'shortlisted', subject: 'Coding Challenge Invitation - Stitch Labs', email: 'michael.chang@test-email.com' },
    { eventType: 'interview-scheduled', subject: 'Interview Scheduled: Panel Evaluation', email: 'amanda.ross@test-email.com' },
    { eventType: 'employee-invitation', subject: 'Activate Your Employee Account – Stitch Labs', email: 'sarah.jenkins@stitchlabs.com' },
    { eventType: 'leave-approved', subject: 'Leave Request Approved – Stitch Labs', email: 'sarah.jenkins@stitchlabs.com' }
  ];

  for (const logInfo of emailLogsData) {
    await prisma.emailLog.create({
      data: {
        companyId: company.id,
        userId: adminUser.id,
        email: logInfo.email,
        eventType: logInfo.eventType,
        subject: logInfo.subject,
        status: 'sent',
        provider: 'console',
        sentAt: new Date()
      }
    });
  }
  console.log(`✉ Seeded ${emailLogsData.length} sent email log items.`);

  // 12. Seed Performance Reviews
  await prisma.performanceReview.create({
    data: {
      employeeId: employees[0].id,
      reviewerId: adminUser.id,
      rating: 5,
      feedback: 'Outstanding technical lead. Exceeds expectations in all core full stack projects.',
      reviewCycle: 'Q1_2026'
    }
  });
  console.log(`🏆 Seeded 1 performance review.`);

  // 13. Seed Activities
  const activitiesData = [
    { action: `Onboarded new employee & sent invitation: Sarah Jenkins (Senior Full-Stack Engineer)` },
    { action: `Created Job Posting: Staff Product Designer` },
    { action: `New application submitted by candidate: Amanda Ross for "Senior Full-Stack Engineer"` },
    { action: `Scheduled an interview for candidate Amanda Ross` }
  ];

  for (const act of activitiesData) {
    await prisma.activity.create({
      data: {
        companyId: company.id,
        userId: adminUser.id,
        action: act.action
      }
    });
  }
  console.log(`📋 Seeded ${activitiesData.length} audit activity logs.`);

  console.log('\n===================================================');
  console.log('🎉 DATABASE DEVELOPMENT SEEDING COMPLETED SUCCESSFULLY');
  console.log('👉 Admin User:     abdullah@gmail.com');
  console.log('👉 Password:       Admin123!');
  console.log('👉 Employee User:  sarah.jenkins@stitchlabs.com');
  console.log('👉 Password:       Employee123!');
  console.log('===================================================\n');
}

seed()
  .catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
