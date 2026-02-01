'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import StaffHeader from '@/components/layout/StaffHeader';

type NotificationType = 'leave' | 'payroll' | 'loan' | 'system' | 'general';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export default function NotificationsPage() {
    return (
        <ProtectedRoute>
            <NotificationsContent />
        </ProtectedRoute>
    );
}

function NotificationsContent() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await API.request('/staff/notifications', { auth: true });
            if (res?.data) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await API.request(`/staff/notifications/${id}/read`, {
                method: 'PUT',
                auth: true,
            });

            setNotifications(
                notifications.map((n) =>
                    n.id === id ? { ...n, read: true } : n
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await API.request('/staff/notifications/read-all', {
                method: 'PUT',
                auth: true,
            });

            setNotifications(notifications.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;

        try {
            await API.request(`/staff/notifications/${id}`, {
                method: 'DELETE',
                auth: true,
            });

            setNotifications(notifications.filter((n) => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    const getTypeIcon = (type: NotificationType) => {
        const icons = {
            leave: '🏖️',
            payroll: '💰',
            loan: '💳',
            system: '⚙️',
            general: '📢',
        };
        return icons[type] || '📬';
    };

    const getTypeColor = (type: NotificationType) => {
        const colors = {
            leave: 'bg-blue-100 text-blue-700',
            payroll: 'bg-green-100 text-green-700',
            loan: 'bg-purple-100 text-purple-700',
            system: 'bg-gray-100 text-gray-700',
            general: 'bg-orange-100 text-orange-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    // Mock data for demonstration
    const mockNotifications: Notification[] = [
        {
            id: '1',
            type: 'leave',
            title: 'Leave Request Approved',
            message: 'Your annual leave request for Feb 15-22, 2026 has been approved.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false,
        },
        {
            id: '2',
            type: 'payroll',
            title: 'New Payslip Available',
            message: 'Your payslip for January 2026 is now available for download.',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: false,
        },
        {
            id: '3',
            type: 'loan',
            title: 'Loan Payment Due',
            message: 'Your monthly loan payment of $500 is due on February 15, 2026.',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true,
        },
        {
            id: '4',
            type: 'system',
            title: 'System Maintenance Scheduled',
            message: 'The portal will be under maintenance on Feb 10, 2026 from 2:00 AM to 4:00 AM.',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            read: true,
        },
        {
            id: '5',
            type: 'general',
            title: 'New Training Opportunity',
            message: 'Enroll in the upcoming Project Management workshop starting March 1, 2026.',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            read: true,
        },
    ];

    const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;

    const filteredNotifications = displayNotifications.filter((notification) => {
        const matchesFilter = filter === 'all' || (filter === 'unread' && !notification.read);
        const matchesSearch =
            searchQuery === '' ||
            notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const unreadCount = displayNotifications.filter((n) => !n.read).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <StaffHeader />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] text-white">
                <div className="container-custom py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">🔔 Notifications</h1>
                            <p className="text-blue-100 mt-2">
                                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="btn bg-white text-[#1a365d] hover:bg-gray-100">
                                ✓ Mark All as Read
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Filter</h3>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${filter === 'all'
                                            ? 'bg-[var(--primary-color)] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <span>All Notifications</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${filter === 'all' ? 'bg-white/20' : 'bg-gray-200'}`}>
                                        {displayNotifications.length}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${filter === 'unread'
                                            ? 'bg-[var(--primary-color)] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <span>Unread</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${filter === 'unread' ? 'bg-white/20' : 'bg-gray-200'}`}>
                                        {unreadCount}
                                    </span>
                                </button>
                            </div>

                            <hr className="my-6 border-gray-200" />

                            <h3 className="font-bold text-gray-900 mb-4">Type</h3>

                            <div className="space-y-2 text-sm">
                                {(['leave', 'payroll', 'loan', 'system', 'general'] as NotificationType[]).map((type) => {
                                    const count = displayNotifications.filter((n) => n.type === type).length;
                                    return (
                                        <div key={type} className="flex items-center justify-between px-2 py-1.5">
                                            <span className="flex items-center gap-2">
                                                <span>{getTypeIcon(type)}</span>
                                                <span className="capitalize">{type}</span>
                                            </span>
                                            <span className="text-gray-500">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Search */}
                        <div className="card mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search notifications..."
                                    className="input pl-10"
                                />
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="card">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[var(--primary-color)]"></div>
                                    <p className="text-gray-600 mt-4">Loading...</p>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4 opacity-50">🔔</div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
                                    <p className="text-gray-600">
                                        {searchQuery
                                            ? 'Try adjusting your search query'
                                            : filter === 'unread'
                                                ? "You're all caught up!"
                                                : 'No notifications yet'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {filteredNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-5 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${getTypeColor(
                                                        notification.type
                                                    )}`}
                                                >
                                                    {getTypeIcon(notification.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-1">
                                                        <h4 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span>{formatTimestamp(notification.timestamp)}</span>
                                                        <span className="capitalize">{notification.type}</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDelete(notification.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
