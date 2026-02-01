'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';
import { User, LoginResponse } from '@/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (staffId: string, password: string, twoFactorToken?: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
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
        const cached = sessionStorage.getItem('user');
        return cached ? JSON.parse(cached) : null;
    };

    useEffect(() => {
        // Load initial user from session storage
        const cachedUser = getCachedUser();
        if (cachedUser) {
            setUser(cachedUser);
        }
        setLoading(false);
    }, []);

    const login = async (staffId: string, password: string, twoFactorToken?: string) => {
        const res = await API.request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: { staffId, password, twoFactorToken },
        });

        const payload = res?.data;
        if (!payload || !payload.accessToken) {
            throw new Error('Login failed');
        }

        // Check if user is admin
        if (payload.user.role !== 'admin') {
            throw new Error('Access denied. Admin privileges required.');
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
        // Simplified refresh logic
        const cachedUser = getCachedUser();
        if (cachedUser) {
            setUser(cachedUser);
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    const updateUser = (data: Partial<User>) => {
        if (!user) return;
        const newUser = { ...user, ...data };
        setUser(newUser);
        sessionStorage.setItem('user', JSON.stringify(newUser));
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        refreshUser,
        updateUser,
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
