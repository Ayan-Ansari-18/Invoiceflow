const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const currencySymbol = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED' };

const formatCurrency = (amount, currency = 'INR') =>
  `${currencySymbol[currency] || ''}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const buildInvoiceHTML = (invoice, user) => {
  const sym = currencySymbol[invoice.currency] || '₹';

  const lineItemsHTML = invoice.lineItems
    .map(
      (item, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="item-desc">${item.description}</td>
      <td class="item-center">${item.qty}</td>
      <td class="item-right">${formatCurrency(item.rate, invoice.currency)}</td>
      <td class="item-right item-amount">${formatCurrency(item.amount, invoice.currency)}</td>
    </tr>`
    )
    .join('');

  const clientInfo = invoice.clientSnapshot || (invoice.clientId ? invoice.clientId : {});

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #1a1a2e;
      background: #fff;
      padding: 0;
    }
    .invoice-wrapper {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      background: #fff;
      display: flex;
      flex-direction: column;
    }
    /* ── Header ── */
    .header {
      background: ${user.brandColor || '#6366f1'};
      padding: 36px 48px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      color: #fff;
    }
    .header-left {}
    .logo-text {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-subtitle { font-size: 12px; opacity: 0.85; line-height: 1.5; }
    .header-right { text-align: right; }
    .invoice-label {
      font-size: 13px;
      font-weight: 500;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }
    .invoice-number { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    /* ── Body ── */
    .body { padding: 40px 48px; flex: 1; }
    /* ── Meta Row ── */
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 36px;
      gap: 20px;
    }
    .meta-block { flex: 1; }
    .meta-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #6b7280;
      margin-bottom: 6px;
    }
    .meta-value { font-size: 13px; color: #1a1a2e; font-weight: 500; }
    .meta-value.due-date { color: #dc2626; font-weight: 700; }
    /* ── Bill To ── */
    .bill-section {
      display: flex;
      gap: 40px;
      margin-bottom: 36px;
    }
    .bill-block { flex: 1; }
    .section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #6b7280;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e5e7eb;
    }
    .bill-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .bill-detail { font-size: 12px; color: #6b7280; line-height: 1.6; }
    .gstin-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 2px 8px;
      background: #eff6ff;
      color: #1d4ed8;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    /* ── Table ── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .items-table thead tr {
      background: ${user.brandColor || '#6366f1'};
      color: #fff;
    }
    .items-table thead th {
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .items-table thead th:last-child { text-align: right; }
    .items-table thead th:nth-child(2),
    .items-table thead th:nth-child(3) { text-align: center; }
    .item-desc { padding: 12px 16px; }
    .item-center { padding: 12px 16px; text-align: center; }
    .item-right { padding: 12px 16px; text-align: right; }
    .item-amount { font-weight: 600; }
    .row-even { background: #f9fafb; }
    .row-odd { background: #fff; }
    .items-table tbody tr td { border-bottom: 1px solid #f3f4f6; }
    /* ── Totals ── */
    .totals-section { display: flex; justify-content: flex-end; margin-bottom: 36px; }
    .totals-box { min-width: 280px; }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: 13px;
    }
    .totals-row.gst { color: #6b7280; }
    .totals-row.total-final {
      font-size: 16px;
      font-weight: 800;
      color: ${user.brandColor || '#6366f1'};
      border-bottom: none;
      padding-top: 12px;
    }
    .totals-label { color: #6b7280; }
    .totals-value { font-weight: 600; text-align: right; }
    /* ── Notes ── */
    .notes-section { margin-bottom: 36px; }
    .notes-content {
      background: #f9fafb;
      border-left: 3px solid ${user.brandColor || '#6366f1'};
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 12px;
      color: #4b5563;
      line-height: 1.6;
    }
    /* ── Footer ── */
    .footer {
      border-top: 1px solid #e5e7eb;
      padding: 20px 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f9fafb;
    }
    .footer-left { font-size: 11px; color: #9ca3af; }
    .footer-right { font-size: 11px; color: #9ca3af; text-align: right; }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-draft { background: #f3f4f6; color: #6b7280; }
    .status-sent { background: #eff6ff; color: #1d4ed8; }
    .status-viewed { background: #faf5ff; color: #a855f7; }
    .status-paid { background: #f0fdf4; color: #15803d; }
    .status-overdue { background: #fef2f2; color: #dc2626; }
    ${invoice.paymentLink ? `.payment-link-section {
      margin-bottom: 24px;
      padding: 14px 18px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      font-size: 12px;
      color: #15803d;
    }
    .payment-link-section a { color: #15803d; font-weight: 600; }` : ''}
  </style>
</head>
<body>
<div class="invoice-wrapper">
  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="logo-text">
        ${user.logo ? `<img src="${user.logo}" style="width: 40px; height: 40px; object-fit: contain; background: white; padding: 4px; border-radius: 6px;" />` : ''}
        ${user.businessName || user.name}
      </div>
      <div class="header-subtitle">
        ${user.businessAddress ? user.businessAddress.replace(/\n/g, '<br>') : ''}
        ${user.GSTIN ? `<br>GSTIN: ${user.GSTIN}` : ''}
      </div>
    </div>
    <div class="header-right">
      <div class="invoice-label">Invoice</div>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
      <span class="status-badge status-${invoice.status}">${invoice.status}</span>
    </div>
  </div>

  <!-- Body -->
  <div class="body">
    <!-- Meta: dates -->
    <div class="meta-row">
      <div class="meta-block">
        <div class="meta-label">Issue Date</div>
        <div class="meta-value">${formatDate(invoice.issueDate || invoice.createdAt)}</div>
      </div>
      <div class="meta-block">
        <div class="meta-label">Due Date</div>
        <div class="meta-value due-date">${formatDate(invoice.dueDate)}</div>
      </div>
      <div class="meta-block">
        <div class="meta-label">Currency</div>
        <div class="meta-value">${invoice.currency}</div>
      </div>
    </div>

    <!-- Bill To / From -->
    <div class="bill-section">
      <div class="bill-block">
        <div class="section-label">Bill To</div>
        <div class="bill-name">${clientInfo.name || '—'}</div>
        <div class="bill-detail">
          ${clientInfo.email ? clientInfo.email + '<br>' : ''}
          ${clientInfo.phone ? clientInfo.phone + '<br>' : ''}
          ${clientInfo.address ? clientInfo.address.replace(/\n/g, '<br>') : ''}
        </div>
        ${clientInfo.GSTIN ? `<span class="gstin-badge">GSTIN: ${clientInfo.GSTIN}</span>` : ''}
      </div>
      <div class="bill-block">
        <div class="section-label">From</div>
        <div class="bill-name">${user.businessName || user.name}</div>
        <div class="bill-detail">
          ${user.email}<br>
          ${user.businessPhone ? user.businessPhone + '<br>' : ''}
        </div>
        ${user.GSTIN ? `<span class="gstin-badge">GSTIN: ${user.GSTIN}</span>` : ''}
      </div>
    </div>

    <!-- Line Items -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="text-align:left; width:50%">Description</th>
          <th style="width:12%">Qty</th>
          <th style="width:18%">Rate</th>
          <th style="width:20%; text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHTML}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-box">
        <div class="totals-row">
          <span class="totals-label">Subtotal</span>
          <span class="totals-value">${formatCurrency(invoice.subtotal, invoice.currency)}</span>
        </div>
        ${(invoice.additionalCharges || []).map(charge => {
          const chargeName = charge.type === 'Other (Custom)' ? (charge.name || charge.type) : charge.type;
          let chargeAmt = parseFloat(charge.amount) || 0;
          if (charge.mode === 'Percentage') {
            chargeAmt = (invoice.subtotal * chargeAmt) / 100;
          }
          if (!chargeName) return '';
          return `<div class="totals-row">
            <span class="totals-label">${chargeName}</span>
            <span class="totals-value">${formatCurrency(chargeAmt, invoice.currency)}</span>
          </div>`;
        }).join('')}
        ${invoice.discount ? (() => {
          let discountAmt = parseFloat(invoice.discount.amount) || 0;
          if (invoice.discount.mode === 'Percentage') {
            discountAmt = (invoice.subtotal * discountAmt) / 100;
          }
          if (discountAmt <= 0) return '';
          return `<div class="totals-row">
            <span class="totals-label">Discount</span>
            <span class="totals-value" style="color: #ef4444">-${formatCurrency(discountAmt, invoice.currency)}</span>
          </div>`;
        })() : ''}
        ${invoice.gstPercent > 0 ? `
        <div class="totals-row gst">
          <span class="totals-label">GST (${invoice.gstPercent}%)</span>
          <span class="totals-value">${formatCurrency(invoice.gstAmount, invoice.currency)}</span>
        </div>` : ''}
        <div class="totals-row total-final">
          <span>Total Due</span>
          <span>${formatCurrency(invoice.total, invoice.currency)}</span>
        </div>
      </div>
    </div>

    ${invoice.paymentLink ? `
    <div class="payment-link-section">
      💳 <strong>Pay Online:</strong> <a href="${invoice.paymentLink}">${invoice.paymentLink}</a>
    </div>` : ''}

    ${invoice.notes ? `
    <div class="notes-section">
      <div class="section-label">Notes</div>
      <div class="notes-content">${invoice.notes}</div>
    </div>` : ''}

    ${invoice.terms ? `
    <div class="notes-section">
      <div class="section-label">Terms & Conditions</div>
      <div class="notes-content">${invoice.terms}</div>
    </div>` : ''}

    ${user.signature ? `
    <div style="display: flex; justify-content: flex-end; margin-top: 40px; page-break-inside: avoid;">
      <div style="text-align: center; width: max-content;">
        <img src="${user.signature}" alt="Signature" style="max-height: 80px; object-fit: contain; margin-bottom: 8px;" />
        <div style="border-top: 1px solid #e5e7eb; padding-top: 4px; font-size: 11px; color: #6b7280; font-weight: 500;">
          Authorized Signature
        </div>
      </div>
    </div>
    ` : ''}
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">Thank you for your business!</div>
    <div class="footer-right">Generated with Invoice Generator · ${user.email}</div>
  </div>
</div>
</body>
</html>`;
};

const getBufferFromBase64 = (base64Str) => {
  if (!base64Str) return null;
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    if (base64Str.startsWith('http')) return null;
    return Buffer.from(base64Str, 'base64');
  }
  return Buffer.from(matches[2], 'base64');
};

const generateInvoicePDF = (invoice, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      const brandColor = user.brandColor || '#6366f1';
      
      // Header Background
      doc.rect(0, 0, 595.28, 100).fill(brandColor);

      // Logo rendering if available
      const isPro = user.plan === 'pro';
      const logoBuffer = isPro ? getBufferFromBase64(user.logo) : null;
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 50, 25, { fit: [50, 50] });
        } catch (logoErr) {
          console.error('Error adding logo to PDF:', logoErr);
        }
      }

      // Business Name
      doc.fillColor('#ffffff')
         .fontSize(20)
         .text(user.businessName || user.name || 'Your Business', logoBuffer ? 110 : 50, 30, { width: 300, lineBreak: false })
         .fontSize(9)
         .text(user.businessAddress || '', logoBuffer ? 110 : 50, 55, { width: 300 });

      if (user.GSTIN) {
        doc.text(`GSTIN: ${user.GSTIN}`, logoBuffer ? 110 : 50, 75);
      }

      // Invoice metadata on the right of header
      doc.fillColor('#ffffff')
         .fontSize(10)
         .text('INVOICE', 450, 30, { align: 'right', width: 95 })
         .fontSize(15)
         .text(invoice.invoiceNumber, 450, 42, { align: 'right', width: 95 })
         .fontSize(9)
         .text(invoice.status.toUpperCase(), 450, 65, { align: 'right', width: 95 });

      // Client Info
      const clientInfo = invoice.clientSnapshot || (invoice.clientId ? invoice.clientId : {});
      doc.fillColor('#1a1a2e')
         .fontSize(9)
         .text('BILL TO', 50, 130)
         .fontSize(11)
         .text(clientInfo.name || '—', 50, 145)
         .fontSize(9)
         .fillColor('#6b7280')
         .text(clientInfo.email || '', 50, 160)
         .text(clientInfo.address || '', 50, 172, { width: 250 });

      if (clientInfo.GSTIN) {
        doc.text(`GSTIN: ${clientInfo.GSTIN}`, 50, 205);
      }

      // Invoice Info Row
      doc.fillColor('#1a1a2e')
         .text('ISSUE DATE', 350, 130)
         .text('DUE DATE', 430, 130)
         .text('CURRENCY', 510, 130);

      doc.fillColor('#6b7280')
         .text(formatDate(invoice.issueDate || new Date()), 350, 145)
         .text(invoice.dueDate ? formatDate(invoice.dueDate) : '—', 430, 145)
         .text(invoice.currency, 510, 145);

      // Line Items Table
      let y = 240;
      doc.rect(50, y, 495.28, 20).fill('#f3f4f6');
      doc.fillColor('#374151')
         .text('Description', 60, y + 5)
         .text('Qty', 300, y + 5, { width: 50, align: 'center' })
         .text('Rate', 360, y + 5, { width: 80, align: 'right' })
         .text('Amount', 450, y + 5, { width: 80, align: 'right' });

      y += 20;
      doc.fillColor('#1a1a2e');

      invoice.lineItems.forEach((item) => {
        if (y > 720) {
          doc.addPage();
          y = 50;
          doc.rect(50, y, 495.28, 20).fill('#f3f4f6');
          doc.fillColor('#374151')
             .text('Description', 60, y + 5)
             .text('Qty', 300, y + 5, { width: 50, align: 'center' })
             .text('Rate', 360, y + 5, { width: 80, align: 'right' })
             .text('Amount', 450, y + 5, { width: 80, align: 'right' });
          y += 20;
          doc.fillColor('#1a1a2e');
        }

        doc.moveTo(50, y + 20).lineTo(545.28, y + 20).stroke('#e5e7eb');
        doc.text(item.description, 60, y + 5, { width: 230 })
           .text(item.qty.toString(), 300, y + 5, { width: 50, align: 'center' })
           .text(formatCurrency(item.rate, invoice.currency), 360, y + 5, { width: 80, align: 'right' })
           .text(formatCurrency(item.amount, invoice.currency), 450, y + 5, { width: 80, align: 'right' });
        y += 20;
      });

      // Totals Panel
      y += 10;
      doc.text('Subtotal:', 350, y, { width: 90, align: 'right' })
         .text(formatCurrency(invoice.subtotal, invoice.currency), 450, y, { width: 80, align: 'right' });
      y += 15;

      if (invoice.additionalCharges && invoice.additionalCharges.length > 0) {
        invoice.additionalCharges.forEach((charge) => {
          const chargeName = charge.type === 'Other (Custom)' ? (charge.name || charge.type) : charge.type;
          let chargeAmt = parseFloat(charge.amount) || 0;
          if (charge.mode === 'Percentage') {
            chargeAmt = (invoice.subtotal * chargeAmt) / 100;
          }
          doc.text(`${chargeName}:`, 300, y, { width: 140, align: 'right' })
             .text(formatCurrency(chargeAmt, invoice.currency), 450, y, { width: 80, align: 'right' });
          y += 15;
        });
      }

      if (invoice.totalDiscount > 0) {
        doc.text('Discount:', 350, y, { width: 90, align: 'right' })
           .text(`-${formatCurrency(invoice.totalDiscount, invoice.currency)}`, 450, y, { width: 80, align: 'right' });
        y += 15;
      }

      if (invoice.gstPercent > 0) {
        doc.text(`GST (${invoice.gstPercent}%):`, 350, y, { width: 90, align: 'right' })
           .text(formatCurrency(invoice.gstAmount, invoice.currency), 450, y, { width: 80, align: 'right' });
        y += 15;
      }

      y += 5;
      doc.rect(350, y, 195.28, 25).fill(brandColor);
      doc.fillColor('#ffffff')
         .text('Total Due:', 360, y + 7, { width: 80, align: 'left' })
         .text(formatCurrency(invoice.total, invoice.currency), 450, y + 7, { width: 80, align: 'right' });

      y += 40;

      // Notes
      if (invoice.notes) {
        doc.fillColor('#1a1a2e')
           .fontSize(9)
           .text('Notes', 50, y)
           .fillColor('#6b7280')
           .text(invoice.notes, 50, y + 15, { width: 495 });
        y += 45;
      }

      // Signature Rendering if Pro
      const signatureBuffer = isPro ? getBufferFromBase64(user.signature) : null;
      if (signatureBuffer) {
        try {
          doc.image(signatureBuffer, 430, y, { fit: [100, 40] });
          doc.fillColor('#6b7280')
             .fontSize(8)
             .text('Authorized Signature', 430, y + 45, { width: 100, align: 'center' });
        } catch (sigErr) {
          console.error('Error adding signature to PDF:', sigErr);
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDF, buildInvoiceHTML };
