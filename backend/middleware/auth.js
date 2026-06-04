const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  console.log('=== auth middleware hit! ===');
  console.log('req.method:', req.method);
  console.log('req.url:', req.url);
  console.log('req.headers:', req.headers);
  
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('token from header:', token);
    
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    console.log('decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { auth, authorizeRoles };
