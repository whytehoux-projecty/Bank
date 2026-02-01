export interface User {
    id: string;
    staffId: string;
    staff_id?: string;
    firstName: string;
    first_name?: string;
    lastName: string;
    last_name?: string;
    email: string;
    role: 'staff' | 'admin';
    title?: string;
    honorific?: string;
    prefix?: string;
    position?: string;
    position_title?: string;
    department?: string;
    avatarUrl?: string;
    joinedAt?: string;
    created_at?: string;
    staffProfile?: StaffProfile;
    bankAccount?: BankAccount;
    isTwoFactorEnabled?: boolean;
}

export interface StaffProfile {
    address?: string;
    staff_type?: string;
    phone?: string;
    emergency_contact?: string;
}

export interface BankAccount {
    bank_name: string;
    account_number: string;
    routing_number?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    data: {
        accessToken: string;
        refreshToken: string;
        user: User;
    };
}

// Application Types
export interface Application {
    id: string;
    type: 'leave' | 'transfer' | 'training' | 'loan';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at?: string;
    user?: User;
    details?: Record<string, any>;
}

// Notification Types
export interface Notification {
    id: number;
    sender: string;
    subject: string;
    body: string;
    read: boolean;
    date: string;
}

// Stats Types
export interface AdminStats {
    users: number;
    pendingApplications: number;
    activeContracts: number;
    activeLoans: number;
}

// Activity Types
export interface Activity {
    id: string;
    action: string;
    actor?: User;
    application_id?: string;
    timestamp: string;
}
