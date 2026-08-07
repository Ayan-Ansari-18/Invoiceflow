const jwt = require('jsonwebtoken');

const requireAdmin = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized — no admin token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Access denied: Super Admin only' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid admin token' });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAdmin };
