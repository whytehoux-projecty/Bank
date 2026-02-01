import { Router } from 'express';
import { webhookController } from './webhook.controller';

const router = Router();

// Public endpoint (verified by signature, no JWT required)
router.post('/payments', (req, res, next) => webhookController.handlePayment(req, res, next));

export default router;
