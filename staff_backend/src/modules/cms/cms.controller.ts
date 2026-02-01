import { Request, Response, NextFunction } from 'express';
import { cmsService } from './cms.service';

export class CMSController {

    /**
     * GET /api/v1/cms/settings
     * Public endpoint - returns settings for frontend
     */
    async getPublicSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await cmsService.getPublicSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/cms/settings/:category
     * Public endpoint - returns settings by category
     */
    async getSettingsByCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const { category } = req.params;
            const settings = await cmsService.getSettingsByCategory(category);

            // Convert to key-value for easier frontend use
            const data: Record<string, string> = {};
            for (const s of settings) {
                data[(s as { setting_key: string }).setting_key] = (s as { setting_value: string }).setting_value;
            }

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/admin/cms/settings
     * Admin only - returns all settings with metadata
     */
    async getAllSettingsAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await cmsService.getAllSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/admin/cms/settings
     * Admin only - bulk update settings
     */
    async bulkUpdateSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const { settings } = req.body;
            const adminId = req.user!.id;

            const updatedCount = await cmsService.bulkUpdateSettings(settings, adminId);

            res.json({
                success: true,
                message: `${updatedCount} settings updated successfully`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/admin/cms/settings/:key
     * Admin only - update single setting
     */
    async updateSetting(req: Request, res: Response, next: NextFunction) {
        try {
            const { key } = req.params;
            const { value } = req.body;
            const adminId = req.user!.id;

            const setting = await cmsService.updateSetting(key, value, adminId);

            res.json({ success: true, data: setting });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/admin/cms/upload/logo
     * Admin only - upload new logo
     */
    async uploadLogo(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'No file uploaded' }
                });
            }

            const type = req.body.type === 'light' ? 'light' : 'main';
            const adminId = req.user!.id;

            const result = await cmsService.uploadLogo(req.file, type, adminId);

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/admin/cms/upload/background
     * Admin only - upload login background
     */
    async uploadBackground(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'No file uploaded' }
                });
            }

            const adminId = req.user!.id;
            const result = await cmsService.uploadBackground(req.file, adminId);

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

export const cmsController = new CMSController();
