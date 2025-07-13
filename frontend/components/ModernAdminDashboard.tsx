import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Users,
  CreditCard,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  UserCheck,
  BarChart3,
  Settings,
  Bell,
} from "lucide-react";
import { useAuth } from "../App";
import { MOCK_USERS, MOCK_ACCOUNTS, MOCK_TRANSACTIONS } from "../constants";
import { formatCurrency, formatDate } from "../lib/utils";

const ModernAdminDashboard: React.FC = () => {
  const { currentUser, applications, updateApplicationStatus } = useAuth();

  // Analytics calculations
  const totalUsers = MOCK_USERS.length;
  const totalAccounts = MOCK_ACCOUNTS.length;
  const totalBalance = MOCK_ACCOUNTS.reduce((sum, acc) => sum + acc.balance, 0);
  const pendingApplications = applications.filter(
    (app) => app.status === "pending"
  ).length;
  const monthlyTransactions = MOCK_TRANSACTIONS.length;
  const averageBalance = totalBalance / totalAccounts;

  const handleApplicationAction = (
    appId: string,
    newStatus: "approved" | "rejected"
  ) => {
    updateApplicationStatus(appId, newStatus);
  };

  const metrics = [
    {
      id: "users",
      title: "Total Users",
      value: totalUsers.toString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      id: "accounts",
      title: "Active Accounts",
      value: totalAccounts.toString(),
      change: "+8%",
      changeType: "positive" as const,
      icon: CreditCard,
      color: "bg-green-500",
    },
    {
      id: "balance",
      title: "Total Deposits",
      value: formatCurrency(totalBalance),
      change: "+15%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "bg-purple-500",
    },
    {
      id: "transactions",
      title: "Monthly Transactions",
      value: monthlyTransactions.toString(),
      change: "-3%",
      changeType: "negative" as const,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  const quickStats = [
    {
      title: "Pending Applications",
      value: pendingApplications,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Average Balance",
      value: formatCurrency(averageBalance),
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Security Alerts",
      value: 2,
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "System Status",
      value: "Online",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentUser?.username}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alerts (2)
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card
              key={metric.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 border-l-[#A41E22]"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                    <p
                      className={`text-sm ${
                        metric.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {metric.change} from last month
                    </p>
                  </div>
                  <div
                    className={`${metric.color} p-3 rounded-full text-white`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <IconComponent className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList className="grid w-full lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Account Applications
              </CardTitle>
              <CardDescription>
                Review and manage new account applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            {app.applicantName}
                          </h3>
                          <Badge
                            variant={
                              app.status === "pending"
                                ? "secondary"
                                : app.status === "approved"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{app.email}</p>
                        <p className="text-sm text-gray-500">
                          {app.desiredAccountType} • Applied{" "}
                          {formatDate(app.dateSubmitted)}
                        </p>
                      </div>
                      {app.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleApplicationAction(app.id, "approved")
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleApplicationAction(app.id, "rejected")
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No applications to review
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </div>
                <Button>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_USERS.map((user) => (
                  <div
                    key={user.id}
                    className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {user.username}
                        </h3>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        Suspend
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Distribution</CardTitle>
                <CardDescription>
                  Breakdown of account types and balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    MOCK_ACCOUNTS.reduce((acc, account) => {
                      const type = account.type;
                      if (!acc[type]) {
                        acc[type] = { count: 0, balance: 0 };
                      }
                      acc[type].count++;
                      acc[type].balance += account.balance;
                      return acc;
                    }, {} as Record<string, { count: number; balance: number }>)
                  ).map(([type, data]) => (
                    <div
                      key={type}
                      className="flex justify-between items-center"
                    >
                      <span className="font-medium">{type}</span>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(data.balance)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {data.count} accounts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Monitor key system metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Server Uptime</span>
                    <Badge variant="default" className="bg-green-600">
                      99.9%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>API Response Time</span>
                    <Badge variant="secondary">125ms</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Transaction Success Rate</span>
                    <Badge variant="default" className="bg-green-600">
                      99.8%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Security Incidents</span>
                    <Badge variant="destructive">2 Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Alerts
                </CardTitle>
                <CardDescription>
                  Recent security events and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-l-red-500 pl-4 py-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-600">
                        Failed Login Attempts
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Multiple failed login attempts from IP 192.168.1.100
                    </p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                  <div className="border-l-4 border-l-yellow-500 pl-4 py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-600">
                        Unusual Transaction Pattern
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Large transaction detected requiring review
                    </p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure system security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Two-Factor Authentication</span>
                  <Badge variant="default" className="bg-green-600">
                    Enabled
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Session Timeout</span>
                  <span className="text-sm text-gray-600">30 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Password Policy</span>
                  <Badge variant="default">Strong</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Audit Logging</span>
                  <Badge variant="default" className="bg-green-600">
                    Active
                  </Badge>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Security
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModernAdminDashboard;
