import { BankAccount, FamilyMember, StaffProfile as DbStaffProfile, Deployment } from '@prisma/client';

export interface UpdateProfileDTO {
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    personalPhone?: string;
    workPhone?: string;
    permanentAddress?: string;
    currentAddress?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
}

export interface CreateBankAccountDTO {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    swiftCode?: string;
    iban?: string;
    currency?: string;
    isPrimary?: boolean;
}

export interface CreateFamilyMemberDTO {
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth?: Date;
    gender?: string;
    isDependent?: boolean;
    isEmergencyContact?: boolean;
}

export interface CreateDeploymentDTO {
    missionName: string;
    country: string;
    startDate: string | Date;
    endDate?: string | Date;
    deploymentRole: string;
    status?: string;
    deploymentType?: string;
    hardshipLevel?: string;
    dangerPayEligible?: boolean;
}

export interface CreateDocumentDTO {
    documentType: string;
    documentName: string;
    documentNumber?: string;
    issuingAuthority?: string;
    issuingCountry?: string;
    issueDate?: string | Date;
    expiryDate?: string | Date;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    notes?: string;
}

export type FullStaffProfile = {
    id: string;
    staffId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    avatarUrl: string | null;
    department: string;
    position: string;
    joinedAt: Date;
    staffProfile: DbStaffProfile | null;
    bankAccount: BankAccount | null;
    deployment: Deployment | null;
    leaveBalance: unknown;
    familyMembers: FamilyMember[];
};
