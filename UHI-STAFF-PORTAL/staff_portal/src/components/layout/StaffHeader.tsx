'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Notification } from '@/types';

export default function StaffHeader() {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    // Mock notifications - replace with API call
    useEffect(() => {
        setNotifications([
            {
                id: 1,
                sender: 'Admin',
                subject: 'Policy Update: R&R Leave',
                body: 'Please review the new R&R policy updates effective immediately.',
                read: false,
                date: '10 min ago',
            },
            {
                id: 2,
                sender: 'HR Dept',
                subject: 'Document Missing',
                body: 'We are missing your signed contract for 2026. Please upload it.',
                read: false,
                date: '1 hr ago',
            },
        ]);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDisplayName = () => {
        if (!user) return 'User';
        const firstName = user.firstName || user.first_name || 'User';
        const lastName = user.lastName || user.last_name || '';
        return `${firstName} ${lastName}`.trim();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            {/* Top Header */}
            <div className="border-b border-gray-200">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <Image
                                src="/assets/logo.svg"
                                alt="UHI"
                                width={40}
                                height={40}
                                className="h-10 w-auto"
                            />
                            <span className="text-xl font-bold text-[var(--primary-color)] hidden sm:block">
                                UHI STAFF PORTAL
                            </span>
                        </Link>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-md mx-8">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                />
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
                            {/* Language Selector */}
                            <span className="hidden sm:block text-sm text-gray-600">English</span>

                            {/* Notifications */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-600 hover:text-[var(--primary-color)] transition-colors"
                                    aria-label="Notifications"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                        />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in">
                                        <div className="p-4 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                                <button className="text-xs text-[var(--primary-color)] hover:underline">
                                                    Mark all read
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500">No notifications</div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50' : ''
                                                            }`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center font-semibold">
                                                                {notif.sender[0]}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {notif.subject}
                                                                </p>
                                                                <p className="text-sm text-gray-600 line-clamp-2">{notif.body}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{notif.date}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-gray-200">
                                            <Link
                                                href="/notifications"
                                                className="block text-center text-sm text-[var(--primary-color)] hover:underline"
                                            >
                                                View all notifications
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Menu */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                                        {getDisplayName()}
                                    </span>
                                    <div className="h-8 w-8 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center">
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                </button>

                                {/* User Dropdown */}
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in">
                                        <Link
                                            href="/account"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            Account Settings
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="bg-[var(--primary-color)]">
                <div className="container-custom">
                    <div className="flex items-center gap-1 overflow-x-auto">
                        <Link
                            href="/dashboard"
                            className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/my-contract"
                            className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                        >
                            My Contract
                        </Link>
                        <Link
                            href="/payments"
                            className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                        >
                            Payslips & Payments
                        </Link>
                        <Link
                            href="/requests"
                            className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                        >
                            Requests
                        </Link>
                        <Link
                            href="/notifications"
                            className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                        >
                            Notifications
                        </Link>
                        <Link
                            href="/account"
                            className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                        >
                            Account
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}
