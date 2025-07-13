import React from "react";
import {
  NavLinkItem,
  AuthRole,
  Account,
  Transaction,
  User,
  AccountApplication,
  TransactionCategory,
} from "./types";

// Additional modern icons from lucide-react
import {
  Bell,
  Eye,
  EyeOff,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Settings,
  UserCircle,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  BarChart3,
  Shield,
  Home,
  Phone,
  Info,
  LogOut,
  Building,
  FileText,
  Check,
  Clock,
  AlertTriangle,
  Users,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

// AURUM VAULT CUSTOM ICONS

// Aurum Vault Logo Icon - Luxury Vault Design
export const AurumVaultIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2L3 7l9 5 9-5-9-5zM21 16l-9 5-9-5M21 12l-9 5-9-5"
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

// Luxury Diamond Icon for Premium Features
export const DiamondIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 3h12l4 6-10 12L2 9l4-6z"
    />
  </svg>
);

// Crown Icon for VIP/Premium Services
export const CrownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 8l6-3 6 3-2 8H7l-2-8zM8 8l4-4 4 4"
    />
    <circle cx="8" cy="8" r="1" fill="currentColor" />
    <circle cx="12" cy="4" r="1" fill="currentColor" />
    <circle cx="16" cy="8" r="1" fill="currentColor" />
  </svg>
);

// Map lucide icons to our constants
export const BellIcon = Bell;
export const EyeIcon = Eye;
export const EyeSlashIcon = EyeOff;
export const PlusIcon = Plus;
export const ArrowUpRightIcon = ArrowUpRight;
export const ArrowDownLeftIcon = ArrowDownLeft;
export const TrendingUpIcon = TrendingUp;
export const TrendingDownIcon = TrendingDown;
export const CalendarIcon = Calendar;
export const FilterIcon = Filter;
export const SettingsIcon = Settings;

// Add missing icons
export const CheckIcon = Check;
export const ClockIcon = Clock;
export const AlertTriangleIcon = AlertTriangle;
export const UsersIcon = Users;
export const GlobeAltIcon = Globe;
export const ChevronDownIcon = ChevronDown;
export const ChevronUpIcon = ChevronUp;
export const XMarkIcon = X;
export const CheckCircleIcon = CheckCircle;
export const ChatBubbleBottomCenterTextIcon = MessageSquare;

// Update existing icons to use lucide-react versions
export const CreditCardIcon = CreditCard;
export const BanknotesIcon = Banknote;
export const ArrowsRightLeftIcon = ArrowLeftRight;
export const ChartBarIcon = BarChart3;
export const ShieldCheckIcon = Shield;

// UPDATED: Replace SparklesIcon with AurumVaultIcon as primary brand icon
export const SparklesIcon = AurumVaultIcon;
export const HomeIcon = Home;
export const PhoneIcon = Phone;
export const InformationCircleIcon = Info;
export const UserCircleIcon = UserCircle;
export const CogIcon = Settings;
export const ArrowRightOnRectangleIcon = LogOut;
export const BuildingLibraryIcon = Building;
export const DocumentTextIcon = FileText;

export const PaperAirplaneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
    />
  </svg>
);

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc1",
    userId: "user1",
    type: "Checking",
    balance: 12750.55,
    availableBalance: 12750.55,
    accountNumber: "1234567890123456",
    routingNumber: "123456789",
    isActive: true,
    openedDate: "2023-01-15",
    overdraftProtection: true,
    nickname: "Aurum Everyday",
  },
  {
    id: "acc2",
    userId: "user1",
    type: "Savings",
    balance: 55200.0,
    availableBalance: 55200.0,
    accountNumber: "1234567890125678",
    routingNumber: "123456789",
    interestRate: 4.25,
    isActive: true,
    openedDate: "2023-01-15",
    overdraftProtection: false,
    nickname: "Aurum Vault Savings",
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn1",
    accountId: "acc1",
    date: "2024-07-20",
    description: "Online Shopping - Amazon",
    amount: -75.99,
    type: "debit",
    category: TransactionCategory.SHOPPING,
    status: "completed",
  },
  {
    id: "txn2",
    accountId: "acc1",
    date: "2024-07-19",
    description: "Salary Deposit",
    amount: 2500.0,
    type: "credit",
    category: TransactionCategory.SALARY,
    status: "completed",
  },
  {
    id: "txn3",
    accountId: "acc1",
    date: "2024-07-18",
    description: "Aurum Café",
    amount: -12.5,
    type: "debit",
    category: TransactionCategory.DINING,
    status: "completed",
  },
  {
    id: "txn4",
    accountId: "acc2",
    date: "2024-07-15",
    description: "Interest Payment",
    amount: 45.2,
    type: "credit",
    category: TransactionCategory.OTHER,
    status: "completed",
  },
  {
    id: "txn5",
    accountId: "acc1",
    date: "2024-07-15",
    description: "Transfer to Aurum Savings",
    amount: -500.0,
    type: "debit",
    category: TransactionCategory.TRANSFER,
    status: "completed",
  },
  {
    id: "txn6",
    accountId: "acc2",
    date: "2024-07-15",
    description: "Transfer from Aurum Everyday",
    amount: 500.0,
    type: "credit",
    category: TransactionCategory.TRANSFER,
    status: "completed",
  },
];

export const MOCK_USERS: User[] = [
  {
    id: "user1",
    username: "john.doe",
    email: "john.doe@example.com",
    userId: "user1",
    dwollaCustomerUrl: "https://api.dwolla.com/customers/user1",
    dwollaCustomerId: "customer1",
    role: AuthRole.User,
    firstName: "John",
    lastName: "Doe",
    ssn: "1234",
    isVerified: true,
    twoFactorEnabled: true,
    createdAt: "2023-01-15",
  },
  {
    id: "admin1",
    username: "admin",
    email: "admin@aurumvault.com",
    userId: "admin1",
    dwollaCustomerUrl: "https://api.dwolla.com/customers/admin1",
    dwollaCustomerId: "customerAdmin1",
    role: AuthRole.Admin,
    firstName: "Admin",
    lastName: "User",
    ssn: "9999",
    isVerified: true,
    twoFactorEnabled: true,
    createdAt: "2023-01-01",
  },
];

export const MOCK_APPLICATIONS: AccountApplication[] = [
  {
    id: "app1",
    applicantName: "Jane Smith",
    email: "jane.smith@example.com",
    desiredAccountType: "Checking",
    status: "pending",
    dateSubmitted: "2024-07-18",
  },
  {
    id: "app2",
    applicantName: "Robert Brown",
    email: "robert.brown@example.com",
    desiredAccountType: "Savings",
    status: "approved",
    dateSubmitted: "2024-07-15",
  },
];

export const INFO_SECTIONS = {
  about: {
    title: "About Aurum Vault",
    content: `Aurum Vault is the pinnacle of luxury banking, redefining financial excellence through sophisticated wealth management and unparalleled client service. Founded on the principles of discretion, innovation, and exclusivity, we cater to discerning clients who demand the finest in private banking. Our cutting-edge technology seamlessly integrates with personalized concierge services to deliver an exceptional banking experience that transcends traditional financial institutions.`,
  },
  mission: {
    title: "Our Mission & Vision",
    content: `Our mission is to provide ultra-high-net-worth individuals and families with sophisticated financial solutions that preserve and grow generational wealth. We envision a future where luxury banking combines cutting-edge technology with white-glove service, creating bespoke financial experiences that adapt to our clients' evolving needs and aspirations.`,
  },
  services: {
    title: "Our Services",
    content: `Aurum Vault offers an exclusive suite of premium financial services including private banking, investment management, wealth planning, family office services, and bespoke lending solutions. Our AI-powered wealth platform provides real-time portfolio insights and personalized recommendations, while our dedicated relationship managers ensure every client receives exceptional, tailored service.`,
  },
  security: {
    title: "Security & Trust",
    content: `Your security and privacy are paramount. We employ military-grade encryption, biometric authentication, and advanced threat detection systems to safeguard your wealth and personal information. All deposits are FDIC insured up to applicable limits, with additional private insurance coverage. Our Swiss-bank-level discretion ensures your financial affairs remain completely confidential.`,
  },
};

export const NAV_LINKS: NavLinkItem[] = [
  // Corporate Website Pages
  {
    label: "Home",
    path: "/",
    icon: HomeIcon,
  },
  {
    label: "About",
    path: "/corporate/about",
    icon: InformationCircleIcon,
  },
  {
    label: "Contact",
    path: "/corporate/contact",
    icon: PhoneIcon,
  },

  // E-Banking Portal Access
  {
    label: "E-Banking",
    path: "/e-banking/auth",
    auth: undefined, // Show to everyone, but changes based on auth status
    icon: CreditCardIcon,
  },
  {
    label: "Dashboard",
    path: "/e-banking/dashboard",
    auth: [AuthRole.User],
    icon: ChartBarIcon,
  },
  {
    label: "Admin Portal",
    path: "/e-banking/admin",
    auth: [AuthRole.Admin],
    icon: CogIcon,
  },

  // E-Banking Services (for authenticated users)
  {
    label: "Bill Pay",
    path: "/e-banking/bill-pay",
    auth: [AuthRole.User, AuthRole.Admin],
    icon: BanknotesIcon,
  },
  {
    label: "Credit Cards",
    path: "/e-banking/credit-cards",
    icon: CreditCardIcon,
  },
  {
    label: "Loans",
    path: "/e-banking/loans",
    icon: BanknotesIcon,
  },
  {
    label: "Investments",
    path: "/e-banking/investments",
    icon: TrendingUpIcon,
  },
  {
    label: "Settings",
    path: "/e-banking/settings",
    auth: [AuthRole.User, AuthRole.Admin],
    icon: SettingsIcon,
  },
];

// AURUM VAULT WEBSITE THEME CLASSES
export const websiteClasses = {
  // Updated to use Aurum Vault navy/gold theme
  primaryBg: "bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900",
  primaryText: "text-gold-400",
  accentBg: "bg-gradient-to-r from-gold-500 to-gold-400",
  accentText: "text-navy-900",
  glassEffect: "backdrop-blur-md bg-white/10 border border-white/20",
  luxuryShadow: "shadow-luxury",
  metallicText:
    "bg-metallic-gold bg-clip-text text-transparent animate-metallic-sheen",
  glassCard: "bg-white/10 backdrop-blur-md border border-white/20 shadow-glass",
  neuropButton:
    "shadow-neuro-raised hover:shadow-neuro-inset transition-all duration-200",
};

// AURUM VAULT BRANDING CONSTANTS
export const AURUM_BRANDING = {
  name: "Aurum Vault",
  tagline: "Luxury Banking Redefined",
  description:
    "Experience the pinnacle of private banking with sophisticated wealth management solutions tailored for discerning clients.",
  colors: {
    primary: "#D5B978", // Gold 500
    secondary: "#161A20", // Navy 900
    accent: "#E4CFA1", // Gold 400
    background: "#0E1014", // Navy 950
  },
  features: [
    "Private Banking Excellence",
    "Concierge Financial Services",
    "Premium Investment Solutions",
    "Exclusive Client Benefits",
    "Global Wealth Management",
    "Ultra-Secure Transactions",
  ],
};
