const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const PRO_PLAN_PRICE = 299; // Price in INR
const CURRENCY = 'INR';

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Razorpay keys not configured on server' });
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: PRO_PLAN_PRICE * 100, // Amount in paise
      currency: CURRENCY,
      receipt: `receipt_pro_${req.user._id}`,
    };

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const { RAZORPAY_KEY_SECRET } = process.env;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update user plan
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.plan = 'pro';
    await user.save();

    // Re-fetch user object to return without sensitive info
    const updatedUser = await User.findById(req.user._id).select('-passwordHash -gmailAccessToken -gmailRefreshToken');

    res.status(200).json({ 
      success: true, 
      message: 'Payment successful! Upgraded to Pro.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
  }
};
