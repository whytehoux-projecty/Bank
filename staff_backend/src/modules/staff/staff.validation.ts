import { z } from 'zod';

export const updateProfileSchema = z.object({
    email: z.string().email('Invalid email').optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    avatarUrl: z.string().url().optional(),
    // Extended Profile Fields
    personalPhone: z.string().optional(),
    workPhone: z.string().optional(),
    permanentAddress: z.string().optional(),
    currentAddress: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactRelation: z.string().optional(),
});

export const bankAccountSchema = z.object({
    bankName: z.string().min(1, "Bank name is required"),
    accountName: z.string().min(1, "Account name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    swiftCode: z.string().optional(),
    iban: z.string().optional(),
    currency: z.string().default("USD"),
    isPrimary: z.boolean().optional(),
});

export const familyMemberSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    relationship: z.enum(['spouse', 'child', 'parent', 'sibling', 'other']),
    dateOfBirth: z.string().datetime().optional(), // ISO string
    gender: z.enum(['male', 'female', 'other']).optional(),
    isDependent: z.boolean().optional(),
    isEmergencyContact: z.boolean().optional(),
});

export const deploymentSchema = z.object({
    missionName: z.string().min(1),
    country: z.string().min(1),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    deploymentRole: z.string().min(1),
    status: z.enum(['planned', 'active', 'completed', 'cancelled', 'extended']).default('planned'),
    deploymentType: z.enum(['standard', 'emergency', 'short_term', 'consultancy', 'training', 'detail']).default('standard'),
    hardshipLevel: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
    dangerPayEligible: z.boolean().default(false)
});

export const documentSchema = z.object({
    documentType: z.enum(['passport', 'national_id', 'drivers_license', 'medical_license', 'nursing_license', 'professional_cert', 'work_permit', 'visa', 'un_laissez_passer', 'usaid_badge', 'security_clearance', 'vaccination_record', 'contract', 'diploma', 'other']),
    documentName: z.string().min(1),
    documentNumber: z.string().optional(),
    issuingAuthority: z.string().optional(),
    issuingCountry: z.string().optional(),
    issueDate: z.string().optional(), // ISO date
    expiryDate: z.string().optional(), // ISO date
    notes: z.string().optional()
});
