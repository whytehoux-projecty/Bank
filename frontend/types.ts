export enum AuthRole {
  Guest = "guest",
  User = "user",
  Admin = "admin",
}

export type AuthAction = "login" | "register" | "adminLogin";

export interface User {
  id: string;
  username: string;
  email: string;
  userId: string;
  dwollaCustomerUrl: string;
  dwollaCustomerId: string;
  firstName: string;
  lastName: string;
  ssn: string;
  role: AuthRole;
  token?: string; // API authentication token
  refreshToken?: string; // Refresh token for token renewal
  tokenExpiry?: string; // Token expiry timestamp
  isVerified?: boolean; // Email/phone verification status
  twoFactorEnabled?: boolean; // Two-factor authentication enabled
  createdAt?: string; // Account creation date
}

export interface Account {
  id: string;
  userId: string;
  type:
    | "Checking"
    | "Savings"
    | "Credit"
    | "Investment"
    | "Money Market"
    | "CD";
  balance: number;
  availableBalance: number;
  accountNumber: string;
  routingNumber: string;
  interestRate?: number;
  minimumBalance?: number;
  isActive: boolean;
  openedDate: string;
  lastActivity?: string;
  monthlyFee?: number;
  overdraftProtection: boolean;
  nickname?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category: TransactionCategory;
  merchant?: string;
  location?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  reference?: string;
  balance?: number;
  tags?: string[];
  isRecurring?: boolean;
  checkNumber?: string;
}

export enum TransactionCategory {
  GROCERIES = "groceries",
  DINING = "dining",
  GAS = "gas",
  SHOPPING = "shopping",
  ENTERTAINMENT = "entertainment",
  UTILITIES = "utilities",
  HEALTHCARE = "healthcare",
  TRAVEL = "travel",
  EDUCATION = "education",
  INSURANCE = "insurance",
  SALARY = "salary",
  INVESTMENT = "investment",
  TRANSFER = "transfer",
  FEES = "fees",
  OTHER = "other",
}

export interface AccountApplication {
  id: string;
  applicantName: string;
  email: string;
  desiredAccountType: string;
  status: "pending" | "approved" | "rejected";
  dateSubmitted: string;
}

export interface NavLinkItem {
  label: string;
  path: string;
  auth?: AuthRole[]; // Who can see this link
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: number;
}

export interface CreditCard {
  id: string;
  userId: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cardType: "Visa" | "MasterCard" | "American Express" | "Discover";
  creditLimit: number;
  availableCredit: number;
  currentBalance: number;
  minimumPayment: number;
  dueDate: string;
  apr: number;
  rewardsPoints: number;
  status: "active" | "blocked" | "expired" | "cancelled";
  isContactless: boolean;
  lastUsed?: string;
}

export interface Loan {
  id: string;
  userId: string;
  type: "personal" | "auto" | "mortgage" | "business" | "student";
  amount: number;
  remainingBalance: number;
  interestRate: number;
  term: number; // in months
  monthlyPayment: number;
  nextPaymentDate: string;
  originationDate: string;
  maturityDate: string;
  status: "active" | "paid" | "default" | "delinquent";
  collateral?: string;
  purpose?: string;
}

export interface Investment {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  type: "stock" | "bond" | "etf" | "mutual_fund" | "cd" | "savings";
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  purchaseDate: string;
  dividendYield?: number;
  maturityDate?: string;
}

export interface Bill {
  id: string;
  userId: string;
  payeeName: string;
  accountNumber: string;
  amount: number;
  dueDate: string;
  category: string;
  isRecurring: boolean;
  frequency?: "weekly" | "monthly" | "quarterly" | "annually";
  status: "pending" | "scheduled" | "paid" | "overdue";
  autopay: boolean;
  lastPaid?: string;
  nextPayment?: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: "bank_account" | "debit_card" | "credit_card" | "digital_wallet";
  name: string;
  lastFour: string;
  isDefault: boolean;
  expiryDate?: string;
  billingAddress?: Address;
  isVerified: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  amount: number;
  currency: string;
  type: "internal" | "external" | "wire" | "zelle" | "ach";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  scheduledDate?: string;
  completedDate?: string;
  fee?: number;
  memo?: string;
  reference: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  accountAlerts: boolean;
  transactionAlerts: boolean;
  billReminders: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
  statementReady: boolean;
  lowBalance: boolean;
  largeTransaction: boolean;
}

export interface SecuritySettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  loginNotifications: boolean;
  deviceTrust: DeviceTrust[];
  lastPasswordChange: string;
  securityQuestions: SecurityQuestion[];
}

export interface DeviceTrust {
  id: string;
  deviceName: string;
  deviceType: "mobile" | "desktop" | "tablet";
  browser?: string;
  ipAddress: string;
  location?: string;
  isTrusted: boolean;
  lastAccess: string;
  dateAdded: string;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string; // This should be hashed in real implementation
}

export interface BudgetCategory {
  id: string;
  userId: string;
  name: string;
  budgetAmount: number;
  spentAmount: number;
  category: TransactionCategory;
  period: "monthly" | "quarterly" | "yearly";
  alertThreshold: number; // percentage
  color: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category:
    | "emergency"
    | "travel"
    | "home"
    | "car"
    | "education"
    | "retirement"
    | "other";
  priority: "low" | "medium" | "high";
  isActive: boolean;
  createdDate: string;
  linkedAccountId?: string;
}

export interface FinancialInsight {
  id: string;
  userId: string;
  type:
    | "spending_pattern"
    | "saving_opportunity"
    | "budget_alert"
    | "investment_tip";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  category?: string;
  actionable: boolean;
  dismissed: boolean;
  createdDate: string;
  expiryDate?: string;
}
