
import { prisma } from '../../config/database';

export async function getSystemSetting(key: string, defaultValue?: string): Promise<string | null> {
    try {
        const setting = await prisma.cmsSetting.findUnique({
            where: { setting_key: key }
        });
        return setting?.setting_value || defaultValue || null;
    } catch (error) {
        console.warn(`Failed to fetch setting ${key}:`, error);
        return defaultValue || null;
    }
}
