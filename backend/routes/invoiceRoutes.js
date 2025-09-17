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
router.get('/:id/pdf', ctrl.downloadInvoicePdf);

module.exports = router;


