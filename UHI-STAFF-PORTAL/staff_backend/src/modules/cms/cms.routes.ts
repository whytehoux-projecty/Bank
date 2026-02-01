import { Router } from 'express';
import multer from 'multer';
import { cmsController } from './cms.controller';
import { authMiddleware, adminOnly } from '../../shared/middleware/auth.middleware';
import { validateBody } from '../../shared/middleware/validation.middleware';
import { updateSettingSchema, bulkUpdateSettingsSchema } from './cms.validation';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

import { cacheMiddleware, CACHE_TTL } from '../../shared/middleware/cache.middleware';

// Public routes (no auth required)
router.get('/settings', cacheMiddleware(CACHE_TTL.MEDIUM), cmsController.getPublicSettings);
router.get('/settings/:category', cacheMiddleware(CACHE_TTL.MEDIUM), cmsController.getSettingsByCategory);

// Admin routes (require admin role)
router.get('/admin/settings', authMiddleware, adminOnly, cmsController.getAllSettingsAdmin);
router.put('/admin/settings', authMiddleware, adminOnly, validateBody(bulkUpdateSettingsSchema), cmsController.bulkUpdateSettings);
router.put('/admin/settings/:key', authMiddleware, adminOnly, validateBody(updateSettingSchema), cmsController.updateSetting);
router.post('/admin/upload/logo', authMiddleware, adminOnly, upload.single('logo'), cmsController.uploadLogo);
router.post('/admin/upload/background', authMiddleware, adminOnly, upload.single('background'), cmsController.uploadBackground);

export default router;
