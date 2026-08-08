const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { getGmailAuthUrl, getTokensFromCode, sendInvoiceEmail } = require('../services/gmailService');
const { generateInvoicePDF } = require('../services/pdfService');
const { google } = require('googleapis');

// GET /api/email/gmail/connect  — redirect user to Google OAuth
const connectGmail = (req, res) => {
  const url = getGmailAuthUrl();
  res.json({ success: true, url });
};

// GET /api/auth/gmail/callback  — Google redirects here with ?code=
const gmailCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect(`${process.env.CLIENT_URL}/email?error=no_code`);

    const tokens = await getTokensFromCode(code);

    // Get user's Gmail address from Google
    const oAuth2Client = new (require('googleapis').google.auth.OAuth2)(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    oAuth2Client.setCredentials(tokens);
    const oauth2 = require('googleapis').google.oauth2({ version: 'v2', auth: oAuth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    // We need to find the user by some mechanism.
    // Since this is a redirect, we use a state param or session.
    // Simple approach: store in session via a temp token in URL.
    // Better: redirect with token info encoded securely.
    // For now we store state in the URL:
    // The frontend will send the user's JWT, but OAuth redirects don't carry auth headers.
    // Solution: Use a short-lived state query param that identifies the user.
    // We'll use a simpler approach — store tokens temporarily and have frontend poll or use a code.

    // Encode token info + gmail email in a safe redirect param:
    const tokenData = Buffer.from(JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      gmailEmail: googleUser.email,
    })).toString('base64');

    res.redirect(`${process.env.CLIENT_URL}/email?gmailConnected=true&tokenData=${tokenData}`);
  } catch (err) {
    console.error('Gmail callback error:', err);
    res.redirect(`${process.env.CLIENT_URL}/email?error=auth_failed`);
  }
};

// POST /api/email/gmail/save-tokens — frontend sends back user JWT + token data
const saveGmailTokens = async (req, res) => {
  try {
    const { accessToken, refreshToken, gmailEmail } = req.body;
    const user = await User.findById(req.user._id);
    user.gmailAccessToken = accessToken;
    user.gmailRefreshToken = refreshToken;
    user.gmailEmail = gmailEmail;
    user.gmailConnected = true;
    await user.save();
    res.json({ success: true, message: 'Gmail connected successfully!', gmailEmail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/email/gmail/disconnect — disconnect Gmail
const disconnectGmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.gmailAccessToken = null;
    user.gmailRefreshToken = null;
    user.gmailConnected = false;
    user.gmailEmail = null;
    await user.save();
    res.json({ success: true, message: 'Gmail disconnected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/email/send/:invoiceId — send invoice email to client
const sendInvoice = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+gmailAccessToken +gmailRefreshToken');
    if (!user.gmailConnected) {
      return res.status(400).json({ success: false, message: 'Gmail not connected! Go to Email Campaigns to connect your Gmail first.' });
    }

    const invoice = await Invoice.findOne({ _id: req.params.invoiceId, userId: req.user._id }).populate('clientId');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    if (invoice.clientId) {
      invoice.clientSnapshot = {
        name: invoice.clientId.name,
        email: invoice.clientId.email,
        phone: invoice.clientId.phone,
        address: invoice.clientId.address,
        GSTIN: invoice.clientId.GSTIN
      };
    }

    const clientEmail = invoice.clientSnapshot?.email;
    if (!clientEmail) return res.status(400).json({ success: false, message: 'Client email is missing on this invoice.' });

      // Generate PDF and send email synchronously to catch errors
      let pdfBuffer = null;
      if (req.body && req.body.pdfBase64) {
        const base64Data = req.body.pdfBase64.replace(/^data:application\/pdf;base64,/, "");
        pdfBuffer = Buffer.from(base64Data, 'base64');
      } else {
        try {
          pdfBuffer = await generateInvoicePDF(invoice, user);
        } catch (pdfErr) {
          console.error('Failed to generate PDF, sending email without attachment:', pdfErr);
        }
      }

      await sendInvoiceEmail({
        accessToken: user.gmailAccessToken,
        refreshToken: user.gmailRefreshToken,
        fromEmail: user.gmailEmail || user.email,
        toEmail: clientEmail,
        toName: invoice.clientSnapshot?.name,
        invoiceNumber: invoice.invoiceNumber,
        pdfBuffer,
        total: invoice.total,
        currency: invoice.currency,
        dueDate: invoice.dueDate,
        businessName: user.businessName,
        brandColor: user.brandColor,
      });

      // Update invoice status to 'sent' if it's a draft
      if (invoice.status === 'draft') {
        invoice.status = 'sent';
        await invoice.save();
      }

      // Respond with success after sending completes
      res.json({ success: true, message: `Invoice ${invoice.invoiceNumber} sent successfully to ${clientEmail}!` });

  } catch (err) {
    console.error('Send invoice error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to send email' });
  }
};

// GET /api/email/status — check if user has Gmail connected
const getEmailStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      gmailConnected: user.gmailConnected || false,
      gmailEmail: user.gmailEmail || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { connectGmail, gmailCallback, saveGmailTokens, disconnectGmail, sendInvoice, getEmailStatus };
