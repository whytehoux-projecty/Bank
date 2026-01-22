'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Activity,
    CreditCard,
    DollarSign,
    Users,
    Download
} from 'lucide-react';

import { api, setAccessToken } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/dashboard/overview';
import { RecentTransactions } from '@/components/dashboard/recent-sales';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
}

function DashboardContent() {
    const searchParams = useSearchParams();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setAccessToken(token);
            window.history.replaceState({}, '', '/dashboard');
        }
        loadDashboardData();
    }, [searchParams]);

    const loadDashboardData = async () => {
        try {
            const profileData = await api.profile.get();
            setUser(profileData.user);
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Skeleton className="col-span-4 h-[400px] rounded-xl" />
                        <Skeleton className="col-span-3 h-[400px] rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-4 pt-0">
            <div className="flex items-center justify-between space-y-2 pb-4">
                <h2 className="text-3xl font-bold tracking-tight font-playfair">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="small">
                        Oct 20, 2025 - Nov 20, 2025
                    </Button>
                    <Button size="small">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
                    <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
                    <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Total Revenue
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$45,231.89</div>
                                <p className="text-xs text-muted-foreground">
                                    +20.1% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Subscriptions
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+2350</div>
                                <p className="text-xs text-muted-foreground">
                                    +180.1% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Sales
                                </CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+12,234</div>
                                <p className="text-xs text-muted-foreground">
                                    +19% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium font-sans">
                                    Active Now
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+573</div>
                                <p className="text-xs text-muted-foreground">
                                    +201 since last hour
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
                                <Overview />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Sales</CardTitle>
                                <CardDescription>
                                    You made 265 sales this month.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentTransactions />
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
