const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  const { data, error } = await resend.emails.send({
    from: `${process.env.FROM_NAME || 'InvoiceFlow'} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    console.error('Resend API Error:', error);
    throw new Error('Email could not be sent');
  }

  console.log('Message sent via Resend: %s', data.id);
};

module.exports = sendEmail;
