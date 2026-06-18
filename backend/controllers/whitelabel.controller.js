const fs = require('fs');
const path = require('path');
const { logAction } = require('../services/audit.service');

const getBrandingPath = (companyId) => {
  const dir = path.join(__dirname, '..', 'uploads', 'branding');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, `${companyId}.json`);
};

exports.getBranding = async (req, res) => {
  try {
    const { companyId } = req.user;
    const file = getBrandingPath(companyId);

    if (!fs.existsSync(file)) {
      return res.status(200).json({
        customDomain: '',
        primaryColor: '#6366F1', // default indigo
        secondaryColor: '#4f46e5',
        logoUrl: '',
        emailBranding: 'HireFlow AI Recruiter'
      });
    }

    const raw = fs.readFileSync(file, 'utf-8');
    res.status(200).json(JSON.parse(raw));
  } catch (error) {
    console.error('Get Branding Error:', error);
    res.status(500).json({ error: 'Failed to retrieve branding settings.' });
  }
};

exports.updateBranding = async (req, res) => {
  try {
    const { customDomain, primaryColor, secondaryColor, logoUrl, emailBranding } = req.body;
    const { companyId, id: userId } = req.user;

    const config = {
      customDomain: customDomain || '',
      primaryColor: primaryColor || '#6366F1',
      secondaryColor: secondaryColor || '#4f46e5',
      logoUrl: logoUrl || '',
      emailBranding: emailBranding || 'HireFlow AI Recruiter'
    };

    const file = getBrandingPath(companyId);
    fs.writeFileSync(file, JSON.stringify(config, null, 2), 'utf-8');

    await logAction({
      companyId,
      userId,
      action: 'UPDATE_WHITELABEL_BRANDING',
      entity: `Domain: ${customDomain || 'custom'}`
    });

    res.status(200).json({ message: 'Branding settings updated successfully.', branding: config });
  } catch (error) {
    console.error('Update Branding Error:', error);
    res.status(500).json({ error: 'Failed to update branding settings.' });
  }
};
