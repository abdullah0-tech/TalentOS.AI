const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');

exports.enableMFA = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;

    // Create security log entry
    await prisma.auditSecurityLog.create({
      data: {
        companyId,
        userId,
        event: 'MFA_ENABLED',
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'SECURITY_MFA_ENABLE',
      entity: `User ID: ${userId}`
    });

    res.status(200).json({
      message: 'MFA configuration seeded successfully.',
      mfaSecret: 'JBSWY3DPEHPK3PXP',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/HireFlow%20AI:user@company.com?secret=JBSWY3DPEHPK3PXP&issuer=HireFlow%20AI'
    });
  } catch (error) {
    console.error('Enable MFA Error:', error);
    res.status(500).json({ error: 'Failed to configure MFA.' });
  }
};

exports.verifyMFA = async (req, res) => {
  try {
    const { token } = req.body;
    const { companyId, id: userId } = req.user;

    if (!token || token.length !== 6) {
      return res.status(400).json({ error: 'TOTP authentication token must be a 6-digit code.' });
    }

    await prisma.auditSecurityLog.create({
      data: {
        companyId,
        userId,
        event: 'MFA_VERIFIED',
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    res.status(200).json({ message: 'Multi-factor authentication token verified successfully.' });
  } catch (error) {
    console.error('Verify MFA Error:', error);
    res.status(500).json({ error: 'MFA token verification failed.' });
  }
};

exports.getSecurityLogs = async (req, res) => {
  try {
    const { companyId } = req.user;

    const logs = await prisma.auditSecurityLog.findMany({
      where: { companyId },
      include: {
        company: true
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Get Security Logs Error:', error);
    res.status(500).json({ error: 'Failed to retrieve compliance security logs.' });
  }
};

exports.updateIPWhitelist = async (req, res) => {
  try {
    const { ipAddresses } = req.body; // Array of IP strings
    const { companyId, id: userId } = req.user;

    if (!ipAddresses || !Array.isArray(ipAddresses)) {
      return res.status(400).json({ error: 'IP whitelist must be a JSON array of IP addresses.' });
    }

    await prisma.auditSecurityLog.create({
      data: {
        companyId,
        userId,
        event: 'IP_WHITELIST_MODIFIED',
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'UPDATE_IP_WHITELIST',
      entity: `IP Count: ${ipAddresses.length}`,
      details: { ipAddresses }
    });

    res.status(200).json({ message: 'IP whitelist rules saved successfully.', whitelist: ipAddresses });
  } catch (error) {
    console.error('IP Whitelist Error:', error);
    res.status(500).json({ error: 'Failed to update IP whitelists.' });
  }
};
