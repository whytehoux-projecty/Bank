import { z } from 'zod';

export const createApplicationSchema = z.object({
    type: z.enum(['leave', 'transfer', 'training', 'loan']),
    data: z.record(z.any()), // Flexible JSON object
});

export const applicationIdParamsSchema = z.object({
    id: z.string().uuid(),
});
