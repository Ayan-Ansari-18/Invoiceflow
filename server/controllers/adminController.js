const User = require('../models/User');
const Invoice = require('../models/Invoice');
const jwt = require('jsonwebtoken');

// POST /api/admin/login
const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const adminToken = jwt.sign({ role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return res.json({ success: true, adminToken });
    }
    
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ plan: { $in: ['pro', 'business'] } });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalInvoices = await Invoice.countDocuments();
    
    res.json({
      success: true,
      stats: { totalUsers, proUsers, bannedUsers, totalInvoices }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/ban
const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isAdmin) return res.status(400).json({ success: false, message: 'Cannot ban an admin' });

    user.isBanned = !user.isBanned;
    await user.save();
    
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/plan
const updateUserPlan = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['free', 'pro', 'business'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.plan = plan;
    await user.save();
    
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isAdmin) return res.status(400).json({ success: false, message: 'Cannot delete an admin' });

    // Optional: delete their invoices/clients too
    await Invoice.deleteMany({ user: user._id });
    
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginAdmin,
  getStats,
  getUsers,
  toggleBanUser,
  updateUserPlan,
  deleteUser
};
