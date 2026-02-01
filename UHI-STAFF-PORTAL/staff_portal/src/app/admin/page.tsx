'use client';

import { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { AdminStats, Application } from '@/types';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';

export default function AdminDashboardPage() {
    return (
        <ProtectedRoute requireAdmin>
            <AdminDashboardContent />
        </ProtectedRoute>
    );
}

function AdminDashboardContent() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [pendingApps, setPendingApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [statsRes, appsRes] = await Promise.all([
                API.request<any>('/admin/stats', { auth: true }),
                API.request<any>('/admin/applications?status=pending', { auth: true }),
            ]);

            if (statsRes?.data) setStats(statsRes.data);
            if (appsRes?.data) setPendingApps(Array.isArray(appsRes.data) ? appsRes.data : []);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this application?')) return;
        try {
            await API.request(`/admin/applications/${id}/decision`, {
                method: 'PATCH',
                auth: true,
                body: { decision: 'approved' },
            });
            await loadDashboard();
        } catch (error) {
            alert('Failed to approve application');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this application?')) return;
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason?.trim()) return;

        try {
            await API.request(`/admin/applications/${id}/decision`, {
                method: 'PATCH',
                auth: true,
                body: { decision: 'rejected', comment: reason.trim() },
            });
            await loadDashboard();
        } catch (error) {
            alert('Failed to reject application');
        }
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            leave: 'Leave',
            transfer: 'Transfer',
            training: 'Training',
            loan: 'Loan',
        };
        return labels[type] || type;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader />

            <div className="lg:ml-64">
                <main className="container-custom py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
                        <p className="text-gray-600 mt-1">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]"></div>
                        </div>
                    ) : (
                        <>
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="card">
                                    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
                                        Total Staff
                                    </div>
                                    <div className="text-4xl font-bold text-[var(--primary-color)]">
                                        {stats?.users || 0}
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
                                        Pending Applications
                                    </div>
                                    <div className="text-4xl font-bold text-[var(--primary-color)]">
                                        {stats?.pendingApplications || 0}
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
                                        Active Contracts
                                    </div>
                                    <div className="text-4xl font-bold text-[var(--primary-color)]">
                                        {stats?.activeContracts || 0}
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
                                        Active Loans
                                    </div>
                                    <div className="text-4xl font-bold text-[var(--primary-color)]">
                                        {stats?.activeLoans || 0}
                                    </div>
                                </div>
                            </div>

                            {/* Pending Applications */}
                            <section className="card">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Pending Applications</h3>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Application ID</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Staff Member</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Submitted</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingApps.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                                        No pending applications
                                                    </td>
                                                </tr>
                                            ) : (
                                                pendingApps.map((app) => (
                                                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4 font-mono text-sm" title={app.id}>
                                                            {app.id.slice(0, 8)}...
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {app.user
                                                                ? `${app.user.first_name || app.user.firstName} ${app.user.last_name || app.user.lastName} (${app.user.staff_id || app.user.staffId})`
                                                                : 'N/A'}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="badge badge-info">{getTypeLabel(app.type)}</span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {new Date(app.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleApprove(app.id)}
                                                                    className="btn btn-primary btn-sm"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(app.id)}
                                                                    className="btn btn-danger btn-sm"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    )}
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-6 mt-12">
                    <div className="container-custom">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                            <p>© 2025 Global Organization. All rights reserved.</p>
                            <div className="flex gap-6">
                                <a href="#" className="hover:text-[var(--primary-color)] transition-colors">
                                    Privacy Policy
                                </a>
                                <a href="#" className="hover:text-[var(--primary-color)] transition-colors">
                                    Terms of Use
                                </a>
                                <a href="#" className="hover:text-[var(--primary-color)] transition-colors">
                                    Help & Support
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
