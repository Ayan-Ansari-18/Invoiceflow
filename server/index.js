require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const clientRoutes = require('./routes/clients');
const emailRoutes = require('./routes/email');
const adminRoutes = require('./routes/admin');
const { gmailCallback } = require('./controllers/emailController');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP off for PDF endpoint
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting — stricter on auth routes
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts' });

app.use(globalLimiter);
app.use('/api/auth', authLimiter);

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Data Sanitization against NoSQL query injection ──────────────────────────
app.use(mongoSanitize());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/admin', adminRoutes);
// Gmail OAuth callback (no auth middleware — Google redirects here)
app.get('/api/auth/gmail/callback', gmailCallback);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database + Server ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
