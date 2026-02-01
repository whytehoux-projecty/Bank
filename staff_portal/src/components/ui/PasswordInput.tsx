'use client';

import { useState } from 'react';

interface PasswordInputProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    showStrength?: boolean;
    onStrengthChange?: (strength: number) => void;
}

export default function PasswordInput({
    id,
    value,
    onChange,
    placeholder = 'Enter password',
    required = false,
    disabled = false,
    className = '',
    showStrength = false,
    onStrengthChange,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const calculateStrength = (password: string): number => {
        const requirements = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password),
        };

        const strength = Object.values(requirements).filter(Boolean).length;
        if (onStrengthChange) onStrengthChange(strength);
        return strength;
    };

    const getStrengthLabel = (strength: number): { label: string; color: string } => {
        if (strength >= 5) return { label: 'Strong', color: 'bg-green-500' };
        if (strength >= 3) return { label: 'Medium', color: 'bg-yellow-500' };
        return { label: 'Weak', color: 'bg-red-500' };
    };

    const strength = showStrength ? calculateStrength(value) : 0;
    const strengthInfo = getStrengthLabel(strength);

    return (
        <div className="space-y-2">
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`input pr-12 ${className}`}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            </div>

            {showStrength && value && (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                                style={{ width: `${(strength / 5) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-gray-600 min-w-[60px]">
                            {strengthInfo.label}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
