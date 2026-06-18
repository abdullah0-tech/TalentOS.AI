const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');

const AVAILABLE_PROVIDERS = [
  { provider: 'slack', category: 'Communication', name: 'Slack integration', description: 'Post real-time hiring & leave alerts straight to channels.' },
  { provider: 'teams', category: 'Communication', name: 'Microsoft Teams', description: 'Sync channel notifications on workflow automation triggers.' },
  { provider: 'google_calendar', category: 'Calendar', name: 'Google Calendar', description: 'Schedule candidates interviews and auto-generate Meet rooms.' },
  { provider: 'outlook_calendar', category: 'Calendar', name: 'Outlook Calendar', description: 'Coordinate schedules using your corporate Outlook account.' },
  { provider: 'google_drive', category: 'Storage', name: 'Google Drive', description: 'Auto-upload signed onboarding contracts and tax sheets.' },
  { provider: 'onedrive', category: 'Storage', name: 'OneDrive', description: 'Store enterprise document attachments in your OneDrive directory.' },
  { provider: 'bamboohr', category: 'HR Systems', name: 'BambooHR Sync', description: 'Bi-directionally sync profiles between registries.' },
  { provider: 'workday', category: 'HR Systems', name: 'Workday Integrations', description: 'Sync payroll and employee records with Workday.' },
  { provider: 'linkedin', category: 'Recruitment', name: 'LinkedIn Jobs', description: 'Directly publish hired postings to the LinkedIn network.' }
];

exports.getIntegrations = async (req, res) => {
  try {
    const { companyId } = req.user;

    const connected = await prisma.integration.findMany({
      where: { companyId }
    });

    const statusMap = connected.reduce((acc, c) => {
      acc[c.provider] = { id: c.id, status: c.status, credentials: c.credentials };
      return acc;
    }, {});

    const integrations = AVAILABLE_PROVIDERS.map(p => ({
      ...p,
      connected: !!statusMap[p.provider],
      status: statusMap[p.provider]?.status || 'disconnected',
      integrationId: statusMap[p.provider]?.id || null
    }));

    res.status(200).json(integrations);
  } catch (error) {
    console.error('Get Integrations Error:', error);
    res.status(500).json({ error: 'Failed to retrieve integrations.' });
  }
};

exports.connectIntegration = async (req, res) => {
  try {
    const { provider, credentials } = req.body;
    const { companyId, id: userId } = req.user;

    const exists = AVAILABLE_PROVIDERS.some(p => p.provider === provider);
    if (!exists) {
      return res.status(400).json({ error: 'Unknown integration provider specified.' });
    }

    // Encrypt or store token mock-up
    const tokenString = credentials ? JSON.stringify(credentials) : `mock_oauth_${Date.now()}`;

    const integration = await prisma.integration.upsert({
      where: {
        id: (await prisma.integration.findFirst({ where: { companyId, provider } }))?.id || 'non-existent'
      },
      update: {
        status: 'connected',
        credentials: tokenString
      },
      create: {
        companyId,
        provider,
        status: 'connected',
        credentials: tokenString
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'CONNECT_INTEGRATION',
      entity: `Provider: ${provider}`
    });

    res.status(201).json({ message: `${provider} connected successfully.`, integration });
  } catch (error) {
    console.error('Connect Integration Error:', error);
    res.status(500).json({ error: 'Failed to establish integration connection.' });
  }
};

exports.disconnectIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;

    const integration = await prisma.integration.findUnique({ where: { id } });
    if (!integration || integration.companyId !== companyId) {
      return res.status(404).json({ error: 'Integration connection not found.' });
    }

    await prisma.integration.delete({ where: { id } });

    await logAction({
      companyId,
      userId,
      action: 'DISCONNECT_INTEGRATION',
      entity: `Provider: ${integration.provider}`
    });

    res.status(200).json({ message: 'Integration disconnected successfully.' });
  } catch (error) {
    console.error('Disconnect Integration Error:', error);
    res.status(500).json({ error: 'Failed to remove integration connection.' });
  }
};
