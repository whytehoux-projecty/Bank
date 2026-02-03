'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';

import {
    Activity,
    CreditCard,
    DollarSign,
    Users,
    Download,
    Wallet,
    ArrowDownLeft,
    ArrowUpRight,
    PiggyBank
} from 'lucide-react';

import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/dashboard/overview';
import { RecentTransactions } from '@/components/dashboard/recent-sales';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
}

interface DashboardStats {
    totalBalance: number;
    income: number;
    expenses: number;
    savingsGoal: number; // Simulated for now as backend doesn't support goals yet
}

function DashboardContent() {

    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalBalance: 0,
        income: 0,
        expenses: 0,
        savingsGoal: 12500,
    });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [profileData, accountsData, txStats, recentTx] = await Promise.all([
                api.profile.get(),
                api.accounts.getAll(),
                api.transactions.getStats('month'),
                api.transactions.getAll({ limit: 5 })
            ]);

            setUser(profileData.user);

            // Calculate total balance from all accounts
            const totalBalance = accountsData.accounts.reduce(
                (sum: number, acc: any) => sum + Number(acc.balance), 0
            );

            setStats({
                totalBalance,
                income: txStats.deposits || 0,
                expenses: txStats.withdrawals + txStats.transfers || 0, // Treat transfers as expenses for overview
                savingsGoal: 12500
            });

            setTransactions(recentTx.transactions || []);

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <Skeleton className="h-8 w-[150px]" />
                    <Skeleton className="h-8 w-[200px]" />
                </div>
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Skeleton className="h-[120px] rounded-xl" />
                        <Skeleton className="h-[120px] rounded-xl" />
                        <Skeleton className="h-[120px] rounded-xl" />
                        <Skeleton className="h-[120px] rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-4 pt-0">
            <div className="flex items-center justify-between space-y-2 pb-4">
                <h2 className="text-3xl font-bold tracking-tight font-playfair">
                    Welcome back, {user?.firstName}
                </h2>
                <div className="flex items-center space-x-2">
                    <Button size="small" onClick={() => loadDashboardData()}>
                        Refresh Data
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Total Balance
                                </CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Across all accounts
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Income (Month)
                                </CardTitle>
                                <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    +{formatCurrency(stats.income)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total deposits
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Expenses (Month)
                                </CardTitle>
                                <ArrowUpRight className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    -{formatCurrency(stats.expenses)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Withdrawals & transfers
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Savings Goals
                                </CardTitle>
                                <PiggyBank className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.savingsGoal)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Target 2026
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <Overview income={stats.income} expense={stats.expenses} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    Latest activity across all accounts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentTransactions transactions={transactions} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
