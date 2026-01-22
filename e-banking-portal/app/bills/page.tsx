'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api-client';
import { Plus, Check, X, Building, Tv, Shield, Zap, DollarSign, FileText, Upload, AlertCircle, Loader2 } from 'lucide-react';

export default function BillsPage() {
    const [payees, setPayees] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingPayee, setAddingPayee] = useState(false);
    const [selectedPayeeId, setSelectedPayeeId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // New Payee Form State
    const [newPayee, setNewPayee] = useState({ name: '', accountNumber: '', category: 'UTILITIES' });

    // Payment Form State
    const [amount, setAmount] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');

    // Invoice Payment State
    const [viewMode, setViewMode] = useState<'payees' | 'invoice'>('payees');
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Verification State
    const [verificationThreshold, setVerificationThreshold] = useState(10000);
    const [verificationStep, setVerificationStep] = useState(false); // If true, show verification UI
    const [verificationFile, setVerificationFile] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
        api.bills.getConfig().then(res => {
            if (res.threshold) setVerificationThreshold(res.threshold);
        }).catch(err => console.error('Failed to load config', err));
    }, []);

    const fetchData = async () => {
        try {
            const [payeesRes, accountsRes] = await Promise.all([
                api.bills.getPayees(),
                api.accounts.getAll()
            ]);
            setPayees(payeesRes.payees || []);
            setAccounts(accountsRes.accounts || []);
            if (accountsRes.accounts?.length > 0) {
                setSelectedAccountId(accountsRes.accounts[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch bills data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayee = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.bills.addPayee(newPayee);
            setAddingPayee(false);
            setNewPayee({ name: '', accountNumber: '', category: 'UTILITIES' });
            await fetchData();
        } catch (error) {
            alert('Failed to add payee');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePayBill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayeeId || !amount) return;

        setActionLoading(true);
        try {
            await api.bills.pay({
                payeeId: selectedPayeeId,
                amount: Number(amount),
                accountId: selectedAccountId
            });
            alert('Payment Successful!');
            setSelectedPayeeId(null);
            setAmount('');
            // Maybe refresh accounts to update balance
            fetchData();
        } catch (error: any) {
            alert(error?.reponse?.data?.message || 'Payment Failed');
        } finally {
            setActionLoading(false);
        }
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'UTILITIES': return <Zap className="w-6 h-6 text-yellow-500" />;
            case 'INTERNET': return <Tv className="w-6 h-6 text-blue-500" />;
            case 'INSURANCE': return <Shield className="w-6 h-6 text-green-500" />;
            default: return <Building className="w-6 h-6 text-gray-500" />;
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Max 5MB.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setUploadError(null);
        setInvoiceData(null);

        try {
            const res = await api.bills.uploadInvoice(formData);
            if (res && res.data) {
                setInvoiceData(res.data);
                if (res.data.amount) setAmount(res.data.amount.toString());
                if (res.data.paymentPin) {
                    // Could use this validation
                }
            } else {
                setUploadError('Failed to parse invoice data');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError('Error uploading invoice. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleInvoicePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        // Since we don't have a direct "Pay Invoice" API that takes the parsed data differently than a bill payment,
        // We will simulate it by treating the extracted data as a "One-time Bill Payment" or extracting the account number of the issuer.

        // Use extraction from invoiceData
        // For this implementation, we'll assume we are paying to a "Generic Biller" or the one extracted.

        if (!amount || !selectedAccountId) return;

        setActionLoading(true);
        try {
            // Check if payee exists or create a temp one? 
            // For now, we'll just use the regular pay endpoint but we might need a "One Time Payment" endpoint.
            // Since requirements asked for "Pay with Invoice", we'll assume standard flow.
            // We need a 'payeeId'. If we parsed a Service Code (UHI-2134), we can map it to a payee.

            // Allow user to select payee if not clear, or auto-create.
            // Simpler: Just allow paying extracting account number.

            // For now, ALERT as per prototype, or integrate if backend supports ad-hoc.
            // The backend `payBill` REQUIRES `payeeId`.
            // So we really should have matched the invoice to an existing Payee or created one.

            // Let's assume we match by Name or create one.
            // Or just alert "Payment Successful" for the demo if backend is strict.

            // Attempt to find payee by extracted name?
            // User can select Payee from list if not found.

            if (!selectedPayeeId) {
                alert("Please select a payee to link this invoice to, or add a new one.");
                setActionLoading(false);
                return;
            }

            await api.bills.pay({
                payeeId: selectedPayeeId,
                amount: Number(amount),
                accountId: selectedAccountId
            });

            alert('Invoice Paid Successfully!');
            resetInvoiceFlow();

        } catch (error: any) {
            alert(error?.response?.data?.message || 'Payment Failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifiedPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationFile || !selectedPayeeId || !selectedAccountId || !invoiceData) return;

        setActionLoading(true);
        const formData = new FormData();
        formData.append('file', verificationFile);
        formData.append('payeeId', selectedPayeeId);
        formData.append('amount', invoiceData.amount.toString());
        formData.append('accountId', selectedAccountId);

        try {
            const res = await api.bills.payVerified(formData);
            alert(`Payment Submitted for Verification! Ref: ${res.reference}`);
            resetInvoiceFlow();
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Verification Submission Failed');
        } finally {
            setActionLoading(false);
        }
    };

    const resetInvoiceFlow = () => {
        setInvoiceData(null);
        setAmount('');
        setUploadError(null);
        setVerificationStep(false);
        setVerificationFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchData();
    };

    // Ref for clearing
    const fileInputRef = React.useRef<HTMLInputElement>(null);


    if (loading) return <div className="p-8 text-center animate-pulse text-vintage-green">Loading bills...</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal mb-2 font-heading">Bill Payments</h1>
                    <p className="text-charcoal-light">Manage payees and schedule payments</p>
                </div>
                <Button
                    onClick={() => setAddingPayee(true)}
                    disabled={addingPayee}
                    icon={<Plus className="w-5 h-5" />}
                >
                    Add Payee
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200">
                <button
                    className={`pb-2 px-4 font-medium ${viewMode === 'payees' ? 'border-b-2 border-vintage-gold text-vintage-gold' : 'text-gray-500'}`}
                    onClick={() => setViewMode('payees')}
                >
                    Saved Payees
                </button>
                <button
                    className={`pb-2 px-4 font-medium ${viewMode === 'invoice' ? 'border-b-2 border-vintage-gold text-vintage-gold' : 'text-gray-500'}`}
                    onClick={() => setViewMode('invoice')}
                >
                    Pay with Invoice
                </button>
            </div>

            {/* Payees View */}
            {viewMode === 'payees' && (
                <>
                    {/* Add Payee Form */}
                    {addingPayee && (
                        <Card className="border-2 border-vintage-gold/20 bg-warm-white">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4">Add New Payee</h3>
                                <form onSubmit={handleAddPayee} className="grid md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Payee Name</label>
                                        <input
                                            aria-label="Payee Name"
                                            className="w-full p-2 border rounded" required
                                            value={newPayee.name}
                                            onChange={e => setNewPayee({ ...newPayee, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Account Number</label>
                                        <input
                                            aria-label="Account Number"
                                            className="w-full p-2 border rounded" required
                                            value={newPayee.accountNumber}
                                            onChange={e => setNewPayee({ ...newPayee, accountNumber: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Category</label>
                                        <select
                                            aria-label="Category"
                                            className="w-full p-2 border rounded"
                                            value={newPayee.category}
                                            onChange={e => setNewPayee({ ...newPayee, category: e.target.value })}
                                        >
                                            <option value="UTILITIES">Utilities</option>
                                            <option value="INTERNET">Internet/TV</option>
                                            <option value="INSURANCE">Insurance</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={actionLoading}>Save</Button>
                                        <Button type="button" variant="outline" onClick={() => setAddingPayee(false)}>Cancel</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payees List */}
                    <div className="grid gap-4">
                        {payees.length === 0 && !addingPayee ? (
                            <div className="text-center p-8 text-gray-500">No payees found. Add one to get started.</div>
                        ) : (
                            payees.map(payee => (
                                <Card key={payee.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    {getIcon(payee.category)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-charcoal">{payee.name}</h3>
                                                    <p className="text-sm text-gray-500">Acct: {payee.accountNumber}</p>
                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 mt-1 inline-block">
                                                        {payee.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant={selectedPayeeId === payee.id ? 'secondary' : 'primary'}
                                                onClick={() => {
                                                    if (selectedPayeeId === payee.id) setSelectedPayeeId(null);
                                                    else setSelectedPayeeId(payee.id);
                                                }}
                                            >
                                                {selectedPayeeId === payee.id ? 'Cancel' : 'Pay Bill'}
                                            </Button>
                                        </div>

                                        {/* Payment Form Overlay/Expansion */}
                                        {selectedPayeeId === payee.id && (
                                            <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                                <form onSubmit={handlePayBill} className="flex flex-wrap items-end gap-4">
                                                    <div className="flex-1 min-w-[200px]">
                                                        <label className="block text-sm font-medium mb-1">Pay From Account</label>
                                                        <select
                                                            aria-label="Pay From Account"
                                                            className="w-full p-2 border rounded"
                                                            value={selectedAccountId}
                                                            onChange={e => setSelectedAccountId(e.target.value)}
                                                        >
                                                            {accounts.map(acc => (
                                                                <option key={acc.id} value={acc.id}>
                                                                    {acc.accountNumber} ({acc.accountType}) - ${Number(acc.balance).toLocaleString()}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="w-32">
                                                        <label className="block text-sm font-medium mb-1">Amount</label>
                                                        <div className="relative">
                                                            <DollarSign className="w-4 h-4 absolute left-2 top-3 text-gray-400" />
                                                            <input
                                                                aria-label="Amount"
                                                                type="number"
                                                                min="0.01" step="0.01"
                                                                className="w-full p-2 pl-8 border rounded"
                                                                value={amount}
                                                                onChange={e => setAmount(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button type="submit" disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                                                        Confirm Payment
                                                    </Button>
                                                </form>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </>
            )}


            {/* Invoice Payment View */}
            {viewMode === 'invoice' && (
                <div className="max-w-3xl mx-auto">
                    {/* Step 0: Upload */}
                    {!invoiceData && (
                        <Card>
                            <CardContent className="p-12 text-center border-2 border-dashed border-gray-200 rounded-lg hover:border-vintage-gold transition-colors">
                                <input
                                    type="file"
                                    id="invoice-upload"
                                    className="hidden"
                                    accept="application/pdf"
                                    onChange={handleFileUpload}
                                    ref={fileInputRef}
                                    disabled={uploading}
                                />
                                <label htmlFor="invoice-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                    <div className="p-6 bg-gray-50 rounded-full">
                                        {uploading ? <Loader2 className="w-12 h-12 animate-spin text-vintage-gold" /> : <Upload className="w-12 h-12 text-gray-400" />}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-xl font-heading">Upload Invoice PDF</h3>
                                        <p className="text-gray-500">Upload your generated loan invoice to proceed with repayment.</p>
                                        <p className="text-xs text-gray-400">Supported format: PDF (Max 5MB)</p>
                                    </div>
                                    <div className="mt-4 px-6 py-2 bg-charcoal text-white rounded-md hover:bg-charcoal-light transition-colors inline-block">
                                        {uploading ? 'Processing Invoice...' : 'Select File'}
                                    </div>
                                </label>
                                {uploadError && (
                                    <div className="mt-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-center justify-center gap-2 border border-red-100">
                                        <AlertCircle className="w-5 h-5" />
                                        {uploadError}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 1: Payment Form */}
                    {invoiceData && !verificationStep && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-4">
                                <Button variant="ghost" onClick={() => { setInvoiceData(null); setAmount(''); }} className="text-gray-500 hover:text-charcoal pl-0">
                                    ← Upload Different Invoice
                                </Button>
                                <span className="px-3 py-1 bg-vintage-gold/10 text-vintage-gold text-xs font-bold uppercase tracking-wider rounded-full">
                                    Verified Invoice
                                </span>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                // Validation Logic
                                const account = accounts.find(a => a.id === selectedAccountId);
                                if (!account) return;

                                const totalAmount = (invoiceData.amount || 0); // No fees for loan repayment typically, or handled in invoice

                                if (Number(account.balance) < totalAmount) {
                                    alert(`Insufficient funds in ${account.accountNumber}. Available: ${Number(account.balance).toFixed(2)}`);
                                    return;
                                }

                                // Threshold check
                                if (totalAmount > verificationThreshold) {
                                    setVerificationStep(true);
                                    return;
                                }

                                // Standard Payment
                                if (!selectedPayeeId) {
                                    alert("Please select a payee linking for this payment.");
                                    setActionLoading(false);
                                    return;
                                }

                                setActionLoading(true);
                                try {
                                    await api.bills.pay({
                                        payeeId: selectedPayeeId,
                                        amount: Number(invoiceData.amount),
                                        accountId: selectedAccountId
                                    });
                                    alert('Invoice Paid Successfully!');
                                    resetInvoiceFlow();
                                } catch (error: any) {
                                    alert(error?.response?.data?.message || 'Payment Failed');
                                } finally {
                                    setActionLoading(false);
                                }
                            }}>
                                <Card>
                                    <CardContent className="p-0 overflow-hidden">
                                        {/* Header */}
                                        <div className="bg-gray-50 p-6 border-b border-gray-100">
                                            <h3 className="font-bold text-lg flex items-center gap-2 text-charcoal">
                                                <Shield className="w-5 h-5 text-vintage-gold" />
                                                Payment Review
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">Review the auto-filled details from your invoice before paying.</p>
                                        </div>

                                        <div className="p-6 grid gap-6">
                                            {/* Beneficiary Info - Read Only */}
                                            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                                <label className="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Beneficiary (Auto-filled)
                                                </label>
                                                <div className="font-bold text-lg text-charcoal">United Health Initiative (UHI)</div>
                                                <div className="text-sm text-gray-600 font-mono">Account: 99-8877-6655 (Official Collection)</div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">Invoice Number</label>
                                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700 font-mono text-sm flex justify-between items-center cursor-not-allowed opacity-75">
                                                        {invoiceData.invoiceNumber || 'INV-UNKNOWN'}
                                                        <Shield className="w-3 h-3 text-gray-400" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">Reference / PIN</label>
                                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700 font-mono text-sm cursor-not-allowed opacity-75">
                                                        {invoiceData.paymentPin || 'N/A'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">Service Category</label>
                                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700 text-sm cursor-not-allowed opacity-75">
                                                        Staff Loan Repayment
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">Amount Due</label>
                                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-900 font-bold text-sm cursor-not-allowed opacity-75">
                                                        ${invoiceData.amount?.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Editable Section */}
                                            <div className="pt-6 border-t border-gray-100">
                                                <label className="block text-sm font-bold text-charcoal mb-2">Pay From Account</label>
                                                <select
                                                    aria-label="Select Payment Account"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vintage-gold/20 focus:border-vintage-gold outline-none transition-all"
                                                    value={selectedAccountId}
                                                    onChange={e => setSelectedAccountId(e.target.value)}
                                                    required
                                                >
                                                    {accounts.map(acc => (
                                                        <option key={acc.id} value={acc.id}>
                                                            {acc.accountNumber} ({acc.accountType}) — Available: ${Number(acc.balance).toLocaleString()}
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedAccountId && (
                                                    <p className="text-xs text-gray-500 mt-2 text-right">
                                                        Daily Limit Remaining: ${Number(accounts.find(a => a.id === selectedAccountId)?.dailyLimit || 5000).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Summary */}
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>Invoice Amount</span>
                                                    <span>${invoiceData.amount?.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>Transaction Fee</span>
                                                    <span>$0.00</span>
                                                </div>
                                                <div className="border-t border-gray-200 pt-2 flex justify-between items-center font-bold text-charcoal">
                                                    <span>Total Debit Amount</span>
                                                    <span className="text-xl">${invoiceData.amount?.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={actionLoading}
                                                className="w-full bg-charcoal hover:bg-charcoal-light text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                                            >
                                                {actionLoading ? 'Processing...' : 'Proceed with Payment'}
                                            </Button>
                                            <p className="text-center text-xs text-gray-400">
                                                By proceeding, you authorize Aurum Vault to debit the total amount from your selected account.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        </div>
                    )}

                    {/* Step 2: Verification UI */}
                    {verificationStep && invoiceData && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            {/* Content... */}
                            <div className="flex items-center justify-between mb-4">
                                <Button variant="ghost" onClick={() => setVerificationStep(false)} className="text-gray-500 hover:text-charcoal pl-0">
                                    ← Back to Review
                                </Button>
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Step 2/2: Verification
                                </span>
                            </div>

                            <Card className="border-2 border-amber-200 bg-amber-50/30">
                                <CardContent className="p-8">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Shield className="w-8 h-8 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-charcoal">Additional Verification Required</h3>
                                        <p className="text-gray-600 mt-2 max-w-md mx-auto">
                                            This transaction exceeds the threshold of <strong>${verificationThreshold.toLocaleString()}</strong>.
                                            Government regulations require a valid document for processing.
                                        </p>
                                    </div>

                                    <form onSubmit={handleVerifiedPayment} className="max-w-md mx-auto space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-2">Upload Identity Document (Passport/ID)</label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white hover:border-amber-400 transition-colors text-center cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    aria-label="Upload identity document"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={e => setVerificationFile(e.target.files?.[0] || null)}
                                                    required
                                                    accept="image/*,.pdf"
                                                />
                                                <div className="pointer-events-none">
                                                    {verificationFile ? (
                                                        <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                                                            <Check className="w-5 h-5" />
                                                            {verificationFile.name}
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-500">
                                                            <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                                            <span>Click to upload document</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={actionLoading || !verificationFile}
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 shadow-md"
                                        >
                                            {actionLoading ? 'Submitting secure payment...' : 'Submit Payment for Approval'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}


            {/* End View Mode Switch */}

        </div>
    );
}
