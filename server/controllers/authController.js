const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const emailValidator = require('deep-email-validator');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

// POST /api/auth/forgotpassword
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expire to 10 minutes
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'https://getinvoiceflow.online'}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Password Reset Request</h2>
        <p style="color: #334155; font-size: 16px; line-height: 1.5;">You are receiving this email because you (or someone else) has requested the reset of a password. Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">If you did not request this, please ignore this email and your password will remain unchanged. This link is valid for 10 minutes.</p>
      </div>
    `;

    try {
      if (process.env.RESEND_API_KEY) {
        await sendEmail({
          email: user.email,
          subject: 'InvoiceFlow Password Reset Token',
          html: message,
        });
        res.status(200).json({ success: true, message: 'Password reset email sent to your inbox!' });
      } else {
        // Fallback for when Resend is not configured yet
        console.log(`\n\n=== PASSWORD RESET LINK (Fallback) ===\nUser: ${user.email}\nLink: ${resetUrl}\n===========================\n\n`);
        res.status(200).json({ success: true, message: 'Password reset link generated in logs. Resend API Key not configured.' });
      }
    } catch (err) {
      console.error('Error sending email:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }

  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/resetpassword/:resettoken
const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    user.passwordHash = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    const token = signToken(user._id);

    res.status(200).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile, upgradePlan, googleAuth, forgotPassword, resetPassword };
