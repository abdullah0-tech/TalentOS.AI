const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    
    // Attach tenant and user info to request object
    req.user = {
      id: decoded.id,
      companyId: decoded.companyId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
    
    // DEMO MODE RESTRICTION
    if (req.user.email === 'demo@talentos.ai') {
      const allowedMethods = ['GET'];
      const whitelistedRoutes = [
        { path: '/api/auth/login', method: 'POST' },
        { path: '/api/feedback', method: 'POST' },
        { path: '/api/ai/chat', method: 'POST' },
        { path: '/api/jobs/generate', method: 'POST' } // Allow AI generators
      ];

      const isWhitelisted = whitelistedRoutes.some(
        route => req.originalUrl.startsWith(route.path) && req.method === route.method
      );

      if (!allowedMethods.includes(req.method) && !isWhitelisted) {
        return res.status(403).json({
          error: 'Demo Mode: This action is disabled to prevent data modification.',
          isDemoRestriction: true
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('JWT Auth Error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
