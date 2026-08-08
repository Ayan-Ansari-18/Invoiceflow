const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { sendInvoiceEmail } = require('../services/emailService');
const { generateInvoicePDF } = require('../services/pdfService');

// POST /api/email/send/:invoiceId — send invoice email to client via Resend
const sendInvoice = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
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

    // Generate PDF and send email
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
      fromEmail: user.email,
      toEmail: clientEmail,
      toName: invoice.clientSnapshot?.name,
      invoiceNumber: invoice.invoiceNumber,
      pdfBuffer,
      total: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      businessName: user.businessName,
      brandColor: user.brandColor,
      replyToEmail: user.email
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

module.exports = { sendInvoice };
