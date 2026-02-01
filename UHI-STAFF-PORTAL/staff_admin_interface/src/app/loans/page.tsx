'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';

type LoanStatus = 'pending' | 'approved' | 'active' | 'rejected' | 'completed';

interface Loan {
    id: string;
    staffId: string;
    staffName: string;
    amount: number;
    requestedAmount: number;
    approvedAmount?: number;
    interestRate: number;
    duration: number;
    monthlyPayment: number;
    outstanding: number;
    status: LoanStatus;
    purpose: string;
    created_at: string;
    approved_at?: string;
    disbursed_at?: string;
}

export default function LoansPage() {
    return (
        <ProtectedRoute>
            <LoansContent />
        </ProtectedRoute>
    );
}

function LoansContent() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [decisionAction, setDecisionAction] = useState<'approve' | 'reject'>('approve');
    const [approvedAmount, setApprovedAmount] = useState('');
    const [decisionComment, setDecisionComment] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        loadLoans();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [loans, searchQuery, statusFilter]);

    const loadLoans = async () => {
        setLoading(true);
        try {
            // Updated endpoint to match backend definition in loan.routes.ts (mounted at /finance)
            const res = await API.request('/finance/admin/loans', { auth: true });
            const loansData = res?.data || [];

            // Map backend response to frontend Loan interface
            const mappedLoans: Loan[] = loansData.map((loan: any) => ({
                id: loan.id,
                staffId: loan.user?.staff_id || 'N/A',
                staffName: `${loan.user?.first_name || ''} ${loan.user?.last_name || ''}`.trim() || 'Unknown Staff',
                amount: loan.amount,
                requestedAmount: loan.requested_amount || loan.amount,
                approvedAmount: loan.approved_amount,
                interestRate: loan.interest_rate || 0,
                duration: loan.duration || 0,
                monthlyPayment: loan.monthly_payment || 0,
                outstanding: loan.outstanding_balance || 0,
                status: loan.status as LoanStatus,
                purpose: loan.purpose || '',
                created_at: loan.created_at,
                approved_at: loan.approved_at,
                disbursed_at: loan.disbursed_at
            }));

            setLoans(mappedLoans);
        } catch (error) {
            console.error('Error loading loans:', error);
            setMessage({ type: 'error', text: 'Failed to load loans' });
            setLoans([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...loans];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (loan) =>
                    loan.staffName.toLowerCase().includes(query) ||
                    loan.staffId.toLowerCase().includes(query) ||
                    loan.id.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((loan) => loan.status === statusFilter);
        }

        setFilteredLoans(filtered);
    };

    const handleViewLoan = (loan: Loan) => {
        setSelectedLoan(loan);
        setShowDetailModal(true);
    };

    const handleShowDecision = (loan: Loan, action: 'approve' | 'reject') => {
        setSelectedLoan(loan);
        setDecisionAction(action);
        setApprovedAmount(loan.requestedAmount.toString());
        setDecisionComment('');
        setShowDecisionModal(true);
    };

    const handleConfirmDecision = async () => {
        if (!selectedLoan) return;

        setLoading(true);
        setMessage(null);

        try {
            await API.request(`/admin/loans/${selectedLoan.id}/decision`, {
                method: 'PATCH',
                auth: true,
                body: {
                    decision: decisionAction === 'approve' ? 'approved' : 'rejected',
                    approvedAmount: decisionAction === 'approve' ? parseFloat(approvedAmount) : undefined,
                    comment: decisionComment,
                },
            });

            setMessage({
                type: 'success',
                text: `Loan ${decisionAction === 'approve' ? 'approved' : 'rejected'} successfully!`,
            });

            setShowDecisionModal(false);
            loadLoans();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to process loan' });
        } finally {
            setLoading(false);
        }
    };

    const handleDisburse = async (loanId: string) => {
        if (!confirm('Are you sure you want to disburse this loan?')) return;

        try {
            await API.request(`/admin/loans/${loanId}/disburse`, {
                method: 'POST',
                auth: true,
            });

            setMessage({ type: 'success', text: 'Loan disbursed successfully!' });
            loadLoans();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to disburse loan' });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const stats = {
        pending: loans.filter((l) => l.status === 'pending').length,
        active: loans.filter((l) => l.status === 'active').length,
        totalDisbursed: loans
            .filter((l) => l.status === 'active' || l.status === 'completed')
            .reduce((sum, l) => sum + (l.approvedAmount || l.amount), 0),
        totalOutstanding: loans.filter((l) => l.status === 'active').reduce((sum, l) => sum + l.outstanding, 0),
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
                                <h1 className="text-3xl font-bold text-white">💳 Loan Management</h1>
                                <p className="text-blue-100 mt-2">Manage staff loan applications and repayments</p>
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
                            <div className="text-sm text-gray-600 mt-1">Pending Approval</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-500">
                            <div className="text-3xl mb-2">💰</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.active}</div>
                            <div className="text-sm text-gray-600 mt-1">Active Loans</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-green-500">
                            <div className="text-3xl mb-2">💵</div>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalDisbursed)}</div>
                            <div className="text-sm text-gray-600 mt-1">Total Disbursed</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-red-500">
                            <div className="text-3xl mb-2">📊</div>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalOutstanding)}</div>
                            <div className="text-sm text-gray-600 mt-1">Total Outstanding</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, ID, or loan ID..."
                                    className="input"
                                />
                            </div>

                            <div>
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="active">Active</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Loans Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[var(--primary-color)]"></div>
                                <p className="text-gray-600 mt-4">Loading...</p>
                            </div>
                        ) : filteredLoans.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4 opacity-50">💳</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No loans found</h3>
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
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Outstanding
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
                                        {filteredLoans.map((loan) => (
                                            <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-[#1a365d] text-white flex items-center justify-center font-semibold">
                                                            {loan.staffName
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .join('')}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{loan.staffName}</div>
                                                            <div className="text-sm text-gray-500">{loan.staffId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-semibold text-gray-900">
                                                        {formatCurrency(loan.approvedAmount || loan.requestedAmount)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{loan.purpose}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {loan.duration} months
                                                    {loan.monthlyPayment > 0 && (
                                                        <div className="text-xs text-gray-500">
                                                            {formatCurrency(loan.monthlyPayment)}/mo
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-semibold text-gray-900">{formatCurrency(loan.outstanding)}</div>
                                                    {loan.status === 'active' && loan.approvedAmount && (
                                                        <div className="text-xs text-gray-500">
                                                            {Math.round((loan.outstanding / loan.approvedAmount) * 100)}% remaining
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${loan.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : loan.status === 'approved'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : loan.status === 'active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : loan.status === 'completed'
                                                                        ? 'bg-gray-100 text-gray-800'
                                                                        : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        {loan.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleViewLoan(loan)}
                                                            className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] font-medium"
                                                        >
                                                            View
                                                        </button>
                                                        {loan.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleShowDecision(loan, 'approve')}
                                                                    className="text-green-600 hover:text-green-800 font-medium"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleShowDecision(loan, 'reject')}
                                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {loan.status === 'approved' && (
                                                            <button
                                                                onClick={() => handleDisburse(loan.id)}
                                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                                            >
                                                                Disburse
                                                            </button>
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
            {showDetailModal && selectedLoan && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">💳 Loan Details</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-[#1a365d] text-white flex items-center justify-center text-xl font-bold">
                                    {selectedLoan.staffName
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-gray-900">{selectedLoan.staffName}</div>
                                    <div className="text-sm text-gray-500">{selectedLoan.staffId}</div>
                                </div>
                                <span
                                    className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedLoan.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : selectedLoan.status === 'approved'
                                            ? 'bg-blue-100 text-blue-800'
                                            : selectedLoan.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : selectedLoan.status === 'completed'
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {selectedLoan.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Loan ID</div>
                                    <div className="font-semibold text-gray-900">{selectedLoan.id}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Purpose</div>
                                    <div className="font-semibold text-gray-900">{selectedLoan.purpose}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Requested Amount</div>
                                    <div className="font-semibold text-gray-900">{formatCurrency(selectedLoan.requestedAmount)}</div>
                                </div>
                                {selectedLoan.approvedAmount && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Approved Amount</div>
                                        <div className="font-semibold text-gray-900">{formatCurrency(selectedLoan.approvedAmount)}</div>
                                    </div>
                                )}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Interest Rate</div>
                                    <div className="font-semibold text-gray-900">{selectedLoan.interestRate}% p.a.</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Duration</div>
                                    <div className="font-semibold text-gray-900">{selectedLoan.duration} months</div>
                                </div>
                                {selectedLoan.monthlyPayment > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Monthly Payment</div>
                                        <div className="font-semibold text-gray-900">{formatCurrency(selectedLoan.monthlyPayment)}</div>
                                    </div>
                                )}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Outstanding</div>
                                    <div className="font-semibold text-gray-900">{formatCurrency(selectedLoan.outstanding)}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Applied On</div>
                                    <div className="font-semibold text-gray-900">{formatDate(selectedLoan.created_at)}</div>
                                </div>
                                {selectedLoan.approved_at && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Approved On</div>
                                        <div className="font-semibold text-gray-900">{formatDate(selectedLoan.approved_at)}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button onClick={() => setShowDetailModal(false)} className="btn btn-secondary">
                                Close
                            </button>
                            {selectedLoan.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleShowDecision(selectedLoan, 'reject');
                                        }}
                                        className="btn bg-red-600 text-white hover:bg-red-700"
                                    >
                                        ✕ Reject
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleShowDecision(selectedLoan, 'approve');
                                        }}
                                        className="btn bg-green-600 text-white hover:bg-green-700"
                                    >
                                        ✓ Approve
                                    </button>
                                </>
                            )}
                            {selectedLoan.status === 'approved' && (
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        handleDisburse(selectedLoan.id);
                                    }}
                                    className="btn bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    💰 Disburse
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Decision Modal */}
            {showDecisionModal && selectedLoan && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slide-up">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                {decisionAction === 'approve' ? '✅ Approve Loan' : '❌ Reject Loan'}
                            </h3>
                            <button
                                onClick={() => setShowDecisionModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {decisionAction === 'approve' && (
                                <div>
                                    <label htmlFor="approvedAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Approved Amount *
                                    </label>
                                    <input
                                        type="number"
                                        id="approvedAmount"
                                        value={approvedAmount}
                                        onChange={(e) => setApprovedAmount(e.target.value)}
                                        className="input"
                                        placeholder="Enter approved amount"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Requested: {formatCurrency(selectedLoan.requestedAmount)}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Comment (Optional)
                                </label>
                                <textarea
                                    id="comment"
                                    value={decisionComment}
                                    onChange={(e) => setDecisionComment(e.target.value)}
                                    rows={4}
                                    className="input"
                                    placeholder="Add a comment..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button onClick={() => setShowDecisionModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDecision}
                                disabled={loading || (decisionAction === 'approve' && !approvedAmount)}
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
