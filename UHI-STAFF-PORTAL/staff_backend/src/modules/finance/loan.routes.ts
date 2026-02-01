import { Router } from 'express';
import { loanController } from './loan.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { adminOnly } from '../../shared/middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ============ STAFF ROUTES ============
// GET /finance/loans - Get user's loans
router.get('/loans', loanController.getUserLoans);

// GET /finance/loans/:id - Get specific loan
router.get('/loans/:id', loanController.getLoanById);

// GET /finance/loans/:id/history/pdf - Download loan history PDF
router.get('/loans/:id/history/pdf', loanController.downloadHistory);

// POST /finance/loans - Apply for new loan
router.post('/loans', loanController.applyForLoan);

// PATCH /finance/loans/:id/cancel - Cancel pending loan
router.patch('/loans/:id/cancel', loanController.cancelLoanApplication);

// POST /finance/loans/:id/payment - Record a payment
router.post('/loans/:id/payment', loanController.recordPayment);

// POST /finance/loans/:id/invoice - Generate payment invoice
router.post('/loans/:id/invoice', loanController.generateInvoice);

// POST /finance/loans/:id/pay - Initiate Stripe Payment
router.post('/loans/:id/pay', loanController.initiatePayment);

// ============ ADMIN ROUTES ============
router.get('/admin/loans', authMiddleware, adminOnly, loanController.getAllLoans.bind(loanController));
router.get('/admin/loans/stats', authMiddleware, adminOnly, loanController.getLoanStats.bind(loanController));
router.get('/admin/loans/:id', authMiddleware, adminOnly, loanController.getLoanDetails.bind(loanController));
router.patch('/admin/loans/:id', authMiddleware, adminOnly, loanController.updateLoan.bind(loanController));
router.post('/admin/loans/:id/approve', authMiddleware, adminOnly, loanController.approveLoan.bind(loanController));
router.post('/admin/loans/:id/reject', authMiddleware, adminOnly, loanController.rejectLoan.bind(loanController));
router.post('/admin/loans/:id/activate', authMiddleware, adminOnly, loanController.activateLoan.bind(loanController));
router.post('/admin/loans/bulk-approve', authMiddleware, adminOnly, loanController.bulkApprove.bind(loanController));
router.post('/admin/loans/send-reminders', authMiddleware, adminOnly, loanController.sendReminders.bind(loanController));

export default router;
