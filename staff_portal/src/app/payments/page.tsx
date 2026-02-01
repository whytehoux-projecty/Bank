'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import StaffHeader from '@/components/layout/StaffHeader';
import Modal from '@/components/ui/Modal';
import PaymentModal from '@/components/finance/PaymentModal';

type Tab = 'payroll' | 'loans' | 'benefits';

interface PayrollRecord {
    id: string;
    period: string;
    payDate: string;
    grossPay: number;
    deductions: number;
    netPay: number;
    status: 'paid' | 'pending' | 'processing';
}

interface Loan {
    id: string;
    type: string;
    amount: number;
    balance: number;
    monthlyPayment: number;
    nextPayment: string;
    status: 'active' | 'completed' | 'pending';
    progress: number;
}

export default function PaymentsPage() {
    return (
        <ProtectedRoute>
            <PaymentsContent />
        </ProtectedRoute>
    );
}

function PaymentsContent() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('payroll');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Modals
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

    // Loan application form
    const [loanForm, setLoanForm] = useState({
        type: 'emergency',
        amount: '',
        purpose: '',
        repaymentMonths: '12',
    });

    // Data states
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [benefits, setBenefits] = useState<any[]>([]); // Add benefits state

    const fetchData = async () => {
        setLoading(true);
        try {
            const [payrollRes, loansRes, benefitsRes] = await Promise.all([
                API.request('/finance/payroll', { auth: true }),
                API.request('/finance/loans', { auth: true }),
                API.request('/finance/benefits', { auth: true })
            ]);

            if (payrollRes?.data) setPayrollRecords(payrollRes.data.map((r: any) => ({
                id: r.id,
                period: r.period,
                payDate: r.pay_date,
                grossPay: r.gross_pay,
                deductions: r.deductions,
                netPay: r.net_pay,
                status: r.status
            })));

            if (loansRes?.data) setLoans(loansRes.data.map((l: any) => ({
                id: l.id,
                type: l.type, // Map 'type' or similar
                amount: l.amount,
                balance: l.balance,
                monthlyPayment: l.monthly_payment,
                nextPayment: l.next_payment_date || new Date().toISOString(), // Fallback
                status: l.status,
                progress: l.amount > 0 ? Math.round(((l.amount - l.balance) / l.amount) * 100) : 0
            })));

            if (benefitsRes?.data) setBenefits(benefitsRes.data);

        } catch (error) {
            console.error('Failed to load finance data:', error);
            setMessage({ type: 'error', text: 'Failed to load financial data.' });
        } finally {
            setLoading(false);
        }
    };

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, []);

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        setMessage({ type: 'success', text: 'Payment processed successfully!' });
        fetchData(); // Reload data to update balances
    };

    const stats = {
        lastNetPay: payrollRecords.length > 0 ? payrollRecords[0].netPay : 0,
        ytdEarnings: payrollRecords.reduce((sum, r) => sum + Number(r.netPay), 0),
        taxPaid: payrollRecords.reduce((sum, r) => sum + Number(r.deductions), 0),
        activeLoanBalance: loans.reduce((sum, l) => sum + Number(l.balance), 0),
        monthlyLoanPayment: loans.reduce((sum, l) => sum + Number(l.monthlyPayment), 0),
    };

    const handleLoanApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await API.request('/finance/loans', {
                method: 'POST',
                auth: true,
                body: loanForm,
            });

            setMessage({ type: 'success', text: 'Loan application submitted successfully!' });
            setShowLoanModal(false);
            setLoanForm({ type: 'emergency', amount: '', purpose: '', repaymentMonths: '12' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to submit loan application' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPayslip = async (payrollId: string) => {
        try {
            await API.download(`/finance/payroll/${payrollId}/pdf`, `payslip-${payrollId}.pdf`);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to download payslip' });
        }
    };

    const handleGenerateInvoice = (loan: Loan) => {
        setSelectedLoan(loan);
        setShowInvoiceModal(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const tabs = [
        { id: 'payroll' as Tab, icon: '🧾', label: 'Payslips & History' },
        { id: 'loans' as Tab, icon: '💳', label: 'Loans & Grants' },
        { id: 'benefits' as Tab, icon: '🎁', label: 'Benefits' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <StaffHeader />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] text-white">
                <div className="container-custom py-8">
                    <h1 className="text-3xl font-bold">💰 Payments & Finance</h1>
                    <p className="text-blue-100 mt-2">Manage your payroll, loans, and benefits</p>
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

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 -mb-px ${activeTab === tab.id
                                ? 'border-red-500 text-[#1a365d]'
                                : 'border-transparent text-gray-600 hover:text-[#1a365d]'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Payroll Tab */}
                {activeTab === 'payroll' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <div className="text-4xl mb-2">💵</div>
                                <div className="text-3xl font-bold">{formatCurrency(stats.lastNetPay)}</div>
                                <div className="text-blue-100 text-sm mt-1">Last Net Pay</div>
                            </div>

                            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                                <div className="text-4xl mb-2">📊</div>
                                <div className="text-3xl font-bold">{formatCurrency(stats.ytdEarnings)}</div>
                                <div className="text-green-100 text-sm mt-1">YTD Earnings</div>
                            </div>

                            <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                                <div className="text-4xl mb-2">🏦</div>
                                <div className="text-3xl font-bold">{formatCurrency(stats.taxPaid)}</div>
                                <div className="text-orange-100 text-sm mt-1">Tax Paid (YTD)</div>
                            </div>
                        </div>

                        {/* Payroll History */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">📋 Payroll History</h3>
                                <button className="btn btn-secondary btn-sm">
                                    📥 Download Report
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pay Date</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Gross Pay</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Deductions</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Net Pay</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {payrollRecords.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 font-medium text-gray-900">{record.period}</td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {new Date(record.payDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-4 text-right font-semibold text-gray-900">
                                                    {formatCurrency(record.grossPay)}
                                                </td>
                                                <td className="px-4 py-4 text-right text-red-600">
                                                    -{formatCurrency(record.deductions)}
                                                </td>
                                                <td className="px-4 py-4 text-right font-bold text-green-600">
                                                    {formatCurrency(record.netPay)}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'paid'
                                                            ? 'bg-green-100 text-green-800'
                                                            : record.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                            }`}
                                                    >
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDownloadPayslip(record.id)}
                                                        className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] font-medium text-sm"
                                                    >
                                                        📄 View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loans Tab */}
                {activeTab === 'loans' && (
                    <div className="space-y-6">
                        {/* Loan Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <div className="text-4xl mb-2">💰</div>
                                <div className="text-3xl font-bold">{formatCurrency(stats.activeLoanBalance)}</div>
                                <div className="text-purple-100 text-sm mt-1">Total Loan Balance</div>
                            </div>

                            <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                                <div className="text-4xl mb-2">📅</div>
                                <div className="text-3xl font-bold">{formatCurrency(stats.monthlyLoanPayment)}</div>
                                <div className="text-pink-100 text-sm mt-1">Monthly Payment</div>
                            </div>
                        </div>

                        {/* Apply for Loan Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowLoanModal(true)}
                                className="btn btn-primary"
                            >
                                ➕ Apply for Loan
                            </button>
                        </div>

                        {/* Active Loans */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loans.map((loan) => (
                                <div key={loan.id} className="card border-2 border-gray-200 hover:border-[var(--primary-color)] transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900">{loan.type}</h4>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${loan.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : loan.status === 'completed'
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {loan.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-[var(--primary-color)]">
                                                {formatCurrency(loan.balance)}
                                            </div>
                                            <div className="text-xs text-gray-500">Balance</div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Progress</span>
                                            <span className="font-semibold">{loan.progress}% Repaid</span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                                                style={{ width: `${loan.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Loan Details */}
                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Original Amount:</span>
                                            <span className="font-semibold">{formatCurrency(loan.amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Monthly Payment:</span>
                                            <span className="font-semibold">{formatCurrency(loan.monthlyPayment)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Next Payment:</span>
                                            <span className="font-semibold">
                                                {new Date(loan.nextPayment).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleGenerateInvoice(loan)}
                                            className="flex-1 btn btn-primary btn-sm"
                                        >
                                            🧾 Generate Invoice
                                        </button>
                                        <button className="flex-1 btn btn-secondary btn-sm">
                                            📊 View History
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {loans.length === 0 && (
                            <div className="card text-center py-12">
                                <div className="text-6xl mb-4">💳</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Loans</h3>
                                <p className="text-gray-600 mb-6">You don't have any active loans at the moment.</p>
                                <button
                                    onClick={() => setShowLoanModal(true)}
                                    className="btn btn-primary"
                                >
                                    Apply for a Loan
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Benefits Tab */}
                {activeTab === 'benefits' && (
                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">🎁 Your Benefits Package</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                                    <div className="text-3xl mb-3">🏥</div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">Health Insurance</h4>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Comprehensive medical coverage for you and your family
                                    </p>
                                    <div className="text-sm text-gray-700">
                                        <div className="flex justify-between mb-1">
                                            <span>Coverage:</span>
                                            <span className="font-semibold">Full Family</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Provider:</span>
                                            <span className="font-semibold">GlobalHealth</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-green-50 rounded-lg border-2 border-green-200">
                                    <div className="text-3xl mb-3">🏖️</div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">Annual Leave</h4>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Paid time off for rest and recuperation
                                    </p>
                                    <div className="text-sm text-gray-700">
                                        <div className="flex justify-between mb-1">
                                            <span>Annual Allowance:</span>
                                            <span className="font-semibold">30 days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Used This Year:</span>
                                            <span className="font-semibold">12 days</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                                    <div className="text-3xl mb-3">🎓</div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">Training & Development</h4>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Professional development opportunities
                                    </p>
                                    <div className="text-sm text-gray-700">
                                        <div className="flex justify-between mb-1">
                                            <span>Annual Budget:</span>
                                            <span className="font-semibold">$2,000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Used:</span>
                                            <span className="font-semibold">$500</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-orange-50 rounded-lg border-2 border-orange-200">
                                    <div className="text-3xl mb-3">🏠</div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">Housing Allowance</h4>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Monthly housing support
                                    </p>
                                    <div className="text-sm text-gray-700">
                                        <div className="flex justify-between mb-1">
                                            <span>Monthly Amount:</span>
                                            <span className="font-semibold">$800</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <span className="font-semibold text-green-600">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Loan Application Modal */}
            <Modal
                isOpen={showLoanModal}
                onClose={() => setShowLoanModal(false)}
                title="💳 Apply for Loan"
                size="lg"
                footer={
                    <>
                        <button
                            onClick={() => setShowLoanModal(false)}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLoanApplication}
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleLoanApplication} className="space-y-6">
                    <div>
                        <label htmlFor="loanType" className="block text-sm font-semibold text-gray-700 mb-2">
                            Loan Type
                        </label>
                        <select
                            id="loanType"
                            value={loanForm.type}
                            onChange={(e) => setLoanForm({ ...loanForm, type: e.target.value })}
                            className="input"
                            required
                        >
                            <option value="emergency">Emergency Loan</option>
                            <option value="housing">Housing Advance</option>
                            <option value="education">Education Loan</option>
                            <option value="medical">Medical Loan</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                            Amount Requested
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={loanForm.amount}
                            onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                            placeholder="Enter amount"
                            className="input"
                            required
                            min="100"
                            max="50000"
                        />
                    </div>

                    <div>
                        <label htmlFor="repaymentMonths" className="block text-sm font-semibold text-gray-700 mb-2">
                            Repayment Period
                        </label>
                        <select
                            id="repaymentMonths"
                            value={loanForm.repaymentMonths}
                            onChange={(e) => setLoanForm({ ...loanForm, repaymentMonths: e.target.value })}
                            className="input"
                            required
                        >
                            <option value="6">6 months</option>
                            <option value="12">12 months</option>
                            <option value="18">18 months</option>
                            <option value="24">24 months</option>
                            <option value="36">36 months</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="purpose" className="block text-sm font-semibold text-gray-700 mb-2">
                            Purpose
                        </label>
                        <textarea
                            id="purpose"
                            value={loanForm.purpose}
                            onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
                            placeholder="Briefly explain the purpose of this loan..."
                            className="input"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Your loan application will be reviewed by the finance department.
                            You will receive a notification once a decision has been made.
                        </p>
                    </div>
                </form>
            </Modal>

            {/* Invoice Modal */}
            <Modal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                title="🧾 Loan Payment Invoice"
                size="lg"
                footer={
                    <>
                        <button
                            onClick={() => setShowInvoiceModal(false)}
                            className="btn btn-secondary"
                        >
                            Close
                        </button>
                        <button className="btn btn-primary">
                            📥 Download PDF
                        </button>
                        <button
                            onClick={() => {
                                setShowInvoiceModal(false);
                                setShowPaymentModal(true);
                            }}
                            className="btn bg-[var(--primary-color)] text-white hover:opacity-90"
                        >
                            💳 Pay Now
                        </button>
                    </>
                }
            >
                {selectedLoan && (
                    <div className="border-2 border-[#1a365d] rounded-xl overflow-hidden">
                        {/* Invoice Header */}
                        <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] text-white p-6 text-center">
                            <h2 className="text-2xl font-bold mb-1">PAYMENT INVOICE</h2>
                            <p className="text-blue-100 text-sm">United Health Initiative</p>
                        </div>

                        {/* Invoice Body */}
                        <div className="p-6 space-y-6">
                            {/* Invoice Details */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-dashed">
                                    Invoice Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Invoice Number:</span>
                                        <span className="font-semibold">INV-{selectedLoan.id}-{Date.now()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date Issued:</span>
                                        <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Due Date:</span>
                                        <span className="font-semibold">{new Date(selectedLoan.nextPayment).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Loan Information */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-dashed">
                                    Loan Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Loan Type:</span>
                                        <span className="font-semibold">{selectedLoan.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Original Amount:</span>
                                        <span className="font-semibold">{formatCurrency(selectedLoan.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Remaining Balance:</span>
                                        <span className="font-semibold">{formatCurrency(selectedLoan.balance)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Amount */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 font-semibold">Amount Due:</span>
                                    <span className="text-2xl font-bold text-red-600">
                                        {formatCurrency(selectedLoan.monthlyPayment)}
                                    </span>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h4 className="text-orange-800 font-semibold text-sm mb-3 flex items-center gap-2">
                                    <span>🏦</span> Bank Details
                                </h4>
                                <div className="space-y-1 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                        <span>Bank Name:</span>
                                        <span className="font-semibold">UHI Finance Bank</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Account Number:</span>
                                        <span className="font-semibold">1234567890</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Reference:</span>
                                        <span className="font-semibold">LOAN-{selectedLoan.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment PIN */}
                            <div className="bg-[#1a365d] text-white text-center p-4 rounded-lg">
                                <div className="text-xs uppercase tracking-wide opacity-80 mb-2">Payment PIN</div>
                                <div className="text-2xl font-bold tracking-widest font-mono">
                                    {Math.random().toString(36).substring(2, 10).toUpperCase()}
                                </div>
                            </div>

                            {/* QR Code Placeholder */}
                            <div className="text-center">
                                <div className="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg">
                                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                                        QR Code
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Scan to pay via mobile banking</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Payment Modal */}
            {selectedLoan && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    loanId={selectedLoan.id}
                    amount={selectedLoan.monthlyPayment}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}
