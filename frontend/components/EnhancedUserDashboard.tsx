import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { formatCurrency, formatDate, cn } from "../lib/utils";
import { useAuth } from "../App";
import { useRouter } from "next/navigation";
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS } from "../constants";
import { portalClasses } from "../theme";
import { SecurityIndicator } from "./PortalHeader";
import {
  CreditCardIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CalendarIcon,
  FilterIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
} from "../constants";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const EnhancedUserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");

  // In a real app, filter by currentUser.id
  const userAccounts = MOCK_ACCOUNTS;
  const userTransactions = MOCK_TRANSACTIONS.filter((t) =>
    userAccounts.map((a) => a.id).includes(t.accountId)
  );

  // Calculate total balance and spending
  const totalBalance = userAccounts.reduce(
    (sum, account) => sum + account.availableBalance,
    0
  );
  const monthlySpending = userTransactions
    .filter(
      (t) =>
        t.type === "debit" &&
        new Date(t.date).getMonth() === new Date().getMonth()
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Mock data for charts - TODO: Replace with real-time data
  const spendingTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
    const dayTransactions = userTransactions.filter(
      (t) =>
        new Date(t.date).toDateString() === date.toDateString() &&
        t.type === "debit"
    );
    const dailySpending = dayTransactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount: dailySpending || Math.floor(Math.random() * 300) + 50, // Fallback to mock if no real data
    };
  });

  // Real-time spending by category based on actual transaction data
  const realTimeSpendingByCategory = userTransactions
    .filter(
      (t) =>
        t.type === "debit" &&
        new Date(t.date).getMonth() === new Date().getMonth()
    )
    .reduce((acc, transaction) => {
      // Simple categorization based on transaction description
      let category = "Other";
      const desc = transaction.description.toLowerCase();

      if (
        desc.includes("grocery") ||
        desc.includes("supermarket") ||
        desc.includes("food")
      ) {
        category = "Groceries";
      } else if (
        desc.includes("restaurant") ||
        desc.includes("dining") ||
        desc.includes("cafe")
      ) {
        category = "Dining";
      } else if (
        desc.includes("gas") ||
        desc.includes("uber") ||
        desc.includes("taxi")
      ) {
        category = "Transport";
      } else if (
        desc.includes("store") ||
        desc.includes("shop") ||
        desc.includes("retail")
      ) {
        category = "Shopping";
      } else if (
        desc.includes("movie") ||
        desc.includes("entertainment") ||
        desc.includes("netflix")
      ) {
        category = "Entertainment";
      }

      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

  const spendingByCategory =
    Object.entries(realTimeSpendingByCategory).length > 0
      ? Object.entries(realTimeSpendingByCategory).map(
          ([name, value], index) => ({
            name,
            value,
            color: ["#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#EC4899"][
              index % 5
            ],
          })
        )
      : [
          { name: "Groceries", value: 450, color: "#10B981" },
          { name: "Dining", value: 320, color: "#F59E0B" },
          { name: "Shopping", value: 280, color: "#8B5CF6" },
          { name: "Transport", value: 180, color: "#EF4444" },
          { name: "Entertainment", value: 150, color: "#EC4899" },
        ];

  const mockInsights = [
    {
      id: "1",
      title: "Spending Alert",
      description: "You've spent 15% more on dining this month",
      type: "warning",
      impact: "medium",
    },
    {
      id: "2",
      title: "Saving Opportunity",
      description:
        "You could save $120/month by switching to our high-yield savings",
      type: "success",
      impact: "high",
    },
  ];

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock transfer logic
    console.log("Transfer:", { transferFrom, transferTo, transferAmount });
    // Reset form
    setTransferAmount("");
    setTransferFrom("");
    setTransferTo("");
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#A41E22] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser.firstName || currentUser.username}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your money today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <div className="relative">
            <BellIcon className="h-6 w-6 text-gray-600 cursor-pointer hover:text-[#A41E22] transition-colors" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="h-8 w-8 p-0"
            >
              {balanceVisible ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balanceVisible ? formatCurrency(totalBalance) : "••••••"}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUpIcon className="h-3 w-3 mr-1" />
              +2.5% from last month
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#A41E22]/10 to-transparent rounded-bl-3xl" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Spending
            </CardTitle>
            <TrendingDownIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlySpending)}
            </div>
            <p className="text-xs text-red-600 flex items-center mt-1">
              <ArrowUpRightIcon className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-3xl" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52%</div>
            <Progress value={52} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">
              {formatCurrency(5200)} of {formatCurrency(10000)}
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-3xl" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">785</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUpIcon className="h-3 w-3 mr-1" />
              Excellent
            </p>
            <p className="text-xs text-gray-600">+15 points this month</p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-3xl" />
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Analytics & Accounts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spending Analytics with AI Insights */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Spending Analytics
                  </CardTitle>
                  <CardDescription>
                    Your spending patterns with AI-powered insights
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <SparklesIcon className="h-4 w-4 mr-2 text-[#A41E22]" />
                  AI Insights
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="trend" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="trend">Spending Trend</TabsTrigger>
                  <TabsTrigger value="categories">By Category</TabsTrigger>
                  <TabsTrigger value="insights">AI Insights</TabsTrigger>
                </TabsList>
                <TabsContent value="trend" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spendingTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#A41E22"
                          strokeWidth={2}
                          dot={{ fill: "#A41E22" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Quick AI Insight for Trend */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <SparklesIcon className="h-5 w-5 text-[#A41E22] mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm text-blue-900">
                          AI Trend Analysis
                        </h4>
                        <p className="text-xs text-blue-700 mt-1">
                          Your spending has increased by 12% this month,
                          primarily driven by dining expenses. Consider setting
                          a monthly dining budget to optimize your spending.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="categories" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={spendingByCategory}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {spendingByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {spendingByCategory.map((category) => (
                      <div
                        key={category.name}
                        className="flex items-center space-x-2"
                      >
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            category.name === "Groceries" && "bg-emerald-500",
                            category.name === "Dining" && "bg-amber-500",
                            category.name === "Shopping" && "bg-violet-500",
                            category.name === "Transport" && "bg-red-500",
                            category.name === "Entertainment" && "bg-pink-500"
                          )}
                        />
                        <span className="text-sm">{category.name}</span>
                        <span className="text-sm font-semibold ml-auto">
                          {formatCurrency(category.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Quick AI Insight for Categories */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <SparklesIcon className="h-5 w-5 text-[#A41E22] mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm text-green-900">
                          Smart Category Insight
                        </h4>
                        <p className="text-xs text-green-700 mt-1">
                          Groceries represent your largest expense category.
                          Consider meal planning to reduce costs by an estimated
                          $80/month.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="insights" className="space-y-4">
                  <div className="space-y-4">
                    {mockInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className={cn(
                          "p-4 rounded-lg border-l-4",
                          insight.type === "warning"
                            ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-l-yellow-400 border border-yellow-200"
                            : "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-blue-400 border border-blue-200"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <SparklesIcon className="h-5 w-5 text-[#A41E22] mt-0.5" />
                            <div>
                              <h4
                                className={cn(
                                  "font-semibold text-sm",
                                  insight.type === "warning"
                                    ? "text-yellow-900"
                                    : "text-blue-900"
                                )}
                              >
                                {insight.title}
                              </h4>
                              <p
                                className={cn(
                                  "text-xs mt-1",
                                  insight.type === "warning"
                                    ? "text-yellow-700"
                                    : "text-blue-700"
                                )}
                              >
                                {insight.description}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              insight.impact === "high"
                                ? "destructive"
                                : insight.impact === "medium"
                                ? "warning"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Learn More
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs">
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Additional AI-Powered Recommendations */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <SparklesIcon className="h-5 w-5 text-[#A41E22] mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-purple-900">
                            Personalized Recommendations
                          </h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                              <span className="text-xs text-purple-700">
                                Switch to cashback credit card
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                +$45/month
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                              <span className="text-xs text-purple-700">
                                Automate savings transfers
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                +$200/month
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                              <span className="text-xs text-purple-700">
                                Refinance auto loan
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                +$85/month
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Transfer */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Transfer</CardTitle>
              <CardDescription>
                Transfer money between your accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      From Account
                    </label>
                    <Select
                      value={transferFrom}
                      onValueChange={setTransferFrom}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {userAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.nickname} -{" "}
                            {formatCurrency(account.availableBalance)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      To Account
                    </label>
                    <Select value={transferTo} onValueChange={setTransferTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {userAccounts
                          .filter((acc) => acc.id !== transferFrom)
                          .map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.nickname}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  <ArrowsRightLeftIcon className="h-4 w-4 mr-2" />
                  Transfer Now
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Accounts Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Accounts</CardTitle>
                  <CardDescription>
                    Manage your banking accounts
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => router.push("/auth")}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {userAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        account.type === "Checking"
                          ? "bg-blue-100"
                          : account.type === "Savings"
                          ? "bg-green-100"
                          : "bg-gray-100"
                      )}
                    >
                      {account.type === "Checking" ? (
                        <CreditCardIcon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <BanknotesIcon className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {account.nickname || account.type} Account
                      </h4>
                      <p className="text-sm text-gray-600">
                        ••••{account.accountNumber.slice(-4)}
                      </p>
                      {account.interestRate && (
                        <p className="text-xs text-green-600">
                          {account.interestRate}% APY
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {balanceVisible
                        ? formatCurrency(account.availableBalance)
                        : "••••••"}
                    </p>
                    <Badge
                      variant={account.isActive ? "success" : "secondary"}
                      className="text-xs"
                    >
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/bill-pay")}
              >
                <BanknotesIcon className="h-4 w-4 mr-2" />
                Pay Bills
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/dashboard/transactions")}
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Apply for Credit Card
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                View Statements
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/dashboard/investments")}
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Investments
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/dashboard/accounts")}
              >
                <BuildingLibraryIcon className="h-4 w-4 mr-2" />
                Apply for Loan
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions - Real-time */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  Recent Activity
                  <div className="ml-2 h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {userTransactions
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .slice(0, 6)
                .map((transaction) => {
                  const isRecent =
                    new Date().getTime() -
                      new Date(transaction.date).getTime() <
                    24 * 60 * 60 * 1000;
                  return (
                    <div
                      key={transaction.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md transition-colors",
                        isRecent
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center relative",
                            transaction.type === "credit"
                              ? "bg-green-100"
                              : "bg-red-100"
                          )}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowDownLeftIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRightIcon className="h-4 w-4 text-red-600" />
                          )}
                          {isRecent && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-600 flex items-center">
                            {formatDate(transaction.date)}
                            {isRecent && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                New
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "font-semibold text-sm",
                          transaction.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {transaction.type === "credit" ? "+" : "-"}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          {/* Account Summary - Real-time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Account Summary
                <div className="ml-2 h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Active Accounts</span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {userAccounts.filter((acc) => acc.isActive).length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUpIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Monthly Inflow</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(
                      userTransactions
                        .filter(
                          (t) =>
                            t.type === "credit" &&
                            new Date(t.date).getMonth() ===
                              new Date().getMonth()
                        )
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingDownIcon className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Monthly Outflow</span>
                  </div>
                  <span className="font-bold text-red-600">
                    {formatCurrency(
                      userTransactions
                        .filter(
                          (t) =>
                            t.type === "debit" &&
                            new Date(t.date).getMonth() ===
                              new Date().getMonth()
                        )
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Net Position</span>
                  <span
                    className={cn(
                      "font-bold text-sm",
                      userTransactions
                        .filter(
                          (t) =>
                            new Date(t.date).getMonth() ===
                            new Date().getMonth()
                        )
                        .reduce(
                          (sum, t) =>
                            sum +
                            (t.type === "credit"
                              ? t.amount
                              : -Math.abs(t.amount)),
                          0
                        ) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {formatCurrency(
                      Math.abs(
                        userTransactions
                          .filter(
                            (t) =>
                              new Date(t.date).getMonth() ===
                              new Date().getMonth()
                          )
                          .reduce(
                            (sum, t) =>
                              sum +
                              (t.type === "credit"
                                ? t.amount
                                : -Math.abs(t.amount)),
                            0
                          )
                      )
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserDashboard;
