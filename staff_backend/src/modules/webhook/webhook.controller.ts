import { Request, Response, NextFunction } from 'express';
import { webhookService } from './webhook.service';
import { AppError } from '../../shared/middleware/errorHandler.middleware';

export class WebhookController {
    async handlePayment(req: Request, res: Response, next: NextFunction) {
        try {
            const signature = req.headers['x-webhook-signature'] as string;

            if (!signature) {
                // Return 401 directly or use AppError
                throw new AppError('Missing signature', 401);
            }

            if (!webhookService.verifySignature(req.body, signature)) {
                throw new AppError('Invalid signature', 401);
            }

            const result = await webhookService.processPayment(req.body);

            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

export const webhookController = new WebhookController();
