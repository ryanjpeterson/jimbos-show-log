const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user payload to request
    next();
  } catch (err) {
    // This catches expired tokens or invalid signatures
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;