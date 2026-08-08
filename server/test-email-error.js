
const mongoose = require('mongoose');
require('dotenv').config();
const { sendInvoiceEmail } = require('./services/gmailService');
const { generateInvoicePDF } = require('./services/pdfService');
const User = require('./models/User');
const Invoice = require('./models/Invoice');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ gmailConnected: true }).select('+gmailAccessToken +gmailRefreshToken');
  if (!user) return console.log('No connected user');
  
  const invoice = await Invoice.findOne({ userId: user._id }).populate('clientId');
  if (!invoice) return console.log('No invoice');
  
  invoice.clientSnapshot = { name: 'Test', email: 'ayanansari.sit.comp@gmail.com' };
  
  try {
    console.log('Generating PDF...');
    const pdfBuffer = await generateInvoicePDF(invoice, user);
    console.log('PDF Generated. Sending email...');
    
    await sendInvoiceEmail({
      accessToken: user.gmailAccessToken,
      refreshToken: user.gmailRefreshToken,
      fromEmail: user.gmailEmail || user.email,
      toEmail: invoice.clientSnapshot.email,
      toName: invoice.clientSnapshot.name,
      invoiceNumber: invoice.invoiceNumber,
      pdfBuffer,
      total: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      businessName: user.businessName,
    });
    console.log('Email sent successfully!');
  } catch (err) {
    console.error('Error occurred:', err);
  }
  process.exit(0);
}
test();
