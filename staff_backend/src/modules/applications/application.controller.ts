import { Request, Response, NextFunction } from 'express';
import { applicationService } from './application.service';

export class ApplicationController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const result = await applicationService.createApplication(userId, req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getMyApplications(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const applications = await applicationService.getMyApplications(userId);
            res.json({ success: true, data: applications });
        } catch (error) {
            next(error);
        }
    }

    async cancel(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const application = await applicationService.cancelApplication(userId, id);
            res.json({ success: true, data: application });
        } catch (error) {
            next(error);
        }
    }
}

export const applicationController = new ApplicationController();
