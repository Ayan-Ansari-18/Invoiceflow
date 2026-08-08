const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const currencySymbol = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

const sendInvoiceEmail = async ({ fromEmail, toEmail, toName, invoiceNumber, pdfBuffer, total, currency, dueDate, businessName, brandColor, replyToEmail }) => {
  const sym = currencySymbol[currency] || '₹';
  const formattedTotal = `${sym}${Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedDue = dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const bgHex = brandColor || '#6366f1';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:${bgHex};padding:40px 48px;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Invoice Received</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">From ${businessName || fromEmail}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:48px;">
              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:24px;">
                Hi <strong>${toName || 'there'}</strong>,<br><br>
                Please find your invoice <strong>${invoiceNumber}</strong> attached to this email. Here's a quick summary:
              </p>
              
              <!-- Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;border:1px solid #f3f4f6;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:16px;">
                          <span style="color:#9ca3af;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Invoice Number</span><br>
                          <span style="color:#1f2937;font-size:16px;font-weight:600;">${invoiceNumber}</span>
                        </td>
                        <td style="padding-bottom:16px;" align="right">
                          <span style="color:#9ca3af;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Due Date</span><br>
                          <span style="color:#1f2937;font-size:16px;font-weight:600;">${formattedDue}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top:16px;border-top:1px solid #e5e7eb;">
                          <span style="color:#9ca3af;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Amount Due</span><br>
                          <span style="color:${bgHex};font-size:28px;font-weight:800;letter-spacing:-0.5px;">${formattedTotal}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;color:#4b5563;font-size:15px;line-height:24px;">
                Please review the attached PDF for full details. Thank you for your business!
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 48px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
                Sent securely via <strong style="color:${bgHex};">InvoiceFlow</strong> • Professional Invoice Management
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
    from: `InvoiceFlow <onboarding@resend.dev>`, // Resend requires this for unverified domains
    to: toEmail, // Send purely to email to prevent format errors
    replyTo: replyToEmail || fromEmail, // Replies go to the freelancer
    subject: `Invoice ${invoiceNumber} from ${businessName || fromEmail} — ${formattedTotal} due ${formattedDue}`,
    html: htmlBody,
    attachments: []
  };

  if (pdfBuffer) {
    mailOptions.attachments.push({
      filename: `${invoiceNumber}.pdf`,
      content: pdfBuffer,
    });
  }

  const { data, error } = await resend.emails.send(mailOptions);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = { sendInvoiceEmail };
