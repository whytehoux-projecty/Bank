'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import StaffHeader from '@/components/layout/StaffHeader';
import Modal from '@/components/ui/Modal';

type RequestType = 'leave' | 'transfer' | 'training' | 'loan' | 'grant';
type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
type Tab = 'pending' | 'approved' | 'all';

interface Request {
    id: string;
    type: RequestType;
    status: RequestStatus;
    submittedDate: string;
    details: string;
    [key: string]: any;
}

interface LeaveBalance {
    annual: number;
    sick: number;
    special: number;
    unpaid: number;
    year: number;
}

export default function RequestsPage() {
    return (
        <ProtectedRoute>
            <RequestsContent />
        </ProtectedRoute>
    );
}

function RequestsContent() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('pending');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedType, setSelectedType] = useState<RequestType | ''>('');
    const [requests, setRequests] = useState<Request[]>([]);
    const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);

    // Form state
    const [formData, setFormData] = useState<any>({
        type: '',
        reason: '',
        // Leave fields
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        // Transfer fields
        transferLocation: '',
        transferDate: '',
        // Training fields
        trainingProgram: '',
        trainingProvider: '',
        trainingStart: '',
        trainingEnd: '',
        trainingCost: '',
        // Loan fields
        amount: '',
        repaymentMonths: '',
        // Grant fields
        grantName: '',
        grantPurpose: '',
        grantAmount: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [requestsRes, balanceRes] = await Promise.all([
                API.request('/applications/my', { auth: true }),
                API.request('/staff/leave-balance', { auth: true })
            ]);

            // Handle Requests
            const apps = requestsRes?.data || [];
            const mappedApps: Request[] = apps.map((app: any) => ({
                id: app.id,
                type: app.type,
                status: app.status,
                submittedDate: app.created_at,
                details: app.data.reason || app.data.program || app.data.department || (app.data.amount ? `Loan: ${app.data.amount}` : undefined) || (app.data.grantName ? `Grant: ${app.data.grantName}` : 'No details'),
                ...app.data
            }));
            setRequests(mappedApps);

            // Handle Leave Balance
            if (balanceRes?.data) {
                setLeaveBalance({
                    annual: balanceRes.data.annual_days || 30,
                    sick: balanceRes.data.sick_days || 10,
                    special: balanceRes.data.special_days || 5,
                    unpaid: balanceRes.data.unpaid_days || 0,
                    year: new Date().getFullYear()
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (type: RequestType | '' = '') => {
        setSelectedType(type);
        setFormData({ ...formData, type });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { type, ...rest } = formData;
            const payload = {
                type,
                data: { ...rest }
            };

            await API.request('/applications', {
                method: 'POST',
                auth: true,
                body: payload,
            });

            setMessage({ type: 'success', text: 'Request submitted successfully!' });
            setShowModal(false);
            setFormData({
                type: '',
                reason: '',
                leaveType: 'annual',
                startDate: '',
                endDate: '',
                transferLocation: '',
                transferDate: '',
                trainingProgram: '',
                trainingProvider: '',
                trainingStart: '',
                trainingEnd: '',
                trainingCost: '',
                amount: '',
                repaymentMonths: '',
                grantName: '',
                grantPurpose: '',
                grantAmount: '',
            });
            loadData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to submit request' });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getTypeConfig = (type: RequestType) => {
        const config = {
            leave: { label: 'Leave Request', icon: '🏖️', color: 'blue' },
            transfer: { label: 'Transfer Request', icon: '🌍', color: 'purple' },
            training: { label: 'Training Request', icon: '🎓', color: 'green' },
            loan: { label: 'Loan Request', icon: '💰', color: 'yellow' },
            grant: { label: 'Grant Application', icon: '🎁', color: 'pink' },
        };
        return config[type];
    };

    const getStatusBadge = (status: RequestStatus) => {
        const badges = {
            pending: 'bg-orange-100 text-orange-800 border-orange-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return badges[status];
    };

    const filteredRequests = requests.filter((req) => {
        if (activeTab === 'pending') return req.status === 'pending';
        if (activeTab === 'approved') return req.status === 'approved';
        return true;
    });

    const pendingCount = requests.filter((r) => r.status === 'pending').length;
    const approvedCount = requests.filter((r) => r.status === 'approved').length;

    const requestTypes = [
        {
            type: 'leave' as RequestType,
            icon: '🏖️',
            title: 'Leave Request',
            description: 'Annual, sick, or special leave',
        },
        {
            type: 'grant' as RequestType,
            icon: '🎁',
            title: 'Grant Application',
            description: 'Apply for research or project grants',
        },
        {
            type: 'transfer' as RequestType,
            icon: '🌍',
            title: 'Transfer Request',
            description: 'Request duty station change',
        },
        {
            type: 'training' as RequestType,
            icon: '🎓',
            title: 'Training Request',
            description: 'Professional development',
        },
        {
            type: 'loan' as RequestType,
            icon: '💰',
            title: 'Loan Request',
            description: 'Apply for financial assistance',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <StaffHeader />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] text-white">
                <div className="container-custom py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">📝 Requests</h1>
                            <p className="text-blue-100 mt-2">Submit and track staff requests</p>
                        </div>
                        <button onClick={() => handleOpenModal()} className="btn bg-[var(--accent-color)] text-white hover:opacity-90">
                            + New Request
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-8">
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

                {/* Leave Balance Section (only shown if data available) */}
                {leaveBalance && (
                    <div className="card mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>📅</span>
                            <span>Leave Balance ({leaveBalance.year})</span>
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 text-center">
                                <span className="block text-2xl font-bold text-blue-600">{leaveBalance.annual}</span>
                                <span className="text-sm text-gray-600">Annual Days</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 text-center">
                                <span className="block text-2xl font-bold text-green-600">{leaveBalance.sick}</span>
                                <span className="text-sm text-gray-600">Sick Days</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100 text-center">
                                <span className="block text-2xl font-bold text-purple-600">{leaveBalance.special}</span>
                                <span className="text-sm text-gray-600">Special Days</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                                <span className="block text-2xl font-bold text-gray-600">{leaveBalance.unpaid}</span>
                                <span className="text-sm text-gray-600">Unpaid Taken</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Request Types */}
                <div className="card mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Start a request</h3>
                    <p className="text-sm text-gray-600 mb-6">Choose a request type</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {requestTypes.map((item) => (
                            <button
                                key={item.type}
                                onClick={() => handleOpenModal(item.type)}
                                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-[var(--primary-color)] hover:bg-blue-50 transition-all text-center h-full"
                            >
                                <div className="text-3xl mb-3">{item.icon}</div>
                                <div className="font-semibold text-gray-900">{item.title}</div>
                                <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="card mb-4 min-h-[500px]">
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === 'pending'
                                ? 'bg-white text-[#1a365d] shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            ⏳ Pending ({pendingCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('approved')}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === 'approved'
                                ? 'bg-white text-[#1a365d] shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            ✅ Approved ({approvedCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === 'all'
                                ? 'bg-white text-[#1a365d] shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            📋 All Applications
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        {activeTab === 'pending' && '⏳ Pending Applications'}
                        {activeTab === 'approved' && '✅ Approved Applications'}
                        {activeTab === 'all' && '📋 Application History'}
                    </h3>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[var(--primary-color)]"></div>
                            <p className="text-gray-600 mt-4">Loading...</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4 opacity-50">📋</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
                            <p className="text-gray-600 mb-6">
                                {activeTab === 'pending' && "You don't have any pending requests."}
                                {activeTab === 'approved' && "You don't have any approved requests."}
                                {activeTab === 'all' && "You haven't submitted any requests yet."}
                            </p>
                            <button onClick={() => handleOpenModal()} className="btn btn-primary">
                                Submit Your First Request
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredRequests.map((request) => {
                                const typeConfig = getTypeConfig(request.type);
                                return (
                                    <div
                                        key={request.id}
                                        className={`flex items-start gap-4 p-5 bg-gray-50 rounded-lg border-l-4 hover:bg-gray-100 transition-colors ${request.status === 'pending'
                                            ? 'border-orange-500'
                                            : request.status === 'approved'
                                                ? 'border-green-500'
                                                : request.status === 'rejected'
                                                    ? 'border-red-500'
                                                    : 'border-gray-400'
                                            }`}
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                                            {typeConfig.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900">{typeConfig.label}</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Submitted: {formatDate(request.submittedDate)}
                                            </p>
                                            <p className="text-sm text-gray-700 mt-2">{request.details}</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                                                    request.status
                                                )}`}
                                            >
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                            <button className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] text-sm font-medium">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Request Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedType ? `${getTypeConfig(selectedType as RequestType).icon} ${getTypeConfig(selectedType as RequestType).label}` : '📝 New Request'}
                size="lg"
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={loading} className="btn btn-primary">
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Request Type */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                            Request Type
                        </label>
                        <select
                            id="type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="input"
                            required
                        >
                            <option value="">Select type...</option>
                            <option value="leave">Leave Request</option>
                            <option value="grant">Grant Application</option>
                            <option value="transfer">Transfer Request</option>
                            <option value="training">Training Request</option>
                            <option value="loan">Loan Request</option>
                        </select>
                    </div>

                    {/* Grant-specific fields */}
                    {formData.type === 'grant' && (
                        <>
                            <div>
                                <label htmlFor="grantName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Project/Grant Name
                                </label>
                                <input
                                    type="text"
                                    id="grantName"
                                    value={formData.grantName}
                                    onChange={(e) => setFormData({ ...formData, grantName: e.target.value })}
                                    placeholder="e.g. Community Health Research"
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="grantAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Requested Amount
                                </label>
                                <input
                                    type="number"
                                    id="grantAmount"
                                    value={formData.grantAmount}
                                    onChange={(e) => setFormData({ ...formData, grantAmount: e.target.value })}
                                    placeholder="0.00"
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="grantPurpose" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Grant Purpose
                                </label>
                                <textarea
                                    id="grantPurpose"
                                    value={formData.grantPurpose}
                                    onChange={(e) => setFormData({ ...formData, grantPurpose: e.target.value })}
                                    placeholder="Describe the purpose of this grant..."
                                    rows={4}
                                    className="input"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Leave-specific fields */}
                    {formData.type === 'leave' && (
                        <>
                            <div>
                                <label htmlFor="leaveType" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Leave Type
                                </label>
                                <select
                                    id="leaveType"
                                    value={formData.leaveType}
                                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                    className="input"
                                >
                                    <option value="annual">Annual Leave</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="special">Special Leave</option>
                                    <option value="maternity">Maternity/Paternity Leave</option>
                                    <option value="bereavement">Bereavement Leave</option>
                                    <option value="unpaid">Unpaid Leave</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="input"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Transfer-specific fields */}
                    {formData.type === 'transfer' && (
                        <>
                            <div>
                                <label htmlFor="transferLocation" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Requested Location
                                </label>
                                <select
                                    id="transferLocation"
                                    value={formData.transferLocation}
                                    onChange={(e) => setFormData({ ...formData, transferLocation: e.target.value })}
                                    className="input"
                                >
                                    <option value="">Select location...</option>
                                    <option value="headquarters">Headquarters</option>
                                    <option value="regional-north">Regional Office - North</option>
                                    <option value="regional-south">Regional Office - South</option>
                                    <option value="regional-east">Regional Office - East</option>
                                    <option value="regional-west">Regional Office - West</option>
                                    <option value="remote">Remote Work</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="transferDate" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Preferred Transfer Date
                                </label>
                                <input
                                    type="date"
                                    id="transferDate"
                                    value={formData.transferDate}
                                    onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                                    className="input"
                                />
                            </div>
                        </>
                    )}

                    {/* Training-specific fields */}
                    {formData.type === 'training' && (
                        <>
                            <div>
                                <label htmlFor="trainingProgram" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Training Program
                                </label>
                                <input
                                    type="text"
                                    id="trainingProgram"
                                    value={formData.trainingProgram}
                                    onChange={(e) => setFormData({ ...formData, trainingProgram: e.target.value })}
                                    placeholder="Name of training or course"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label htmlFor="trainingProvider" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Training Provider
                                </label>
                                <input
                                    type="text"
                                    id="trainingProvider"
                                    value={formData.trainingProvider}
                                    onChange={(e) => setFormData({ ...formData, trainingProvider: e.target.value })}
                                    placeholder="Institution or organization"
                                    className="input"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="trainingStart" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="trainingStart"
                                        value={formData.trainingStart}
                                        onChange={(e) => setFormData({ ...formData, trainingStart: e.target.value })}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="trainingEnd" className="block text-sm font-semibold text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="trainingEnd"
                                        value={formData.trainingEnd}
                                        onChange={(e) => setFormData({ ...formData, trainingEnd: e.target.value })}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="trainingCost" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Estimated Cost
                                </label>
                                <input
                                    type="number"
                                    id="trainingCost"
                                    value={formData.trainingCost}
                                    onChange={(e) => setFormData({ ...formData, trainingCost: e.target.value })}
                                    placeholder="0.00"
                                    className="input"
                                />
                            </div>
                        </>
                    )}

                    {/* Loan-specific fields */}
                    {formData.type === 'loan' && (
                        <>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Loan Amount
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label htmlFor="repaymentMonths" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Repayment Period (Months)
                                </label>
                                <input
                                    type="number"
                                    id="repaymentMonths"
                                    value={formData.repaymentMonths}
                                    onChange={(e) => setFormData({ ...formData, repaymentMonths: e.target.value })}
                                    placeholder="e.g. 12"
                                    className="input"
                                />
                            </div>
                        </>
                    )}

                    {/* Common fields (but not for Grant if it has its own Description, or maybe share it?) */}
                    {formData.type !== 'grant' && (
                        <div>
                            <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
                                Reason / Additional Details
                            </label>
                            <textarea
                                id="reason"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Please provide details for your request..."
                                rows={4}
                                className="input"
                                required
                            />
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
}
