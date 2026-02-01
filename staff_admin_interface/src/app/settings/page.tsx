'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';

interface Setting {
    key: string;
    value: string;
}

type Tab = 'branding' | 'organization' | 'email' | 'workflow' | 'integrations';

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsContent />
        </ProtectedRoute>
    );
}

function SettingsContent() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('branding');

    // Branding & Content State
    const [portalName, setPortalName] = useState('Global Staff Portal');
    const [primaryColor, setPrimaryColor] = useState('#1a365d');
    const [secondaryColor, setSecondaryColor] = useState('#2c5282');
    const [loginSubtitle, setLoginSubtitle] = useState('Secure Access System');
    const [supportEmail, setSupportEmail] = useState('support@organization.org');
    const [dashboardWelcome, setDashboardWelcome] = useState('Welcome back, {name}');
    const [copyrightText, setCopyrightText] = useState('© 2026 Global Organization. All rights reserved.');
    const [logoPreview, setLogoPreview] = useState('');
    const [backgroundPreview, setBackgroundPreview] = useState('');

    // Organization Settings State
    const [timezone, setTimezone] = useState('UTC');
    const [currency, setCurrency] = useState('USD');
    const [language, setLanguage] = useState('en');
    const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
    const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00');

    // Email Settings State (Mock)
    const [emailProvider, setEmailProvider] = useState('smtp');
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('587');
    const [senderName, setSenderName] = useState('Admin');
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [templates, setTemplates] = useState([
        { id: 'welcome', name: 'Welcome Email', subject: 'Welcome to UHI Staff Portal', body: 'Dear {{name}},\n\nWelcome to the team!' },
        { id: 'reset_password', name: 'Password Reset', subject: 'Reset Your Password', body: 'Click here to reset: {{link}}' },
        { id: 'loan_approval', name: 'Loan Approval', subject: 'Loan Application Update', body: 'Your loan of {{amount}} is approved.' },
        { id: 'leave_request', name: 'Leave Request', subject: 'Leave Request Status', body: 'Your request for {{days}} days is {{status}}.' },
    ]);

    // Integration Settings State
    const [stripeKey, setStripeKey] = useState('');
    const [s3Bucket, setS3Bucket] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await API.request('/admin/settings', { auth: true });
            const settings = res?.data || [];

            settings.forEach((setting: Setting) => {
                switch (setting.key) {
                    // Branding
                    case 'portal_name': setPortalName(setting.value); break;
                    case 'primary_color': setPrimaryColor(setting.value); break;
                    case 'secondary_color': setSecondaryColor(setting.value); break;
                    case 'login_subtitle': setLoginSubtitle(setting.value); break;
                    case 'support_email': setSupportEmail(setting.value); break;
                    case 'dashboard_welcome': setDashboardWelcome(setting.value); break;
                    case 'copyright_text': setCopyrightText(setting.value); break;
                    case 'org_logo_url': setLogoPreview(setting.value); break;
                    case 'login_bg_url': setBackgroundPreview(setting.value); break;

                    // Organization
                    case 'timezone': setTimezone(setting.value); break;
                    case 'currency': setCurrency(setting.value); break;
                    case 'language': setLanguage(setting.value); break;
                    case 'working_hours_start': setWorkingHoursStart(setting.value); break;
                    case 'working_hours_end': setWorkingHoursEnd(setting.value); break;

                    // Email
                    case 'email_provider': setEmailProvider(setting.value); break;
                    case 'smtp_host': setSmtpHost(setting.value); break;
                    case 'smtp_port': setSmtpPort(setting.value); break;
                    case 'sender_name': setSenderName(setting.value); break;

                    // Integrations
                    case 'stripe_key': setStripeKey(setting.value); break;
                    case 's3_bucket': setS3Bucket(setting.value); break;
                }
            });
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        setMessage(null);

        const settings = [
            // Branding
            { key: 'portal_name', value: portalName },
            { key: 'primary_color', value: primaryColor },
            { key: 'secondary_color', value: secondaryColor },
            { key: 'login_subtitle', value: loginSubtitle },
            { key: 'support_email', value: supportEmail },
            { key: 'dashboard_welcome', value: dashboardWelcome },
            { key: 'copyright_text', value: copyrightText },

            // Organization
            { key: 'timezone', value: timezone },
            { key: 'currency', value: currency },
            { key: 'language', value: language },
            { key: 'working_hours_start', value: workingHoursStart },
            { key: 'working_hours_end', value: workingHoursEnd },

            // Email
            { key: 'email_provider', value: emailProvider },
            { key: 'smtp_host', value: smtpHost },
            { key: 'smtp_port', value: smtpPort },
            { key: 'sender_name', value: senderName },

            // Integrations
            { key: 'stripe_key', value: stripeKey },
            { key: 's3_bucket', value: s3Bucket },
        ];

        try {
            await API.request('/admin/settings', {
                method: 'PUT',
                auth: true,
                body: { settings },
            });

            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, type: 'logo' | 'background') => {
        const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setMessage({
                type: 'error',
                text: `File too large. Maximum size is ${type === 'logo' ? '2MB' : '5MB'}`,
            });
            return;
        }

        const formData = new FormData();
        formData.append(type, file);

        try {
            const res = await API.request(`/admin/upload/${type}`, {
                method: 'POST',
                auth: true,
                body: formData,
            });

            const url = res?.data?.url || URL.createObjectURL(file);
            if (type === 'logo') {
                setLogoPreview(url);
            } else {
                setBackgroundPreview(url);
            }

            setMessage({ type: 'success', text: `${type === 'logo' ? 'Logo' : 'Background'} uploaded successfully!` });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to upload file' });
        }
    };

    const tabs = [
        { id: 'branding' as Tab, label: '🎨 Branding', description: 'Look & feel' },
        { id: 'organization' as Tab, label: '🏢 Organization', description: 'General settings' },
        { id: 'email' as Tab, label: '📧 Email', description: 'Templates & SMTP' },
        { id: 'workflow' as Tab, label: '🔄 Workflows', description: 'Approvals & Rules' },
        { id: 'integrations' as Tab, label: '🔌 Integrations', description: 'API & Services' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminHeader />

            <main className="flex-1 lg:ml-64 p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">⚙️ Settings</h1>
                            <p className="text-gray-600 mt-1">Configure your portal settings</p>
                        </div>
                        <button
                            onClick={handleSaveSettings}
                            disabled={loading}
                            className="btn bg-[var(--primary-color)] text-white hover:opacity-90"
                        >
                            {loading ? 'Saving...' : 'Save All Changes'}
                        </button>
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

                    {/* Tab Navigation */}
                    <div className="flex overflow-x-auto gap-2 border-b border-gray-200 mb-8 bg-white p-2 rounded-t-xl sticky top-20 z-10 shadow-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center px-6 py-3 rounded-lg transition-all min-w-[140px] ${activeTab === tab.id
                                    ? 'bg-blue-50 text-[var(--primary-color)] border-2 border-blue-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="font-bold text-sm">{tab.label}</span>
                                <span className="text-xs opacity-75 mt-1">{tab.description}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">

                        {/* Branding Tab */}
                        {activeTab === 'branding' && (
                            <>
                                {/* Branding Section */}
                                <div className="bg-white rounded-xl shadow-sm p-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">Visual Identity</h3>

                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="portalName" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Portal Name
                                            </label>
                                            <input
                                                type="text"
                                                id="portalName"
                                                value={portalName}
                                                onChange={(e) => setPortalName(e.target.value)}
                                                className="input"
                                                placeholder="Global Staff Portal"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="primaryColor" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Primary Color
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="color"
                                                        id="primaryColor"
                                                        value={primaryColor}
                                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                                        className="h-12 w-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={primaryColor}
                                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                                        className="input flex-1"
                                                        placeholder="#1a365d"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="secondaryColor" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Secondary Color
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="color"
                                                        id="secondaryColor"
                                                        value={secondaryColor}
                                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                                        className="h-12 w-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={secondaryColor}
                                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                                        className="input flex-1"
                                                        placeholder="#2c5282"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Logo</label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[var(--primary-color)] hover:bg-gray-50 transition-colors cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                                                        className="hidden"
                                                        id="logoUpload"
                                                    />
                                                    <label htmlFor="logoUpload" className="cursor-pointer">
                                                        <div className="text-4xl mb-2">📁</div>
                                                        <p className="text-sm text-gray-600">Click to upload logo</p>
                                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG (Max 2MB)</p>
                                                        {logoPreview && (
                                                            <img src={logoPreview} alt="Logo preview" className="mt-4 max-h-20 mx-auto rounded" />
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Login Background Image</label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[var(--primary-color)] hover:bg-gray-50 transition-colors cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'background')}
                                                        className="hidden"
                                                        id="backgroundUpload"
                                                    />
                                                    <label htmlFor="backgroundUpload" className="cursor-pointer">
                                                        <div className="text-4xl mb-2">📁</div>
                                                        <p className="text-sm text-gray-600">Click to upload background</p>
                                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG (Max 5MB)</p>
                                                        {backgroundPreview && (
                                                            <img
                                                                src={backgroundPreview}
                                                                alt="Background preview"
                                                                className="mt-4 max-h-20 mx-auto rounded"
                                                            />
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="bg-white rounded-xl shadow-sm p-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">Values & Content</h3>

                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="loginSubtitle" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Login Page Subtitle
                                            </label>
                                            <input
                                                type="text"
                                                id="loginSubtitle"
                                                value={loginSubtitle}
                                                onChange={(e) => setLoginSubtitle(e.target.value)}
                                                className="input"
                                                placeholder="Secure Access System"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="dashboardWelcome" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Dashboard Welcome Message
                                            </label>
                                            <input
                                                type="text"
                                                id="dashboardWelcome"
                                                value={dashboardWelcome}
                                                onChange={(e) => setDashboardWelcome(e.target.value)}
                                                className="input"
                                                placeholder="Welcome back, {name}"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Use {'{name}'} as placeholder for user's name</p>
                                        </div>

                                        <div>
                                            <label htmlFor="copyrightText" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Footer Copyright Text
                                            </label>
                                            <input
                                                type="text"
                                                id="copyrightText"
                                                value={copyrightText}
                                                onChange={(e) => setCopyrightText(e.target.value)}
                                                className="input"
                                                placeholder="© 2026 Global Organization. All rights reserved."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Organization Tab */}
                        {activeTab === 'organization' && (
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">Organization Settings</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="timezone" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Timezone
                                        </label>
                                        <select
                                            id="timezone"
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                            className="input"
                                        >
                                            <option value="UTC">UTC (Universal Coordinated Time)</option>
                                            <option value="America/New_York">Eastern Time (US & Canada)</option>
                                            <option value="Europe/London">London</option>
                                            <option value="Asia/Tokyo">Tokyo</option>
                                            {/* Add more timezones as needed */}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Default Currency
                                        </label>
                                        <select
                                            id="currency"
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="input"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="JPY">JPY (¥)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="language" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Default Language
                                        </label>
                                        <select
                                            id="language"
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="input"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Support/Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            id="contactEmail"
                                            value={supportEmail}
                                            onChange={(e) => setSupportEmail(e.target.value)}
                                            className="input"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <h4 className="font-medium text-gray-900 mb-4">Standard Working Hours</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <label htmlFor="workStart" className="block text-xs text-gray-500 mb-1">Start Time</label>
                                                <input
                                                    type="time"
                                                    id="workStart"
                                                    value={workingHoursStart}
                                                    onChange={(e) => setWorkingHoursStart(e.target.value)}
                                                    className="input"
                                                />
                                            </div>
                                            <span className="text-gray-400">to</span>
                                            <div className="flex-1">
                                                <label htmlFor="workEnd" className="block text-xs text-gray-500 mb-1">End Time</label>
                                                <input
                                                    type="time"
                                                    id="workEnd"
                                                    value={workingHoursEnd}
                                                    onChange={(e) => setWorkingHoursEnd(e.target.value)}
                                                    className="input"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email Tab */}
                        {activeTab === 'email' && (
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">Email Configuration</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="emailProvider" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Service Provider
                                        </label>
                                        <select
                                            id="emailProvider"
                                            value={emailProvider}
                                            onChange={(e) => setEmailProvider(e.target.value)}
                                            className="input"
                                        >
                                            <option value="smtp">SMTP Server</option>
                                            <option value="aws_ses">AWS SES</option>
                                            <option value="sendgrid">SendGrid</option>
                                        </select>
                                    </div>

                                    {emailProvider === 'smtp' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="md:col-span-2">
                                                <label htmlFor="smtpHost" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    SMTP Host
                                                </label>
                                                <input
                                                    type="text"
                                                    id="smtpHost"
                                                    value={smtpHost}
                                                    onChange={(e) => setSmtpHost(e.target.value)}
                                                    className="input"
                                                    placeholder="smtp.example.com"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="smtpPort" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    SMTP Port
                                                </label>
                                                <input
                                                    type="text"
                                                    id="smtpPort"
                                                    value={smtpPort}
                                                    onChange={(e) => setSmtpPort(e.target.value)}
                                                    className="input"
                                                    placeholder="587"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="senderName" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Sender Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="senderName"
                                                    value={senderName}
                                                    onChange={(e) => setSenderName(e.target.value)}
                                                    className="input"
                                                    placeholder="Portal Admin"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8">
                                        <h4 className="font-medium text-gray-900 mb-4">Email Templates</h4>
                                        {!editingTemplate ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {templates.map((template) => (
                                                    <div key={template.id} className="p-4 border border-gray-200 rounded-lg hover:border-[var(--primary-color)] bg-white transition-all shadow-sm">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-semibold text-sm">{template.name}</span>
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 truncate mb-3">{template.subject}</p>
                                                        <button
                                                            onClick={() => setEditingTemplate(template)}
                                                            className="text-sm font-medium text-[var(--primary-color)] hover:text-[var(--primary-dark)] hover:underline flex items-center gap-1"
                                                        >
                                                            <span>✏️ Edit Template</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 animate-fade-in">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-lg font-bold text-gray-900">Editing: {editingTemplate.name}</h3>
                                                    <button
                                                        onClick={() => setEditingTemplate(null)}
                                                        className="text-gray-500 hover:text-gray-700"
                                                    >
                                                        ✕ Cancel
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject Line</label>
                                                        <input
                                                            type="text"
                                                            value={editingTemplate.subject}
                                                            onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                                            className="input"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Body (HTML/Text)</label>
                                                        <div className="relative">
                                                            <textarea
                                                                value={editingTemplate.body}
                                                                onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                                                rows={10}
                                                                className="input font-mono text-sm"
                                                            />
                                                            <div className="absolute top-2 right-2 flex gap-2">
                                                                <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded shadow-sm opacity-75">Variables Available</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Supported variables: <code>{'{{name}}'}</code>, <code>{'{{link}}'}</code>, <code>{'{{amount}}'}</code>, <code>{'{{days}}'}</code>, <code>{'{{status}}'}</code>.
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                                        <button
                                                            onClick={() => setEditingTemplate(null)}
                                                            className="btn btn-secondary"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const newTemplates = templates.map(t => t.id === editingTemplate.id ? editingTemplate : t);
                                                                setTemplates(newTemplates);
                                                                setEditingTemplate(null);
                                                                setMessage({ type: 'success', text: 'Template saved successfully!' });
                                                            }}
                                                            className="btn bg-[var(--primary-color)] text-white hover:opacity-90"
                                                        >
                                                            Save Template
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Workflows Tab */}
                        {activeTab === 'workflow' && (
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">Workflow Rules</h3>

                                <div className="space-y-6">
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Loan Approval</h4>
                                                <p className="text-sm text-gray-600">Require multi-level approval for loans over $5,000</p>
                                            </div>
                                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-green-500 rounded-full cursor-pointer">
                                                <span className="absolute left-6 inline-block w-6 h-6 bg-white border border-gray-300 rounded-full shadow transform transition-transform duration-200 ease-in-out"></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Leave Auto-Approval</h4>
                                                <p className="text-sm text-gray-600">Automatically approve sick leave under 2 days</p>
                                            </div>
                                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-gray-200 rounded-full cursor-pointer">
                                                <span className="absolute left-0 inline-block w-6 h-6 bg-white border border-gray-300 rounded-full shadow transform transition-transform duration-200 ease-in-out"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Integrations Tab */}
                        {activeTab === 'integrations' && (
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">Integration Settings</h3>

                                <div className="space-y-6">
                                    <div className="p-6 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">💳</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Payment Gateway (Stripe)</h4>
                                                <p className="text-sm text-gray-600">Configure payments for loan repayment</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">API Key</label>
                                                <input type="password" value="pk_test_xxxxxxxxxxxxxxxx" readOnly className="input bg-gray-50" />
                                            </div>
                                            <button className="btn btn-secondary btn-sm">Connect Stripe Account</button>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">☁️</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Cloud Storage (AWS S3)</h4>
                                                <p className="text-sm text-gray-600">Configure storage for documents</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Bucket Name</label>
                                                <input type="text" value="uhi-staff-documents-prod" readOnly className="input bg-gray-50" />
                                            </div>
                                            <button className="btn btn-secondary btn-sm">Update Configuration</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
