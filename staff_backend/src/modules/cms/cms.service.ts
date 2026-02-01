import { prisma } from '../../config/database';
import { storageService } from '../../shared/utils/storage';
import { CMSSetting, UpdateSettingDTO } from './cms.types';

export class CMSService {

    /**
     * Get all public settings (for frontend consumption)
     */
    async getPublicSettings(): Promise<Record<string, string>> {
        const settings = await prisma.cmsSetting.findMany({
            where: { is_public: true },
            select: { setting_key: true, setting_value: true }
        });

        return settings.reduce((acc, s) => {
            acc[s.setting_key] = s.setting_value;
            return acc;
        }, {} as Record<string, string>);
    }

    /**
     * Get settings by category
     */
    async getSettingsByCategory(category: string): Promise<CMSSetting[]> {
        return prisma.cmsSetting.findMany({
            where: { category },
            orderBy: { setting_key: 'asc' }
        }) as unknown as CMSSetting[];
    }

    /**
     * Get all settings (admin view with metadata)
     */
    async getAllSettings(): Promise<CMSSetting[]> {
        return prisma.cmsSetting.findMany({
            include: {
                updatedByUser: {
                    select: { first_name: true, last_name: true }
                }
            },
            orderBy: [{ category: 'asc' }, { setting_key: 'asc' }]
        }) as unknown as CMSSetting[];
    }

    /**
     * Update a single setting
     */
    async updateSetting(
        key: string,
        value: string,
        adminId: string
    ): Promise<CMSSetting> {
        return prisma.cmsSetting.update({
            where: { setting_key: key },
            data: {
                setting_value: value,
                updated_by: adminId,
                updated_at: new Date()
            }
        }) as unknown as CMSSetting;
    }

    /**
     * Bulk update settings
     */
    async bulkUpdateSettings(
        settings: UpdateSettingDTO[],
        adminId: string
    ): Promise<number> {
        const updatePromises = settings.map(s =>
            prisma.cmsSetting.update({
                where: { setting_key: s.key },
                data: {
                    setting_value: s.value,
                    updated_by: adminId,
                    updated_at: new Date()
                }
            })
        );

        const results = await Promise.allSettled(updatePromises);
        return results.filter(r => r.status === 'fulfilled').length;
    }

    /**
     * Upload and update logo
     */
    async uploadLogo(
        file: Express.Multer.File,
        type: 'main' | 'light',
        adminId: string
    ): Promise<{ url: string }> {
        // Validate file
        const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Use PNG, JPEG, or SVG.');
        }

        // Upload to storage
        const filename = `logos/logo_${type}_${Date.now()}${this.getExtension(file.mimetype)}`;
        // Note: storageService.uploadFile returns the key.
        // In real S3 usage, we might want the full URL or just the key depending on how frontend consumes it.
        // For now, we store the key/path. Frontend can request a signed URL or if public, construct the URL.
        const key = await storageService.uploadFile(filename, file.buffer, file.mimetype);

        // If we want to store the full URL, we might need to construct it based on S3 config.
        // But storing the key is cleaner if we use signed URLs or a proxy.
        // However, legacy implementation returned 'url'. 
        // Let's assume for now we store the key, and the frontend/API handles retrieval.
        // OR we can generate a signed URL right here if it's meant to be long-lived public access? 
        // Usually logos are public. 
        // Let's return the key for now, consistent with typical S3 usage.

        // Update setting
        const settingKey = type === 'main' ? 'org_logo_url' : 'org_logo_light_url';
        await this.updateSetting(settingKey, key, adminId);

        return { url: key };
    }

    /**
     * Upload background image
     */
    async uploadBackground(
        file: Express.Multer.File,
        adminId: string
    ): Promise<{ url: string }> {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Use PNG, JPEG, or WebP.');
        }

        const filename = `backgrounds/login_bg_${Date.now()}${this.getExtension(file.mimetype)}`;
        const key = await storageService.uploadFile(filename, file.buffer, file.mimetype);

        await this.updateSetting('login_bg_url', key, adminId);

        return { url: key };
    }

    private getExtension(mimeType: string): string {
        const map: Record<string, string> = {
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/svg+xml': '.svg',
            'image/webp': '.webp'
        };
        return map[mimeType] || '.png';
    }
}

export const cmsService = new CMSService();
