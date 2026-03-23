/**
 * JP Heritage Bank — Constants
 * Central location for all application constants
 */

export const BANK_INFO = {
    name: 'JP Heritage Bank',
    shortName: 'JP Heritage',
    portalName: 'Heritage Vault',
    tagline: 'Trusted for Generations. Built for Tomorrow.',
    founded: 1888,
    phone: '1-800-574-3748',
    phoneDisplay: '1-800-JPH-ERIT',
    email: 'support@jpheritage.com',
    address: '1 Heritage Plaza, New York, NY 10005',
    fdic: 'Member FDIC. Equal Housing Lender.',
    routing: '021000089',
} as const;

export const ROUTES = {
    home: '/',
    personalBanking: '/personal-banking',
    businessBanking: '/business-banking',
    about: '/about',
    contact: '/contact',
    apply: '/apply',
    signup: '/signup',
    terms: '/terms',
    privacy: '/privacy',
    // Heritage Vault (e-banking portal) routes
    vault: process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000',
    login: process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000',
    forgotPassword: `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/forgot-password`,
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
    wealth: 'Wealth Management',
    business: 'Business Checking',
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
