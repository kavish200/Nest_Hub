const { verifyAuthToken } = require('../utils/auth');

const AUTH_SECRET = process.env.AUTH_SECRET || 'nesthub-dev-secret-change-me';

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  const payload = verifyAuthToken(token, AUTH_SECRET);

  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = payload;
  return next();
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        message: `Access denied. Allowed role(s): ${allowedRoles.join(', ')}`
      });
    }
    return next();
  };
};

module.exports = {
  requireAuth,
  requireRole
};
