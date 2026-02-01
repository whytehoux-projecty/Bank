'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';

type PayrollStatus = 'pending' | 'paid' | 'processing';

interface PayrollRecord {
    id: string;
    staffId: string;
    staffName: string;
    department: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netPay: number;
    status: PayrollStatus;
}

export default function PayrollPage() {
    return (
        <ProtectedRoute>
            <PayrollContent />
        </ProtectedRoute>
    );
}

function PayrollContent() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
    const [filteredPayroll, setFilteredPayroll] = useState<PayrollRecord[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
    const [showRunPayrollModal, setShowRunPayrollModal] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Period selection
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');

    useEffect(() => {
        loadPayroll();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        applyFilters();
    }, [payroll, searchQuery, departmentFilter]);

    const loadPayroll = async () => {
        setLoading(true);
        try {
            // Updated endpoint to match backend definition in finance.routes.ts
            const res = await API.request(`/finance/admin/payroll/records?month=${selectedMonth}&year=${selectedYear}`, { auth: true });
            const payrollData = res?.data || [];

            // Map backend response to frontend PayrollRecord interface
            const mappedPayroll: PayrollRecord[] = payrollData.map((record: any) => ({
                id: record.id,
                staffId: record.user?.staff_id || 'N/A',
                staffName: `${record.user?.first_name || ''} ${record.user?.last_name || ''}`.trim() || 'Unknown Staff',
                department: record.user?.staff_profile?.department || 'Unassigned',
                basicSalary: record.basic_salary,
                allowances: record.allowances,
                deductions: record.deductions,
                netPay: record.net_pay,
                status: record.status as PayrollStatus
            }));

            setPayroll(mappedPayroll);
        } catch (error) {
            console.error('Error loading payroll:', error);
            setMessage({ type: 'error', text: 'Failed to load payroll records' });
            setPayroll([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...payroll];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (record) =>
                    record.staffName.toLowerCase().includes(query) ||
                    record.staffId.toLowerCase().includes(query) ||
                    record.department.toLowerCase().includes(query)
            );
        }

        // Department filter
        if (departmentFilter !== 'all') {
            filtered = filtered.filter((record) => record.department.toLowerCase() === departmentFilter.toLowerCase());
        }

        setFilteredPayroll(filtered);
    };

    const handleRunPayroll = async () => {
        if (!confirm('Are you sure you want to run payroll for all staff? This action cannot be undone.')) return;

        setLoading(true);
        setMessage(null);

        try {
            // Updated endpoint to match backend definition in finance.routes.ts
            await API.request('/finance/admin/payroll/generate', {
                method: 'POST',
                auth: true,
                body: {
                    month: selectedMonth,
                    year: selectedYear,
                },
            });

            setMessage({ type: 'success', text: 'Payroll processed successfully!' });
            setShowRunPayrollModal(false);
            loadPayroll();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to process payroll' });
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedRecords.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one record' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setMessage({ type: 'success', text: `${action} completed for ${selectedRecords.length} records!` });
            setSelectedRecords([]);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || `Failed to ${action}` });
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedRecords.length === filteredPayroll.length) {
            setSelectedRecords([]);
        } else {
            setSelectedRecords(filteredPayroll.map((r) => r.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedRecords.includes(id)) {
            setSelectedRecords(selectedRecords.filter((r) => r !== id));
        } else {
            setSelectedRecords([...selectedRecords, id]);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getMonthName = (month: number) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1];
    };

    const stats = {
        totalStaff: payroll.length,
        totalPayroll: payroll.reduce((sum, r) => sum + r.netPay, 0),
        pending: payroll.filter((r) => r.status === 'pending').length,
        totalBasic: filteredPayroll.reduce((sum, r) => sum + r.basicSalary, 0),
        totalAllowances: filteredPayroll.reduce((sum, r) => sum + r.allowances, 0),
        totalDeductions: filteredPayroll.reduce((sum, r) => sum + r.deductions, 0),
        grandTotal: filteredPayroll.reduce((sum, r) => sum + r.netPay, 0),
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
                                <h1 className="text-3xl font-bold text-white">💰 Payroll Management</h1>
                                <p className="text-blue-100 mt-2">Manage staff salaries, generate payslips, and process payments</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="btn bg-white/20 text-white hover:bg-white/30 border border-white/30">
                                    📊 Export All
                                </button>
                                <button
                                    onClick={() => setShowRunPayrollModal(true)}
                                    className="btn bg-white text-[#1a365d] hover:bg-gray-100"
                                >
                                    ▶️ Run Payroll
                                </button>
                            </div>
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
                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-500">
                            <div className="text-3xl mb-2">👥</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.totalStaff}</div>
                            <div className="text-sm text-gray-600 mt-1">Total Staff</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-green-500">
                            <div className="text-3xl mb-2">💵</div>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPayroll)}</div>
                            <div className="text-sm text-gray-600 mt-1">Total Monthly Payroll</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-orange-500">
                            <div className="text-3xl mb-2">⏳</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
                            <div className="text-sm text-gray-600 mt-1">Pending Payments</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-purple-500">
                            <div className="text-3xl mb-2">📅</div>
                            <div className="text-xl font-bold text-gray-900">Jan 25</div>
                            <div className="text-sm text-gray-600 mt-1">Next Pay Day</div>
                        </div>
                    </div>

                    {/* Period Selector */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Payroll Period</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        if (selectedMonth === 1) {
                                            setSelectedMonth(12);
                                            setSelectedYear(selectedYear - 1);
                                        } else {
                                            setSelectedMonth(selectedMonth - 1);
                                        }
                                    }}
                                    className="btn btn-secondary"
                                >
                                    ← Previous
                                </button>

                                <div className="flex gap-3">
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        className="input"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                            <option key={month} value={month}>
                                                {getMonthName(month)}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="input"
                                    >
                                        <option value={2026}>2026</option>
                                        <option value={2025}>2025</option>
                                        <option value={2024}>2024</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => {
                                        if (selectedMonth === 12) {
                                            setSelectedMonth(1);
                                            setSelectedYear(selectedYear + 1);
                                        } else {
                                            setSelectedMonth(selectedMonth + 1);
                                        }
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Next →
                                </button>
                            </div>

                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stats.pending > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                    }`}
                            >
                                {stats.pending > 0 ? 'Not Processed' : 'Processed'}
                            </span>
                        </div>
                    </div>

                    {/* Filters & Bulk Actions */}
                    <div className="bg-white rounded-xl shadow-sm mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search staff..."
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <select
                                        value={departmentFilter}
                                        onChange={(e) => setDepartmentFilter(e.target.value)}
                                        className="input"
                                    >
                                        <option value="all">All Departments</option>
                                        <option value="engineering">Engineering</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="finance">Finance</option>
                                        <option value="hr">HR</option>
                                        <option value="sales">Sales</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Bulk Actions Bar */}
                        {selectedRecords.length > 0 && (
                            <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] p-4 flex items-center justify-between">
                                <span className="text-white font-medium">{selectedRecords.length} selected</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleBulkAction('Generate Payslips')}
                                        className="btn btn-sm bg-white/20 text-white hover:bg-white/30"
                                    >
                                        📄 Generate Payslips
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('Email Payslips')}
                                        className="btn btn-sm bg-white/20 text-white hover:bg-white/30"
                                    >
                                        📧 Email Payslips
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('Process Payments')}
                                        className="btn btn-sm bg-white text-[#1a365d] hover:bg-gray-100"
                                    >
                                        💳 Process Payments
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Payroll Table */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[var(--primary-color)]"></div>
                                <p className="text-gray-600 mt-4">Loading...</p>
                            </div>
                        ) : filteredPayroll.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4 opacity-50">💰</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No payroll records found</h3>
                                <p className="text-gray-600">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRecords.length === filteredPayroll.length}
                                                        onChange={toggleSelectAll}
                                                        className="rounded"
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Staff Member
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Department
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Basic Salary
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Allowances
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Deductions
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Net Pay
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
                                            {filteredPayroll.map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRecords.includes(record.id)}
                                                            onChange={() => toggleSelect(record.id)}
                                                            className="rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-[#1a365d] text-white flex items-center justify-center font-semibold">
                                                                {record.staffName
                                                                    .split(' ')
                                                                    .map((n) => n[0])
                                                                    .join('')}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{record.staffName}</div>
                                                                <div className="text-sm text-gray-500">{record.staffId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {record.department}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatCurrency(record.basicSalary)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                        +{formatCurrency(record.allowances)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                        -{formatCurrency(record.deductions)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        {formatCurrency(record.netPay)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : record.status === 'paid'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                                }`}
                                                        >
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <button className="text-[var(--primary-color)] hover:text-[var(--primary-dark)]">
                                                                View
                                                            </button>
                                                            <button className="text-blue-600 hover:text-blue-800">Edit</button>
                                                            <button className="text-green-600 hover:text-green-800">📄</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary Footer */}
                                <div className="bg-gray-50 p-6 border-t-2 border-gray-200">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase mb-1">Total Basic</div>
                                            <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalBasic)}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase mb-1">Total Allowances</div>
                                            <div className="text-lg font-bold text-green-600">{formatCurrency(stats.totalAllowances)}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase mb-1">Total Deductions</div>
                                            <div className="text-lg font-bold text-red-600">-{formatCurrency(stats.totalDeductions)}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase mb-1">Grand Total</div>
                                            <div className="text-xl font-bold text-[#1a365d]">{formatCurrency(stats.grandTotal)}</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Run Payroll Modal */}
            {showRunPayrollModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slide-up">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">▶️ Run Payroll</h3>
                            <button
                                onClick={() => setShowRunPayrollModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Period</div>
                                    <div className="font-semibold text-gray-900">
                                        {getMonthName(selectedMonth)} {selectedYear}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Staff Count</div>
                                    <div className="font-semibold text-gray-900">{stats.totalStaff}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Estimated Total</div>
                                    <div className="font-semibold text-gray-900">{formatCurrency(stats.totalPayroll)}</div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <span className="text-xl">⚠️</span>
                                    <div>
                                        <strong className="text-yellow-900">Warning:</strong>
                                        <p className="text-sm text-yellow-800 mt-1">
                                            This action will process payroll for all active staff members for the selected period. This cannot be
                                            undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button onClick={() => setShowRunPayrollModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleRunPayroll} disabled={loading} className="btn bg-[#1a365d] text-white hover:bg-[#2c5282]">
                                {loading ? 'Processing...' : '▶️ Process Payroll'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
