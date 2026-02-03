/**
 * AURUM VAULT - Constants
 * Central location for all application constants
 */

export const BANK_INFO = {
    name: 'AURUM VAULT',
    tagline: 'Banking Without Boundaries',
    founded: 1888,
    phone: '1-800-AURUM-88',
    email: 'support@aurumvault.com',
} as const;

export const ROUTES = {
    home: '/',
    personalBanking: '/personal-banking',
    businessBanking: '/business-banking',
    about: '/about',
    // Login now redirects to e-banking portal
    login: process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000',
    signup: '/signup',
    forgotPassword: '/forgot-password',
    // E-Banking routes (external portal)
    dashboard: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/dashboard`,
    transfer: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/transfer`,
    transactions: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/transactions`,
    accounts: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/accounts`,
    cards: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/cards`,
    bills: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/bills`,
    beneficiaries: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/beneficiaries`,
    statements: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/statements`,
    settings: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/settings`,
    support: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/support`,
} as const;

export const ACCOUNT_TYPES = {
    checking: 'Checking Account',
    savings: 'Savings Account',
    credit: 'Credit Card',
    loan: 'Personal Loan',
} as const;

export const TRANSACTION_TYPES = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    transfer: 'Transfer',
    payment: 'Payment',
    fee: 'Fee',
} as const;

export const TRANSACTION_STATUS = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
} as const;
