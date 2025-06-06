// Note: Inline styles are used for animation delays to create progressive reveal effects
// These provide dynamic timing that cannot be achieved with static CSS classes
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS } from "../constants";
import { Account, Transaction } from "../types";
import {
  CreditCardIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  SparklesIcon,
  PaperAirplaneIcon,
} from "../constants";
import { AnimatedSection } from "../components/AnimatedSection";

const AccountCard: React.FC<{ account: Account; index: number }> = ({
  account,
  index: _index, // Mark as intentionally unused
}) => {
  const getAccountIcon = (type: string) => {
    if (type.toLowerCase().includes("saving")) return BanknotesIcon;
    if (type.toLowerCase().includes("checking")) return CreditCardIcon;
    return BanknotesIcon;
  };

  const Icon = getAccountIcon(account.type);

  return (
    <AnimatedSection>
      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-xl hover-lift border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {account.type}
              </h3>
              <p className="text-gray-500 text-sm">
                ****{account.accountNumber.slice(-4)}
              </p>
            </div>
          </div>
          <button
            className="text-[#A41E22] hover:text-[#8C1A1F] transition-colors"
            title="View Account Analytics"
          >
            <ChartBarIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="text-right">
          <p className="text-gray-600 text-sm">Available Balance</p>
          <p className="text-4xl font-bold text-gray-900">
            $
            {account.balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="flex space-x-3 mt-6">
          <button className="flex-1 bg-[#A41E22] hover:bg-[#8C1A1F] text-white py-2 px-4 rounded-lg font-semibold transition-colors">
            Transfer
          </button>
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-colors">
            Statements
          </button>
        </div>
      </div>
    </AnimatedSection>
  );
};

const TransactionRow: React.FC<{ transaction: Transaction; index: number }> = ({
  transaction,
  index: _index, // Mark as intentionally unused
}) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
    <td className="p-4">
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <ArrowsRightLeftIcon
            className={`h-5 w-5 ${
              transaction.type === "credit" ? "text-green-600" : "text-red-600"
            }`}
          />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {transaction.description}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(transaction.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </td>
    <td className="p-4 text-right">
      <p
        className={`font-bold text-lg ${
          transaction.type === "credit" ? "text-green-600" : "text-red-600"
        }`}
      >
        {transaction.type === "credit" ? "+" : "-"}$
        {Math.abs(transaction.amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}
      </p>
    </td>
  </tr>
);

const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  onClick?: () => void;
}> = ({ title, description, icon: Icon, color, onClick }) => (
  <AnimatedSection>
    <button
      onClick={onClick}
      className="w-full text-left p-6 bg-white rounded-2xl shadow-lg hover-lift border border-gray-100 transition-all duration-300"
    >
      <div
        className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mb-4`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </button>
  </AnimatedSection>
);

const UserDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  // In a real app, filter accounts and transactions by currentUser.id
  const userAccounts = MOCK_ACCOUNTS; // Assuming all mock accounts belong to the logged-in user for demo
  const userTransactions = MOCK_TRANSACTIONS.filter((t) =>
    userAccounts.map((a) => a.id).includes(t.accountId)
  );

  const [transferAmount, setTransferAmount] = useState("");
  const [transferTo, setTransferTo] = useState(
    userAccounts.length > 1
      ? userAccounts[1].id
      : userAccounts.length === 1
      ? ""
      : ""
  );
  const [transferFrom, setTransferFrom] = useState(
    userAccounts.length > 0 ? userAccounts[0].id : ""
  );
  const [transferMessage, setTransferMessage] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferring(true);
    setTransferMessage("");

    if (
      !transferAmount ||
      !transferTo ||
      !transferFrom ||
      parseFloat(transferAmount) <= 0
    ) {
      setTransferMessage(
        "Please fill all fields, ensure a recipient is selected, and enter a valid amount."
      );
      setIsTransferring(false);
      return;
    }
    if (transferFrom === transferTo) {
      setTransferMessage("Cannot transfer to the same account.");
      setIsTransferring(false);
      return;
    }
    // Mock transfer logic
    setTimeout(() => {
      setTransferMessage(
        `Successfully initiated transfer of $${transferAmount} from account ...${MOCK_ACCOUNTS.find(
          (a) => a.id === transferFrom
        )?.accountNumber.slice(-4)} to ...${MOCK_ACCOUNTS.find(
          (a) => a.id === transferTo
        )?.accountNumber.slice(-4)}.`
      );
      setTransferAmount("");
      setIsTransferring(false);
      setTimeout(() => setTransferMessage(""), 5000);
    }, 1000);
  };

  if (!currentUser) {
    return (
      <p className="text-center text-xl text-gray-600 anim-fadeIn">
        Loading user data...
      </p>
    );
  }

  return (
    <div className="space-y-12 py-2 anim-fadeInUp">
      {/* Welcome Banner with Banking Image */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        <div
          className="h-64 bg-cover bg-center relative"
          style={{ backgroundImage: "url('/images/family-banking.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          <div className="relative z-10 h-full flex items-center p-8">
            <div>
              <h1
                className="text-5xl font-bold text-white anim-fadeInUp mb-2"
                style={{ animationDelay: "0.1s" }}
              >
                Welcome back, {currentUser.username}!
              </h1>
              <p
                className="text-xl text-white/90 anim-slideInLeft"
                style={{ animationDelay: "0.2s" }}
              >
                Your trusted digital banking partner
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Account Summary */}
      <section className="anim-fadeInUp" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-2xl font-semibold mb-6 text-[#A41E22]">
          Your Accounts
        </h2>{" "}
        {/* Zenith Red */}
        {userAccounts.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {userAccounts.map((acc, index) => (
              <AccountCard key={acc.id} account={acc} index={index} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-6 rounded-lg shadow">
            No accounts found. You can apply for one through our AI Assistant or
            the main portal.
          </p>
        )}
      </section>
      {/* Quick Transfer (Mock) */}
      {userAccounts.length > 0 && (
        <section
          className="bg-white p-6 rounded-lg shadow-xl anim-fadeInUp"
          style={{ animationDelay: "0.3s" }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-[#A41E22]">
            Quick Transfer
          </h2>{" "}
          {/* Zenith Red */}
          {transferMessage && (
            <p
              className={`mb-4 p-3 rounded text-sm anim-fadeIn ${
                transferMessage.startsWith("Success")
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {transferMessage}
            </p>
          )}
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="transferFrom"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  From Account
                </label>
                <select
                  id="transferFrom"
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none transition-shadow"
                >
                  {" "}
                  {/* Zenith Red focus */}
                  {userAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.type} ({acc.accountNumber}) - Balance: $
                      {acc.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="transferTo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  To Account
                </label>
                <select
                  id="transferTo"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none transition-shadow"
                  /* Zenith Red focus */ disabled={userAccounts.length < 2}
                >
                  {userAccounts.length < 2 && (
                    <option value="">No other account available</option>
                  )}
                  {userAccounts
                    .filter((acc) => acc.id !== transferFrom)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.type} ({acc.accountNumber})
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="transferAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount ($)
              </label>
              <input
                type="number"
                id="transferAmount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none transition-shadow"
              />{" "}
              {/* Zenith Red focus */}
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-[#A41E22] hover:bg-[#8C1A1F] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
              /* Zenith Red button */ disabled={
                (userAccounts.length < 2 && transferTo === "") || isTransferring
              }
            >
              {isTransferring ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Initiate Transfer"
              )}
            </button>
          </form>
        </section>
      )}
      {/* Quick Actions */}
      <section className="anim-fadeInUp" style={{ animationDelay: "0.35s" }}>
        <h2 className="text-2xl font-semibold mb-6 text-[#A41E22]">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            title="Apply for Credit Card"
            description="Get instant approval with competitive rates"
            icon={CreditCardIcon}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            onClick={() => navigate("/credit-cards")}
          />
          <QuickActionCard
            title="View Statements"
            description="Download and manage your account statements"
            icon={DocumentTextIcon}
            color="bg-gradient-to-br from-green-500 to-green-600"
            onClick={() => {
              /* Navigate to statements */
            }}
          />
          <QuickActionCard
            title="Investment Options"
            description="Explore investment opportunities and portfolios"
            icon={ChartBarIcon}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            onClick={() => navigate("/investments")}
          />
          <QuickActionCard
            title="Loan Applications"
            description="Apply for personal, auto, or home loans"
            icon={BuildingLibraryIcon}
            color="bg-gradient-to-br from-[#A41E22] to-[#8C1A1F]"
            onClick={() => navigate("/loans")}
          />
        </div>
      </section>
      {/* AI Banking Assistant */}
      <section
        className="bg-gradient-to-br from-[#A41E22] to-[#8C1A1F] p-8 rounded-2xl shadow-2xl text-white anim-fadeInUp"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">NovaBank AI Assistant</h2>
              <p className="text-white/80">
                Your 24/7 digital banking companion
              </p>
            </div>
          </div>
          <button
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
            title="Chat with AI Assistant"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            <span>Start Chat</span>
          </button>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">
            How can I help you today?
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="text-left p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <div className="font-medium mb-1">Account Balance</div>
              <div className="text-sm text-white/80">
                Check balances and transactions
              </div>
            </button>
            <button className="text-left p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <div className="font-medium mb-1">Transfer Money</div>
              <div className="text-sm text-white/80">
                Send money to friends & family
              </div>
            </button>
            <button className="text-left p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <div className="font-medium mb-1">Financial Advice</div>
              <div className="text-sm text-white/80">
                Get personalized financial tips
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Financial Insights with Banking Image */}
      <section
        className="relative overflow-hidden rounded-2xl shadow-xl anim-fadeInUp"
        style={{ animationDelay: "0.42s" }}
      >
        <div
          className="h-80 bg-cover bg-center relative"
          style={{ backgroundImage: "url('/images/modern-office.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#A41E22]/90 via-[#8C1A1F]/80 to-transparent"></div>
          <div className="relative z-10 h-full flex items-center p-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Your Financial Journey
              </h2>
              <p className="text-xl text-white/90 mb-6">
                Track your progress and make informed decisions with our
                AI-powered insights
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">4.8%</div>
                  <div className="text-sm text-white/80">Savings Growth</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">$2.1K</div>
                  <div className="text-sm text-white/80">Monthly Savings</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">95%</div>
                  <div className="text-sm text-white/80">Goal Progress</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">A+</div>
                  <div className="text-sm text-white/80">Credit Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Protection */}
      <section
        className="bg-white p-8 rounded-2xl shadow-xl anim-fadeInUp"
        style={{ animationDelay: "0.45s" }}
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Account Security
            </h2>
            <p className="text-gray-600">
              Your account is protected with bank-grade security
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              256-bit SSL Encryption
            </h3>
            <p className="text-gray-600 text-sm">
              All data transmitted is encrypted with industry-standard security
            </p>
          </div>
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircleIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Multi-Factor Authentication
            </h3>
            <p className="text-gray-600 text-sm">
              Additional layers of security protect your account access
            </p>
          </div>
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              AI Fraud Detection
            </h3>
            <p className="text-gray-600 text-sm">
              Advanced AI monitors transactions for suspicious activity 24/7
            </p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">
                Account Status: Secure
              </span>
            </div>
            <button className="text-[#A41E22] hover:text-[#8C1A1F] font-medium transition-colors">
              Review Security Settings →
            </button>
          </div>
        </div>
      </section>
      {/* Transaction History */}
      <section className="anim-fadeInUp" style={{ animationDelay: "0.4s" }}>
        <h2 className="text-2xl font-semibold mb-6 text-[#A41E22]">
          Recent Transactions
        </h2>{" "}
        {/* Zenith Red */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-100">
                {" "}
                {/* Lighter gray for Zenith header */}
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userTransactions.length > 0 ? (
                  userTransactions
                    .slice(0, 10)
                    .map((txn, index) => (
                      <TransactionRow
                        key={txn.id}
                        transaction={txn}
                        index={index}
                      />
                    )) // Show top 10
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {userTransactions.length > 10 && (
          <p className="text-center mt-6">
            <a
              href="#/transactions"
              className="text-[#A41E22] hover:underline font-medium"
            >
              View all transactions &rarr;
            </a>
          </p>
        )}{" "}
        {/* Zenith Red */}
      </section>
    </div>
  );
};

export default UserDashboardPage;
