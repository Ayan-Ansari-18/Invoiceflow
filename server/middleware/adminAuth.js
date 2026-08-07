const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied: Super Admin only' });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAdmin };
