const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');

exports.createAutomation = async (req, res) => {
  try {
    const { trigger, action } = req.body;
    const { companyId, id: userId } = req.user;

    if (!trigger || !action) {
      return res.status(400).json({ error: 'Both trigger event and action handler are required.' });
    }

    const automation = await prisma.automation.create({
      data: {
        companyId,
        trigger,
        action,
        active: true
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'CREATE_AUTOMATION',
      entity: `Automation Rule: ${trigger} -> ${action}`
    });

    res.status(201).json({ message: 'Workflow automation rule configured.', automation });
  } catch (error) {
    console.error('Create Automation Error:', error);
    res.status(500).json({ error: 'Failed to configure workflow automation rule.' });
  }
};

exports.getAutomations = async (req, res) => {
  try {
    const { companyId } = req.user;
    const automations = await prisma.automation.findMany({
      where: { companyId },
      orderBy: { trigger: 'asc' }
    });
    res.status(200).json(automations);
  } catch (error) {
    console.error('Get Automations Error:', error);
    res.status(500).json({ error: 'Failed to retrieve automations.' });
  }
};

exports.toggleAutomation = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const { companyId, id: userId } = req.user;

    const rule = await prisma.automation.findUnique({ where: { id } });
    if (!rule || rule.companyId !== companyId) {
      return res.status(404).json({ error: 'Automation rule not found.' });
    }

    const updated = await prisma.automation.update({
      where: { id },
      data: { active: !!active }
    });

    await logAction({
      companyId,
      userId,
      action: 'TOGGLE_AUTOMATION',
      entity: `Rule: ${rule.trigger}`,
      details: { active: !!active }
    });

    res.status(200).json({ message: 'Automation state updated successfully.', automation: updated });
  } catch (error) {
    console.error('Toggle Automation Error:', error);
    res.status(500).json({ error: 'Failed to update automation state.' });
  }
};

exports.deleteAutomation = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;

    const rule = await prisma.automation.findUnique({ where: { id } });
    if (!rule || rule.companyId !== companyId) {
      return res.status(404).json({ error: 'Automation rule not found.' });
    }

    await prisma.automation.delete({ where: { id } });

    await logAction({
      companyId,
      userId,
      action: 'DELETE_AUTOMATION',
      entity: `Rule: ${rule.trigger} -> ${rule.action}`
    });

    res.status(200).json({ message: 'Automation rule removed successfully.' });
  } catch (error) {
    console.error('Delete Automation Error:', error);
    res.status(500).json({ error: 'Failed to delete automation rule.' });
  }
};
