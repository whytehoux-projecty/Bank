import { Router } from 'express';
import { financeController } from './finance.controller';
import loanRoutes from './loan.routes';
import { PayrollController } from './payroll.controller';
import { grantController } from './grant.controller';
import { authMiddleware, adminOnly } from '../../shared/middleware/auth.middleware';

const router = Router();
const payrollController = new PayrollController();

router.use(authMiddleware);

router.get('/payroll', financeController.getPayroll);
router.get('/payroll/:id/pdf', financeController.downloadPayslip);
// router.get('/loans', financeController.getLoans); // Replaced by loanRoutes
router.get('/grants', grantController.getUserGrants);
router.post('/grants', grantController.applyForGrant);
router.get('/grants/:id', grantController.getGrantById);
router.delete('/grants/:id', grantController.cancelGrant);
router.get('/benefits', financeController.getBenefits);

router.get('/admin/payroll/records', adminOnly, payrollController.getRecords.bind(payrollController));
router.get('/admin/payroll/stats', adminOnly, payrollController.getStats.bind(payrollController));
router.get('/admin/payroll/records/:id', adminOnly, payrollController.getRecord.bind(payrollController));
router.patch('/admin/payroll/records/:id', adminOnly, payrollController.updateRecord.bind(payrollController));
router.post('/admin/payroll/generate', adminOnly, payrollController.generate.bind(payrollController));
router.post('/admin/payroll/bulk', adminOnly, payrollController.bulkAction.bind(payrollController));

// Mount Loan Routes
router.use('/', loanRoutes);

export default router;

