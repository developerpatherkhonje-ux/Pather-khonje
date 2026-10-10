const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/invoiceController');

// All routes require admin auth
router.use(authenticateToken, requireAdmin);

router.get('/', ctrl.getInvoices);
router.post('/', ctrl.createInvoice);
router.get('/:id', ctrl.getInvoiceById);
router.put('/:id', ctrl.updateInvoice);
router.delete('/:id', ctrl.deleteInvoice);
router.post('/:id/payments', ctrl.addInvoicePayment);
router.get('/:id/pdf', ctrl.downloadInvoicePdf);
router.get('/:id/payments/:paymentId/pdf', ctrl.downloadPaymentReceiptPdf);

module.exports = router;


