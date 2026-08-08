const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// ─── OAuth2 Client ─────────────────────────────────────────────────────────────
const createOAuth2Client = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

// ─── Generate Auth URL for user to connect Gmail ──────────────────────────────
const getGmailAuthUrl = () => {
  const oAuth2Client = createOAuth2Client();
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
};

// ─── Exchange code for tokens ─────────────────────────────────────────────────
const getTokensFromCode = async (code) => {
  const oAuth2Client = createOAuth2Client();
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
};

// ─── Send Invoice Email via user's Gmail ──────────────────────────────────────
const sendInvoiceEmail = async ({ accessToken, refreshToken, fromEmail, toEmail, toName, invoiceNumber, pdfBuffer, total, currency, dueDate, businessName }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: fromEmail,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: refreshToken,
    },
  });

  // Verify connection before sending
  await transporter.verify();


  const currencySymbol = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ' };
  const sym = currencySymbol[currency] || '₹';
  const formattedTotal = `${sym}${Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedDue = dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px 48px;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Invoice Received</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">From ${businessName || fromEmail}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
                Dear <strong>${toName || 'Valued Client'}</strong>,
              </p>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                Please find your invoice attached to this email. Here's a quick summary:
              </p>

              <!-- Invoice Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:32px;">
                <tr>
                  <td style="padding:8px 0;">
                    <span style="color:#9ca3af;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Invoice Number</span><br>
                    <span style="color:#111827;font-size:18px;font-weight:700;">${invoiceNumber}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-top:1px solid #e5e7eb;">
                    <span style="color:#9ca3af;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Amount Due</span><br>
                    <span style="color:#6366f1;font-size:24px;font-weight:700;">${formattedTotal}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-top:1px solid #e5e7eb;">
                    <span style="color:#9ca3af;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Due Date</span><br>
                    <span style="color:#111827;font-size:16px;font-weight:600;">${formattedDue}</span>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;color:#6b7280;font-size:14px;line-height:1.6;">
                The full invoice PDF is attached to this email. Please review it and make the payment by the due date.
              </p>

              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                If you have any questions, please reply to this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 48px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
                Sent via <strong style="color:#6366f1;">InvoiceFlow</strong> • Professional Invoice Management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const mailOptions = {
    from: `"${businessName || fromEmail}" <${fromEmail}>`,
    to: `${toName ? `"${toName}" ` : ''}<${toEmail}>`,
    subject: `Invoice ${invoiceNumber} from ${businessName || fromEmail} — ${formattedTotal} due ${formattedDue}`,
    html: htmlBody,
  };

  if (pdfBuffer) {
    mailOptions.attachments = [
      {
        filename: `${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ];
  }

  await transporter.sendMail(mailOptions);
};

module.exports = { getGmailAuthUrl, getTokensFromCode, sendInvoiceEmail };
