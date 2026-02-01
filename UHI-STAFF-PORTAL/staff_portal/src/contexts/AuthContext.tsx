'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (staffId: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const getCachedUser = (): User | null => {
        if (typeof window === 'undefined') return null;
        try {
            const cached = sessionStorage.getItem('user');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    };

    const isAuthenticated = (): boolean => {
        if (typeof window === 'undefined') return false;
        return Boolean(sessionStorage.getItem('accessToken'));
    };

    const login = async (staffId: string, password: string) => {
        const res = await API.request<any>('/auth/login', {
            method: 'POST',
            body: { staffId, password },
        });

        const payload = res?.data;
        if (!payload?.accessToken) {
            throw new Error('Login failed');
        }

        API.setTokens({
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
        });

        const userData = payload.user || {};
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        API.clearTokens();
        setUser(null);
        router.push('/login');
    };

    const refreshUser = async () => {
        if (!isAuthenticated()) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await API.request<any>('/staff/profile', { auth: true });
            if (res?.data) {
                const cached = getCachedUser();
                const merged = { ...cached, ...res.data };
                sessionStorage.setItem('user', JSON.stringify(merged));
                setUser(merged);
            } else {
                setUser(getCachedUser());
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
