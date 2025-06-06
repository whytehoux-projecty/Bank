import React from "react";
import {
  NavLinkItem,
  AuthRole,
  Account,
  Transaction,
  User,
  AccountApplication,
} from "./types";

// SVG Icons (Heroicons Outline)
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"
    />
  </svg>
);

export const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
    />
  </svg>
);

export const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
    />
  </svg>
);

export const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export const CogIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15.036-7.026A7.5 7.5 0 004.5 12m0 0a7.5 7.5 0 013.474-.974M3 12h1.5m13.5 0h1.5m-16.5 0a7.5 7.5 0 003.474.974m11.552 0A7.5 7.5 0 0119.5 12M4.5 4.5v.75A7.5 7.5 0 0112 3.75v-.75A7.5 7.5 0 004.5 4.5zm0 15v-.75A7.5 7.5 0 0012 20.25v.75A7.5 7.5 0 014.5 19.5zm15-15v.75A7.5 7.5 0 0012 3.75v-.75A7.5 7.5 0 0119.5 4.5zm0 15v-.75A7.5 7.5 0 0112 20.25v.75A7.5 7.5 0 0019.5 19.5z"
    />
  </svg>
);

export const ArrowRightOnRectangleIcon = (
  props: React.SVGProps<SVGSVGElement>
) => (
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
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
    />
  </svg>
);

export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188l-1.25-2.188a2.25 2.25 0 00-1.635-1.635L12 9.75l2.188-1.25a2.25 2.25 0 001.635-1.635L17 4.688l1.25 2.188a2.25 2.25 0 001.635 1.635L22.25 9.75l-2.188 1.25a2.25 2.25 0 00-1.635 1.635z"
    />
  </svg>
);

export const PaperAirplaneIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
    />
  </svg>
);

export const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
);

export const ChevronUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M4.5 15.75l7.5-7.5 7.5 7.5"
    />
  </svg>
);

export const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
    />
  </svg>
);

export const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H4.5m-1.25 0H3c-.621 0-1.125.504-1.125 1.125v.375m1.25 0v3.75m0 0h.75a.75.75 0 01.75.75v.75h.75a.75.75 0 01.75.75v.75H6a.75.75 0 01-.75-.75v-.75a.75.75 0 00-.75-.75h-.75v-3.75zm2.25 0v3.75m0 0a.75.75 0 01-.75.75h-.75m.75-.75V12a.75.75 0 01.75-.75h.75m-1.5 1.5v.375c0 .621.504 1.125 1.125 1.125h.75c.621 0 1.125-.504 1.125-1.125v-.375m-3 0v-.375c0-.621.504-1.125 1.125-1.125h.75c.621 0 1.125.504 1.125 1.125v.375m-3 0h3"
    />
  </svg>
);

export const ArrowsRightLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
    />
  </svg>
);

export const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  </svg>
);

export const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);

export const BuildingLibraryIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
    />
  </svg>
);

export const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

export const ChatBubbleBottomCenterTextIcon = (
  props: React.SVGProps<SVGSVGElement>
) => (
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
      d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
    />
  </svg>
);

export const GlobeAltIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9zm0 0V9m0 12l-8.716-6.747M12 21l8.716-6.747M12 9l8.716 6.747M12 9L3.284 15.747M12 9l-8.716 6.747"
    />
  </svg>
);

export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
    />
  </svg>
);

// Navigation Links
export const GUEST_NAV_LINKS: NavLinkItem[] = [
  {
    label: "Home",
    path: "/",
    icon: HomeIcon,
    auth: [AuthRole.Guest, AuthRole.User, AuthRole.Admin],
  },
  {
    label: "About NovaBank",
    path: "/info",
    icon: InformationCircleIcon,
    auth: [AuthRole.Guest, AuthRole.User, AuthRole.Admin],
  },
  {
    label: "Credit Cards",
    path: "/credit-cards",
    icon: CreditCardIcon,
    auth: [AuthRole.Guest, AuthRole.User, AuthRole.Admin],
  },
  {
    label: "Loans",
    path: "/loans",
    icon: BanknotesIcon,
    auth: [AuthRole.Guest, AuthRole.User, AuthRole.Admin],
  },
  {
    label: "Investments",
    path: "/investments",
    icon: ChartBarIcon,
    auth: [AuthRole.Guest, AuthRole.User, AuthRole.Admin],
  },
  {
    label: "Contact Us",
    path: "/contact",
    icon: PhoneIcon,
    auth: [AuthRole.Guest, AuthRole.User, AuthRole.Admin],
  },
  {
    label: "Login / Register",
    path: "/auth",
    icon: UserCircleIcon,
    auth: [AuthRole.Guest],
  },
];

export const USER_NAV_LINKS: NavLinkItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard/user",
    icon: HomeIcon,
    auth: [AuthRole.User],
  },
];

export const ADMIN_NAV_LINKS: NavLinkItem[] = [
  {
    label: "Admin Dashboard",
    path: "/dashboard/admin",
    icon: CogIcon,
    auth: [AuthRole.Admin],
  },
];

// Mock Data
export const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc1",
    userId: "user1",
    type: "Nova Everyday",
    balance: 12500.75,
    accountNumber: "**** **** **** 1234",
  },
  {
    id: "acc2",
    userId: "user1",
    type: "Nova Savings",
    balance: 55200.0,
    accountNumber: "**** **** **** 5678",
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
  },
  {
    id: "txn2",
    accountId: "acc1",
    date: "2024-07-19",
    description: "Salary Deposit",
    amount: 2500.0,
    type: "credit",
  },
  {
    id: "txn3",
    accountId: "acc1",
    date: "2024-07-18",
    description: "Cafe Nova",
    amount: -12.5,
    type: "debit",
  },
  {
    id: "txn4",
    accountId: "acc2",
    date: "2024-07-15",
    description: "Interest Payment",
    amount: 45.2,
    type: "credit",
  },
  {
    id: "txn5",
    accountId: "acc1",
    date: "2024-07-15",
    description: "Transfer to Nova Savings",
    amount: -500.0,
    type: "debit",
  },
  {
    id: "txn6",
    accountId: "acc2",
    date: "2024-07-15",
    description: "Transfer from Nova Everyday",
    amount: 500.0,
    type: "credit",
  },
];

export const MOCK_USERS: User[] = [
  {
    id: "user1",
    username: "john.doe",
    email: "john.doe@example.com",
    role: AuthRole.User,
  },
  {
    id: "admin1",
    username: "admin",
    email: "admin@novabank.com",
    role: AuthRole.Admin,
  },
];

export const MOCK_APPLICATIONS: AccountApplication[] = [
  {
    id: "app1",
    applicantName: "Jane Smith",
    email: "jane.smith@example.com",
    desiredAccountType: "Nova Everyday",
    status: "pending",
    dateSubmitted: "2024-07-18",
  },
  {
    id: "app2",
    applicantName: "Robert Brown",
    email: "robert.brown@example.com",
    desiredAccountType: "Nova Savings",
    status: "approved",
    dateSubmitted: "2024-07-15",
  },
];

export const INFO_SECTIONS = {
  about: {
    title: "About NovaBank",
    content: `NovaBank is pioneering the future of financial services. Founded on the principles of innovation, security, and customer-centricity, we strive to provide an unparalleled banking experience. Our cutting-edge technology empowers you to manage your finances effortlessly, anytime, anywhere. We believe in transparency and building long-lasting relationships with our customers, helping them achieve their financial goals with confidence.`,
  },
  mission: {
    title: "Our Mission & Vision",
    content: `**Mission:** To empower individuals and businesses with intelligent, accessible, and secure financial solutions that adapt to their evolving needs. We aim to simplify banking through technology, making it intuitive and supportive.
    \n\n**Vision:** To be the leading digital bank, recognized for innovation, trustworthiness, and a commitment to financial well-being. We envision a world where banking is not a chore, but a seamless part of everyday life, enabling greater financial freedom and opportunity for all.`,
  },
  services: {
    title: "Our Services",
    content: `NovaBank offers a comprehensive suite of digital-first banking services:
    \n- **Personal Accounts:** Checking, Savings, High-Yield Deposits.
    \n- **Business Banking:** Tailored solutions for small and medium enterprises.
    \n- **Loans & Credit:** Competitive rates for personal loans, mortgages, and lines of credit. (Coming Soon)
    \n- **Investment Solutions:** AI-powered advisory and diverse investment portfolios. (Coming Soon)
    \n- **24/7 AI Assistance:** Get instant support and financial insights from your personal AI banker.
    \n- **Global Transfers:** Seamless and low-cost international money transfers.`,
  },
};
