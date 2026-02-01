import { Router } from 'express';
import { applicationController } from './application.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validateBody, validateParams } from '../../shared/middleware/validation.middleware';
import { applicationIdParamsSchema, createApplicationSchema } from './application.validation';

const router = Router();

router.use(authMiddleware);

router.post('/', validateBody(createApplicationSchema), applicationController.create);
router.get('/my', applicationController.getMyApplications);
router.patch('/:id/cancel', validateParams(applicationIdParamsSchema), applicationController.cancel);

export default router;
