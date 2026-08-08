const PDFDocument = require('pdfkit');

const formatCurrency = (amount, currency = 'INR') => {
  const sym = currency === 'INR' ? 'Rs. ' : (currency === 'USD' ? '$' : (currency === 'EUR' ? '€' : (currency === 'GBP' ? '£' : currency + ' ')));
  return `${sym}${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

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
      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const brandColor = user.brandColor || '#ef4444'; // Red default matching screenshot
      const isPro = user.plan === 'pro';

      // ─── 1. Header Banner ──────────────────────────────────────────────────────────
      doc.rect(0, 0, 595.28, 135).fill(brandColor);

      // Logo
      const logoBuffer = isPro ? getBufferFromBase64(user.logo) : null;
      let titleX = 40;
      if (logoBuffer) {
        try {
          doc.roundedRect(40, 25, 52, 52, 8).fill('#ffffff');
          doc.image(logoBuffer, 46, 31, { width: 40, height: 40 });
          titleX = 110;
        } catch (e) { console.error('Logo err', e); }
      }

      // Business Name & Address
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(26).text(user.businessName || user.name || 'Your Business', titleX, 32, { width: 300, lineBreak: false });
      if (user.businessAddress) {
        doc.font('Helvetica').fontSize(9).text(user.businessAddress, titleX, 68, { width: 250, lineHeight: 1.2 });
      }

      // Invoice Label & Number
      doc.fillColor('#ffffff').font('Helvetica').fontSize(9).text('INVOICE', 350, 32, { align: 'right', width: 205, characterSpacing: 1.5 });
      doc.font('Helvetica-Bold').fontSize(24).text(invoice.invoiceNumber, 350, 48, { align: 'right', width: 205 });

      // Status Badge
      const status = (invoice.status || 'DRAFT').toUpperCase();
      let badgeColor = status === 'PAID' ? '#10b981' : (status === 'OVERDUE' ? '#ef4444' : brandColor);
      
      // Calculate badge position and size based on text width
      doc.fontSize(10).font('Helvetica-Bold');
      const statusWidth = doc.widthOfString(status) + 24;
      const badgeX = 555 - statusWidth;
      
      doc.roundedRect(badgeX, 85, statusWidth, 20, 10).fill('#ffffff');
      doc.fillColor(badgeColor).text(status, badgeX, 91, { width: statusWidth, align: 'center' });

      // ─── 2. Dates & Currency ───────────────────────────────────────────────────────
      let y = 170;
      doc.moveTo(40, y).lineTo(555, y).lineWidth(1).stroke('#e5e7eb');
      y += 18;

      doc.fillColor('#9ca3af').font('Helvetica-Bold').fontSize(7.5).text('ISSUE DATE', 40, y, { characterSpacing: 1 })
         .text('DUE DATE', 240, y, { characterSpacing: 1 })
         .text('CURRENCY', 420, y, { characterSpacing: 1 });
      
      y += 14;
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10).text(formatDate(invoice.issueDate || invoice.createdAt), 40, y);
      const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && status !== 'PAID';
      doc.fillColor(isOverdue ? '#dc2626' : '#111827').text(invoice.dueDate ? formatDate(invoice.dueDate) : '—', 240, y);
      doc.fillColor('#111827').text(invoice.currency || 'INR', 420, y);

      // ─── 3. Bill To & From ─────────────────────────────────────────────────────────
      y += 45;
      doc.moveTo(40, y).lineTo(280, y).lineWidth(1).stroke('#e5e7eb');
      doc.moveTo(320, y).lineTo(555, y).stroke('#e5e7eb');
      
      y += 18;
      doc.fillColor('#9ca3af').font('Helvetica-Bold').fontSize(7.5).text('BILL TO', 40, y, { characterSpacing: 1 })
         .text('FROM', 320, y, { characterSpacing: 1 });

      y += 16;
      const client = invoice.clientSnapshot || (invoice.clientId || {});
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text(client.name || '—', 40, y)
         .text(user.businessName || user.name || '—', 320, y);

      y += 18;
      doc.fillColor('#6b7280').font('Helvetica').fontSize(9).text(client.email || '', 40, y)
         .text(user.email || '', 320, y);
      y += 14;
      if (client.phone) { doc.text(client.phone, 40, y); }
      if (user.businessPhone) { doc.text(user.businessPhone, 320, y); }
      if (client.phone || user.businessPhone) y += 14;
      
      if (client.address) doc.text(client.address, 40, y, { width: 220, lineHeight: 1.2 });
      if (user.businessAddress) doc.text(user.businessAddress, 320, y, { width: 220, lineHeight: 1.2 });

      let maxAddressHeight = Math.max(
        client.address ? doc.heightOfString(client.address, {width: 220}) : 0, 
        user.businessAddress ? doc.heightOfString(user.businessAddress, {width: 220}) : 0
      );
      if (maxAddressHeight > 0) y += maxAddressHeight + 8;

      if (client.GSTIN) doc.text(`GSTIN: ${client.GSTIN}`, 40, y);
      if (user.GSTIN) doc.text(`GSTIN: ${user.GSTIN}`, 320, y);
      if (client.GSTIN || user.GSTIN) y += 14;

      // ─── 4. Line Items Table ───────────────────────────────────────────────────────
      y += 30;
      doc.rect(40, y, 515.28, 25).fill(brandColor);
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5).text('DESCRIPTION', 55, y + 8, { characterSpacing: 1 })
         .text('QTY', 330, y + 8, { width: 40, align: 'center', characterSpacing: 1 })
         .text('RATE', 390, y + 8, { width: 70, align: 'right', characterSpacing: 1 })
         .text('AMOUNT', 470, y + 8, { width: 70, align: 'right', characterSpacing: 1 });

      y += 25;
      invoice.lineItems.forEach((item, index) => {
        if (y > 700) {
          doc.addPage();
          y = 40;
          doc.rect(40, y, 515.28, 25).fill(brandColor);
          doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5).text('DESCRIPTION', 55, y + 8, { characterSpacing: 1 })
             .text('QTY', 330, y + 8, { width: 40, align: 'center', characterSpacing: 1 })
             .text('RATE', 390, y + 8, { width: 70, align: 'right', characterSpacing: 1 })
             .text('AMOUNT', 470, y + 8, { width: 70, align: 'right', characterSpacing: 1 });
          y += 25;
        }

        let descHeight = doc.font('Helvetica').fontSize(9).heightOfString(item.description || '-', { width: 250 });
        let rowHeight = Math.max(35, descHeight + 16);

        // Fill background for even/odd rows just like screenshot
        doc.rect(40, y, 515.28, rowHeight).fill(index % 2 === 0 ? '#f9fafb' : '#ffffff');
        
        doc.fillColor('#111827').font('Helvetica').text(item.description || '-', 55, y + 12, { width: 250 })
           .text((item.qty || 1).toString(), 330, y + 12, { width: 40, align: 'center' })
           .text(formatCurrency(item.rate, invoice.currency), 390, y + 12, { width: 70, align: 'right' })
           .font('Helvetica-Bold').text(formatCurrency(item.amount, invoice.currency), 470, y + 12, { width: 70, align: 'right' });
        
        y += rowHeight;
        doc.moveTo(40, y).lineTo(555, y).lineWidth(1).stroke('#f3f4f6');
      });

      // ─── 5. Totals ─────────────────────────────────────────────────────────────────
      y += 25;
      let totalsY = y;
      
      const addTotalRow = (label, amount, isBold = false, color = '#111827', drawLine = true) => {
        if (drawLine) {
          doc.moveTo(350, totalsY).lineTo(555, totalsY).lineWidth(1).stroke('#e5e7eb');
          totalsY += 12;
        }
        doc.fillColor('#6b7280').font('Helvetica').fontSize(9).text(label, 350, totalsY);
        doc.fillColor(color).font(isBold ? 'Helvetica-Bold' : 'Helvetica').text(formatCurrency(amount, invoice.currency), 445, totalsY, { width: 110, align: 'right' });
        totalsY += 16;
      };

      // Add subtotal without line first
      doc.fillColor('#6b7280').font('Helvetica').fontSize(9).text('Subtotal', 350, totalsY);
      doc.fillColor('#111827').font('Helvetica-Bold').text(formatCurrency(invoice.subtotal, invoice.currency), 445, totalsY, { width: 110, align: 'right' });
      totalsY += 20;
      
      if (invoice.additionalCharges && invoice.additionalCharges.length > 0) {
        invoice.additionalCharges.forEach((charge) => {
          let chargeAmt = parseFloat(charge.amount) || 0;
          if (charge.mode === 'Percentage') chargeAmt = (invoice.subtotal * chargeAmt) / 100;
          addTotalRow(charge.name || charge.type, chargeAmt);
        });
      }
      
      if (invoice.totalDiscount > 0) addTotalRow('Discount', -invoice.totalDiscount, false, '#dc2626');
      if (invoice.gstPercent > 0) addTotalRow(`GST (${invoice.gstPercent}%)`, invoice.gstAmount);

      doc.moveTo(350, totalsY).lineTo(555, totalsY).lineWidth(1).stroke('#e5e7eb');
      totalsY += 14;
      doc.fillColor(brandColor).font('Helvetica-Bold').fontSize(14).text('Total Due', 350, totalsY);
      doc.text(formatCurrency(invoice.total, invoice.currency), 420, totalsY, { width: 135, align: 'right' });

      // ─── 6. Notes & Terms ──────────────────────────────────────────────────────────
      let leftY = y + 15;
      
      if (invoice.notes) {
        doc.fillColor('#9ca3af').font('Helvetica-Bold').fontSize(7.5).text('NOTES', 40, leftY, { characterSpacing: 1 });
        leftY += 14;
        let notesHeight = doc.font('Helvetica').fontSize(9).heightOfString(invoice.notes, { width: 280 });
        doc.fillColor('#4b5563').text(invoice.notes, 40, leftY, { width: 280, lineHeight: 1.4 });
        leftY += notesHeight + 25;
      }

      if (invoice.terms) {
        doc.fillColor('#9ca3af').font('Helvetica-Bold').fontSize(7.5).text('TERMS & CONDITIONS', 40, leftY, { characterSpacing: 1 });
        leftY += 15;
        let termsHeight = doc.font('Helvetica').fontSize(9).heightOfString(invoice.terms, { width: 270 });
        doc.rect(40, leftY, 3, termsHeight + 10).fill(brandColor);
        doc.fillColor('#4b5563').text(invoice.terms, 50, leftY + 5, { width: 270, lineHeight: 1.4 });
      }

      // ─── 7. Signature ──────────────────────────────────────────────────────────────
      const signatureBuffer = isPro ? getBufferFromBase64(user.signature) : null;
      if (signatureBuffer) {
        let sigY = Math.max(totalsY + 40, leftY + 20);
        if (sigY > 700) { doc.addPage(); sigY = 50; }
        try {
          doc.image(signatureBuffer, 410, sigY, { fit: [140, 50], align: 'center' });
          doc.moveTo(400, sigY + 55).lineTo(555, sigY + 55).lineWidth(1).stroke('#e5e7eb');
          doc.fillColor('#6b7280').font('Helvetica').fontSize(8).text('Authorized Signature', 400, sigY + 62, { width: 155, align: 'center' });
        } catch (e) { console.error('Sig err', e); }
      }

      // ─── 8. Footer ─────────────────────────────────────────────────────────────────
      let footerY = 780;
      doc.moveTo(40, footerY).lineTo(555, footerY).lineWidth(1).stroke('#e5e7eb');
      doc.fillColor('#9ca3af').font('Helvetica').fontSize(8).text('Thank you for your business!', 40, footerY + 14);
      doc.text(`Generated with InvoiceFlow · ${user.email || ''}`, 300, footerY + 14, { width: 255, align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDF, buildInvoiceHTML: () => '' };
