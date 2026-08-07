const express = require('express');
const router = express.Router();
const {
  connectGmail,
  saveGmailTokens,
  disconnectGmail,
  sendInvoice,
  getEmailStatus,
} = require('../controllers/emailController');
const { protect } = require('../middleware/auth');

router.use(protect); // All email routes require auth

router.get('/status', getEmailStatus);
router.get('/gmail/connect', connectGmail);
router.post('/gmail/save-tokens', saveGmailTokens);
router.delete('/gmail/disconnect', disconnectGmail);
router.post('/send/:invoiceId', sendInvoice);

module.exports = router;
