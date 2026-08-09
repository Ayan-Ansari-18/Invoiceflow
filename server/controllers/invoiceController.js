const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { generateInvoicePDF } = require('../services/pdfService');

// ─── Helper ────────────────────────────────────────────────────────────────────
const calcTotals = (lineItems, gstPercent) => {
  const subtotal = lineItems.reduce((sum, item) => {
    item.amount = parseFloat((item.qty * item.rate).toFixed(2));
    return sum + item.amount;
  }, 0);
  const subtotalRounded = parseFloat(subtotal.toFixed(2));
  const gstAmount = parseFloat(((subtotalRounded * gstPercent) / 100).toFixed(2));
  const total = parseFloat((subtotalRounded + gstAmount).toFixed(2));
  return { subtotal: subtotalRounded, gstAmount, total };
};

// POST /api/invoices
const createInvoice = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Enforce 50000 invoice limit for free users
    if (user.plan === 'free' && user.invoiceCounter >= 50000) {
      return res.status(403).json({ 
        success: false, 
        message: 'Free plan limit reached. You can only create up to 50000 invoices on the free plan.' 
      });
    }

    const { lineItems, gstPercent = 18, invoiceNumber: customInvoiceNumber, ...rest } = req.body;
    
    let invoiceNumber = customInvoiceNumber;
    if (!invoiceNumber || invoiceNumber.trim() === '') {
      // Auto-increment invoice number per user
      user.invoiceCounter += 1;
      await user.save();
      invoiceNumber = `${user.invoicePrefix}-${String(user.invoiceCounter).padStart(3, '0')}`;
    }

    const { subtotal, gstAmount, total } = calcTotals(lineItems, gstPercent);

    const invoice = await Invoice.create({
      ...rest,
      invoiceNumber,
      userId: user._id,
      lineItems,
      subtotal,
      gstPercent,
      gstAmount,
      total,
    });

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};

  // POST /api/invoices/bulk
const createBulkInvoices = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { clientIds, invoiceData, invoiceNumbers = {}, clientCountries = {} } = req.body;

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No clients provided' });
    }

    if (user.plan === 'free' && (user.invoiceCounter + clientIds.length) > 50000) {
      return res.status(403).json({
        success: false,
        message: `Free plan limit reached. Creating ${clientIds.length} invoices would exceed your 50000 invoice limit.`,
      });
    }

    const { lineItems, gstPercent: defaultGstPercent = 18, ...rest } = invoiceData;

    const Client = require('../models/Client');
    const clients = await Client.find({ _id: { $in: clientIds }, userId: user._id });

    const invoices = [];
    for (const client of clients) {
      let invoiceNumber = invoiceNumbers[client._id?.toString()];
      if (!invoiceNumber || invoiceNumber.trim() === '') {
        user.invoiceCounter += 1;
        invoiceNumber = `${user.invoicePrefix}-${String(user.invoiceCounter).padStart(3, '0')}`;
      }
      
      const clientCountry = clientCountries[client._id?.toString()] || client.country || 'India';
      const effectiveGstPercent = clientCountry === 'India' ? defaultGstPercent : 0;
      const { subtotal, gstAmount, total } = calcTotals(lineItems, effectiveGstPercent);
      
      invoices.push({
        userId: user._id,
        clientId: client._id,
        invoiceNumber,
        lineItems,
        gstPercent: effectiveGstPercent,
        subtotal,
        gstAmount,
        total,
        ...rest,
        clientSnapshot: {
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          GSTIN: client.GSTIN,
          country: clientCountry
        }
      });
    }

    await Invoice.insertMany(invoices);
    await user.save();
    
    res.status(201).json({ success: true, count: invoices.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices
const getInvoices = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    let [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('clientId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Invoice.countDocuments(filter),
    ]);

    // Dynamically update clientSnapshot if clientId exists (so updates reflect immediately)
    invoices = invoices.map(inv => {
      const obj = inv.toObject();
      if (obj.clientId) {
        obj.clientSnapshot = {
          name: obj.clientId.name,
          email: obj.clientId.email,
          phone: obj.clientId.phone,
          address: obj.clientId.address,
          GSTIN: obj.clientId.GSTIN
        };
      }
      return obj;
    });

    res.json({
      success: true,
      invoices,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices/:id
const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id }).populate('clientId');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    const obj = invoice.toObject();
    if (obj.clientId) {
      obj.clientSnapshot = {
        name: obj.clientId.name,
        email: obj.clientId.email,
        phone: obj.clientId.phone,
        address: obj.clientId.address,
        GSTIN: obj.clientId.GSTIN
      };
    }

    res.json({ success: true, invoice: obj });
  } catch (err) {
    next(err);
  }
};

// PUT /api/invoices/:id
const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const { lineItems, gstPercent, ...rest } = req.body;

    if (lineItems) {
      const gst = gstPercent !== undefined ? gstPercent : invoice.gstPercent;
      const { subtotal, gstAmount, total } = calcTotals(lineItems, gst);
      Object.assign(invoice, { lineItems, gstPercent: gst, subtotal, gstAmount, total });
    }

    Object.assign(invoice, rest);
    await invoice.save();

    res.json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/invoices/:id
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/invoices/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'sent', 'viewed', 'paid', 'overdue'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    res.json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices/:id/pdf
const downloadPDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id }).populate('clientId');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const user = await User.findById(req.user._id);
    const pdfBuffer = await generateInvoicePDF(invoice, user);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInvoice,
  createBulkInvoices,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  updateStatus,
  downloadPDF,
};
