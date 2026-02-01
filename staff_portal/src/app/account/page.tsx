'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import StaffHeader from '@/components/layout/StaffHeader';
import PasswordInput from '@/components/ui/PasswordInput';
import Toggle from '@/components/ui/Toggle';

type Section = 'details' | 'security' | 'notifications' | 'preferences';

export default function AccountPage() {
    return (
        <ProtectedRoute>
            <AccountContent />
        </ProtectedRoute>
    );
}

function AccountContent() {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState<Section>('security');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Notification preferences
    const [notifications, setNotifications] = useState({
        emailLeaveApproval: true,
        emailPayroll: true,
        emailLoanStatus: true,
        emailSystemUpdates: false,
        emailNewsletter: false,
    });

    // User preferences
    const [preferences, setPreferences] = useState({
        language: 'en',
        timezone: 'UTC',
        theme: 'light',
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validation
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordStrength < 3) {
            setMessage({ type: 'error', text: 'Password is too weak. Please use a stronger password.' });
            return;
        }

        setLoading(true);
        try {
            await API.request('/auth/change-password', {
                method: 'PUT',
                auth: true,
                body: {
                    currentPassword,
                    newPassword,
                },
            });

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await API.request('/staff/profile/notifications', {
                method: 'PUT',
                auth: true,
                body: notifications,
            });
            setMessage({ type: 'success', text: 'Notification preferences updated!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update preferences' });
        } finally {
            setLoading(false);
        }
    };

    const handlePreferencesUpdate = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await API.request('/staff/profile/preferences', {
                method: 'PUT',
                auth: true,
                body: preferences,
            });
            setMessage({ type: 'success', text: 'Preferences updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update preferences' });
        } finally {
            setLoading(false);
        }
    };

    const getFullName = () => {
        if (!user) return 'User';
        const firstName = user.firstName || user.first_name || 'User';
        const lastName = user.lastName || user.last_name || '';
        return `${firstName} ${lastName}`.trim();
    };

    const sections = [
        { id: 'details' as Section, icon: '👤', label: 'My Details' },
        { id: 'security' as Section, icon: '🔒', label: 'Password & Security' },
        { id: 'notifications' as Section, icon: '🔔', label: 'Notifications' },
        { id: 'preferences' as Section, icon: '⚙️', label: 'Preferences' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <StaffHeader />

            {/* Page Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container-custom py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account preferences and security settings</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <aside className="lg:col-span-1">
                        <nav className="space-y-1 sticky top-24">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeSection === section.id
                                            ? 'bg-[var(--primary-color)] text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    <span className="text-xl">{section.icon}</span>
                                    <span>{section.label}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        {/* Alert Messages */}
                        {message && (
                            <div
                                className={`mb-6 p-4 rounded-lg border-2 animate-fade-in ${message.type === 'success'
                                        ? 'bg-green-50 border-green-200 text-green-800'
                                        : 'bg-red-50 border-red-200 text-red-800'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">
                                        {message.type === 'success' ? '✅' : '❌'}
                                    </span>
                                    <span className="font-medium">{message.text}</span>
                                </div>
                            </div>
                        )}

                        {/* My Details Section */}
                        {activeSection === 'details' && (
                            <div className="card">
                                <div className="border-b border-gray-200 pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <span>👤</span> My Details
                                    </h2>
                                    <p className="text-gray-600 mt-1">Your personal information (read-only)</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <div className="input bg-gray-50 cursor-not-allowed">
                                            {getFullName()}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Staff ID
                                        </label>
                                        <div className="input bg-gray-50 cursor-not-allowed">
                                            {user?.staffId || user?.staff_id || 'N/A'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="input bg-gray-50 cursor-not-allowed">
                                            {user?.email || 'N/A'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Position
                                        </label>
                                        <div className="input bg-gray-50 cursor-not-allowed">
                                            {user?.position || user?.position_title || 'N/A'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Department
                                        </label>
                                        <div className="input bg-gray-50 cursor-not-allowed">
                                            {user?.department || 'N/A'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <div className="input bg-gray-50 cursor-not-allowed">
                                            {user?.staffProfile?.phone || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> To update your personal information, please contact HR department.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Security Section */}
                        {activeSection === 'security' && (
                            <div className="card">
                                <div className="border-b border-gray-200 pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <span>🔒</span> Password & Security
                                    </h2>
                                    <p className="text-gray-600 mt-1">Manage your password and security settings</p>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <PasswordInput
                                            id="currentPassword"
                                            value={currentPassword}
                                            onChange={setCurrentPassword}
                                            placeholder="Enter current password"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <PasswordInput
                                            id="newPassword"
                                            value={newPassword}
                                            onChange={setNewPassword}
                                            placeholder="Enter new password"
                                            required
                                            disabled={loading}
                                            showStrength
                                            onStrengthChange={setPasswordStrength}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <PasswordInput
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={setConfirmPassword}
                                            placeholder="Confirm new password"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Password Requirements */}
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-3">Password Requirements:</h4>
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            <li className="flex items-center gap-2">
                                                <span className={newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}>
                                                    {newPassword.length >= 8 ? '✓' : '○'}
                                                </span>
                                                At least 8 characters
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className={/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}>
                                                    {/[A-Z]/.test(newPassword) ? '✓' : '○'}
                                                </span>
                                                One uppercase letter
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className={/[a-z]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}>
                                                    {/[a-z]/.test(newPassword) ? '✓' : '○'}
                                                </span>
                                                One lowercase letter
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className={/\d/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}>
                                                    {/\d/.test(newPassword) ? '✓' : '○'}
                                                </span>
                                                One number
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className={/[@$!%*?&]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}>
                                                    {/[@$!%*?&]/.test(newPassword) ? '✓' : '○'}
                                                </span>
                                                One special character (@$!%*?&)
                                            </li>
                                        </ul>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || passwordStrength < 3}
                                        className="btn btn-primary"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Updating...
                                            </span>
                                        ) : (
                                            '🔐 Update Password'
                                        )}
                                    </button>
                                </form>

                                {/* Security Info */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Security Information</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Password Change:</span>
                                            <span className="font-semibold">Never</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Login:</span>
                                            <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Account Created:</span>
                                            <span className="font-semibold">
                                                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Section */}
                        {activeSection === 'notifications' && (
                            <div className="card">
                                <div className="border-b border-gray-200 pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <span>🔔</span> Notification Preferences
                                    </h2>
                                    <p className="text-gray-600 mt-1">Choose what notifications you want to receive</p>
                                </div>

                                <div className="space-y-4">
                                    <Toggle
                                        id="emailLeaveApproval"
                                        checked={notifications.emailLeaveApproval}
                                        onChange={(checked) => setNotifications({ ...notifications, emailLeaveApproval: checked })}
                                        label="Leave Approval Notifications"
                                        description="Get notified when your leave requests are approved or rejected"
                                    />

                                    <Toggle
                                        id="emailPayroll"
                                        checked={notifications.emailPayroll}
                                        onChange={(checked) => setNotifications({ ...notifications, emailPayroll: checked })}
                                        label="Payroll Notifications"
                                        description="Receive alerts when new payslips are available"
                                    />

                                    <Toggle
                                        id="emailLoanStatus"
                                        checked={notifications.emailLoanStatus}
                                        onChange={(checked) => setNotifications({ ...notifications, emailLoanStatus: checked })}
                                        label="Loan Status Updates"
                                        description="Get updates on your loan applications and repayments"
                                    />

                                    <Toggle
                                        id="emailSystemUpdates"
                                        checked={notifications.emailSystemUpdates}
                                        onChange={(checked) => setNotifications({ ...notifications, emailSystemUpdates: checked })}
                                        label="System Updates"
                                        description="Receive notifications about system maintenance and updates"
                                    />

                                    <Toggle
                                        id="emailNewsletter"
                                        checked={notifications.emailNewsletter}
                                        onChange={(checked) => setNotifications({ ...notifications, emailNewsletter: checked })}
                                        label="Newsletter & Announcements"
                                        description="Stay informed with company news and announcements"
                                    />
                                </div>

                                <button
                                    onClick={handleNotificationUpdate}
                                    disabled={loading}
                                    className="btn btn-primary mt-6"
                                >
                                    {loading ? 'Saving...' : '💾 Save Preferences'}
                                </button>
                            </div>
                        )}

                        {/* Preferences Section */}
                        {activeSection === 'preferences' && (
                            <div className="card">
                                <div className="border-b border-gray-200 pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <span>⚙️</span> General Preferences
                                    </h2>
                                    <p className="text-gray-600 mt-1">Customize your portal experience</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Language */}
                                    <div>
                                        <label htmlFor="language" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Language
                                        </label>
                                        <select
                                            id="language"
                                            value={preferences.language}
                                            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                            className="input"
                                        >
                                            <option value="en">English</option>
                                            <option value="fr">Français</option>
                                            <option value="es">Español</option>
                                            <option value="ar">العربية</option>
                                        </select>
                                    </div>

                                    {/* Timezone */}
                                    <div>
                                        <label htmlFor="timezone" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Timezone
                                        </label>
                                        <select
                                            id="timezone"
                                            value={preferences.timezone}
                                            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                                            className="input"
                                        >
                                            <option value="UTC">UTC (Coordinated Universal Time)</option>
                                            <option value="Africa/Nairobi">EAT (East Africa Time)</option>
                                            <option value="Africa/Lagos">WAT (West Africa Time)</option>
                                            <option value="Europe/London">GMT (Greenwich Mean Time)</option>
                                            <option value="America/New_York">EST (Eastern Standard Time)</option>
                                        </select>
                                    </div>

                                    {/* Theme */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Theme
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { value: 'light', label: 'Light', icon: '☀️' },
                                                { value: 'dark', label: 'Dark', icon: '🌙' },
                                                { value: 'auto', label: 'Auto', icon: '🔄' },
                                            ].map((theme) => (
                                                <button
                                                    key={theme.value}
                                                    type="button"
                                                    onClick={() => setPreferences({ ...preferences, theme: theme.value })}
                                                    className={`p-4 rounded-lg border-2 transition-all ${preferences.theme === theme.value
                                                            ? 'border-[var(--primary-color)] bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="text-3xl mb-2">{theme.icon}</div>
                                                    <div className="font-semibold">{theme.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePreferencesUpdate}
                                    disabled={loading}
                                    className="btn btn-primary mt-6"
                                >
                                    {loading ? 'Saving...' : '💾 Save Preferences'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
