const prisma = require('../config/db');
const { logAction } = require('./audit.service');

/**
 * Dispatches an event to the automation rules engine.
 * @param {string} trigger - Trigger type (e.g. 'candidate_hired', 'leave_requested')
 * @param {Object} context - Data payload for the trigger
 */
const triggerEvent = async (trigger, context) => {
  try {
    const { companyId, userId } = context;
    if (!companyId) return;

    // Fetch active automations for the trigger
    const rules = await prisma.automation.findMany({
      where: {
        companyId,
        trigger,
        active: true
      }
    });

    console.log(`🤖 Automation Dispatcher: Triggered '${trigger}' for company ${companyId}. Found ${rules.length} rules.`);

    for (const rule of rules) {
      await executeRule(rule, context);
    }
  } catch (error) {
    console.error('Automation Engine Error:', error);
  }
};

/**
 * Executes a single automation rule.
 */
const executeRule = async (rule, context) => {
  const { action } = rule;
  const { companyId, userId } = context;

  console.log(`⚡ Executing Automation action '${action}' for company ${companyId}`);

  try {
    if (action === 'create_employee_and_setup_onboarding') {
      const { candidateId, name, email, department, position } = context;
      if (!name || !email) return;

      // 1. Create Employee (or fetch if exists)
      let employee = await prisma.employee.findUnique({ where: { email } });
      if (!employee) {
        employee = await prisma.employee.create({
          data: {
            companyId,
            name,
            email,
            department: department || 'Engineering',
            position: position || 'Developer',
            status: 'active'
          }
        });
      }

      // 2. Assign Onboarding Tasks
      const defaultTasks = [
        { title: 'Sign Employment Agreement & Offer Letter', offsetDays: 3 },
        { title: 'Upload ID & Tax Documents (W4/I9)', offsetDays: 5 },
        { title: 'Review Employee Handbook and Benefits Guide', offsetDays: 7 },
        { title: 'Complete LMS Compliance & Security Course', offsetDays: 14 },
        { title: 'Set Up 1-on-1 with Team Lead & Manager', offsetDays: 2 }
      ];

      for (const task of defaultTasks) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + task.offsetDays);

        await prisma.onboardingTask.create({
          data: {
            employeeId: employee.id,
            title: task.title,
            status: 'pending',
            dueDate
          }
        });
      }

      // 3. Generate Welcome Document entry
      await prisma.document.create({
        data: {
          companyId,
          title: `Welcome Package - ${name}.pdf`,
          fileUrl: `/uploads/templates/welcome_package.pdf`,
          type: 'offer_letter'
        }
      });

      // 4. Send notification to company activity feed and notifications
      await prisma.notification.create({
        data: {
          companyId,
          title: 'New Hire Onboarding Initialized',
          message: `Onboarding checklist and documents configured for ${name} (${position}).`,
          type: 'success'
        }
      });

      // Log audit
      await logAction({
        companyId,
        userId: userId || 'system',
        action: 'AUTOMATION_RUN',
        entity: `Rule: ${rule.id}`,
        details: { action, triggeredBy: 'candidate_hired', employeeName: name }
      });
    }

    if (action === 'notify_manager_on_leave') {
      const { employeeName, leaveType, startDate, endDate } = context;

      await prisma.notification.create({
        data: {
          companyId,
          title: 'Leave Request Received',
          message: `${employeeName} requested ${leaveType} leave from ${startDate} to ${endDate}. Approval required.`,
          type: 'info'
        }
      });

      await logAction({
        companyId,
        userId: userId || 'system',
        action: 'AUTOMATION_RUN',
        entity: `Rule: ${rule.id}`,
        details: { action, triggeredBy: 'leave_requested', employeeName }
      });
    }
  } catch (error) {
    console.error(`Failed to execute automation action '${action}':`, error.message);
  }
};

module.exports = {
  triggerEvent
};
