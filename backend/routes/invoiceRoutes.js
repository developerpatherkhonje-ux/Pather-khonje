const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requirePermission } = require('../middleware/auth');
const ctrl = require('../controllers/invoiceController');

// All routes require admin auth
router.use(authenticateToken, requireAdmin);

router.get('/', requirePermission('invoices:view'), ctrl.getInvoices);
router.post('/', requirePermission('invoices:manage'), ctrl.createInvoice);
router.get('/:id', requirePermission('invoices:view'), ctrl.getInvoiceById);
router.put('/:id', requirePermission('invoices:manage'), ctrl.updateInvoice);
router.delete('/:id', requirePermission('invoices:manage'), ctrl.deleteInvoice);
router.post('/:id/payments', requirePermission('invoices:manage'), ctrl.addInvoicePayment);
router.get('/:id/pdf', requirePermission('invoices:view'), ctrl.downloadInvoicePdf);
router.get('/:id/payments/:paymentId/pdf', requirePermission('invoices:view'), ctrl.downloadPaymentReceiptPdf);

module.exports = router;


