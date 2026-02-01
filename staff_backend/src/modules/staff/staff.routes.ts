import { Router } from 'express';
import { staffController } from './staff.controller';
import { leaveBalanceController } from './leaveBalance.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validateBody } from '../../shared/middleware/validation.middleware';
import { updateProfileSchema, bankAccountSchema, familyMemberSchema, documentSchema } from './staff.validation';
import { upload } from '../../shared/middleware/upload.middleware';

import { cacheMiddleware, CACHE_TTL } from '../../shared/middleware/cache.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/profile', cacheMiddleware(CACHE_TTL.MEDIUM), staffController.getProfile);
router.put('/profile', validateBody(updateProfileSchema), staffController.updateProfile);
router.get('/employment', cacheMiddleware(CACHE_TTL.LONG), staffController.getEmploymentHistory);
router.get('/documents', cacheMiddleware(CACHE_TTL.SHORT), staffController.getDocuments);
router.post('/documents', upload.single('document'), validateBody(documentSchema), staffController.uploadDocument);
router.get('/documents/:id/download', staffController.downloadDocument);

// Notifications
router.get('/notifications', staffController.getNotifications);
router.put('/notifications/:id/read', staffController.markNotificationRead);
router.put('/notifications/read-all', staffController.markAllNotificationsRead);


// Bank Accounts
router.get('/bank-accounts', cacheMiddleware(CACHE_TTL.LONG), staffController.getBankAccounts);
router.post('/bank-accounts', validateBody(bankAccountSchema), staffController.addBankAccount);

// Family Members
router.get('/family-members', cacheMiddleware(CACHE_TTL.LONG), staffController.getFamilyMembers);
router.post('/family-members', validateBody(familyMemberSchema), staffController.addFamilyMember);

// Leave Balance
router.get('/leave-balance', cacheMiddleware(CACHE_TTL.SHORT), leaveBalanceController.getMyLeaveBalance);

export default router;
