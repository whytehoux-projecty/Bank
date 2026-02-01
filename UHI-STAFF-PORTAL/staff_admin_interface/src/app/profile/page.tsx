'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}

function ProfileContent() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // 2FA States
    const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [showSetup, setShowSetup] = useState(false);

    const handleEnable2FA = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await API.request<any>('/auth/2fa/setup', {
                method: 'POST',
                auth: true
            });
            if (res.data) {
                setSetupData(res.data);
                setShowSetup(true);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to initiate 2FA setup' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await API.request('/auth/2fa/enable', {
                method: 'POST',
                auth: true,
                body: { token: verificationCode }
            });
            setMessage({ type: 'success', text: 'Two-factor authentication enabled successfully!' });
            setShowSetup(false);
            setSetupData(null);
            setVerificationCode('');
            updateUser({ isTwoFactorEnabled: true });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Verification failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm('Are you sure you want to disable 2FA? Your account will be less secure.')) return;

        setLoading(true);
        setMessage(null);
        try {
            await API.request('/auth/2fa/disable', {
                method: 'POST',
                auth: true
            });
            setMessage({ type: 'success', text: 'Two-factor authentication disabled.' });
            updateUser({ isTwoFactorEnabled: false });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to disable 2FA' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminHeader />
            <main className="flex-1 lg:ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

                    {/* User Info Card */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center text-3xl font-bold">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
                                <p className="text-gray-500">{user?.email}</p>
                                <p className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-block mt-2 capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">Security Settings</h3>

                        {message && (
                            <div className={`mb-6 p-4 rounded-lg border flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                <span>{message.type === 'success' ? '✅' : '❌'}</span>
                                {message.text}
                            </div>
                        )}

                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-900">Two-Factor Authentication (2FA)</h4>
                                <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account by requiring a code from your authenticator app.</p>
                            </div>

                            {user?.isTwoFactorEnabled ? (
                                <button
                                    onClick={handleDisable2FA}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                                >
                                    Disable 2FA
                                </button>
                            ) : (
                                <button
                                    onClick={handleEnable2FA}
                                    disabled={loading || showSetup}
                                    className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm"
                                >
                                    Enable 2FA
                                </button>
                            )}
                        </div>

                        {/* Setup Area */}
                        {showSetup && setupData && (
                            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
                                <h4 className="font-bold text-gray-900 mb-4">Setup Two-Factor Authentication</h4>

                                <ol className="list-decimal list-inside space-y-4 text-gray-700 text-sm mb-6">
                                    <li>Install an authenticator app like Google Authenticator or Authy.</li>
                                    <li>Scan the QR code below or enter the setup key manually.</li>
                                    <li>Enter the 6-digit code from the app to verify.</li>
                                </ol>

                                <div className="flex flex-col md:flex-row gap-8 items-center mb-6">
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Manual Entry Key</label>
                                        <div className="font-mono bg-white border border-gray-300 px-4 py-3 rounded-lg text-lg tracking-widest select-all mb-4">
                                            {setupData.secret}
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-xs">
                                    <label htmlFor="verifyCode" className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            id="verifyCode"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary-color)] outline-none text-center tracking-widest text-lg"
                                            placeholder="000000"
                                            maxLength={6}
                                        />
                                        <button
                                            onClick={handleVerify2FA}
                                            disabled={loading || verificationCode.length !== 6}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => { setShowSetup(false); setSetupData(null); }}
                                        className="text-gray-500 text-xs mt-4 hover:text-gray-700 underline"
                                    >
                                        Cancel Setup
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
