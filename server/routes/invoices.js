const express = require('express');
const router = express.Router();
const {
  createInvoice,
  createBulkInvoices,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  updateStatus,
  downloadPDF,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');
const { validate, invoiceSchema, updateInvoiceSchema } = require('../middleware/validate');

router.use(protect); // All invoice routes require auth

router.post('/bulk', createBulkInvoices); // No generic validation schema since body is { clientIds, invoiceData }
router.route('/').get(getInvoices).post(validate(invoiceSchema), createInvoice);
router.route('/:id').get(getInvoice).put(validate(updateInvoiceSchema), updateInvoice).delete(deleteInvoice);
router.patch('/:id/status', updateStatus);
router.get('/:id/pdf', downloadPDF);

module.exports = router;
