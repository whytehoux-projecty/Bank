'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions/auth';

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="glass-panel w-full max-w-md p-8 animate-fade-in">
                <h2 className="text-3xl font-bold text-brand-gradient mb-6 text-center">Login to UHI</h2>

                <form action={dispatch} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full p-2 rounded-md border border-gray-300 bg-white/50 backdrop-blur-sm"
                            id="email"
                            type="email"
                            name="email"
                            placeholder="user@uhi-portal.org"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full p-2 rounded-md border border-gray-300 bg-white/50 backdrop-blur-sm"
                            id="password"
                            type="password"
                            name="password"
                            placeholder="********"
                            required
                        />
                    </div>

                    <button className="glass-button w-full mt-4" aria-disabled={false}>
                        Sign in
                    </button>

                    <div
                        className="flex h-8 items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {errorMessage && (
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
