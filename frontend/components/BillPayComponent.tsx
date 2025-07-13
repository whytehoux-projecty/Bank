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
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { formatCurrency, formatDate, cn } from "../lib/utils";
import {
  CreditCardIcon,
  BanknotesIcon,
  CalendarIcon,
  PlusIcon,
  SettingsIcon,
  CheckIcon,
  ClockIcon,
  AlertTriangleIcon,
} from "@/constants";

interface Bill {
  id: string;
  payeeName: string;
  accountNumber: string;
  amount: number;
  dueDate: string;
  category: string;
  isRecurring: boolean;
  status: "pending" | "scheduled" | "paid" | "overdue";
  autopay: boolean;
  lastPaid?: string;
}

const BillPayComponent: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("bills");
  const [newBill, setNewBill] = useState({
    payeeName: "",
    accountNumber: "",
    amount: "",
    dueDate: "",
    category: "",
    isRecurring: false,
    autopay: false,
  });

  // Mock bills data
  const mockBills: Bill[] = [
    {
      id: "1",
      payeeName: "Electric Company",
      accountNumber: "****1234",
      amount: 125.5,
      dueDate: "2024-08-15",
      category: "Utilities",
      isRecurring: true,
      status: "scheduled",
      autopay: true,
      lastPaid: "2024-07-15",
    },
    {
      id: "2",
      payeeName: "Internet Provider",
      accountNumber: "****5678",
      amount: 89.99,
      dueDate: "2024-08-10",
      category: "Utilities",
      isRecurring: true,
      status: "pending",
      autopay: false,
    },
    {
      id: "3",
      payeeName: "Credit Card",
      accountNumber: "****9012",
      amount: 450.25,
      dueDate: "2024-08-05",
      category: "Credit Card",
      isRecurring: false,
      status: "overdue",
      autopay: false,
    },
    {
      id: "4",
      payeeName: "Insurance Premium",
      accountNumber: "****3456",
      amount: 275.0,
      dueDate: "2024-08-20",
      category: "Insurance",
      isRecurring: true,
      status: "pending",
      autopay: true,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckIcon className="h-4 w-4 text-green-600" />;
      case "scheduled":
        return <ClockIcon className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertTriangleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "success",
      scheduled: "default",
      pending: "warning",
      overdue: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleAddBill = () => {
    // Add bill logic here
    console.log("Adding bill:", newBill);
    // Reset form
    setNewBill({
      payeeName: "",
      accountNumber: "",
      amount: "",
      dueDate: "",
      category: "",
      isRecurring: false,
      autopay: false,
    });
  };

  const handlePayBill = (billId: string) => {
    console.log("Paying bill:", billId);
    // Payment logic here
  };

  const totalDue = mockBills
    .filter((bill) => bill.status === "pending" || bill.status === "overdue")
    .reduce((sum, bill) => sum + bill.amount, 0);

  const overdueBills = mockBills.filter((bill) => bill.status === "overdue");
  const upcomingBills = mockBills.filter(
    (bill) => bill.status === "pending" || bill.status === "scheduled"
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bill Pay Center</h1>
          <p className="text-gray-600 mt-1">
            Manage your bills and automate payments
          </p>
        </div>
        <Button onClick={() => setSelectedTab("add")}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Bill
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <BanknotesIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalDue)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {
                mockBills.filter(
                  (b) => b.status === "pending" || b.status === "overdue"
                ).length
              }{" "}
              bills pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Bills</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueBills.length}
            </div>
            <p className="text-xs text-red-600 mt-1">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Autopay Active
            </CardTitle>
            <SettingsIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockBills.filter((b) => b.autopay).length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Bills on autopay</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="bills">All Bills</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="add">Add Bill</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Bills</CardTitle>
              <CardDescription>
                Manage all your recurring and one-time bills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                        {getStatusIcon(bill.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{bill.payeeName}</h4>
                        <p className="text-sm text-gray-600">
                          Account: {bill.accountNumber} • {bill.category}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(bill.status)}
                          {bill.autopay && (
                            <Badge variant="outline" className="text-xs">
                              Autopay
                            </Badge>
                          )}
                          {bill.isRecurring && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-semibold text-lg">
                        {formatCurrency(bill.amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Due: {formatDate(bill.dueDate)}
                      </p>
                      <div className="flex space-x-2">
                        {bill.status === "pending" ||
                        bill.status === "overdue" ? (
                          <Button
                            size="sm"
                            onClick={() => handlePayBill(bill.id)}
                          >
                            Pay Now
                          </Button>
                        ) : null}
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Overdue Bills</CardTitle>
              <CardDescription>
                Bills that require immediate payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdueBills.length === 0 ? (
                <div className="text-center py-8">
                  <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">No overdue bills. Great job!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {overdueBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <AlertTriangleIcon className="h-8 w-8 text-red-600" />
                        <div>
                          <h4 className="font-semibold text-red-900">
                            {bill.payeeName}
                          </h4>
                          <p className="text-sm text-red-700">
                            Due: {formatDate(bill.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-red-600">
                          {formatCurrency(bill.amount)}
                        </p>
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => handlePayBill(bill.id)}
                        >
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Payments</CardTitle>
              <CardDescription>
                Bills scheduled for automatic payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBills
                  .filter((bill) => bill.status === "scheduled")
                  .map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <ClockIcon className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{bill.payeeName}</h4>
                          <p className="text-sm text-gray-600">
                            Scheduled for: {formatDate(bill.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatCurrency(bill.amount)}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Cancel Payment
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Bill</CardTitle>
              <CardDescription>Set up a new bill for payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Payee Name
                  </label>
                  <Input
                    placeholder="e.g., Electric Company"
                    value={newBill.payeeName}
                    onChange={(e) =>
                      setNewBill({ ...newBill, payeeName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Account Number
                  </label>
                  <Input
                    placeholder="Account or Reference Number"
                    value={newBill.accountNumber}
                    onChange={(e) =>
                      setNewBill({ ...newBill, accountNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newBill.amount}
                    onChange={(e) =>
                      setNewBill({ ...newBill, amount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={newBill.dueDate}
                    onChange={(e) =>
                      setNewBill({ ...newBill, dueDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Category
                  </label>
                  <Select
                    value={newBill.category}
                    onValueChange={(value) =>
                      setNewBill({ ...newBill, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newBill.isRecurring}
                    onChange={(e) =>
                      setNewBill({ ...newBill, isRecurring: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Recurring monthly bill</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newBill.autopay}
                    onChange={(e) =>
                      setNewBill({ ...newBill, autopay: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Enable autopay</span>
                </label>
              </div>

              <Button onClick={handleAddBill} className="w-full">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Bill
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillPayComponent;
