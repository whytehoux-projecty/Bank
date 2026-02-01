'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API } from '@/lib/api';
import Modal from '@/components/ui/Modal';

// Initialize Stripe
// Replace with your actual publishable key or env var
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    loanId: string;
    amount: number;
    onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, loanId, amount, onSuccess }: PaymentModalProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && loanId && amount) {
            setLoading(true);
            setError(null);

            // Initiate payment on backend to get clientSecret
            API.request(`/finance/loans/${loanId}/pay`, {
                method: 'POST',
                auth: true, // Assuming API handles auth header
                body: { amount }
            })
                .then(res => {
                    if (res.data && res.data.clientSecret) {
                        setClientSecret(res.data.clientSecret);
                    } else {
                        setError('Invalid response from server');
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Payment init error:", err);
                    setError(err.message || "Failed to initiate payment");
                    setLoading(false);
                });
        } else {
            setClientSecret(null);
            setError(null);
        }
    }, [isOpen, loanId, amount]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="💳 Secure Payment"
            size="md"
            footer={null} // We handle buttons in the form
        >
            {error ? (
                <div className="text-red-600 p-4 bg-red-50 rounded mb-4">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                    <button onClick={onClose} className="mt-2 btn btn-secondary btn-sm">Close</button>
                </div>
            ) : loading || !clientSecret ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                    <p className="text-gray-500">Initializing secure payment...</p>
                </div>
            ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm
                        onSuccess={onSuccess}
                        onClose={onClose}
                        amount={amount}
                    />
                </Elements>
            )}
        </Modal>
    );
}

function PaymentForm({ onSuccess, onClose, amount }: { onSuccess: () => void, onClose: () => void, amount: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: 'if_required'
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsProcessing(false);
        } else {
            setMessage("Payment successful!");
            // Short delay to show success message
            setTimeout(() => {
                onSuccess();
                setIsProcessing(false);
            }, 1000);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-blue-800 font-medium">Total to Pay:</span>
                    <span className="text-blue-900 font-bold text-lg">{formatCurrency(amount)}</span>
                </div>
            </div>

            <PaymentElement />

            {message && (
                <div className={`p-3 rounded text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                    disabled={isProcessing}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isProcessing || !stripe || !elements}
                    className="btn bg-[var(--primary-color)] text-white hover:opacity-90 w-full md:w-auto"
                >
                    {isProcessing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
                </button>
            </div>
        </form>
    );
}
