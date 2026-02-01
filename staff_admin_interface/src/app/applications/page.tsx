'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';

type ApplicationType = 'leave' | 'transfer' | 'training' | 'loan' | 'grant';
type ApplicationStatus = 'pending' | 'approved' | 'rejected';

interface Application {
    id: string;
    staffId: string;
    staffName: string;
    type: ApplicationType;
    data: any;
    status: ApplicationStatus;
    created_at: string;
    comment?: string;
}

export default function ApplicationsPage() {
    return (
        <ProtectedRoute>
            <ApplicationsContent />
        </ProtectedRoute>
    );
}

function ApplicationsContent() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState<Application[]>([]);
    const [filteredApps, setFilteredApps] = useState<Application[]>([]);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [decisionAction, setDecisionAction] = useState<'approve' | 'reject'>('approve');
    const [decisionComment, setDecisionComment] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    useEffect(() => {
        loadApplications();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [applications, searchQuery, statusFilter, typeFilter]);

    const loadApplications = async () => {
        setLoading(true);
        try {
            const res = await API.request('/admin/applications', { auth: true });
            const appsData = res?.data || [];

            // Map backend response to frontend Application interface
            const mappedApps: Application[] = appsData.map((app: any) => ({
                id: app.id,
                staffId: app.user?.staff_id || 'N/A',
                staffName: `${app.user?.first_name || ''} ${app.user?.last_name || ''}`.trim() || 'Unknown Staff',
                type: app.type as ApplicationType,
                data: app.data || {},
                status: app.status as ApplicationStatus,
                created_at: app.created_at,
                comment: app.reviews?.[0]?.comment // Optional: grab latest review comment if available
            }));

            setApplications(mappedApps);
        } catch (error) {
            console.error('Error loading applications:', error);
            setMessage({ type: 'error', text: 'Failed to load applications' });
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...applications];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (app) =>
                    app.staffName.toLowerCase().includes(query) ||
                    app.staffId.toLowerCase().includes(query) ||
                    app.id.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((app) => app.status === statusFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter((app) => app.type === typeFilter);
        }

        setFilteredApps(filtered);
    };

    const handleViewApplication = (app: Application) => {
        setSelectedApp(app);
        setShowDetailModal(true);
    };

    const handleShowDecision = (app: Application, action: 'approve' | 'reject') => {
        setSelectedApp(app);
        setDecisionAction(action);
        setDecisionComment('');
        setShowDecisionModal(true);
    };

    const handleConfirmDecision = async () => {
        if (!selectedApp) return;

        setLoading(true);
        setMessage(null);

        try {
            await API.request(`/admin/applications/${selectedApp.id}/decision`, {
                method: 'PATCH',
                auth: true,
                body: {
                    decision: decisionAction === 'approve' ? 'approved' : 'rejected',
                    comment: decisionComment,
                },
            });

            setMessage({
                type: 'success',
                text: `Application ${decisionAction === 'approve' ? 'approved' : 'rejected'} successfully!`,
            });

            setShowDecisionModal(false);
            loadApplications();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to process application' });
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: ApplicationType) => {
        const icons = {
            leave: '🏖️',
            transfer: '🔄',
            training: '📚',
            loan: '💰',
            grant: '🎁',
        };
        return icons[type] || '📋';
    };

    const getTypeLabel = (type: ApplicationType) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const renderApplicationDetails = (app: Application) => {
        const { data } = app;
        switch (app.type) {
            case 'leave':
                return (
                    <>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Type:</span> {data.leaveType} Leave
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Dates:</span> {formatDate(data.startDate)} -{' '}
                            {formatDate(data.endDate)}
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Reason:</span> {data.reason}
                        </div>
                    </>
                );
            case 'transfer':
                return (
                    <>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">To Department:</span> {data.department}
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Preferred Date:</span> {formatDate(data.preferredDate)}
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Reason:</span> {data.reason}
                        </div>
                    </>
                );
            case 'training':
                return (
                    <>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Program:</span> {data.program}
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Provider:</span> {data.provider}
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Start Date:</span> {formatDate(data.startDate)}
                        </div>
                    </>
                );
            case 'loan':
                return (
                    <>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Amount:</span> {data.amount}
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Repayment Period:</span> {data.repaymentMonths} months
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Reason:</span> {data.reason}
                        </div>
                    </>
                );
            case 'grant':
                return (
                    <>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Grant Name:</span> {data.grantName}
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Amount:</span> {data.grantAmount}
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold text-gray-700">Purpose:</span> {data.grantPurpose}
                        </div>
                    </>
                );
            default:
                return <div>Details not available</div>;
        }
    };

    const stats = {
        pending: applications.filter((a) => a.status === 'pending').length,
        approved: applications.filter((a) => a.status === 'approved').length,
        rejected: applications.filter((a) => a.status === 'rejected').length,
        total: applications.length,
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminHeader />

            <main className="flex-1 lg:ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] rounded-2xl p-8 mb-8 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">📋 Application Management</h1>
                                <p className="text-blue-100 mt-2">Review and process staff applications</p>
                            </div>
                            <button className="btn bg-white text-[#1a365d] hover:bg-gray-100">📊 Export Report</button>
                        </div>
                    </div>

                    {/* Alert Messages */}
                    {message && (
                        <div
                            className={`mb-6 p-4 rounded-lg border-2 animate-fade-in ${message.type === 'success'
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
                                <span className="font-medium">{message.text}</span>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-orange-500">
                            <div className="text-3xl mb-2">⏳</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
                            <div className="text-sm text-gray-600 mt-1">Pending Review</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-green-500">
                            <div className="text-3xl mb-2">✅</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.approved}</div>
                            <div className="text-sm text-gray-600 mt-1">Approved</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-red-500">
                            <div className="text-3xl mb-2">❌</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.rejected}</div>
                            <div className="text-sm text-gray-600 mt-1">Rejected</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-500">
                            <div className="text-3xl mb-2">📊</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-600 mt-1">Total Applications</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, ID..."
                                    className="input"
                                />
                            </div>

                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="input"
                                    aria-label="Filter by status"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="input"
                                    aria-label="Filter by type"
                                >
                                    <option value="all">All Types</option>
                                    <option value="leave">Leave</option>
                                    <option value="grant">Grant</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="training">Training</option>
                                    <option value="loan">Loan</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Applications Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[var(--primary-color)]"></div>
                                <p className="text-gray-600 mt-4">Loading...</p>
                            </div>
                        ) : filteredApps.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4 opacity-50">📋</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
                                <p className="text-gray-600">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Staff Member
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Details
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Submitted
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredApps.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-[#1a365d] text-white flex items-center justify-center font-semibold">
                                                            {app.staffName
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .join('')}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{app.staffName}</div>
                                                            <div className="text-sm text-gray-500">{app.staffId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                        {getTypeIcon(app.type)} {getTypeLabel(app.type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {app.type === 'leave' && `${app.data.leaveType} Leave`}
                                                    {app.type === 'transfer' && `Transfer to ${app.data.department}`}
                                                    {app.type === 'training' && app.data.program}
                                                    {app.type === 'loan' && (app.data.amount ? `Loan: ${app.data.amount}` : 'Loan Request')}
                                                    {app.type === 'grant' && `Grant: ${app.data.grantName}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(app.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : app.status === 'approved'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleViewApplication(app)}
                                                            className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] font-medium"
                                                        >
                                                            View
                                                        </button>
                                                        {app.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleShowDecision(app, 'approve')}
                                                                    className="text-green-600 hover:text-green-800 font-medium"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleShowDecision(app, 'reject')}
                                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Detail Modal */}
            {showDetailModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">📋 Application Details</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-[#1a365d] text-white flex items-center justify-center text-xl font-bold">
                                    {selectedApp.staffName
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-gray-900">{selectedApp.staffName}</div>
                                    <div className="text-sm text-gray-500">{selectedApp.staffId}</div>
                                </div>
                                <span
                                    className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedApp.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : selectedApp.status === 'approved'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {selectedApp.status}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="font-semibold text-gray-700">Application ID:</span> {selectedApp.id}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Type:</span> {getTypeIcon(selectedApp.type)}{' '}
                                    {getTypeLabel(selectedApp.type)}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Submitted:</span> {formatDate(selectedApp.created_at)}
                                </div>

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Application Details</h4>
                                    {renderApplicationDetails(selectedApp)}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button onClick={() => setShowDetailModal(false)} className="btn btn-secondary">
                                Close
                            </button>
                            {selectedApp.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleShowDecision(selectedApp, 'reject');
                                        }}
                                        className="btn bg-red-600 text-white hover:bg-red-700"
                                    >
                                        ✕ Reject
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleShowDecision(selectedApp, 'approve');
                                        }}
                                        className="btn bg-green-600 text-white hover:bg-green-700"
                                    >
                                        ✓ Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Decision Modal */}
            {showDecisionModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slide-up">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                {decisionAction === 'approve' ? '✅ Approve Application' : '❌ Reject Application'}
                            </h3>
                            <button
                                onClick={() => setShowDecisionModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Comment (Optional)
                                </label>
                                <textarea
                                    id="comment"
                                    value={decisionComment}
                                    onChange={(e) => setDecisionComment(e.target.value)}
                                    rows={4}
                                    className="input"
                                    placeholder="Add a comment for the applicant..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button onClick={() => setShowDecisionModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDecision}
                                disabled={loading}
                                className={`btn ${decisionAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                    } text-white`}
                            >
                                {loading ? 'Processing...' : decisionAction === 'approve' ? '✓ Approve' : '✕ Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
