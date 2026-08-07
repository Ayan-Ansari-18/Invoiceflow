const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const emailValidator = require('deep-email-validator');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate email authenticity (prevent disposable/fake emails)
    const { valid, reason, validators } = await emailValidator.validate({
      email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false // Disabled because it is flaky in many environments
    });
    
    if (!valid) {
      let message = 'Please use a valid, non-disposable email address.';
      if (reason === 'disposable') message = 'Disposable emails are not allowed. Please use a real email.';
      if (reason === 'mx') message = 'This email domain does not exist or cannot receive emails.';
      return res.status(400).json({ success: false, message });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, passwordHash: password });
    const token = signToken(user._id);

    res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned. Please contact support.' });
    }

    const token = signToken(user._id);
    // Remove passwordHash from response
    user.passwordHash = undefined;

    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'businessName', 'businessAddress', 'businessPhone', 'GSTIN', 'brandColor', 'invoicePrefix', 'logo', 'signature'];
    const updates = {};
    console.log('RECEIVED IN PUT /profile:', { brandColor: req.body.brandColor, logoLength: req.body.logo ? req.body.logo.length : 'undefined/null', signatureLength: req.body.signature ? req.body.signature.length : 'undefined/null' });
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
// POST /api/auth/upgrade
const upgradePlan = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { plan: 'pro' }, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/google
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential missing' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    client.setCredentials({ access_token: credential });
    
    const userInfo = await client.request({ url: 'https://www.googleapis.com/oauth2/v3/userinfo' });
    const { sub: googleId, email, name, picture } = userInfo.data;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        logo: picture, // We can optionally use their Google profile pic as a logo initially
      });
    } else {
      // If user exists but doesn't have googleId linked, we link it
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save();
      }
    }

    const token = signToken(user._id);
    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile, upgradePlan, googleAuth };
