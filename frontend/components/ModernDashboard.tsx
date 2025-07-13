import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
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
} from "@/constants";
import {
  Account,
  Transaction,
  CreditCard,
  Bill,
  Goal,
  FinancialInsight,
  BudgetCategory,
} from "@/types";
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

interface ModernDashboardProps {
  user: any;
  accounts: Account[];
  transactions: Transaction[];
  creditCards?: CreditCard[];
  bills?: Bill[];
  goals?: Goal[];
  insights?: FinancialInsight[];
  budgetCategories?: BudgetCategory[];
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({
  user,
  accounts,
  transactions,
  creditCards = [],
  bills = [],
  goals = [],
  insights = [],
  budgetCategories = [],
}) => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");

  // Calculate total balance
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.availableBalance,
    0
  );
  const totalDebt = creditCards.reduce(
    (sum, card) => sum + card.currentBalance,
    0
  );
  const netWorth = totalBalance - totalDebt;

  // Recent transactions (last 10)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Spending by category for current month
  const currentMonth = new Date().getMonth();
  const monthlySpending = transactions
    .filter(
      (t) => t.type === "debit" && new Date(t.date).getMonth() === currentMonth
    )
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const spendingData = Object.entries(monthlySpending).map(
    ([category, amount]) => ({
      name: category.replace("_", " ").toUpperCase(),
      value: amount,
      color: getColorForCategory(category),
    })
  );

  // Mock spending trend data
  const spendingTrend = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(
      Date.now() - (29 - i) * 24 * 60 * 60 * 1000
    ).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    amount: Math.floor(Math.random() * 500) + 100,
  }));

  function getColorForCategory(category: string): string {
    const colors: Record<string, string> = {
      groceries: "#10B981",
      dining: "#F59E0B",
      gas: "#EF4444",
      shopping: "#8B5CF6",
      entertainment: "#EC4899",
      utilities: "#06B6D4",
      healthcare: "#84CC16",
      travel: "#F97316",
    };
    return colors[category] || "#6B7280";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || user?.username}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your money today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            This Month
          </Button>
          <div className="relative">
            <BellIcon className="h-6 w-6 text-gray-600 cursor-pointer" />
            {insights.length > 0 && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
            )}
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
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balanceVisible ? formatCurrency(netWorth) : "••••••"}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Assets minus liabilities
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-3xl" />
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
              {formatCurrency(
                Object.values(monthlySpending).reduce((a, b) => a + b, 0)
              )}
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
            <CardTitle className="text-sm font-medium">
              Credit Utilization
            </CardTitle>
            <CreditCardIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {creditCards.length > 0
                ? `${Math.round(
                    (totalDebt /
                      creditCards.reduce(
                        (sum, card) => sum + card.creditLimit,
                        0
                      )) *
                      100
                  )}%`
                : "0%"}
            </div>
            <Progress
              value={
                creditCards.length > 0
                  ? (totalDebt /
                      creditCards.reduce(
                        (sum, card) => sum + card.creditLimit,
                        0
                      )) *
                    100
                  : 0
              }
              className="mt-2"
            />
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-3xl" />
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Accounts & Transactions */}
        <div className="lg:col-span-2 space-y-6">
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
                <Button size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {accounts.map((account) => (
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
                          : account.type === "Credit"
                          ? "bg-purple-100"
                          : "bg-gray-100"
                      )}
                    >
                      {account.type === "Checking" ? (
                        <CreditCardIcon className="h-5 w-5 text-blue-600" />
                      ) : account.type === "Savings" ? (
                        <BanknotesIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <ChartBarIcon className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{account.type} Account</h4>
                      <p className="text-sm text-gray-600">
                        ••••{account.accountNumber.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(account.availableBalance)}
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

          {/* Spending Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Analytics</CardTitle>
              <CardDescription>
                Your spending patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="trend" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="trend">Spending Trend</TabsTrigger>
                  <TabsTrigger value="categories">By Category</TabsTrigger>
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
                </TabsContent>
                <TabsContent value="categories" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={spendingData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {spendingData.map((entry, index) => (
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
                    {spendingData.map((category) => (
                      <div
                        key={category.name}
                        className="flex items-center space-x-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                        <span className="text-sm font-semibold ml-auto">
                          {formatCurrency(category.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <ArrowsRightLeftIcon className="h-4 w-4 mr-2" />
                Transfer Money
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Pay Bills
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Investments
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BanknotesIcon className="h-4 w-4 mr-2" />
                Apply for Loan
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
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
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(transaction.date)}
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
              ))}
            </CardContent>
          </Card>

          {/* Financial Goals */}
          {goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{goal.name}</h4>
                      <span className="text-xs text-gray-600">
                        {Math.round(
                          (goal.currentAmount / goal.targetAmount) * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(goal.currentAmount / goal.targetAmount) * 100}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-[#A41E22]" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.slice(0, 2).map((insight) => (
                  <div
                    key={insight.id}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <h4 className="font-medium text-sm text-blue-900">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-blue-700 mt-1">
                      {insight.description}
                    </p>
                    <Badge
                      variant={
                        insight.impact === "high"
                          ? "destructive"
                          : insight.impact === "medium"
                          ? "warning"
                          : "secondary"
                      }
                      className="mt-2 text-xs"
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-600" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">2FA Enabled</span>
                  <Badge variant="success" className="text-xs">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Monitoring</span>
                  <Badge variant="success" className="text-xs">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Secure Browser</span>
                  <Badge variant="success" className="text-xs">
                    Verified
                  </Badge>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" size="sm">
                Review Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;
