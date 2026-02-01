import { Request, Response, NextFunction } from 'express';
import { staffService } from './staff.service';
import { storageService } from '../../shared/utils/storage';
import * as fs from 'fs';
import path from 'path';

export class StaffController {

    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id; // Set by authMiddleware
            const profile = await staffService.getProfile(userId);
            res.json({ success: true, data: profile });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const updated = await staffService.updateProfile(userId, req.body);
            res.json({ success: true, message: 'Profile updated', data: updated });
        } catch (error) {
            next(error);
        }
    }

    async getEmploymentHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const history = await staffService.getEmploymentHistory(userId);
            res.json({ success: true, data: history });
        } catch (error) {
            next(error);
        }
    }

    async getDocuments(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const documents = await staffService.getDocuments(userId);
            res.json({ success: true, data: documents });
        } catch (error) {
            next(error);
        }
    }

    async getBankAccounts(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const accounts = await staffService.getBankAccounts(userId);
            res.json({ success: true, data: accounts });
        } catch (error) {
            next(error);
        }
    }

    async addBankAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const account = await staffService.addBankAccount(userId, req.body);
            res.json({ success: true, data: account });
        } catch (error) {
            next(error);
        }
    }

    async getFamilyMembers(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const members = await staffService.getFamilyMembers(userId);
            res.json({ success: true, data: members });
        } catch (error) {
            next(error);
        }
    }

    async addFamilyMember(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const member = await staffService.addFamilyMember(userId, req.body);
            res.json({ success: true, data: member });
        } catch (error) {
            next(error);
        }
    }

    async getNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const notifications = await staffService.getNotifications(userId);
            res.json({ success: true, data: notifications });
        } catch (error) {
            next(error);
        }
    }

    async markNotificationRead(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const result = await staffService.markNotificationRead(userId, id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const result = await staffService.markAllNotificationsRead(userId);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async uploadDocument(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const file = req.file;

            if (!file) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }

            // S3 Upload logic
            const s3Key = `documents/${userId}/${file.filename}`;
            const fileBuffer = await fs.promises.readFile(file.path);
            await storageService.uploadFile(s3Key, fileBuffer, file.mimetype);

            // Cleanup local file
            await fs.promises.unlink(file.path);

            const fileUrl = `s3:${s3Key}`;

            const docData = {
                ...req.body,
                fileUrl,
                fileName: file.originalname,
                fileSize: file.size,
                fileType: file.mimetype
            };

            const document = await staffService.addDocument(userId, docData);
            res.json({ success: true, data: document });
        } catch (error) {
            next(error);
        }
    }

    async downloadDocument(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            const documents = await staffService.getDocuments(userId);
            const doc = documents.find(d => d.id === id);

            if (!doc) {
                res.status(404).json({ success: false, message: 'Document not found' });
                return;
            }

            if (doc.file_url.startsWith('s3:')) {
                const key = doc.file_url.substring(3);
                const url = await storageService.getSignedUrl(key);
                res.redirect(url);
            } else {
                // Local file fallback
                // Assuming legacy local files have relative path starting with /uploads
                // But path.join(__dirname...) logic was in middleware.
                // Since this app runs in dist/, we need to find uploads relative to root.
                // Assuming process.cwd() is root.
                const filePath = path.join(process.cwd(), doc.file_url);
                res.download(filePath);
            }
        } catch (error) {
            next(error);
        }
    }
}

export const staffController = new StaffController();
