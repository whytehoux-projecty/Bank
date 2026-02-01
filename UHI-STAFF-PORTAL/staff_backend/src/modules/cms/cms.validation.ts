import { z } from 'zod';

// Schema for updating a single setting
export const updateSettingSchema = z.object({
    value: z.string().min(1, 'Value is required'),
});

// Schema for bulk updating settings
export const bulkUpdateSettingsSchema = z.object({
    settings: z.array(z.object({
        key: z.string().min(1, 'Key is required'),
        value: z.string().min(1, 'Value is required'),
    })).min(1, 'At least one setting is required'),
});

// Schema for logo upload type
export const logoUploadSchema = z.object({
    type: z.enum(['main', 'light']).optional().default('main'),
});

// Validate category parameter
export const categorySchema = z.object({
    category: z.enum(['branding', 'login', 'dashboard', 'footer']),
});
