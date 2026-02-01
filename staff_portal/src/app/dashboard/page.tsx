'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import StaffHeader from '@/components/layout/StaffHeader';

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const response = await API.request('/staff/profile', { auth: true });
            if (response?.data) {
                setProfileData(response.data);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
            setProfileData(user);
        } finally {
            setLoading(false);
        }
    };

    const getDisplayName = () => {
        if (!user) return 'User';
        const firstName = user.firstName || user.first_name || 'User';
        const title = user.title || user.honorific || '';
        return title ? `${title} ${firstName}` : firstName;
    };

    const getFullName = () => {
        if (!user) return 'User';
        const firstName = user.firstName || user.first_name || 'User';
        const lastName = user.lastName || user.last_name || '';
        return `${firstName} ${lastName}`.trim();
    };

    const data = profileData || user;

    return (
        <div className="min-h-screen bg-gray-50">
            <StaffHeader />

            {/* Welcome Bar */}
            <div className="bg-gradient-primary text-white py-4">
                <div className="container-custom">
                    <h1 className="text-2xl font-semibold">Welcome, {getDisplayName()}</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Bio Card */}
                        <div className="card lg:col-span-1">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-primary text-white text-3xl font-bold mb-4">
                                    {getFullName()[0]}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{getFullName()}</h2>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🆔</span>
                                    <div>
                                        <p className="font-semibold">ID: {data?.staffId || data?.staff_id || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🏢</span>
                                    <p className="text-gray-600">globalaid.org</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">💼</span>
                                    <p className="font-semibold">{data?.position || 'Unassigned'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">✉️</span>
                                    <a href={`mailto:${data?.email}`} className="link text-sm">
                                        {data?.email}
                                    </a>
                                </div>
                            </div>

                            <Link href="/my-contract" className="btn btn-primary w-full mt-6">
                                View Profile
                            </Link>
                        </div>

                        {/* Contract Overview */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>🏢</span> Contract & Role
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Department</span>
                                    <span className="font-semibold">{data?.department || 'Unassigned'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Location</span>
                                    <span className="font-semibold">{data?.staffProfile?.address || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date Joined</span>
                                    <span className="font-semibold">
                                        {data?.joinedAt || data?.created_at
                                            ? new Date(data.joinedAt || data.created_at).toLocaleDateString()
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Staff Type</span>
                                    <span className="font-semibold">
                                        {data?.staffProfile?.staff_type || (data?.role === 'admin' ? 'Office' : 'Field')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payments */}
                        <div className="card flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>💳</span> Payments
                            </h3>
                            <div className="space-y-3 text-sm flex-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Bank Name</span>
                                    <span className="font-semibold">
                                        {data?.bankAccount?.bank_name || 'Not Linked'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Account Number</span>
                                    <span className="font-semibold">
                                        {data?.bankAccount?.account_number
                                            ? `**** ${data.bankAccount.account_number.slice(-4)}`
                                            : 'Not Linked'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Payroll</span>
                                    <span className="font-semibold">
                                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <Link href="/payments" className="btn btn-primary w-full mt-4">
                                Open Payments
                            </Link>
                        </div>

                        {/* Quick Actions */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>⚡</span> Quick Actions
                            </h3>
                            <div className="space-y-2">
                                <Link href="/requests" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                    New Request
                                </Link>
                                <Link href="/requests" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                    My Requests
                                </Link>
                                <Link href="/my-contract" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                    My Contract
                                </Link>
                                <Link href="/payments" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                    Payments
                                </Link>
                                <Link href="/notifications" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                    Notifications
                                </Link>
                            </div>
                        </div>

                        {/* Performance */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>🎯</span> Performance
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current Review</span>
                                    <span className="flex items-center gap-1">
                                        <span className="text-green-500">●</span>
                                        <span className="font-semibold">On Track</span>
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Next Review</span>
                                    <span className="font-semibold">June 2026</span>
                                </div>
                            </div>
                            <button className="btn btn-secondary w-full mt-4">View Goals</button>
                        </div>

                        {/* Documents */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>📂</span> Documents
                            </h3>
                            <div className="space-y-2">
                                <Link href="#" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                    My Contracts
                                </Link>
                                <Link href="#" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                    Tax Forms
                                </Link>
                                <Link href="#" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                    Certificates
                                </Link>
                            </div>
                        </div>

                        {/* Team Calendar */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>📅</span> Team Calendar
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-600"><strong>Today:</strong> Team Meeting @ 2PM</p>
                                </div>
                                <div>
                                    <p className="text-gray-600"><strong>Tomorrow:</strong> Site Visit</p>
                                </div>
                            </div>
                            <button className="btn btn-secondary w-full mt-4">Full Calendar</button>
                        </div>

                        {/* Help & Resources */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>❓</span> Help & Resources
                            </h3>
                            <div className="space-y-2">
                                <Link href="#" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                    IT Helpdesk
                                </Link>
                                <Link href="#" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                    HR Policy Handbook
                                </Link>
                                <Link href="#" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium">
                                    Safety Protocols
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                        <p>© 2025 United Health Initiative. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="#" className="hover:text-[var(--primary-color)] transition-colors">
                                Accessibility
                            </Link>
                            <Link href="#" className="hover:text-[var(--primary-color)] transition-colors">
                                Contact
                            </Link>
                            <Link href="#" className="hover:text-[var(--primary-color)] transition-colors">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
