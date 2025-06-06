
export enum AuthRole {
  Guest = 'guest',
  User = 'user',
  Admin = 'admin',
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: AuthRole;
}

export interface Account {
  id: string;
  userId: string;
  type: string; // e.g., 'Savings', 'Checking'
  balance: number;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

export interface AccountApplication {
  id: string;
  applicantName: string;
  email: string;
  desiredAccountType: string;
  status: 'pending' | 'approved' | 'rejected';
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
  sender: 'user' | 'ai';
  timestamp: number;
}