const express = require('express');
const router = express.Router();
const { sendInvoice } = require('../controllers/emailController');
const { protect } = require('../middleware/auth');

router.use(protect); // All email routes require auth

router.post('/send/:invoiceId', sendInvoice);

module.exports = router;
